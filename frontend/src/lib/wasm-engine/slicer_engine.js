/**
 * Mock WASM Slicer Engine
 *
 * This is a development stub that simulates the Rust WASM slicing engine.
 * Replace this file with the actual wasm-pack build output when ready.
 *
 * To build the real engine:
 *   1. Install Rust + wasm-pack
 *   2. cd slicer-engine
 *   3. wasm-pack build --target web --out-dir ../frontend/src/lib/wasm-engine
 */

/**
 * Initialize the WASM engine.
 * In the mock, this is a no-op that resolves after a short delay.
 */
export default async function initWasm() {
    // Simulate WASM initialization delay
    await new Promise((resolve) => setTimeout(resolve, 50));
    console.log("[Mock WASM] Engine initialized");
}

/**
 * Slice an STL file and return G-code / layer data as a JSON string.
 *
 * @param {Uint8Array} stlBytes - Raw binary STL file data
 * @param {string} settingsJson - JSON string of slicing settings
 * @returns {string} JSON string containing slice result
 */
export function slice_stl(stlBytes, settingsJson) {
    console.log("[Mock WASM] slice_stl called", {
        stlSize: stlBytes?.byteLength ?? 0,
        settings: settingsJson,
    });

    // Parse settings (or use defaults)
    let settings;
    try {
        settings = JSON.parse(settingsJson);
    } catch {
        settings = {};
    }

    const layerHeight = settings.layer_height ?? 0.2;
    const nozzleDiameter = settings.nozzle_diameter ?? 0.4;
    const wallLoops = settings.wall_loops ?? 2;
    const infillDensity = settings.infill_density ?? 20;

    // Estimate model height from STL data (mock: assume ~20mm height)
    const estimatedHeight = 20.0;
    const layerCount = Math.max(1, Math.floor(estimatedHeight / layerHeight));

    // Generate mock layer data
    const layers = [];
    for (let i = 0; i < layerCount; i++) {
        const z = (i + 1) * layerHeight;
        const segments = [];

        // Outer wall
        segments.push({
            path_type: "Wall-Outer",
            points: generateRect(z, 10, 10, nozzleDiameter * 0.5),
        });

        // Inner walls (if wall_loops > 1)
        for (let w = 1; w < wallLoops; w++) {
            segments.push({
                path_type: "Wall-Inner",
                points: generateRect(z, 10 - w * nozzleDiameter, 10 - w * nozzleDiameter, nozzleDiameter * 0.5),
            });
        }

        // Infill (grid pattern)
        if (infillDensity > 0) {
            const infillSpacing = Math.max(1, 100 / infillDensity);
            for (let x = -8; x <= 8; x += infillSpacing) {
                segments.push({
                    path_type: "Infill",
                    points: [
                        { x, y: -8, z },
                        { x, y: 8, z },
                    ],
                });
            }
            for (let y = -8; y <= 8; y += infillSpacing) {
                segments.push({
                    path_type: "Infill",
                    points: [
                        { x: -8, y, z },
                        { x: 8, y, z },
                    ],
                });
            }
        }

        layers.push({ z, segments });
    }

    const result = {
        layer_count: layerCount,
        layer_height: layerHeight,
        nozzle_diameter: nozzleDiameter,
        wall_loops: wallLoops,
        infill_density: infillDensity,
        estimated_height: estimatedHeight,
        total_segments: layers.reduce((sum, l) => sum + l.segments.length, 0),
        layers,
    };

    return JSON.stringify(result);
}

/**
 * Generate a rectangle outline at a given Z height.
 */
function generateRect(z, width, height, inset = 0) {
    const hw = width / 2 - inset;
    const hh = height / 2 - inset;
    return [
        { x: -hw, y: -hh, z },
        { x: hw, y: -hh, z },
        { x: hw, y: hh, z },
        { x: -hw, y: hh, z },
        { x: -hw, y: -hh, z },
    ];
}
