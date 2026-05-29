<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { 
    Thermometer, 
    Wind, 
    Terminal, 
    ArrowUp, 
    ArrowDown, 
    ArrowLeft, 
    ArrowRight, 
    Home, 
    Activity, 
    Send,
    Play,
    Pause,
    Square
  } from 'lucide-svelte';

  // State
  let hotendTemp = 23.4;
  let bedTemp = 22.8;
  
  let targetHotend = 0;
  let targetBed = 0;
  
  let printerState: 'Idle' | 'Heating' | 'Printing' | 'Paused' = 'Idle';
  let printProgress = 0;
  let fanSpeedPercent = 0;

  // Console terminal logs
  let consoleLogs: string[] = [
    "Connecting to printer over WebSocket...",
    "Printer connected! Firmware: Klipper v0.12.0",
    "MCU: rpi, octopus_pro",
    "Heaters initialized.",
    "Ready."
  ];
  let cmdInput = "";

  // Temperature mock history for chart drawing
  let tempHistory: { hotend: number; bed: number }[] = Array.from({ length: 30 }, () => ({ hotend: 23, bed: 22 }));

  function sendCommand() {
    if (!cmdInput.trim()) return;
    const cmd = cmdInput.trim().toUpperCase();
    consoleLogs = [...consoleLogs, `> ${cmd}`];
    
    // Command parser mock
    if (cmd.startsWith("G28")) {
      consoleLogs = [...consoleLogs, "echo: Homing all axes...", "echo: Homing completed successfully."];
    } else if (cmd.startsWith("M104") || cmd.startsWith("M109")) {
      const match = cmd.match(/S(\d+)/);
      if (match) {
        targetHotend = parseInt(match[1]);
        printerState = targetHotend > 0 ? 'Heating' : 'Idle';
        consoleLogs = [...consoleLogs, `echo: Setting hotend target to ${targetHotend}°C...`];
      }
    } else if (cmd.startsWith("M140") || cmd.startsWith("M190")) {
      const match = cmd.match(/S(\d+)/);
      if (match) {
        targetBed = parseInt(match[1]);
        printerState = targetBed > 0 ? 'Heating' : 'Idle';
        consoleLogs = [...consoleLogs, `echo: Setting bed target to ${targetBed}°C...`];
      }
    } else if (cmd === "CLEAR") {
      consoleLogs = [];
    } else {
      consoleLogs = [...consoleLogs, `echo: Command '${cmd}' sent to MCU.`, "ok"];
    }

    cmdInput = "";
    // Auto-scroll console
    setTimeout(() => {
      const el = document.getElementById("terminal-console");
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      sendCommand();
    }
  }

  function preheatPLA() {
    targetHotend = 220;
    targetBed = 60;
    printerState = 'Heating';
    consoleLogs = [...consoleLogs, "> PREHEAT PLA", "echo: Heating bed to 60C, hotend to 220C..."];
  }

  function cooldown() {
    targetHotend = 0;
    targetBed = 0;
    printerState = 'Idle';
    consoleLogs = [...consoleLogs, "> COOLDOWN", "echo: Shutting off all heaters..."];
  }

  function homeAll() {
    consoleLogs = [...consoleLogs, "> G28", "echo: Homing all axes..."];
  }

  // Set up interval for temperature updates and chart
  let intervalId: any;
  onMount(() => {
    intervalId = setInterval(() => {
      // Smoothly heat up towards target
      if (hotendTemp < targetHotend) {
        hotendTemp = Math.min(targetHotend, hotendTemp + (targetHotend - hotendTemp) * 0.1 + 1.5);
      } else if (hotendTemp > targetHotend) {
        hotendTemp = Math.max(targetHotend, hotendTemp - (hotendTemp - targetHotend) * 0.05 - 0.8);
      } else {
        // slight jitter
        hotendTemp = Math.max(20, hotendTemp + (Math.random() - 0.5) * 0.2);
      }

      if (bedTemp < targetBed) {
        bedTemp = Math.min(targetBed, bedTemp + (targetBed - bedTemp) * 0.05 + 0.5);
      } else if (bedTemp > targetBed) {
        bedTemp = Math.max(targetBed, bedTemp - (bedTemp - targetBed) * 0.03 - 0.4);
      } else {
        // slight jitter
        bedTemp = Math.max(20, bedTemp + (Math.random() - 0.5) * 0.1);
      }

      // Check if heated
      if (printerState === 'Heating' && Math.abs(hotendTemp - targetHotend) < 2 && Math.abs(bedTemp - targetBed) < 2 && targetHotend > 0) {
        printerState = 'Idle';
        consoleLogs = [...consoleLogs, "echo: Target temperatures reached. System ready."];
      }

      // Append history
      tempHistory = [...tempHistory.slice(1), { hotend: hotendTemp, bed: bedTemp }];
    }, 1000);
  });

  onDestroy(() => {
    clearInterval(intervalId);
  });
</script>

<div class="device-dashboard animate-fade-in">
  <!-- Left Side: Status & Jog Controls -->
  <div class="controls-column">
    
    <!-- Status Card -->
    <div class="panel status-panel-device">
      <div class="panel-header-device">
        <Activity size={16} color="#00e575" />
        <span>Printer Status</span>
        <span class="status-badge" class:active={printerState !== 'Idle'}>{printerState}</span>
      </div>
      <div class="status-indicators">
        <div class="indicator-box">
          <span class="ind-lbl">Hotend Temp</span>
          <span class="ind-val">{hotendTemp.toFixed(1)}°C <span class="target">/ {targetHotend}°C</span></span>
        </div>
        <div class="indicator-box">
          <span class="ind-lbl">Bed Temp</span>
          <span class="ind-val">{bedTemp.toFixed(1)}°C <span class="target">/ {targetBed}°C</span></span>
        </div>
        <div class="indicator-box">
          <span class="ind-lbl">Fan Speed</span>
          <span class="ind-val">{fanSpeedPercent}%</span>
        </div>
        <div class="indicator-box">
          <span class="ind-lbl">Job Progress</span>
          <span class="ind-val">{printProgress}%</span>
        </div>
      </div>

      <!-- Quick Action Controls -->
      <div class="quick-controls">
        <button class="btn btn-secondary-device" on:click={preheatPLA}>Preheat PLA</button>
        <button class="btn btn-danger-device" on:click={cooldown}>Cooldown</button>
      </div>
    </div>

    <!-- Jog controls (X/Y/Z motions) -->
    <div class="panel jog-panel">
      <div class="panel-header-device">
        <Home size={15} />
        <span>Manual Jog Control</span>
      </div>
      
      <div class="jog-layout">
        <!-- X/Y Pad -->
        <div class="xy-pad">
          <span class="pad-title">X / Y Control</span>
          <div class="arrow-grid">
            <div></div>
            <button class="arrow-btn" title="Move Y+ (Back)"><ArrowUp size={16} /></button>
            <div></div>
            
            <button class="arrow-btn" title="Move X- (Left)"><ArrowLeft size={16} /></button>
            <button class="arrow-btn home-btn" on:click={homeAll} title="Home X/Y/Z"><Home size={14} /></button>
            <button class="arrow-btn" title="Move X+ (Right)"><ArrowRight size={16} /></button>
            
            <div></div>
            <button class="arrow-btn" title="Move Y- (Forward)"><ArrowDown size={16} /></button>
            <div></div>
          </div>
        </div>

        <!-- Z Pad -->
        <div class="z-pad">
          <span class="pad-title">Z Control</span>
          <div class="z-column">
            <button class="arrow-btn z-btn" title="Move Z+ (Up)"><ArrowUp size={16} /> Z+</button>
            <button class="arrow-btn z-btn" title="Home Z"><Home size={14} /></button>
            <button class="arrow-btn z-btn" title="Move Z- (Down)"><ArrowDown size={16} /> Z-</button>
          </div>
        </div>

        <!-- Extruder Pad -->
        <div class="ext-pad">
          <span class="pad-title">Extruder</span>
          <div class="ext-buttons">
            <button class="btn btn-secondary-device">Extrude 10mm</button>
            <button class="btn btn-secondary-device">Retract 10mm</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Right Side: Temperature Chart & Terminal Console -->
  <div class="feedback-column">
    
    <!-- Temperature Chart Grid -->
    <div class="panel temp-chart-panel">
      <div class="panel-header-device">
        <Thermometer size={15} />
        <span>Temperature Plot (°C)</span>
      </div>
      <div class="chart-container">
        <!-- Basic SVG-based line chart -->
        <svg viewBox="0 0 300 120" class="temp-svg">
          <!-- Grid lines -->
          <line x1="0" y1="30" x2="300" y2="30" stroke="var(--color-border)" stroke-dasharray="2,2" />
          <line x1="0" y1="60" x2="300" y2="60" stroke="var(--color-border)" stroke-dasharray="2,2" />
          <line x1="0" y1="90" x2="300" y2="90" stroke="var(--color-border)" stroke-dasharray="2,2" />
          
          <!-- Hotend Temp Line (Red) -->
          <polyline
            fill="none"
            stroke="#ef4444"
            stroke-width="2"
            points={tempHistory.map((t, i) => `${(i / 29) * 300},${120 - (t.hotend / 300) * 120}`).join(' ')}
          />
          
          <!-- Bed Temp Line (Blue) -->
          <polyline
            fill="none"
            stroke="#3b82f6"
            stroke-width="2"
            points={tempHistory.map((t, i) => `${(i / 29) * 300},${120 - (t.bed / 120) * 120}`).join(' ')}
          />
        </svg>
        <div class="chart-labels">
          <span class="chart-lbl-item"><span class="bullet hotend"></span> Hotend ({hotendTemp.toFixed(0)}°C)</span>
          <span class="chart-lbl-item"><span class="bullet bed"></span> Bed ({bedTemp.toFixed(0)}°C)</span>
        </div>
      </div>
    </div>

    <!-- G-code Console Terminal -->
    <div class="panel console-panel">
      <div class="panel-header-device">
        <Terminal size={15} />
        <span>G-Code Console</span>
        <button class="clear-btn" on:click={() => consoleLogs = []}>Clear</button>
      </div>
      
      <div class="terminal-logs" id="terminal-console">
        {#each consoleLogs as log}
          <div class="log-line" class:user-cmd={log.startsWith('>')}>{log}</div>
        {/each}
      </div>

      <div class="console-input-row">
        <input 
          type="text" 
          placeholder="Send G-code command (e.g. G28, M104 S220)..." 
          bind:value={cmdInput} 
          on:keydown={handleKeydown}
        />
        <button class="send-btn" on:click={sendCommand} title="Send Command">
          <Send size={14} />
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .device-dashboard {
    display: flex;
    gap: 16px;
    padding: 16px;
    height: 100%;
    flex: 1;
    overflow-y: auto;
    background-color: var(--color-bg);
  }

  .controls-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 480px;
  }

  .feedback-column {
    flex: 1.2;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Panels */
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
    margin-bottom: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    padding-bottom: 8px;
  }

  .status-badge {
    margin-left: auto;
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  .status-badge.active {
    background-color: rgba(0, 229, 117, 0.1);
    border-color: rgba(0, 229, 117, 0.3);
    color: var(--color-accent);
  }

  /* Status Indicators Grid */
  .status-indicators {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 14px;
  }

  .indicator-box {
    background-color: rgba(0, 0, 0, 0.15);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ind-lbl {
    font-size: 10px;
    color: var(--color-text-muted);
    font-weight: 600;
    text-transform: uppercase;
  }

  .ind-val {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .ind-val .target {
    font-size: 11px;
    color: var(--color-text-muted);
    font-weight: 400;
  }

  .quick-controls {
    display: flex;
    gap: 12px;
  }

  .btn-secondary-device {
    background-color: #27272a;
    color: #e4e4e7;
    border: 1px solid #3f3f46;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    flex: 1;
    transition: all 0.15s ease;
  }

  .btn-secondary-device:hover {
    background-color: #3f3f46;
    color: white;
  }

  .btn-danger-device {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    flex: 1;
    transition: all 0.15s ease;
  }

  .btn-danger-device:hover {
    background-color: #ef4444;
    color: white;
  }

  /* Jog Panel layout */
  .jog-layout {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 16px;
  }

  .pad-title {
    font-size: 10px;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    display: block;
    margin-bottom: 8px;
  }

  .arrow-grid {
    display: grid;
    grid-template-columns: repeat(3, 36px);
    grid-template-rows: repeat(3, 36px);
    gap: 6px;
  }

  .arrow-btn {
    background-color: #27272a;
    border: 1px solid #3f3f46;
    border-radius: 6px;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .arrow-btn:hover {
    background-color: #3f3f46;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .home-btn {
    background-color: rgba(0, 229, 117, 0.1);
    border-color: rgba(0, 229, 117, 0.3);
    color: var(--color-accent);
  }

  .home-btn:hover {
    background-color: var(--color-accent);
    color: #0b0f19;
  }

  .z-column {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .z-btn {
    height: 36px;
    font-size: 11px;
    font-weight: 600;
    gap: 4px;
  }

  .ext-pad {
    grid-column: span 2;
    margin-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.03);
    padding-top: 12px;
  }

  .ext-buttons {
    display: flex;
    gap: 12px;
  }

  /* Temperature Chart */
  .temp-chart-panel {
    height: 190px;
  }

  .chart-container {
    position: relative;
    flex: 1;
    background-color: var(--color-bg-input);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    overflow: hidden;
    padding: 8px;
  }

  .temp-svg {
    width: 100%;
    height: 110px;
  }

  .chart-labels {
    position: absolute;
    bottom: 6px;
    left: 8px;
    display: flex;
    gap: 16px;
  }

  .chart-lbl-item {
    font-size: 10px;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .chart-lbl-item .bullet {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .chart-lbl-item .bullet.hotend { background-color: #ef4444; }
  .chart-lbl-item .bullet.bed { background-color: #3b82f6; }

  /* Console Terminal */
  .console-panel {
    flex: 1;
    min-height: 250px;
  }

  .clear-btn {
    margin-left: auto;
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    font-size: 11px;
    cursor: pointer;
  }

  .clear-btn:hover {
    color: var(--color-text-secondary);
  }

  .terminal-logs {
    flex: 1;
    background-color: #0b0f19;
    border: 1px solid var(--color-border);
    border-radius: 6px 6px 0 0;
    padding: 10px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 11px;
    color: #a3b8cc;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
    height: 160px;
  }

  .log-line {
    word-break: break-all;
    line-height: 1.4;
  }

  .log-line.user-cmd {
    color: var(--color-accent);
    font-weight: 600;
  }

  .console-input-row {
    display: flex;
    border: 1px solid var(--color-border);
    border-top: none;
    border-radius: 0 0 6px 6px;
    overflow: hidden;
  }

  .console-input-row input {
    flex: 1;
    background-color: #121214;
    border: none;
    padding: 0 12px;
    height: 32px;
    color: var(--color-text-primary);
    font-family: inherit;
    font-size: 12px;
    outline: none;
  }

  .send-btn {
    width: 40px;
    background-color: #27272a;
    border: none;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .send-btn:hover {
    background-color: #3f3f46;
    color: var(--color-accent);
  }

  .animate-fade-in {
    animation: fadeIn 0.2s ease-out forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Light Theme overrides */
  :global(.light) .terminal-logs {
    background-color: #f8fafc;
    color: #334155;
  }

  :global(.light) .console-input-row input {
    background-color: #ffffff;
    color: #0f172a;
  }

  :global(.light) .send-btn {
    background-color: #f1f5f9;
    color: #334155;
  }

  :global(.light) .send-btn:hover {
    background-color: #e2e8f0;
    color: var(--color-accent);
  }

  :global(.light) .arrow-btn {
    background-color: #f1f5f9;
    border-color: #cbd5e1;
    color: #0f172a;
  }

  :global(.light) .arrow-btn:hover {
    background-color: #e2e8f0;
    border-color: #94a3b8;
  }

  :global(.light) .indicator-box {
    background-color: #f1f5f9;
  }

  :global(.light) .btn-secondary-device {
    background-color: #f1f5f9;
    color: #334155;
    border: 1px solid #cbd5e1;
  }

  :global(.light) .btn-secondary-device:hover {
    background-color: #e2e8f0;
    color: #0f172a;
  }
</style>
