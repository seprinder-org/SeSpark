<script lang="ts">
  /**
   * StepCtrl - Port of OrcaSlicer's StepCtrl widget.
   * A horizontal step progress indicator with draggable thumb.
   */

  export let steps: string[] = [];
  export let tips: string[] = [];
  export let hint: string = '';
  export let selection: number = -1;
  export let radius: number = 7;
  export let barWidth: number = 4;
  export let barColor: string = '#007bff';
  export let stepColor: string = '#007bff';
  export let textColor: string = '#333333';
  export let tipColor: string = '#999999';
  export let className: string = '';

  // Events
  export let onselect: ((index: number) => void) | undefined = undefined;
  export let onchanging: ((index: number) => boolean | void) | undefined = undefined;

  function selectStep(index: number) {
    if (index < 0 || index >= steps.length) return;
    if (index === selection) return;
    if (onchanging) {
      const result = onchanging(index);
      if (result === false) return;
    }
    selection = index;
    if (onselect) onselect(index);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      selectStep(Math.min(selection + 1, steps.length - 1));
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      selectStep(Math.max(selection - 1, 0));
    }
  }
</script>

<div
  class="step-ctrl {className}"
  role="tablist"
  aria-orientation="horizontal"
  on:keydown={handleKeyDown}
  style="
    --sc-radius: {radius}px;
    --sc-bar-width: {barWidth}px;
    --sc-bar-color: {barColor};
    --sc-step-color: {stepColor};
    --sc-text-color: {textColor};
    --sc-tip-color: {tipColor};
  "
>
  {#each steps as step, i}
    <button
      class="step-item"
      class:active={i === selection}
      class:completed={i < selection}
      role="tab"
      aria-selected={i === selection}
      tabindex={i === selection ? 0 : -1}
      on:click={() => selectStep(i)}
      style="--step-index: {i};"
    >
      <span class="step-circle">
        {#if i < selection}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 6L5 8L9 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {:else}
          {i + 1}
        {/if}
      </span>
      <span class="step-label">{step}</span>
      {#if tips[i]}
        <span class="step-tip">{tips[i]}</span>
      {/if}
    </button>

    {#if i < steps.length - 1}
      <div class="step-connector" class:completed={i < selection}>
        <div class="step-connector-fill"></div>
      </div>
    {/if}
  {/each}

  {#if hint}
    <div class="step-hint">{hint}</div>
  {/if}
</div>

<style>
  .step-ctrl {
    display: flex;
    align-items: flex-start;
    width: 100%;
    outline: none;
  }

  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    outline: none;
    padding: 4px;
    flex-shrink: 0;
    min-width: 0;
  }

  .step-item:focus-visible .step-circle {
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
  }

  .step-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(var(--sc-radius) * 2);
    height: calc(var(--sc-radius) * 2);
    border-radius: 50%;
    background: #e0e0e0;
    color: #999;
    font-size: 12px;
    font-weight: 600;
    transition: background 0.2s ease, color 0.2s ease;
    flex-shrink: 0;
  }

  .step-item.active .step-circle,
  .step-item.completed .step-circle {
    background: var(--sc-step-color);
    color: white;
  }

  .step-label {
    font-size: 11px;
    color: var(--sc-text-color);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 80px;
  }

  .step-tip {
    font-size: 10px;
    color: var(--sc-tip-color);
    text-align: center;
  }

  .step-connector {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 0 4px;
    margin-top: calc(var(--sc-radius) - 2px);
  }

  .step-connector-fill {
    width: 100%;
    height: var(--sc-bar-width);
    background: #e0e0e0;
    border-radius: calc(var(--sc-bar-width) / 2);
    transition: background 0.2s ease;
  }

  .step-connector.completed .step-connector-fill {
    background: var(--sc-bar-color);
  }

  .step-hint {
    width: 100%;
    text-align: center;
    font-size: 11px;
    color: var(--sc-tip-color);
    margin-top: 8px;
  }
</style>
