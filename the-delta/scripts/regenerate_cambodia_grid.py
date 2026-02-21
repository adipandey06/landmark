import hashlib
import json
from pathlib import Path


GRID_PATH = Path(__file__).resolve().parents[1] / "public" / "cambodia_grid.json"


def clamp(value, low, high):
    return max(low, min(high, value))


def gauss(lon, lat, cx, cy, sx, sy):
    dx = (lon - cx) / sx
    dy = (lat - cy) / sy
    return pow(2.718281828, -(dx * dx + dy * dy))


def stable_noise(key, amplitude=1.0):
    digest = hashlib.sha256(key.encode("utf-8")).digest()
    raw = int.from_bytes(digest[:8], "big") / float(2**64 - 1)
    return (raw * 2.0 - 1.0) * amplitude


def choose_soil_type(wetness, dryness, mountain, patch_noise):
    # Keep to existing categories used in the dataset.
    if mountain > 0.45 or dryness > 0.5:
        return "Lithosols"
    if wetness > 0.55:
        return "Acrisols" if patch_noise > -0.2 else "Ferralsols"
    return "Ferralsols" if patch_noise > 0.1 else "Acrisols"


def risk_level(temp, humidity, soil_moisture, precip, ph, is_water):
    score = 0
    if temp > 34:
        score += 2
    elif temp > 32:
        score += 1

    if humidity < 58:
        score += 1

    if soil_moisture < 18:
        score += 2
    elif soil_moisture < 25:
        score += 1

    if precip < 5:
        score += 1

    if ph < 5.2 or ph > 7.8:
        score += 1

    # Flood risk bump for very wet locations.
    if is_water and precip > 45:
        score += 2
    elif soil_moisture > 75 and precip > 50:
        score += 1

    if score >= 5:
        return "Critical"
    if score >= 3:
        return "High"
    if score >= 1:
        return "Medium"
    return "Low"


def regenerate_feature(feature):
    lon, lat = feature["geometry"]["coordinates"]

    # Large-scale geographic structures for Cambodia.
    tonle_sap = gauss(lon, lat, 104.25, 12.85, 0.55, 0.42)
    mekong_corridor = gauss(lon, lat, 104.95, 11.65, 0.60, 0.50)
    northwest_plains = gauss(lon, lat, 103.75, 13.15, 0.75, 0.55)
    northeast_dry = gauss(lon, lat, 106.45, 13.65, 0.85, 0.65)
    cardamom_highland = gauss(lon, lat, 103.45, 12.05, 0.55, 0.45)
    coastal_wet = gauss(lon, lat, 103.35, 10.70, 0.65, 0.40)

    wetness = clamp(0.58 * tonle_sap + 0.45 * mekong_corridor + 0.30 * coastal_wet, 0.0, 1.0)
    dryness = clamp(0.70 * northeast_dry + 0.22 * (1.0 - wetness), 0.0, 1.0)
    agri_potential = clamp(0.52 * northwest_plains + 0.44 * mekong_corridor + 0.28 * (1.0 - dryness), 0.0, 1.0)

    # Blob-like homogeneous patches (0.1 degree bins) and micro-variation.
    patch_key = f"{int(lon * 10)}:{int(lat * 10)}"
    patch_noise = stable_noise(patch_key, amplitude=1.0)
    local_noise = stable_noise(f"{lon:.3f}:{lat:.3f}", amplitude=1.0)

    is_water = tonle_sap > 0.58 or (mekong_corridor > 0.72 and patch_noise > 0.30)

    ndvi = 0.22 + 0.43 * agri_potential + 0.18 * wetness - 0.20 * dryness + 0.09 * patch_noise + 0.03 * local_noise
    if is_water:
        ndvi = 0.08 + 0.10 * max(0.0, patch_noise)
    ndvi = round(clamp(ndvi, 0.05, 0.93), 2)

    is_agricultural = (not is_water) and (agri_potential > 0.35 or ndvi > 0.42)

    soil_type = choose_soil_type(wetness, dryness, cardamom_highland, patch_noise)

    # Slight north/south climatic trend with regional modulation.
    lat_trend = clamp((12.4 - lat) / 2.8, -1.0, 1.0)

    temperature = (
        31.8
        + 0.9 * lat_trend
        - 2.2 * wetness
        + 1.5 * dryness
        - 1.0 * cardamom_highland
        + 0.8 * patch_noise
        + 0.3 * local_noise
    )
    temperature = round(clamp(temperature, 22.5, 37.8), 1)

    humidity = 61.5 + 24.0 * wetness - 7.0 * dryness + 5.0 * coastal_wet + 4.0 * patch_noise
    humidity = round(clamp(humidity, 42.0, 96.0), 1)

    soil_moisture = 14.0 + 41.0 * wetness + 8.0 * agri_potential - 12.0 * dryness + 5.0 * patch_noise
    if is_water:
        soil_moisture = 74.0 + 18.0 * max(0.0, patch_noise)
    soil_moisture = round(clamp(soil_moisture, 7.0, 98.0), 1)

    precipitation_forecast = 5.0 + 54.0 * wetness + 8.0 * coastal_wet - 10.0 * dryness + 7.0 * patch_noise
    precipitation_forecast = round(clamp(precipitation_forecast, 0.0, 92.0), 1)

    ph = 6.35 + 0.35 * wetness - 0.45 * dryness + 0.20 * patch_noise
    if soil_type == "Lithosols":
        ph -= 0.25
    elif soil_type == "Ferralsols":
        ph += 0.05
    ph = round(clamp(ph, 4.8, 8.2), 1)

    risk = risk_level(temperature, humidity, soil_moisture, precipitation_forecast, ph, is_water)

    feature["properties"] = {
        "isAgricultural": bool(is_agricultural),
        "isWater": bool(is_water),
        "soilType": soil_type,
        "ph": ph,
        "temperature": temperature,
        "humidity": humidity,
        "ndvi": ndvi,
        "soilMoisture": soil_moisture,
        "precipitationForecast": precipitation_forecast,
        "riskLevel": risk,
    }



def main():
    with GRID_PATH.open("r", encoding="utf-8") as f:
        data = json.load(f)

    features = data.get("features", [])
    for feature in features:
        if feature.get("type") != "Feature":
            continue
        if feature.get("geometry", {}).get("type") != "Point":
            continue
        if not feature.get("geometry", {}).get("coordinates"):
            continue
        regenerate_feature(feature)

    with GRID_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Regenerated {len(features)} features in {GRID_PATH}")


if __name__ == "__main__":
    main()
