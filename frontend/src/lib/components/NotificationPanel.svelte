<script lang="ts">
  /**
   * NotificationPanel - Matches OrcaSlicer's NotificationManager.
   * Displays dismissable notification messages at the bottom-right.
   */
  import {
    notifications,
    dismissNotification,
    clearNotifications,
  } from '../store';
  import { X, Info, AlertTriangle, AlertCircle, CheckCircle, Bell } from 'lucide-svelte';

  $: activeNotifications = $notifications.filter(n => !n.dismissed);

  function getIcon(level: string) {
    switch (level) {
      case 'info': return Info;
      case 'warning': return AlertTriangle;
      case 'error': return AlertCircle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  }

  function getColor(level: string) {
    switch (level) {
      case 'info': return '#3b82f6';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'success': return '#00e575';
      default: return '#3b82f6';
    }
  }
</script>

{#if activeNotifications.length > 0}
  <div class="notification-panel">
    <div class="notification-header">
      <Bell size={14} />
      <span class="notif-title">Notifications</span>
      <button class="clear-btn" on:click={clearNotifications}>Clear all</button>
    </div>
    <div class="notification-list">
      {#each activeNotifications as notif (notif.id)}
        <div class="notification-item level-{notif.level}">
          <div class="notif-icon" style="color: {getColor(notif.level)};">
            <svelte:component this={getIcon(notif.level)} size={14} />
          </div>
          <div class="notif-content">
            <span class="notif-message">{notif.message}</span>
          </div>
          <button
            class="notif-dismiss"
            on:click={() => dismissNotification(notif.id)}
            title="Dismiss"
          >
            <X size={12} />
          </button>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .notification-panel {
    position: fixed;
    bottom: 16px;
    right: 16px;
    width: 320px;
    max-height: 400px;
    background-color: var(--color-bg-sidebar);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    z-index: 500;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .notification-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--color-border);
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .notif-title {
    flex: 1;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .clear-btn {
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    font-size: 11px;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .clear-btn:hover {
    color: var(--color-text-primary);
    background-color: rgba(255, 255, 255, 0.05);
  }

  .notification-list {
    overflow-y: auto;
    max-height: 340px;
  }

  .notification-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    transition: background-color 0.15s ease;
  }

  .notification-item:hover {
    background-color: rgba(255, 255, 255, 0.02);
  }

  .notification-item:last-child {
    border-bottom: none;
  }

  .notif-icon {
    flex-shrink: 0;
    margin-top: 1px;
  }

  .notif-content {
    flex: 1;
    min-width: 0;
  }

  .notif-message {
    font-size: 12px;
    color: var(--color-text-primary);
    line-height: 1.4;
    word-wrap: break-word;
  }

  .notif-dismiss {
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 2px;
    border-radius: 3px;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .notification-item:hover .notif-dismiss {
    opacity: 1;
  }

  .notif-dismiss:hover {
    color: var(--color-text-primary);
    background-color: rgba(255, 255, 255, 0.08);
  }
</style>
