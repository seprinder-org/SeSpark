/**
 * DeviceCore TypeScript Models
 *
 * Maps the C++ DeviceCore architecture (from OrcaSlicer) to the frontend.
 * See: OrcaSlicer/src/slic3r/GUI/DeviceCore/
 *
 * Architecture:
 *   DeviceManager (manages multiple machines)
 *     └─ MachineObject (a single printer)
 *          ├─ DevInfo          - Static machine info (name, IP, serial, firmware)
 *          ├─ DevConfig        - Machine capabilities (chamber, AI, calibration)
 *          ├─ DevBed           - Bed temperature
 *          ├─ DevExtruderSystem - Extruders, nozzles, temperatures
 *          ├─ DevFan           - Cooling fans, air duct system
 *          ├─ DevFilaSystem    - AMS units, filament trays
 *          ├─ DevNozzleSystem  - Nozzle registry
 *          ├─ DevStorage       - SD card state
 *          ├─ DevLamp          - Chamber light
 *          ├─ DevFirmware      - Firmware version info
 *          ├─ DevHMS           - HMS error/warning messages
 *          ├─ DevPrintOptions  - Print speed, AI detection options
 *          ├─ DevPrintTaskInfo - Print job info & ratings
 *          └─ DevCtrl          - Command interface
 */

// ─── Enums (matching DevDefs.h) ───────────────────────────────────────

export enum PrinterArch {
    CORE_XY = 0,
    I3 = 1,
}

export enum PrinterSeries {
    SERIES_X1 = 0,
    SERIES_P1P = 1,
    SERIES_UNKNOWN = 2,
}

export enum AmsStatusMain {
    AMS_STATUS_MAIN_IDLE = 0x00,
    AMS_STATUS_MAIN_FILAMENT_CHANGE = 0x01,
    AMS_STATUS_MAIN_RFID_IDENTIFYING = 0x02,
    AMS_STATUS_MAIN_ASSIST = 0x03,
    AMS_STATUS_MAIN_CALIBRATION = 0x04,
    AMS_STATUS_MAIN_SELF_CHECK = 0x10,
    AMS_STATUS_MAIN_DEBUG = 0x20,
    AMS_STATUS_MAIN_UNKNOWN = 0xFF,
}

export enum NozzleFlowType {
    NONE_FLOWTYPE = 0,
    S_FLOW = 1,
    H_FLOW = 2,
}

export enum DevPrintingSpeedLevel {
    SPEED_LEVEL_INVALID = 0,
    SPEED_LEVEL_SILENCE = 1,
    SPEED_LEVEL_NORMAL = 2,
    SPEED_LEVEL_RAPID = 3,
    SPEED_LEVEL_RAMPAGE = 4,
}

export enum DevFirmwareUpgradingState {
    DC = -1,
    UpgradingUnavaliable = 0,
    UpgradingAvaliable = 1,
    UpgradingInProgress = 2,
    UpgradingFinished = 3,
}

export enum ConnectionType {
    DISCONNECTED = 'disconnected',
    LAN = 'lan',
    CLOUD = 'cloud',
}

export enum PrinterState {
    IDLE = 'Idle',
    HEATING = 'Heating',
    PRINTING = 'Printing',
    PAUSED = 'Paused',
    FINISHED = 'Finished',
    ERROR = 'Error',
}

export enum SdcardState {
    NO_SDCARD = 0,
    HAS_SDCARD_NORMAL = 1,
    HAS_SDCARD_ABNORMAL = 2,
    HAS_SDCARD_READONLY = 3,
}

export enum LightEffect {
    ON = 'ON',
    OFF = 'OFF',
    FLASHING = 'FLASHING',
    UNKNOWN = 'UNKNOWN',
}

export enum HMSMessageLevel {
    UNKNOWN = 0,
    FATAL = 1,
    SERIOUS = 2,
    COMMON = 3,
    INFO = 4,
}

export enum ModuleID {
    UNKNOWN = 0x00,
    MC = 0x03,
    MAINBOARD = 0x05,
    AMS = 0x07,
    TH = 0x08,
    XCAM = 0x0C,
}

export enum AmsType {
    DUMMY = 0,
    AMS = 1,
    AMS_LITE = 2,
    N3F = 3,
    N3S = 4,
}

export enum DevExtderSwitchState {
    IDLE = 0,
    BUSY = 1,
    SWITCHING = 2,
    SWITCHING_FAILED = 3,
}

export enum AirDuctMode {
    NONE = -1,
    COOLING_FILT = 0,
    HEATING_INTERNAL_FILT = 1,
    EXHAUST = 2,
    FULL_COOLING = 3,
    INIT = 0xFF,
}

export enum FanType {
    COOLING_FAN = 1,
    BIG_COOLING_FAN = 2,
    CHAMBER_FAN = 3,
    EXHAUST_FAN = 4,
    FILTER_FAN = 5,
}

export enum PrinterFirmwareType {
    ENGINEER = 0,
    PRODUCTION = 1,
    UNKNOWN = 2,
}

// ─── Interfaces ───────────────────────────────────────────────────────

/** DevAmsSlotInfo - AMS slot binding on an extruder */
export interface AmsSlotInfo {
    ams_id: string;
    slot_id: string;
}

/** DevNozzle - A single nozzle in the nozzle system */
export interface NozzleInfo {
    nozzle_id: number;
    flow_type: NozzleFlowType;
    nozzle_type: number;
    diameter: number;
}

/** DevExtder - A single extruder */
export interface ExtruderInfo {
    ext_id: number;
    has_nozzle: boolean;
    nozzle_id: number;
    nozzle_type: number;
    nozzle_flow_type: NozzleFlowType;
    nozzle_diameter: number;
    current_temp: number;
    target_temp: number;
    has_filament: boolean;
    filam_backup: number[];
    slot_pre: AmsSlotInfo;
    slot_now: AmsSlotInfo;
    slot_target: AmsSlotInfo;
}

/** DevExtruderSystem - Extruder management system */
export interface ExtruderSystem {
    total_extruder_count: number;
    current_extruder_id: number;
    switch_state: DevExtderSwitchState;
    is_switching: boolean;
    is_switching_failed: boolean;
    loading_extruder_id: number;
    is_busy_loading: boolean;
    extruders: ExtruderInfo[];
}

/** DevAmsTray - A single filament tray/slot */
export interface AmsTray {
    id: string;
    tag_uid: string;
    setting_id: string;
    filament_setting_id: string;
    filament_type: string;
    sub_brands: string;
    color: string;
    cols: string[];
    weight: string;
    diameter: string;
    temp: string;
    time: string;
    bed_temp_type: string;
    bed_temp: string;
    nozzle_temp_max: string;
    nozzle_temp_min: string;
    xcam_info: string;
    uuid: string;
    ctype: number;
    k: number;
    n: number;
    cali_idx: number;
    is_bbl: boolean;
    is_exists: boolean;
    is_slot_placeholder: boolean;
    remain: number;
}

/** DevAms - A single AMS unit */
export interface AmsUnit {
    ams_id: string;
    ams_type: AmsType;
    extruder_id: number;
    exists: boolean;
    slot_count: number;
    current_temperature: number;
    humidity_level: number;
    humidity_percent: number;
    left_dry_time: number;
    support_humidity: boolean;
    support_drying: boolean;
    trays: Record<string, AmsTray>;
}

/** DevFilaSystem - Central AMS/filament manager */
export interface FilaSystem {
    has_ams: boolean;
    ams_count: number;
    ams_list: Record<string, AmsUnit>;
    detect_on_insert: boolean | null;
    detect_on_powerup: boolean;
    detect_remain: boolean;
    auto_refill: boolean;
}

/** DevBed - Bed temperature data */
export interface BedInfo {
    temp: number;
    target_temp: number;
}

/** DevFan - Fan system */
export interface FanInfo {
    heatbreak_fan_speed: number;
    cooling_fan_speed: number;
    big_fan1_speed: number;
    big_fan2_speed: number;
    fan_gear: number;
    support_aux_fan: boolean;
    support_chamber_fan: boolean;
    support_airduct: boolean;
    air_duct_data: AirDuctData | null;
}

/** AirDuctData - Air duct system state */
export interface AirDuctData {
    current_mode: number;
    sub_mode: number;
    support_cooling_filter: boolean;
    is_cooling_filter_on: boolean;
    modes: Record<number, AirMode>;
    parts: AirPart[];
}

export interface AirMode {
    id: number;
    ctrl: number[];
    off: number[];
}

export interface AirPart {
    type: number;
    id: number;
    func: number;
    state: number;
    range_start: number;
    range_end: number;
}

/** DevNozzleSystem - Nozzle registry */
export interface NozzleSystem {
    nozzles: Record<number, NozzleInfo>;
    is_refreshing: boolean;
}

/** DevStorage - SD card state */
export interface StorageInfo {
    sdcard_state: SdcardState;
}

/** DevLamp - Chamber light */
export interface LampInfo {
    chamber_light: LightEffect;
    is_chamber_light_on: boolean;
    lamp_close_recheck: boolean;
}

/** DevFirmware - Firmware version info */
export interface FirmwareInfo {
    name: string;
    product_name: string;
    sn: string;
    hw_ver: string;
    sw_ver: string;
    sw_new_ver: string;
    firmware_flag: number;
    is_valid: boolean;
    is_air_pump: boolean;
    is_laser: boolean;
    is_cutting_module: boolean;
    is_extinguish_system: boolean;
}

/** DevFirmwareUpgradeInfo */
export interface FirmwareUpgradeInfo {
    state: DevFirmwareUpgradingState;
    module_type: string;
    version: string;
    url: string;
    name: string;
    description: string;
}

/** DevHMSItem - A single HMS error/warning message */
export interface HMSItem {
    module_id: ModuleID;
    module_num: number;
    part_id: number;
    msg_level: HMSMessageLevel;
    msg_code: number;
    long_error_code: string;
    already_read: boolean;
}

/** DevHMS - HMS error/warning system */
export interface HMSInfo {
    items: HMSItem[];
}

/** DevConfig - Machine capabilities */
export interface MachineConfig {
    has_chamber: boolean;
    support_chamber_edit: boolean;
    chamber_temp_edit_min: number;
    chamber_temp_edit_max: number;
    chamber_temp_switch_heat: number;
    support_first_layer_inspect: boolean;
    support_save_remote_print_file_to_storage: boolean;
    support_ai_monitor: boolean;
    support_print_without_sd: boolean;
    support_print_all_plates: boolean;
    support_calibration_lidar: boolean;
    support_calibration_nozzle_offset: boolean;
    support_calibration_high_temp_bed: boolean;
    support_calibration_clump_pos: boolean;
    support_calibration_pa_flow_auto: boolean;
}

/** DevPrintOptions - Print/detection options */
export interface PrintOptions {
    speed_level: DevPrintingSpeedLevel;
    ai_monitoring: boolean;
    ai_monitoring_sensitivity: string;
    first_layer_inspector: boolean;
    buildplate_marker_detector: boolean;
    auto_recovery_step_loss: boolean;
    allow_prompt_sound: boolean;
    filament_tangle_detect: boolean;
    idle_heating_protect_enabled: number;
}

/** DevPrintTaskInfo - Print job info */
export interface PrintTaskInfo {
    filename: string;
    progress: number;
    time_elapsed: number;
    time_remaining: number;
    status: PrinterState;
    layer_count: number;
    current_layer: number;
    total_layers: number;
}

/** DevPrintTaskRatingInfo */
export interface PrintTaskRatingInfo {
    request_successful: boolean;
    http_code: number;
    rating_id: number;
    start_count: number;
    success_printed: boolean;
    content: string;
    image_url_paths: string[];
}

/** MachineObject - A single printer device (the main aggregate) */
export interface MachineObject {
    dev_id: string;
    dev_name: string;
    dev_ip: string;
    printer_type: string;
    printer_series: PrinterSeries;
    printer_arch: PrinterArch;
    signal: number;
    connection_type: ConnectionType;
    bind_state: string;
    info: FirmwareInfo;
    config: MachineConfig;
    bed: BedInfo;
    extruder_system: ExtruderSystem;
    fan: FanInfo;
    fila_system: FilaSystem;
    nozzle_system: NozzleSystem;
    storage: StorageInfo;
    lamp: LampInfo;
    firmware_upgrade: FirmwareUpgradeInfo;
    hms: HMSInfo;
    print_options: PrintOptions;
    print_task: PrintTaskInfo;
    last_seen: number;
    last_print_update: number;
}

/** DeviceManager - Manages multiple machines */
export interface DeviceManager {
    selected_machine_id: string;
    local_selected_machine_id: string;
    multi_machine_enabled: boolean;
    local_machines: Record<string, MachineObject>;
    cloud_machines: Record<string, MachineObject>;
    subscribe_list: string[];
}

// ─── Helper Functions ─────────────────────────────────────────────────

export function getSpeedLevelLabel(level: DevPrintingSpeedLevel): string {
    switch (level) {
        case DevPrintingSpeedLevel.SPEED_LEVEL_SILENCE: return 'Silent';
        case DevPrintingSpeedLevel.SPEED_LEVEL_NORMAL: return 'Normal';
        case DevPrintingSpeedLevel.SPEED_LEVEL_RAPID: return 'Rapid';
        case DevPrintingSpeedLevel.SPEED_LEVEL_RAMPAGE: return 'Rampage';
        default: return 'Unknown';
    }
}

export function getSdcardStateLabel(state: SdcardState): string {
    switch (state) {
        case SdcardState.NO_SDCARD: return 'No SD Card';
        case SdcardState.HAS_SDCARD_NORMAL: return 'SD Card OK';
        case SdcardState.HAS_SDCARD_ABNORMAL: return 'SD Card Error';
        case SdcardState.HAS_SDCARD_READONLY: return 'SD Card Read-Only';
        default: return 'Unknown';
    }
}

export function getHMSLevelLabel(level: HMSMessageLevel): string {
    switch (level) {
        case HMSMessageLevel.FATAL: return 'Fatal';
        case HMSMessageLevel.SERIOUS: return 'Serious';
        case HMSMessageLevel.COMMON: return 'Common';
        case HMSMessageLevel.INFO: return 'Info';
        default: return 'Unknown';
    }
}

export function getAmsTypeLabel(type: AmsType): string {
    switch (type) {
        case AmsType.AMS: return 'AMS';
        case AmsType.AMS_LITE: return 'AMS Lite';
        case AmsType.N3F: return 'N3F';
        case AmsType.N3S: return 'N3S';
        default: return 'Unknown';
    }
}

export function getLightEffectLabel(effect: LightEffect): string {
    switch (effect) {
        case LightEffect.ON: return 'On';
        case LightEffect.OFF: return 'Off';
        case LightEffect.FLASHING: return 'Flashing';
        default: return 'Unknown';
    }
}
