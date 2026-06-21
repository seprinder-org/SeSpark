use serde::{Deserialize, Serialize};
use std::f32::consts::PI;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Point3D {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

impl Point3D {
    fn new(x: f32, y: f32, z: f32) -> Self {
        Point3D { x, y, z }
    }
}

#[derive(Debug, Clone, Copy)]
pub struct Triangle {
    pub normal: Point3D,
    pub v1: Point3D,
    pub v2: Point3D,
    pub v3: Point3D,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PathSegment {
    pub path_type: String, // "Travel" | "Wall-Outer" | "Wall-Inner" | "Infill"
    pub points: Vec<Point3D>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LayerData {
    pub z: f32,
    pub segments: Vec<PathSegment>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SliceSettings {
    pub layer_height: f32,
    pub nozzle_diameter: f32,
    pub filament_diameter: f32,
    pub wall_loops: usize,
    pub infill_density: f32, // 0.0 to 100.0
    pub infill_pattern: String, // "grid" | "lines"
    pub bed_temp: i32,
    pub extruder_temp: i32,
    pub print_speed: f32, // mm/s
    pub travel_speed: f32, // mm/s
}

#[derive(Debug, Clone, Serialize)]
pub struct SliceResult {
    pub gcode: String,
    pub layers: Vec<LayerData>,
    pub print_time_secs: f32,
    pub filament_used_g: f32,
    pub filament_used_mm: f32,
    pub layer_count: usize,
}

// Helper: 2D distance between points (ignoring Z)
fn dist_2d(p1: &Point3D, p2: &Point3D) -> f32 {
    let dx = p1.x - p2.x;
    let dy = p1.y - p2.y;
    (dx * dx + dy * dy).sqrt()
}

// Helper: Parse binary STL
fn parse_binary_stl(data: &[u8]) -> Result<Vec<Triangle>, String> {
    if data.len() < 84 {
        return Err("File too short for binary STL".to_string());
    }

    let num_triangles_bytes = &data[80..84];
    let num_triangles = u32::from_le_bytes(num_triangles_bytes.try_into().unwrap()) as usize;
    
    let expected_size = 84 + num_triangles * 50;
    if data.len() < expected_size {
        return Err(format!(
            "File size mismatch: expected at least {} bytes for {} triangles, got {}",
            expected_size, num_triangles, data.len()
        ));
    }

    let mut triangles = Vec::with_capacity(num_triangles);
    let mut offset = 84;

    for _ in 0..num_triangles {
        let read_f32 = |offset: &mut usize| -> f32 {
            let val = f32::from_le_bytes(data[*offset..*offset + 4].try_into().unwrap());
            *offset += 4;
            val
        };

        let normal = Point3D::new(read_f32(&mut offset), read_f32(&mut offset), read_f32(&mut offset));
        let v1 = Point3D::new(read_f32(&mut offset), read_f32(&mut offset), read_f32(&mut offset));
        let v2 = Point3D::new(read_f32(&mut offset), read_f32(&mut offset), read_f32(&mut offset));
        let v3 = Point3D::new(read_f32(&mut offset), read_f32(&mut offset), read_f32(&mut offset));
        
        offset += 2; // skip attributes u16

        triangles.push(Triangle { normal, v1, v2, v3 });
    }

    Ok(triangles)
}

// Helper: Parse ASCII STL
fn parse_ascii_stl(data: &[u8]) -> Result<Vec<Triangle>, String> {
    let text = std::str::from_utf8(data).map_err(|_| "Failed to decode ASCII STL text")?;
    let mut triangles = Vec::new();
    let mut lines = text.lines();

    let mut current_normal = Point3D::new(0.0, 0.0, 0.0);
    let mut current_vertices = Vec::new();

    while let Some(line) = lines.next() {
        let trimmed = line.trim();
        if trimmed.starts_with("facet normal") {
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            if parts.len() >= 5 {
                let nx = parts[2].parse::<f32>().unwrap_or(0.0);
                let ny = parts[3].parse::<f32>().unwrap_or(0.0);
                let nz = parts[4].parse::<f32>().unwrap_or(0.0);
                current_normal = Point3D::new(nx, ny, nz);
            }
            current_vertices.clear();
        } else if trimmed.starts_with("vertex") {
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            if parts.len() >= 4 {
                let vx = parts[1].parse::<f32>().unwrap_or(0.0);
                let vy = parts[2].parse::<f32>().unwrap_or(0.0);
                let vz = parts[3].parse::<f32>().unwrap_or(0.0);
                current_vertices.push(Point3D::new(vx, vy, vz));
            }
        } else if trimmed.starts_with("endfacet") {
            if current_vertices.len() == 3 {
                triangles.push(Triangle {
                    normal: current_normal,
                    v1: current_vertices[0],
                    v2: current_vertices[1],
                    v3: current_vertices[2],
                });
            }
        }
    }

    if triangles.is_empty() {
        return Err("No triangles parsed from ASCII STL".to_string());
    }

    Ok(triangles)
}

// Main parser
pub fn parse_stl(data: &[u8]) -> Result<Vec<Triangle>, String> {
    if data.len() > 5 && &data[0..5] == b"solid" {
        // Double check if it looks like ASCII
        if let Ok(text) = std::str::from_utf8(&data[0..std::cmp::min(100, data.len())]) {
            if text.contains("facet") || text.contains("outer") {
                return parse_ascii_stl(data);
            }
        }
    }
    parse_binary_stl(data)
}

// Link unoriented segments into loops
fn link_segments_into_loops(mut segments: Vec<(Point3D, Point3D)>) -> Vec<Vec<Point3D>> {
    let mut loops = Vec::new();
    let tolerance = 0.05; // 50 microns

    while !segments.is_empty() {
        let mut current_loop = Vec::new();
        let (p1, p2) = segments.remove(0);
        current_loop.push(p1);
        current_loop.push(p2);

        let mut progress = true;
        while progress {
            progress = false;
            let last_pt = *current_loop.last().unwrap();

            let mut found_idx = None;
            let mut reverse = false;

            for (i, (s_p1, s_p2)) in segments.iter().enumerate() {
                if dist_2d(&last_pt, s_p1) < tolerance {
                    found_idx = Some(i);
                    reverse = false;
                    break;
                } else if dist_2d(&last_pt, s_p2) < tolerance {
                    found_idx = Some(i);
                    reverse = true;
                    break;
                }
            }

            if let Some(idx) = found_idx {
                let (s_p1, s_p2) = segments.remove(idx);
                let next_pt = if reverse { s_p1 } else { s_p2 };
                current_loop.push(next_pt);
                progress = true;
            }
        }

        // Close loop if endpoints are connected
        if current_loop.len() > 2 {
            let start = current_loop[0];
            let end = *current_loop.last().unwrap();
            if dist_2d(&start, &end) < tolerance {
                current_loop.pop(); // remove duplicate endpoint
            }
        }
        loops.push(current_loop);
    }
    loops
}

// 2D Rotation Helper
fn rotate_point(p: Point3D, angle_rad: f32, cx: f32, cy: f32) -> Point3D {
    let s = angle_rad.sin();
    let c = angle_rad.cos();

    let x = p.x - cx;
    let y = p.y - cy;

    let x_new = x * c - y * s + cx;
    let y_new = x * s + y * c + cy;

    Point3D::new(x_new, y_new, p.z)
}

// Infill scanline fill algorithm
fn generate_scanline_infill(
    loops: &[Vec<Point3D>],
    settings: &SliceSettings,
    z: f32,
    layer_index: usize,
    min_x: f32,
    max_x: f32,
    min_y: f32,
    max_y: f32,
) -> Vec<PathSegment> {
    if settings.infill_density <= 0.01 {
        return Vec::new();
    }

    let density_factor = settings.infill_density / 100.0;
    // Calculate line spacing: at 100% density, spacing is nozzle_diameter.
    // At lower densities, line spacing is nozzle_diameter / density_factor
    let spacing = settings.nozzle_diameter / density_factor;
    
    // Infill angle: alternate 45 and -45 degrees (135 degrees)
    let angle_deg = if layer_index % 2 == 0 { 45.0 } else { 135.0 };
    let angle_rad = angle_deg * PI / 180.0;

    let cx = (min_x + max_x) / 2.0;
    let cy = (min_y + max_y) / 2.0;

    // Rotate loops by negative angle to perform horizontal scanlines aligned with X-axis
    let mut rotated_loops = Vec::with_capacity(loops.len());
    for loop_pts in loops {
        let rotated: Vec<Point3D> = loop_pts
            .iter()
            .map(|&p| rotate_point(p, -angle_rad, cx, cy))
            .collect();
        rotated_loops.push(rotated);
    }

    // Determine bounding box of rotated loops to cover with scanlines
    let mut rot_min_y = f32::MAX;
    let mut rot_max_y = f32::MIN;
    for r_loop in &rotated_loops {
        for p in r_loop {
            if p.y < rot_min_y { rot_min_y = p.y; }
            if p.y > rot_max_y { rot_max_y = p.y; }
        }
    }

    // Adjust margins
    rot_min_y += settings.nozzle_diameter;
    rot_max_y -= settings.nozzle_diameter;

    let mut infill_segments = Vec::new();
    if rot_max_y <= rot_min_y {
        return Vec::new();
    }

    // Iterate scanline Y positions
    let mut y_scan = rot_min_y + spacing / 2.0;
    while y_scan < rot_max_y {
        let mut intersections = Vec::new();

        // Intersect horizontal line Y = y_scan with all rotated loop edges
        for r_loop in &rotated_loops {
            if r_loop.len() < 2 { continue; }
            let len = r_loop.len();
            for i in 0..len {
                let p1 = r_loop[i];
                let p2 = r_loop[(i + 1) % len];

                // Check crossing
                if (p1.y <= y_scan && p2.y > y_scan) || (p2.y <= y_scan && p1.y > y_scan) {
                    // Compute intersection x
                    let t = (y_scan - p1.y) / (p2.y - p1.y);
                    let x_int = p1.x + t * (p2.x - p1.x);
                    intersections.push(x_int);
                }
            }
        }

        // Sort intersections left-to-right
        intersections.sort_by(|a, b| a.partial_cmp(b).unwrap());

        // Pair intersections up and generate segments
        for chunk in intersections.chunks_exact(2) {
            let x_start = chunk[0];
            let x_end = chunk[1];

            // Avoid tiny segments
            let len = x_end - x_start;
            let shrink = settings.nozzle_diameter * 0.8;
            if len > 2.0 * shrink {
                // Shrink slightly to keep infill inside perimeters
                let p1_rot = Point3D::new(x_start + shrink, y_scan, z);
                let p2_rot = Point3D::new(x_end - shrink, y_scan, z);

                // Rotate points back to original angle
                let p1 = rotate_point(p1_rot, angle_rad, cx, cy);
                let p2 = rotate_point(p2_rot, angle_rad, cx, cy);

                infill_segments.push(PathSegment {
                    path_type: "Infill".to_string(),
                    points: vec![p1, p2],
                });
            }
        }

        y_scan += spacing;
    }

    infill_segments
}

pub fn slice_stl_core(stl_data: &[u8], settings: &SliceSettings) -> Result<SliceResult, String> {
    // 2. Parse STL file
    let triangles = parse_stl(stl_data)?;

    if triangles.is_empty() {
        return Err("The STL file contains no triangles.".to_string());
    }

    // 3. Compute bounding box and find Z range
    let mut min_x = f32::MAX;
    let mut max_x = f32::MIN;
    let mut min_y = f32::MAX;
    let mut max_y = f32::MIN;
    let mut min_z = f32::MAX;
    let mut max_z = f32::MIN;

    for t in &triangles {
        for v in &[t.v1, t.v2, t.v3] {
            if v.x < min_x { min_x = v.x; }
            if v.x > max_x { max_x = v.x; }
            if v.y < min_y { min_y = v.y; }
            if v.y > max_y { max_y = v.y; }
            if v.z < min_z { min_z = v.z; }
            if v.z > max_z { max_z = v.z; }
        }
    }

    // Translate to center model on a 256x256 build plate and make Z start at 0
    let size_x = max_x - min_x;
    let size_y = max_y - min_y;
    let size_z = max_z - min_z;

    let target_cx = 128.0;
    let target_cy = 128.0;
    let offset_x = target_cx - (min_x + max_x) / 2.0;
    let offset_y = target_cy - (min_y + max_y) / 2.0;
    let offset_z = -min_z; // rest on print bed (Z=0)

    let mut moved_triangles = triangles.clone();
    for t in &mut moved_triangles {
        for v in &mut [&mut t.v1, &mut t.v2, &mut t.v3] {
            v.x += offset_x;
            v.y += offset_y;
            v.z += offset_z;
        }
    }

    // Recalculate Z boundaries for adjusted triangles
    let adjusted_max_z = size_z;

    // 4. Generate layer Z heights
    let mut z_levels = Vec::new();
    let mut curr_z = settings.layer_height;
    while curr_z <= adjusted_max_z {
        z_levels.push(curr_z);
        curr_z += settings.layer_height;
    }

    // If STL height is tiny, make sure we have at least one layer
    if z_levels.is_empty() {
        z_levels.push(settings.layer_height);
    }

    let mut layers = Vec::with_capacity(z_levels.len());
    let adjusted_min_x = min_x + offset_x;
    let adjusted_max_x = max_x + offset_x;
    let adjusted_min_y = min_y + offset_y;
    let adjusted_max_y = max_y + offset_y;

    // 5. Slice layer-by-layer
    for (layer_idx, &z) in z_levels.iter().enumerate() {
        let mut segments = Vec::new();

        // Step A: Intersect Z-plane with all triangles
        for t in &moved_triangles {
            // Find edge crossings
            let mut pts = Vec::with_capacity(2);
            let edges = [(&t.v1, &t.v2), (&t.v2, &t.v3), (&t.v3, &t.v1)];

            for &(p1, p2) in &edges {
                if (p1.z <= z && p2.z > z) || (p2.z <= z && p1.z > z) {
                    let t_val = (z - p1.z) / (p2.z - p1.z);
                    let x_int = p1.x + t_val * (p2.x - p1.x);
                    let y_int = p1.y + t_val * (p2.y - p1.y);
                    pts.push(Point3D::new(x_int, y_int, z));
                }
            }

            if pts.len() == 2 {
                segments.push((pts[0], pts[1]));
            }
        }

        // Step B: Link raw segments into closed loops
        let loops = link_segments_into_loops(segments);

        // Step C: Generate toolpaths for walls (perimeters)
        let mut layer_segments = Vec::new();

        // 1 wall loop loop-copy for simpler math (representing outer boundary)
        for loop_pts in &loops {
            if loop_pts.len() > 1 {
                // Loop points need to be connected in order
                let mut path_pts = loop_pts.clone();
                // Add the start point at the end to close the path visually and physically
                path_pts.push(loop_pts[0]);

                // Outer Wall
                layer_segments.push(PathSegment {
                    path_type: "Wall-Outer".to_string(),
                    points: path_pts,
                });
            }
        }

        // Step D: Generate Infill
        // For the first 3 and last 3 layers, we force 90% infill to make solid top/bottom shell
        let mut layer_infill_density = settings.infill_density;
        if layer_idx < 3 || layer_idx >= z_levels.len() - 3 {
            layer_infill_density = 90.0;
        }

        let mut modified_settings = settings.clone();
        modified_settings.infill_density = layer_infill_density;

        let infill_segs = generate_scanline_infill(
            &loops,
            &modified_settings,
            z,
            layer_idx,
            adjusted_min_x,
            adjusted_max_x,
            adjusted_min_y,
            adjusted_max_y,
        );
        layer_segments.extend(infill_segs);

        layers.push(LayerData {
            z,
            segments: layer_segments,
        });
    }

    // 6. Generate G-code Text & calculate stats
    let mut gcode = String::new();
    let mut print_time_secs = 0.0;
    let mut total_extrusion_mm = 0.0;

    // Extrusion math: Vol = segment_length * nozzle_diameter * layer_height
    // filament_cross_section_area = PI * (filament_diameter/2)^2
    // E_length = Vol / filament_cross_section_area
    let filament_area = PI * (settings.filament_diameter / 2.0).powi(2);
    let extrusion_width = settings.nozzle_diameter * 1.05;
    let e_factor = (extrusion_width * settings.layer_height) / filament_area;

    // G-code Header
    gcode.push_str("; SeSpark Web Slicer Generated G-Code\n");
    gcode.push_str(&format!("; Model Dimensions: {:.2}x{:.2}x{:.2} mm\n", size_x, size_y, size_z));
    gcode.push_str(&format!("; Layer Height: {} mm\n", settings.layer_height));
    gcode.push_str(&format!("; Nozzle Diameter: {} mm\n", settings.nozzle_diameter));
    gcode.push_str(&format!("; Filament Diameter: {} mm\n", settings.filament_diameter));
    gcode.push_str(&format!("; Bed Temp: {} C, Extruder Temp: {} C\n\n", settings.bed_temp, settings.extruder_temp));

    gcode.push_str("M140 S"); gcode.push_str(&settings.bed_temp.to_string()); gcode.push_str(" ; heat bed\n");
    gcode.push_str("M104 S"); gcode.push_str(&settings.extruder_temp.to_string()); gcode.push_str(" ; heat extruder\n");
    gcode.push_str("M190 S"); gcode.push_str(&settings.bed_temp.to_string()); gcode.push_str(" ; wait bed\n");
    gcode.push_str("M109 S"); gcode.push_str(&settings.extruder_temp.to_string()); gcode.push_str(" ; wait extruder\n");
    gcode.push_str("G90 ; absolute coordinates\n");
    gcode.push_str("M83 ; relative extrusion mode\n");
    gcode.push_str("G28 ; home all axes\n");
    gcode.push_str("G1 Z2.0 F3000 ; move up a bit\n");
    gcode.push_str("G92 E0 ; reset extruder\n");
    gcode.push_str("G1 X2.0 Y10.0 Z0.2 F3000 ; move to start position\n");
    gcode.push_str("G1 X2.0 Y150.0 Z0.2 F1500 E10 ; print prime line\n");
    gcode.push_str("G1 X2.4 Y150.0 Z0.2 F3000 ; shift side\n");
    gcode.push_str("G1 X2.4 Y20.0 Z0.2 F1500 E20 ; print second prime line\n");
    gcode.push_str("G92 E0 ; reset extruder\n");
    gcode.push_str("; --- Slicing Toolpath Starts ---\n\n");

    let mut current_pos = Point3D::new(0.0, 0.0, 0.2);

    for (l_idx, layer) in layers.iter().enumerate() {
        gcode.push_str(&format!(";L_START:{}\n", l_idx));
        gcode.push_str(&format!(";LAYER:{}\n", l_idx));
        gcode.push_str(&format!(";Z:{:.3}\n", layer.z));
        
        // Move Z up
        gcode.push_str(&format!("G1 Z{:.3} F1500\n", layer.z));
        current_pos.z = layer.z;

        for seg in &layer.segments {
            if seg.points.is_empty() { continue; }

            gcode.push_str(&format!(";TYPE:{}\n", seg.path_type));

            // Move to start point of this path (Travel move)
            let p_start = seg.points[0];
            let dist_travel = dist_2d(&current_pos, &p_start);
            if dist_travel > 0.05 {
                // Retraction before travel
                gcode.push_str("G1 E-1.0 F2400 ; retract\n");
                gcode.push_str(&format!(
                    "G0 F{:.0} X{:.3} Y{:.3}\n",
                    settings.travel_speed * 60.0,
                    p_start.x,
                    p_start.y
                ));
                // Unretract
                gcode.push_str("G1 E1.0 F2400 ; unretract\n");
                
                print_time_secs += dist_travel / settings.travel_speed;
                print_time_secs += 0.05; // overhead retraction time
            }
            current_pos = p_start;

            // Extrusion moves
            for &pt in seg.points.iter().skip(1) {
                let d = dist_2d(&current_pos, &pt);
                if d > 0.01 {
                    let e_move = d * e_factor;
                    gcode.push_str(&format!(
                        "G1 F{:.0} X{:.3} Y{:.3} E{:.5}\n",
                        settings.print_speed * 60.0,
                        pt.x,
                        pt.y,
                        e_move
                    ));
                    total_extrusion_mm += e_move;
                    print_time_secs += d / settings.print_speed;
                }
                current_pos = pt;
            }
        }
        gcode.push_str(&format!(";L_END:{}\n", l_idx));
    }

    // G-code Footer
    gcode.push_str("\n; --- Slicing Toolpath Ends ---\n");
    gcode.push_str("M104 S0 ; turn off temperature\n");
    gcode.push_str("M140 S0 ; turn off bed\n");
    gcode.push_str("G1 X0 Y200 F3000 ; present print\n");
    gcode.push_str("M84 ; disable motors\n");

    // Calculate filament weight
    // PLA density is approx 1.24 g/cm3
    // Vol = E_length * PI * (filament_diameter/2)^2
    let filament_volume_cm3 = total_extrusion_mm * (filament_area) / 1000.0;
    let filament_weight_g = filament_volume_cm3 * 1.24;

    Ok(SliceResult {
        gcode,
        layers,
        print_time_secs,
        filament_used_g: filament_weight_g,
        filament_used_mm: total_extrusion_mm,
        layer_count: z_levels.len(),
    })
}

#[wasm_bindgen]
pub fn slice_stl(stl_data: &[u8], settings_json: &str) -> Result<String, JsValue> {
    // 1. Parse settings
    let settings: SliceSettings = serde_json::from_str(settings_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse settings JSON: {}", e)))?;

    let result = slice_stl_core(stl_data, &settings)
        .map_err(|e| JsValue::from_str(&e))?;

    serde_json::to_string(&result)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize result: {}", e)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dist_2d() {
        let p1 = Point3D::new(0.0, 0.0, 0.0);
        let p2 = Point3D::new(3.0, 4.0, 10.0); // Z is ignored
        assert_eq!(dist_2d(&p1, &p2), 5.0);
    }

    #[test]
    fn test_rotate_point() {
        let p = Point3D::new(10.0, 0.0, 1.0);
        let rotated = rotate_point(p, PI / 2.0, 0.0, 0.0);
        assert!((rotated.x - 0.0).abs() < 1e-5);
        assert!((rotated.y - 10.0).abs() < 1e-5);
    }

    #[test]
    fn test_link_segments_into_loops() {
        let segments = vec![
            (Point3D::new(0.0, 0.0, 0.0), Point3D::new(1.0, 0.0, 0.0)),
            (Point3D::new(1.0, 0.0, 0.0), Point3D::new(0.0, 1.0, 0.0)),
            (Point3D::new(0.0, 1.0, 0.0), Point3D::new(0.0, 0.0, 0.0)),
        ];
        let loops = link_segments_into_loops(segments);
        assert_eq!(loops.len(), 1);
        assert_eq!(loops[0].len(), 3);
    }

    #[test]
    fn test_parse_ascii_stl() {
        let stl_data = b"solid test
facet normal 0 0 1
    outer loop
        vertex 0 0 0
        vertex 1 0 0
        vertex 0 1 0
    endloop
endfacet
endsolid test";
        let triangles = parse_stl(stl_data).unwrap();
        assert_eq!(triangles.len(), 1);
        assert_eq!(triangles[0].v1.x, 0.0);
        assert_eq!(triangles[0].v2.x, 1.0);
        assert_eq!(triangles[0].v3.y, 1.0);
    }
}
