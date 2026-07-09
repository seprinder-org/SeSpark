<script lang="ts">
  /**
   * PrinterStatus - Shows printer state, temperatures, and quick controls
   * Maps to: DevBed + DevExtruderSystem (temperatures) + DevPrintTaskInfo (status)
   */
  import { Activity, Thermometer, Wind } from 'lucide-svelte';
  import { selectedMachineBed, selectedMachineExtruder, selectedMachinePrintTask } from '../deviceStore';
  import { PrinterState } from '../types';

  export let hotendTemp = 23.4;
  export let targetHotend = 0;
  export let bedTemp = 22.8;
  export let targetBed = 0;
  export let printerState: string = 'Idle';
  export let fanSpeedPercent = 0;
  export let printProgress = 0;

  // Sync from store
  $: {
    const bed = $selectedMachineBed;
    bedTemp = bed.temp;
    targetBed = bed.target_temp;
  }
  $: {
    const ext = $selectedMachineExtruder;
    if (ext.extruders.length > 0) {
      hotendTemp = ext.extruders[0].current_temp;
      targetHotend = ext.extruders[0].target_temp;
    }
  }
  $: {
    const task = $selectedMachinePrintTask;
    printerState = task.status;
    printProgress = task.progress;
  }

  export let onPreheat: () => void = () => {};
  export let onCooldown: () => void = () => {};
</script>

<div class="panel">
  <div class="panel-header-device">
    <Activity size={16} color="#00e575" />
    <span>Printer Status</span>
    <span class="status-badge" class:active={printerState !== PrinterState.IDLE}>{printerState}</span>
  </div>

  <div class="status-indicators">
    <div class="indicator-box">
      <span class="ind-lbl">Hotend Temp</span>
      <span class="ind-val">{hotendTemp.toFixed(1)}°C <span class="target">/ {targetHotend}°C</span></span>
    </div>
    <div class="indicator-box">
      <span class="ind-lbl">Bed Temp</span>
      <span class="ind-val">{bedTemp.toFixed(1)}°C <span class="target">/ {targetBed}°C</span></span>
    </div>
    <div class="indicator-box">
      <span class="ind-lbl">Fan Speed</span>
      <span class="ind-val">{fanSpeedPercent}%</span>
    </div>
    <div class="indicator-box">
      <span class="ind-lbl">Job Progress</span>
      <span class="ind-val">{printProgress}%</span>
    </div>
  </div>

  <div class="quick-controls">
    <button class="btn btn-secondary-device" on:click={onPreheat}>Preheat PLA</button>
    <button class="btn btn-danger-device" on:click={onCooldown}>Cooldown</button>
  </div>
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
    margin-bottom: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    padding-bottom: 8px;
  }

  .status-badge {
    margin-left: auto;
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  .status-badge.active {
    background-color: rgba(0, 229, 117, 0.1);
    border-color: rgba(0, 229, 117, 0.3);
    color: var(--color-accent);
  }

  .status-indicators {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 14px;
  }

  .indicator-box {
    background-color: rgba(0, 0, 0, 0.15);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ind-lbl {
    font-size: 10px;
    color: var(--color-text-muted);
    font-weight: 600;
    text-transform: uppercase;
  }

  .ind-val {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .ind-val .target {
    font-size: 11px;
    color: var(--color-text-muted);
    font-weight: 400;
  }

  .quick-controls {
    display: flex;
    gap: 12px;
  }

  .btn-secondary-device {
    background-color: #27272a;
    color: #e4e4e7;
    border: 1px solid #3f3f46;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    flex: 1;
    transition: all 0.15s ease;
    font-family: inherit;
  }

  .btn-secondary-device:hover {
    background-color: #3f3f46;
    color: white;
  }

  .btn-danger-device {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    flex: 1;
    transition: all 0.15s ease;
    font-family: inherit;
  }

  .btn-danger-device:hover {
    background-color: #ef4444;
    color: white;
  }
</style>
