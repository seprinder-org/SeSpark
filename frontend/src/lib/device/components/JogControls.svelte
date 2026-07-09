<script lang="ts">
  /**
   * JogControls - Manual X/Y/Z movement controls
   * Maps to: DevCtrl (command interface for manual movement)
   */
  import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, Move3d } from 'lucide-svelte';

  export let onMove: (axis: 'x' | 'y' | 'z', direction: '+' | '-') => void = () => {};
  export let onHome: (axis: 'x' | 'y' | 'z' | 'all') => void = () => {};
  export let disabled = false;

  let moveDistance = 10; // mm
  const distances = [0.1, 1, 10, 50, 100];
</script>

<div class="panel">
  <div class="panel-header-device">
    <Move3d size={16} color="#a78bfa" />
    <span>Jog Controls</span>
  </div>

  <div class="distance-selector">
    <span class="dist-lbl">Step:</span>
    <div class="dist-btns">
      {#each distances as d}
        <button
          class="dist-btn"
          class:active={moveDistance === d}
          on:click={() => (moveDistance = d)}
          disabled={disabled}
        >{d < 1 ? d : d}mm</button>
      {/each}
    </div>
  </div>

  <div class="jog-grid">
    <!-- XY pad -->
    <div class="xy-pad">
      <div class="xy-row">
        <button class="jog-btn" on:click={() => onMove('y', '+')} disabled={disabled} title="Y+">
          <ArrowUp size={18} />
        </button>
      </div>
      <div class="xy-row">
        <button class="jog-btn" on:click={() => onMove('x', '-')} disabled={disabled} title="X-">
          <ArrowLeft size={18} />
        </button>
        <button class="jog-btn home-btn" on:click={() => onHome('all')} disabled={disabled} title="Home All">
          <Home size={16} />
        </button>
        <button class="jog-btn" on:click={() => onMove('x', '+')} disabled={disabled} title="X+">
          <ArrowRight size={18} />
        </button>
      </div>
      <div class="xy-row">
        <button class="jog-btn" on:click={() => onMove('y', '-')} disabled={disabled} title="Y-">
          <ArrowDown size={18} />
        </button>
      </div>
    </div>

    <!-- Z controls -->
    <div class="z-controls">
      <button class="jog-btn z-btn" on:click={() => onMove('z', '+')} disabled={disabled} title="Z+">
        <ArrowUp size={18} />
        <span class="axis-label">Z</span>
      </button>
      <button class="jog-btn z-btn" on:click={() => onMove('z', '-')} disabled={disabled} title="Z-">
        <ArrowDown size={18} />
        <span class="axis-label">Z</span>
      </button>
      <button class="jog-btn home-btn" on:click={() => onHome('z')} disabled={disabled} title="Home Z">
        <Home size={14} />
      </button>
    </div>
  </div>
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
    margin-bottom: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    padding-bottom: 8px;
  }

  .distance-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .dist-lbl {
    font-size: 11px;
    color: var(--color-text-muted);
    font-weight: 600;
    flex-shrink: 0;
  }

  .dist-btns {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .dist-btn {
    background-color: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 3px 8px;
    font-size: 10px;
    font-weight: 600;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s ease;
  }

  .dist-btn:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.08);
    color: var(--color-text-primary);
  }

  .dist-btn.active {
    background-color: rgba(167, 139, 250, 0.15);
    border-color: rgba(167, 139, 250, 0.3);
    color: #a78bfa;
  }

  .dist-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .jog-grid {
    display: flex;
    gap: 12px;
    justify-content: center;
    align-items: center;
  }

  .xy-pad {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .xy-row {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .z-controls {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
  }

  .jog-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
  }

  .jog-btn:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--color-text-primary);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .jog-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .jog-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .home-btn {
    width: 36px;
    height: 36px;
    background-color: rgba(167, 139, 250, 0.08);
    border-color: rgba(167, 139, 250, 0.2);
    color: #a78bfa;
  }

  .home-btn:hover:not(:disabled) {
    background-color: rgba(167, 139, 250, 0.2);
  }

  .z-btn {
    width: 44px;
    height: 44px;
    flex-direction: column;
    gap: 2px;
  }

  .axis-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
  }
</style>
