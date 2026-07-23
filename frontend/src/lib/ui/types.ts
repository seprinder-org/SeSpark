/**
 * Shared types for OrcaSlicer Widgets - Svelte UI Library
 */

export interface DropDownItem {
    text: string;
    icon?: string;
    data?: any;
    groupKey?: string;
    groupLabel?: string;
    alias?: string;
    tip?: string;
    flag?: number;
    style?: number; // 0x0001 = split item, 0x0002 = disabled
}

export interface TabItem {
    text: string;
    image?: string;
    selImage?: string;
    data?: any;
    bold?: boolean;
    textColor?: string;
}
