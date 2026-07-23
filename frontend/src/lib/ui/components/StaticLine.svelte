<script lang="ts">
  /**
   * StaticLine - Port of OrcaSlicer's StaticLine widget.
   * A horizontal or vertical separator line.
   */

  export let orientation: 'horizontal' | 'vertical' = 'horizontal';
  export let color: string = '#e0e0e0';
  export let thickness: number = 1;
  export let className: string = '';
</script>

<div
  class="static-line line-{orientation} {className}"
  style="
    --sl-color: {color};
    --sl-thickness: {thickness}px;
  "
  role="separator"
  aria-orientation={orientation}
></div>

<style>
  .static-line {
    flex-shrink: 0;
  }

  .line-horizontal {
    width: 100%;
    height: var(--sl-thickness);
    background: var(--sl-color);
    margin: 8px 0;
  }

  .line-vertical {
    height: 100%;
    width: var(--sl-thickness);
    background: var(--sl-color);
    margin: 0 8px;
  }
</style>
