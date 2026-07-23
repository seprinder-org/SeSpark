<script lang="ts">
  /**
   * SearchDialog - Matches OrcaSlicer's search functionality.
   * Allows searching through settings, presets, and actions.
   */
  import { showSearchDialog, searchQuery } from '../store';
  import { Search, X, Sliders, Printer, Droplets, Settings, Command } from 'lucide-svelte';

  // Mock search results - in a full implementation this would search
  // through all available settings, presets, and actions
  let searchResults: { category: string; items: { label: string; description: string }[] }[] = [];
  let selectedIndex = 0;

  $: if ($searchQuery.trim()) {
    const q = $searchQuery.toLowerCase();
    searchResults = [
      {
        category: 'Settings',
        items: [
          { label: 'Layer Height', description: 'Set the height of each printed layer' },
          { label: 'Wall Loops', description: 'Number of wall perimeters' },
          { label: 'Infill Density', description: 'Density of the infill pattern' },
          { label: 'Print Speed', description: 'Speed of printing movements' },
        ].filter(i => i.label.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)),
      },
      {
        category: 'Presets',
        items: [
          { label: 'Printer Presets', description: 'Switch printer configuration' },
          { label: 'Filament Presets', description: 'Switch filament material' },
          { label: 'Process Presets', description: 'Switch slicing profile' },
        ].filter(i => i.label.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)),
      },
      {
        category: 'Actions',
        items: [
          { label: 'Slice Plate', description: 'Start slicing the current plate' },
          { label: 'Export G-Code', description: 'Export sliced G-code to file' },
          { label: 'Send to Printer', description: 'Send G-code to connected printer' },
          { label: 'Calibration', description: 'Open calibration wizard' },
        ].filter(i => i.label.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)),
      },
    ].filter(group => group.items.length > 0);
    selectedIndex = 0;
  } else {
    searchResults = [];
  }

  function handleClose() {
    showSearchDialog.set(false);
    searchQuery.set('');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const total = searchResults.reduce((acc: number, g) => acc + g.items.length, 0);
      selectedIndex = Math.min(selectedIndex + 1, total - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // In a full implementation, this would navigate to the selected item
      handleClose();
    }
  }

  function getCategoryIcon(category: string) {
    switch (category) {
      case 'Settings': return Sliders;
      case 'Presets': return Printer;
      case 'Actions': return Settings;
      default: return Search;
    }
  }
</script>

{#if $showSearchDialog}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="search-overlay" on:click={handleClose}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="search-dialog" on:click|stopPropagation>
      <div class="search-input-wrapper">
        <Search size={16} class="search-prefix" />
        <input
          type="text"
          class="search-input"
          placeholder="Search settings, presets, actions..."
          bind:value={$searchQuery}
          on:keydown={handleKeydown}
          autofocus
        />
        <button class="search-close" on:click={handleClose}>
          <X size={16} />
        </button>
      </div>

      {#if searchResults.length > 0}
        <div class="search-results">
          {#each searchResults as group, gi}
            <div class="search-category">
              <div class="category-header">
                <svelte:component this={getCategoryIcon(group.category)} size={12} />
                <span>{group.category}</span>
              </div>
              {#each group.items as item, ii}
                {@const globalIndex = searchResults
                  .slice(0, gi)
                  .reduce((acc: number, g) => acc + g.items.length, 0) + ii}
                <button
                  class="search-result-item"
                  class:highlighted={globalIndex === selectedIndex}
                  on:click={handleClose}
                >
                  <span class="result-label">{item.label}</span>
                  <span class="result-description">{item.description}</span>
                </button>
              {/each}
            </div>
          {/each}
        </div>
      {:else if $searchQuery.trim()}
        <div class="no-results">
          <span>No results found for "{$searchQuery}"</span>
        </div>
      {/if}

      <div class="search-footer">
        <span class="shortcut"><Command size={12} />K</span>
        <span class="shortcut-hint">to open search</span>
        <span class="shortcut-sep">|</span>
        <span class="shortcut"><span class="key">ESC</span></span>
        <span class="shortcut-hint">to close</span>
        <span class="shortcut-sep">|</span>
        <span class="shortcut"><span class="key">↑↓</span></span>
        <span class="shortcut-hint">to navigate</span>
        <span class="shortcut-sep">|</span>
        <span class="shortcut"><span class="key">↵</span></span>
        <span class="shortcut-hint">to select</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 80px;
    z-index: 1000;
  }

  .search-dialog {
    width: 520px;
    max-height: 480px;
    background-color: var(--color-bg-sidebar);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .search-input-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border);
  }

  .search-prefix {
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--color-text-primary);
    font-size: 14px;
  }

  .search-input::placeholder {
    color: var(--color-text-muted);
  }

  .search-close {
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
  }

  .search-close:hover {
    color: var(--color-text-primary);
    background-color: rgba(255, 255, 255, 0.05);
  }

  .search-results {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }

  .search-category {
    display: flex;
    flex-direction: column;
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 16px;
    font-size: 10px;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .search-result-item {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 8px 16px;
    background: transparent;
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: background-color 0.1s ease;
  }

  .search-result-item:hover,
  .search-result-item.highlighted {
    background-color: rgba(255, 255, 255, 0.04);
  }

  .result-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .result-description {
    font-size: 11px;
    color: var(--color-text-muted);
  }

  .no-results {
    padding: 24px 16px;
    text-align: center;
    color: var(--color-text-muted);
    font-size: 13px;
  }

  .search-footer {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    border-top: 1px solid var(--color-border);
    font-size: 11px;
    color: var(--color-text-muted);
  }

  .shortcut {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    color: var(--color-text-secondary);
  }

  .key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    background-color: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--color-border);
    border-radius: 3px;
    font-size: 10px;
    font-weight: 600;
  }

  .shortcut-hint {
    color: var(--color-text-muted);
  }

  .shortcut-sep {
    margin: 0 4px;
    opacity: 0.3;
  }
</style>
