<script lang="ts">
  /**
   * ComboBox - Port of OrcaSlicer's ComboBox widget.
   * Combines a TextInput with a DropDown for selection.
   */

  import DropDown from './DropDown.svelte';
  import type { DropDownItem } from '../types';

  export let items: DropDownItem[] = [];
  export let value: string = '';
  export let label: string = '';
  export let placeholder: string = '';
  export let disabled: boolean = false;
  export let selection: number = -1;
  export let textOff: boolean = false;
  export let noDropIcon: boolean = false;
  export let replaceText: string = '';
  export let imageForText: string = '';
  export let className: string = '';

  // Events
  export let onselect: ((index: number, item: DropDownItem) => void) | undefined = undefined;
  export let onchange: ((value: string) => void) | undefined = undefined;

  let showDropDown = false;
  let comboRef: HTMLDivElement;

  function toggleDropDown() {
    if (disabled) return;
    showDropDown = !showDropDown;
  }

  function handleSelect(index: number, item: DropDownItem) {
    selection = index;
    value = item.text;
    showDropDown = false;
    if (onselect) onselect(index, item);
    if (onchange) onchange(value);
  }

  function handleInput(val: string) {
    value = val;
    showDropDown = true;
    if (onchange) onchange(val);
  }

  function handleDismiss() {
    showDropDown = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      showDropDown = true;
    } else if (e.key === 'Escape') {
      showDropDown = false;
    } else if (e.key === 'Enter') {
      if (showDropDown && selection >= 0) {
        handleSelect(selection, items[selection]);
      }
    }
  }

  $: selectedItem = selection >= 0 && selection < items.length ? items[selection] : null;
</script>

<div
  class="combo-box {className}"
  class:disabled
  bind:this={comboRef}
  style="position: relative;"
>
  <div class="combo-trigger" on:click={toggleDropDown} on:keydown={handleKeyDown} role="combobox" tabindex="0">
    {#if replaceText && selectedItem}
      <span class="combo-replace-text">{replaceText}</span>
    {:else if imageForText && selectedItem}
      <img src={imageForText} alt="" class="combo-image-text" />
    {:else}
      <input
        type="text"
        bind:value
        {placeholder}
        {disabled}
        on:input={(e) => handleInput((e.target as HTMLInputElement).value)}
        on:focus={() => { if (!showDropDown) showDropDown = true; }}
        on:keydown={handleKeyDown}
        class="combo-input"
      />
    {/if}

    {#if !noDropIcon}
      <span class="combo-arrow" class:open={showDropDown}>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    {/if}
  </div>

  {#if showDropDown && comboRef}
    <div style="position: absolute; top: 100%; left: 0; right: 0; z-index: 1000;">
      <DropDown
        {items}
        visible={true}
        bind:selection
        textOff={textOff || !!replaceText}
        onselect={handleSelect}
        ondismiss={handleDismiss}
      />
    </div>
  {/if}
</div>

<style>
  .combo-box {
    width: 100%;
  }

  .combo-box.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .combo-trigger {
    display: flex;
    align-items: center;
    border: 1px solid #d0d0d0;
    border-radius: 8px;
    padding: 0 10px;
    background: white;
    cursor: pointer;
    transition: border-color 0.15s ease;
    outline: none;
  }

  .combo-trigger:focus-within {
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.15);
  }

  .combo-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    color: #333;
    padding: 8px 0;
    font-family: inherit;
    min-width: 0;
    cursor: pointer;
  }

  .combo-input::placeholder {
    color: #aaa;
  }

  .combo-replace-text {
    flex: 1;
    font-size: 14px;
    color: #333;
    padding: 8px 0;
  }

  .combo-image-text {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  .combo-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: #666;
    transition: transform 0.15s ease;
    flex-shrink: 0;
  }

  .combo-arrow.open {
    transform: rotate(180deg);
  }
</style>
