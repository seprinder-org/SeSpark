<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { 
    activeTab, 
    stlFileBytes, 
    stlFileName,
    sliceResult, 
    currentLayerIndex, 
    modelDimensions,
    theme
  } from '../store';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { Layers, HelpCircle } from 'lucide-svelte';

  let container: HTMLDivElement;
  
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;
  
  let gridHelper: THREE.GridHelper;
  let bedPlate: THREE.Mesh;
  let wireframeBox: THREE.LineSegments;
  
  // Track 3D objects
  let stlMesh: THREE.Mesh | null = null;
  let toolpathLinesGroup: THREE.Group | null = null;
  
  // Parse STL binary in Javascript
  function parseStl(buffer: Uint8Array): Float32Array {
    // Check if it's ASCII or Binary
    const header = new TextDecoder('utf-8').decode(buffer.slice(0, 80));
    if (header.trim().startsWith('solid')) {
      // Parse ASCII
      const text = new TextDecoder('utf-8').decode(buffer);
      const matches = text.match(/vertex\s+([-\d.e+]+)\s+([-\d.e+]+)\s+([-\d.e+]+)/g);
      if (matches) {
        const vertices = new Float32Array(matches.length * 3);
        for (let i = 0; i < matches.length; i++) {
          const parts = matches[i].trim().split(/\s+/);
          vertices[i * 3 + 0] = parseFloat(parts[1]);
          vertices[i * 3 + 1] = parseFloat(parts[2]);
          vertices[i * 3 + 2] = parseFloat(parts[3]);
        }
        return vertices;
      }
      throw new Error("Invalid ASCII STL format");
    } else {
      // Parse Binary
      const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      const numTriangles = dataView.getUint32(80, true);
      const vertices = new Float32Array(numTriangles * 9);
      let offset = 84;
      
      for (let i = 0; i < numTriangles; i++) {
        // Skip normal (12 bytes)
        offset += 12;
        
        // Vertex 1
        vertices[i * 9 + 0] = dataView.getFloat32(offset, true);
        vertices[i * 9 + 1] = dataView.getFloat32(offset + 4, true);
        vertices[i * 9 + 2] = dataView.getFloat32(offset + 8, true);
        offset += 12;
        
        // Vertex 2
        vertices[i * 9 + 3] = dataView.getFloat32(offset, true);
        vertices[i * 9 + 4] = dataView.getFloat32(offset + 4, true);
        vertices[i * 9 + 5] = dataView.getFloat32(offset + 8, true);
        offset += 12;
        
        // Vertex 3
        vertices[i * 9 + 6] = dataView.getFloat32(offset, true);
        vertices[i * 9 + 7] = dataView.getFloat32(offset + 4, true);
        vertices[i * 9 + 8] = dataView.getFloat32(offset + 8, true);
        offset += 12;
        
        // Skip attribute byte count (2 bytes)
        offset += 2;
      }
      return vertices;
    }
  }

  // Load and render STL model in ThreeJS
  function loadStlMesh(bytes: Uint8Array) {
    if (!scene) return;
    
    // Clear old mesh
    if (stlMesh) {
      scene.remove(stlMesh);
      stlMesh.geometry.dispose();
      (stlMesh.material as THREE.Material).dispose();
      stlMesh = null;
    }

    try {
      const vertices = parseStl(bytes);
      
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geometry.computeVertexNormals();
      
      const material = new THREE.MeshStandardMaterial({
        color: 0x90caf9,
        roughness: 0.4,
        metalness: 0.1,
        side: THREE.DoubleSide
      });
      
      stlMesh = new THREE.Mesh(geometry, material);
      stlMesh.castShadow = true;
      stlMesh.receiveShadow = true;
      
      // Center geometry and drop on bed
      geometry.computeBoundingBox();
      const bbox = geometry.boundingBox!;
      
      const sizeX = bbox.max.x - bbox.min.x;
      const sizeY = bbox.max.y - bbox.min.y;
      const sizeZ = bbox.max.z - bbox.min.z;
      
      modelDimensions.set({ x: sizeX, y: sizeY, z: sizeZ });
      
      // Center model X, Y on plate center (128, 128) and offset Z to sit on plate (Z=0)
      const targetCx = 128;
      const targetCy = 128;
      
      const meshCx = (bbox.max.x + bbox.min.x) / 2;
      const meshCy = (bbox.max.y + bbox.min.y) / 2;
      
      stlMesh.position.x = targetCx - meshCx;
      stlMesh.position.y = targetCy - meshCy;
      stlMesh.position.z = -bbox.min.z; // rest bottom on Z=0
      
      scene.add(stlMesh);
      
      // Reset controls target to center of plate
      controls.target.set(128, 128, sizeZ / 2);
      controls.update();
      
    } catch (e) {
      console.error("Failed to render STL in viewport:", e);
      alert("Error loading STL file. It might be corrupt or an unsupported format.");
    }
  }

  // Draw 3D sliced toolpaths
  function updateToolpathVisualizer(result: any, maxLayerIndex: number) {
    if (!scene) return;
    
    // Clear old lines
    if (toolpathLinesGroup) {
      scene.remove(toolpathLinesGroup);
      toolpathLinesGroup.clear();
      toolpathLinesGroup = null;
    }

    if (!result || !result.layers || result.layers.length === 0) return;
    
    toolpathLinesGroup = new THREE.Group();
    
    // Define toolpath colors
    const colors = {
      'Wall-Outer': 0xef4444, // Red
      'Wall-Inner': 0x22c55e, // Green
      'Infill': 0xf59e0b,     // Orange/Yellow
      'Travel': 0x3b82f6      // Blue
    };

    // Render layers up to the selected layer
    const renderLimit = Math.min(maxLayerIndex, result.layers.length - 1);
    
    for (let l = 0; l <= renderLimit; l++) {
      const layer = result.layers[l];
      
      for (const seg of layer.segments) {
        const points = seg.points;
        if (points.length < 2) continue;
        
        // Create geometry for the line segment
        const positions: number[] = [];
        for (const pt of points) {
          positions.push(pt.x, pt.y, pt.z);
        }
        
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        // Pick material based on type
        const type: keyof typeof colors = seg.path_type as keyof typeof colors;
        const color = colors[type] || 0xffffff;
        const width = type === 'Travel' ? 1.0 : 2.5;
        const opacity = type === 'Travel' ? 0.3 : 0.8;
        
        const lineMat = new THREE.LineBasicMaterial({
          color: color,
          linewidth: width,
          transparent: true,
          opacity: opacity
        });
        
        const line = new THREE.Line(lineGeo, lineMat);
        toolpathLinesGroup.add(line);
      }
    }
    
    scene.add(toolpathLinesGroup);
  }

  // Handle store state changes
  $: if (stlFileBytes && $stlFileBytes) {
    loadStlMesh($stlFileBytes);
  }

  // React to tab switch to toggle model vs toolpath visibility
  $: {
    const isPreview = $activeTab === 'preview';
    if (stlMesh) {
      stlMesh.visible = !isPreview; // hide STL in preview mode
      // Make it slightly transparent in preview if we want to overlay, but hiding it is cleaner.
    }
    if (toolpathLinesGroup) {
      toolpathLinesGroup.visible = isPreview;
    }
  }

  // React to layer slider changes
  $: if ($sliceResult && $activeTab === 'preview') {
    updateToolpathVisualizer($sliceResult, $currentLayerIndex);
  }

  // React to theme changes to dynamically style the 3D scene
  $: if (scene && renderer) {
    const isLight = $theme === 'light';
    const bgColor = isLight ? 0xf8fafc : 0x121214;
    scene.background = new THREE.Color(bgColor);
    if (scene.fog) {
      scene.fog.color.setHex(bgColor);
    }
    
    // Update bed plate color
    if (bedPlate) {
      const plateMat = bedPlate.material as THREE.MeshStandardMaterial;
      plateMat.color.setHex(isLight ? 0x576175 : 0x222225);
    }
    
    // Update grid helper colors
    if (gridHelper) {
      scene.remove(gridHelper);
      gridHelper.dispose();
      gridHelper = new THREE.GridHelper(256, 32, isLight ? 0x00b85c : 0x00e575, isLight ? 0xcbd5e1 : 0x2d3139);
      gridHelper.position.set(128, 128, 0);
      gridHelper.rotation.x = Math.PI / 2;
      scene.add(gridHelper);
    }

    // Update wireframe box color
    if (wireframeBox) {
      const boxMaterial = wireframeBox.material as THREE.LineBasicMaterial;
      boxMaterial.color.setHex(isLight ? 0xcbd5e1 : 0x3f3f46);
    }
  }

  onMount(() => {
    // 1. Setup Scene & Camera
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121214);
    
    // Add Fog for depth
    scene.fog = new THREE.FogExp2(0x121214, 0.002);
    
    camera = new THREE.PerspectiveCamera(
      45, 
      container.clientWidth / container.clientHeight, 
      1, 
      1000
    );
    camera.position.set(128, -150, 200); // look at bed
    
    // 2. Setup Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // 3. Setup Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // Allow 360-degree rotation in any direction (including looking from under the bed)
    controls.target.set(128, 128, 0);
    controls.update();
    
    // 4. Setup Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight1.position.set(128, 0, 300);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    dirLight1.shadow.camera.near = 0.5;
    dirLight1.shadow.camera.far = 500;
    const d = 150;
    dirLight1.shadow.camera.left = -d;
    dirLight1.shadow.camera.right = d;
    dirLight1.shadow.camera.top = d;
    dirLight1.shadow.camera.bottom = -d;
    scene.add(dirLight1);
    
    const dirLight2 = new THREE.DirectionalLight(0xa5c5fc, 0.4);
    dirLight2.position.set(-100, 100, 100);
    scene.add(dirLight2);

    // 5. Draw printer bed
    // Build plate size 256x256mm, centered around 128,128
    const plateGeo = new THREE.BoxGeometry(256, 256, 2);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x222225,
      roughness: 0.8,
      metalness: 0.2
    });
    bedPlate = new THREE.Mesh(plateGeo, plateMat);
    bedPlate.position.set(128, 128, -1);
    bedPlate.receiveShadow = true;
    scene.add(bedPlate);
    
    // Draw Grid Helper resting on Z=0
    gridHelper = new THREE.GridHelper(256, 32, 0x00e575, 0x2d3139);
    gridHelper.position.set(128, 128, 0);
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);

    // Draw print bounds/cube wireframe
    const boxGeo = new THREE.BoxGeometry(256, 256, 256);
    const boxEdge = new THREE.EdgesGeometry(boxGeo);
    const boxMat = new THREE.LineBasicMaterial({ color: 0x3f3f46, transparent: true, opacity: 0.15 });
    wireframeBox = new THREE.LineSegments(boxEdge, boxMat);
    wireframeBox.position.set(128, 128, 128);
    scene.add(wireframeBox);

    // Draw coordinate axis lines at corner
    const axisHelper = new THREE.AxesHelper(40);
    axisHelper.position.set(0, 0, 0.5);
    scene.add(axisHelper);

    // 6. Handle Window Resize
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    resizeObserver.observe(container);
    
    // 7. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    
    // Reload model if byte array already exists
    if ($stlFileBytes) {
      loadStlMesh($stlFileBytes);
    }
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      gridHelper.dispose();
      plateMat.dispose();
      plateGeo.dispose();
    };
  });
</script>

<div class="viewport-wrapper">
  
  <!-- 3D Canvas container -->
  <div class="canvas-container" bind:this={container}></div>

  <!-- Legend in Preview Mode -->
  {#if $activeTab === 'preview' && $sliceResult}
    <div class="preview-legend panel animate-fade-in">
      <div class="legend-header">
        <Layers size={14} />
        <span>Line Type Legend</span>
      </div>
      <div class="legend-list">
        <div class="legend-item">
          <div class="legend-color travel"></div>
          <span>Travel Moves</span>
        </div>
        <div class="legend-item">
          <div class="legend-color wall-outer"></div>
          <span>Outer Wall</span>
        </div>
        <div class="legend-item">
          <div class="legend-color wall-inner"></div>
          <span>Inner Wall</span>
        </div>
        <div class="legend-item">
          <div class="legend-color infill"></div>
          <span>Sparse Infill</span>
        </div>
      </div>
    </div>

    <!-- Vertical Z Layer Slider (Mimics OrcaSlicer right-hand vertical bar) -->
    <div class="vertical-slider-container">
      <span class="slider-label">L: {$currentLayerIndex + 1} / {$sliceResult.layer_count}</span>
      <div class="slider-track-wrap">
        <input 
          type="range" 
          min="0" 
          max={$sliceResult.layer_count - 1} 
          bind:value={$currentLayerIndex}
          class="layer-z-slider"
          {...{ orient: 'vertical' }}
        />
      </div>
      <span class="slider-label-bottom">Z: {($sliceResult.layers[$currentLayerIndex]?.z || 0).toFixed(2)} mm</span>
    </div>
  {/if}

  <!-- Empty state drag and drop indicator -->
  {#if !$stlFileBytes}
    <div class="empty-state-hint">
      <HelpCircle size={32} class="text-secondary" />
      <p class="main-hint">No 3D Model Loaded</p>
      <p class="sub-hint">Drag and drop an STL file onto this window, or click File -> Open in the navigation bar to start.</p>
    </div>
  {/if}
</div>

<style>
  .viewport-wrapper {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;
  }

  .canvas-container {
    width: 100%;
    height: 100%;
  }

  /* Legend Box */
  .preview-legend {
    position: absolute;
    bottom: 16px;
    left: 16px;
    background-color: rgba(26, 26, 30, 0.85);
    border: 1px solid var(--color-border);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 160px;
    pointer-events: auto;
    z-index: 80;
  }

  .legend-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-bottom: 4px;
  }

  .legend-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--color-text-secondary);
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }

  .legend-color.travel { background-color: #3b82f6; }
  .legend-color.wall-outer { background-color: #ef4444; }
  .legend-color.wall-inner { background-color: #22c55e; }
  .legend-color.infill { background-color: #f59e0b; }

  /* Vertical Layer Z Slider */
  .vertical-slider-container {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(26, 26, 30, 0.85);
    border: 1px solid var(--color-border);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    padding: 12px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    height: 280px;
    z-index: 80;
  }

  .slider-label {
    font-size: 10px;
    font-weight: 700;
    color: var(--color-accent);
  }

  .slider-label-bottom {
    font-size: 9px;
    color: var(--color-text-muted);
  }

  .slider-track-wrap {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 10px 0;
  }

  /* HTML vertical slider styling */
  .layer-z-slider {
    -webkit-appearance: none;
    appearance: none;
    background: #2a2d35;
    width: 6px;
    border-radius: 3px;
    outline: none;
    writing-mode: bt-lr; /* IE vertical range */
    transform: rotate(270deg); /* standard vertical rotate trick */
    height: 180px;
    margin: 40px -85px; /* adjust margins due to rotation offset */
    display: block;
    cursor: pointer;
  }

  .layer-z-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-accent);
    box-shadow: 0 0 6px rgba(0, 229, 117, 0.6);
  }

  /* Empty state overlay */
  .empty-state-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    max-width: 400px;
    pointer-events: none;
  }

  .main-hint {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text-secondary);
  }

  .sub-hint {
    font-size: 12px;
    color: var(--color-text-muted);
    line-height: 1.5;
  }

  .text-secondary {
    color: var(--color-text-muted);
  }

  .animate-fade-in {
    animation: fadeIn 0.25s ease-out forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translate(0, 10px); }
    to { opacity: 1; transform: translate(0, 0); }
  }
  
  /* Adjusted for vertical slider position */
  .vertical-slider-container.vertical-slider-container {
    transform: translateY(-50%) translate3d(0, 0, 0);
  }
</style>
