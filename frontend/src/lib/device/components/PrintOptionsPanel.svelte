<script lang="ts">
  /**
   * PrintOptionsPanel - Print speed, AI detection, and other print options
   * Maps to: DevPrintOptions
   */
  import { Gauge, Camera, Shield, Bell, AlertTriangle } from 'lucide-svelte';
  import { selectedMachinePrintOptions } from '../deviceStore';
  import { DevPrintingSpeedLevel, getSpeedLevelLabel } from '../types';

  export let onSetSpeedLevel: (level: DevPrintingSpeedLevel) => void = () => {};
  export let onToggleAIMonitoring: () => void = () => {};
  export let onToggleFirstLayerInspect: () => void = () => {};

  let speedLevel = DevPrintingSpeedLevel.SPEED_LEVEL_NORMAL;
  let aiMonitoring = false;
  let aiSensitivity = '';
  let firstLayerInspect = false;
  let buildplateMarker = false;
  let autoRecovery = false;
  let allowSound = false;
  let filamentTangle = false;
  let idleHeatProtect = -1;

  $: {
    const opts = $selectedMachinePrintOptions;
    speedLevel = opts.speed_level;
    aiMonitoring = opts.ai_monitoring;
    aiSensitivity = opts.ai_monitoring_sensitivity;
    firstLayerInspect = opts.first_layer_inspector;
    buildplateMarker = opts.buildplate_marker_detector;
    autoRecovery = opts.auto_recovery_step_loss;
    allowSound = opts.allow_prompt_sound;
    filamentTangle = opts.filament_tangle_detect;
    idleHeatProtect = opts.idle_heating_protect_enabled;
  }

  const speedLevels = [
    { value: DevPrintingSpeedLevel.SPEED_LEVEL_SILENCE, label: 'Silent' },
    { value: DevPrintingSpeedLevel.SPEED_LEVEL_NORMAL, label: 'Normal' },
    { value: DevPrintingSpeedLevel.SPEED_LEVEL_RAPID, label: 'Rapid' },
    { value: DevPrintingSpeedLevel.SPEED_LEVEL_RAMPAGE, label: 'Rampage' },
  ];
</script>

<div class="panel">
  <div class="panel-header-device">
    <Gauge size={16} color="#f97316" />
    <span>Print Options</span>
    <span class="speed-badge">{getSpeedLevelLabel(speedLevel)}</span>
  </div>

  <!-- Speed Level -->
  <div class="option-section">
    <span class="option-label">Speed Level</span>
    <div class="speed-btns">
      {#each speedLevels as sl}
        <button
          class="speed-btn"
          class:active={speedLevel === sl.value}
          on:click={() => onSetSpeedLevel(sl.value)}
        >{sl.label}</button>
      {/each}
    </div>
  </div>

  <!-- Toggle Options -->
  <div class="option-toggles">
    <div class="toggle-row">
      <div class="toggle-info">
        <Camera size={12} />
        <span>AI Monitoring</span>
      </div>
      <button
        class="toggle-switch"
        class:on={aiMonitoring}
        on:click={onToggleAIMonitoring}
      >
        <span class="toggle-knob"></span>
      </button>
    </div>

    <div class="toggle-row">
      <div class="toggle-info">
        <Shield size={12} />
        <span>First Layer Inspector</span>
      </div>
      <button
        class="toggle-switch"
        class:on={firstLayerInspect}
        on:click={onToggleFirstLayerInspect}
      >
        <span class="toggle-knob"></span>
      </button>
    </div>

    <div class="toggle-row">
      <div class="toggle-info">
        <AlertTriangle size={12} />
        <span>Auto Recovery (Step Loss)</span>
      </div>
      <span class="toggle-value">{autoRecovery ? 'On' : 'Off'}</span>
    </div>

    <div class="toggle-row">
      <div class="toggle-info">
        <Bell size={12} />
        <span>Prompt Sound</span>
      </div>
      <span class="toggle-value">{allowSound ? 'On' : 'Off'}</span>
    </div>

    <div class="toggle-row">
      <div class="toggle-info">
        <span class="tangle-icon">~</span>
        <span>Filament Tangle Detect</span>
      </div>
      <span class="toggle-value">{filamentTangle ? 'On' : 'Off'}</span>
    </div>
  </div>

  {#if aiMonitoring && aiSensitivity}
    <div class="ai-sensitivity">
      <span>AI Sensitivity: {aiSensitivity}</span>
    </div>
  {/if}

  {#if idleHeatProtect >= 0}
    <div class="idle-protect">
      <span>Idle Heat Protect: {idleHeatProtect > 0 ? `${idleHeatProtect} min` : 'Disabled'}</span>
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

  .speed-badge {
    margin-left: auto;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
    background-color: rgba(249, 115, 22, 0.1);
    color: #f97316;
    border: 1px solid rgba(249, 115, 22, 0.2);
  }

  .option-section {
    margin-bottom: 12px;
  }

  .option-label {
    display: block;
    font-size: 10px;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .speed-btns {
    display: flex;
    gap: 4px;
  }

  .speed-btn {
    flex: 1;
    background-color: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 5px 4px;
    font-size: 10px;
    font-weight: 600;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s ease;
    text-align: center;
  }

  .speed-btn:hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: var(--color-text-primary);
  }

  .speed-btn.active {
    background-color: rgba(249, 115, 22, 0.15);
    border-color: rgba(249, 115, 22, 0.3);
    color: #f97316;
  }

  .option-toggles {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    background-color: rgba(0, 0, 0, 0.08);
    border-radius: 4px;
  }

  .toggle-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--color-text-secondary);
  }

  .tangle-icon {
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text-muted);
  }

  .toggle-switch {
    width: 32px;
    height: 18px;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    padding: 2px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .toggle-switch.on {
    background-color: rgba(0, 229, 117, 0.3);
    border-color: rgba(0, 229, 117, 0.4);
  }

  .toggle-knob {
    display: block;
    width: 12px;
    height: 12px;
    background-color: var(--color-text-secondary);
    border-radius: 50%;
    transition: all 0.2s ease;
    position: absolute;
    top: 2px;
    left: 2px;
  }

  .toggle-switch.on .toggle-knob {
    left: 16px;
    background-color: var(--color-accent);
  }

  .toggle-value {
    font-size: 10px;
    font-weight: 600;
    color: var(--color-text-muted);
  }

  .ai-sensitivity,
  .idle-protect {
    margin-top: 8px;
    padding: 6px 8px;
    background-color: rgba(0, 0, 0, 0.08);
    border-radius: 4px;
    font-size: 10px;
    color: var(--color-text-muted);
  }
</style>
