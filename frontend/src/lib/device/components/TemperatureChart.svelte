<script lang="ts">
  /**
   * TemperatureChart - SVG-based temperature history plot
   * Maps to: DevBed + DevExtruderSystem (temperature history visualization)
   */
  import { Thermometer } from 'lucide-svelte';
  import { selectedMachineBed, selectedMachineExtruder } from '../deviceStore';

  export let history: { hotend: number; bed: number }[] = [];
  export let width = 320;
  export let height = 100;

  // Sync current temps from store
  let currentHotend = 23;
  let currentBed = 22;
  let targetHotend = 0;
  let targetBed = 0;

  $: {
    const bed = $selectedMachineBed;
    currentBed = bed.temp;
    targetBed = bed.target_temp;
  }
  $: {
    const ext = $selectedMachineExtruder;
    if (ext.extruders.length > 0) {
      currentHotend = ext.extruders[0].current_temp;
      targetHotend = ext.extruders[0].target_temp;
    }
  }

  // Compute SVG path
  $: hotendPath = computePath(history.map(p => p.hotend), width, height, 40);
  $: bedPath = computePath(history.map(p => p.bed), width, height, 40);

  function computePath(values: number[], w: number, h: number, maxTemp: number): string {
    if (values.length < 2) return '';
    const padding = 4;
    const plotW = w - padding * 2;
    const plotH = h - padding * 2;
    const stepX = plotW / (values.length - 1);

    return values
      .map((v, i) => {
        const x = padding + i * stepX;
        const y = padding + plotH - (Math.min(v, maxTemp) / maxTemp) * plotH;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  function formatTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="panel">
  <div class="panel-header-device">
    <Thermometer size={16} color="#f97316" />
    <span>Temperature</span>
    <span class="current-temps">
      <span class="temp-hotend">{currentHotend.toFixed(1)}°C</span>
      <span class="temp-sep">/</span>
      <span class="temp-bed">{currentBed.toFixed(1)}°C</span>
    </span>
  </div>

  <div class="chart-container">
    {#if history.length > 1}
      <svg {width} {height} class="temp-chart">
        <!-- Grid lines -->
        <line x1="4" y1="4" x2={width - 4} y2="4" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
        <line x1="4" y1={height / 2} x2={width - 4} y2={height / 2} stroke="rgba(255,255,255,0.04)" stroke-width="1" />
        <line x1="4" y1={height - 4} x2={width - 4} y2={height - 4} stroke="rgba(255,255,255,0.04)" stroke-width="1" />

        <!-- Bed temp area -->
        <path
          d={bedPath}
          fill="none"
          stroke="#f97316"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <!-- Hotend temp area -->
        <path
          d={hotendPath}
          fill="none"
          stroke="#ef4444"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    {:else}
      <div class="chart-empty">
        <span class="chart-empty-text">Collecting temperature data...</span>
      </div>
    {/if}
  </div>

  <div class="chart-legend">
    <span class="legend-item">
      <span class="legend-dot hotend"></span>
      Hotend {targetHotend > 0 ? `(${targetHotend}°C)` : ''}
    </span>
    <span class="legend-item">
      <span class="legend-dot bed"></span>
      Bed {targetBed > 0 ? `(${targetBed}°C)` : ''}
    </span>
    <span class="legend-time">{formatTime()}</span>
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

  .current-temps {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }

  .temp-hotend {
    color: #ef4444;
    font-weight: 700;
  }

  .temp-bed {
    color: #f97316;
    font-weight: 700;
  }

  .temp-sep {
    color: var(--color-text-muted);
    font-size: 10px;
  }

  .chart-container {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
  }

  .temp-chart {
    max-width: 100%;
    height: auto;
  }

  .chart-empty {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chart-empty-text {
    font-size: 11px;
    color: var(--color-text-muted);
  }

  .chart-legend {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 10px;
    color: var(--color-text-secondary);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }

  .legend-dot.hotend {
    background-color: #ef4444;
  }

  .legend-dot.bed {
    background-color: #f97316;
  }

  .legend-time {
    margin-left: auto;
    color: var(--color-text-muted);
  }
</style>
