<script lang="ts">
  /**
   * CheckList - Port of OrcaSlicer's CheckList widget.
   * A scrollable list of checkboxes with filter/search, select all, and menu.
   */

  import TextInput from './TextInput.svelte';
  import CheckBox from './CheckBox.svelte';

  export let choices: string[] = [];
  export let selections: number[] = [];
  export let filterText: string = '';
  export let scrollStyle: 'vertical' | 'horizontal' | 'both' = 'vertical';
  export let infoNonSel: string = '{count} items';
  export let infoAllSel: string = 'All {count} items selected';
  export let infoEmpty: string = 'No items';
  export let className: string = '';

  // Events
  export let onchange: ((selections: number[]) => void) | undefined = undefined;
  export let onfilter: ((filter: string) => void) | undefined = undefined;

  let showMenu = false;

  $: filteredChoices = filterText
    ? choices.filter((c) => c.toLowerCase().includes(filterText.toLowerCase()))
    : choices;

  $: filteredIndices = filterText
    ? choices
        .map((c, i) => ({ c, i }))
        .filter(({ c }) => c.toLowerCase().includes(filterText.toLowerCase()))
        .map(({ i }) => i)
    : choices.map((_, i) => i);

  $: selectedCount = selections.length;
  $: totalCount = choices.length;
  $: allSelected = selectedCount === totalCount && totalCount > 0;
  $: infoText = totalCount === 0
    ? infoEmpty
    : allSelected
      ? infoAllSel.replace('{count}', String(totalCount))
      : infoNonSel.replace('{count}', String(selectedCount));

  function toggleItem(index: number) {
    const actualIndex = filteredIndices[index];
    if (actualIndex === undefined) return;
    const idx = selections.indexOf(actualIndex);
    if (idx >= 0) {
      selections = [...selections.slice(0, idx), ...selections.slice(idx + 1)];
    } else {
      selections = [...selections, actualIndex];
    }
    if (onchange) onchange(selections);
  }

  function isChecked(actualIndex: number): boolean {
    return selections.includes(actualIndex);
  }

  function selectAll(value: boolean) {
    if (value) {
      selections = choices.map((_, i) => i);
    } else {
      selections = [];
    }
    if (onchange) onchange(selections);
  }

  function selectVisible(value: boolean) {
    if (value) {
      const newSel = new Set(selections);
      for (const idx of filteredIndices) {
        newSel.add(idx);
      }
      selections = Array.from(newSel).sort((a, b) => a - b);
    } else {
      const filterSet = new Set(filteredIndices);
      selections = selections.filter((s) => !filterSet.has(s));
    }
    if (onchange) onchange(selections);
  }

  function handleFilterInput(val: string) {
    filterText = val;
    if (onfilter) onfilter(val);
  }

  function toggleMenu() {
    showMenu = !showMenu;
  }

  function handleMenuAction(action: 'all' | 'none' | 'visible' | 'invisible') {
    showMenu = false;
    switch (action) {
      case 'all': selectAll(true); break;
      case 'none': selectAll(false); break;
      case 'visible': selectVisible(true); break;
      case 'invisible': selectVisible(false); break;
    }
  }
</script>

<div class="checklist {className}">
  <!-- Filter bar -->
  <div class="cl-filter-bar">
    <TextInput
      placeholder="Search..."
      bind:value={filterText}
      oninput={handleFilterInput}
      icon=""
      class="cl-filter-input"
    />
    <button class="cl-menu-btn" on:click={toggleMenu} aria-label="Menu">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="3" r="1.5" fill="currentColor"/>
        <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
        <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
      </svg>
    </button>
  </div>

  <!-- Menu dropdown -->
  {#if showMenu}
    <div class="cl-menu">
      <button class="cl-menu-item" on:click={() => handleMenuAction('all')}>Select All</button>
      <button class="cl-menu-item" on:click={() => handleMenuAction('none')}>Deselect All</button>
      <button class="cl-menu-item" on:click={() => handleMenuAction('visible')}>Select Visible</button>
      <button class="cl-menu-item" on:click={() => handleMenuAction('invisible')}>Deselect Visible</button>
    </div>
  {/if}

  <!-- Info bar -->
  <div class="cl-info">{infoText}</div>

  <!-- Scrollable list -->
  <div
    class="cl-scroll"
    class:scroll-v={scrollStyle === 'vertical' || scrollStyle === 'both'}
    class:scroll-h={scrollStyle === 'horizontal' || scrollStyle === 'both'}
  >
    {#if filteredChoices.length === 0}
      <div class="cl-empty">No items match your filter.</div>
    {:else}
      {#each filteredChoices as choice, i}
        {@const actualIndex = filteredIndices[i]}
        <div class="cl-item">
          <CheckBox
            checked={isChecked(actualIndex)}
            label={choice}
            onchange={() => toggleItem(i)}
          />
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .checklist {
    display: flex;
    flex-direction: column;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    background: white;
  }

  .cl-filter-bar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px;
    border-bottom: 1px solid #e0e0e0;
  }

  .cl-filter-input {
    flex: 1;
  }

  .cl-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: #666;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.1s ease;
    flex-shrink: 0;
  }

  .cl-menu-btn:hover {
    background: #f0f0f0;
  }

  .cl-menu {
    position: absolute;
    z-index: 100;
    right: 8px;
    top: 44px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .cl-menu-item {
    display: block;
    width: 100%;
    padding: 8px 16px;
    border: none;
    background: transparent;
    font-size: 13px;
    color: #333;
    cursor: pointer;
    text-align: left;
    transition: background 0.1s ease;
  }

  .cl-menu-item:hover {
    background: #f5f5f5;
  }

  .cl-info {
    padding: 6px 12px;
    font-size: 11px;
    color: #888;
    border-bottom: 1px solid #f0f0f0;
  }

  .cl-scroll {
    max-height: 240px;
    overflow-y: auto;
    padding: 4px 0;
  }

  .cl-scroll.scroll-h {
    overflow-x: auto;
  }

  .cl-item {
    padding: 2px 8px;
  }

  .cl-empty {
    padding: 20px;
    text-align: center;
    color: #999;
    font-size: 13px;
  }
</style>
