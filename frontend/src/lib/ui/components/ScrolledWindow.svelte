<script lang="ts">
  /**
   * ScrolledWindow - Port of OrcaSlicer's ScrolledWindow widget.
   * A scrollable container with custom scrollbar styling.
   */

  export let marginWidth: number = 0;
  export let scrollbarWidth: number = 6;
  export let tipLength: number = 0;
  export let bothDirections: boolean = false;
  export let scrollbarColor: string = '#c0c0c0';
  export let marginColor: string = '#f5f5f5';
  export let backgroundColor: string = '#ffffff';
  export let className: string = '';
  export let maxHeight: string = '';
  export let maxWidth: string = '';

  let scrollEl: HTMLDivElement;

  function handleScroll() {
    // Custom scroll handling if needed
  }
</script>

<div
  class="scrolled-window {className}"
  style="
    --sw-margin: {marginWidth}px;
    --sw-scrollbar-width: {scrollbarWidth}px;
    --sw-scrollbar-color: {scrollbarColor};
    --sw-margin-color: {marginColor};
    --sw-bg: {backgroundColor};
    --sw-max-height: {maxHeight};
    --sw-max-width: {maxWidth};
  "
>
  <div
    class="sw-viewport"
    on:scroll={handleScroll}
    bind:this={scrollEl}
  >
    <div class="sw-content">
      <slot />
    </div>
  </div>

  <!-- Custom scrollbar track overlay -->
  <div class="sw-scrollbar-track">
    <div class="sw-scrollbar-thumb"></div>
  </div>
</div>

<style>
  .scrolled-window {
    position: relative;
    display: flex;
    flex-direction: column;
    background: var(--sw-bg);
    border-radius: 4px;
    max-height: var(--sw-max-height);
    max-width: var(--sw-max-width);
    overflow: hidden;
  }

  .sw-viewport {
    flex: 1;
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--sw-scrollbar-color) transparent;
  }

  .sw-viewport::-webkit-scrollbar {
    width: var(--sw-scrollbar-width);
    height: var(--sw-scrollbar-width);
  }

  .sw-viewport::-webkit-scrollbar-track {
    background: transparent;
    margin: var(--sw-margin);
  }

  .sw-viewport::-webkit-scrollbar-thumb {
    background: var(--sw-scrollbar-color);
    border-radius: calc(var(--sw-scrollbar-width) / 2);
  }

  .sw-viewport::-webkit-scrollbar-thumb:hover {
    background: #999;
  }

  .sw-content {
    padding: var(--sw-margin);
    min-width: 100%;
    box-sizing: border-box;
  }

  .sw-scrollbar-track {
    display: none;
  }
</style>
