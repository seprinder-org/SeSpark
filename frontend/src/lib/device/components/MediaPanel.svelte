<script lang="ts">
  /**
   * MediaPanel - Camera / live view panel
   * Maps to: Camera stream (external to DeviceCore but part of device UI)
   */
  import { Camera, Monitor, Wifi, WifiOff } from 'lucide-svelte';

  export let cameraConnected = false;
  export let cameraUrl = '';
  export let onToggleCamera: () => void = () => {};
</script>

<div class="panel">
  <div class="panel-header-device">
    <Camera size={16} color="#06b6d4" />
    <span>Media</span>
    <span class="cam-badge" class:connected={cameraConnected}>
      {cameraConnected ? 'Connected' : 'Disconnected'}
    </span>
  </div>

  <div class="camera-view">
    {#if cameraConnected && cameraUrl}
      <img src={cameraUrl} alt="Camera feed" class="cam-feed" />
    {:else}
      <div class="cam-placeholder">
        <Monitor size={48} />
        <span class="cam-placeholder-text">
          {cameraConnected ? 'No camera URL configured' : 'Camera not connected'}
        </span>
      </div>
    {/if}
  </div>

  <div class="cam-controls">
    <button class="btn-device" class:active={cameraConnected} on:click={onToggleCamera}>
      {#if cameraConnected}
        <WifiOff size={14} /> Disconnect
      {:else}
        <Wifi size={14} /> Connect Camera
      {/if}
    </button>
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

  .cam-badge {
    margin-left: auto;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .cam-badge.connected {
    background-color: rgba(0, 229, 117, 0.1);
    color: var(--color-accent);
    border-color: rgba(0, 229, 117, 0.2);
  }

  .camera-view {
    background-color: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin-bottom: 10px;
  }

  .cam-feed {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cam-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--color-text-muted);
  }

  .cam-placeholder-text {
    font-size: 11px;
    font-weight: 500;
  }

  .cam-controls {
    display: flex;
  }

  .btn-device {
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
    width: 100%;
    justify-content: center;
  }

  .btn-device:hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: var(--color-text-primary);
  }

  .btn-device.active {
    background-color: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }
</style>
