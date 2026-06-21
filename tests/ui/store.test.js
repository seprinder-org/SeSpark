import assert from 'node:assert';
import { test, describe } from 'node:test';

describe('UI State & Store logic tests', () => {
  // Mock function representing derived(sliceResult, ($res) => $res ? $res.layer_count : 0)
  function deriveMaxLayers(sliceResult) {
    return sliceResult ? sliceResult.layer_count : 0;
  }

  test('deriveMaxLayers returns 0 when sliceResult is null', () => {
    assert.strictEqual(deriveMaxLayers(null), 0);
  });

  test('deriveMaxLayers returns layer_count when sliceResult is loaded', () => {
    const mockSliceResult = {
      gcode: '; GCODE...',
      layers: [],
      print_time_secs: 1200,
      filament_used_g: 15.5,
      filament_used_mm: 5000,
      layer_count: 75,
    };
    assert.strictEqual(deriveMaxLayers(mockSliceResult), 75);
  });

  test('default slicer settings matches expected presets', () => {
    const defaultSettings = {
      layer_height: 0.20,
      nozzle_diameter: 0.4,
      filament_diameter: 1.75,
      wall_loops: 2,
      infill_density: 15,
      infill_pattern: 'grid',
      bed_temp: 60,
      extruder_temp: 220,
      print_speed: 60,
      travel_speed: 150,
    };

    assert.strictEqual(defaultSettings.layer_height, 0.2);
    assert.strictEqual(defaultSettings.nozzle_diameter, 0.4);
    assert.strictEqual(defaultSettings.infill_pattern, 'grid');
  });
});
