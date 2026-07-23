<script lang="ts">
  /**
   * CalibrationDialog - Matches OrcaSlicer's calibration wizard.
   * Provides access to various calibration routines:
   * Pressure Advance, Flow Rate, Temperature, Max Volumetric Speed,
   * Retraction, VFA, Input Shaping, and Cornering.
   */
  import {
    showCalibrationDialog,
    activeCalibrationType,
    type CalibrationType,
  } from '../store';
  import {
    X,
    Gauge,
    Thermometer,
    Zap,
    Move3d,
    Activity,
    Waves,
    CornerDownRight,
    Ruler,
  } from 'lucide-svelte';

  interface CalibrationOption {
    type: CalibrationType;
    label: string;
    description: string;
    icon: any;
  }

  const calibrationOptions: CalibrationOption[] = [
    {
      type: 'pa',
      label: 'Pressure Advance',
      description: 'Calibrate K-factor (pressure advance) for better corner quality',
      icon: Zap,
    },
    {
      type: 'flowrate',
      label: 'Flow Rate',
      description: 'Calibrate extrusion multiplier for accurate dimensions',
      icon: Activity,
    },
    {
      type: 'temp',
      label: 'Temperature',
      description: 'Find optimal printing temperature for your filament',
      icon: Thermometer,
    },
    {
      type: 'max_vol_speed',
      label: 'Max Volumetric Speed',
      description: 'Determine maximum flow rate your hotend can handle',
      icon: Gauge,
    },
    {
      type: 'retraction',
      label: 'Retraction',
      description: 'Tune retraction distance and speed to reduce stringing',
      icon: Move3d,
    },
    {
      type: 'vfa',
      label: 'VFA (Vertical Fine Artifacts)',
      description: 'Identify speeds that cause vertical fine artifacts',
      icon: Waves,
    },
    {
      type: 'input_shaper_freq',
      label: 'Input Shaping Frequency',
      description: 'Measure resonance frequencies for input shaping',
      icon: Ruler,
    },
    {
      type: 'input_shaper_damp',
      label: 'Input Shaping Damping',
      description: 'Measure damping ratios for input shaping',
      icon: Activity,
    },
    {
      type: 'cornering',
      label: 'Cornering',
      description: 'Calibrate cornering behavior for better accuracy',
      icon: CornerDownRight,
    },
  ];

  function handleClose() {
    showCalibrationDialog.set(false);
    activeCalibrationType.set(null);
  }

  function handleSelect(type: CalibrationType) {
    activeCalibrationType.set(type);
    // In a full implementation, this would open the specific calibration wizard
    handleClose();
  }
</script>

{#if $showCalibrationDialog}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="calibration-overlay" on:click={handleClose}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="calibration-dialog" on:click|stopPropagation>
      <div class="dialog-header">
        <div class="dialog-title-area">
          <Gauge size={18} color="#00e575" />
          <h2>Calibration</h2>
        </div>
        <button class="close-btn" on:click={handleClose}>
          <X size={18} />
        </button>
      </div>

      <div class="dialog-body">
        <p class="dialog-description">
          Select a calibration routine to run. Each test will print a specific
          pattern that helps you fine-tune your printer's performance.
        </p>

        <div class="calibration-grid">
          {#each calibrationOptions as option}
            <button
              class="calibration-card"
              on:click={() => handleSelect(option.type)}
            >
              <div class="card-icon">
                <svelte:component this={option.icon} size={20} />
              </div>
              <div class="card-info">
                <span class="card-label">{option.label}</span>
                <span class="card-description">{option.description}</span>
              </div>
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .calibration-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .calibration-dialog {
    width: 560px;
    max-height: 80vh;
    background-color: var(--color-bg-sidebar);
    border: 1px solid var(--color-border);
    border-radius: 14px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--color-border);
  }

  .dialog-title-area {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .dialog-title-area h2 {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    transition: all 0.15s ease;
  }

  .close-btn:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--color-text-primary);
  }

  .dialog-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .dialog-description {
    font-size: 13px;
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin: 0 0 20px 0;
  }

  .calibration-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .calibration-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 16px;
    background-color: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: all 0.15s ease;
  }

  .calibration-card:hover {
    background-color: rgba(0, 229, 117, 0.04);
    border-color: rgba(0, 229, 117, 0.2);
  }

  .card-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background-color: rgba(0, 229, 117, 0.08);
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .card-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .card-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .card-description {
    font-size: 11px;
    color: var(--color-text-muted);
    line-height: 1.3;
  }
</style>
