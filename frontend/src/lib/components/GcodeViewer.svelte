<script lang="ts">
  import { sliceResult, showGcodeViewer, stlFileName } from '../store';
  import { X, Download, FileText, Check, Copy } from 'lucide-svelte';

  let copied = false;

  function handleClose() {
    showGcodeViewer.set(false);
  }

  function handleDownload() {
    if (!$sliceResult) return;
    const blob = new Blob([$sliceResult.gcode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = $stlFileName.replace(/\.[^/.]+$/, "") + ".gcode";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleCopy() {
    if (!$sliceResult) return;
    navigator.clipboard.writeText($sliceResult.gcode);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  // Optimize display: only show the first 1000 lines in the preview to prevent browser lag.
  $: linesToShow = $sliceResult 
    ? $sliceResult.gcode.split('\n').slice(0, 1000).join('\n') 
    : '';

  $: totalLines = $sliceResult 
    ? $sliceResult.gcode.split('\n').length 
    : 0;
</script>

{#if $showGcodeViewer && $sliceResult}
  <div class="gcode-modal-overlay">
    <div class="gcode-modal panel animate-zoom-in">
      <div class="modal-header">
        <FileText size={16} color="#00e575" />
        <div class="modal-titles">
          <h3>G-Code Preview</h3>
          <span class="file-lbl">{$stlFileName.replace(/\.[^/.]+$/, "")}.gcode</span>
        </div>
        <button class="close-icon-btn" on:click={handleClose} title="Close window">
          <X size={18} />
        </button>
      </div>

      <div class="modal-body">
        <div class="lines-notice">
          Showing first 1000 lines of {totalLines.toLocaleString()} total G-code lines. 
          To run this print, export the full file to your printer.
        </div>
        
        <div class="gcode-display-box">
          <pre><code>{linesToShow}</code></pre>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary-modal" on:click={handleCopy}>
          {#if copied}
            <Check size={14} color="#00e575" />
            Copied!
          {:else}
            <Copy size={14} />
            Copy to Clipboard
          {/if}
        </button>
        <button class="btn btn-primary-modal" on:click={handleDownload}>
          <Download size={14} />
          Export G-Code File
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .gcode-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .gcode-modal {
    width: 80%;
    max-width: 800px;
    height: 80%;
    background-color: var(--color-bg-sidebar);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  }

  .modal-header {
    height: 52px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--color-border);
  }

  .modal-titles {
    display: flex;
    flex-direction: column;
  }

  .modal-titles h3 {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
  }

  .file-lbl {
    font-size: 11px;
    color: var(--color-text-muted);
  }

  .close-icon-btn {
    margin-left: auto;
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    transition: background-color 0.15s ease;
  }

  .close-icon-btn:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: white;
  }

  .modal-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow: hidden;
    gap: 12px;
  }

  .lines-notice {
    font-size: 11px;
    color: #93c5fd;
    background-color: rgba(59, 130, 246, 0.08);
    border: 1px solid rgba(59, 130, 246, 0.15);
    border-radius: 6px;
    padding: 8px 12px;
    line-height: 1.4;
  }

  .gcode-display-box {
    flex: 1;
    background-color: #0b0f19;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 12px;
    overflow-y: auto;
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    color: #a3b8cc;
  }

  .gcode-display-box pre {
    margin: 0;
  }

  .modal-footer {
    height: 56px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    border-top: 1px solid var(--color-border);
  }

  .btn {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 34px;
    padding: 0 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.15s ease;
  }

  .btn-primary-modal {
    background-color: var(--color-accent);
    color: #0b0f19;
  }

  .btn-primary-modal:hover {
    background-color: #00ff84;
    box-shadow: 0 4px 12px rgba(0, 229, 117, 0.2);
  }

  .btn-secondary-modal {
    background-color: #27272a;
    color: #e4e4e7;
    border: 1px solid #3f3f46;
  }

  .btn-secondary-modal:hover {
    background-color: #3f3f46;
    color: white;
  }

  .animate-zoom-in {
    animation: zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes zoomIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
