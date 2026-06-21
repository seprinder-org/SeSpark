<script lang="ts">
  import { onMount } from "svelte";
  import Navbar from "./lib/components/Navbar.svelte";
  import Sidebar from "./lib/components/Sidebar.svelte";
  import Viewport from "./lib/components/Viewport.svelte";
  import StatsPanel from "./lib/components/StatsPanel.svelte";
  import DeviceDashboard from "./lib/components/DeviceDashboard.svelte";
  import GcodeViewer from "./lib/components/GcodeViewer.svelte";
  import {
    activeTab,
    slicerSettings,
    stlFileBytes,
    stlFileName,
    slicingStatus,
    sliceResult,
    currentLayerIndex,
    theme,
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
      } catch (e) {
        console.error("Slicing failed:", e);
        slicingStatus.set("idle");
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
            stlFileBytes.set(new Uint8Array(arrayBuffer));
            slicingStatus.set("idle");
            sliceResult.set(null);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert("Please drop a valid 3D model file (.stl)");
      }
    }
  }
</script>

<svelte:head>
  <title>SeSpark - Sponsored by spd</title>
</svelte:head>

<div
  class="app-container {$theme}"
  class:drag-overlay={isDragOver}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
>
  <!-- Slicer Navigation Bar -->
  <Navbar onSlice={handleSlice} />

  <!-- Workspace view switcher -->
  <main class="workspace">
    {#if $activeTab === "prepare"}
      <!-- Prepare Workspace: Settings panel on left, 3D viewport on right -->
      <div class="workspace-layout">
        <Sidebar />
        <Viewport />
      </div>
    {:else}
      <!-- Preview Workspace: 3D Viewport in middle, stats pane on right -->
      {#if $activeTab === "preview"}
        <div class="workspace-layout">
          <Viewport />
          <StatsPanel />
        </div>
      {:else}
        <!-- Device Workspace: Full print dashboard control -->
        <DeviceDashboard />
      {/if}
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
