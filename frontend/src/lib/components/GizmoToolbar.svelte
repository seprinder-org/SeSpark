<script lang="ts">
  /**
   * GizmoToolbar - Matches OrcaSlicer's gizmo toolbar in the 3D viewport.
   * Provides tools for manipulating 3D objects: Move, Rotate, Scale, Cut,
   * and view controls like zoom-to-fit, perspective/orthogonal toggle.
   */
  import {
    Move3d,
    Rotate3d,
    Maximize,
    Scissors,
    Ruler,
    Eye,
    Grid3x3,
    Camera,
    Crosshair,
    ZoomIn,
  } from 'lucide-svelte';

  export let activeGizmo: string = 'move';
  export let showGrid = true;
  export let isPerspective = true;

  export let onGizmoChange: (gizmo: string) => void = () => {};
  export let onToggleGrid: () => void = () => {};
  export let onTogglePerspective: () => void = () => {};
  export let onZoomToFit: () => void = () => {};
  export let onResetView: () => void = () => {};

  interface GizmoItem {
    id: string;
    label: string;
    icon: any;
    shortcut?: string;
  }

  const gizmos: GizmoItem[] = [
    { id: 'move', label: 'Move', icon: Move3d, shortcut: 'G' },
    { id: 'rotate', label: 'Rotate', icon: Rotate3d, shortcut: 'R' },
    { id: 'scale', label: 'Scale', icon: Maximize, shortcut: 'S' },
    { id: 'cut', label: 'Cut', icon: Scissors, shortcut: 'C' },
    { id: 'measure', label: 'Measure', icon: Ruler, shortcut: 'M' },
  ];

  const viewControls: GizmoItem[] = [
    { id: 'zoom-to-fit', label: 'Zoom to Fit', icon: ZoomIn },
    { id: 'reset-view', label: 'Reset View', icon: Crosshair },
  ];
</script>

<div class="gizmo-toolbar">
  <!-- Main Gizmo Tools -->
  <div class="toolbar-group">
    {#each gizmos as gizmo}
      <button
        class="toolbar-btn"
        class:active={activeGizmo === gizmo.id}
        on:click={() => onGizmoChange(gizmo.id)}
        title="{gizmo.label} ({gizmo.shortcut})"
      >
        <svelte:component this={gizmo.icon} size={16} />
        <span class="tooltip-text">{gizmo.label}</span>
      </button>
    {/each}
  </div>

  <div class="toolbar-divider"></div>

  <!-- View Controls -->
  <div class="toolbar-group">
    <button
      class="toolbar-btn"
      class:active={showGrid}
      on:click={onToggleGrid}
      title="Toggle Grid"
    >
      <Grid3x3 size={16} />
    </button>
    <button
      class="toolbar-btn"
      class:active={isPerspective}
      on:click={onTogglePerspective}
      title="Toggle Perspective/Orthogonal"
    >
      <Camera size={16} />
    </button>
    {#each viewControls as ctrl}
      <button
        class="toolbar-btn"
        on:click={() => {
          if (ctrl.id === 'zoom-to-fit') onZoomToFit();
          if (ctrl.id === 'reset-view') onResetView();
        }}
        title={ctrl.label}
      >
        <svelte:component this={ctrl.icon} size={16} />
      </button>
    {/each}
  </div>
</div>

<style>
  .gizmo-toolbar {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    background-color: var(--color-bg-sidebar);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 4px;
    z-index: 50;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .toolbar-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .toolbar-divider {
    height: 1px;
    background-color: var(--color-border);
    margin: 2px 4px;
  }

  .toolbar-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .toolbar-btn:hover {
    background-color: rgba(255, 255, 255, 0.06);
    color: var(--color-text-primary);
  }

  .toolbar-btn.active {
    background-color: rgba(0, 229, 117, 0.12);
    color: var(--color-accent);
    border-color: rgba(0, 229, 117, 0.25);
  }

  .tooltip-text {
    display: none;
    position: absolute;
    left: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
    background-color: var(--color-bg-sidebar);
    border: 1px solid var(--color-border);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    color: var(--color-text-primary);
    white-space: nowrap;
    z-index: 100;
    pointer-events: none;
  }

  .toolbar-btn:hover .tooltip-text {
    display: block;
  }
</style>
