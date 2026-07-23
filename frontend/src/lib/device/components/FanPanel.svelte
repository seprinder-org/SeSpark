<script lang="ts">
  /**
   * FanPanel - Cooling fan control and monitoring
   * Maps to: DevFan + AirDuctData
   */
  import { Fan, Wind, Gauge } from 'lucide-svelte';
  import { selectedMachineFan } from '../deviceStore';
  import { AirDuctMode } from '../types';

  export let onSetFanSpeed: (fanType: string, speed: number) => void = () => {};

  let heatbreakSpeed = 0;
  let coolingSpeed = 0;
  let bigFan1Speed = 0;
  let bigFan2Speed = 0;
  let fanGear = 0;
  let supportAux = false;
  let supportChamber = false;
  let supportAirDuct = false;

  $: {
    const fan = $selectedMachineFan;
    heatbreakSpeed = fan.heatbreak_fan_speed;
    coolingSpeed = fan.cooling_fan_speed;
    bigFan1Speed = fan.big_fan1_speed;
    bigFan2Speed = fan.big_fan2_speed;
    fanGear = fan.fan_gear;
    supportAux = fan.support_aux_fan;
    supportChamber = fan.support_chamber_fan;
    supportAirDuct = fan.support_airduct;
  }

  function getFanPercent(speed: number): number {
    return Math.min(Math.max(Math.round((speed / 255) * 100), 0), 100);
  }
</script>

<div class="panel">
  <div class="panel-header-device">
    <Fan size={16} color="#22d3ee" />
    <span>Cooling Fans</span>
    {#if fanGear > 0}
      <span class="fan-gear">Gear {fanGear}</span>
    {/if}
  </div>

  <div class="fan-list">
    <div class="fan-item">
      <div class="fan-item-header">
        <Wind size={12} />
        <span class="fan-label">Heatbreak Fan</span>
        <span class="fan-value">{getFanPercent(heatbreakSpeed)}%</span>
      </div>
      <div class="fan-bar">
        <div class="fan-bar-fill" style="width: {getFanPercent(heatbreakSpeed)}%"></div>
      </div>
    </div>

    <div class="fan-item">
      <div class="fan-item-header">
        <Wind size={12} />
        <span class="fan-label">Cooling Fan</span>
        <span class="fan-value">{getFanPercent(coolingSpeed)}%</span>
      </div>
      <div class="fan-bar">
        <div class="fan-bar-fill" style="width: {getFanPercent(coolingSpeed)}%"></div>
      </div>
    </div>

    {#if supportAux}
      <div class="fan-item">
        <div class="fan-item-header">
          <Wind size={12} />
          <span class="fan-label">Aux Fan 1</span>
          <span class="fan-value">{getFanPercent(bigFan1Speed)}%</span>
        </div>
        <div class="fan-bar">
          <div class="fan-bar-fill aux" style="width: {getFanPercent(bigFan1Speed)}%"></div>
        </div>
      </div>
    {/if}

    {#if supportChamber}
      <div class="fan-item">
        <div class="fan-item-header">
          <Wind size={12} />
          <span class="fan-label">Chamber Fan</span>
          <span class="fan-value">{getFanPercent(bigFan2Speed)}%</span>
        </div>
        <div class="fan-bar">
          <div class="fan-bar-fill chamber" style="width: {getFanPercent(bigFan2Speed)}%"></div>
        </div>
      </div>
    {/if}
  </div>

  {#if supportAirDuct}
    <div class="airduct-section">
      <span class="airduct-label">Air Duct System</span>
      <span class="airduct-status">Active</span>
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

  .fan-gear {
    margin-left: auto;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
    background-color: rgba(34, 211, 238, 0.1);
    color: #22d3ee;
    border: 1px solid rgba(34, 211, 238, 0.2);
  }

  .fan-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .fan-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .fan-item-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
  }

  .fan-label {
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .fan-value {
    margin-left: auto;
    font-weight: 700;
    color: var(--color-text-primary);
    font-size: 12px;
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  }

  .fan-bar {
    height: 6px;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
    overflow: hidden;
  }

  .fan-bar-fill {
    height: 100%;
    background-color: #22d3ee;
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .fan-bar-fill.aux {
    background-color: #06b6d4;
  }

  .fan-bar-fill.chamber {
    background-color: #0891b2;
  }

  .airduct-section {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid var(--color-border);
  }

  .airduct-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-muted);
  }

  .airduct-status {
    margin-left: auto;
    font-size: 10px;
    font-weight: 600;
    color: var(--color-accent);
  }
</style>
