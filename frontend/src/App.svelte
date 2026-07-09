<script lang="ts">
  import { onMount } from "svelte";
  import Navbar from "./lib/components/Navbar.svelte";
  import Sidebar from "./lib/components/Sidebar.svelte";
  import Viewport from "./lib/components/Viewport.svelte";
  import PreviewPanel from "./lib/components/PreviewPanel.svelte";
  import DeviceDashboard from "./lib/components/DeviceDashboard.svelte";
  import GcodeViewer from "./lib/components/GcodeViewer.svelte";
  import SearchDialog from "./lib/components/SearchDialog.svelte";
  import CalibrationDialog from "./lib/components/CalibrationDialog.svelte";
  import NotificationPanel from "./lib/components/NotificationPanel.svelte";
  import {
    activeTab,
    slicerSettings,
    stlFileBytes,
    stlFileName,
    slicingStatus,
    sliceResult,
    currentLayerIndex,
    theme,
    showSearchDialog,
    showCalibrationDialog,
    addPlaterObject,
    selectPlaterObject,
    addNotification,
  } from "./lib/store";
  import initWasm, { slice_stl } from "./lib/wasm-engine/slicer_engine.js";
  import confetti from "canvas-confetti";

  let wasmLoaded = false;
  let isDragOver = false;

  // Initialize WASM
  onMount(async () => {
    try {
      await initWasm();
      wasmLoaded = true;
      console.log("Rust Slicer WASM Engine initialized successfully!");
    } catch (e) {
      console.error("Failed to load Rust Slicer WASM:", e);
    }
  });

  // Handle slice action
  function handleSlice() {
    if (!wasmLoaded) {
      alert("Slicing engine is still loading. Please wait a moment.");
      return;
    }
    if (!$stlFileBytes) return;

    slicingStatus.set("slicing");

    // Use a small timeout to let the DOM render the "Slicing..." loading spinner
    setTimeout(() => {
      try {
        const settingsStr = JSON.stringify($slicerSettings);

        console.time("Slicing time");
        const jsonResultStr = slice_stl($stlFileBytes!, settingsStr);
        console.timeEnd("Slicing time");

        const parsedResult = JSON.parse(jsonResultStr);
        sliceResult.set(parsedResult);
        slicingStatus.set("sliced");

        // Auto select the first layer for preview
        currentLayerIndex.set(parsedResult.layer_count - 1);

        // Auto-switch to Preview tab so user can see toolpath immediately!
        activeTab.set("preview");

        // Micro-animation celebration!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#00e575", "#3b82f6", "#ffffff"],
        });

        addNotification('success', `Slicing complete! ${parsedResult.layer_count} layers, ${(parsedResult.print_time_secs / 60).toFixed(0)} min print time.`);
      } catch (e) {
        console.error("Slicing failed:", e);
        slicingStatus.set("idle");
        addNotification('error', 'Slicing failed: ' + e);
        alert("Slicing error: " + e);
      }
    }, 100);
  }

  // Window drag & drop STL file import
  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragOver = true;
  }

  function handleDragLeave() {
    isDragOver = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragOver = false;

    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith(".stl")) {
        stlFileName.set(file.name);

        const reader = new FileReader();
        reader.onload = (evt) => {
          if (evt.target?.result) {
            const arrayBuffer = evt.target.result as ArrayBuffer;
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
      } else {
        alert("Please drop a valid 3D model file (.stl)");
      }
    }
  }

  // Keyboard shortcuts
  function handleKeydown(e: KeyboardEvent) {
    // Ctrl/Cmd + K: Open search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      showSearchDialog.set(true);
    }
    // Ctrl/Cmd + Shift + C: Open calibration
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'c') {
      e.preventDefault();
      showCalibrationDialog.set(true);
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
  <title>SeSpark - Sponsored by Seprinder</title>
</svelte:head>

<div
  class="app-container {$theme}"
  class:drag-overlay={isDragOver}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
>
  <!-- Navigation Bar (matches OrcaSlicer's top toolbar) -->
  <Navbar onSlice={handleSlice} />

  <!-- Workspace (matches OrcaSlicer's Plater area) -->
  <main class="workspace">
    {#if $activeTab === "prepare"}
      <!-- Prepare Workspace: Sidebar (object list + presets + params) + 3D Viewport -->
      <div class="workspace-layout">
        <Sidebar />
        <div class="viewport-area">
          <Viewport />
        </div>
      </div>
    {:else if $activeTab === "preview"}
      <!-- Preview Workspace: 3D Viewport + Preview Panel (GCode options) -->
      <div class="workspace-layout">
        <div class="viewport-area">
          <Viewport />
        </div>
        <PreviewPanel />
      </div>
    {:else if $activeTab === "device"}
      <!-- Device Workspace: Full print dashboard control -->
      <DeviceDashboard />
    {/if}
  </main>

  <!-- Drag overlay visual guide -->
  {#if isDragOver}
    <div class="drag-visual-guide">
      <div class="guide-box">
        <span class="guide-text">Drop STL File to Import Model</span>
      </div>
    </div>
  {/if}

  <!-- Gcode text viewer modal overlay -->
  <GcodeViewer />

  <!-- Search Dialog (Ctrl+K) -->
  <SearchDialog />

  <!-- Calibration Dialog -->
  <CalibrationDialog />

  <!-- Notification Panel (bottom-right) -->
  <NotificationPanel />
</div>

<style>
  /* App Root Layout */
  .app-container {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    background-color: var(--color-bg);
    color: var(--color-text-primary);
    overflow: hidden;
    position: relative;
  }

  .workspace {
    flex: 1;
    display: flex;
    overflow: hidden;
    height: calc(100vh - 88px); /* total height minus navbar height */
  }

  .workspace-layout {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .viewport-area {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  /* Drag overlay */
  .drag-visual-guide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(11, 15, 25, 0.85);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .guide-box {
    border: 3px dashed var(--color-accent);
    border-radius: 12px;
    padding: 40px;
    background-color: rgba(0, 229, 117, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }

  .guide-text {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-accent);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
</style>
