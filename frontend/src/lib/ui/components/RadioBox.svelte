<script lang="ts">
  /**
   * RadioBox - Port of OrcaSlicer's RadioBox widget.
   * A styled radio button with on/off/ban (disabled) states.
   */

  export let checked: boolean = false;
  export let disabled: boolean = false;
  export let label: string = '';
  export let name: string = '';
  export let value: string = '';
  export let className: string = '';

  // Events
  export let onchange: ((checked: boolean) => void) | undefined = undefined;

  function handleChange() {
    if (disabled) return;
    checked = true; // Radio buttons can only be checked via click (not unchecked)
    if (onchange) onchange(checked);
  }
</script>

<label class="radiobox {className}" class:checked class:disabled>
  <input
    type="radio"
    {disabled}
    {name}
    {value}
    bind:group={checked}
    on:change={handleChange}
    class="radiobox-input"
  />
  <span class="radiobox-visual">
    {#if disabled}
      <!-- Banned/disabled state -->
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="8" stroke="#ccc" stroke-width="1.5" fill="none"/>
        <line x1="4" y1="4" x2="14" y2="14" stroke="#ccc" stroke-width="1.5"/>
      </svg>
    {:else if checked}
      <!-- Checked state -->
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="8" fill="#007bff"/>
        <circle cx="9" cy="9" r="3" fill="white"/>
      </svg>
    {:else}
      <!-- Unchecked state -->
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="8" stroke="#999" stroke-width="1.5" fill="none"/>
      </svg>
    {/if}
  </span>
  {#if label}
    <span class="radiobox-label">{label}</span>
  {/if}
  <slot />
</label>

<style>
  .radiobox {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    font-size: 14px;
    color: #333;
  }

  .radiobox.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .radiobox-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  .radiobox-visual {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }

  .radiobox:not(.disabled):hover .radiobox-visual svg {
    filter: brightness(0.9);
  }

  .radiobox-label {
    line-height: 1.2;
  }
</style>
