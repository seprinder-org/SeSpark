<script lang="ts">
  /**
   * StepIndicator - Port of OrcaSlicer's StepIndicator widget.
   * A vertical step indicator with "OK" checkmarks for completed steps.
   */

  export let steps: string[] = [];
  export let tips: string[] = [];
  export let selection: number = -1;
  export let radius: number = 7;
  export let barWidth: number = 4;
  export let barColor: string = '#4caf50';
  export let stepColor: string = '#4caf50';
  export let textColor: string = '#333333';
  export let tipColor: string = '#999999';
  export let className: string = '';

  // Events
  export let onselect: ((index: number) => void) | undefined = undefined;

  function selectStep(index: number) {
    if (index < 0 || index >= steps.length) return;
    selection = index;
    if (onselect) onselect(index);
  }
</script>

<div
  class="step-indicator {className}"
  style="
    --si-radius: {radius}px;
    --si-bar-width: {barWidth}px;
    --si-bar-color: {barColor};
    --si-step-color: {stepColor};
    --si-text-color: {textColor};
    --si-tip-color: {tipColor};
  "
>
  {#each steps as step, i}
    <div class="si-row">
      <div class="si-track-column">
        {#if i > 0}
          <div class="si-bar" class:completed={i <= selection}></div>
        {/if}
        <div
          class="si-circle"
          class:active={i === selection}
          class:completed={i < selection}
          class:pending={i > selection}
          role="button"
          tabindex={i <= selection ? 0 : -1}
          on:click={() => selectStep(i)}
          on:keydown={(e) => { if (e.key === 'Enter') selectStep(i); }}
        >
          {#if i < selection}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4 7L6 9L10 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          {:else}
            {i + 1}
          {/if}
        </div>
      </div>
      <div class="si-content">
        <span class="si-label">{step}</span>
        {#if tips[i]}
          <span class="si-tip">{tips[i]}</span>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .step-indicator {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .si-row {
    display: flex;
    gap: 12px;
    min-height: 48px;
  }

  .si-track-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: calc(var(--si-radius) * 2);
    flex-shrink: 0;
  }

  .si-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(var(--si-radius) * 2);
    height: calc(var(--si-radius) * 2);
    border-radius: 50%;
    background: #e0e0e0;
    color: #999;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
    z-index: 1;
    flex-shrink: 0;
    outline: none;
  }

  .si-circle.active,
  .si-circle.completed {
    background: var(--si-step-color);
    color: white;
  }

  .si-circle.pending {
    background: #e0e0e0;
    color: #999;
    cursor: default;
  }

  .si-circle:focus-visible {
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
  }

  .si-bar {
    width: var(--si-bar-width);
    flex: 1;
    min-height: 16px;
    background: #e0e0e0;
    transition: background 0.2s ease;
  }

  .si-bar.completed {
    background: var(--si-bar-color);
  }

  .si-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-bottom: 16px;
    justify-content: center;
  }

  .si-label {
    font-size: 13px;
    color: var(--si-text-color);
    font-weight: 500;
  }

  .si-tip {
    font-size: 11px;
    color: var(--si-tip-color);
  }
</style>
