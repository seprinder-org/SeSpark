<script lang="ts">
  import { StateColor, type ComponentState } from '../stateColor';

  /**
   * StaticBox - Port of OrcaSlicer's StaticBox widget.
   * A styled container with configurable border, background, corner radius, and badge.
   */
  export let radius: number = 0;
  export let borderWidth: number = 1;
  export let borderStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
  export let borderColor: string = '#e0e0e0';
  export let backgroundColor: string = '#ffffff';
  export let backgroundColor2: string | null = null;
  export let showBadge: boolean = false;
  export let badgeColor: string = '#ff4444';
  export let padding: string = '0px';
  export let width: string = 'auto';
  export let height: string = 'auto';
  export let className: string = '';

  // State tracking for hover/press/focus/disabled
  let isHovered = false;
  let isPressed = false;
  let isFocused = false;
  let _disabled = false;
  export { _disabled as disabled };

  function getActiveStates(): ComponentState[] {
    const states: ComponentState[] = ['normal'];
    if (_disabled) states.push('disabled');
    if (isHovered) states.push('hovered');
    if (isPressed) states.push('pressed');
    if (isFocused) states.push('focused');
    return states;
  }

  function handleMouseEnter() { isHovered = true; }
  function handleMouseLeave() { isHovered = false; isPressed = false; }
  function handleMouseDown() { isPressed = true; }
  function handleMouseUp() { isPressed = false; }
  function handleFocus() { isFocused = true; }
  function handleBlur() { isFocused = false; }
</script>

<div
  class="static-box {className}"
  class:disabled={_disabled}
  style="
    --sb-radius: {radius}px;
    --sb-border-width: {borderWidth}px;
    --sb-border-style: {borderStyle};
    --sb-border-color: {borderColor};
    --sb-bg: {backgroundColor};
    --sb-bg2: {backgroundColor2 || backgroundColor};
    --sb-padding: {padding};
    --sb-width: {width};
    --sb-height: {height};
  "
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:mousedown={handleMouseDown}
  on:mouseup={handleMouseUp}
  on:focus={handleFocus}
  on:blur={handleBlur}
  tabindex="-1"
  role="region"
>
  <slot />

  {#if showBadge}
    <span class="badge" style="background-color: {badgeColor};"></span>
  {/if}
</div>

<style>
  .static-box {
    position: relative;
    border-radius: var(--sb-radius);
    border: var(--sb-border-width) var(--sb-border-style) var(--sb-border-color);
    background: var(--sb-bg);
    padding: var(--sb-padding);
    width: var(--sb-width);
    height: var(--sb-height);
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s ease, background-color 0.15s ease;
  }

  .static-box.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .badge {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 2px solid white;
  }
</style>
