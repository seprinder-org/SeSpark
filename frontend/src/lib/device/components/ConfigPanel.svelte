<script lang="ts">
  /**
   * ConfigPanel - Machine capabilities and configuration
   * Maps to: DevConfig
   */
  import { Settings, Check, X, Cpu, Thermometer, Camera, Layers } from 'lucide-svelte';
  import { selectedMachineConfig } from '../deviceStore';

  let config: Record<string, boolean> = {};

  $: {
    const c = $selectedMachineConfig;
    config = {
      'Chamber': c.has_chamber,
      'Chamber Temp Edit': c.support_chamber_edit,
      'First Layer Inspect': c.support_first_layer_inspect,
      'Save Remote File': c.support_save_remote_print_file_to_storage,
      'AI Monitor': c.support_ai_monitor,
      'Print Without SD': c.support_print_without_sd,
      'Print All Plates': c.support_print_all_plates,
      'LiDAR Calibration': c.support_calibration_lidar,
      'Nozzle Offset Cal': c.support_calibration_nozzle_offset,
      'High Temp Bed Cal': c.support_calibration_high_temp_bed,
      'Clump Pos Cal': c.support_calibration_clump_pos,
      'PA Flow Auto Cal': c.support_calibration_pa_flow_auto,
    };
  }

  let chamberTempMin = 0;
  let chamberTempMax = 60;
  let chamberSwitchHeat = Number.MAX_SAFE_INTEGER;

  $: {
    const c = $selectedMachineConfig;
    chamberTempMin = c.chamber_temp_edit_min;
    chamberTempMax = c.chamber_temp_edit_max;
    chamberSwitchHeat = c.chamber_temp_switch_heat;
  }
</script>

<div class="panel">
  <div class="panel-header-device">
    <Settings size={16} color="#a78bfa" />
    <span>Machine Config</span>
  </div>

  <div class="config-grid">
    {#each Object.entries(config) as [label, supported]}
      <div class="config-item">
        <span class="config-label">{label}</span>
        {#if supported}
          <span class="config-check">
            <Check size={12} />
          </span>
        {:else}
          <span class="config-cross">
            <X size={12} />
          </span>
        {/if}
      </div>
    {/each}
  </div>

  {#if config['Chamber'] && config['Chamber Temp Edit']}
    <div class="chamber-info">
      <Thermometer size={12} />
      <span>Chamber temp range: {chamberTempMin}°C – {chamberTempMax}°C</span>
      {#if chamberSwitchHeat < Number.MAX_SAFE_INTEGER}
        <span class="chamber-switch">Switch heat: {chamberSwitchHeat}°C</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .panel {
    background-color: var(--color-bg-sidebar);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
  }

  .panel-header-device {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    padding-bottom: 8px;
  }

  .config-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
  }

  .config-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    background-color: rgba(0, 0, 0, 0.08);
    border-radius: 4px;
    font-size: 10px;
  }

  .config-label {
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .config-check {
    color: var(--color-accent);
    display: flex;
    align-items: center;
  }

  .config-cross {
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    opacity: 0.4;
  }

  .chamber-info {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding: 8px;
    background-color: rgba(0, 0, 0, 0.08);
    border-radius: 4px;
    font-size: 10px;
    color: var(--color-text-muted);
    flex-wrap: wrap;
  }

  .chamber-switch {
    margin-left: auto;
    color: #f97316;
    font-weight: 600;
  }
</style>
