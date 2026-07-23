<script lang="ts">
  /**
   * DeviceDashboard - Refactored to use the new device store architecture.
   *
   * Previously a monolithic 1820-line component, now composes sub-components
   * that map to the C++ DeviceCore architecture:
   *
   *   DeviceManager -> MachineObject -> subsystems
   *
   * Sub-components:
   *   DeviceHeader        (DevInfo + connection state)
   *   PrinterStatus       (DevBed + DevExtruderSystem temps + DevPrintTaskInfo)
   *   TemperatureChart    (temperature history visualization)
   *   JogControls         (DevCtrl - manual movement)
   *   ConsolePanel        (DevCtrl - G-code terminal)
   *   MediaPanel          (camera / live view)
   *   FirmwarePanel       (DevFirmware + DevFirmwareUpgradeInfo)
   *   HMSPanel            (DevHMS)
   *   AMSPanel            (DevFilaSystem + DevAms + DevAmsTray)
   *   FanPanel            (DevFan + AirDuctData)
   *   StoragePanel        (DevStorage)
   *   LampPanel           (DevLamp)
   *   ConfigPanel         (DevConfig)
   *   PrintOptionsPanel   (DevPrintOptions)
   */
  import { onMount, onDestroy } from 'svelte';
  import {
    Activity, Camera, RefreshCw, AlertTriangle,
    Thermometer, Terminal, Send, Wifi, WifiOff,
    Monitor, Home, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
    Cpu, HardDrive, Layers, Zap, X, ChevronDown, Search,
    Fan, Droplets, Settings, Gauge, Lightbulb,
    CheckCircle, Info, AlertCircle, XCircle, Box, Wind,
    Move3d, Play, Pause, Square, Trash2, Download
  } from 'lucide-svelte';

  // ─── Device Store Imports ───────────────────────────────────────────
  import {
    deviceManager, selectedMachine, allMachines,
    selectedMachineBed, selectedMachineExtruder, selectedMachineFan,
    selectedMachineFila, selectedMachineNozzles, selectedMachineStorage,
    selectedMachineLamp, selectedMachineFirmware, selectedMachineFirmwareUpgrade,
    selectedMachineHMS, selectedMachineConfig, selectedMachinePrintOptions,
    selectedMachinePrintTask, selectedMachineConnection,
    selectMachine, upsertLocalMachine, upsertCloudMachine,
    updateBed, updateExtruderSystem, updateFan, updateFilaSystem,
    updateNozzleSystem, updateStorage, updateLamp, updateFirmware,
    updateFirmwareUpgrade, updateHMS, updateMachineConfig,
    updatePrintOptions, updatePrintTask, updateConnection,
    createMachineObject
  } from '../device/deviceStore';

  import {
    ConnectionType, PrinterState, SdcardState, LightEffect,
    DevFirmwareUpgradingState, DevPrintingSpeedLevel, HMSMessageLevel,
    ModuleID, AmsType, DevExtderSwitchState, NozzleFlowType,
    getSpeedLevelLabel, getSdcardStateLabel, getHMSLevelLabel,
    getAmsTypeLabel, getLightEffectLabel
  } from '../device/types';
  import type { HMSItem, MachineObject } from '../device/types';

  // ─── Sub-component Imports ──────────────────────────────────────────
  import DeviceHeader from '../device/components/DeviceHeader.svelte';
  import PrinterStatus from '../device/components/PrinterStatus.svelte';
  import TemperatureChart from '../device/components/TemperatureChart.svelte';
  import JogControls from '../device/components/JogControls.svelte';
  import ConsolePanel from '../device/components/ConsolePanel.svelte';
  import MediaPanel from '../device/components/MediaPanel.svelte';
  import FirmwarePanel from '../device/components/FirmwarePanel.svelte';
  import HMSPanel from '../device/components/HMSPanel.svelte';
  import AMSPanel from '../device/components/AMSPanel.svelte';
  import FanPanel from '../device/components/FanPanel.svelte';
  import StoragePanel from '../device/components/StoragePanel.svelte';
  import LampPanel from '../device/components/LampPanel.svelte';
  import ConfigPanel from '../device/components/ConfigPanel.svelte';
  import PrintOptionsPanel from '../device/components/PrintOptionsPanel.svelte';

  // ─── Tab State ──────────────────────────────────────────────────────
  type DeviceTab = 'status' | 'media' | 'update' | 'hms' | 'ams' | 'config';
  let activeDeviceTab: DeviceTab = 'status';

  const tabs: { id: DeviceTab; label: string; icon: any }[] = [
    { id: 'status', label: 'Status', icon: Activity },
    { id: 'media', label: 'Media', icon: Camera },
    { id: 'ams', label: 'AMS', icon: Droplets },
    { id: 'update', label: 'Update', icon: RefreshCw },
    { id: 'hms', label: 'HMS', icon: AlertTriangle },
    { id: 'config', label: 'Config', icon: Settings },
  ];

  // ─── Console State ──────────────────────────────────────────────────
  let consoleLogs: string[] = [
    'System initialized.',
    'Ready.',
  ];

  // ─── Temperature History ────────────────────────────────────────────
  let tempHistory: { hotend: number; bed: number }[] = Array.from(
    { length: 30 }, () => ({ hotend: 23, bed: 22 })
  );

  // ─── Camera State ───────────────────────────────────────────────────
  let cameraConnected = false;
  let cameraUrl = '';

  // ─── Simulation ─────────────────────────────────────────────────────
  let intervalId: any;

  onMount(() => {
    // Initialize a demo machine if none exists
    const dm = localStorage.getItem('deviceManager');
    if (!dm) {
      const demo = createMachineObject('demo-001', 'X1 Carbon');
      demo.printer_type = 'X1 Carbon';
      demo.printer_series = 0; // SERIES_X1
      demo.printer_arch = 0; // CORE_XY
      demo.info = {
        name: 'X1 Carbon', product_name: 'Bambu Lab X1 Carbon',
        sn: 'SN-20240001', hw_ver: 'AP01', sw_ver: 'v01.12.00',
        sw_new_ver: 'v01.13.00', firmware_flag: 0, is_valid: true,
        is_air_pump: false, is_laser: false, is_cutting_module: false,
        is_extinguish_system: false,
      };
      demo.config = {
        has_chamber: true, support_chamber_edit: true,
        chamber_temp_edit_min: 0, chamber_temp_edit_max: 60,
        chamber_temp_switch_heat: Number.MAX_SAFE_INTEGER,
        support_first_layer_inspect: true,
        support_save_remote_print_file_to_storage: true,
        support_ai_monitor: true, support_print_without_sd: true,
        support_print_all_plates: false,
        support_calibration_lidar: true,
        support_calibration_nozzle_offset: true,
        support_calibration_high_temp_bed: false,
        support_calibration_clump_pos: true,
        support_calibration_pa_flow_auto: true,
      };
      demo.extruder_system.extruders = [{
        ext_id: 0, has_nozzle: true, nozzle_id: 0, nozzle_type: 0,
        nozzle_flow_type: NozzleFlowType.S_FLOW, nozzle_diameter: 0.4,
        current_temp: 23.4, target_temp: 0, has_filament: true,
        filam_backup: [], slot_pre: { ams_id: '', slot_id: '' },
        slot_now: { ams_id: '', slot_id: '' },
        slot_target: { ams_id: '', slot_id: '' },
      }];
      demo.fan = {
        heatbreak_fan_speed: 128, cooling_fan_speed: 64,
        big_fan1_speed: 0, big_fan2_speed: 0, fan_gear: 0,
        support_aux_fan: true, support_chamber_fan: true,
        support_airduct: true,
        air_duct_data: {
          current_mode: 0, sub_mode: 0,
          support_cooling_filter: true, is_cooling_filter_on: false,
          modes: {}, parts: [],
        },
      };
      demo.fila_system = {
        has_ams: true, ams_count: 1,
        ams_list: {
          'ams-0': {
            ams_id: 'ams-0', ams_type: AmsType.AMS, extruder_id: 0,
            exists: true, slot_count: 4,
            current_temperature: 25.0, humidity_level: 2,
            humidity_percent: 35, left_dry_time: 0,
            support_humidity: true, support_drying: true,
            trays: {
              '0': {
                id: '0', tag_uid: '', setting_id: '', filament_setting_id: '',
                filament_type: 'PLA', sub_brands: '', color: '#ff4444',
                cols: [], weight: '1000', diameter: '1.75', temp: '220',
                time: '', bed_temp_type: '', bed_temp: '60',
                nozzle_temp_max: '230', nozzle_temp_min: '190',
                xcam_info: '', uuid: '', ctype: 0, k: 0, n: 0,
                cali_idx: 0, is_bbl: true, is_exists: true,
                is_slot_placeholder: false, remain: 85,
              },
              '1': {
                id: '1', tag_uid: '', setting_id: '', filament_setting_id: '',
                filament_type: 'PETG', sub_brands: '', color: '#4488ff',
                cols: [], weight: '1000', diameter: '1.75', temp: '240',
                time: '', bed_temp_type: '', bed_temp: '70',
                nozzle_temp_max: '250', nozzle_temp_min: '220',
                xcam_info: '', uuid: '', ctype: 0, k: 0, n: 0,
                cali_idx: 0, is_bbl: true, is_exists: true,
                is_slot_placeholder: false, remain: 60,
              },
              '2': {
                id: '2', tag_uid: '', setting_id: '', filament_setting_id: '',
                filament_type: 'ABS', sub_brands: '', color: '#44ff44',
                cols: [], weight: '1000', diameter: '1.75', temp: '260',
                time: '', bed_temp_type: '', bed_temp: '100',
                nozzle_temp_max: '270', nozzle_temp_min: '240',
                xcam_info: '', uuid: '', ctype: 0, k: 0, n: 0,
                cali_idx: 0, is_bbl: true, is_exists: true,
                is_slot_placeholder: false, remain: 30,
              },
              '3': {
                id: '3', tag_uid: '', setting_id: '', filament_setting_id: '',
                filament_type: 'TPU', sub_brands: '', color: '#ffaa00',
                cols: [], weight: '500', diameter: '1.75', temp: '230',
                time: '', bed_temp_type: '', bed_temp: '45',
                nozzle_temp_max: '240', nozzle_temp_min: '210',
                xcam_info: '', uuid: '', ctype: 0, k: 0, n: 0,
                cali_idx: 0, is_bbl: true, is_exists: true,
                is_slot_placeholder: false, remain: 90,
              },
            },
          },
        },
        detect_on_insert: true, detect_on_powerup: true,
        detect_remain: true, auto_refill: false,
      };
      demo.connection_type = ConnectionType.LAN;
      demo.dev_ip = '192.168.1.100';
      demo.signal = 3;
      upsertLocalMachine(demo);
      selectMachine('demo-001');
    }

    // Temperature simulation
    intervalId = setInterval(() => {
      const bed = $selectedMachineBed;
      const ext = $selectedMachineExtruder;
      const task = $selectedMachinePrintTask;

      let hotend = ext.extruders[0]?.current_temp ?? 23;
      let targetHotend = ext.extruders[0]?.target_temp ?? 0;
      let bedTemp = bed.temp;
      let targetBed = bed.target_temp;

      // Simulate temperature changes
      if (hotend < targetHotend) {
        hotend = Math.min(targetHotend, hotend + (targetHotend - hotend) * 0.1 + 1.5);
      } else if (hotend > targetHotend) {
        hotend = Math.max(targetHotend, hotend - (hotend - targetHotend) * 0.05 - 0.8);
      } else {
        hotend = Math.max(20, hotend + (Math.random() - 0.5) * 0.2);
      }

      if (bedTemp < targetBed) {
        bedTemp = Math.min(targetBed, bedTemp + (targetBed - bedTemp) * 0.05 + 0.5);
      } else if (bedTemp > targetBed) {
        bedTemp = Math.max(targetBed, bedTemp - (bedTemp - targetBed) * 0.03 - 0.4);
      } else {
        bedTemp = Math.max(20, bedTemp + (Math.random() - 0.5) * 0.1);
      }

      updateBed({ temp: bedTemp });
      updateExtruderSystem({
        extruders: [{
          ...ext.extruders[0],
          current_temp: hotend,
          target_temp: targetHotend,
        }],
      });

      tempHistory = [...tempHistory.slice(1), { hotend, bed: bedTemp }];
    }, 1000);
  });

  onDestroy(() => {
    clearInterval(intervalId);
  });

  // ─── Action Handlers ────────────────────────────────────────────────

  function handleMove(axis: 'x' | 'y' | 'z', direction: '+' | '-') {
    const cmd = `G91\nG0 ${axis.toUpperCase()}${direction}10\nG90`;
    consoleLogs = [...consoleLogs, `> ${cmd}`, 'ok'];
  }

  function handleHome(axis: 'x' | 'y' | 'z' | 'all') {
    const cmd = axis === 'all' ? 'G28' : `G28 ${axis.toUpperCase()}`;
    consoleLogs = [...consoleLogs, `> ${cmd}`, 'echo: Homing completed.'];
  }

  function handleSendCommand(cmd: string) {
    consoleLogs = [...consoleLogs, `> ${cmd}`];

    if (cmd.startsWith('G28')) {
      consoleLogs = [...consoleLogs, 'echo: Homing all axes...', 'echo: Homing completed.'];
    } else if (cmd.startsWith('M104') || cmd.startsWith('M109')) {
      const match = cmd.match(/S(\d+)/);
      if (match) {
        const target = parseInt(match[1]);
        const ext = $selectedMachineExtruder;
        updateExtruderSystem({
          extruders: [{
            ...ext.extruders[0],
            target_temp: target,
          }],
        });
        updatePrintTask({ status: target > 0 ? PrinterState.HEATING : PrinterState.IDLE });
        consoleLogs = [...consoleLogs, `echo: Setting hotend to ${target}°C...`];
      }
    } else if (cmd.startsWith('M140') || cmd.startsWith('M190')) {
      const match = cmd.match(/S(\d+)/);
      if (match) {
        const target = parseInt(match[1]);
        updateBed({ target_temp: target });
        updatePrintTask({ status: target > 0 ? PrinterState.HEATING : PrinterState.IDLE });
        consoleLogs = [...consoleLogs, `echo: Setting bed to ${target}°C...`];
      }
    } else if (cmd.toUpperCase() === 'CLEAR') {
      consoleLogs = [];
      return;
    } else {
      consoleLogs = [...consoleLogs, 'ok'];
    }
  }

  function handlePreheat() {
    const ext = $selectedMachineExtruder;
    updateExtruderSystem({
      extruders: [{
        ...ext.extruders[0],
        target_temp: 220,
      }],
    });
    updateBed({ target_temp: 60 });
    updatePrintTask({ status: PrinterState.HEATING });
    consoleLogs = [...consoleLogs, '> PREHEAT PLA', 'echo: Heating bed to 60C, hotend to 220C...'];
  }

  function handleCooldown() {
    const ext = $selectedMachineExtruder;
    updateExtruderSystem({
      extruders: [{
        ...ext.extruders[0],
        target_temp: 0,
      }],
    });
    updateBed({ target_temp: 0 });
    updatePrintTask({ status: PrinterState.IDLE });
    consoleLogs = [...consoleLogs, '> COOLDOWN', 'echo: Shutting off all heaters...'];
  }

  function handleToggleCamera() {
    cameraConnected = !cameraConnected;
    if (cameraConnected) {
      cameraUrl = 'https://via.placeholder.com/640x480.png?text=Camera+Feed';
    } else {
      cameraUrl = '';
    }
  }

  function handleCheckUpdate() {
    consoleLogs = [...consoleLogs, '> CHECK UPDATE', 'Checking for firmware updates...'];
  }

  function handleStartUpdate() {
    updateFirmwareUpgrade({ state: DevFirmwareUpgradingState.UpgradingInProgress });
    consoleLogs = [...consoleLogs, '> START UPDATE', 'Firmware update started...'];
    setTimeout(() => {
      const fw = $selectedMachineFirmware;
      updateFirmware({ sw_ver: fw.sw_new_ver || fw.sw_ver, sw_new_ver: '' });
      updateFirmwareUpgrade({ state: DevFirmwareUpgradingState.UpgradingFinished });
      consoleLogs = [...consoleLogs, 'Firmware update completed.'];
    }, 5000);
  }

  function handleDismissHMS(index: number) {
    const hms = $selectedMachineHMS;
    const items = [...hms.items];
    items.splice(index, 1);
    updateHMS({ items });
  }

  function handleClearHMS() {
    updateHMS({ items: [] });
  }

  function handleRefreshAMS() {
    consoleLogs = [...consoleLogs, '> REFRESH AMS', 'AMS status refreshed.'];
  }

  function handleSetFanSpeed(fanType: string, speed: number) {
    consoleLogs = [...consoleLogs, `> SET FAN ${fanType} ${speed}`, 'ok'];
  }

  function handleToggleLight() {
    const lamp = $selectedMachineLamp;
    updateLamp({
      chamber_light: lamp.is_chamber_light_on ? LightEffect.OFF : LightEffect.ON,
      is_chamber_light_on: !lamp.is_chamber_light_on,
    });
  }

  function handleSetSpeedLevel(level: DevPrintingSpeedLevel) {
    updatePrintOptions({ speed_level: level });
    consoleLogs = [...consoleLogs, `> SPEED ${getSpeedLevelLabel(level)}`, 'ok'];
  }

  function handleToggleAIMonitoring() {
    const opts = $selectedMachinePrintOptions;
    updatePrintOptions({ ai_monitoring: !opts.ai_monitoring });
  }

  function handleToggleFirstLayerInspect() {
    const opts = $selectedMachinePrintOptions;
    updatePrintOptions({ first_layer_inspector: !opts.first_layer_inspector });
  }

  // Derived state for display
  $: conn = $selectedMachineConnection;
  $: task = $selectedMachinePrintTask;
</script>

<div class="device-dashboard animate-fade-in">
  <!-- ════════════════════════════════════════════════════════════════ -->
  <!-- Machine Info Header Bar                                       -->
  <!-- ════════════════════════════════════════════════════════════════ -->
  <DeviceHeader
    machineName={conn.name}
    machineModel={$selectedMachine?.printer_type ?? ''}
    machineSerial={$selectedMachine?.info?.sn ?? 'SN-00000000'}
    firmwareVersion={$selectedMachine?.info?.sw_ver ?? 'v0.0.0'}
  />

  <!-- ════════════════════════════════════════════════════════════════ -->
  <!-- Tab Navigation                                                 -->
  <!-- ════════════════════════════════════════════════════════════════ -->
  <div class="tab-navigation">
    {#each tabs as tab}
      <button
        class="tab-btn"
        class:active={activeDeviceTab === tab.id}
        on:click={() => activeDeviceTab = tab.id}
      >
        <svelte:component this={tab.icon} size={14} />
        <span>{tab.label}</span>
      </button>
    {/each}
  </div>

  <!-- ════════════════════════════════════════════════════════════════ -->
  <!-- Tab Content Area                                               -->
  <!-- ════════════════════════════════════════════════════════════════ -->
  <div class="tab-content">
    {#if activeDeviceTab === 'status'}
      <!-- ─── STATUS TAB ─────────────────────────────────────────── -->
      <div class="status-tab-layout">
        <!-- Left Column -->
        <div class="status-left-col">
          <PrinterStatus
            onPreheat={handlePreheat}
            onCooldown={handleCooldown}
          />
          <JogControls
            onMove={handleMove}
            onHome={handleHome}
          />
          <FanPanel onSetFanSpeed={handleSetFanSpeed} />
          <StoragePanel />
          <LampPanel onToggleLight={handleToggleLight} />
        </div>

        <!-- Right Column -->
        <div class="status-right-col">
          <TemperatureChart history={tempHistory} />
          <ConsolePanel bind:logs={consoleLogs} onSendCommand={handleSendCommand} />
          <PrintOptionsPanel
            onSetSpeedLevel={handleSetSpeedLevel}
            onToggleAIMonitoring={handleToggleAIMonitoring}
            onToggleFirstLayerInspect={handleToggleFirstLayerInspect}
          />
        </div>
      </div>

    {:else if activeDeviceTab === 'media'}
      <!-- ─── MEDIA / LIVE VIEW TAB ──────────────────────────────── -->
      <div class="media-tab-layout">
        <MediaPanel
          bind:cameraConnected
          bind:cameraUrl
          onToggleCamera={handleToggleCamera}
        />
        <div class="panel media-info-panel">
          <div class="panel-header-device">
            <Monitor size={15} />
            <span>Print Status</span>
          </div>
          <div class="media-info-grid">
            <div class="media-info-item">
              <span class="media-info-lbl">File</span>
              <span class="media-info-val">{task.filename || 'No file loaded'}</span>
            </div>
            <div class="media-info-item">
              <span class="media-info-lbl">Progress</span>
              <span class="media-info-val">{task.progress}%</span>
            </div>
            <div class="media-info-item">
              <span class="media-info-lbl">Elapsed</span>
              <span class="media-info-val">{formatTime(task.time_elapsed)}</span>
            </div>
            <div class="media-info-item">
              <span class="media-info-lbl">Remaining</span>
              <span class="media-info-val">{formatTime(task.time_remaining)}</span>
            </div>
            <div class="media-info-item">
              <span class="media-info-lbl">Layer</span>
              <span class="media-info-val">{task.current_layer} / {task.total_layers}</span>
            </div>
            <div class="media-info-item">
              <span class="media-info-lbl">Status</span>
              <span class="media-info-val" class:status-active={task.status !== PrinterState.IDLE}>{task.status}</span>
            </div>
          </div>
        </div>
      </div>

    {:else if activeDeviceTab === 'ams'}
      <!-- ─── AMS / FILAMENT TAB ─────────────────────────────────── -->
      <div class="ams-tab-layout">
        <AMSPanel onRefresh={handleRefreshAMS} />
        <div class="ams-side-panels">
          <FanPanel onSetFanSpeed={handleSetFanSpeed} />
          <StoragePanel />
        </div>
      </div>

    {:else if activeDeviceTab === 'update'}
      <!-- ─── UPDATE / FIRMWARE TAB ──────────────────────────────── -->
      <div class="update-tab-layout">
        <FirmwarePanel
          onCheckUpdate={handleCheckUpdate}
          onStartUpdate={handleStartUpdate}
        />
        <div class="update-side-panels">
          <ConfigPanel />
          <PrintOptionsPanel
            onSetSpeedLevel={handleSetSpeedLevel}
            onToggleAIMonitoring={handleToggleAIMonitoring}
            onToggleFirstLayerInspect={handleToggleFirstLayerInspect}
          />
        </div>
      </div>

    {:else if activeDeviceTab === 'hms'}
      <!-- ─── HMS (ERRORS / WARNINGS) TAB ────────────────────────── -->
      <div class="hms-tab-layout">
        <HMSPanel
          onDismissMessage={handleDismissHMS}
          onClearAll={handleClearHMS}
        />
        <div class="hms-side-panels">
          <StoragePanel />
          <LampPanel onToggleLight={handleToggleLight} />
        </div>
      </div>

    {:else if activeDeviceTab === 'config'}
      <!-- ─── CONFIG TAB ─────────────────────────────────────────── -->
      <div class="config-tab-layout">
        <ConfigPanel />
        <div class="config-side-panels">
          <PrintOptionsPanel
            onSetSpeedLevel={handleSetSpeedLevel}
            onToggleAIMonitoring={handleToggleAIMonitoring}
            onToggleFirstLayerInspect={handleToggleFirstLayerInspect}
          />
          <div class="config-mini-panels">
            <StoragePanel />
            <LampPanel onToggleLight={handleToggleLight} />
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<script lang="ts" context="module">
  /** Format seconds to HH:MM:SS */
  function formatTime(seconds: number): string {
    if (!seconds || seconds <= 0) return '--:--:--';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
</script>

<style>
  /* ═══════════════════════════════════════════════════════════════════ */
  /* Base Layout                                                       */
  /* ═══════════════════════════════════════════════════════════════════ */
  .device-dashboard {
    display: flex;
    flex-direction: column;
    padding: 12px 16px;
    height: 100%;
    flex: 1;
    overflow: hidden;
    background-color: var(--color-bg);
    gap: 8px;
  }

  /* ═══════════════════════════════════════════════════════════════════ */
  /* Tab Navigation                                                     */
  /* ═══════════════════════════════════════════════════════════════════ */
  .tab-navigation {
    display: flex;
    gap: 2px;
    background-color: var(--color-bg-sidebar);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 3px;
    flex-shrink: 0;
  }

  .tab-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 16px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--color-text-muted);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
  }

  .tab-btn:hover {
    color: var(--color-text-primary);
    background-color: rgba(255, 255, 255, 0.03);
  }

  .tab-btn.active {
    background-color: rgba(0, 229, 117, 0.1);
    color: var(--color-accent);
  }

  /* ═══════════════════════════════════════════════════════════════════ */
  /* Tab Content                                                        */
  /* ═══════════════════════════════════════════════════════════════════ */
  .tab-content {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  /* ─── STATUS TAB ─────────────────────────────────────────────────── */
  .status-tab-layout {
    display: flex;
    gap: 16px;
    height: 100%;
  }

  .status-left-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 480px;
  }

  .status-right-col {
    flex: 1.2;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ─── MEDIA TAB ──────────────────────────────────────────────────── */
  .media-tab-layout {
    display: flex;
    gap: 16px;
    height: 100%;
  }

  .media-info-panel {
    flex: 1;
    max-width: 320px;
  }

  .media-info-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .media-info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    background-color: rgba(0, 0, 0, 0.15);
    border: 1px solid var(--color-border);
    border-radius: 6px;
  }

  .media-info-lbl {
    font-size: 11px;
    color: var(--color-text-muted);
    font-weight: 600;
  }

  .media-info-val {
    font-size: 12px;
    color: var(--color-text-primary);
    font-weight: 600;
  }

  .media-info-val.status-active {
    color: var(--color-accent);
  }

  /* ─── AMS TAB ────────────────────────────────────────────────────── */
  .ams-tab-layout {
    display: flex;
    gap: 16px;
  }

  .ams-side-panels {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 360px;
    flex: 1;
  }

  /* ─── UPDATE TAB ─────────────────────────────────────────────────── */
  .update-tab-layout {
    display: flex;
    gap: 16px;
  }

  .update-side-panels {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 400px;
    flex: 1;
  }

  /* ─── HMS TAB ────────────────────────────────────────────────────── */
  .hms-tab-layout {
    display: flex;
    gap: 16px;
  }

  .hms-side-panels {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 320px;
    flex: 1;
  }

  /* ─── CONFIG TAB ─────────────────────────────────────────────────── */
  .config-tab-layout {
    display: flex;
    gap: 16px;
  }

  .config-side-panels {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 400px;
    flex: 1;
  }

  .config-mini-panels {
    display: flex;
    gap: 16px;
  }

  .config-mini-panels > :global(*) {
    flex: 1;
  }

  /* ═══════════════════════════════════════════════════════════════════ */
  /* Shared Panel Styles                                                */
  /* ═══════════════════════════════════════════════════════════════════ */
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

  .animate-fade-in {
    animation: fadeIn 0.2s ease-out forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Light Theme overrides */
  :global(.light) .tab-btn.active {
    background-color: rgba(0, 229, 117, 0.1);
  }

  :global(.light) .media-info-item {
    background-color: #f8fafc;
  }
</style>
