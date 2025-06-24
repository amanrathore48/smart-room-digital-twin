"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const LightModel = ({ model, scene, stats, visibility }) => {
  const lightRef = useRef(null);
  const sphereRef = useRef(null);

  useEffect(() => {
    // Cleanup helper: remove existing light and mesh
    const cleanup = () => {
      if (lightRef.current) {
        scene.remove(lightRef.current);
        lightRef.current = null;
      }
      if (sphereRef.current) {
        scene.remove(sphereRef.current);
        sphereRef.current = null;
      }
    };

    // Always cleanup before any potential recreation
    cleanup();

    // Only create light and mesh if model, scene, visibility and stats indicate ON
    if (!model || !scene || !visibility?.lightsOn) {
      return;
    }

    let intensity = 0; // Default intensity
    let color = 0xffffff; // Default color (white)

    if (stats && stats.lightsOn) {
      color = 0xffff00; //
      intensity = 10000; // Use stats to determine intensity
    }

    // Create light source
    const light = new THREE.PointLight(color, intensity, 1000);
    const pos = new THREE.Vector3(30, 100, -50);
    light.position.copy(pos);

    // Add light to scene
    scene.add(light);

    // Create improved visual for light: core + halo
    const lightGroup = new THREE.Group();
    lightGroup.position.copy(pos);

    // Core sphere
    const coreGeo = new THREE.SphereGeometry(1, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: color,
      emissive: 0xffff00,
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);
    lightGroup.add(coreSphere);

    // Halo sphere
    const haloGeo = new THREE.SphereGeometry(2.5, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const haloSphere = new THREE.Mesh(haloGeo, haloMat);
    lightGroup.add(haloSphere);

    // Add visual group to scene and store refs
    scene.add(lightGroup);
    lightRef.current = light;
    sphereRef.current = lightGroup;

    // Cleanup on effect teardown
    return () => cleanup();
  }, [model, scene, visibility?.lightsOn, stats?.lightsOn]);

  return null;
};

export default LightModel;
