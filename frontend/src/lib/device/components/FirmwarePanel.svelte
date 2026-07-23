<script lang="ts">
  /**
   * FirmwarePanel - Firmware version info and upgrade management
   * Maps to: DevFirmware + DevFirmwareUpgradeInfo
   */
  import { RefreshCw, Zap, Download, CheckCircle, AlertTriangle } from 'lucide-svelte';
  import { selectedMachineFirmware, selectedMachineFirmwareUpgrade } from '../deviceStore';
  import { DevFirmwareUpgradingState } from '../types';

  export let onCheckUpdate: () => void = () => {};
  export let onStartUpdate: () => void = () => {};

  // Sync from stores
  let fwName = '';
  let fwVersion = '';
  let fwNewVersion = '';
  let fwSn = '';
  let fwHwVer = '';
  let upgradeState = DevFirmwareUpgradingState.UpgradingUnavaliable;
  let upgradeVersion = '';
  let upgradeDescription = '';

  $: {
    const fw = $selectedMachineFirmware;
    fwName = fw.name;
    fwVersion = fw.sw_ver;
    fwNewVersion = fw.sw_new_ver;
    fwSn = fw.sn;
    fwHwVer = fw.hw_ver;
  }

  $: {
    const upg = $selectedMachineFirmwareUpgrade;
    upgradeState = upg.state;
    upgradeVersion = upg.version;
    upgradeDescription = upg.description;
  }

  $: updateAvailable = upgradeState === DevFirmwareUpgradingState.UpgradingAvaliable;
  $: updateInProgress = upgradeState === DevFirmwareUpgradingState.UpgradingInProgress;
  $: updateFinished = upgradeState === DevFirmwareUpgradingState.UpgradingFinished;

  function getStateLabel(): string {
    if (updateInProgress) return 'Updating...';
    if (updateAvailable) return 'Update Available';
    if (updateFinished) return 'Up to Date';
    return 'No Updates';
  }
</script>

<div class="panel">
  <div class="panel-header-device">
    <RefreshCw size={16} color="#06b6d4" />
    <span>Firmware</span>
    <span class="fw-badge" class:available={updateAvailable} class:inprogress={updateInProgress}>
      {getStateLabel()}
    </span>
  </div>

  <div class="fw-info-grid">
    <div class="fw-info-row">
      <span class="fw-label">Current Version</span>
      <span class="fw-value">{fwVersion || 'Unknown'}</span>
    </div>
    {#if fwNewVersion}
      <div class="fw-info-row">
        <span class="fw-label">Latest Version</span>
        <span class="fw-value new-ver">{fwNewVersion}</span>
      </div>
    {/if}
    <div class="fw-info-row">
      <span class="fw-label">Hardware</span>
      <span class="fw-value">{fwHwVer || 'Unknown'}</span>
    </div>
    <div class="fw-info-row">
      <span class="fw-label">Serial</span>
      <span class="fw-value sn">{fwSn || 'Unknown'}</span>
    </div>
  </div>

  {#if upgradeDescription}
    <div class="fw-changelog">
      <span class="fw-changelog-label">Release Notes</span>
      <pre class="fw-changelog-text">{upgradeDescription}</pre>
    </div>
  {/if}

  <div class="fw-actions">
    {#if updateAvailable}
      <button class="btn-device btn-update" on:click={onStartUpdate}>
        <Download size={14} /> Install Update ({upgradeVersion || fwNewVersion})
      </button>
    {:else if updateInProgress}
      <button class="btn-device" disabled>
        <span class="spin"><RefreshCw size={14} /></span> Updating...
      </button>
    {:else}
      <button class="btn-device" on:click={onCheckUpdate}>
        <RefreshCw size={14} /> Check for Updates
      </button>
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
    margin-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    padding-bottom: 8px;
  }

  .fw-badge {
    margin-left: auto;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
  }

  .fw-badge.available {
    background-color: rgba(6, 182, 212, 0.1);
    border-color: rgba(6, 182, 212, 0.3);
    color: #06b6d4;
  }

  .fw-badge.inprogress {
    background-color: rgba(251, 191, 36, 0.1);
    border-color: rgba(251, 191, 36, 0.3);
    color: #fbbf24;
  }

  .fw-info-grid {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }

  .fw-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 8px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  .fw-label {
    font-size: 11px;
    color: var(--color-text-muted);
    font-weight: 500;
  }

  .fw-value {
    font-size: 12px;
    color: var(--color-text-primary);
    font-weight: 600;
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  }

  .fw-value.new-ver {
    color: #06b6d4;
  }

  .fw-value.sn {
    font-size: 10px;
  }

  .fw-changelog {
    margin-bottom: 12px;
  }

  .fw-changelog-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    display: block;
    margin-bottom: 4px;
  }

  .fw-changelog-text {
    background-color: rgba(0, 0, 0, 0.15);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 8px;
    font-size: 10px;
    color: var(--color-text-secondary);
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    white-space: pre-wrap;
    max-height: 80px;
    overflow-y: auto;
    margin: 0;
  }

  .fw-actions {
    display: flex;
  }

  .btn-device {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background-color: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 7px 14px;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
    width: 100%;
  }

  .btn-device:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.08);
    color: var(--color-text-primary);
  }

  .btn-device:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-update {
    background-color: rgba(6, 182, 212, 0.1);
    border-color: rgba(6, 182, 212, 0.3);
    color: #06b6d4;
  }

  .btn-update:hover {
    background-color: rgba(6, 182, 212, 0.2);
  }

  .spin {
    animation: spin 1.5s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
