import { writable, derived } from 'svelte/store';
import {
  getAllPrinters,
  findPrinterById,
  getPrintersByBrand,
  getPrinterLabel,
} from './profiles/profileService';
import type { PrinterProfile } from './profiles/types';

// ─── Tab Types ──────────────────────────────────────────────────────────
export type Tab = 'prepare' | 'preview' | 'device';

// ─── Slicer Settings ────────────────────────────────────────────────────
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

// ─── 3D Data Types ──────────────────────────────────────────────────────
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

// ─── Object List (matching OrcaSlicer's Plater object list) ─────────────
export interface PlaterObject {
  id: string;
  name: string;
  filename: string;
  stlBytes: Uint8Array | null;
  /** Per-object settings overrides */
  settings: Partial<SlicerSettings>;
  /** Position on the bed (mm) */
  position: { x: number; y: number; z: number };
  /** Rotation (degrees) */
  rotation: { x: number; y: number; z: number };
  /** Scale factor */
  scale: { x: number; y: number; z: number };
  /** Whether the object is selected in the 3D viewport */
  selected: boolean;
  /** Whether the object is visible */
  visible: boolean;
}

// ─── Plate Management (matching OrcaSlicer's PartPlateList) ─────────────
export interface PlateInfo {
  id: number;
  name: string;
  objectIds: string[];
}

// ─── Preset Types (matching OrcaSlicer's preset system) ─────────────────
export interface PresetInfo {
  name: string;
  type: 'printer' | 'filament' | 'process';
  is_system: boolean;
  is_default: boolean;
}

// ─── Notification Types (matching OrcaSlicer's NotificationManager) ─────
export type NotificationLevel = 'info' | 'warning' | 'error' | 'success';

export interface Notification {
  id: string;
  level: NotificationLevel;
  message: string;
  timestamp: number;
  dismissed: boolean;
}

// ─── Preview Options (matching OrcaSlicer's GUI_Preview OptionType) ─────
export interface PreviewOptions {
  showTravel: boolean;
  showWipe: boolean;
  showRetractions: boolean;
  showSeams: boolean;
  showToolChanges: boolean;
  showColorChanges: boolean;
  showPausePrints: boolean;
  showCustomGCodes: boolean;
  showShells: boolean;
  showToolMarker: boolean;
  showLegend: boolean;
}

// ═══════════════════════════════════════════════════════════════════════
// STORES
// ═══════════════════════════════════════════════════════════════════════

// ─── Global UI State ────────────────────────────────────────────────────
export const activeTab = writable<Tab>('prepare');
export const showGcodeViewer = writable<boolean>(false);
export const theme = writable<'dark' | 'light'>('light');

// ─── Printer Profiles ───────────────────────────────────────────────────
/** All available printers from the profile index */
export const allPrinters = writable<PrinterProfile[]>(getAllPrinters());

/** Printers grouped by brand */
export const printersByBrand = writable<Record<string, PrinterProfile[]>>(getPrintersByBrand());

/** Currently selected printer profile ID (brand::machine_name) */
export const selectedPrinterId = writable<string>('Voron::Voron 2.4 250');

/** Derived: the full PrinterProfile object for the selected printer */
export const selectedPrinter = derived(selectedPrinterId, ($id) => {
  return findPrinterById($id) ?? null;
});

/** Derived: display label for the selected printer */
export const selectedPrinterLabel = derived(selectedPrinter, ($p) => {
  return $p ? getPrinterLabel($p) : 'Unknown Printer';
});

// ─── Filament Profiles ──────────────────────────────────────────────────
/** Currently selected filament name */
export const selectedFilament = writable<string>('Generic PLA @System');

/** Available filament presets */
export const filamentPresets = writable<string[]>([
  'Generic PLA @System',
  'Generic PETG @System',
  'Generic ABS @System',
  'Generic TPU @System',
  'Generic ASA @System',
  'Generic PC @System',
]);

/** Available process presets */
export const processPresets = writable<string[]>([
  '0.20mm Standard @System',
  '0.16mm Optimal @System',
  '0.12mm Fine @System',
  '0.08mm Extra Fine @System',
  '0.24mm Draft @System',
]);

/** Currently selected process preset */
export const selectedProcessPreset = writable<string>('0.20mm Standard @System');

// ─── Slicing Settings ───────────────────────────────────────────────────
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

// ─── Object List (Plater objects) ───────────────────────────────────────
export const platerObjects = writable<PlaterObject[]>([]);

/** Derived: currently selected object ID */
export const selectedObjectId = writable<string | null>(null);

/** Derived: the currently selected object */
export const selectedObject = derived(
  [platerObjects, selectedObjectId],
  ([$objects, $id]) => {
    if (!$id) return null;
    return $objects.find(o => o.id === $id) ?? null;
  }
);

/** Add an object to the plater */
export function addPlaterObject(obj: Omit<PlaterObject, 'id' | 'selected' | 'visible' | 'rotation' | 'scale' | 'settings'>) {
  platerObjects.update(list => [
    ...list,
    {
      ...obj,
      id: `obj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      selected: false,
      visible: true,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      settings: {},
    },
  ]);
}

/** Remove an object from the plater */
export function removePlaterObject(id: string) {
  platerObjects.update(list => list.filter(o => o.id !== id));
}

/** Select an object */
export function selectPlaterObject(id: string | null) {
  selectedObjectId.set(id);
  platerObjects.update(list =>
    list.map(o => ({ ...o, selected: o.id === id }))
  );
}

// ─── Plate Management ───────────────────────────────────────────────────
export const plates = writable<PlateInfo[]>([
  { id: 1, name: 'Plate 1', objectIds: [] },
]);

export const activePlateId = writable<number>(1);

export const activePlate = derived(
  [plates, activePlateId],
  ([$plates, $id]) => $plates.find(p => p.id === $id) ?? $plates[0]
);

export function addPlate() {
  plates.update(list => {
    const newId = list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1;
    return [...list, { id: newId, name: `Plate ${newId}`, objectIds: [] }];
  });
}

export function removePlate(id: number) {
  plates.update(list => list.filter(p => p.id !== id));
}

// ─── Loaded STL Model State ─────────────────────────────────────────────
export const stlFileName = writable<string>('');
export const stlFileBytes = writable<Uint8Array | null>(null);
export const modelDimensions = writable<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

// ─── Slicing Process State ──────────────────────────────────────────────
export const slicingStatus = writable<'idle' | 'slicing' | 'sliced'>('idle');
export const sliceResult = writable<SliceResult | null>(null);

// ─── Preview Controls ───────────────────────────────────────────────────
export const previewMaxLayers = derived(sliceResult, ($res) => $res ? $res.layer_count : 0);
export const currentLayerIndex = writable<number>(0);
export const currentLayerPointPercent = writable<number>(100); // 0 to 100% of printing steps in current layer

/** Preview visualization options (matching OrcaSlicer's OptionType) */
export const previewOptions = writable<PreviewOptions>({
  showTravel: true,
  showWipe: true,
  showRetractions: true,
  showSeams: true,
  showToolChanges: true,
  showColorChanges: true,
  showPausePrints: true,
  showCustomGCodes: true,
  showShells: true,
  showToolMarker: true,
  showLegend: true,
});

// ─── Notifications ──────────────────────────────────────────────────────
export const notifications = writable<Notification[]>([]);

export function addNotification(level: NotificationLevel, message: string) {
  notifications.update(list => [
    ...list,
    {
      id: `notif-${Date.now()}`,
      level,
      message,
      timestamp: Date.now(),
      dismissed: false,
    },
  ]);
}

export function dismissNotification(id: string) {
  notifications.update(list =>
    list.map(n => n.id === id ? { ...n, dismissed: true } : n)
  );
}

export function clearNotifications() {
  notifications.set([]);
}

// ─── Search State ───────────────────────────────────────────────────────
export const showSearchDialog = writable<boolean>(false);
export const searchQuery = writable<string>('');

// ─── Calibration State ──────────────────────────────────────────────────
export type CalibrationType =
  | 'pa'           // Pressure Advance
  | 'flowrate'     // Flow Rate
  | 'temp'         // Temperature
  | 'max_vol_speed'// Max Volumetric Speed
  | 'retraction'   // Retraction
  | 'vfa'          // VFA (Vertical Fine Artifacts)
  | 'input_shaper_freq'
  | 'input_shaper_damp'
  | 'cornering';   // Cornering

export const showCalibrationDialog = writable<boolean>(false);
export const activeCalibrationType = writable<CalibrationType | null>(null);

// ─── Sidebar Sub-tab (matching OrcaSlicer's Sidebar categories) ─────────
export type SidebarSubTab =
  | 'object_list'    // Object list / multi-part management
  | 'preset'         // Printer/Filament/Process presets
  | 'quality'        // Layer height, nozzle settings
  | 'strength'       // Walls, shells, infill
  | 'speed'          // Printing speeds
  | 'material'       // Temperatures, cooling
  | 'advanced';      // Advanced settings

export const activeSidebarSubTab = writable<SidebarSubTab>('object_list');
