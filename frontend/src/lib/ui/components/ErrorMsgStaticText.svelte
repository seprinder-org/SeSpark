<script lang="ts">
  /**
   * ErrorMsgStaticText - Port of OrcaSlicer's ErrorMsgStaticText widget.
   * A styled static text for displaying error messages.
   */

  export let message: string = '';
  export let type: 'error' | 'warning' | 'info' | 'success' = 'error';
  export let className: string = '';

  const typeStyles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    error:   { bg: '#fff0f0', border: '#ffcccc', text: '#cc0000', icon: '✕' },
    warning: { bg: '#fff8e1', border: '#ffe082', text: '#e65100', icon: '⚠' },
    info:    { bg: '#e3f2fd', border: '#90caf9', text: '#1565c0', icon: 'ℹ' },
    success: { bg: '#e8f5e9', border: '#a5d6a7', text: '#2e7d32', icon: '✓' },
  };

  $: style = typeStyles[type] || typeStyles.error;
</script>

{#if message}
  <div
    class="error-msg {className} msg-{type}"
    style="
      --msg-bg: {style.bg};
      --msg-border: {style.border};
      --msg-text: {style.text};
    "
    role="alert"
  >
    <span class="msg-icon">{style.icon}</span>
    <span class="msg-text">{message}</span>
    <slot />
  </div>
{/if}

<style>
  .error-msg {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 6px;
    border: 1px solid var(--msg-border);
    background: var(--msg-bg);
    color: var(--msg-text);
    font-size: 13px;
    line-height: 1.4;
  }

  .msg-icon {
    flex-shrink: 0;
    font-size: 14px;
    line-height: 1.4;
  }

  .msg-text {
    flex: 1;
  }
</style>
