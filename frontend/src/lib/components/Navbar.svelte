<script lang="ts">
  import {
    activeTab,
    selectedPrinter,
    selectedFilament,
    stlFileBytes,
    slicingStatus,
    sliceResult,
    showGcodeViewer,
    stlFileName,
    slicerSettings,
    theme,
  } from "../store";
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
  } from "lucide-svelte";

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
          stlFileBytes.set(new Uint8Array(arrayBuffer));
          slicingStatus.set("idle");
          sliceResult.set(null);
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
</script>

<header class="navbar">
  <!-- Top line: Logo, Menus, Quick Settings -->
  <div class="navbar-top">
    <div class="logo-area">
      <div class="logo-icon">
        <Activity size={20} color="#00e575" strokeWidth={2.5} />
      </div>
      <span class="app-title">SeSpark v1.0.7</span>
    </div>

    <!-- Menus -->
    <nav class="menu-bar">
      <div class="menu-item" on:click={triggerFileSelect}>
        <FolderOpen size={14} />
        <span>File</span>
      </div>
      <div class="menu-item">Edit</div>
      <div class="menu-item">Settings</div>
      <div class="menu-item">Help</div>
      <input
        type="file"
        accept=".stl"
        bind:this={fileInput}
        on:change={handleFileChange}
        style="display: none;"
      />
    </nav>

    <!-- Profiles selectors -->
    <div class="profile-selectors">
      <!-- Printer Selector -->
      <div class="selector-box">
        <span class="selector-label">Printer</span>
        <div class="selector-dropdown">
          <Printer size={14} class="text-secondary" />
          <select bind:value={$selectedPrinter}>
            <option value="SeSpark CoreXY 256"
              >SeSpark CoreXY 256 (0.4 nozzle)</option
            >
            <option value="Bambu Lab X1 Carbon"
              >Bambu Lab X1C (0.4 nozzle)</option
            >
            <option value="Creality Ender-3 v3"
              >Creality Ender-3 v3 (0.4 nozzle)</option
            >
          </select>
          <ChevronDown size={12} class="dropdown-chevron" />
        </div>
      </div>

      <!-- Filament Selector -->
      <div class="selector-box">
        <span class="selector-label">Filament</span>
        <div class="selector-dropdown">
          <Layers size={14} class="text-secondary" />
          <select bind:value={$selectedFilament}>
            <option value="Generic PLA @SeSpark">Generic PLA @SeSpark</option>
            <option value="Generic PETG @SeSpark">Generic PETG @SeSpark</option>
            <option value="Generic ABS @SeSpark">Generic ABS @SeSpark</option>
          </select>
          <ChevronDown size={12} class="dropdown-chevron" />
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="action-buttons">
      {#if $slicingStatus === "slicing"}
        <button class="btn btn-slice loading" disabled>
          <div class="spinner"></div>
          Slicing...
        </button>
      {:else}
        <button
          class="btn btn-slice"
          disabled={!$stlFileBytes}
          on:click={onSlice}
          title={!$stlFileBytes
            ? "Please load an STL model first"
            : "Slice the 3D model"}
        >
          <Play size={15} fill="currentColor" />
          Slice Plate
        </button>
      {/if}

      {#if $sliceResult}
        <button
          class="btn btn-secondary"
          on:click={() => showGcodeViewer.set(true)}
          title="View G-Code Output"
        >
          <Code size={15} />
          View G-Code
        </button>
        <button
          class="btn btn-primary"
          on:click={handleDownloadGcode}
          title="Export .gcode to disk"
        >
          <Download size={15} />
          Export G-Code
        </button>
      {/if}

      <!-- Theme Toggle Button -->
      <button
        class="btn btn-theme-toggle"
        on:click={() => theme.update((t) => (t === "dark" ? "light" : "dark"))}
        title={$theme === "dark"
          ? "Switch to Light Mode"
          : "Switch to Dark Mode"}
      >
        {#if $theme === "dark"}
          <Sun size={15} />
        {:else}
          <Moon size={15} />
        {/if}
      </button>
    </div>
  </div>

  <!-- Bottom line: Project tab switchers -->
  <div class="navbar-bottom">
    <div class="tab-list">
      <button
        class="tab-btn"
        class:active={$activeTab === "prepare"}
        on:click={() => activeTab.set("prepare")}
      >
        <Sliders size={14} />
        <span>Prepare</span>
      </button>
      <button
        class="tab-btn"
        class:active={$activeTab === "preview"}
        disabled={!$sliceResult}
        on:click={() => activeTab.set("preview")}
        title={!$sliceResult ? "Slice model first to enable Preview" : ""}
      >
        <Layers size={14} />
        <span>Preview</span>
      </button>
      <button
        class="tab-btn"
        class:active={$activeTab === "device"}
        on:click={() => activeTab.set("device")}
      >
        <Cpu size={14} />
        <span>Device</span>
      </button>
    </div>

    <!-- File loaded display -->
    <div class="file-loaded-status">
      {#if $stlFileName}
        <span class="active-file-name" title={$stlFileName}
          >Model: {$stlFileName}</span
        >
      {:else}
        <span class="inactive-file-name"
          >No Model Loaded. Please import or drag an STL file.</span
        >
      {/if}
    </div>
  </div>
</header>

<style>
  /* Header styling */
  .navbar {
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg-navbar);
    border-bottom: 1px solid var(--color-border);
    user-select: none;
    z-index: 100;
  }

  .navbar-top {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .logo-area {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
    background: rgba(0, 229, 117, 0.1);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(0, 229, 117, 0.2);
  }

  .app-title {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--color-text-primary);
  }

  .accent-text {
    color: var(--color-accent);
  }

  .menu-bar {
    display: flex;
    gap: 16px;
    margin-left: 24px;
  }

  .menu-item {
    font-size: 13px;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .menu-item:hover {
    color: var(--color-text-primary);
    background-color: rgba(255, 255, 255, 0.05);
  }

  .profile-selectors {
    display: flex;
    gap: 16px;
    margin-left: auto;
    margin-right: 20px;
  }

  .selector-box {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .selector-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--color-text-muted);
  }

  .selector-dropdown {
    position: relative;
    display: flex;
    align-items: center;
    background-color: var(--color-bg-input);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 0 24px 0 8px;
    height: 28px;
    min-width: 190px;
    color: var(--color-text-primary);
    transition: border-color 0.15s ease;
  }

  .selector-dropdown:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  .selector-dropdown select {
    background: transparent;
    border: none;
    outline: none;
    color: inherit;
    font-size: 12px;
    width: 100%;
    height: 100%;
    cursor: pointer;
    padding-left: 6px;
    -appearance: none;
    -webkit-appearance: none;
  }

  .dropdown-chevron {
    position: absolute;
    right: 8px;
    pointer-events: none;
    color: var(--color-text-secondary);
  }

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.15s ease;
  }

  .btn-slice {
    background-color: var(--color-accent);
    color: #0b0f19;
  }

  .btn-slice:hover:not(:disabled) {
    background-color: #00ff84;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 229, 117, 0.3);
  }

  .btn-slice:disabled {
    background-color: #2a2d35;
    color: #5b606e;
    cursor: not-allowed;
  }

  .btn-primary {
    background-color: #3b82f6;
    color: white;
  }

  .btn-primary:hover {
    background-color: #60a5fa;
  }

  .btn-secondary {
    background-color: #27272a;
    color: #e4e4e7;
    border: 1px solid #3f3f46;
  }

  .btn-secondary:hover {
    background-color: #3f3f46;
    color: white;
  }

  .btn-theme-toggle {
    background-color: var(--color-bg-input);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
    padding: 0 10px;
    height: 32px;
  }

  .btn-theme-toggle:hover {
    color: var(--color-text-primary);
    border-color: rgba(255, 255, 255, 0.2);
    background-color: rgba(255, 255, 255, 0.05);
  }

  :global(.light) .btn-secondary {
    background-color: #f1f5f9;
    color: #334155;
    border: 1px solid #cbd5e1;
  }

  :global(.light) .btn-secondary:hover {
    background-color: #e2e8f0;
    color: #0f172a;
  }

  :global(.light) .btn-theme-toggle:hover {
    background-color: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.15);
  }

  /* Slicing spinner */
  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid #0b0f19;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Bottom Row styling */
  .navbar-bottom {
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background-color: rgba(0, 0, 0, 0.15);
  }

  .tab-list {
    display: flex;
    height: 100%;
  }

  .tab-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 100%;
    padding: 0 16px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--color-text-secondary);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .tab-btn:hover:not(:disabled) {
    color: var(--color-text-primary);
    background-color: rgba(255, 255, 255, 0.02);
  }

  .tab-btn.active {
    color: var(--color-accent);
    border-bottom-color: var(--color-accent);
    font-weight: 600;
  }

  .tab-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .file-loaded-status {
    font-size: 12px;
    color: var(--color-text-muted);
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .active-file-name {
    color: var(--color-accent);
    font-weight: 500;
  }

  .text-secondary {
    color: var(--color-text-secondary);
  }
</style>
