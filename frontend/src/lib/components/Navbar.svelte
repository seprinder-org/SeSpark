<script lang="ts">
  /**
   * Navbar - Matches OrcaSlicer's top toolbar/menu bar.
   * Contains: Logo, Menu bar (File/Edit/Settings/Help),
   * Printer/Filament/Process preset selectors, Slice/Export buttons,
   * Tab switcher (Prepare/Preview/Device), Theme toggle, Search.
   */
  import {
    activeTab,
    selectedPrinterId,
    selectedPrinter,
    selectedFilament,
    selectedProcessPreset,
    stlFileBytes,
    slicingStatus,
    sliceResult,
    showGcodeViewer,
    stlFileName,
    slicerSettings,
    theme,
    printersByBrand,
    showSearchDialog,
    showCalibrationDialog,
    addPlaterObject,
    addNotification,
  } from "../store";
  import type { Tab } from "../store";
  import {
    Printer,
    FolderOpen,
    Layers,
    Sliders,
    Cpu,
    Play,
    Download,
    Code,
    ChevronDown,
    Activity,
    Sun,
    Moon,
    Search,
    Check,
    Droplets,
    Gauge,
    Save,
    FileText,
    Settings,
    HelpCircle,
    Scissors,
  } from "lucide-svelte";
  import { getPrinterLabel } from "../profiles/profileService";
  import type { PrinterProfile } from "../profiles/types";
  import PlateSelector from "./PlateSelector.svelte";

  // Triggers STL file loading via hidden input
  let fileInput: HTMLInputElement;

  function triggerFileSelect() {
    fileInput.click();
  }

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      stlFileName.set(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const arrayBuffer = e.target.result as ArrayBuffer;
          const bytes = new Uint8Array(arrayBuffer);
          stlFileBytes.set(bytes);
          slicingStatus.set("idle");
          sliceResult.set(null);

          // Add to plater object list
          addPlaterObject({
            name: file.name.replace(/\.[^/.]+$/, ""),
            filename: file.name,
            stlBytes: bytes,
            position: { x: 128, y: 128, z: 0 },
          });

          addNotification('info', `Loaded model: ${file.name}`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }

  // Trigger slicing using WebAssembly Slicer
  export let onSlice: () => void;

  function handleDownloadGcode() {
    if (!$sliceResult) return;
    const blob = new Blob([$sliceResult.gcode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = $stlFileName.replace(/\.[^/.]+$/, "") + ".gcode";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ─── Menu Dropdowns ───────────────────────────────────────────────────
  let activeMenu: string | null = null;

  function toggleMenu(menu: string) {
    activeMenu = activeMenu === menu ? null : menu;
  }

  function closeMenus() {
    activeMenu = null;
  }

  function handleMenuClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.menu-bar')) {
      closeMenus();
    }
  }

  // ─── Printer Dropdown ─────────────────────────────────────────────────
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
    printerSearch = "";
  }

  function togglePrinterDropdown() {
    showPrinterDropdown = !showPrinterDropdown;
    showFilamentDropdown = false;
    showProcessDropdown = false;
  }

  // ─── Filament Dropdown ────────────────────────────────────────────────
  let showFilamentDropdown = false;
  let filamentSearch = '';

  $: filamentOptions = $selectedPrinter?.default_materials.length
    ? $selectedPrinter.default_materials
    : [
        "Generic PLA @System",
        "Generic PETG @System",
        "Generic ABS @System",
        "Generic TPU @System",
        "Generic ASA @System",
        "Generic PC @System",
      ];

  $: filteredFilaments = filamentOptions.filter(f =>
    f.toLowerCase().includes(filamentSearch.toLowerCase())
  );

  function selectFilament(name: string) {
    selectedFilament.set(name);
    showFilamentDropdown = false;
    filamentSearch = '';
  }

  function toggleFilamentDropdown() {
    showFilamentDropdown = !showFilamentDropdown;
    showPrinterDropdown = false;
    showProcessDropdown = false;
  }

  // ─── Process Dropdown ─────────────────────────────────────────────────
  let showProcessDropdown = false;
  let processSearch = '';

  const processOptions = [
    '0.20mm Standard @System',
    '0.16mm Optimal @System',
    '0.12mm Fine @System',
    '0.08mm Extra Fine @System',
    '0.24mm Draft @System',
  ];

  $: filteredProcesses = processOptions.filter(p =>
    p.toLowerCase().includes(processSearch.toLowerCase())
  );

  function selectProcess(name: string) {
    selectedProcessPreset.set(name);
    showProcessDropdown = false;
    processSearch = '';
  }

  function toggleProcessDropdown() {
    showProcessDropdown = !showProcessDropdown;
    showPrinterDropdown = false;
    showFilamentDropdown = false;
  }

  // ─── Close dropdowns on outside click ─────────────────────────────────
  function handleDocumentClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.dropdown-wrapper')) {
      showPrinterDropdown = false;
      showFilamentDropdown = false;
      showProcessDropdown = false;
    }
  }

  // ─── Theme Toggle ─────────────────────────────────────────────────────
  function toggleTheme() {
    theme.update(t => t === 'dark' ? 'light' : 'dark');
  }

  // ─── Tab Switcher ─────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'prepare', label: 'Prepare', icon: Layers },
    { id: 'preview', label: 'Preview', icon: Play },
    { id: 'device', label: 'Device', icon: Cpu },
  ];
</script>

<svelte:window on:click={handleMenuClick} on:click={handleDocumentClick} />

<header class="navbar">
  <!-- Top line: Logo, Menus, Quick Settings -->
  <div class="navbar-top">
    <div class="logo-area">
      <div class="logo-icon">
        <Activity size={20} color="#00e575" strokeWidth={2.5} />
      </div>
      <span class="app-title">SeSpark v1.0.10</span>
    </div>

    <!-- Menu Bar (matching OrcaSlicer's menu system) -->
    <nav class="menu-bar">
      <!-- File Menu -->
      <div class="menu-item-wrapper">
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div class="menu-item" on:click={() => toggleMenu('file')} on:mouseenter={() => {}}>
          <FolderOpen size={13} />
          <span>File</span>
          <ChevronDown size={10} />
        </div>
        {#if activeMenu === 'file'}
          <div class="menu-dropdown">
            <button class="menu-dropdown-item" on:click={triggerFileSelect}>
              <FolderOpen size={13} /> Open STL...
            </button>
            <button class="menu-dropdown-item" on:click={() => {}}>
              <Save size={13} /> Save Project
            </button>
            <button class="menu-dropdown-item" on:click={() => {}}>
              <FolderOpen size={13} /> Load Project
            </button>
            <div class="menu-divider"></div>
            <button class="menu-dropdown-item" on:click={handleDownloadGcode} disabled={!$sliceResult}>
              <Download size={13} /> Export G-Code
            </button>
            <button class="menu-dropdown-item" on:click={() => showGcodeViewer.set(true)} disabled={!$sliceResult}>
              <FileText size={13} /> View G-Code
            </button>
          </div>
        {/if}
      </div>

      <!-- Edit Menu -->
      <div class="menu-item-wrapper">
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div class="menu-item" on:click={() => toggleMenu('edit')}>
          <Settings size={13} />
          <span>Edit</span>
          <ChevronDown size={10} />
        </div>
        {#if activeMenu === 'edit'}
          <div class="menu-dropdown">
            <button class="menu-dropdown-item" on:click={() => showSearchDialog.set(true)}>
              <Search size={13} /> Search Settings <span class="shortcut-hint">Ctrl+K</span>
            </button>
            <div class="menu-divider"></div>
            <button class="menu-dropdown-item" on:click={() => {}}>
              <Scissors size={13} /> Undo
            </button>
            <button class="menu-dropdown-item" on:click={() => {}}>
              <Scissors size={13} /> Redo
            </button>
          </div>
        {/if}
      </div>

      <!-- Settings Menu -->
      <div class="menu-item-wrapper">
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div class="menu-item" on:click={() => toggleMenu('settings')}>
          <Settings size={13} />
          <span>Settings</span>
          <ChevronDown size={10} />
        </div>
        {#if activeMenu === 'settings'}
          <div class="menu-dropdown">
            <button class="menu-dropdown-item" on:click={() => showCalibrationDialog.set(true)}>
              <Gauge size={13} /> Calibration
            </button>
            <div class="menu-divider"></div>
            <button class="menu-dropdown-item" on:click={toggleTheme}>
              {#if $theme === 'dark'}
                <Sun size={13} /> Light Mode
              {:else}
                <Moon size={13} /> Dark Mode
              {/if}
            </button>
          </div>
        {/if}
      </div>

      <!-- Help Menu -->
      <div class="menu-item-wrapper">
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div class="menu-item" on:click={() => toggleMenu('help')}>
          <HelpCircle size={13} />
          <span>Help</span>
          <ChevronDown size={10} />
        </div>
        {#if activeMenu === 'help'}
          <div class="menu-dropdown">
            <button class="menu-dropdown-item" on:click={() => {}}>
              <HelpCircle size={13} /> About SeSpark
            </button>
            <button class="menu-dropdown-item" on:click={() => {}}>
              <FileText size={13} /> Documentation
            </button>
          </div>
        {/if}
      </div>

      <input
        type="file"
        accept=".stl"
        bind:this={fileInput}
        on:change={handleFileChange}
        style="display: none;"
      />
    </nav>

    <!-- Profile Selectors (Printer / Filament / Process) -->
    <div class="profile-selectors">
      <!-- Printer Selector -->
      <div class="dropdown-wrapper printer-selector-wrapper">
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div class="selector-dropdown" on:click={togglePrinterDropdown}>
          <Printer size={13} class="text-secondary" />
          <span class="selector-value">
            {$selectedPrinter
              ? getPrinterLabel($selectedPrinter)
              : "Select Printer"}
          </span>
          <ChevronDown size={10} class="dropdown-chevron" />
        </div>

        {#if showPrinterDropdown}
          <div class="dropdown-panel printer-panel">
            <div class="dropdown-search-box">
              <Search size={13} class="search-icon" />
              <input
                type="text"
                placeholder="Search printers..."
                bind:value={printerSearch}
                class="dropdown-search-input"
              />
            </div>
            <div class="dropdown-list">
              {#each filteredBrandEntries as [brand, printers]}
                <div class="brand-group">
                  <div class="brand-header">{brand}</div>
                  {#each printers as printer}
                    <button
                      class="dropdown-item"
                      class:selected={$selectedPrinterId === printer.id}
                      on:click={() => selectPrinter(printer)}
                    >
                      <span class="dropdown-item-name">{printer.machine_name}</span>
                      {#if $selectedPrinterId === printer.id}
                        <Check size={12} class="check-icon" />
                      {/if}
                    </button>
                  {/each}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <!-- Filament Selector -->
      <div class="dropdown-wrapper">
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div class="selector-dropdown" on:click={toggleFilamentDropdown}>
          <Droplets size={13} class="text-secondary" />
          <span class="selector-value">{$selectedFilament}</span>
          <ChevronDown size={10} class="dropdown-chevron" />
        </div>

        {#if showFilamentDropdown}
          <div class="dropdown-panel">
            <div class="dropdown-search-box">
              <Search size={13} class="search-icon" />
              <input
                type="text"
                placeholder="Search filaments..."
                bind:value={filamentSearch}
                class="dropdown-search-input"
              />
            </div>
            <div class="dropdown-list">
              {#each filteredFilaments as filament}
                <button
                  class="dropdown-item"
                  class:selected={$selectedFilament === filament}
                  on:click={() => selectFilament(filament)}
                >
                  <span class="dropdown-item-name">{filament}</span>
                  {#if $selectedFilament === filament}
                    <Check size={12} class="check-icon" />
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <!-- Process Preset Selector -->
      <div class="dropdown-wrapper">
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div class="selector-dropdown" on:click={toggleProcessDropdown}>
          <Sliders size={13} class="text-secondary" />
          <span class="selector-value">{$selectedProcessPreset}</span>
          <ChevronDown size={10} class="dropdown-chevron" />
        </div>

        {#if showProcessDropdown}
          <div class="dropdown-panel">
            <div class="dropdown-search-box">
              <Search size={13} class="search-icon" />
              <input
                type="text"
                placeholder="Search process presets..."
                bind:value={processSearch}
                class="dropdown-search-input"
              />
            </div>
            <div class="dropdown-list">
              {#each filteredProcesses as preset}
                <button
                  class="dropdown-item"
                  class:selected={$selectedProcessPreset === preset}
                  on:click={() => selectProcess(preset)}
                >
                  <span class="dropdown-item-name">{preset}</span>
                  {#if $selectedProcessPreset === preset}
                    <Check size={12} class="check-icon" />
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <!-- Slice Button -->
      <button
        class="btn btn-primary"
        on:click={onSlice}
        disabled={!$stlFileBytes || $slicingStatus === 'slicing'}
        title="Slice the current plate"
      >
        {#if $slicingStatus === 'slicing'}
          <span class="spinner"></span>
          <span>Slicing...</span>
        {:else}
          <Play size={14} />
          <span>Slice Plate</span>
        {/if}
      </button>

      <!-- Export G-Code -->
      <button
        class="btn btn-secondary"
        on:click={handleDownloadGcode}
        disabled={!$sliceResult}
        title="Export G-Code file"
      >
        <Download size={14} />
      </button>

      <!-- View G-Code -->
      <button
        class="btn btn-secondary"
        on:click={() => showGcodeViewer.set(true)}
        disabled={!$sliceResult}
        title="View G-Code"
      >
        <Code size={14} />
      </button>

      <!-- Search -->
      <button
        class="btn btn-icon-only"
        on:click={() => showSearchDialog.set(true)}
        title="Search (Ctrl+K)"
      >
        <Search size={14} />
      </button>

      <!-- Theme Toggle -->
      <button class="btn btn-icon-only" on:click={toggleTheme} title="Toggle theme">
        {#if $theme === 'dark'}
          <Sun size={14} />
        {:else}
          <Moon size={14} />
        {/if}
      </button>
    </div>
  </div>

  <!-- Bottom line: Tab switcher + Plate selector -->
  <div class="navbar-bottom">
    <!-- Tab Switcher (Prepare / Preview / Device) -->
    <nav class="tab-switcher">
      {#each tabs as tab}
        <button
          class="tab-btn"
          class:active={$activeTab === tab.id}
          on:click={() => activeTab.set(tab.id)}
        >
          <svelte:component this={tab.icon} size={13} />
          <span>{tab.label}</span>
        </button>
      {/each}
    </nav>

    <!-- Plate Selector (multi-plate support) -->
    <PlateSelector />
  </div>
</header>

<style>
  .navbar {
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg-sidebar);
    border-bottom: 1px solid var(--color-border);
    user-select: none;
    z-index: 100;
  }

  /* ─── Top Row ─────────────────────────────────────────────────────── */
  .navbar-top {
    display: flex;
    align-items: center;
    height: 44px;
    padding: 0 12px;
    gap: 8px;
  }

  .logo-area {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .app-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.3px;
  }

  /* ─── Menu Bar ────────────────────────────────────────────────────── */
  .menu-bar {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .menu-item-wrapper {
    position: relative;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 12px;
    color: var(--color-text-secondary);
    transition: all 0.15s ease;
  }

  .menu-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--color-text-primary);
  }

  .menu-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    min-width: 200px;
    background-color: var(--color-bg-sidebar);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    z-index: 300;
    padding: 4px;
  }

  .menu-dropdown-item {
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
    border-radius: 4px;
    transition: background-color 0.1s ease;
  }

  .menu-dropdown-item:hover {
    background-color: rgba(255, 255, 255, 0.04);
  }

  .menu-dropdown-item:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .menu-divider {
    height: 1px;
    background-color: var(--color-border);
    margin: 4px 8px;
  }

  .shortcut-hint {
    margin-left: auto;
    font-size: 10px;
    color: var(--color-text-muted);
  }

  /* ─── Profile Selectors ───────────────────────────────────────────── */
  .profile-selectors {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  .dropdown-wrapper {
    position: relative;
  }

  .selector-dropdown {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px;
    background-color: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.15s ease;
    max-width: 180px;
  }

  .selector-dropdown:hover {
    border-color: var(--color-accent);
  }

  .selector-value {
    font-size: 11px;
    font-weight: 500;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .dropdown-chevron {
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .dropdown-panel {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    min-width: 260px;
    background-color: var(--color-bg-sidebar);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    z-index: 300;
    overflow: hidden;
  }

  .printer-panel {
    min-width: 300px;
  }

  .dropdown-search-box {
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

  .dropdown-search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--color-text-primary);
    font-size: 12px;
  }

  .dropdown-search-input::placeholder {
    color: var(--color-text-muted);
  }

  .dropdown-list {
    max-height: 280px;
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

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 10px;
    background: transparent;
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
    color: var(--color-text-primary);
    font-size: 12px;
    transition: background-color 0.1s ease;
  }

  .dropdown-item:hover {
    background-color: rgba(255, 255, 255, 0.04);
  }

  .dropdown-item.selected {
    background-color: rgba(0, 229, 117, 0.08);
    color: var(--color-accent);
  }

  .dropdown-item-name {
    flex: 1;
  }

  .check-icon {
    color: var(--color-accent);
    flex-shrink: 0;
  }

  /* ─── Action Buttons ──────────────────────────────────────────────── */
  .action-buttons {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .btn-primary {
    background-color: var(--color-accent);
    color: #0b0f19;
    border-color: var(--color-accent);
  }

  .btn-primary:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  .btn-primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn-secondary {
    background-color: rgba(255, 255, 255, 0.04);
    color: var(--color-text-secondary);
    border-color: var(--color-border);
  }

  .btn-secondary:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.08);
    color: var(--color-text-primary);
  }

  .btn-secondary:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .btn-icon-only {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-icon-only:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--color-text-primary);
  }

  .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid rgba(11, 15, 25, 0.2);
    border-top-color: #0b0f19;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ─── Bottom Row ──────────────────────────────────────────────────── */
  .navbar-bottom {
    display: flex;
    align-items: center;
    height: 36px;
    padding: 0 12px;
    gap: 12px;
    border-top: 1px solid var(--color-border);
  }

  .tab-switcher {
    display: flex;
    gap: 2px;
  }

  .tab-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    background: transparent;
    border: 1px solid transparent;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    color: var(--color-text-muted);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.15s ease;
    border-radius: 5px 5px 0 0;
  }

  .tab-btn:hover {
    color: var(--color-text-secondary);
    background-color: rgba(255, 255, 255, 0.03);
  }

  .tab-btn.active {
    color: var(--color-accent);
    border-bottom-color: var(--color-accent);
  }
</style>
