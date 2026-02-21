# Landmark - A data collection system for improving agriculture

## Parameters
- Temperature
- Humidity
- Moisture
- Salinity
- pH
- (Mineral content and particulates hopefully in the future)
- Satellite data
  - Risk prone areas (vague and general)
  - API calls for locations of industries for correlative inferences

## Circuit Diagram

## Architecture

[Field Sensors & Water Infrastructure]
  - Soil moisture / salinity / temp
  - Flow & pressure sensors
  - Reservoir & canal level gauges
  - Water quality probes
        │
        │  (LoRaWAN / NB-IoT / MQTT)
        ▼
[Edge Gateway / Collector]
  - Signature verification
  - Local buffering (outage tolerance)
  - Light anomaly checks
        │
        │  (mTLS / VPN)
        ▼
[Encrypted Primary Stack]
  ├─ Ingestion & Validation
  ├─ Time‑series Storage
  ├─ Climate & Forecast Ingest
  ├─ Correlation / Risk Models
  ├─ Recommendations Engine
  ├─ Agentic Workflow + Human Approval
  └─ Audit & Reporting
        │
        ├───────────────► [Public Advisories & Farmer Dashboards]
        │                (multilingual, verified, accessibility-first)
        │
        └───────────────► [Verification Anchors]
                         (hashes/Merkle roots on Solana)

