<script lang="ts">
  /**
   * Scrollbar - Port of OrcaSlicer's Scrollbar widget (MyScrollbar).
   * A custom scrollbar component for use with ScrolledWindow.
   */

  export let orientation: 'vertical' | 'horizontal' = 'vertical';
  export let thumbSize: number = 40;
  export let trackSize: number = 100;
  export let position: number = 0;
  export let color: string = '#c0c0c0';
  export let hoverColor: string = '#999999';
  export let activeColor: string = '#777777';
  export let className: string = '';

  let isDragging = false;
  let isHovered = false;

  $: thumbStyle = orientation === 'vertical'
    ? { height: `${thumbSize}px`, top: `${position}px` }
    : { width: `${thumbSize}px`, left: `${position}px` };

  function handleMouseDown(e: MouseEvent) {
    isDragging = true;
    e.preventDefault();
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    // Handle drag logic
  }
</script>

<div
  class="scrollbar scrollbar-{orientation} {className}"
  class:dragging={isDragging}
  class:hover={isHovered}
  on:mouseenter={() => isHovered = true}
  on:mouseleave={() => { isHovered = false; isDragging = false; }}
  on:mousedown={handleMouseDown}
  on:mouseup={handleMouseUp}
  on:mousemove={handleMouseMove}
  style="
    --sb-color: {color};
    --sb-hover-color: {hoverColor};
    --sb-active-color: {activeColor};
    --sb-track-size: {trackSize}px;
  "
>
  <div class="scrollbar-thumb" style={thumbStyle}></div>
</div>

<style>
  .scrollbar {
    position: relative;
    background: transparent;
    transition: opacity 0.15s ease;
  }

  .scrollbar-vertical {
    width: 6px;
    height: var(--sb-track-size);
    cursor: pointer;
  }

  .scrollbar-horizontal {
    height: 6px;
    width: var(--sb-track-size);
    cursor: pointer;
  }

  .scrollbar-thumb {
    position: absolute;
    background: var(--sb-color);
    border-radius: 3px;
    transition: background 0.1s ease;
  }

  .scrollbar-vertical .scrollbar-thumb {
    width: 100%;
    min-height: 20px;
  }

  .scrollbar-horizontal .scrollbar-thumb {
    height: 100%;
    min-width: 20px;
  }

  .scrollbar:hover .scrollbar-thumb,
  .scrollbar.dragging .scrollbar-thumb {
    background: var(--sb-hover-color);
  }

  .scrollbar.dragging .scrollbar-thumb {
    background: var(--sb-active-color);
  }
</style>
