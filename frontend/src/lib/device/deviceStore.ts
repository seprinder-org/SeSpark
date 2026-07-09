/**
 * Device Store - Central state management for printer devices.
 *
 * Mirrors the C++ DeviceManager architecture:
 *   DeviceManager -> manages multiple MachineObject instances
 *
 * Each MachineObject aggregates all subsystems (DevBed, DevFan, DevFilaSystem, etc.)
 */

import { writable, derived } from 'svelte/store';
import type {
    MachineObject,
    DeviceManager,
    BedInfo,
    ExtruderSystem,
    FanInfo,
    FilaSystem,
    NozzleSystem,
    StorageInfo,
    LampInfo,
    FirmwareInfo,
    FirmwareUpgradeInfo,
    HMSInfo,
    MachineConfig,
    PrintOptions,
    PrintTaskInfo,
} from './types';
import {
    ConnectionType,
    PrinterState,
    SdcardState,
    LightEffect,
    DevFirmwareUpgradingState,
    DevPrintingSpeedLevel,
    DevExtderSwitchState,
    PrinterArch,
    PrinterSeries,
} from './types';

// ─── Factory: Create default/empty machine objects ────────────────────

function createDefaultBed(): BedInfo {
    return { temp: 22.0, target_temp: 0 };
}

function createDefaultExtruderSystem(): ExtruderSystem {
    return {
        total_extruder_count: 1,
        current_extruder_id: 0,
        switch_state: DevExtderSwitchState.IDLE,
        is_switching: false,
        is_switching_failed: false,
        loading_extruder_id: -1,
        is_busy_loading: false,
        extruders: [],
    };
}

function createDefaultFan(): FanInfo {
    return {
        heatbreak_fan_speed: 0,
        cooling_fan_speed: 0,
        big_fan1_speed: 0,
        big_fan2_speed: 0,
        fan_gear: 0,
        support_aux_fan: false,
        support_chamber_fan: false,
        support_airduct: false,
        air_duct_data: null,
    };
}

function createDefaultFilaSystem(): FilaSystem {
    return {
        has_ams: false,
        ams_count: 0,
        ams_list: {},
        detect_on_insert: null,
        detect_on_powerup: false,
        detect_remain: false,
        auto_refill: false,
    };
}

function createDefaultNozzleSystem(): NozzleSystem {
    return {
        nozzles: {},
        is_refreshing: false,
    };
}

function createDefaultStorage(): StorageInfo {
    return { sdcard_state: SdcardState.NO_SDCARD };
}

function createDefaultLamp(): LampInfo {
    return {
        chamber_light: LightEffect.UNKNOWN,
        is_chamber_light_on: false,
        lamp_close_recheck: false,
    };
}

function createDefaultFirmware(): FirmwareInfo {
    return {
        name: '',
        product_name: '',
        sn: '',
        hw_ver: '',
        sw_ver: '',
        sw_new_ver: '',
        firmware_flag: 0,
        is_valid: false,
        is_air_pump: false,
        is_laser: false,
        is_cutting_module: false,
        is_extinguish_system: false,
    };
}

function createDefaultFirmwareUpgrade(): FirmwareUpgradeInfo {
    return {
        state: DevFirmwareUpgradingState.UpgradingUnavaliable,
        module_type: '',
        version: '',
        url: '',
        name: '',
        description: '',
    };
}

function createDefaultHMS(): HMSInfo {
    return { items: [] };
}

function createDefaultConfig(): MachineConfig {
    return {
        has_chamber: false,
        support_chamber_edit: false,
        chamber_temp_edit_min: 0,
        chamber_temp_edit_max: 60,
        chamber_temp_switch_heat: Number.MAX_SAFE_INTEGER,
        support_first_layer_inspect: false,
        support_save_remote_print_file_to_storage: false,
        support_ai_monitor: false,
        support_print_without_sd: false,
        support_print_all_plates: false,
        support_calibration_lidar: false,
        support_calibration_nozzle_offset: false,
        support_calibration_high_temp_bed: false,
        support_calibration_clump_pos: false,
        support_calibration_pa_flow_auto: false,
    };
}

function createDefaultPrintOptions(): PrintOptions {
    return {
        speed_level: DevPrintingSpeedLevel.SPEED_LEVEL_NORMAL,
        ai_monitoring: false,
        ai_monitoring_sensitivity: '',
        first_layer_inspector: false,
        buildplate_marker_detector: false,
        auto_recovery_step_loss: false,
        allow_prompt_sound: false,
        filament_tangle_detect: false,
        idle_heating_protect_enabled: -1,
    };
}

function createDefaultPrintTask(): PrintTaskInfo {
    return {
        filename: '',
        progress: 0,
        time_elapsed: 0,
        time_remaining: 0,
        status: PrinterState.IDLE,
        layer_count: 0,
        current_layer: 0,
        total_layers: 0,
    };
}

/** Create a new empty MachineObject with default values */
export function createMachineObject(dev_id: string, dev_name: string): MachineObject {
    return {
        dev_id,
        dev_name,
        dev_ip: '0.0.0.0',
        printer_type: '',
        printer_series: PrinterSeries.SERIES_UNKNOWN,
        printer_arch: PrinterArch.CORE_XY,
        signal: 0,
        connection_type: ConnectionType.DISCONNECTED,
        bind_state: 'unbound',
        info: createDefaultFirmware(),
        config: createDefaultConfig(),
        bed: createDefaultBed(),
        extruder_system: createDefaultExtruderSystem(),
        fan: createDefaultFan(),
        fila_system: createDefaultFilaSystem(),
        nozzle_system: createDefaultNozzleSystem(),
        storage: createDefaultStorage(),
        lamp: createDefaultLamp(),
        firmware_upgrade: createDefaultFirmwareUpgrade(),
        hms: createDefaultHMS(),
        print_options: createDefaultPrintOptions(),
        print_task: createDefaultPrintTask(),
        last_seen: Date.now(),
        last_print_update: Date.now(),
    };
}

// ─── Writable Stores ──────────────────────────────────────────────────

/** The device manager state */
export const deviceManager = writable<DeviceManager>({
    selected_machine_id: '',
    local_selected_machine_id: '',
    multi_machine_enabled: false,
    local_machines: {},
    cloud_machines: {},
    subscribe_list: [],
});

/** All known machines (local + cloud combined) */
export const allMachines = derived(deviceManager, ($dm) => {
    const merged: Record<string, MachineObject> = {};
    for (const [id, m] of Object.entries($dm.local_machines)) {
        merged[id] = m;
    }
    for (const [id, m] of Object.entries($dm.cloud_machines)) {
        if (!merged[id]) {
            merged[id] = m;
        } else {
            // Cloud data takes priority for existing machines
            merged[id] = { ...merged[id], ...m };
        }
    }
    return merged;
});

/** The currently selected machine object */
export const selectedMachine = derived(
    [deviceManager, allMachines],
    ([$dm, $all]) => {
        return $all[$dm.selected_machine_id] ?? null;
    }
);

/** List of machine IDs for display */
export const machineIdList = derived(allMachines, ($all) => Object.keys($all));

// ─── Actions ──────────────────────────────────────────────────────────

/** Add or update a machine in the local list */
export function upsertLocalMachine(machine: MachineObject) {
    deviceManager.update(($dm) => {
        $dm.local_machines[machine.dev_id] = machine;
        return $dm;
    });
}

/** Add or update a machine in the cloud list */
export function upsertCloudMachine(machine: MachineObject) {
    deviceManager.update(($dm) => {
        $dm.cloud_machines[machine.dev_id] = machine;
        return $dm;
    });
}

/** Remove a local machine */
export function removeLocalMachine(dev_id: string) {
    deviceManager.update(($dm) => {
        delete $dm.local_machines[dev_id];
        return $dm;
    });
}

/** Remove a cloud machine */
export function removeCloudMachine(dev_id: string) {
    deviceManager.update(($dm) => {
        delete $dm.cloud_machines[dev_id];
        return $dm;
    });
}

/** Select a machine by dev_id */
export function selectMachine(dev_id: string) {
    deviceManager.update(($dm) => {
        $dm.selected_machine_id = dev_id;
        return $dm;
    });
}

/** Enable/disable multi-machine mode */
export function setMultiMachine(enabled: boolean) {
    deviceManager.update(($dm) => {
        $dm.multi_machine_enabled = enabled;
        return $dm;
    });
}

// ─── Subsystem Update Helpers ─────────────────────────────────────────

/** Update bed info on the selected machine */
export function updateBed(bed: Partial<BedInfo>) {
    deviceManager.update(($dm) => {
        const m = $dm.local_machines[$dm.selected_machine_id] ?? $dm.cloud_machines[$dm.selected_machine_id];
        if (m) {
            Object.assign(m.bed, bed);
        }
        return $dm;
    });
}

/** Update extruder system on the selected machine */
export function updateExtruderSystem(system: Partial<ExtruderSystem>) {
    deviceManager.update(($dm) => {
        const m = $dm.local_machines[$dm.selected_machine_id] ?? $dm.cloud_machines[$dm.selected_machine_id];
        if (m) {
            Object.assign(m.extruder_system, system);
        }
        return $dm;
    });
}

/** Update fan info on the selected machine */
export function updateFan(fan: Partial<FanInfo>) {
    deviceManager.update(($dm) => {
        const m = $dm.local_machines[$dm.selected_machine_id] ?? $dm.cloud_machines[$dm.selected_machine_id];
        if (m) {
            Object.assign(m.fan, fan);
        }
        return $dm;
    });
}

/** Update filament/AMS system on the selected machine */
export function updateFilaSystem(system: Partial<FilaSystem>) {
    deviceManager.update(($dm) => {
        const m = $dm.local_machines[$dm.selected_machine_id] ?? $dm.cloud_machines[$dm.selected_machine_id];
        if (m) {
            Object.assign(m.fila_system, system);
        }
        return $dm;
    });
}

/** Update nozzle system on the selected machine */
export function updateNozzleSystem(system: Partial<NozzleSystem>) {
    deviceManager.update(($dm) => {
        const m = $dm.local_machines[$dm.selected_machine_id] ?? $dm.cloud_machines[$dm.selected_machine_id];
        if (m) {
            Object.assign(m.nozzle_system, system);
        }
        return $dm;
    });
}

/** Update storage info on the selected machine */
export function updateStorage(storage: Partial<StorageInfo>) {
    deviceManager.update(($dm) => {
        const m = $dm.local_machines[$dm.selected_machine_id] ?? $dm.cloud_machines[$dm.selected_machine_id];
        if (m) {
            Object.assign(m.storage, storage);
        }
        return $dm;
    });
}

/** Update lamp info on the selected machine */
export function updateLamp(lamp: Partial<LampInfo>) {
    deviceManager.update(($dm) => {
        const m = $dm.local_machines[$dm.selected_machine_id] ?? $dm.cloud_machines[$dm.selected_machine_id];
        if (m) {
            Object.assign(m.lamp, lamp);
        }
        return $dm;
    });
}

/** Update firmware info on the selected machine */
export function updateFirmware(fw: Partial<FirmwareInfo>) {
    deviceManager.update(($dm) => {
        const m = $dm.local_machines[$dm.selected_machine_id] ?? $dm.cloud_machines[$dm.selected_machine_id];
        if (m) {
            Object.assign(m.info, fw);
        }
        return $dm;
    });
}

/** Update firmware upgrade info on the selected machine */
export function updateFirmwareUpgrade(upgrade: Partial<FirmwareUpgradeInfo>) {
    deviceManager.update(($dm) => {
        const m = $dm.local_machines[$dm.selected_machine_id] ?? $dm.cloud_machines[$dm.selected_machine_id];
        if (m) {
            Object.assign(m.firmware_upgrade, upgrade);
        }
        return $dm;
    });
}

/** Update HMS messages on the selected machine */
export function updateHMS(hms: Partial<HMSInfo>) {
    deviceManager.update(($dm) => {
        const m = $dm.local_machines[$dm.selected_machine_id] ?? $dm.cloud_machines[$dm.selected_machine_id];
        if (m) {
            Object.assign(m.hms, hms);
        }
        return $dm;
    });
}

/** Update machine config on the selected machine */
export function updateMachineConfig(config: Partial<MachineConfig>) {
    deviceManager.update(($dm) => {
        const m = $dm.local_machines[$dm.selected_machine_id] ?? $dm.cloud_machines[$dm.selected_machine_id];
        if (m) {
            Object.assign(m.config, config);
        }
        return $dm;
    });
}

/** Update print options on the selected machine */
export function updatePrintOptions(opts: Partial<PrintOptions>) {
    deviceManager.update(($dm) => {
        const m = $dm.local_machines[$dm.selected_machine_id] ?? $dm.cloud_machines[$dm.selected_machine_id];
        if (m) {
            Object.assign(m.print_options, opts);
        }
        return $dm;
    });
}

/** Update print task info on the selected machine */
export function updatePrintTask(task: Partial<PrintTaskInfo>) {
    deviceManager.update(($dm) => {
        const m = $dm.local_machines[$dm.selected_machine_id] ?? $dm.cloud_machines[$dm.selected_machine_id];
        if (m) {
            Object.assign(m.print_task, task);
        }
        return $dm;
    });
}

/** Update connection type on the selected machine */
export function updateConnection(conn: ConnectionType, ip: string = '', signal: number = 0) {
    deviceManager.update(($dm) => {
        const m = $dm.local_machines[$dm.selected_machine_id] ?? $dm.cloud_machines[$dm.selected_machine_id];
        if (m) {
            m.connection_type = conn;
            m.dev_ip = ip;
            m.signal = signal;
        }
        return $dm;
    });
}

// ─── Derived Convenience Stores ───────────────────────────────────────

export const selectedMachineBed = derived(selectedMachine, ($m) => $m?.bed ?? createDefaultBed());
export const selectedMachineExtruder = derived(selectedMachine, ($m) => $m?.extruder_system ?? createDefaultExtruderSystem());
export const selectedMachineFan = derived(selectedMachine, ($m) => $m?.fan ?? createDefaultFan());
export const selectedMachineFila = derived(selectedMachine, ($m) => $m?.fila_system ?? createDefaultFilaSystem());
export const selectedMachineNozzles = derived(selectedMachine, ($m) => $m?.nozzle_system ?? createDefaultNozzleSystem());
export const selectedMachineStorage = derived(selectedMachine, ($m) => $m?.storage ?? createDefaultStorage());
export const selectedMachineLamp = derived(selectedMachine, ($m) => $m?.lamp ?? createDefaultLamp());
export const selectedMachineFirmware = derived(selectedMachine, ($m) => $m?.info ?? createDefaultFirmware());
export const selectedMachineFirmwareUpgrade = derived(selectedMachine, ($m) => $m?.firmware_upgrade ?? createDefaultFirmwareUpgrade());
export const selectedMachineHMS = derived(selectedMachine, ($m) => $m?.hms ?? createDefaultHMS());
export const selectedMachineConfig = derived(selectedMachine, ($m) => $m?.config ?? createDefaultConfig());
export const selectedMachinePrintOptions = derived(selectedMachine, ($m) => $m?.print_options ?? createDefaultPrintOptions());
export const selectedMachinePrintTask = derived(selectedMachine, ($m) => $m?.print_task ?? createDefaultPrintTask());
export const selectedMachineConnection = derived(selectedMachine, ($m) => ({
    type: $m?.connection_type ?? ConnectionType.DISCONNECTED,
    ip: $m?.dev_ip ?? '',
    signal: $m?.signal ?? 0,
    name: $m?.dev_name ?? 'Unknown Printer',
}));
