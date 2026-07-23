/**
 * StateColor - Port of OrcaSlicer's StateColor system
 * 
 * Maps component states (normal, hovered, pressed, disabled, focused, checked)
 * to colors, with dark/light mode support.
 */

export type ComponentState =
    | 'normal'
    | 'enabled'
    | 'checked'
    | 'focused'
    | 'hovered'
    | 'pressed'
    | 'disabled'
    | 'not-checked'
    | 'not-focused'
    | 'not-hovered'
    | 'not-pressed';

export interface StateColorEntry {
    color: string;
    states: ComponentState[];
}

export type ColorValue = string | { light: string; dark: string };

/**
 * Resolves a color value based on current theme mode.
 */
export function resolveColor(value: ColorValue, isDark: boolean): string {
    if (typeof value === 'string') return value;
    return isDark ? value.dark : value.light;
}

/**
 * StateColor manages multiple color entries keyed by component states.
 * It resolves the appropriate color for a given set of active states.
 */
export class StateColor {
    private entries: StateColorEntry[] = [];
    private takeFocusedAsHovered = false;

    constructor(...entries: StateColorEntry[]) {
        for (const entry of entries) {
            this.append(entry.color, ...entry.states);
        }
    }

    append(color: string, ...states: ComponentState[]): void {
        this.entries.push({ color, states });
    }

    clear(): void {
        this.entries = [];
    }

    get count(): number {
        return this.entries.length;
    }

    setTakeFocusedAsHovered(value: boolean): void {
        this.takeFocusedAsHovered = value;
    }

    /**
     * Returns the color for the given active states.
     * The first matching entry (most specific) wins.
     */
    colorForStates(activeStates: ComponentState[], isDark = false): string {
        const resolved = resolveColorForEntries(this.entries, activeStates, this.takeFocusedAsHovered);
        return resolveColor(resolved, isDark);
    }

    /**
     * Returns the default color (first entry).
     */
    defaultColor(isDark = false): string {
        if (this.entries.length === 0) return '#000000';
        return resolveColor(this.entries[0].color, isDark);
    }
}

function resolveColorForEntries(
    entries: StateColorEntry[],
    activeStates: ComponentState[],
    takeFocusedAsHovered: boolean
): ColorValue {
    const activeSet = new Set(activeStates);

    // If focused should be treated as hovered
    if (takeFocusedAsHovered && activeSet.has('focused')) {
        activeSet.add('hovered');
    }

    // Check entries in reverse order (last appended wins priority in OrcaSlicer)
    for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i];
        const matchesAll = entry.states.every((s) => activeSet.has(s));
        if (matchesAll) {
            return entry.color;
        }
    }

    // Fallback to first entry
    if (entries.length > 0) {
        return entries[0].color;
    }

    return '#000000';
}

/**
 * Pre-defined state combinations for convenience.
 */
export const StateColors = {
    normal: (color: string): StateColorEntry => ({
        color,
        states: ['normal'],
    }),
    hovered: (color: string): StateColorEntry => ({
        color,
        states: ['hovered'],
    }),
    pressed: (color: string): StateColorEntry => ({
        color,
        states: ['pressed'],
    }),
    disabled: (color: string): StateColorEntry => ({
        color,
        states: ['disabled'],
    }),
    checked: (color: string): StateColorEntry => ({
        color,
        states: ['checked'],
    }),
    focused: (color: string): StateColorEntry => ({
        color,
        states: ['focused'],
    }),
    enabled: (color: string): StateColorEntry => ({
        color,
        states: ['enabled'],
    }),
};

/**
 * Utility to compute relative luminance and contrast.
 */
export function getLightness(color: string): number {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function isLight(color: string): boolean {
    return getLightness(color) > 0.5;
}

export function lightenDarkenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16) + amount;
    let g = parseInt(hex.substring(2, 4), 16) + amount;
    let b = parseInt(hex.substring(4, 6), 16) + amount;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
