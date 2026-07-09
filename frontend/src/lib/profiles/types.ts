/**
 * Types for OrcaSlicer printer profiles
 */

export interface MachineModelEntry {
    name: string;
    sub_path: string;
}

export interface ProcessEntry {
    name: string;
    sub_path: string;
}

export interface FilamentEntry {
    name: string;
    sub_path: string;
}

/** Top-level brand profile (e.g. Voron.json, Creality.json) */
export interface BrandProfile {
    name: string;
    version: string;
    force_update: string;
    description: string;
    machine_model_list: MachineModelEntry[];
    process_list?: ProcessEntry[];
    filament_list?: FilamentEntry[];
}

/** Individual machine model details */
export interface MachineModel {
    type: string;
    name: string;
    model_id: string;
    nozzle_diameter: string; // semicolon-separated list
    machine_tech: string;
    family: string;
    bed_model: string;
    bed_texture: string;
    hotend_model: string;
    default_materials: string; // semicolon-separated
    /** Thumbnail / cover image path relative to brand folder */
    cover_image?: string;
}

/** A flattened printer entry combining brand + machine info */
export interface PrinterProfile {
    /** Unique identifier: "BrandName::MachineName" */
    id: string;
    brand: string;
    brand_description: string;
    machine_name: string;
    model_id: string;
    nozzle_diameters: number[];
    family: string;
    bed_model: string;
    bed_texture: string;
    hotend_model: string;
    default_materials: string[];
    /** Relative path to the machine JSON (for lazy loading) */
    machine_path: string;
    /** Relative path to the brand folder (for assets) */
    brand_folder: string;
    /** Cover image filename (if any) */
    cover_image: string | null;
}

/** Index of all available printer profiles (generated at build time) */
export interface PrinterProfileIndex {
    brands: string[];
    printers: PrinterProfile[];
}
