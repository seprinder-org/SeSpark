<script lang="ts">
  /**
   * LampPanel - Chamber light control
   * Maps to: DevLamp
   */
  import { Lightbulb } from 'lucide-svelte';
  import { selectedMachineLamp } from '../deviceStore';
  import { LightEffect, getLightEffectLabel } from '../types';

  export let onToggleLight: () => void = () => {};

  let chamberLight = LightEffect.UNKNOWN;
  let isOn = false;

  $: {
    const lamp = $selectedMachineLamp;
    chamberLight = lamp.chamber_light;
    isOn = lamp.is_chamber_light_on;
  }

  function handleToggle() {
    onToggleLight();
  }
</script>

<div class="panel">
  <div class="panel-header-device">
    <Lightbulb size={16} color={isOn ? '#eab308' : 'var(--color-text-muted)'} />
    <span>Chamber Light</span>
    <span class="lamp-status" class:on={isOn}>
      {isOn ? 'On' : 'Off'}
    </span>
  </div>

  <div class="lamp-control">
    <div class="lamp-icon-wrap" class:lit={isOn}>
      <Lightbulb size={48} />
    </div>
    <span class="lamp-effect">{getLightEffectLabel(chamberLight)}</span>
    <button class="btn-device" class:active={isOn} on:click={handleToggle}>
      {isOn ? 'Turn Off' : 'Turn On'}
    </button>
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
    margin-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    padding-bottom: 8px;
  }

  .lamp-status {
    margin-left: auto;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
  }

  .lamp-status.on {
    background-color: rgba(234, 179, 8, 0.1);
    border-color: rgba(234, 179, 8, 0.3);
    color: #eab308;
  }

  .lamp-control {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background-color: rgba(0, 0, 0, 0.1);
    border: 1px solid var(--color-border);
    border-radius: 6px;
  }

  .lamp-icon-wrap {
    color: var(--color-text-muted);
    transition: all 0.3s ease;
  }

  .lamp-icon-wrap.lit {
    color: #eab308;
    filter: drop-shadow(0 0 8px rgba(234, 179, 8, 0.4));
  }

  .lamp-effect {
    font-size: 11px;
    color: var(--color-text-muted);
    font-weight: 500;
  }

  .btn-device {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background-color: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 7px 20px;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
    width: 100%;
  }

  .btn-device:hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: var(--color-text-primary);
  }

  .btn-device.active {
    background-color: rgba(234, 179, 8, 0.1);
    border-color: rgba(234, 179, 8, 0.3);
    color: #eab308;
  }
</style>
