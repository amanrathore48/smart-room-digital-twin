import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * Creates and configures a basic Three.js scene
 * @returns {THREE.Scene} Configured scene
 */
export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdedede);
  return scene;
}

/**
 * Creates and configures a camera
 * @param {HTMLElement} container - The container element for the camera
 * @returns {THREE.PerspectiveCamera} Configured camera
 */
export function createCamera(container) {
  const aspect = container.clientWidth / container.clientHeight;
  const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 10000);
  camera.position.set(20, 25, 20);
  return camera;
}

/**
 * Creates and configures a renderer
 * @param {HTMLElement} container - The container element for the renderer
 * @returns {THREE.WebGLRenderer} Configured renderer
 */
export function createRenderer(container) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });

  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio); // Better for high DPI screens

  container.appendChild(renderer.domElement);
  return renderer;
}

/**
 * Sets up lighting for the scene
 * @param {THREE.Scene} scene - The scene to add lights to
 * @returns {Object} Object containing all lights added to the scene
 */
export function setupLighting(scene) {
  // Increased ambient light for more stable overall lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  // Create a light group to keep lights organized
  const lightGroup = new THREE.Group();
  scene.add(lightGroup);

  // Main directional light (simulates sunlight) - reduced intensity for less harsh shadows
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
  directionalLight.position.set(10, 20, 10); // Position higher up for less dramatic movement
  directionalLight.castShadow = true;

  // Add a second, softer directional light from the opposite side to fill shadows
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-10, 15, -10);

  // Add additional rim light for better model definition
  const rimLight = new THREE.DirectionalLight(0xffffee, 0.3);
  rimLight.position.set(0, 5, -15);

  // Add lights to light group
  lightGroup.add(directionalLight);
  lightGroup.add(fillLight);
  lightGroup.add(rimLight);

  return {
    ambientLight,
    mainLight: directionalLight,
    fillLight,
    rimLight,
    lightGroup,
  };
}

/**
 * Creates and configures orbit controls
 * @param {THREE.Camera} camera - The camera to control
 * @param {HTMLElement} domElement - The DOM element for the controls
 * @returns {OrbitControls} Configured controls
 */
export function setupControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07; // Slightly smoother damping
  controls.rotateSpeed = 0.9; // Slightly faster rotation for better response
  controls.panSpeed = 0.8; // Good pan speed
  controls.minDistance = 0.5; // Allow close zooming
  controls.maxDistance = 500; // Allow far zooming, but with some limit
  controls.enablePan = true; // Enable panning
  controls.target.set(0, 0, 0);

  return controls;
}

/**
 * Sets up grid helpers and ground plane
 * @param {THREE.Scene} scene - The scene to add grid and ground to
 * @returns {Object} Object containing all created grid elements
 */
export function setupGroundAndGrid(scene) {
  // Grid setup
  const gridSize = 1000; // Much larger grid size to make model clearly sit on it
  const gridDivisions = 200; // More divisions for consistent grid cell size

  //  Grid - very large, less detailed
  const largeGridHelper = new THREE.GridHelper(
    gridSize,
    gridDivisions / 4, // Fewer divisions for the large grid
    0x4444ff, // Primary lines in blue
    0x444444 // Secondary lines subtle
  );

  largeGridHelper.position.y = -4; // Slightly below main grid to avoid z-fighting
  scene.add(largeGridHelper);

  // Add axis helpers for better orientation
  const axesHelper = new THREE.AxesHelper(20); // Larger axes helper
  axesHelper.position.y = 0.1; // Slightly above grid for visibility
  scene.add(axesHelper);

  configureGridMaterial(largeGridHelper);

  return { largeGridHelper, axesHelper };
}

/**
 * Configures grid material for better visibility
 * @param {THREE.GridHelper} grid - The grid to configure
 */
export function configureGridMaterial(grid) {
  if (grid.material) {
    if (Array.isArray(grid.material)) {
      grid.material.forEach((mat) => {
        mat.depthWrite = false; // Disable depth writing for better transparency
        mat.transparent = true;
        mat.opacity = 1.0;
      });
    } else {
      grid.material.depthWrite = false;
      grid.material.transparent = true;
      grid.material.opacity = 1.0;
    }
  }
}

/**
 * Loads a 3D model
 * @param {THREE.Scene} scene - The scene to add the model to
 * @param {String} modelPath - Path to the model file
 * @param {Number} scale - Scale factor for the model
 * @returns {Promise} Promise resolving to the loaded model
 */
export function loadModel(scene, modelPath = "/red-house-2.glb", scale = 0.4) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        // Process the model to receive and cast shadows
        gltf.scene.traverse((node) => {
          if (node.isMesh) {
            // Fix transparency issues
            if (node.material) {
              node.material.side = THREE.FrontSide; // Only render front faces
            }
          }
        });

        // Scale down the model
        gltf.scene.scale.set(scale, scale, scale);

        // Position the model exactly on the grid for proper alignment
        gltf.scene.position.y = 0;

        scene.add(gltf.scene);
        resolve(gltf.scene);
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
        reject(error);
      }
    );
  });
}

/**
 * Sets up animation loop
 * @param {THREE.Scene} scene - The scene to render
 * @param {THREE.Camera} camera - The camera to use for rendering
 * @param {THREE.WebGLRenderer} renderer - The renderer
 * @param {OrbitControls} controls - The controls to update each frame
 * @param {Function} onFrame - Optional callback to execute each frame
 * @returns {Function} The animation function
 */
export function setupAnimationLoop(scene, camera, renderer, controls) {
  const animate = () => {
    const animationId = requestAnimationFrame(animate); // Use requestAnimationFrame for smoother animations

    // Update controls
    if (controls) {
      controls.update();
    }

    // Render scene - check if renderer exists first to avoid errors
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    } else {
      console.warn("Cannot render: renderer, scene, or camera is undefined");
      cancelAnimationFrame(animationId); // Stop the animation loop if any component is missing
    }

    return animationId;
  };

  // Start animation loop
  return animate();
}

/**
 * Creates a resize handler for responsive rendering
 * @param {HTMLElement} container - The container element
 * @param {THREE.Camera} camera - The camera to update
 * @param {THREE.WebGLRenderer} renderer - The renderer to resize
 * @returns {Function} Resize handler function
 */
export function createResizeHandler(container, camera, renderer) {
  return () => {
    if (!container || !camera || !renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  };
}
