<script lang="ts">
  /**
   * AMSPanel - AMS (Automatic Material System) management
   * Maps to: DevFilaSystem + DevAms + DevAmsTray
   */
  import { Droplets, Thermometer, Layers, RefreshCw, Box } from 'lucide-svelte';
  import { selectedMachineFila } from '../deviceStore';
  import { getAmsTypeLabel } from '../types';
  import type { AmsUnit, AmsTray } from '../types';

  export let onRefresh: () => void = () => {};

  let hasAms = false;
  let amsCount = 0;
  let amsList: Record<string, AmsUnit> = {};

  $: {
    const fila = $selectedMachineFila;
    hasAms = fila.has_ams;
    amsCount = fila.ams_count;
    amsList = fila.ams_list;
  }

  function getTrayColor(tray: AmsTray): string {
    return tray.color || '#888';
  }

  function getTrayRemainPercent(tray: AmsTray): number {
    return Math.min(Math.max(tray.remain, 0), 100);
  }
</script>

<div class="panel">
  <div class="panel-header-device">
    <Droplets size={16} color="#06b6d4" />
    <span>AMS / Filament</span>
    {#if hasAms}
      <span class="ams-badge">{amsCount} AMS</span>
    {:else}
      <span class="ams-badge no-ams">No AMS</span>
    {/if}
    <button class="refresh-btn" on:click={onRefresh} title="Refresh AMS">
      <RefreshCw size={12} />
    </button>
  </div>

  {#if !hasAms}
    <div class="ams-empty">
      <Box size={32} />
      <span class="ams-empty-text">No AMS units detected. Filament loading via external spool.</span>
    </div>
  {:else}
    {#each Object.values(amsList) as ams}
      <div class="ams-unit">
        <div class="ams-unit-header">
          <span class="ams-unit-name">AMS {ams.ams_id}</span>
          <span class="ams-unit-type">{getAmsTypeLabel(ams.ams_type)}</span>
          {#if ams.support_humidity}
            <span class="ams-humidity">
              <Thermometer size={10} />
              {ams.humidity_percent}% RH
            </span>
          {/if}
          {#if ams.support_drying && ams.left_dry_time > 0}
            <span class="ams-drying">Drying {ams.left_dry_time}m</span>
          {/if}
        </div>

        <div class="ams-trays">
          {#each Object.values(ams.trays) as tray}
            <div class="ams-tray" style="border-left-color: {getTrayColor(tray)}">
              <div class="tray-header">
                <span class="tray-slot">Slot {tray.id}</span>
                <span class="tray-type">{tray.filament_type || 'Empty'}</span>
                {#if tray.is_bbl}
                  <span class="tray-bbl">BBL</span>
                {/if}
              </div>
              {#if tray.filament_type}
                <div class="tray-details">
                  <span class="tray-temp">{tray.nozzle_temp_min}-{tray.nozzle_temp_max}°C</span>
                  <div class="tray-remain-bar">
                    <div
                      class="tray-remain-fill"
                      style="width: {getTrayRemainPercent(tray)}%; background-color: {getTrayColor(tray)}"
                    ></div>
                  </div>
                  <span class="tray-remain-text">{tray.remain}%</span>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}
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
    margin-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    padding-bottom: 8px;
  }

  .ams-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
    background-color: rgba(6, 182, 212, 0.1);
    color: #06b6d4;
    border: 1px solid rgba(6, 182, 212, 0.2);
  }

  .ams-badge.no-ams {
    background-color: rgba(255, 255, 255, 0.04);
    color: var(--color-text-muted);
    border-color: var(--color-border);
  }

  .refresh-btn {
    margin-left: auto;
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 3px 6px;
    color: var(--color-text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.15s ease;
  }

  .refresh-btn:hover {
    background-color: rgba(255, 255, 255, 0.06);
    color: var(--color-text-secondary);
  }

  .ams-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px;
    color: var(--color-text-muted);
  }

  .ams-empty-text {
    font-size: 11px;
    text-align: center;
  }

  .ams-unit {
    background-color: rgba(0, 0, 0, 0.1);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 8px;
  }

  .ams-unit:last-child {
    margin-bottom: 0;
  }

  .ams-unit-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 11px;
  }

  .ams-unit-name {
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .ams-unit-type {
    color: var(--color-text-muted);
    font-size: 10px;
  }

  .ams-humidity {
    display: flex;
    align-items: center;
    gap: 3px;
    color: #22d3ee;
    font-size: 10px;
    margin-left: auto;
  }

  .ams-drying {
    font-size: 9px;
    font-weight: 600;
    background-color: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
    padding: 1px 6px;
    border-radius: 3px;
  }

  .ams-trays {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .ams-tray {
    background-color: rgba(0, 0, 0, 0.15);
    border: 1px solid var(--color-border);
    border-left: 3px solid;
    border-radius: 4px;
    padding: 6px 8px;
  }

  .tray-header {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 4px;
  }

  .tray-slot {
    font-size: 9px;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
  }

  .tray-type {
    font-size: 10px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .tray-bbl {
    font-size: 8px;
    font-weight: 700;
    background-color: rgba(0, 229, 117, 0.1);
    color: var(--color-accent);
    padding: 0 4px;
    border-radius: 2px;
  }

  .tray-details {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tray-temp {
    font-size: 9px;
    color: var(--color-text-muted);
  }

  .tray-remain-bar {
    flex: 1;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
    overflow: hidden;
  }

  .tray-remain-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .tray-remain-text {
    font-size: 9px;
    font-weight: 600;
    color: var(--color-text-muted);
    min-width: 28px;
    text-align: right;
  }
</style>
