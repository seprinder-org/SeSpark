<script lang="ts">
  /**
   * SwitchBoard - Port of OrcaSlicer's SwitchBoard widget.
   * A simple two-option toggle with left/right labels.
   */

  export let leftLabel: string = 'Left';
  export let rightLabel: string = 'Right';
  export let value: 'left' | 'right' = 'left';
  export let disabled: boolean = false;
  export let className: string = '';

  // Events
  export let onchange: ((value: 'left' | 'right') => void) | undefined = undefined;

  function toggle() {
    if (disabled) return;
    value = value === 'left' ? 'right' : 'left';
    if (onchange) onchange(value);
  }
</script>

<button
  class="switch-board {className}"
  class:left={value === 'left'}
  class:right={value === 'right'}
  class:disabled
  {disabled}
  on:click={toggle}
  style="
    --sb-left-label: '{leftLabel}';
    --sb-right-label: '{rightLabel}';
  "
>
  <span class="sb-label sb-left">{leftLabel}</span>
  <span class="sb-thumb"></span>
  <span class="sb-label sb-right">{rightLabel}</span>
</button>

<style>
  .switch-board {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 120px;
    height: 32px;
    border-radius: 16px;
    border: 1px solid #d0d0d0;
    background: #f5f5f5;
    cursor: pointer;
    padding: 2px;
    outline: none;
    transition: border-color 0.15s ease;
  }

  .switch-board.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .switch-board:focus-visible {
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.4);
  }

  .sb-thumb {
    position: absolute;
    top: 2px;
    width: calc(50% - 2px);
    height: calc(100% - 4px);
    border-radius: 14px;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s ease;
    z-index: 1;
  }

  .switch-board.left .sb-thumb {
    left: 2px;
  }

  .switch-board.right .sb-thumb {
    left: 2px;
    transform: translateX(100%);
  }

  .sb-label {
    position: relative;
    z-index: 2;
    flex: 1;
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    color: #666;
    transition: color 0.15s ease;
    user-select: none;
  }

  .switch-board.left .sb-left {
    color: #333;
    font-weight: 600;
  }

  .switch-board.right .sb-right {
    color: #333;
    font-weight: 600;
  }
</style>
