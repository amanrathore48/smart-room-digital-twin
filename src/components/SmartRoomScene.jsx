"use client";

import { useSensor } from "@/context/SensorContext.jsx";
import {
  createCamera,
  createRenderer,
  createResizeHandler,
  createScene,
  loadModel,
  setupAnimationLoop,
  setupControls,
  setupGroundAndGrid,
  setupLighting,
} from "@/utils/threeJsHelpers";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// Import UI components
import DebugTools from "./DebugTools";
import KeyboardControls from "./KeyboardControls";
import ModelLoader from "./ModelLoader";
// Import scene components
import TempParticle from "./visualizers/TempParticle";
import Fog from "./visualizers/Fog";
import LightModel from "./visualizers/LightModel";
import Occupancy from "./visualizers/Occupancy";
import CO2 from "./visualizers/co2";

// Modular component for Smart Room Scene with better structure for adding features
export default function SmartRoomScene() {
  const containerRef = useRef(null); // Reference to the container for the Three.js scene
  const sceneRef = useRef(null); // Reference to the Three.js scene
  const rendererRef = useRef(null); // Reference to the Three.js renderer
  const cameraRef = useRef(null); // Reference to the Three.js camera
  const controlsRef = useRef(null); // Reference to the Three.js controls
  const animationFrameRef = useRef(null); // Reference for the animation frame ID
  const modelRef = useRef(null); // Reference to the loaded 3D model
  const lightsRef = useRef({}); // Reference to the lights in the scene
  const { sensorData, visibility, isConnected } = useSensor(); // Access sensor data from context

  // State for debug mode toggling - shared between DebugTools and KeyboardControls
  const [debugMode, setDebugMode] = useState(false);
  // Add loading state
  const [isModelLoading, setIsModelLoading] = useState(true);

  // Handle toggle of debug mode with 'D' key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "d" || event.key === "D") {
        setDebugMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Set up scene
    const scene = createScene();
    sceneRef.current = scene;

    // Set up camera
    const camera = createCamera(containerRef.current);
    cameraRef.current = camera;

    // Set up renderer
    const renderer = createRenderer(containerRef.current);
    rendererRef.current = renderer;

    // Set up lighting
    const lights = setupLighting(scene);
    lightsRef.current = lights;

    // Set up grid and ground plane
    setupGroundAndGrid(scene);

    // Set up controls
    const controls = setupControls(camera, renderer.domElement);
    controlsRef.current = controls;

    // Load the 3D model with enhanced camera positioning
    setIsModelLoading(true);
    loadModel(scene)
      .then((model) => {
        modelRef.current = model;

        // Calculate model bounding box to adjust camera position if needed
        const boundingBox = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);

        // Adjust control target to the center of the model
        if (controlsRef.current) {
          controlsRef.current.target.copy(center);
          controlsRef.current.update();
        }

        // Adjust camera position based on model size for optimal view
        const maxDimension = Math.max(size.x, size.y, size.z);
        const distance = maxDimension * 2.5; // Adjust multiplier as needed for optimal view

        // Position camera at an elevated angle to see roof and full model
        if (cameraRef.current) {
          cameraRef.current.position.set(
            center.x + distance * 0.8,
            center.y + distance * 0.6,
            center.z + distance * 0.8
          );
          cameraRef.current.lookAt(center);
          cameraRef.current.updateProjectionMatrix();
        }

        // Model loading is complete
        setIsModelLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load model:", error);
        setIsModelLoading(false); // Ensure loading state is updated on error
      });

    // Set up animation loop - making sure all components are defined
    if (scene && camera && renderer && controls) {
      const animationId = setupAnimationLoop(scene, camera, renderer, controls);
      animationFrameRef.current = animationId;
    } else {
      console.error(
        "Cannot setup animation loop - some components are undefined:",
        {
          scene: !!scene,
          camera: !!camera,
          renderer: !!renderer,
          controls: !!controls,
        }
      );
    }

    // Handle window resize
    const handleResize = createResizeHandler(
      containerRef.current,
      camera,
      renderer
    );

    window.addEventListener("resize", handleResize);

    // Clean up on unmount
    return () => {
      window.removeEventListener("resize", handleResize);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }

      renderer.dispose();
    };
  }, []);

  return (
    <>
      <div className="w-full h-full" ref={containerRef}></div>
      {isModelLoading && <ModelLoader />}
      <TempParticle
        scene={sceneRef.current}
        model={modelRef.current}
        stats={sensorData}
        visibility={visibility}
      />
      <Fog
        scene={sceneRef.current}
        model={modelRef.current}
        stats={sensorData}
        visibility={visibility}
      />

      <LightModel
        model={modelRef.current}
        scene={sceneRef.current}
        stats={sensorData}
        visibility={visibility}
      />

      <Occupancy
        model={modelRef.current}
        scene={sceneRef.current}
        stats={sensorData}
        visibility={visibility}
      />

      <CO2
        model={modelRef.current}
        scene={sceneRef.current}
        stats={sensorData}
        visibility={visibility}
      />

      <DebugTools
        scene={sceneRef.current}
        model={modelRef.current}
        camera={cameraRef.current}
        stats={sensorData}
        showDebug={debugMode}
        setShowDebug={setDebugMode}
      />
      <KeyboardControls camera={cameraRef.current} />
    </>
  );
}
