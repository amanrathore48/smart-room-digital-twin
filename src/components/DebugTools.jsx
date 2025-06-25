"use client";

import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

// Debug tools component for Smart Room Scene
// Shows bounding boxe and model info
export const DebugTools = ({ scene, model, camera, showDebug = false }) => {
  const debugObjectsRef = useRef([]);

  // Create and manage debug objects
  useEffect(() => {
    if (!scene || !model) return;

    // Get specific objects from the model
    const wall = model.getObjectByName("Material2024");
    const windows = model.getObjectByName("Material2017");
    const windowFrames = model.getObjectByName("Material2015");

    wall.visible = !showDebug; // Hide walls
    windows.visible = !showDebug; // Hide windows as well
    windowFrames.visible = !showDebug; // Hide window frames as well

    // Clean up previous debug objects
    cleanupDebugObjects();

    // Create new debug objects when debug mode is toggled
    if (showDebug) {
      createDebugObjects();
    }

    return () => {
      cleanupDebugObjects();
    };
  }, [scene, model, showDebug]);

  // Create all debug visualization objects
  const createDebugObjects = () => {
    if (!scene || !model) return;

    // Add model bounding box
    const modelBox = new THREE.Box3().setFromObject(model);
    const modelBoxHelper = new THREE.Box3Helper(modelBox, 0x0000ff); // Blue for main bounding box
    scene.add(modelBoxHelper);
    debugObjectsRef.current.push(modelBoxHelper);
  };

  // Remove all debug objects from scene
  const cleanupDebugObjects = () => {
    debugObjectsRef.current.forEach((obj) => {
      scene?.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    debugObjectsRef.current = [];
  };

  // Format object position for display
  const formatVector = (vector) => {
    if (!vector) return "N/A";
    return `(${vector.x.toFixed(2)}, ${vector.y.toFixed(2)}, ${vector.z.toFixed(
      2
    )})`;
  };

  // Get camera details
  const getCameraInfo = () => {
    if (!camera) return { position: "N/A", rotation: "N/A" };
    return {
      position: formatVector(camera.position),
      rotation: formatVector(
        new THREE.Vector3(
          camera.rotation.x,
          camera.rotation.y,
          camera.rotation.z
        )
      ),
    };
  };

  // Get model details and bounding box information
  const getModelInfo = () => {
    if (!model) return { position: "N/A", scale: "N/A" };

    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);

    const min = box.min;
    const max = box.max;

    const volume = size.x * size.y * size.z;
    const surfaceArea =
      2 * (size.x * size.y + size.x * size.z + size.y * size.z);

    return {
      position: formatVector(model.position),
      center: formatVector(center),
      dimensions: formatVector(size),
      minBound: formatVector(min),
      maxBound: formatVector(max),
      volume: volume.toFixed(2),
      surfaceArea: surfaceArea.toFixed(2),
    };
  };

  // Calculate FPS
  const [fps, setFps] = useState(0);
  useEffect(() => {
    if (!showDebug) return;

    let lastTime = performance.now();
    let frameCount = 0;

    const updateFps = () => {
      const now = performance.now();
      frameCount++;

      if (now - lastTime > 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }

      if (showDebug) {
        requestAnimationFrame(updateFps);
      }
    };

    const animationId = requestAnimationFrame(updateFps);
    return () => cancelAnimationFrame(animationId);
  }, [showDebug]);

  // No longer need interior spaces information

  // Only render the debug panel if debug mode is enabled
  if (!showDebug) return null;

  const cameraInfo = getCameraInfo();
  const modelInfo = getModelInfo();

  return (
    <div className="fixed bottom-5 left-5 bg-black/70 text-green-400 font-mono p-4 rounded-md max-w-[300px] max-h-[80vh] overflow-y-auto z-[1000] text-xs border border-green-400">
      <div className="absolute -top-5 left-0 bg-red-600 text-white px-2 py-0.5 font-bold rounded-t-sm">
        DEBUG MODE
      </div>

      <div className="mb-2.5 border-b border-gray-600 pb-1.5">
        <h3 className="m-0 mb-1 text-sm text-yellow-300">Performance</h3>
        <p className="my-0.5 leading-relaxed">FPS: {fps}</p>
      </div>

      <div className="mb-2.5 border-b border-gray-600 pb-1.5">
        <h3 className="m-0 mb-1 text-sm text-yellow-300">Camera</h3>
        <p className="my-0.5 leading-relaxed">
          Position: {cameraInfo.position}
        </p>
        <p className="my-0.5 leading-relaxed">
          Rotation: {cameraInfo.rotation}
        </p>
      </div>

      <div className="mb-2.5 border-b border-gray-600 pb-1.5">
        <h3 className="m-0 mb-1 text-sm text-yellow-300">Model</h3>
        <p className="my-0.5 leading-relaxed">Position: {modelInfo.position}</p>
        <p className="my-0.5 leading-relaxed">Center: {modelInfo.center}</p>
        <p className="my-0.5 leading-relaxed">
          Dimensions: {modelInfo.dimensions}
        </p>
      </div>

      <div className="mb-2.5 border-b border-gray-600 pb-1.5">
        <h3 className="m-0 mb-1 text-sm text-yellow-300">Bounding Box</h3>
        <p className="my-0.5 leading-relaxed">Min: {modelInfo.minBound}</p>
        <p className="my-0.5 leading-relaxed">Max: {modelInfo.maxBound}</p>
        <p className="my-0.5 leading-relaxed">Volume: {modelInfo.volume} m³</p>
        <p className="my-0.5 leading-relaxed">
          Surface Area: {modelInfo.surfaceArea} m²
        </p>
      </div>

      <div className="mt-2.5 pt-1.5 border-t border-green-400 italic text-white">
        <p className="my-0.5 leading-relaxed">Press 'D' to toggle debug view</p>
      </div>
    </div>
  );
};

export default DebugTools;
