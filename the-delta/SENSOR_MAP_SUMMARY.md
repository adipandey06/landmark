# Sensor Map Feature Summary & Action Plan

This document summarizes the current features and capabilities of the `SensorMap` component and its associated layers/controls. Our goal is to rapidly decide the direction for each aspect of this map.

## Current Features

### 1. Map Base & Navigation

- **Engine**: Mapbox GL JS using `react-map-gl`.
- **Style**: Clean Dark Style (`mapbox://styles/mapbox/dark-v11`).
- **Navigation**: Smooth `flyTo` transitions for preset regions.
- **Controls**: Standard zoom and compass controls (`MapControls`).

### 2. Sensor Data Visualizations

- **Clustering (`sensor-clusters`)**: Groups proximate sensors; clicking a cluster automatically zooms in to expand it.
- **Individual Sensors (`sensor-circles`)**: Distinct points with hover states (pointer cursor, visual highlight).
- **Detail Panel (`SensorDetailPanel`)**: Opens when an individual sensor is clicked to show specific device metrics.

### 3. Layers & Overlays

- **Satellite Layers (`SatelliteLayers`)**: Toggleable satellite imagery.
- **Satellite Layer Control**: UI slider to adjust opacity and toggle specific satellite layers.
- **Grid / Boundaries Layers (`GridLayer`, `CambodiaGridLayer`)**: Displays regional overlays (currently integrating Mapbox vector boundaries for Cambodia).
- **GridLayer Control**: Toggle UI for activating/deactivating grid views.

### 4. Search & Filtering (`MapFilterBar`)

- **Text Search**: Filter nodes by name or ID.
- **Region**: Filter by predefined geographic regions.
- **Status Filter**: Online, Warning, Offline, Critical.
- **Type Filter**: Water Quality, Flow Rate, Pressure, Level, Turbidity, Soil Moisture, Soil Temp, Soil pH, Conductivity.

### 5. Legend & State Management

- **Legend (`MapLegend`)**: Visual key for interpreting map symbols and statuses.
- **State**: Centralized Map Store (`useMapStore`) handling view states, active filters, selected elements, and layers.

---

## ⚡ GSD ACTION PROMPT ⚡

To maintain velocity, we need to make rapid decisions on the map's feature set.
For each of the functional areas below, reply with **IMPROVE**, **IMPLEMENT**, **KEEP**, or **REMOVE**, along with your immediate priorities.

### 1. Base Map Base & Styling

_Current: Mapbox Dark-v11._

- **Decision:** [IMPROVE / IMPLEMENT / KEEP / REMOVE]
- **Notes:** (e.g., "Switch to a custom 3D terrain style", or "Keep as is for now")

### 2. Sensor Node Visuals (Clusters & Circles)

_Current: Basic circles and number clusters. We recently discussed a Heatmap approach._

- **Decision:** [IMPROVE / IMPLEMENT / KEEP / REMOVE]
- **Notes:** (e.g., "Improve: Replace clusters with a live heatmap of alert frequency")

### 3. Boundary & Grid Overlays

_Current: Mixed state between generic rects `GridLayer` and Mapbox vector countries `CambodiaGridLayer`._

- **Decision:** [IMPROVE / IMPLEMENT / KEEP / REMOVE]
- **Notes:** (e.g., "Remove the generic GridLayer, Implement full vector boundary support for all loaded regions")

### 4. Map Filter Categories

_Current: Status, Type, Region, Search._

- **Decision:** [IMPROVE / IMPLEMENT / KEEP / REMOVE]
- **Notes:** (e.g., "Keep, but Implement filter by battery level")

### 5. Detailed Sensor Panel

_Current: Shows basic node info upon click._

- **Decision:** [IMPROVE / IMPLEMENT / KEEP / REMOVE]
- **Notes:** (e.g., "Improve: Add timeseries graphing to the panel (backend-ready)")

### 6. Satellite Layers

_Current: Toggleable with opacity slider._

- **Decision:** [IMPROVE / IMPLEMENT / KEEP / REMOVE]
- **Notes:** (e.g., "Remove: It clutters the UI and isn't core to the MVP, OR Keep: highly valuable context")

---

**Next Step:**
Review these 6 areas. Tell me your decisions and we will immediately start executing the drops and builds.
