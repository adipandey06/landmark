import { create } from "zustand";
import type { SensorFilter, SatelliteLayer, Sensor } from "@/lib/types";
import { SATELLITE_LAYERS } from "@/lib/mock-data/satellite";

export type Region = "global" | "sub-saharan-africa" | "south-asia" | "southeast-asia";

interface RegionPreset {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
}

const REGION_PRESETS: Record<Region, RegionPreset> = {
  global: { longitude: 40, latitude: 10, zoom: 2.5, pitch: 45, bearing: -17 },
  "sub-saharan-africa": { longitude: 25, latitude: 0, zoom: 4 },
  "south-asia": { longitude: 78, latitude: 22, zoom: 4.5 },
  "southeast-asia": { longitude: 110, latitude: 5, zoom: 4.5 },
};

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

const INITIAL_VIEW: ViewState = {
  longitude: 40,
  latitude: 10,
  zoom: 2.5,
  pitch: 45,
  bearing: -17,
};

interface MapStore {
  // Camera
  viewState: ViewState;
  setViewState: (vs: ViewState) => void;

  // Region
  activeRegion: Region;
  flyToRegion: (region: Region) => ViewState;

  // Sensor selection & hover
  selectedSensor: Sensor | null;
  setSelectedSensor: (sensor: Sensor | null) => void;
  hoveredSensorId: string | null;
  setHoveredSensorId: (id: string | null) => void;

  // Filters
  filter: SensorFilter;
  setFilter: (filter: SensorFilter) => void;

  // Satellite layers
  satelliteLayers: SatelliteLayer[];
  toggleSatelliteLayer: (id: string) => void;
  setSatelliteOpacity: (id: string, opacity: number) => void;
}

export const useMapStore = create<MapStore>((set, get) => ({
  viewState: INITIAL_VIEW,
  setViewState: (vs) => set({ viewState: vs }),

  activeRegion: "global",
  flyToRegion: (region) => {
    const preset = REGION_PRESETS[region];
    const target: ViewState = {
      longitude: preset.longitude,
      latitude: preset.latitude,
      zoom: preset.zoom,
      pitch: preset.pitch ?? 0,
      bearing: preset.bearing ?? 0,
    };
    set({ activeRegion: region, viewState: target });
    return target;
  },

  selectedSensor: null,
  setSelectedSensor: (sensor) => set({ selectedSensor: sensor }),
  hoveredSensorId: null,
  setHoveredSensorId: (id) => set({ hoveredSensorId: id }),

  filter: {},
  setFilter: (filter) => set({ filter }),

  satelliteLayers: SATELLITE_LAYERS.map((l) => ({ ...l })),
  toggleSatelliteLayer: (id) =>
    set({
      satelliteLayers: get().satelliteLayers.map((l) =>
        l.id === id ? { ...l, visible: !l.visible } : l
      ),
    }),
  setSatelliteOpacity: (id, opacity) =>
    set({
      satelliteLayers: get().satelliteLayers.map((l) =>
        l.id === id ? { ...l, opacity } : l
      ),
    }),
}));

export { REGION_PRESETS, INITIAL_VIEW };
