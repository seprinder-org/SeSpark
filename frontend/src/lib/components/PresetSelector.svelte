<script lang="ts">
  /**
   * PresetSelector - Matches OrcaSlicer's preset selection system.
   * Shows printer, filament, and process preset dropdowns with
   * search/filter capabilities.
   */
  import {
    selectedPrinterId,
    selectedPrinter,
    selectedPrinterLabel,
    selectedFilament,
    filamentPresets,
    selectedProcessPreset,
    processPresets,
    printersByBrand,
    allPrinters,
  } from '../store';
  import { Printer, Droplets, Sliders, Search, ChevronDown, Check } from 'lucide-svelte';
  import { getPrinterLabel } from '../profiles/profileService';
  import type { PrinterProfile } from '../profiles/types';

  // ─── Printer Dropdown ──────────────────────────────────────────────────
  let showPrinterDropdown = false;
  let printerSearch = '';

  $: brandEntries = Object.entries($printersByBrand).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  $: filteredBrandEntries = (() => {
    if (!printerSearch.trim()) return brandEntries;
    const q = printerSearch.toLowerCase();
    return brandEntries
      .map(([brand, printers]) => {
        const filtered = printers.filter(
          (p) =>
            p.machine_name.toLowerCase().includes(q) ||
            brand.toLowerCase().includes(q)
        );
        return [brand, filtered] as [string, PrinterProfile[]];
      })
      .filter(([, printers]) => printers.length > 0);
  })();

  function selectPrinter(printer: PrinterProfile) {
    selectedPrinterId.set(printer.id);
    showPrinterDropdown = false;
    printerSearch = '';
  }

  function togglePrinterDropdown() {
    showPrinterDropdown = !showPrinterDropdown;
  }

  // ─── Filament Dropdown ────────────────────────────────────────────────
  let showFilamentDropdown = false;
  let filamentSearch = '';

  $: filteredFilaments = $filamentPresets.filter(f =>
    f.toLowerCase().includes(filamentSearch.toLowerCase())
  );

  function selectFilament(name: string) {
    selectedFilament.set(name);
    showFilamentDropdown = false;
    filamentSearch = '';
  }

  // ─── Process Preset Dropdown ──────────────────────────────────────────
  let showProcessDropdown = false;
  let processSearch = '';

  $: filteredProcesses = $processPresets.filter(p =>
    p.toLowerCase().includes(processSearch.toLowerCase())
  );

  function selectProcess(name: string) {
    selectedProcessPreset.set(name);
    showProcessDropdown = false;
    processSearch = '';
  }

  // ─── Close dropdowns on outside click ─────────────────────────────────
  function handleDocumentClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.preset-dropdown-wrapper')) {
      showPrinterDropdown = false;
      showFilamentDropdown = false;
      showProcessDropdown = false;
    }
  }

  function handleToggle(dropdown: string) {
    document.addEventListener('click', handleDocumentClick);
    if (dropdown === 'printer') {
      showPrinterDropdown = !showPrinterDropdown;
      showFilamentDropdown = false;
      showProcessDropdown = false;
    } else if (dropdown === 'filament') {
      showFilamentDropdown = !showFilamentDropdown;
      showPrinterDropdown = false;
      showProcessDropdown = false;
    } else if (dropdown === 'process') {
      showProcessDropdown = !showProcessDropdown;
      showPrinterDropdown = false;
      showFilamentDropdown = false;
    }
  }
</script>

<div class="preset-selector">
  <div class="preset-section">
    <span class="preset-label">Printer</span>
    <div class="preset-dropdown-wrapper">
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <div class="preset-dropdown-trigger" on:click={() => handleToggle('printer')}>
        <Printer size={14} class="preset-icon" />
        <span class="preset-value">{$selectedPrinterLabel}</span>
        <ChevronDown size={12} class="dropdown-chevron" />
      </div>

      {#if showPrinterDropdown}
        <div class="preset-dropdown-panel">
          <div class="preset-search-box">
            <Search size={14} class="search-icon" />
            <input
              type="text"
              placeholder="Search printers..."
              bind:value={printerSearch}
              class="preset-search-input"
            />
          </div>
          <div class="preset-list">
            {#each filteredBrandEntries as [brand, printers]}
              <div class="brand-group">
                <div class="brand-header">{brand}</div>
                {#each printers as printer}
                  <button
                    class="preset-item"
                    class:selected={$selectedPrinterId === printer.id}
                    on:click={() => selectPrinter(printer)}
                  >
                    <span class="preset-item-name">{printer.machine_name}</span>
                    {#if $selectedPrinterId === printer.id}
                      <Check size={14} class="check-icon" />
                    {/if}
                  </button>
                {/each}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="preset-section">
    <span class="preset-label">Filament</span>
    <div class="preset-dropdown-wrapper">
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <div class="preset-dropdown-trigger" on:click={() => handleToggle('filament')}>
        <Droplets size={14} class="preset-icon" />
        <span class="preset-value">{$selectedFilament}</span>
        <ChevronDown size={12} class="dropdown-chevron" />
      </div>

      {#if showFilamentDropdown}
        <div class="preset-dropdown-panel">
          <div class="preset-search-box">
            <Search size={14} class="search-icon" />
            <input
              type="text"
              placeholder="Search filaments..."
              bind:value={filamentSearch}
              class="preset-search-input"
            />
          </div>
          <div class="preset-list">
            {#each filteredFilaments as filament}
              <button
                class="preset-item"
                class:selected={$selectedFilament === filament}
                on:click={() => selectFilament(filament)}
              >
                <span class="preset-item-name">{filament}</span>
                {#if $selectedFilament === filament}
                  <Check size={14} class="check-icon" />
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="preset-section">
    <span class="preset-label">Process</span>
    <div class="preset-dropdown-wrapper">
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <div class="preset-dropdown-trigger" on:click={() => handleToggle('process')}>
        <Sliders size={14} class="preset-icon" />
        <span class="preset-value">{$selectedProcessPreset}</span>
        <ChevronDown size={12} class="dropdown-chevron" />
      </div>

      {#if showProcessDropdown}
        <div class="preset-dropdown-panel">
          <div class="preset-search-box">
            <Search size={14} class="search-icon" />
            <input
              type="text"
              placeholder="Search process presets..."
              bind:value={processSearch}
              class="preset-search-input"
            />
          </div>
          <div class="preset-list">
            {#each filteredProcesses as preset}
              <button
                class="preset-item"
                class:selected={$selectedProcessPreset === preset}
                on:click={() => selectProcess(preset)}
              >
                <span class="preset-item-name">{preset}</span>
                {#if $selectedProcessPreset === preset}
                  <Check size={14} class="check-icon" />
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .preset-selector {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 12px;
  }

  .preset-section {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .preset-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .preset-dropdown-wrapper {
    position: relative;
  }

  .preset-dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    background-color: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.15s ease;
    user-select: none;
  }

  .preset-dropdown-trigger:hover {
    border-color: var(--color-accent);
  }

  .preset-icon {
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .preset-value {
    flex: 1;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dropdown-chevron {
    color: var(--color-text-muted);
    flex-shrink: 0;
    transition: transform 0.15s ease;
  }

  .preset-dropdown-panel {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    min-width: 240px;
    background-color: var(--color-bg-sidebar);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    z-index: 200;
    overflow: hidden;
  }

  .preset-search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-bottom: 1px solid var(--color-border);
  }

  .search-icon {
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .preset-search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--color-text-primary);
    font-size: 12px;
  }

  .preset-search-input::placeholder {
    color: var(--color-text-muted);
  }

  .preset-list {
    max-height: 240px;
    overflow-y: auto;
  }

  .brand-group {
    display: flex;
    flex-direction: column;
  }

  .brand-header {
    font-size: 10px;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 6px 10px 3px;
  }

  .preset-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: transparent;
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
    color: var(--color-text-primary);
    font-size: 12px;
    transition: background-color 0.1s ease;
  }

  .preset-item:hover {
    background-color: rgba(255, 255, 255, 0.04);
  }

  .preset-item.selected {
    background-color: rgba(0, 229, 117, 0.08);
    color: var(--color-accent);
  }

  .preset-item-name {
    flex: 1;
  }

  .check-icon {
    color: var(--color-accent);
    flex-shrink: 0;
  }
</style>
