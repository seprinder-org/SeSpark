<script lang="ts">
  /**
   * HMSPanel - HMS (Human-Machine System) error/warning messages
   * Maps to: DevHMS + DevHMSItem
   */
  import { AlertTriangle, Info, AlertCircle, XCircle, CheckCircle } from 'lucide-svelte';
  import { selectedMachineHMS } from '../deviceStore';
  import { HMSMessageLevel, getHMSLevelLabel } from '../types';
  import type { HMSItem } from '../types';

  export let onDismissMessage: (index: number) => void = () => {};
  export let onClearAll: () => void = () => {};

  let items: HMSItem[] = [];

  $: {
    items = $selectedMachineHMS.items;
  }

  function getLevelIcon(level: HMSMessageLevel) {
    switch (level) {
      case HMSMessageLevel.FATAL: return XCircle;
      case HMSMessageLevel.SERIOUS: return AlertCircle;
      case HMSMessageLevel.COMMON: return AlertTriangle;
      case HMSMessageLevel.INFO: return Info;
      default: return Info;
    }
  }

  function getLevelColor(level: HMSMessageLevel): string {
    switch (level) {
      case HMSMessageLevel.FATAL: return '#ef4444';
      case HMSMessageLevel.SERIOUS: return '#f97316';
      case HMSMessageLevel.COMMON: return '#eab308';
      case HMSMessageLevel.INFO: return '#22d3ee';
      default: return 'var(--color-text-muted)';
    }
  }

  function formatCode(item: HMSItem): string {
    return `HMS_${item.msg_code.toString().padStart(4, '0')}`;
  }

  function formatModule(item: HMSItem): string {
    const moduleNames: Record<number, string> = {
      0x00: 'Unknown', 0x03: 'MC', 0x05: 'Mainboard',
      0x07: 'AMS', 0x08: 'TH', 0x0C: 'XCAM',
    };
    return moduleNames[item.module_id] ?? `0x${item.module_id.toString(16)}`;
  }
</script>

<div class="panel">
  <div class="panel-header-device">
    <AlertTriangle size={16} color="#eab308" />
    <span>HMS Messages</span>
    {#if items.length > 0}
      <span class="hms-count">{items.length}</span>
    {/if}
    {#if items.length > 0}
      <button class="clear-all-btn" on:click={onClearAll} title="Clear all messages">
        <CheckCircle size={12} /> Clear All
      </button>
    {/if}
  </div>

  <div class="hms-list">
    {#if items.length === 0}
      <div class="hms-empty">
        <CheckCircle size={24} color="var(--color-accent)" />
        <span class="hms-empty-text">No HMS messages. System is operating normally.</span>
      </div>
    {:else}
      {#each items as item, i}
        {@const Icon = getLevelIcon(item.msg_level)}
        <div class="hms-item" style="border-left-color: {getLevelColor(item.msg_level)}">
          <div class="hms-item-header">
            <Icon size={14} color={getLevelColor(item.msg_level)} />
            <span class="hms-level" style="color: {getLevelColor(item.msg_level)}">
              {getHMSLevelLabel(item.msg_level)}
            </span>
            <span class="hms-code">{formatCode(item)}</span>
            <span class="hms-module">{formatModule(item)}</span>
            {#if !item.already_read}
              <span class="hms-new-badge">New</span>
            {/if}
            <button class="hms-dismiss" on:click={() => onDismissMessage(i)} title="Dismiss">
              <XCircle size={12} />
            </button>
          </div>
          <div class="hms-msg">{item.long_error_code || `Error code ${item.msg_code}`}</div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .panel {
    background-color: var(--color-bg-sidebar);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
  }

  .panel-header-device {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    padding-bottom: 8px;
  }

  .hms-count {
    background-color: rgba(234, 179, 8, 0.15);
    color: #eab308;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 7px;
    border-radius: 10px;
  }

  .clear-all-btn {
    margin-left: auto;
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 10px;
    color: var(--color-text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 3px;
    font-family: inherit;
    transition: all 0.15s ease;
  }

  .clear-all-btn:hover {
    background-color: rgba(255, 255, 255, 0.06);
    color: var(--color-text-secondary);
  }

  .hms-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 300px;
    overflow-y: auto;
  }

  .hms-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px;
    color: var(--color-text-muted);
  }

  .hms-empty-text {
    font-size: 11px;
  }

  .hms-item {
    background-color: rgba(0, 0, 0, 0.12);
    border: 1px solid var(--color-border);
    border-left: 3px solid;
    border-radius: 6px;
    padding: 8px 10px;
  }

  .hms-item-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }

  .hms-level {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .hms-code {
    font-size: 10px;
    font-weight: 600;
    color: var(--color-text-muted);
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  }

  .hms-module {
    font-size: 9px;
    color: var(--color-text-muted);
    background-color: rgba(255, 255, 255, 0.04);
    padding: 1px 5px;
    border-radius: 3px;
  }

  .hms-new-badge {
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    background-color: rgba(234, 179, 8, 0.15);
    color: #eab308;
    padding: 1px 5px;
    border-radius: 3px;
  }

  .hms-dismiss {
    margin-left: auto;
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    opacity: 0.5;
    transition: opacity 0.15s ease;
  }

  .hms-dismiss:hover {
    opacity: 1;
    color: var(--color-text-secondary);
  }

  .hms-msg {
    font-size: 11px;
    color: var(--color-text-secondary);
    line-height: 1.4;
    padding-left: 20px;
  }
</style>
