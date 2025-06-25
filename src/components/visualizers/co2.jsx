import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const CO2 = ({ model, scene, stats, visibility }) => {
  const particlesRef = useRef(null);

  useEffect(() => {
    // Cleanup existing particles
    const cleanup = () => {
      if (particlesRef.current) {
        scene.remove(particlesRef.current);
        particlesRef.current.geometry.dispose();
        particlesRef.current.material.dispose();
        particlesRef.current = null;
      }
    };
    cleanup();

    // Only show CO2 particles if enabled and stats present
    if (!model || !scene || !visibility?.co2 || !stats?.co2) {
      return;
    }

    // Compute model bounding box
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Scale CO2 particle count directly based on PPM value with improved density curve
    const co2Level = stats.co2; // PPM value directly from sensor data

    // Calculate particles based on CO2 PPM with exponential scaling for better visual effect
    // Using a revised scale where:
    // - 400 PPM (normal outdoor air) = 2,000 particles (barely visible)
    // - 1000 PPM (poor air quality) = 15,000 particles
    // - 2000 PPM (very poor) = 60,000 particles (dense fog-like effect)
    const baselinePpm = 400;
    const maxPpm = 2000;
    const minParticles = 2000;
    const maxParticles = 60000;

    // Normalized CO2 level from 0 to 1
    const normalizedCO2 = Math.min(
      Math.max((co2Level - baselinePpm) / (maxPpm - baselinePpm), 0),
      1
    );

    // Apply exponential curve for more dramatic visual effect as CO2 increases
    // This creates a more noticeable change in density at higher CO2 levels
    const exponentialFactor = Math.pow(normalizedCO2, 1.8);

    // Calculate final particle count
    const particleCount = Math.floor(
      minParticles + exponentialFactor * (maxParticles - minParticles)
    );
    const finalParticleCount = Math.min(particleCount, maxParticles);

    // Create particles with positioning matching the fog component
    const positions = new Float32Array(finalParticleCount * 3);
    const colors = new Float32Array(finalParticleCount * 3);

    // Get model bounding box for precise positioning
    let modelBoundingBox;
    try {
      modelBoundingBox = new THREE.Box3().setFromObject(model);
    } catch (error) {
      console.error("Failed to get model bounding box:", error);
      return; // Exit if we can't get the model bounds
    }

    // Fixed offset from walls to keep particles inside the house
    const offset = 30; // Same offset used in Fog component

    // Fill the arrays with randomized positions using the same method as Fog
    for (let i = 0; i < finalParticleCount; i++) {
      const i3 = i * 3;

      // Use MathUtils.randFloat for better distribution, same as Fog component
      positions[i3] = THREE.MathUtils.randFloat(
        modelBoundingBox.min.x + offset,
        modelBoundingBox.max.x - offset
      ); // X position
      positions[i3 + 1] = THREE.MathUtils.randFloat(
        modelBoundingBox.min.y + offset,
        modelBoundingBox.max.y - offset
      ); // Y position
      positions[i3 + 2] = THREE.MathUtils.randFloat(
        modelBoundingBox.min.z + offset,
        modelBoundingBox.max.z - offset
      ); // Z position

      // Pure black particles for CO2 with slight random variation for depth
      // Using pure black with very minor variations to create depth
      const baseShade = Math.random() * 0.05; // Very small random variation (nearly black)
      colors[i3] = baseShade; // Red component (nearly zero)
      colors[i3 + 1] = baseShade; // Green component (nearly zero)
      colors[i3 + 2] = baseShade; // Blue component (nearly zero)
    }

    // Create the particle system
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Create black particle material for CO2 visualization
    const material = new THREE.PointsMaterial({
      size: 0.25 + normalizedCO2 * 0.4, // Bigger particles for higher CO2 levels
      vertexColors: true,
      color: new THREE.Color(0x000000), // Pure black base color
      transparent: true,
      opacity: 0.7 + normalizedCO2 * 0.3, // More visible at higher concentrations
      blending: THREE.NormalBlending, // Normal blending for more solid particles
      depthWrite: false, // Helps with transparency rendering
      sizeAttenuation: true, // Particles change size with distance
    });

    const particles = new THREE.Points(geometry, material);

    // Set renderOrder to ensure particles render after the main model
    particles.renderOrder = 2;
    scene.add(particles);
    particlesRef.current = particles;

    // Create animation with similar drift to fog but rising CO2 behavior
    const animate = () => {
      if (!particlesRef.current) return;

      const positionAttr = particlesRef.current.geometry.attributes.position;
      const positions = positionAttr.array;

      // Animation speed varies with CO2 concentration
      // Higher CO2 levels cause more turbulent movement with more upward drift
      const speedMultiplier = 1 + normalizedCO2; // 1x-2x speed based on CO2 level
      const horizontalDrift = 0.03 * speedMultiplier; // Similar to fog but can be faster with higher CO2
      const verticalDrift = 0.02 * speedMultiplier; // More upward drift with higher CO2

      for (let i = 0; i < finalParticleCount; i++) {
        const i3 = i * 3;

        // Simulate gas movement with slight upward bias for CO2
        positions[i3] += (Math.random() - 0.5) * horizontalDrift; // X drift
        positions[i3 + 1] +=
          Math.random() * verticalDrift - verticalDrift * 0.3; // Y drift with upward bias
        positions[i3 + 2] += (Math.random() - 0.5) * horizontalDrift; // Z drift

        // Keep particles within bounds using same margin approach as Fog
        const margin = offset * 0.5;

        // If particle moves too high, reset to bottom (CO2 tends to pool at floor level)
        if (positions[i3 + 1] > modelBoundingBox.max.y - margin) {
          positions[i3 + 1] =
            modelBoundingBox.min.y + margin + Math.random() * offset;
        }

        // Boundary checks - exact same approach as in Fog component
        if (positions[i3] < modelBoundingBox.min.x + margin)
          positions[i3] = modelBoundingBox.min.x + margin;
        if (positions[i3] > modelBoundingBox.max.x - margin)
          positions[i3] = modelBoundingBox.max.x - margin;
        if (positions[i3 + 1] < modelBoundingBox.min.y + margin)
          positions[i3 + 1] = modelBoundingBox.min.y + margin;
        if (positions[i3 + 2] < modelBoundingBox.min.z + margin)
          positions[i3 + 2] = modelBoundingBox.min.z + margin;
        if (positions[i3 + 2] > modelBoundingBox.max.z - margin)
          positions[i3 + 2] = modelBoundingBox.max.z - margin;
      }

      positionAttr.needsUpdate = true;
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      cleanup();
    };
  }, [model, scene, visibility?.co2, stats?.co2]);

  return null;
};

export default CO2;
