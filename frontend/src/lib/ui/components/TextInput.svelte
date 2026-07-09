<script lang="ts">
  /**
   * TextInput - Port of OrcaSlicer's TextInput widget.
   * A styled text input with label, icon, static tips, and corner radius.
   */

  export let value: string = '';
  export let label: string = '';
  export let placeholder: string = '';
  export let icon: string = '';
  export let icon1: string = '';
  export let disabled: boolean = false;
  export let readonly: boolean = false;
  export let type: 'text' | 'password' | 'number' | 'email' | 'search' = 'text';
  export let cornerRadius: number = 8;
  export let labelColor: string = '#666666';
  export let textColor: string = '#333333';
  export let staticTips: string = '';
  export let staticTipsIcon: string = '';
  export let className: string = '';
  export let name: string = '';

  // Events
  export let oninput: ((value: string) => void) | undefined = undefined;
  export let onchange: ((value: string) => void) | undefined = undefined;
  export let onfocus: (() => void) | undefined = undefined;
  export let onblur: (() => void) | undefined = undefined;

  let isFocused = false;

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    if (oninput) oninput(value);
  }

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    if (onchange) onchange(value);
  }

  function handleFocus() {
    isFocused = true;
    if (onfocus) onfocus();
  }

  function handleBlur() {
    isFocused = false;
    if (onblur) onblur();
  }
</script>

<div
  class="text-input {className}"
  class:focused={isFocused}
  class:disabled
  class:has-label={!!label}
  class:has-icon={!!icon}
  style="
    --ti-radius: {cornerRadius}px;
    --ti-label-color: {labelColor};
    --ti-text-color: {textColor};
  "
>
  {#if label}
    <label class="ti-label" for={name}>{label}</label>
  {/if}

  <div class="ti-wrapper">
    {#if icon}
      <span class="ti-icon">
        <img src={icon} alt="" width="16" height="16" />
      </span>
    {/if}

    <input
      {type}
      {name}
      {placeholder}
      {disabled}
      {readonly}
      bind:value
      on:input={handleInput}
      on:change={handleChange}
      on:focus={handleFocus}
      on:blur={handleBlur}
      class="ti-input"
    />

    {#if icon1}
      <span class="ti-icon ti-icon-1">
        <img src={icon1} alt="" width="16" height="16" />
      </span>
    {/if}
  </div>

  {#if staticTips}
    <div class="ti-static-tips">
      {#if staticTipsIcon}
        <img src={staticTipsIcon} alt="" width="12" height="12" />
      {/if}
      <span>{staticTips}</span>
    </div>
  {/if}
</div>

<style>
  .text-input {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  .ti-label {
    font-size: 12px;
    color: var(--ti-label-color);
    font-weight: 500;
    margin-bottom: 2px;
  }

  .ti-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid #d0d0d0;
    border-radius: var(--ti-radius);
    padding: 0 10px;
    background: white;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .text-input.focused .ti-wrapper {
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.15);
  }

  .text-input.disabled .ti-wrapper {
    background: #f5f5f5;
    opacity: 0.6;
  }

  .ti-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    opacity: 0.5;
  }

  .ti-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    color: var(--ti-text-color);
    padding: 8px 0;
    font-family: inherit;
    min-width: 0;
  }

  .ti-input::placeholder {
    color: #aaa;
  }

  .ti-static-tips {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #888;
    margin-top: 2px;
  }
</style>
