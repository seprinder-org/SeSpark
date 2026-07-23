<script lang="ts">
  /**
   * SwitchButton - Port of OrcaSlicer's SwitchButton widget.
   * A toggle switch with on/off labels and customizable colors.
   */

  export let value: boolean = false;
  export let labelOn: string = 'ON';
  export let labelOff: string = 'OFF';
  export let disabled: boolean = false;
  export let textColor: string = '#ffffff';
  export let textColor2: string = '#333333';
  export let trackColor: string = '#007bff';
  export let thumbColor: string = '#ffffff';
  export let className: string = '';

  // Events
  export let onchange: ((value: boolean) => void) | undefined = undefined;

  function toggle() {
    if (disabled) return;
    value = !value;
    if (onchange) onchange(value);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  }
</script>

<button
  class="switch-button {className}"
  class:on={value}
  class:off={!value}
  class:disabled
  role="switch"
  aria-checked={value}
  {disabled}
  on:click={toggle}
  on:keydown={handleKeyDown}
  style="
    --switch-track: {trackColor};
    --switch-thumb: {thumbColor};
    --switch-text-on: {textColor};
    --switch-text-off: {textColor2};
  "
>
  <span class="switch-label switch-label-on">{labelOn}</span>
  <span class="switch-thumb"></span>
  <span class="switch-label switch-label-off">{labelOff}</span>
</button>

<style>
  .switch-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 52px;
    height: 26px;
    border-radius: 13px;
    border: none;
    padding: 0;
    cursor: pointer;
    background: #e0e0e0;
    transition: background 0.2s ease;
    outline: none;
    overflow: hidden;
  }

  .switch-button.on {
    background: var(--switch-track);
  }

  .switch-button.off {
    background: #e0e0e0;
  }

  .switch-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .switch-button:focus-visible {
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.4);
  }

  .switch-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--switch-thumb);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease;
    z-index: 1;
  }

  .switch-button.on .switch-thumb {
    transform: translateX(26px);
  }

  .switch-label {
    position: absolute;
    font-size: 9px;
    font-weight: 600;
    line-height: 1;
    z-index: 0;
    transition: opacity 0.15s ease;
  }

  .switch-label-on {
    left: 6px;
    color: var(--switch-text-on);
    opacity: 0;
  }

  .switch-button.on .switch-label-on {
    opacity: 1;
  }

  .switch-label-off {
    right: 6px;
    color: var(--switch-text-off);
    opacity: 1;
  }

  .switch-button.on .switch-label-off {
    opacity: 0;
  }
</style>
