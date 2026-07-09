<script lang="ts">
  /**
   * SpinInput - Port of OrcaSlicer's SpinInput widget.
   * A numeric stepper with increment/decrement buttons.
   */

  import Button from './Button.svelte';

  export let value: number = 0;
  export let label: string = '';
  export let min: number = 0;
  export let max: number = 100;
  export let step: number = 1;
  export let disabled: boolean = false;
  export let cornerRadius: number = 8;
  export let labelColor: string = '#666666';
  export let textColor: string = '#333333';
  export let className: string = '';

  // Events
  export let onchange: ((value: number) => void) | undefined = undefined;

  function increment() {
    if (disabled) return;
    const newVal = Math.min(value + step, max);
    if (newVal !== value) {
      value = newVal;
      if (onchange) onchange(value);
    }
  }

  function decrement() {
    if (disabled) return;
    const newVal = Math.max(value - step, min);
    if (newVal !== value) {
      value = newVal;
      if (onchange) onchange(value);
    }
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const parsed = parseInt(target.value, 10);
    if (!isNaN(parsed)) {
      value = Math.max(min, Math.min(max, parsed));
      if (onchange) onchange(value);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') { e.preventDefault(); increment(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); decrement(); }
  }

  function handleWheel(e: WheelEvent) {
    if (disabled) return;
    e.preventDefault();
    if (e.deltaY < 0) increment();
    else decrement();
  }
</script>

<div
  class="spin-input {className}"
  class:disabled
  class:has-label={!!label}
  style="
    --si-radius: {cornerRadius}px;
    --si-label-color: {labelColor};
    --si-text-color: {textColor};
  "
>
  {#if label}
    <label class="si-label">{label}</label>
  {/if}

  <div class="si-wrapper">
    <button
      class="si-btn si-btn-dec"
      on:click={decrement}
      {disabled}
      aria-label="Decrease"
    >
      <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
        <rect x="0" y="0" width="10" height="2" rx="1" fill="currentColor"/>
      </svg>
    </button>

    <input
      type="number"
      bind:value
      {min}
      {max}
      {disabled}
      on:input={handleInput}
      on:keydown={handleKeyDown}
      on:wheel={handleWheel}
      class="si-input"
    />

    <button
      class="si-btn si-btn-inc"
      on:click={increment}
      {disabled}
      aria-label="Increase"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <rect x="4" y="0" width="2" height="10" rx="1" fill="currentColor"/>
        <rect x="0" y="4" width="10" height="2" rx="1" fill="currentColor"/>
      </svg>
    </button>
  </div>
</div>

<style>
  .spin-input {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  .si-label {
    font-size: 12px;
    color: var(--si-label-color);
    font-weight: 500;
  }

  .si-wrapper {
    display: flex;
    align-items: center;
    border: 1px solid #d0d0d0;
    border-radius: var(--si-radius);
    overflow: hidden;
    background: white;
  }

  .spin-input.disabled .si-wrapper {
    opacity: 0.5;
    background: #f5f5f5;
  }

  .si-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 36px;
    border: none;
    background: transparent;
    color: #666;
    cursor: pointer;
    transition: background 0.1s ease;
    flex-shrink: 0;
  }

  .si-btn:hover:not(:disabled) {
    background: #f0f0f0;
  }

  .si-btn:disabled {
    cursor: not-allowed;
    opacity: 0.3;
  }

  .si-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    color: var(--si-text-color);
    text-align: center;
    padding: 8px 4px;
    font-family: inherit;
    min-width: 0;
    -moz-appearance: textfield;
  }

  .si-input::-webkit-outer-spin-button,
  .si-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>
