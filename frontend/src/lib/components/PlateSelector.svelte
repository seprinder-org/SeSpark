<script lang="ts">
  /**
   * PlateSelector - Matches OrcaSlicer's PartPlateList.
   * Allows switching between multiple build plates and
   * adding/removing plates.
   */
  import {
    plates,
    activePlateId,
    activePlate,
    addPlate,
    removePlate,
    platerObjects,
  } from '../store';
  import { Plus, Trash2, Layers, Check } from 'lucide-svelte';

  function selectPlate(id: number) {
    activePlateId.set(id);
  }

  function handleAddPlate() {
    addPlate();
  }

  function handleRemovePlate(id: number, e: MouseEvent) {
    e.stopPropagation();
    removePlate(id);
    // Switch to first plate if we removed the active one
    if ($activePlateId === id) {
      activePlateId.set(1);
    }
  }

  $: objectCount = (plateId: number) => {
    const plate = $plates.find(p => p.id === plateId);
    if (!plate) return 0;
    return plate.objectIds.length;
  };
</script>

<div class="plate-selector">
  <div class="plate-list">
    {#each $plates as plate (plate.id)}
      <div
        class="plate-tab"
        class:active={$activePlateId === plate.id}
        on:click={() => selectPlate(plate.id)}
        role="button"
        tabindex="0"
        on:keydown={(e) => e.key === 'Enter' && selectPlate(plate.id)}
      >
        <Layers size={12} />
        <span class="plate-name">{plate.name}</span>
        <span class="plate-count">{objectCount(plate.id)} obj</span>
        {#if $plates.length > 1}
          <button
            class="plate-remove"
            on:click={(e) => handleRemovePlate(plate.id, e)}
            title="Remove plate"
          >
            <Trash2 size={10} />
          </button>
        {/if}
        {#if $activePlateId === plate.id}
          <span class="active-indicator"></span>
        {/if}
      </div>
    {/each}
  </div>

  <button class="add-plate-btn" on:click={handleAddPlate} title="Add plate">
    <Plus size={14} />
  </button>
</div>

<style>
  .plate-selector {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 6px;
  }

  .plate-list {
    display: flex;
    gap: 3px;
    flex: 1;
    overflow-x: auto;
  }

  .plate-tab {
    position: relative;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 5px;
    cursor: pointer;
    color: var(--color-text-secondary);
    font-size: 11px;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .plate-tab:hover {
    background-color: rgba(255, 255, 255, 0.04);
    color: var(--color-text-primary);
  }

  .plate-tab.active {
    background-color: rgba(0, 229, 117, 0.08);
    border-color: rgba(0, 229, 117, 0.2);
    color: var(--color-accent);
  }

  .plate-name {
    font-weight: 600;
  }

  .plate-count {
    font-size: 10px;
    color: var(--color-text-muted);
  }

  .plate-remove {
    display: none;
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 1px;
    border-radius: 2px;
  }

  .plate-tab:hover .plate-remove {
    display: flex;
  }

  .plate-remove:hover {
    color: #ef4444;
    background-color: rgba(239, 68, 68, 0.1);
  }

  .active-indicator {
    position: absolute;
    bottom: -1px;
    left: 50%;
    transform: translateX(-50%);
    width: 16px;
    height: 2px;
    background-color: var(--color-accent);
    border-radius: 1px;
  }

  .add-plate-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: transparent;
    border: 1px dashed var(--color-border);
    border-radius: 5px;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }

  .add-plate-btn:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
    background-color: rgba(0, 229, 117, 0.05);
  }
</style>
