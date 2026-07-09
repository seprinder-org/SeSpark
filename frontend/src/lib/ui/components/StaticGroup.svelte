<script lang="ts">
  /**
   * StaticGroup - Port of OrcaSlicer's StaticGroup widget.
   * A grouped container with optional title/label.
   */

  export let label: string = '';
  export let collapsible: boolean = false;
  export let collapsed: boolean = false;
  export let className: string = '';

  function toggleCollapse() {
    if (collapsible) collapsed = !collapsed;
  }
</script>

<fieldset
  class="static-group {className}"
  class:collapsible
  class:collapsed
>
  {#if label}
    <legend
      class="sg-legend"
      class:clickable={collapsible}
      on:click={toggleCollapse}
      on:keydown={(e) => { if (e.key === 'Enter') toggleCollapse(); }}
      tabindex={collapsible ? 0 : -1}
      role={collapsible ? 'button' : undefined}
      aria-expanded={collapsible ? !collapsed : undefined}
    >
      {#if collapsible}
        <span class="sg-arrow" class:open={!collapsed}>
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M2 3L4 5L6 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      {/if}
      {label}
    </legend>
  {/if}

  <div class="sg-content" class:hidden={collapsible && collapsed}>
    <slot />
  </div>
</fieldset>

<style>
  .static-group {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    margin: 0;
  }

  .sg-legend {
    font-size: 13px;
    font-weight: 600;
    color: #333;
    padding: 0 8px;
    margin-left: -8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sg-legend.clickable {
    cursor: pointer;
    user-select: none;
  }

  .sg-legend.clickable:hover {
    color: #007bff;
  }

  .sg-arrow {
    display: flex;
    align-items: center;
    transition: transform 0.15s ease;
  }

  .sg-arrow.open {
    transform: rotate(180deg);
  }

  .sg-content {
    margin-top: 12px;
  }

  .sg-content.hidden {
    display: none;
  }
</style>
