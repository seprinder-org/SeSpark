<script lang="ts">
  /**
   * ConsolePanel - G-code terminal / command console
   * Maps to: DevCtrl (command interface)
   */
  import { Terminal, Send, Trash2 } from 'lucide-svelte';

  export let logs: string[] = [
    'System initialized.',
    'Ready.',
  ];
  export let onSendCommand: (cmd: string) => void = () => {};

  let cmdInput = '';
  let consoleEl: HTMLDivElement;

  // Auto-scroll to bottom when new logs appear
  $: if (consoleEl) {
    requestAnimationFrame(() => {
      consoleEl.scrollTop = consoleEl.scrollHeight;
    });
  }

  function handleSend() {
    const cmd = cmdInput.trim();
    if (!cmd) return;
    onSendCommand(cmd);
    cmdInput = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSend();
    }
  }

  function clearLogs() {
    logs = [];
  }
</script>

<div class="panel">
  <div class="panel-header-device">
    <Terminal size={16} color="#22d3ee" />
    <span>Console</span>
    <button class="clear-btn" on:click={clearLogs} title="Clear console">
      <Trash2 size={12} />
    </button>
  </div>

  <div class="console-output" bind:this={consoleEl}>
    {#each logs as log, i}
      <div class="log-line" class:cmd={log.startsWith('>')} class:ok={log === 'ok'}>
        {log}
      </div>
    {/each}
    {#if logs.length === 0}
      <div class="log-empty">No commands sent yet.</div>
    {/if}
  </div>

  <div class="console-input-row">
    <input
      type="text"
      class="console-input"
      placeholder="Enter G-code..."
      bind:value={cmdInput}
      on:keydown={handleKeydown}
    />
    <button class="send-btn" on:click={handleSend} disabled={!cmdInput.trim()}>
      <Send size={14} />
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
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    padding-bottom: 8px;
  }

  .clear-btn {
    margin-left: auto;
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 3px 6px;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
  }

  .clear-btn:hover {
    background-color: rgba(255, 255, 255, 0.06);
    color: var(--color-text-secondary);
  }

  .console-output {
    background-color: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 10px;
    height: 160px;
    overflow-y: auto;
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    font-size: 11px;
    line-height: 1.6;
    margin-bottom: 8px;
  }

  .log-line {
    color: var(--color-text-secondary);
    white-space: pre-wrap;
    word-break: break-all;
  }

  .log-line.cmd {
    color: #22d3ee;
    font-weight: 600;
  }

  .log-line.ok {
    color: var(--color-accent);
  }

  .log-empty {
    color: var(--color-text-muted);
    font-style: italic;
  }

  .console-input-row {
    display: flex;
    gap: 6px;
  }

  .console-input {
    flex: 1;
    background-color: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 12px;
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    color: var(--color-text-primary);
    outline: none;
    transition: border-color 0.15s ease;
  }

  .console-input:focus {
    border-color: rgba(34, 211, 238, 0.4);
  }

  .console-input::placeholder {
    color: var(--color-text-muted);
    font-family: inherit;
  }

  .send-btn {
    background-color: rgba(34, 211, 238, 0.1);
    border: 1px solid rgba(34, 211, 238, 0.25);
    border-radius: 6px;
    padding: 8px 12px;
    color: #22d3ee;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
  }

  .send-btn:hover:not(:disabled) {
    background-color: rgba(34, 211, 238, 0.2);
  }

  .send-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
