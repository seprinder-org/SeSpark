<script lang="ts">
  /**
   * CheckBox - Port of OrcaSlicer's CheckBox widget.
   *
   * Supports three states: unchecked, checked, half-checked (indeterminate).
   * Uses SVG icons for on/off/half states with dark/light mode support.
   */

  export let checked: boolean = false;
  export let halfChecked: boolean = false;
  export let disabled: boolean = false;
  export let label: string = '';
  export let className: string = '';
  export let id: string = '';

  // Events
  export let onchange: ((checked: boolean) => void) | undefined = undefined;

  $: isChecked = checked;
  $: isHalfChecked = halfChecked;

  function handleChange() {
    if (disabled) return;
    if (isHalfChecked) {
      // Clicking half-checked goes to checked
      isHalfChecked = false;
      isChecked = true;
    } else {
      isChecked = !isChecked;
    }
    checked = isChecked;
    halfChecked = isHalfChecked;
    if (onchange) onchange(isChecked);
  }
</script>

<label class="checkbox {className}" class:disabled class:checked={isChecked} class:half-checked={isHalfChecked}>
  <input
    type="checkbox"
    bind:checked={isChecked}
    {disabled}
    {id}
    on:change={handleChange}
    indeterminate={isHalfChecked}
    class="checkbox-input"
  />
  <span class="checkbox-visual">
    {#if isHalfChecked}
      <!-- Half-checked: minus icon -->
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="14" height="14" rx="3" fill="currentColor" opacity="0.5"/>
        <rect x="4" y="7" width="8" height="2" rx="1" fill="white"/>
      </svg>
    {:else if isChecked}
      <!-- Checked: checkmark icon -->
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="14" height="14" rx="3" fill="currentColor"/>
        <path d="M4.5 8L7 10.5L11.5 5.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    {:else}
      <!-- Unchecked: empty box -->
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="14" height="14" rx="3" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.5" fill="none"/>
      </svg>
    {/if}
  </span>
  {#if label}
    <span class="checkbox-label">{label}</span>
  {/if}
  <slot />
</label>

<style>
  .checkbox {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    color: #333;
    font-size: 14px;
  }

  .checkbox.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .checkbox-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  .checkbox-visual {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    color: #007bff;
    transition: color 0.15s ease;
  }

  .checkbox:not(.disabled):hover .checkbox-visual {
    color: #0056b3;
  }

  .checkbox.checked .checkbox-visual {
    color: #007bff;
  }

  .checkbox-label {
    line-height: 1.2;
  }
</style>
