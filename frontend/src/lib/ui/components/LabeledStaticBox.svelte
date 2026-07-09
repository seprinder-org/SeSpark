<script lang="ts">
  /**
   * LabeledStaticBox - Port of OrcaSlicer's LabeledStaticBox widget.
   * A static box with an embedded label.
   */

  export let label: string = '';
  export let labelPosition: 'top' | 'left' | 'right' = 'top';
  export let className: string = '';

  // StaticBox props
  export let radius: number = 8;
  export let borderWidth: number = 1;
  export let borderColor: string = '#e0e0e0';
  export let backgroundColor: string = '#ffffff';
</script>

<div
  class="labeled-box {className}"
  class:label-top={labelPosition === 'top'}
  class:label-left={labelPosition === 'left'}
  class:label-right={labelPosition === 'right'}
  style="
    --lb-radius: {radius}px;
    --lb-border-width: {borderWidth}px;
    --lb-border-color: {borderColor};
    --lb-bg: {backgroundColor};
  "
>
  {#if label}
    <span class="lb-label">{label}</span>
  {/if}
  <div class="lb-content">
    <slot />
  </div>
</div>

<style>
  .labeled-box {
    display: flex;
    border-radius: var(--lb-radius);
    border: var(--lb-border-width) solid var(--lb-border-color);
    background: var(--lb-bg);
    padding: 12px;
    gap: 8px;
  }

  .label-top {
    flex-direction: column;
  }

  .label-left {
    flex-direction: row;
    align-items: flex-start;
  }

  .label-right {
    flex-direction: row-reverse;
    align-items: flex-start;
  }

  .lb-label {
    font-size: 12px;
    font-weight: 500;
    color: #666;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .label-top .lb-label {
    margin-bottom: 4px;
  }

  .label-left .lb-label,
  .label-right .lb-label {
    margin-top: 2px;
    min-width: 60px;
  }

  .lb-content {
    flex: 1;
    min-width: 0;
  }
</style>
