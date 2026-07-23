<script lang="ts">
  /**
   * DropDown - Port of OrcaSlicer's DropDown widget (popup menu).
   * A dropdown popup that appears below a trigger element.
   */

  import type { DropDownItem } from '../types';

  export let items: DropDownItem[] = [];
  export let visible: boolean = false;
  export let selection: number = -1;
  export let hoverItem: number = -1;
  export let cornerRadius: number = 8;
  export let textColor: string = '#333333';
  export let borderColor: string = '#d0d0d0';
  export let selectorBorderColor: string = '#007bff';
  export let selectorBackgroundColor: string = '#e8f0fe';
  export let useContentWidth: boolean = false;
  export let limitMaxContentWidth: boolean = false;
  export let alignIcon: boolean = false;
  export let textOff: boolean = false;
  export let className: string = '';

  // Events
  export let onselect: ((index: number, item: DropDownItem) => void) | undefined = undefined;
  export let ondismiss: (() => void) | undefined = undefined;

  const SPLIT_ITEM = 0x0001;
  const DISABLED_ITEM = 0x0002;

  function handleItemClick(index: number, item: DropDownItem) {
    if (item.style && (item.style & DISABLED_ITEM)) return;
    selection = index;
    if (onselect) onselect(index, item);
    visible = false;
  }

  function handleMouseEnter(index: number) {
    hoverItem = index;
  }

  function handleMouseLeave() {
    hoverItem = -1;
  }

  function handleDismiss() {
    visible = false;
    if (ondismiss) ondismiss();
  }

  // Close on click outside
  function handleWindowClick(e: MouseEvent) {
    const el = document.querySelector('.dropdown-popup');
    if (el && !el.contains(e.target as Node)) {
      handleDismiss();
    }
  }

  $: if (visible) {
    window.addEventListener('click', handleWindowClick);
  } else {
    window.removeEventListener('click', handleWindowClick);
  }
</script>

{#if visible}
  <div
    class="dropdown-popup {className}"
    style="
      --dd-radius: {cornerRadius}px;
      --dd-text-color: {textColor};
      --dd-border-color: {borderColor};
      --dd-selector-border: {selectorBorderColor};
      --dd-selector-bg: {selectorBackgroundColor};
    "
    role="listbox"
  >
    {#each items as item, i}
      {@const isSplit = !!(item.style && (item.style & SPLIT_ITEM))}
      {@const isDisabled = !!(item.style && (item.style & DISABLED_ITEM))}

      {#if item.groupLabel && (i === 0 || items[i - 1]?.groupKey !== item.groupKey)}
        <div class="dd-group-label">{item.groupLabel}</div>
      {/if}

      <div
        class="dd-item"
        class:selected={i === selection}
        class:hovered={i === hoverItem}
        class:disabled={isDisabled}
        class:split={isSplit}
        role="option"
        aria-selected={i === selection}
        on:click={() => handleItemClick(i, item)}
        on:mouseenter={() => handleMouseEnter(i)}
        on:mouseleave={handleMouseLeave}
      >
        {#if !textOff && !isSplit}
          {#if item.icon}
            <span class="dd-item-icon">
              <img src={item.icon} alt="" width="16" height="16" />
            </span>
          {/if}
          <span class="dd-item-text">{item.text}</span>
          {#if item.tip}
            <span class="dd-item-tip">{item.tip}</span>
          {/if}
        {:else if isSplit}
          <span class="dd-split-line"></span>
          <span class="dd-split-text">{item.text}</span>
          <span class="dd-split-line"></span>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style>
  .dropdown-popup {
    position: absolute;
    z-index: 1000;
    background: white;
    border: 1px solid var(--dd-border-color);
    border-radius: var(--dd-radius);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    min-width: 160px;
    max-height: 300px;
    overflow-y: auto;
    padding: 4px 0;
  }

  .dd-group-label {
    padding: 6px 12px 2px;
    font-size: 11px;
    font-weight: 600;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .dd-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 13px;
    color: var(--dd-text-color);
    transition: background 0.1s ease;
    user-select: none;
  }

  .dd-item.hovered {
    background: var(--dd-selector-bg);
  }

  .dd-item.selected {
    background: var(--dd-selector-bg);
    border-left: 3px solid var(--dd-selector-border);
  }

  .dd-item.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .dd-item.split {
    justify-content: center;
    gap: 8px;
    padding: 4px 12px;
    font-size: 11px;
    color: #999;
    cursor: default;
  }

  .dd-item-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .dd-item-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dd-item-tip {
    font-size: 11px;
    color: #999;
    margin-left: auto;
  }

  .dd-split-line {
    flex: 1;
    height: 1px;
    background: #e0e0e0;
  }

  .dd-split-text {
    font-size: 11px;
    color: #999;
    white-space: nowrap;
  }
</style>
