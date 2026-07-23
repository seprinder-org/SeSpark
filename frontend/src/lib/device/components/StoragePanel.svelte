<script lang="ts">
  /**
   * StoragePanel - SD card / storage status
   * Maps to: DevStorage
   */
  import { HardDrive, AlertTriangle, CheckCircle } from 'lucide-svelte';
  import { selectedMachineStorage } from '../deviceStore';
  import { SdcardState, getSdcardStateLabel } from '../types';

  let sdcardState = SdcardState.NO_SDCARD;

  $: {
    sdcardState = $selectedMachineStorage.sdcard_state;
  }

  function getStateColor(): string {
    switch (sdcardState) {
      case SdcardState.HAS_SDCARD_NORMAL: return 'var(--color-accent)';
      case SdcardState.NO_SDCARD: return 'var(--color-text-muted)';
      case SdcardState.HAS_SDCARD_ABNORMAL: return '#ef4444';
      case SdcardState.HAS_SDCARD_READONLY: return '#eab308';
      default: return 'var(--color-text-muted)';
    }
  }
</script>

<div class="panel">
  <div class="panel-header-device">
    <HardDrive size={16} color={getStateColor()} />
    <span>Storage</span>
  </div>

  <div class="storage-status">
    {#if sdcardState === SdcardState.HAS_SDCARD_NORMAL}
      <CheckCircle size={24} color={getStateColor()} />
    {:else if sdcardState === SdcardState.NO_SDCARD}
      <HardDrive size={24} color={getStateColor()} />
    {:else}
      <AlertTriangle size={24} color={getStateColor()} />
    {/if}
    <div class="storage-text">
      <span class="storage-state" style="color: {getStateColor()}">
        {getSdcardStateLabel(sdcardState)}
      </span>
      <span class="storage-desc">
        {#if sdcardState === SdcardState.HAS_SDCARD_NORMAL}
          SD card detected and operational
        {:else if sdcardState === SdcardState.NO_SDCARD}
          No SD card inserted
        {:else if sdcardState === SdcardState.HAS_SDCARD_ABNORMAL}
          SD card error detected
        {:else if sdcardState === SdcardState.HAS_SDCARD_READONLY}
          SD card is in read-only mode
        {/if}
      </span>
    </div>
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
    margin-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    padding-bottom: 8px;
  }

  .storage-status {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px;
    background-color: rgba(0, 0, 0, 0.1);
    border: 1px solid var(--color-border);
    border-radius: 6px;
  }

  .storage-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .storage-state {
    font-size: 13px;
    font-weight: 700;
  }

  .storage-desc {
    font-size: 11px;
    color: var(--color-text-muted);
  }
</style>
