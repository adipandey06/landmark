# Landmark - A Data Collection Network for Optimising Agriculture Policy

## Parameters
- Temperature
- Humidity
- Salinity
- pH
- Weather factors (API calls)
  - Rainfall
  - Winds
- Satellite data
  - Risk prone areas (vague and general)
  - API calls for locations of industries for correlative inferences
  

## Components required
  - STM32 L board (Custom built or Premade) : ~$5
  - Humidity and Temperature sensor : ~$1.5
  - pH sensor : ~$15
  - RF transceiver : ~$5
  - (Salinity sensor : ~$10)
  - Battery : ~$2
  - Casing : ~1

### Total costs : ~$29.5 ($39.5 if salinity sensor is included)

The expected costs of manufacturing such a board in large scale would be around $25-$35

## Flowchart


## Architecture
```
[Field Sensors & Water Infrastructure]
  - Soil moisture / salinity / temp
  - Flow & pressure sensors
  - Reservoir & canal level gauges
  - Water quality probes
        │
        │  (LoRaWAN)
        ▼
[Edge Gateway - NTT]
  - Signature verification
  - Local buffering (outage tolerance)
        │
        │  
        ▼
[Primary Stack]
  ├─ Ingestion & Validation
  ├─ Time‑series Storage
  ├─ Climate & Forecast Ingest
  ├─ Correlation / Risk Models
  ├─ Recommendations Engine
  ├─ Continual learning system
  └─ Audit & Reporting
        │
        ├───────────────► [Public Advisories & Farmer Dashboards]
        │                (multilingual, verified, accessibility-first)
        │
        └───────────────► [Verification Anchors]
                         (Hashes on Solana)
```

