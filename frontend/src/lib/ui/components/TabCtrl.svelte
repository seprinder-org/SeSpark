<script lang="ts">
  /**
   * TabCtrl - Port of OrcaSlicer's TabCtrl widget.
   * A tab control with selectable tabs, optional icons, and bold styling.
   */

  import type { TabItem } from '../types';

  export let tabs: TabItem[] = [];
  export let selection: number = -1;
  export let className: string = '';

  // Events
  export let onselect: ((index: number, item: TabItem) => void) | undefined = undefined;
  export let onchanging: ((index: number) => boolean | void) | undefined = undefined;

  function selectTab(index: number) {
    if (index === selection) return;
    if (onchanging) {
      const result = onchanging(index);
      if (result === false) return;
    }
    selection = index;
    if (onselect) onselect(index, tabs[index]);
  }

  function handleKeyDown(e: KeyboardEvent, index: number) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectTab(index);
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = Math.min(selection + 1, tabs.length - 1);
      selectTab(next);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = Math.max(selection - 1, 0);
      selectTab(prev);
    }
  }
</script>

<div
  class="tab-ctrl {className}"
  role="tablist"
  style="--tab-count: {tabs.length};"
>
  {#each tabs as tab, i}
    <button
      class="tab-item"
      class:active={i === selection}
      class:bold={tab.bold}
      role="tab"
      aria-selected={i === selection}
      tabindex={i === selection ? 0 : -1}
      on:click={() => selectTab(i)}
      on:keydown={(e) => handleKeyDown(e, i)}
      style="
        --tab-text-color: {tab.textColor || (i === selection ? '#007bff' : '#666')};
      "
    >
      {#if tab.image}
        <img
          src={i === selection && tab.selImage ? tab.selImage : tab.image}
          alt=""
          class="tab-icon"
          width="16"
          height="16"
        />
      {/if}
      <span class="tab-text">{tab.text}</span>
    </button>
  {/each}
  <div
    class="tab-indicator"
    style="
      --tab-offset: {selection * 100}%;
      --tab-width: {100 / tabs.length}%;
    "
  ></div>
</div>

<style>
  .tab-ctrl {
    display: flex;
    position: relative;
    border-bottom: 1px solid #e0e0e0;
    background: transparent;
  }

  .tab-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border: none;
    background: transparent;
    color: var(--tab-text-color, #666);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    outline: none;
    transition: color 0.15s ease;
    position: relative;
    white-space: nowrap;
    user-select: none;
    flex: 1;
    justify-content: center;
  }

  .tab-item:hover {
    color: #333;
  }

  .tab-item.active {
    color: #007bff;
  }

  .tab-item.bold {
    font-weight: 700;
  }

  .tab-item:focus-visible {
    background: rgba(0, 123, 255, 0.05);
  }

  .tab-icon {
    flex-shrink: 0;
  }

  .tab-text {
    line-height: 1;
  }

  .tab-indicator {
    position: absolute;
    bottom: -1px;
    height: 2px;
    background: #007bff;
    width: var(--tab-width, 50%);
    transform: translateX(calc(var(--tab-offset, 0%)));
    transition: transform 0.2s ease;
    border-radius: 1px;
  }
</style>
