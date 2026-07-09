<script lang="ts">
  /**
   * DeviceHeader - Machine info header bar
   * Maps to: DevInfo (static machine info) + connection state
   */
  import { Cpu, HardDrive, Layers, Zap, Wifi, WifiOff, X, ChevronDown, Search, Activity } from 'lucide-svelte';
  import { selectedMachineConnection, selectedMachine, selectMachine, allMachines } from '../deviceStore';
  import { ConnectionType } from '../types';
  import { selectedPrinterId, selectedPrinterLabel } from '../../store';
  import { findPrinterById, getPrinterLabel, getPrintersByBrand } from '../../profiles/profileService';
  import type { PrinterProfile } from '../../profiles/types';

  export let machineName = 'Unknown Printer';
  export let machineModel = '';
  export let machineSerial = 'SN-00000000';
  export let firmwareVersion = 'v0.0.0';

  // Connection
  let showMachineSelector = false;
  let machineSearchQuery = '';
  let printersByBrandMap: Record<string, PrinterProfile[]> = {};
  let filteredBrands: string[] = [];

  $: printersByBrandMap = getPrintersByBrand();
  $: filterMachines();

  function filterMachines() {
    const q = machineSearchQuery.toLowerCase().trim();
    if (!q) {
      filteredBrands = Object.keys(printersByBrandMap).sort();
      return;
    }
    filteredBrands = Object.entries(printersByBrandMap)
      .filter(([brand, printers]) =>
        brand.toLowerCase().includes(q) ||
        printers.some(p => p.name.toLowerCase().includes(q) || p.model_id?.toLowerCase().includes(q))
      )
      .map(([brand]) => brand)
      .sort();
  }

  function selectMachineProfile(printerId: string) {
    selectedPrinterId.set(printerId);
    showMachineSelector = false;
    machineSearchQuery = '';
  }

  function toggleMachineSelector() {
    showMachineSelector = !showMachineSelector;
    if (showMachineSelector) {
      machineSearchQuery = '';
      filterMachines();
    }
  }

  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.machine-selector-wrapper')) {
      showMachineSelector = false;
    }
  }

  // Connection actions
  let connType = $selectedMachineConnection.type;
  let connIP = $selectedMachineConnection.ip;
  let connSignal = $selectedMachineConnection.signal;

  $: {
    connType = $selectedMachineConnection.type;
    connIP = $selectedMachineConnection.ip;
    connSignal = $selectedMachineConnection.signal;
  }

  import { onMount, onDestroy } from 'svelte';
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });
  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<div class="machine-header">
  <div class="machine-header-left">
    <div class="machine-selector-wrapper">
      <button class="machine-select-btn" on:click={toggleMachineSelector}>
        <Cpu size={16} color="var(--color-accent)" />
        <span class="machine-name-text">{$selectedPrinterLabel}</span>
        <span class="chevron-wrap" class:rotated={showMachineSelector}>
          <ChevronDown size={14} />
        </span>
      </button>

      {#if showMachineSelector}
        <div class="machine-dropdown">
          <div class="machine-search-bar">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search printers..."
              bind:value={machineSearchQuery}
              on:input={filterMachines}
            />
          </div>
          <div class="machine-list">
            {#each filteredBrands as brand}
              <div class="machine-group">
                <div class="machine-group-label">{brand}</div>
                {#each printersByBrandMap[brand] as printer}
                  <button
                    class="machine-item"
                    class:selected={$selectedPrinterId === `${brand}::${printer.name}`}
                    on:click={() => selectMachineProfile(`${brand}::${printer.name}`)}
                  >
                    <span class="machine-item-name">{printer.name}</span>
                    {#if printer.nozzle_diameter}
                      <span class="machine-item-nozzle">{printer.nozzle_diameter}mm</span>
                    {/if}
                  </button>
                {/each}
              </div>
            {/each}
            {#if filteredBrands.length === 0}
              <div class="machine-empty">No printers found</div>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <div class="machine-meta">
      <span class="meta-item" title="Model">
        <HardDrive size={12} /> {machineModel}
      </span>
      <span class="meta-item" title="Serial">
        <Layers size={12} /> {machineSerial}
      </span>
      <span class="meta-item" title="Firmware">
        <Zap size={12} /> {firmwareVersion}
      </span>
    </div>
  </div>

  <div class="machine-header-right">
    <div class="connection-status">
      {#if connType === ConnectionType.DISCONNECTED}
        <span class="conn-badge disconnected">
          <WifiOff size={12} /> Disconnected
        </span>
      {:else if connType === ConnectionType.LAN}
        <span class="conn-badge lan">
          <Wifi size={12} /> LAN
          <span class="conn-ip">{connIP}</span>
        </span>
      {:else}
        <span class="conn-badge cloud">
          <Wifi size={12} /> Cloud
          <span class="conn-ip">{connIP}</span>
        </span>
      {/if}
    </div>
  </div>
</div>

<style>
  .machine-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--color-bg-sidebar);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 8px 14px;
    gap: 12px;
    flex-shrink: 0;
  }

  .machine-header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;
  }

  .machine-selector-wrapper {
    position: relative;
  }

  .machine-select-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: rgba(0, 229, 117, 0.08);
    border: 1px solid rgba(0, 229, 117, 0.25);
    border-radius: 6px;
    padding: 6px 12px;
    color: var(--color-text-primary);
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
    transition: all 0.15s ease;
    white-space: nowrap;
    font-family: inherit;
  }

  .machine-select-btn:hover {
    background-color: rgba(0, 229, 117, 0.15);
    border-color: rgba(0, 229, 117, 0.4);
  }

  .chevron-wrap {
    display: flex;
    align-items: center;
    transition: transform 0.2s ease;
  }

  .chevron-wrap.rotated {
    transform: rotate(180deg);
  }

  .machine-name-text {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .machine-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 320px;
    max-height: 400px;
    background-color: var(--color-bg-sidebar);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    z-index: 100;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .machine-search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text-muted);
  }

  .machine-search-bar input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--color-text-primary);
    font-size: 12px;
    outline: none;
    font-family: inherit;
  }

  .machine-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }

  .machine-group {
    padding: 4px 0;
  }

  .machine-group-label {
    font-size: 10px;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    padding: 6px 12px 4px;
    letter-spacing: 0.5px;
  }

  .machine-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 6px 12px;
    background: transparent;
    border: none;
    color: var(--color-text-primary);
    font-size: 12px;
    cursor: pointer;
    transition: background 0.1s ease;
    font-family: inherit;
    text-align: left;
  }

  .machine-item:hover {
    background-color: rgba(255, 255, 255, 0.04);
  }

  .machine-item.selected {
    background-color: rgba(0, 229, 117, 0.08);
    color: var(--color-accent);
  }

  .machine-item-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .machine-item-nozzle {
    font-size: 10px;
    color: var(--color-text-muted);
    margin-left: 8px;
    flex-shrink: 0;
  }

  .machine-empty {
    padding: 24px 12px;
    text-align: center;
    color: var(--color-text-muted);
    font-size: 12px;
  }

  .machine-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 11px;
    color: var(--color-text-muted);
    min-width: 0;
    overflow: hidden;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }

  .machine-header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .connection-status {
    display: flex;
    align-items: center;
  }

  .conn-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }

  .conn-badge.disconnected {
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
  }

  .conn-badge.lan {
    background-color: rgba(59, 130, 246, 0.08);
    border: 1px solid rgba(59, 130, 246, 0.2);
    color: #3b82f6;
  }

  .conn-badge.cloud {
    background-color: rgba(139, 92, 246, 0.08);
    border: 1px solid rgba(139, 92, 246, 0.2);
    color: #8b5cf6;
  }

  .conn-ip {
    font-weight: 400;
    opacity: 0.7;
    margin-left: 4px;
  }
</style>
