/**
 * Device Components Barrel Export
 *
 * All device UI sub-components, organized by the C++ DeviceCore subsystem they map to.
 *
 * Architecture:
 *   DeviceManager -> MachineObject -> subsystems (Bed, Fan, FilaSystem, NozzleSystem, etc.)
 *
 * Component hierarchy:
 *   DeviceDashboard (container)
 *     ├─ DeviceHeader        (DevInfo + connection state)
 *     ├─ PrinterStatus       (DevBed + DevExtruderSystem temps + DevPrintTaskInfo)
 *     ├─ TemperatureChart    (temperature history visualization)
 *     ├─ JogControls         (DevCtrl - manual movement)
 *     ├─ ConsolePanel        (DevCtrl - G-code terminal)
 *     ├─ MediaPanel          (camera / live view)
 *     ├─ FirmwarePanel       (DevFirmware + DevFirmwareUpgradeInfo)
 *     ├─ HMSPanel            (DevHMS)
 *     ├─ AMSPanel            (DevFilaSystem + DevAms + DevAmsTray)
 *     ├─ FanPanel            (DevFan + AirDuctData)
 *     ├─ StoragePanel        (DevStorage)
 *     ├─ LampPanel           (DevLamp)
 *     ├─ ConfigPanel         (DevConfig)
 *     └─ PrintOptionsPanel   (DevPrintOptions)
 */

export { default as DeviceHeader } from './DeviceHeader.svelte';
export { default as PrinterStatus } from './PrinterStatus.svelte';
export { default as TemperatureChart } from './TemperatureChart.svelte';
export { default as JogControls } from './JogControls.svelte';
export { default as ConsolePanel } from './ConsolePanel.svelte';
export { default as MediaPanel } from './MediaPanel.svelte';
export { default as FirmwarePanel } from './FirmwarePanel.svelte';
export { default as HMSPanel } from './HMSPanel.svelte';
export { default as AMSPanel } from './AMSPanel.svelte';
export { default as FanPanel } from './FanPanel.svelte';
export { default as StoragePanel } from './StoragePanel.svelte';
export { default as LampPanel } from './LampPanel.svelte';
export { default as ConfigPanel } from './ConfigPanel.svelte';
export { default as PrintOptionsPanel } from './PrintOptionsPanel.svelte';
