<script lang="ts">
  /**
   * PreviewPanel - Matches OrcaSlicer's GUI_Preview panel.
   * Provides GCode preview visualization options matching OptionType enum:
   * Travel, Wipe, Retractions, Seams, ToolChanges, ColorChanges,
   * PausePrints, CustomGCodes, Shells, ToolMarker, Legend
   */
  import {
    sliceResult,
    currentLayerIndex,
    currentLayerPointPercent,
    previewOptions,
    previewMaxLayers,
    stlFileName,
    slicerSettings,
    modelDimensions,
  } from '../store';
  import {
    Eye,
    EyeOff,
    Layers,
    Move3d,
    Eraser,
    CornerDownLeft,
    Crosshair,
    Wrench,
    Palette,
    Pause,
    Code,
    Box,
    Target,
    Info,
    Clock,
    Weight,
  } from 'lucide-svelte';

  // ─── Layer Slider ─────────────────────────────────────────────────────
  function handleLayerInput(e: Event) {
    const target = e.target as HTMLInputElement;
    currentLayerIndex.set(parseInt(target.value));
  }

  function handlePointInput(e: Event) {
    const target = e.target as HTMLInputElement;
    currentLayerPointPercent.set(parseInt(target.value));
  }

  // ─── Toggle preview option ────────────────────────────────────────────
  type PreviewOptionKey = keyof typeof defaultPreviewOptions;
  const defaultPreviewOptions = {
    showTravel: true,
    showWipe: true,
    showRetractions: true,
    showSeams: true,
    showToolChanges: true,
    showColorChanges: true,
    showPausePrints: true,
    showCustomGCodes: true,
    showShells: true,
    showToolMarker: true,
    showLegend: true,
  };

  function toggleOption(key: PreviewOptionKey) {
    previewOptions.update(opts => ({
      ...opts,
      [key]: !opts[key],
    }));
  }

  // ─── Format helpers ───────────────────────────────────────────────────
  function formatPrintTime(secs: number): string {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(' ');
  }

  interface OptionToggle {
    key: PreviewOptionKey;
    label: string;
    icon: any;
    color: string;
  }

  const optionToggles: OptionToggle[] = [
    { key: 'showTravel', label: 'Travel', icon: Move3d, color: '#3b82f6' },
    { key: 'showWipe', label: 'Wipe', icon: Eraser, color: '#8b5cf6' },
    { key: 'showRetractions', label: 'Retractions', icon: CornerDownLeft, color: '#f59e0b' },
    { key: 'showSeams', label: 'Seams', icon: Crosshair, color: '#ef4444' },
    { key: 'showToolChanges', label: 'Tool Changes', icon: Wrench, color: '#ec4899' },
    { key: 'showColorChanges', label: 'Color Changes', icon: Palette, color: '#06b6d4' },
    { key: 'showPausePrints', label: 'Pause Prints', icon: Pause, color: '#f97316' },
    { key: 'showCustomGCodes', label: 'Custom G-Codes', icon: Code, color: '#84cc16' },
    { key: 'showShells', label: 'Shells', icon: Box, color: '#22c55e' },
    { key: 'showToolMarker', label: 'Tool Marker', icon: Target, color: '#a855f7' },
    { key: 'showLegend', label: 'Legend', icon: Info, color: '#64748b' },
  ];
</script>

<div class="preview-panel">
  {#if $sliceResult}
    <!-- Layer Navigation -->
    <div class="preview-section">
      <div class="section-header">
        <Layers size={14} />
        <span class="section-title">Layer</span>
      </div>
      <div class="layer-controls">
        <div class="slider-group">
          <span class="slider-label">Layer {$currentLayerIndex + 1} / {$previewMaxLayers}</span>
          <input
            type="range"
            min="0"
            max={Math.max(0, $previewMaxLayers - 1)}
            value={$currentLayerIndex}
            on:input={handleLayerInput}
            class="layer-slider"
          />
        </div>
        <div class="slider-group">
          <span class="slider-label">Progress {$currentLayerPointPercent}%</span>
          <input
            type="range"
            min="0"
            max="100"
            value={$currentLayerPointPercent}
            on:input={handlePointInput}
            class="layer-slider"
          />
        </div>
      </div>
    </div>

    <!-- Print Statistics -->
    <div class="preview-section">
      <div class="section-header">
        <Clock size={14} />
        <span class="section-title">Statistics</span>
      </div>
      <div class="stats-grid">
        <div class="stat-row">
          <span class="stat-label">Print Time</span>
          <span class="stat-value">{formatPrintTime($sliceResult.print_time_secs)}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Filament</span>
          <span class="stat-value">{$sliceResult.filament_used_g.toFixed(2)}g / {($sliceResult.filament_used_mm / 1000).toFixed(2)}m</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Layers</span>
          <span class="stat-value">{$sliceResult.layer_count}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Model</span>
          <span class="stat-value">{$modelDimensions.x.toFixed(0)}×{$modelDimensions.y.toFixed(0)}×{$modelDimensions.z.toFixed(0)} mm</span>
        </div>
      </div>
    </div>

    <!-- Visualization Options (matching OrcaSlicer's OptionType) -->
    <div class="preview-section">
      <div class="section-header">
        <Eye size={14} />
        <span class="section-title">Visualization</span>
      </div>
      <div class="option-toggles">
        {#each optionToggles as opt}
          <button
            class="option-toggle"
            class:active={$previewOptions[opt.key]}
            on:click={() => toggleOption(opt.key)}
            title={opt.label}
          >
            <span class="toggle-indicator" style:background-color={$previewOptions[opt.key] ? opt.color : 'transparent'}></span>
            <svelte:component this={opt.icon} size={13} />
            <span class="toggle-label">{opt.label}</span>
          </button>
        {/each}
      </div>
    </div>
  {:else}
    <!-- Empty state when no slice result -->
    <div class="empty-preview">
      <EyeOff size={24} class="empty-icon" />
      <span class="empty-title">No Preview Available</span>
      <span class="empty-desc">Load an STL file and slice it to see the GCode preview here.</span>
    </div>
  {/if}
</div>

<style>
  .preview-panel {
    width: 260px;
    background-color: var(--color-bg-sidebar);
    border-left: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    user-select: none;
  }

  .preview-section {
    padding: 12px;
    border-bottom: 1px solid var(--color-border);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
    color: var(--color-text-primary);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-title {
    flex: 1;
  }

  .layer-controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .slider-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .slider-label {
    font-size: 11px;
    color: var(--color-text-secondary);
  }

  .layer-slider {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--color-border);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }

  .layer-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-accent);
    border: 2px solid var(--color-bg-sidebar);
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  }

  .stats-grid {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
  }

  .stat-label {
    color: var(--color-text-muted);
  }

  .stat-value {
    color: var(--color-text-primary);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .option-toggles {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .option-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 8px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 5px;
    cursor: pointer;
    width: 100%;
    text-align: left;
    color: var(--color-text-secondary);
    font-size: 12px;
    transition: all 0.15s ease;
  }

  .option-toggle:hover {
    background-color: rgba(255, 255, 255, 0.03);
    color: var(--color-text-primary);
  }

  .option-toggle.active {
    color: var(--color-text-primary);
  }

  .toggle-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1.5px solid var(--color-border);
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .toggle-label {
    flex: 1;
  }

  .empty-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 40px 20px;
    text-align: center;
  }

  .empty-icon {
    opacity: 0.3;
    color: var(--color-text-muted);
  }

  .empty-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  .empty-desc {
    font-size: 12px;
    color: var(--color-text-muted);
    line-height: 1.4;
  }
</style>
