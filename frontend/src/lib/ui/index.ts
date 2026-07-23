/**
 * OrcaSlicer Widgets - Svelte UI Library
 *
 * Main entry point for the UI component library ported from
 * OrcaSlicer's C++ wxWidgets GUI widgets (src/slic3r/GUI/Widgets/).
 *
 * This file exports utilities and types only.
 * Svelte components should be imported directly from their files:
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import Button from '$lib/ui/components/Button.svelte';
 *   import { StateColor } from '$lib/ui/stateColor';
 * </script>
 * ```
 */

// StateColor utility (port of StateColor.hpp/StateColor.cpp)
export {
    StateColor,
    StateColors,
    resolveColor,
    getLightness,
    isLight,
    lightenDarkenColor,
} from './stateColor';
export type {
    ComponentState,
    StateColorEntry,
    ColorValue,
} from './stateColor';

// Shared types
export type { DropDownItem, TabItem } from './types';
