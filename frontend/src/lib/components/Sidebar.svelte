<script lang="ts">
  /**
   * Sidebar - Matches OrcaSlicer's Sidebar class.
   * Contains: Object list, Preset selector (printer/filament/process),
   * Slice parameters organized by categories (Quality/Strength/Speed/Material/Advanced).
   * Uses internal sub-tabs matching OrcaSlicer's sidebar organization.
   */
  import { slicerSettings, activeSidebarSubTab, type SidebarSubTab } from '../store';
  import {
    Sliders,
    Shield,
    Gauge,
    Thermometer,
    Info,
    Layers,
    Printer,
    Settings,
    Box,
    Search,
  } from 'lucide-svelte';
  import ObjectList from './ObjectList.svelte';
  import PresetSelector from './PresetSelector.svelte';

  // ─── Sub-tab definitions ──────────────────────────────────────────────
  interface SubTabDef {
    id: SidebarSubTab;
    label: string;
    icon: any;
  }

  const subTabs: SubTabDef[] = [
    { id: 'object_list', label: 'Objects', icon: Box },
    { id: 'preset', label: 'Presets', icon: Printer },
    { id: 'quality', label: 'Quality', icon: Sliders },
    { id: 'strength', label: 'Strength', icon: Shield },
    { id: 'speed', label: 'Speed', icon: Gauge },
    { id: 'material', label: 'Material', icon: Thermometer },
    { id: 'advanced', label: 'Advanced', icon: Settings },
  ];
</script>

<aside class="sidebar">
  <!-- Sidebar Header -->
  <div class="sidebar-header">
    <Sliders size={15} color="#00e575" />
    <span class="sidebar-title">Settings</span>
  </div>

  <!-- Settings categories tabs (Internal tabs within sidebar) -->
  <div class="sidebar-tabs">
    {#each subTabs as tab}
      <button
        class="subtab-btn"
        class:active={$activeSidebarSubTab === tab.id}
        on:click={() => activeSidebarSubTab.set(tab.id)}
        title={tab.label}
      >
        <svelte:component this={tab.icon} size={13} />
        <span class="subtab-label">{tab.label}</span>
      </button>
    {/each}
  </div>

  <!-- Settings body container -->
  <div class="sidebar-content">
    
    <!-- Object List Tab -->
    {#if $activeSidebarSubTab === 'object_list'}
      <div class="settings-group animate-fade-in">
        <ObjectList />
      </div>
    {/if}

    <!-- Preset Tab (Printer/Filament/Process) -->
    {#if $activeSidebarSubTab === 'preset'}
      <div class="settings-group animate-fade-in">
        <PresetSelector />
      </div>
    {/if}

    <!-- Quality Tab -->
    {#if $activeSidebarSubTab === 'quality'}
      <div class="settings-group animate-fade-in">
        <h3 class="group-title">Layer Height</h3>
        <div class="settings-row">
          <label for="layer-height">Layer height</label>
          <div class="input-with-unit">
            <input 
              id="layer-height" 
              type="number" 
              step="0.02" 
              min="0.05" 
              max="0.40" 
              bind:value={$slicerSettings.layer_height} 
            />
            <span class="unit">mm</span>
          </div>
        </div>
        <div class="range-slider-container">
          <input 
            type="range" 
            min="0.08" 
            max="0.30" 
            step="0.04" 
            bind:value={$slicerSettings.layer_height} 
          />
          <div class="slider-ticks">
            <span>0.08 (Fine)</span>
            <span>0.20 (Standard)</span>
            <span>0.30 (Draft)</span>
          </div>
        </div>

        <h3 class="group-title">Hardware</h3>
        <div class="settings-row">
          <label for="nozzle-dia">Nozzle diameter</label>
          <div class="input-with-unit">
            <select id="nozzle-dia" bind:value={$slicerSettings.nozzle_diameter}>
              <option value={0.2}>0.2 mm</option>
              <option value={0.4}>0.4 mm</option>
              <option value={0.6}>0.6 mm</option>
              <option value={0.8}>0.8 mm</option>
            </select>
          </div>
        </div>
        <div class="settings-row">
          <label for="filament-dia">Filament diameter</label>
          <div class="input-with-unit">
            <input 
              id="filament-dia" 
              type="number" 
              step="0.05" 
              min="1.0" 
              max="3.0" 
              bind:value={$slicerSettings.filament_diameter} 
            />
            <span class="unit">mm</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Strength Tab -->
    {#if $activeSidebarSubTab === 'strength'}
      <div class="settings-group animate-fade-in">
        <h3 class="group-title"><Shield size={13} /> Walls & Shells</h3>
        <div class="settings-row">
          <label for="wall-loops">Wall loops (perimeters)</label>
          <input 
            id="wall-loops" 
            type="number" 
            min="1" 
            max="10" 
            bind:value={$slicerSettings.wall_loops} 
          />
        </div>
        
        <h3 class="group-title">Sparse Infill</h3>
        <div class="settings-row">
          <label for="infill-density">Infill density</label>
          <div class="input-with-unit">
            <input 
              id="infill-density" 
              type="number" 
              min="0" 
              max="100" 
              bind:value={$slicerSettings.infill_density} 
            />
            <span class="unit">%</span>
          </div>
        </div>
        <div class="range-slider-container">
          <input 
            type="range" 
            min="0" 
            max="60" 
            step="5" 
            bind:value={$slicerSettings.infill_density} 
          />
        </div>
        
        <div class="settings-row">
          <label for="infill-pattern">Infill pattern</label>
          <select id="infill-pattern" bind:value={$slicerSettings.infill_pattern}>
            <option value="grid">Grid (Alternating Layer)</option>
            <option value="lines">Straight Lines</option>
          </select>
        </div>

        <div class="info-banner">
          <Info size={14} class="info-icon" />
          <span>The first 3 layers and last 3 layers are automatically sliced as solid shells for strength and surface finish.</span>
        </div>
      </div>
    {/if}

    <!-- Speed Tab -->
    {#if $activeSidebarSubTab === 'speed'}
      <div class="settings-group animate-fade-in">
        <h3 class="group-title"><Gauge size={13} /> Printing Speed</h3>
        <div class="settings-row">
          <label for="print-speed">Printing speed</label>
          <div class="input-with-unit">
            <input 
              id="print-speed" 
              type="number" 
              step="10" 
              min="10" 
              max="400" 
              bind:value={$slicerSettings.print_speed} 
            />
            <span class="unit">mm/s</span>
          </div>
        </div>
        <div class="range-slider-container">
          <input 
            type="range" 
            min="20" 
            max="300" 
            step="10" 
            bind:value={$slicerSettings.print_speed} 
          />
        </div>

        <h3 class="group-title">Travel Speed</h3>
        <div class="settings-row">
          <label for="travel-speed">Travel speed</label>
          <div class="input-with-unit">
            <input 
              id="travel-speed" 
              type="number" 
              step="10" 
              min="50" 
              max="500" 
              bind:value={$slicerSettings.travel_speed} 
            />
            <span class="unit">mm/s</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Material Tab -->
    {#if $activeSidebarSubTab === 'material'}
      <div class="settings-group animate-fade-in">
        <h3 class="group-title"><Thermometer size={13} /> Temperature</h3>
        <div class="settings-row">
          <label for="extruder-temp">Extruder temperature</label>
          <div class="input-with-unit">
            <input 
              id="extruder-temp" 
              type="number" 
              step="5" 
              min="150" 
              max="350" 
              bind:value={$slicerSettings.extruder_temp} 
            />
            <span class="unit">°C</span>
          </div>
        </div>
        <div class="settings-row">
          <label for="bed-temp">Bed temperature</label>
          <div class="input-with-unit">
            <input 
              id="bed-temp" 
              type="number" 
              step="5" 
              min="0" 
              max="150" 
              bind:value={$slicerSettings.bed_temp} 
            />
            <span class="unit">°C</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Advanced Tab -->
    {#if $activeSidebarSubTab === 'advanced'}
      <div class="settings-group animate-fade-in">
        <div class="info-banner">
          <Settings size={14} class="info-icon" />
          <span>Advanced settings are available in the full OrcaSlicer desktop application. The web version supports core slicing parameters.</span>
        </div>
      </div>
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    width: 280px;
    min-width: 280px;
    background-color: var(--color-bg-sidebar);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    height: 100%;
    user-select: none;
    z-index: 90;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--color-border);
  }

  .sidebar-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* ─── Sub-tab Navigation ──────────────────────────────────────────── */
  .sidebar-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--color-border);
  }

  .subtab-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 5px;
    cursor: pointer;
    color: var(--color-text-muted);
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    transition: all 0.15s ease;
  }

  .subtab-btn:hover {
    color: var(--color-text-secondary);
    background-color: rgba(255, 255, 255, 0.03);
  }

  .subtab-btn.active {
    color: var(--color-accent);
    background-color: rgba(0, 229, 117, 0.08);
    border-color: rgba(0, 229, 117, 0.15);
  }

  .subtab-label {
    display: none;
  }

  .subtab-btn.active .subtab-label,
  .subtab-btn:hover .subtab-label {
    display: inline;
  }

  /* ─── Settings Content ────────────────────────────────────────────── */
  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }

  .settings-group {
    padding: 0 14px;
  }

  .group-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 16px 0 8px 0;
    padding-bottom: 4px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  .settings-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 0;
    gap: 8px;
  }

  .settings-row label {
    font-size: 12px;
    color: var(--color-text-primary);
    flex-shrink: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .settings-row input[type="number"],
  .settings-row select {
    width: 80px;
    padding: 4px 6px;
    background-color: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--color-border);
    border-radius: 5px;
    color: var(--color-text-primary);
    font-size: 12px;
    text-align: right;
    outline: none;
    transition: border-color 0.15s ease;
  }

  .settings-row input[type="number"]:focus,
  .settings-row select:focus {
    border-color: var(--color-accent);
  }

  .input-with-unit {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .input-with-unit input,
  .input-with-unit select {
    width: 70px;
  }

  .unit {
    font-size: 11px;
    color: var(--color-text-muted);
    width: 28px;
  }

  .range-slider-container {
    padding: 2px 0 8px 0;
  }

  .range-slider-container input[type="range"] {
    width: 100%;
    height: 3px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--color-border);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }

  .range-slider-container input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--color-accent);
    border: 2px solid var(--color-bg-sidebar);
    cursor: pointer;
  }

  .slider-ticks {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: var(--color-text-muted);
    margin-top: 3px;
  }

  .info-banner {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 10px;
    margin-top: 12px;
    background-color: rgba(59, 130, 246, 0.06);
    border: 1px solid rgba(59, 130, 246, 0.12);
    border-radius: 6px;
    font-size: 11px;
    color: var(--color-text-secondary);
    line-height: 1.4;
  }

  .info-icon {
    color: #3b82f6;
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* ─── Animations ──────────────────────────────────────────────────── */
  .animate-fade-in {
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
