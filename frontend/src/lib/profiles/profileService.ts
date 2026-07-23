/**
 * Profile Service - loads and provides access to the printer profile index.
 *
 * The profile-index.json is generated at build time by scripts/generate-profile-index.js
 * and contains a flat list of all available printer models from OrcaSlicer.
 */

import type { PrinterProfile, PrinterProfileIndex } from './types';
import indexData from './profile-index.json';

const profileIndex = indexData as unknown as PrinterProfileIndex;

/** Get the full profile index */
export function getProfileIndex(): PrinterProfileIndex {
    return profileIndex;
}

/** Get all brands */
export function getBrands(): string[] {
    return profileIndex.brands;
}

/** Get all printers */
export function getAllPrinters(): PrinterProfile[] {
    return profileIndex.printers;
}

/** Get printers grouped by brand */
export function getPrintersByBrand(): Record<string, PrinterProfile[]> {
    const grouped: Record<string, PrinterProfile[]> = {};
    for (const printer of profileIndex.printers) {
        if (!grouped[printer.brand]) {
            grouped[printer.brand] = [];
        }
        grouped[printer.brand].push(printer);
    }
    return grouped;
}

/** Get printers for a specific brand */
export function getPrintersByBrandName(brand: string): PrinterProfile[] {
    return profileIndex.printers.filter(p => p.brand === brand);
}

/** Find a printer by its unique ID (brand::machine_name) */
export function findPrinterById(id: string): PrinterProfile | undefined {
    return profileIndex.printers.find(p => p.id === id);
}

/** Find printers by machine name (partial match) */
export function searchPrinters(query: string): PrinterProfile[] {
    const lower = query.toLowerCase();
    return profileIndex.printers.filter(
        p =>
            p.machine_name.toLowerCase().includes(lower) ||
            p.brand.toLowerCase().includes(lower)
    );
}

/** Get the display label for a printer (brand + machine name) */
export function getPrinterLabel(printer: PrinterProfile): string {
    return `${printer.brand} ${printer.machine_name}`;
}

/** Get available nozzle diameters as display strings */
export function getNozzleOptions(printer: PrinterProfile): string[] {
    return printer.nozzle_diameters.map(d => `${d} mm`);
}

/** Build the asset path for a brand's cover image */
export function getCoverImageUrl(printer: PrinterProfile): string | null {
    if (!printer.cover_image || !printer.brand_folder) return null;
    // The resources directory is served statically
    return `/resources/profiles/${printer.brand_folder}/${printer.cover_image}`;
}

/** Build the asset path for a bed model STL */
export function getBedModelUrl(printer: PrinterProfile): string | null {
    if (!printer.bed_model || !printer.brand_folder) return null;
    return `/resources/profiles/${printer.brand_folder}/${printer.bed_model}`;
}
