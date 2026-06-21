# SeSpark - Web-based 3D Slicer & Printer Controller

**SeSpark** is a modern, high-performance web application that combines a 3D Slicer and a 3D Printer Controller. Designed with a clean, premium user interface, it provides a seamless user experience directly in the browser by leveraging the computational power of Rust (compiled to WebAssembly) and interactive 3D graphics via Three.js.

---

## 1. Project Architecture

The project consists of two main components:

1. **Slicer Engine ([slicer-engine](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/slicer-engine))**:
   - Written in **Rust** ([lib.rs](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/slicer-engine/src/lib.rs)) for optimal execution speed.
   - Compiled to **WebAssembly (WASM)** to run client-side in the browser without requiring a backend server.
   - Responsible for parsing STL files (both ASCII and Binary), computing Z-plane intersections, linking line segments into closed loops, generating toolpaths for walls and scanline infill with optimization algorithms, and exporting standard G-code alongside detailed slicing statistics.

2. **Frontend ([frontend](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/frontend))**:
   - Built with **Svelte 5** ([App.svelte](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/frontend/src/App.svelte)) and **TypeScript** for reactive and fast UI updates.
   - State management is handled centrally using Svelte stores ([store.ts](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/frontend/src/lib/store.ts)).
   - Uses **Three.js** ([Viewport.svelte](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/frontend/src/lib/components/Viewport.svelte)) to render a 3D interactive build volume (256×256×256 mm), allowing users to preview the STL model and visualize generated toolpaths with color-coded moves.

---

## 2. Key Features

### 2.1. Prepare Workspace
* **STL Drag & Drop**: Drag and drop `.stl` files directly into the workspace or open them via the navigation bar to import 3D models.
* **Slicing Configuration**: A sidebar layout split into 4 tabs for slicing parameters ([Sidebar.svelte](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/frontend/src/lib/components/Sidebar.svelte)):
  * **Quality**: Layer height, nozzle diameter, and filament diameter.
  * **Strength**: Wall loops, infill density (0% to 100%), and infill pattern (Grid/Lines).
  * **Speed**: Print speed and travel speed.
  * **Material**: Extruder temperature and print bed temperature.
* **Automatic Optimizations**: The bottom 3 layers and top 3 layers are automatically sliced with a high infill density (90%) to enhance structural rigidity and ensure a smooth outer finish.

### 2.2. Preview Workspace
* **Toolpath Visualization**: Interactive 3D simulation with color-coded representations for different movements:
  * <span style="color:#ef4444">■</span> **Outer Wall**
  * <span style="color:#22c55e">■</span> **Inner Wall** (if applicable)
  * <span style="color:#f59e0b">■</span> **Sparse Infill**
  * <span style="color:#3b82f6">■</span> **Travel Moves**
* **Vertical Layer Slider**: Inspect the toolpath layer-by-layer or cumulatively from layer 1 to the current layer (similar to slicers like OrcaSlicer or Bambu Studio).
* **Detailed Statistics ([StatsPanel.svelte](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/frontend/src/lib/components/StatsPanel.svelte))**: Real-time estimates for print time, filament length/mass used, total layer count, model bounding box, and a breakdown chart of printing time across different movement types.
* **G-code Viewer ([GcodeViewer.svelte](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/frontend/src/lib/components/GcodeViewer.svelte))**: View the raw generated G-code and download the `.gcode` file directly to run on physical 3D printers.

### 2.3. Device Dashboard
* **Printer Simulation ([DeviceDashboard.svelte](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/frontend/src/lib/components/DeviceDashboard.svelte))**: Simulates a Klipper-like WebSocket interface for printer connection.
* **Temperature Graph**: Real-time SVG charts displaying the current and target temperatures of the hotend and print bed.
* **Manual Controls (Jog Controls)**: Control toolhead position along X, Y, and Z axes, and home the printer (G28).
* **Console Terminal**: Send custom G-code commands directly to the simulated printer with standard response handling (e.g., `ok`).
* **Quick Actions**: Preset buttons for Preheat PLA (Bed 60°C, Hotend 220°C) and Cooldown (disables all heating).

---

## 3. Directory Structure

```text
SeSpark/
├── slicer-engine/              # Rust-based WASM slicing core
│   ├── Cargo.toml              # Rust manifest and dependencies (wasm-bindgen, serde)
│   └── src/
│       └── lib.rs              # Core slicing algorithms, G-code generator, and statistics calculations
│
└── frontend/                   # Frontend web application
    ├── package.json            # Node project configuration and dependencies (Svelte 5, Three.js, Lucide, Canvas-confetti)
    ├── vite.config.ts          # Vite bundler configuration
    ├── src/
    │   ├── App.svelte          # Root component managing page layout and STL drag & drop
    │   ├── main.ts             # Frontend application entrypoint
    │   ├── index.css           # Global CSS, dark theme variables, and design tokens
    │   └── lib/
    │       ├── store.ts        # Global state management (active tab, settings, slice results, etc.)
    │       ├── wasm-engine/    # Compiled WebAssembly modules from slicer-engine
    │       └── components/
    │           ├── Navbar.svelte          # Toolbar with file imports, slice buttons, and logo
    │           ├── Sidebar.svelte         # Slicing parameters and settings panels
    │           ├── Viewport.svelte        # Three.js viewport for 3D model and toolpath rendering
    │           ├── StatsPanel.svelte      # Print stats, estimates, and filament consumption chart
    │           ├── GcodeViewer.svelte     # Raw G-code viewer modal and downloader
    │           └── DeviceDashboard.svelte # Printer control dashboard, console, and temperature charts
```

---

## 4. Local Development

### Prerequisites
- Node.js 22+
- Rust & wasm-pack (only required if modifying the `slicer-engine` code)

### Setup Steps

1. **Build Slicer Engine (Optional)**:
   If you modify the slicing algorithms in the Rust `slicer-engine`, rebuild the WASM output for the frontend:
   ```bash
   cd slicer-engine
   wasm-pack build --target web --out-dir ../frontend/src/lib/wasm-engine
   ```
   *Note: Pre-built WASM files are already included in `frontend/src/lib/wasm-engine`, so you can skip this step if you are only editing frontend files.*

2. **Run Frontend**:
   Navigate to the `frontend` folder, install dependencies, and start the development server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

3. **Code Checks**:
   To check for TypeScript and Svelte diagnostics:
   ```bash
   cd frontend
   npm run check
   ```

---

## 5. Testing

* **Rust Slicer Engine Tests**:
  ```bash
  cd slicer-engine
  cargo test
  ```
* **Frontend Type and Syntax Checks**:
  ```bash
  cd frontend
  npm run check
  ```

---

## 6. Slicing Pipeline Details

The slicing core at [lib.rs](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/slicer-engine/src/lib.rs) executes the slicing process in the following sequential order:

1. **Auto-Centering & Grounding**: Centers the 3D model on the build plate (X=128, Y=128) and aligns its bottom boundary with the print bed surface (Z=0).
2. **Plane Intersection**: Iterates over the STL triangles to find intersections with horizontal slicing planes at each layer height Z.
3. **Loop Linking**: Connects disjoint line segments from plane intersections into closed loops by joining nearby endpoints within a tolerance threshold.
4. **Toolpath Generation**:
   - **Outer Wall**: Generated directly from the outer boundary loops.
   - **Sparse Infill (Scanline Fill)**: Employs a scanline fill algorithm. Loops are rotated by an angle (+45° or +135° depending on layer parity), intersected with evenly spaced horizontal scanlines according to the infill density, and then rotated back to produce a rigid cross-hatch structure.
5. **Extrusion & G-code Emission**:
   - Computes filament extrusion volume based on the extrusion width (nozzle diameter * 1.05) and layer height, calculating the required filament extrusion length (`E`) against the filament cross-section area.
   - Generates standard G-code commands (including bed/hotend heating, homing, printing a cleaning prime line, retraction during travel moves to prevent stringing, and cooldown commands upon completion).
