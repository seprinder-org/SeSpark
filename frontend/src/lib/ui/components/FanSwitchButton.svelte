<script lang="ts">
  /**
   * FanSwitchButton - Port of OrcaSlicer's FanSwitchButton widget.
   * A fan control toggle with speed display and text modes (Fan / AirCondition).
   */

  export let value: boolean = false;
  export let labelOn: string = '';
  export let labelOff: string = '';
  export let imageOn: string = '';
  export let imageOff: string = '';
  export let padding: number = 4;
  export let textColor: string = '#333333';
  export let fanSpeed: number = 0;
  export let textMode: 'fan' | 'aircondition' = 'fan';
  export let disabled: boolean = false;
  export let className: string = '';

  // Events
  export let onchange: ((value: boolean) => void) | undefined = undefined;

  let isHovered = false;
  let isPressed = false;

  $: displayText = textMode === 'fan'
    ? (value ? `${fanSpeed}%` : 'OFF')
    : (value ? 'ON' : 'OFF');

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
  class="fan-switch {className}"
  class:on={value}
  class:off={!value}
  class:disabled
  class:hover={isHovered}
  class:pressed={isPressed}
  class:fan-mode={textMode === 'fan'}
  class:ac-mode={textMode === 'aircondition'}
  on:click={toggle}
  on:keydown={handleKeyDown}
  on:mouseenter={() => isHovered = true}
  on:mouseleave={() => { isHovered = false; isPressed = false; }}
  on:mousedown={() => isPressed = true}
  on:mouseup={() => isPressed = false}
  style="--fs-padding: {padding}px; --fs-text-color: {textColor};"
>
  {#if imageOn && imageOff}
    <span class="fs-image">
      <img src={value ? imageOn : imageOff} alt="" width="24" height="24" />
    </span>
  {/if}
  <span class="fs-label">{value ? labelOn : labelOff}</span>
  <span class="fs-speed">{displayText}</span>
</button>

<style>
  .fan-switch {
    display: inline-flex;
    align-items: center;
    gap: var(--fs-padding);
    padding: 6px 12px;
    border: 1px solid #d0d0d0;
    border-radius: 8px;
    background: white;
    color: var(--fs-text-color);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    outline: none;
    transition: border-color 0.15s ease, background 0.15s ease;
    user-select: none;
  }

  .fan-switch.on {
    border-color: #4caf50;
    background: #f0faf0;
  }

  .fan-switch:hover:not(:disabled) {
    border-color: #4caf50;
  }

  .fan-switch.pressed:not(:disabled) {
    background: #e8f5e8;
  }

  .fan-switch:focus-visible {
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
  }

  .fan-switch.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .fs-image {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .fs-label {
    line-height: 1;
  }

  .fs-speed {
    font-size: 11px;
    color: #666;
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 4px;
    line-height: 1;
  }

  .fan-switch.on .fs-speed {
    background: #e0f0e0;
    color: #2e7d32;
  }
</style>
