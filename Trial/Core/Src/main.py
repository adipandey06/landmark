import network
import time
import ujson
import urequests
import machine
import urandom
from secrets import (
    WIFI_SSID,
    WIFI_PASSWORD,
    ATLAS_APP_ID,
    ATLAS_API_KEY,
    ATLAS_DATA_SOURCE,
    ATLAS_DB,
    ATLAS_COLLECTION,
    DEVICE_ID,
)

ATLAS_URL = "https://data.mongodb-api.com/app/{}/endpoint/data/v1/action/insertOne".format(ATLAS_APP_ID)

def connect_wifi(ssid, password, timeout=20):
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if wlan.isconnected():
        return True

    wlan.connect(ssid, password)
    start = time.time()
    while not wlan.isconnected():
        if time.time() - start > timeout:
            return False
        time.sleep(0.5)
    return True

def read_sensor_mock():
    # Replace with real sensor code
    temp_c = 20.0 + (urandom.getrandbits(8) / 10.0)
    humidity = 40.0 + (urandom.getrandbits(8) / 10.0)
    return round(temp_c, 2), round(humidity, 2)

def send_to_atlas(temp_c, humidity):
    headers = {
        "Content-Type": "application/json",
        "api-key": ATLAS_API_KEY,
    }

    payload = {
        "dataSource": ATLAS_DATA_SOURCE,
        "database": ATLAS_DB,
        "collection": ATLAS_COLLECTION,
        "document": {
            "deviceId": DEVICE_ID,
            "temperature": temp_c,
            "humidity": humidity,
            "ts": time.time()
        }
    }

    response = None
    try:
        response = urequests.post(
            ATLAS_URL,
            data=ujson.dumps(payload),
            headers=headers
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
    led = machine.Pin("LED", machine.Pin.OUT)

    if not connect_wifi(WIFI_SSID, WIFI_PASSWORD):
        print("Wi-Fi failed")
        return

    print("Wi-Fi connected")

    while True:
        temp_c, humidity = read_sensor_mock()
        ok, status, body = send_to_atlas(temp_c, humidity)

        if ok:
            led.toggle()
            print("Inserted:", status, body)
        else:
            print("Insert failed:", status, body)

        time.sleep(10)

main()