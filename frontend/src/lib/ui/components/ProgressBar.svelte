<script lang="ts">
  /**
   * ProgressBar - Port of OrcaSlicer's ProgressBar widget.
   * A customizable progress bar with optional number display and disabled state.
   */

  export let value: number = 0;
  export let max: number = 100;
  export let showNumber: boolean = false;
  export let disabled: boolean = false;
  export let disableText: string = '';
  export let radius: number = 7;
  export let height: number = 14;
  export let progressColor: string = '#009688';
  export let progressColorDisable: string = '#ff6f00';
  export let backgroundColor: string = '#e9e9e9';
  export let className: string = '';

  $: proportion = max > 0 ? Math.min(value / max, 1) : 0;
  $: displayColor = disabled ? progressColorDisable : progressColor;
  $: displayText = disabled ? disableText : (showNumber ? `${Math.round(proportion * 100)}%` : '');
</script>

<div
  class="progress-bar {className}"
  class:disabled
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={max}
  style="
    --pb-radius: {radius}px;
    --pb-height: {height}px;
    --pb-bg: {backgroundColor};
    --pb-color: {displayColor};
    --pb-proportion: {proportion};
  "
>
  <div class="pb-track">
    <div class="pb-fill" style="width: {proportion * 100}%;"></div>
  </div>
  {#if displayText}
    <span class="pb-text">{displayText}</span>
  {/if}
</div>

<style>
  .progress-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .pb-track {
    flex: 1;
    height: var(--pb-height);
    border-radius: var(--pb-radius);
    background: var(--pb-bg);
    overflow: hidden;
    position: relative;
  }

  .pb-fill {
    height: 100%;
    border-radius: var(--pb-radius);
    background: var(--pb-color);
    transition: width 0.3s ease;
  }

  .progress-bar.disabled .pb-fill {
    background: var(--pb-color);
    opacity: 0.6;
  }

  .pb-text {
    font-size: 12px;
    font-weight: 500;
    color: #666;
    white-space: nowrap;
    min-width: 36px;
    text-align: right;
  }
</style>
