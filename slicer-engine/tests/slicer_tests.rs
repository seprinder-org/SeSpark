use slicer_engine::{slice_stl_core, SliceSettings};

#[test]
fn test_slicing_pipeline_gcode_output() {
    let stl_data = b"solid test_box
facet normal 0 0 1
    outer loop
        vertex 0 0 0
        vertex 10 0 0
        vertex 0 0 10
    endloop
endfacet
endsolid test_box";

    let settings_json = r#"{
        "layer_height": 0.2,
        "nozzle_diameter": 0.4,
        "filament_diameter": 1.75,
        "wall_loops": 1,
        "infill_density": 15.0,
        "infill_pattern": "grid",
        "bed_temp": 65,
        "extruder_temp": 215,
        "print_speed": 60.0,
        "travel_speed": 150.0
    }"#;
    let settings: SliceSettings = serde_json::from_str(settings_json).unwrap();
    let result = slice_stl_core(stl_data, &settings);
    assert!(result.is_ok());

    let slice_res = result.unwrap();
    let gcode = slice_res.gcode;
    
    // Verify G-code settings are embedded correctly
    assert!(gcode.contains("M140 S65")); // Bed temp 65
    assert!(gcode.contains("M104 S215")); // Extruder temp 215
    assert!(slice_res.layer_count > 0);
    assert!(slice_res.filament_used_g > 0.0);
}
