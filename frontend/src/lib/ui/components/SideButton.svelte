<script lang="ts" context="module">
  /**
   * SideButton - Port of OrcaSlicer's SideButton widget.
   * A sidebar navigation button with icon, text, and configurable corner radii.
   */

  export type HorizontalOrientation = 'left' | 'center' | 'right';
</script>

<script lang="ts">

  export let text: string = '';
  export let icon: string = '';
  export let iconSize: number = 16;
  export let cornerRadius: number = 0;
  export let cornerEnable: [boolean, boolean, boolean, boolean] = [true, true, true, true];
  export let textOrientation: HorizontalOrientation = 'left';
  export let textMargin: number = 15;
  export let layoutStyle: number = 0;
  export let disabled: boolean = false;
  export let borderColor: string = 'transparent';
  export let foregroundColor: string = '#333333';
  export let backgroundColor: string = 'transparent';
  export let bottomColor: string = 'transparent';
  export let minWidth: string = '';
  export let minHeight: string = '';
  export let extraSize: string = '';
  export let iconOffset: number = 0;
  export let className: string = '';

  // Events
  export let onclick: ((e: MouseEvent) => void) | undefined = undefined;

  let isPressed = false;

  $: radiusStyle = cornerEnable
    ? `${cornerEnable[0] ? cornerRadius : 0}px ${cornerEnable[1] ? cornerRadius : 0}px ${cornerEnable[3] ? cornerRadius : 0}px ${cornerEnable[2] ? cornerRadius : 0}px`
    : `${cornerRadius}px`;

  $: justifyContent = textOrientation === 'left' ? 'flex-start' : textOrientation === 'right' ? 'flex-end' : 'center';

  function handleClick(e: MouseEvent) {
    if (disabled) return;
    if (onclick) onclick(e);
  }
</script>

<button
  class="side-button {className}"
  class:disabled
  class:pressed={isPressed}
  on:click={handleClick}
  on:mousedown={() => isPressed = true}
  on:mouseup={() => isPressed = false}
  on:mouseleave={() => isPressed = false}
  style="
    --sb-radius: {radiusStyle};
    --sb-border-color: {borderColor};
    --sb-text-color: {foregroundColor};
    --sb-bg: {backgroundColor};
    --sb-bottom-color: {bottomColor};
    --sb-min-width: {minWidth};
    --sb-min-height: {minHeight};
    --sb-justify: {justifyContent};
    --sb-text-margin: {textMargin}px;
    --sb-icon-offset: {iconOffset}px;
  "
>
  {#if icon}
    <span class="sb-icon" style="margin-left: {iconOffset}px;">
      <img src={icon} alt="" width={iconSize} height={iconSize} />
    </span>
  {/if}
  <span class="sb-text">{text}</span>
  <slot />
</button>

<style>
  .side-button {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 16px;
    border: none;
    border-radius: var(--sb-radius);
    background: var(--sb-bg);
    color: var(--sb-text-color);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    outline: none;
    transition: background 0.1s ease;
    text-align: left;
    justify-content: var(--sb-justify);
    min-width: var(--sb-min-width);
    min-height: var(--sb-min-height);
    position: relative;
    box-sizing: border-box;
    border-bottom: 2px solid var(--sb-bottom-color);
  }

  .side-button:hover:not(:disabled) {
    filter: brightness(0.95);
  }

  .side-button.pressed:not(:disabled) {
    filter: brightness(0.9);
  }

  .side-button:focus-visible {
    box-shadow: inset 0 0 0 2px rgba(0, 123, 255, 0.3);
  }

  .side-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .sb-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .sb-text {
    flex: 1;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
