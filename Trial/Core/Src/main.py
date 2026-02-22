import json
import re
import time
import random
import hashlib
import hmac

import requests
import serial
import secrets as app_secrets

try:
    from solana.rpc.api import Client as SolanaClient
    from solders.instruction import Instruction
    from solders.message import Message
    from solders.keypair import Keypair
    from solders.pubkey import Pubkey
    from solders.transaction import Transaction
except ImportError:
    SolanaClient = None
    Transaction = None
    Instruction = None
    Message = None
    Keypair = None
    Pubkey = None

ATLAS_APP_ID = app_secrets.ATLAS_APP_ID
ATLAS_API_KEY = app_secrets.ATLAS_API_KEY
ATLAS_DATA_SOURCE = app_secrets.ATLAS_DATA_SOURCE
ATLAS_DB = app_secrets.ATLAS_DB
ATLAS_COLLECTION = app_secrets.ATLAS_COLLECTION
DEVICE_ID = app_secrets.DEVICE_ID

WEATHER_LAT = getattr(app_secrets, "WEATHER_LAT", 28.6139)
WEATHER_LON = getattr(app_secrets, "WEATHER_LON", 77.2090)
HASH_TWEAK_SECRET = getattr(app_secrets, "HASH_TWEAK_SECRET", "change-this-secret")
SOLANA_RPC_URL = getattr(app_secrets, "SOLANA_RPC_URL", "https://api.devnet.solana.com")
SOLANA_PRIVATE_KEY_B58 = getattr(app_secrets, "SOLANA_PRIVATE_KEY_B58", "")
SOLANA_MEMO_PROGRAM_ID = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
ANCHOR_REQUIRED = getattr(app_secrets, "ANCHOR_REQUIRED", True)

ATLAS_URL = f"https://data.mongodb-api.com/app/{ATLAS_APP_ID}/endpoint/data/v1/action/insertOne"
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
SERIAL_PORT = "COM5"  # Update to your STM32 COM port in Device Manager.
BAUD_RATE = 115200
SERIAL_TIMEOUT_SEC = 2
WEATHER_REFRESH_SEC = 300

LINE_PATTERN = re.compile(r"H=(?P<humidity>[0-9]+(?:\.[0-9]+)?)%,\s*T=(?P<temp>[0-9]+(?:\.[0-9]+)?)C")
COMMAND_PATTERN = re.compile(r"^CMD:(?P<cmd>TEMP|MOISTURE|SALINITY|PH)$", re.IGNORECASE)

_last_weather_fetch = 0
_cached_weather = None


def canonical_json(payload):
    return json.dumps(payload, separators=(",", ":"), sort_keys=True)


def compute_actual_hash(payload):
    canonical = canonical_json(payload).encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()


def compute_modified_hash(actual_hash_hex):
    digest = hmac.new(
        HASH_TWEAK_SECRET.encode("utf-8"),
        actual_hash_hex.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return digest


def anchor_hash_on_solana(actual_hash_hex):
    if (
        SolanaClient is None
        or Transaction is None
        or Keypair is None
        or Pubkey is None
        or Instruction is None
        or Message is None
    ):
        raise RuntimeError("Missing Solana dependencies. Install 'solana' and 'solders'.")

    if not SOLANA_PRIVATE_KEY_B58:
        raise RuntimeError("SOLANA_PRIVATE_KEY_B58 is not configured in secrets.py")

    client = SolanaClient(SOLANA_RPC_URL)
    payer = Keypair.from_base58_string(SOLANA_PRIVATE_KEY_B58)

    memo_program = Pubkey.from_string(SOLANA_MEMO_PROGRAM_ID)
    memo_instruction = Instruction(
        program_id=memo_program,
        data=actual_hash_hex.encode("utf-8"),
        accounts=[],
    )

    latest = client.get_latest_blockhash()
    recent_blockhash = latest.value.blockhash
    message = Message([memo_instruction], payer.pubkey())
    tx = Transaction([payer], message, recent_blockhash)
    send_resp = client.send_transaction(tx)
    if getattr(send_resp, "value", None) is None:
        raise RuntimeError(f"Solana RPC error: {send_resp}")

    return str(send_resp.value)


def build_record(sensor_data, source, weather_payload):
    base_record = {
        "deviceId": DEVICE_ID,
        "sensor": sensor_data,
        "weather": weather_payload,
        "ts": int(time.time()),
        "board": "stm32",
        "transport": "wired-serial",
        "source": source,
    }

    actual_hash = compute_actual_hash(base_record)
    modified_hash = compute_modified_hash(actual_hash)

    solana_tx_sig = None
    solana_error = None
    try:
        solana_tx_sig = anchor_hash_on_solana(actual_hash)
    except Exception as e:
        solana_error = str(e)
        if ANCHOR_REQUIRED:
            raise RuntimeError(f"Blockchain anchor failed: {solana_error}")

    base_record["proof"] = {
        "actualHash": actual_hash,
        "modifiedHash": modified_hash,
        "hashAlgorithm": "sha256",
        "modifiedHashAlgorithm": "hmac-sha256(actualHash, secret)",
        "solana": {
            "rpc": SOLANA_RPC_URL,
            "memoProgram": SOLANA_MEMO_PROGRAM_ID,
            "txSignature": solana_tx_sig,
            "error": solana_error,
        },
    }

    return base_record


def modified_hash_from_blockchain_hash(actual_hash_hex):
    return compute_modified_hash(actual_hash_hex)


def parse_stm_line(line):
    match = LINE_PATTERN.search(line)
    if not match:
        return None

    humidity = float(match.group("humidity"))
    temperature = float(match.group("temp"))
    return temperature, humidity


def parse_dummy_command(line):
    match = COMMAND_PATTERN.match(line.strip())
    if not match:
        return None
    return match.group("cmd").upper()


def create_dummy_measurement(command_name):
    if command_name == "TEMP":
        return {"temperature": round(random.uniform(20.0, 36.0), 2)}
    if command_name == "MOISTURE":
        return {"moisture": round(random.uniform(15.0, 85.0), 2)}
    if command_name == "SALINITY":
        return {"salinity": round(random.uniform(0.1, 4.0), 2)}
    if command_name == "PH":
        return {"ph": round(random.uniform(5.5, 8.5), 2)}
    return None


def fetch_weather():
    global _last_weather_fetch, _cached_weather

    now = int(time.time())
    if _cached_weather is not None and (now - _last_weather_fetch) < WEATHER_REFRESH_SEC:
        return _cached_weather

    params = {
        "latitude": WEATHER_LAT,
        "longitude": WEATHER_LON,
        "current": (
            "temperature_2m,relative_humidity_2m,apparent_temperature,"
            "precipitation,pressure_msl,cloud_cover,wind_speed_10m,"
            "wind_direction_10m,weather_code"
        ),
        "timezone": "auto",
    }

    response = requests.get(OPEN_METEO_URL, params=params, timeout=10)
    response.raise_for_status()
    data = response.json()
    current = data.get("current", {})

    _cached_weather = {
        "temperature": current.get("temperature_2m"),
        "humidity": current.get("relative_humidity_2m"),
        "apparentTemperature": current.get("apparent_temperature"),
        "precipitation": current.get("precipitation"),
        "pressureMsl": current.get("pressure_msl"),
        "cloudCover": current.get("cloud_cover"),
        "windSpeed": current.get("wind_speed_10m"),
        "windDirection": current.get("wind_direction_10m"),
        "weatherCode": current.get("weather_code"),
        "observedAt": current.get("time"),
    }
    _last_weather_fetch = now
    return _cached_weather


def send_to_atlas(sensor_data, source):
    headers = {
        "Content-Type": "application/json",
        "api-key": ATLAS_API_KEY,
    }

    weather_payload = None
    try:
        weather_payload = fetch_weather()
    except Exception as e:
        print("Weather API error:", e)

    document = build_record(sensor_data, source, weather_payload)

    payload = {
        "dataSource": ATLAS_DATA_SOURCE,
        "database": ATLAS_DB,
        "collection": ATLAS_COLLECTION,
        "document": document,
    }

    response = None
    try:
        response = requests.post(
            ATLAS_URL,
            data=json.dumps(payload),
            headers=headers,
            timeout=10
        )
        ok = (200 <= response.status_code < 300)
        body = response.text
        return ok, response.status_code, body
    except Exception as e:
        return False, -1, str(e)
    finally:
        if response is not None:
            response.close()

def main():
    print(f"Listening on {SERIAL_PORT} @ {BAUD_RATE}...")
    print("Supported dummy commands: CMD:TEMP, CMD:MOISTURE, CMD:SALINITY, CMD:PH")
    print(f"Solana RPC endpoint: {SOLANA_RPC_URL}")

    with serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=SERIAL_TIMEOUT_SEC) as ser:
        while True:
            raw = ser.readline().decode("utf-8", errors="ignore").strip()
            if not raw:
                continue

            print("STM:", raw)
            parsed = parse_stm_line(raw)
            if parsed is not None:
                temp_c, humidity = parsed
                sensor = {
                    "temperature": temp_c,
                    "humidity": humidity,
                }
                ok, status, body = send_to_atlas(sensor, source="stm-dht11")
                if ok:
                    print("Inserted:", status, body)
                else:
                    print("Insert failed:", status, body)
                continue

            command = parse_dummy_command(raw)
            if command is None:
                print("Ignored line (unknown format)")
                continue

            sensor = create_dummy_measurement(command)
            ok, status, body = send_to_atlas(sensor, source=f"dummy-{command.lower()}")
            if ok:
                print("Inserted:", status, body)
            else:
                print("Insert failed:", status, body)

# -----------------------------------------------------------------------------
# MQTT over TTN/TNN example 
# -----------------------------------------------------------------------------
# Install once on laptop: pip install paho-mqtt
#
# import base64
# import json
# import paho.mqtt.client as mqtt
#
# # TTN/TNN broker settings (replace with your real credentials)
# MQTT_HOST = "eu1.cloud.thethings.network"
# MQTT_PORT = 1883
# APP_ID = "your-application-id"
# API_KEY = "NNSXS.YOUR_API_KEY"
# DEVICE_ID = "your-end-device-id"
#
# # Topic for downlink command to node
# # (TTN v3 topic format)
# DOWNLINK_TOPIC = f"v3/{APP_ID}@ttn/devices/{DEVICE_ID}/down/push"
#
# def send_mqtt_command_to_node(command_text: str):
#     client = mqtt.Client(client_id=f"{APP_ID}-cmd")
#     client.username_pw_set(username=f"{APP_ID}@ttn", password=API_KEY)
#     client.connect(MQTT_HOST, MQTT_PORT, keepalive=60)
#
#     # Node payload must be base64 encoded
#     payload_b64 = base64.b64encode(command_text.encode("utf-8")).decode("utf-8")
#
#     # TTN downlink JSON envelope
#     downlink = {
#         "downlinks": [
#             {
#                 "f_port": 15,
#                 "frm_payload": payload_b64,
#                 "priority": "NORMAL",
#             }
#         ]
#     }
#
#     client.publish(DOWNLINK_TOPIC, json.dumps(downlink), qos=1)
#     client.disconnect()
#
# # Example:
# # send_mqtt_command_to_node("START_PUMP")

# -----------------------------------------------------------------------------
# Simple LLM wrapper example for inference on historic data (after Kalman filter)
# -----------------------------------------------------------------------------
# Install once on laptop: pip install openai
#
# from openai import OpenAI
#
# # Assume you already have a Kalman-filtered time series, e.g.:
# # filtered_history = [
# #   {"ts": "2026-02-22T08:00:00Z", "temperature": 29.4, "humidity": 66.2},
# #   {"ts": "2026-02-22T08:05:00Z", "temperature": 29.6, "humidity": 65.9},
# #   ...
# # ]
#
# def infer_from_filtered_history(filtered_history, model="gpt-4o-mini"):
#     """
#     Sends Kalman-filtered historical data to an LLM and returns concise
#     inference: trend direction, anomaly likelihood, and suggested action.
#     """
#     client = OpenAI(api_key="YOUR_OPENAI_API_KEY")
#
#     prompt = {
#         "task": "Infer trend and anomaly risk from filtered sensor history",
#         "rules": [
#             "Use only the provided filtered data",
#             "Output JSON with keys: trend, anomalyRisk, confidence, recommendation",
#             "Keep recommendation short and operational"
#         ],
#         "data": filtered_history[-72:]  # last 72 points
#     }
#
#     resp = client.chat.completions.create(
#         model=model,
#         temperature=0.1,
#         response_format={"type": "json_object"},
#         messages=[
#             {"role": "system", "content": "You are an IoT risk inference assistant."},
#             {"role": "user", "content": json.dumps(prompt)},
#         ],
#     )
#
#     return json.loads(resp.choices[0].message.content)
#
# # Example:
# # llm_result = infer_from_filtered_history(filtered_history)
# # print(llm_result)

main()