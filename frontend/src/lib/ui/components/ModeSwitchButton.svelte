<script lang="ts">
  /**
   * ModeSwitchButton - Port of OrcaSlicer's ModeSwitchButton widget.
   * A segmented control with multiple selectable options (like Simple/Advanced/Expert).
   */

  export let selections: string[] = ['Simple', 'Advanced', 'Expert'];
  export let selection: number = 0;
  export let disabled: boolean = false;
  export let devMode: boolean = false;
  export let className: string = '';

  // Colors
  export let activeColor: string = '#007bff';
  export let dimmedColor: string = '#e0e0e0';
  export let textColor: string = '#333333';
  export let trackBackground: string = '#f5f5f5';
  export let trackBorder: string = '#d0d0d0';

  // Events
  export let onchange: ((selection: number) => void) | undefined = undefined;

  function select(index: number) {
    if (disabled) return;
    if (index === selection) return;
    selection = index;
    if (onchange) onchange(selection);
  }

  function handleKeyDown(e: KeyboardEvent, index: number) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select(index);
    }
  }
</script>

<div
  class="mode-switch {className}"
  class:disabled
  role="radiogroup"
  style="
    --ms-active: {activeColor};
    --ms-dimmed: {dimmedColor};
    --ms-text: {textColor};
    --ms-bg: {trackBackground};
    --ms-border: {trackBorder};
    --ms-count: {selections.length};
  "
>
  {#each selections as item, i}
    <button
      class="mode-switch-item"
      class:active={i === selection}
      class:inactive={i !== selection}
      role="radio"
      aria-checked={i === selection}
      {disabled}
      on:click={() => select(i)}
      on:keydown={(e) => handleKeyDown(e, i)}
      style="
        --item-index: {i};
      "
    >
      {item}
    </button>
  {/each}
  <div
    class="mode-switch-thumb"
    style="
      --thumb-width: {100 / selections.length}%;
      --thumb-offset: {selection * (100 / selections.length)}%;
    "
  ></div>
</div>

<style>
  .mode-switch {
    position: relative;
    display: inline-flex;
    border-radius: 8px;
    background: var(--ms-bg);
    border: 1px solid var(--ms-border);
    overflow: hidden;
    padding: 2px;
    gap: 2px;
  }

  .mode-switch.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .mode-switch-item {
    position: relative;
    z-index: 1;
    flex: 1;
    padding: 6px 16px;
    border: none;
    background: transparent;
    color: var(--ms-text);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    outline: none;
    transition: color 0.15s ease;
    text-align: center;
    white-space: nowrap;
  }

  .mode-switch-item.active {
    color: white;
  }

  .mode-switch-item:focus-visible {
    text-decoration: underline;
  }

  .mode-switch-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: var(--thumb-width);
    height: calc(100% - 4px);
    border-radius: 6px;
    background: var(--ms-active);
    transform: translateX(0%);
    transition: transform 0.2s ease, width 0.2s ease;
    transform: translateX(calc(var(--thumb-offset, 0%) - 0%));
    z-index: 0;
  }

  /* Override thumb position based on selection */
  .mode-switch-item:nth-child(1).active ~ .mode-switch-thumb { transform: translateX(0%); }
  .mode-switch-item:nth-child(2).active ~ .mode-switch-thumb { transform: translateX(100%); }
  .mode-switch-item:nth-child(3).active ~ .mode-switch-thumb { transform: translateX(200%); }
  .mode-switch-item:nth-child(4).active ~ .mode-switch-thumb { transform: translateX(300%); }
  .mode-switch-item:nth-child(5).active ~ .mode-switch-thumb { transform: translateX(400%); }
</style>
