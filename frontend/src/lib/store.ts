import { writable, derived } from 'svelte/store';

export type Tab = 'prepare' | 'preview' | 'device';

export interface SlicerSettings {
  layer_height: number;
  nozzle_diameter: number;
  filament_diameter: number;
  wall_loops: number;
  infill_density: number;
  infill_pattern: 'grid' | 'lines';
  bed_temp: number;
  extruder_temp: number;
  print_speed: number;
  travel_speed: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface PathSegment {
  path_type: string;
  points: Point3D[];
}

export interface LayerData {
  z: number;
  segments: PathSegment[];
}

export interface SliceResult {
  gcode: string;
  layers: LayerData[];
  print_time_secs: number;
  filament_used_g: number;
  filament_used_mm: number;
  layer_count: number;
}

// Global UI State
export const activeTab = writable<Tab>('prepare');
export const showGcodeViewer = writable<boolean>(false);
export const theme = writable<'dark' | 'light'>('light');

// Printer and Filament Profiles
export const selectedPrinter = writable<string>('SeSpark CoreXY 256');
export const selectedFilament = writable<string>('Generic PLA @SeSpark');

// Slicing Settings
export const slicerSettings = writable<SlicerSettings>({
  layer_height: 0.20,
  nozzle_diameter: 0.4,
  filament_diameter: 1.75,
  wall_loops: 2,
  infill_density: 15,
  infill_pattern: 'grid',
  bed_temp: 60,
  extruder_temp: 220,
  print_speed: 60,
  travel_speed: 150,
});

// Loaded STL Model State
export const stlFileName = writable<string>('');
export const stlFileBytes = writable<Uint8Array | null>(null);
export const modelDimensions = writable<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

// Slicing Process State
export const slicingStatus = writable<'idle' | 'slicing' | 'sliced'>('idle');
export const sliceResult = writable<SliceResult | null>(null);

// Preview Controls
export const previewMaxLayers = derived(sliceResult, ($res) => $res ? $res.layer_count : 0);
export const currentLayerIndex = writable<number>(0);
export const currentLayerPointPercent = writable<number>(100); // 0 to 100% of printing steps in current layer
