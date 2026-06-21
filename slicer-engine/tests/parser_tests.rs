use slicer_engine::{slice_stl_core, SliceSettings};

#[test]
fn test_parse_invalid_stl() {
    let empty_data: &[u8] = &[];
    let settings_json = r#"{
        "layer_height": 0.2,
        "nozzle_diameter": 0.4,
        "filament_diameter": 1.75,
        "wall_loops": 2,
        "infill_density": 15.0,
        "infill_pattern": "grid",
        "bed_temp": 60,
        "extruder_temp": 220,
        "print_speed": 60.0,
        "travel_speed": 150.0
    }"#;
    let settings: SliceSettings = serde_json::from_str(settings_json).unwrap();
    let result = slice_stl_core(empty_data, &settings);
    assert!(result.is_err());
}

#[test]
fn test_parse_valid_ascii_stl() {
    let stl_data = b"solid test_box
facet normal 0 0 1
    outer loop
        vertex 0 0 0
        vertex 10 0 0
        vertex 0 10 0
    endloop
endfacet
endsolid test_box";

    let settings_json = r#"{
        "layer_height": 0.2,
        "nozzle_diameter": 0.4,
        "filament_diameter": 1.75,
        "wall_loops": 1,
        "infill_density": 0.0,
        "infill_pattern": "grid",
        "bed_temp": 60,
        "extruder_temp": 220,
        "print_speed": 60.0,
        "travel_speed": 150.0
    }"#;
    let settings: SliceSettings = serde_json::from_str(settings_json).unwrap();
    let result = slice_stl_core(stl_data, &settings);
    assert!(result.is_ok());
}
