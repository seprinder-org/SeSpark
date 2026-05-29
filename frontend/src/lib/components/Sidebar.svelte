<script lang="ts">
  import { slicerSettings } from '../store';
  import { 
    Sliders, 
    Shield, 
    Gauge, 
    Thermometer,
    Info
  } from 'lucide-svelte';

  type SettingsSubTab = 'quality' | 'strength' | 'speed' | 'material';
  let activeSubTab: SettingsSubTab = 'quality';
</script>

<aside class="sidebar">
  <div class="sidebar-header">
    <Sliders size={16} color="#00e575" />
    <span class="sidebar-title">Slice Parameters</span>
  </div>

  <!-- Settings categories tabs (Internal tabs within sidebar) -->
  <div class="sidebar-tabs">
    <button 
      class="subtab-btn" 
      class:active={activeSubTab === 'quality'} 
      on:click={() => activeSubTab = 'quality'}
      title="Layer heights and nozzle settings"
    >
      Quality
    </button>
    <button 
      class="subtab-btn" 
      class:active={activeSubTab === 'strength'} 
      on:click={() => activeSubTab = 'strength'}
      title="Walls, shells, and infill structure"
    >
      Strength
    </button>
    <button 
      class="subtab-btn" 
      class:active={activeSubTab === 'speed'} 
      on:click={() => activeSubTab = 'speed'}
      title="Printing speeds"
    >
      Speed
    </button>
    <button 
      class="subtab-btn" 
      class:active={activeSubTab === 'material'} 
      on:click={() => activeSubTab = 'material'}
      title="Temperatures and cooling settings"
    >
      Material
    </button>
  </div>

  <!-- Settings body container -->
  <div class="sidebar-content">
    
    <!-- Quality Tab -->
    {#if activeSubTab === 'quality'}
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
    {#if activeSubTab === 'strength'}
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
    {#if activeSubTab === 'speed'}
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

        <div class="settings-row">
          <label for="travel-speed">Travel speed</label>
          <div class="input-with-unit">
            <input 
              id="travel-speed" 
              type="number" 
              step="10" 
              min="30" 
              max="500" 
              bind:value={$slicerSettings.travel_speed} 
            />
            <span class="unit">mm/s</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Material/Temp Tab -->
    {#if activeSubTab === 'material'}
      <div class="settings-group animate-fade-in">
        <h3 class="group-title"><Thermometer size={13} /> Temperatures</h3>
        <div class="settings-row">
          <label for="extruder-temp">Extruder temperature</label>
          <div class="input-with-unit">
            <input 
              id="extruder-temp" 
              type="number" 
              step="5" 
              min="150" 
              max="300" 
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
              max="120" 
              bind:value={$slicerSettings.bed_temp} 
            />
            <span class="unit">°C</span>
          </div>
        </div>
      </div>
    {/if}

  </div>
</aside>

<style>
  .sidebar {
    width: 320px;
    background-color: var(--color-bg-sidebar);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    height: 100%;
    user-select: none;
    z-index: 90;
  }

  .sidebar-header {
    height: 40px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid var(--color-border);
  }

  .sidebar-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .sidebar-tabs {
    display: flex;
    border-bottom: 1px solid var(--color-border);
    background-color: rgba(0, 0, 0, 0.1);
  }

  .subtab-btn {
    flex: 1;
    height: 36px;
    font-size: 11px;
    font-weight: 600;
    text-align: center;
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .subtab-btn:hover {
    color: var(--color-text-primary);
  }

  .subtab-btn.active {
    color: var(--color-accent);
    border-bottom-color: var(--color-accent);
    background-color: rgba(255, 255, 255, 0.02);
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .settings-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .group-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 8px;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    padding-bottom: 4px;
  }

  .settings-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .settings-row label {
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  /* Custom input styling */
  input[type="number"], select {
    background-color: var(--color-bg-input);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    color: var(--color-text-primary);
    font-size: 12px;
    height: 26px;
    padding: 0 8px;
    width: 80px;
    outline: none;
    transition: border-color 0.15s ease;
  }

  select {
    width: 120px;
    padding-right: 20px;
    cursor: pointer;
  }

  input[type="number"]:focus, select:focus {
    border-color: var(--color-accent);
  }

  .input-with-unit {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-with-unit input {
    padding-right: 28px;
    width: 85px;
  }

  .unit {
    position: absolute;
    right: 8px;
    font-size: 10px;
    color: var(--color-text-muted);
    pointer-events: none;
  }

  /* Range sliders */
  .range-slider-container {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: -8px;
    margin-bottom: 8px;
  }

  .range-slider-container input[type="range"] {
    -appearance: none;
    -webkit-appearance: none;
    width: 100%;
    background: #2a2d35;
    height: 4px;
    border-radius: 2px;
    outline: none;
  }

  .range-slider-container input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--color-accent);
    cursor: pointer;
    box-shadow: 0 0 4px rgba(0, 229, 117, 0.4);
    transition: transform 0.1s ease;
  }

  .range-slider-container input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .slider-ticks {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: var(--color-text-muted);
  }

  /* Info Banner */
  .info-banner {
    display: flex;
    gap: 8px;
    background-color: rgba(59, 130, 246, 0.08);
    border: 1px solid rgba(59, 130, 246, 0.15);
    border-radius: 6px;
    padding: 8px 12px;
    margin-top: 12px;
  }

  .info-icon {
    flex-shrink: 0;
    color: #3b82f6;
    margin-top: 2px;
  }

  .info-banner span {
    font-size: 11px;
    line-height: 1.4;
    color: #93c5fd;
  }

  /* Fade in animation */
  .animate-fade-in {
    animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
