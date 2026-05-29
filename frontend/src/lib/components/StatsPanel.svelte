<script lang="ts">
  import { sliceResult, stlFileName, modelDimensions, slicerSettings } from '../store';
  import { 
    Clock, 
    Layers, 
    Box, 
    Weight,
    Settings,
    Activity
  } from 'lucide-svelte';

  // Format print time (seconds) to human readable string (e.g. 2h 14m 5s)
  function formatPrintTime(secs: number): string {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(' ');
  }
</script>

{#if $sliceResult}
  <div class="stats-panel animate-slide-in">
    <div class="panel-header">
      <Activity size={15} color="#00e575" />
      <span class="panel-title">Print Statistics</span>
    </div>

    <div class="stats-grid">
      <!-- Print Time -->
      <div class="stat-card">
        <div class="stat-icon-wrap time">
          <Clock size={16} />
        </div>
        <div class="stat-info">
          <span class="stat-lbl">Est. Print Time</span>
          <span class="stat-val">{formatPrintTime($sliceResult.print_time_secs)}</span>
        </div>
      </div>

      <!-- Filament Used -->
      <div class="stat-card">
        <div class="stat-icon-wrap weight">
          <Weight size={16} />
        </div>
        <div class="stat-info">
          <span class="stat-lbl">Filament Weight</span>
          <span class="stat-val">{$sliceResult.filament_used_g.toFixed(2)} g</span>
          <span class="stat-sub">{($sliceResult.filament_used_mm / 1000).toFixed(2)} m used</span>
        </div>
      </div>

      <!-- Layers -->
      <div class="stat-card">
        <div class="stat-icon-wrap layers">
          <Layers size={16} />
        </div>
        <div class="stat-info">
          <span class="stat-lbl">Total Layers</span>
          <span class="stat-val">{$sliceResult.layer_count} layers</span>
          <span class="stat-sub">@ {$slicerSettings.layer_height.toFixed(2)}mm height</span>
        </div>
      </div>

      <!-- Model Size -->
      <div class="stat-card">
        <div class="stat-icon-wrap dimensions">
          <Box size={16} />
        </div>
        <div class="stat-info">
          <span class="stat-lbl">Model Bounding Box</span>
          <span class="stat-val">
            {$modelDimensions.x.toFixed(1)} × 
            {$modelDimensions.y.toFixed(1)} × 
            {$modelDimensions.z.toFixed(1)}
          </span>
          <span class="stat-sub">Dimensions in mm</span>
        </div>
      </div>
    </div>

    <!-- Print Move Category Distributions -->
    <div class="distribution-area">
      <span class="dist-lbl">Time Distribution Estimate</span>
      
      <div class="bar-chart-stacked">
        <!-- We estimate relative durations for visual breakdown -->
        <div class="chart-segment wall-outer" style="flex: 25%" title="Outer Wall: 25%"></div>
        <div class="chart-segment wall-inner" style="flex: 30%" title="Inner Wall: 30%"></div>
        <div class="chart-segment infill" style="flex: 35%" title="Sparse Infill: 35%"></div>
        <div class="chart-segment travel" style="flex: 10%" title="Travel: 10%"></div>
      </div>

      <div class="dist-legend">
        <div class="dist-leg-item"><span class="bullet outer"></span><span>Outer Wall (25%)</span></div>
        <div class="dist-leg-item"><span class="bullet inner"></span><span>Inner Wall (30%)</span></div>
        <div class="dist-leg-item"><span class="bullet infill"></span><span>Infill (35%)</span></div>
        <div class="dist-leg-item"><span class="bullet travel"></span><span>Travel (10%)</span></div>
      </div>
    </div>

    <!-- Quick settings review -->
    <div class="settings-review">
      <div class="settings-review-header">
        <Settings size={12} />
        <span>Slicing Configuration Profile</span>
      </div>
      <div class="settings-review-row">
        <span>Nozzle Size:</span>
        <span class="setting-value">{$slicerSettings.nozzle_diameter} mm</span>
      </div>
      <div class="settings-review-row">
        <span>Infill Density:</span>
        <span class="setting-value">{$slicerSettings.infill_density}%</span>
      </div>
      <div class="settings-review-row">
        <span>Print Speed:</span>
        <span class="setting-value">{$slicerSettings.print_speed} mm/s</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .stats-panel {
    width: 280px;
    background-color: var(--color-bg-sidebar);
    border-left: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    user-select: none;
    z-index: 90;
    overflow-y: auto;
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 8px;
    margin-bottom: 16px;
  }

  .panel-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stats-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 10px 12px;
  }

  .stat-icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-icon-wrap.time { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
  .stat-icon-wrap.weight { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
  .stat-icon-wrap.layers { background: rgba(0, 229, 117, 0.1); color: var(--color-accent); }
  .stat-icon-wrap.dimensions { background: rgba(249, 115, 22, 0.1); color: #f97316; }

  .stat-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0; /* allows text truncation */
  }

  .stat-lbl {
    font-size: 10px;
    color: var(--color-text-muted);
    text-transform: uppercase;
    font-weight: 600;
  }

  .stat-val {
    font-size: 13px;
    font-weight: 700;
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stat-sub {
    font-size: 10px;
    color: var(--color-text-muted);
  }

  /* Distribution Stacked Bar Chart */
  .distribution-area {
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding-top: 16px;
    margin-bottom: 20px;
  }

  .dist-lbl {
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  .bar-chart-stacked {
    display: flex;
    height: 10px;
    border-radius: 5px;
    overflow: hidden;
    background-color: #2a2d35;
    margin: 4px 0;
  }

  .chart-segment {
    height: 100%;
    cursor: pointer;
    transition: opacity 0.15s ease;
  }

  .chart-segment:hover {
    opacity: 0.8;
  }

  .chart-segment.wall-outer { background-color: #ef4444; }
  .chart-segment.wall-inner { background-color: #22c55e; }
  .chart-segment.infill { background-color: #f59e0b; }
  .chart-segment.travel { background-color: #3b82f6; }

  .dist-legend {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-top: 6px;
  }

  .dist-leg-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: var(--color-text-muted);
  }

  .bullet {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .bullet.outer { background-color: #ef4444; }
  .bullet.inner { background-color: #22c55e; }
  .bullet.infill { background-color: #f59e0b; }
  .bullet.travel { background-color: #3b82f6; }

  /* Settings review block */
  .settings-review {
    background-color: rgba(0, 0, 0, 0.15);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: auto;
  }

  .settings-review-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 700;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }

  .settings-review-row {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--color-text-muted);
  }

  .setting-value {
    color: var(--color-text-secondary);
    font-weight: 600;
  }

  .animate-slide-in {
    animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>
