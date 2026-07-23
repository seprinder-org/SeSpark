<script lang="ts">
  /**
   * ObjectList - Matches OrcaSlicer's object list panel in the Sidebar.
   * Displays all loaded 3D objects on the current plate with per-object
   * visibility, selection, and deletion controls.
   */
  import {
    platerObjects,
    selectedObjectId,
    selectPlaterObject,
    removePlaterObject,
    activePlate,
    stlFileName,
    stlFileBytes,
    slicingStatus,
    sliceResult,
    modelDimensions,
  } from '../store';
  import { Box, Eye, EyeOff, Trash2, Layers, Plus } from 'lucide-svelte';

  function handleObjectClick(id: string) {
    selectPlaterObject(id);
  }

  function handleDelete(id: string, e: MouseEvent) {
    e.stopPropagation();
    removePlaterObject(id);
  }

  function handleToggleVisibility(id: string, e: MouseEvent) {
    e.stopPropagation();
    platerObjects.update(list =>
      list.map(o => o.id === id ? { ...o, visible: !o.visible } : o)
    );
  }
</script>

<div class="object-list-panel">
  <div class="panel-header">
    <Layers size={14} />
    <span class="panel-title">Objects</span>
    <span class="object-count">{$platerObjects.length}</span>
  </div>

  {#if $platerObjects.length === 0}
    <div class="empty-state">
      <Box size={24} class="empty-icon" />
      <span class="empty-text">No objects loaded</span>
      <span class="empty-hint">Drop an STL file or use File > Open</span>
    </div>
  {:else}
    <div class="object-list">
      {#each $platerObjects as obj (obj.id)}
        <div
          class="object-item"
          class:selected={$selectedObjectId === obj.id}
          on:click={() => handleObjectClick(obj.id)}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === 'Enter' && handleObjectClick(obj.id)}
        >
          <div class="object-color-indicator" style="background-color: #90caf9;"></div>
          <div class="object-info">
            <span class="object-name">{obj.name}</span>
            <span class="object-filename">{obj.filename}</span>
          </div>
          <div class="object-actions">
            <button
              class="icon-btn"
              title={obj.visible ? 'Hide' : 'Show'}
              on:click={(e) => handleToggleVisibility(obj.id, e)}
            >
              {#if obj.visible}
                <Eye size={14} />
              {:else}
                <EyeOff size={14} />
              {/if}
            </button>
            <button
              class="icon-btn danger"
              title="Remove object"
              on:click={(e) => handleDelete(obj.id, e)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .object-list-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text-primary);
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .object-count {
    margin-left: auto;
    background-color: var(--color-border);
    color: var(--color-text-secondary);
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 8px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 24px 16px;
    color: var(--color-text-muted);
  }

  .empty-icon {
    opacity: 0.4;
  }

  .empty-text {
    font-size: 13px;
    font-weight: 600;
  }

  .empty-hint {
    font-size: 11px;
    text-align: center;
    opacity: 0.7;
  }

  .object-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px;
  }

  .object-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 6px;
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    width: 100%;
    text-align: left;
    color: var(--color-text-primary);
    transition: background-color 0.15s ease;
  }

  .object-item:hover {
    background-color: rgba(255, 255, 255, 0.04);
  }

  .object-item.selected {
    background-color: rgba(0, 229, 117, 0.08);
    border-color: rgba(0, 229, 117, 0.2);
  }

  .object-color-indicator {
    width: 4px;
    height: 28px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .object-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .object-name {
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .object-filename {
    font-size: 10px;
    color: var(--color-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .object-actions {
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .object-item:hover .object-actions {
    opacity: 1;
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .icon-btn:hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: var(--color-text-primary);
  }

  .icon-btn.danger:hover {
    background-color: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }
</style>
