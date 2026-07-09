<script lang="ts">
  /**
   * ImageSwitchButton - Port of OrcaSlicer's ImageSwitchButton widget.
   * A toggle button with on/off images and labels.
   */

  export let value: boolean = false;
  export let labelOn: string = '';
  export let labelOff: string = '';
  export let imageOn: string = '';
  export let imageOff: string = '';
  export let padding: number = 4;
  export let textColor: string = '#333333';
  export let disabled: boolean = false;
  export let className: string = '';

  // Events
  export let onchange: ((value: boolean) => void) | undefined = undefined;

  let isHovered = false;
  let isPressed = false;

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
  class="image-switch {className}"
  class:on={value}
  class:off={!value}
  class:disabled
  class:hover={isHovered}
  class:pressed={isPressed}
  on:click={toggle}
  on:keydown={handleKeyDown}
  on:mouseenter={() => isHovered = true}
  on:mouseleave={() => { isHovered = false; isPressed = false; }}
  on:mousedown={() => isPressed = true}
  on:mouseup={() => isPressed = false}
  style="--is-padding: {padding}px; --is-text-color: {textColor};"
>
  {#if imageOn && imageOff}
    <span class="is-image">
      <img src={value ? imageOn : imageOff} alt="" width="24" height="24" />
    </span>
  {/if}
  <span class="is-label">{value ? labelOn : labelOff}</span>
</button>

<style>
  .image-switch {
    display: inline-flex;
    align-items: center;
    gap: var(--is-padding);
    padding: 6px 12px;
    border: 1px solid #d0d0d0;
    border-radius: 8px;
    background: white;
    color: var(--is-text-color);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    outline: none;
    transition: border-color 0.15s ease, background 0.15s ease;
    user-select: none;
  }

  .image-switch.on {
    border-color: #007bff;
    background: #f0f7ff;
  }

  .image-switch:hover:not(:disabled) {
    border-color: #007bff;
  }

  .image-switch.pressed:not(:disabled) {
    background: #e8f0fe;
  }

  .image-switch:focus-visible {
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.3);
  }

  .image-switch.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .is-image {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .is-label {
    line-height: 1;
  }
</style>
