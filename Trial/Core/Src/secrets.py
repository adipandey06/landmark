WIFI_SSID = "YOUR_WIFI_SSID"
WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"

ATLAS_APP_ID = "data-abcde"              # Atlas App Services App ID
ATLAS_API_KEY = "YOUR_DATA_API_KEY"      # Atlas Data API key
ATLAS_DATA_SOURCE = "Cluster0"           # Atlas cluster name
ATLAS_DB = "iot"
ATLAS_COLLECTION = "telemetry"
DEVICE_ID = "pico-w-01"

# Optional weather coordinates for Open-Meteo (defaults to New Delhi if omitted)
WEATHER_LAT = 28.6139
WEATHER_LON = 77.2090

# Solana anchoring config (recommended to start on devnet)
SOLANA_RPC_URL = "https://api.devnet.solana.com"
SOLANA_PRIVATE_KEY_B58 = ""
ANCHOR_REQUIRED = True

# Secret used to derive modified hash from actual hash (HMAC-SHA256)
HASH_TWEAK_SECRET = "replace-with-long-random-secret"