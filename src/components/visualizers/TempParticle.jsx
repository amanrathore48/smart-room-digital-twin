"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const TempParticle = ({ model, scene, stats, visibility }) => {
  // Reference to store particle system
  const particlesRef = useRef(null);

  // Determine current temperature directly from stats
  const { temperature } = stats;

  // Map temperature to color (blue for cold, red for hot)
  const getTemperatureColor = (temp) => {
    // Temperature range: 15°C (cold/blue) to 30°C (hot/red)
    const minTemp = 15;
    const maxTemp = 30;
    const clampedTemp = Math.max(minTemp, Math.min(maxTemp, temp));
    const normalizedTemp = (clampedTemp - minTemp) / (maxTemp - minTemp);

    // Gradient from blue (cold) to red (hot)
    const r = Math.floor(normalizedTemp * 255);
    const b = Math.floor((1 - normalizedTemp) * 255);
    const g = Math.floor(50 + 50 * Math.sin(normalizedTemp * Math.PI)); // Add a bit of green for mid-range

    return new THREE.Color(r / 255, g / 255, b / 255);
  };

  // Particle parameters
  const maxParticles = 50000; // Increased density
  const particleSize = 0.3; // Adjusted size for density
  const offset = 30; // Same offset as Fog component to position particles inside walls
  const particleColor = getTemperatureColor(temperature);

  // Use effect to create and manage particles
  useEffect(() => {
    // Component renders based on visibility.temperature

    // Cleanup helper
    const cleanupParticles = () => {
      if (particlesRef.current && scene) {
        scene.remove(particlesRef.current);
        particlesRef.current.geometry?.dispose();
        particlesRef.current.material?.dispose();
        particlesRef.current = null;
      }
    };

    // Conditions to skip creating particles
    if (!model || !scene || !visibility?.temperature) {
      cleanupParticles();
      return;
    }

    // Create the BufferGeometry for particles
    const particleGeometry = new THREE.BufferGeometry();

    // Safely get model bounding box
    let modelBoundingBox;
    try {
      modelBoundingBox = new THREE.Box3().setFromObject(model);
    } catch (error) {
      console.error("Failed to get model bounding box:", error);
      return; // Exit if we can't get the model bounds
    }

    // Calculate safe boundaries inside the model
    const size = new THREE.Vector3();
    modelBoundingBox.getSize(size);
    const center = new THREE.Vector3();
    modelBoundingBox.getCenter(center);

    // Create particle positions
    const positions = new Float32Array(maxParticles * 3); // 3 coordinates per particle
    const colors = new Float32Array(maxParticles * 3); // RGB color for each particle
    const sizes = new Float32Array(maxParticles); // Size for each particle

    // Generate random positions within the model's bounding box (uniform distribution)
    for (let i = 0; i < maxParticles; i++) {
      const x = THREE.MathUtils.randFloat(
        modelBoundingBox.min.x + offset,
        modelBoundingBox.max.x - offset
      );
      const y = THREE.MathUtils.randFloat(
        modelBoundingBox.min.y + offset,
        modelBoundingBox.max.y - offset
      );
      const z = THREE.MathUtils.randFloat(
        modelBoundingBox.min.z + offset,
        modelBoundingBox.max.z - offset
      );
      positions.set([x, y, z], i * 3);
    }

    // Slight color variation for each particle based on temperature
    for (let i = 0; i < maxParticles; i++) {
      const colorVariation = Math.random() * 0.2 - 0.1; // ±10% variation
      const particleColor = getTemperatureColor(temperature + colorVariation);
      colors.set([particleColor.r, particleColor.g, particleColor.b], i * 3);
    }

    // Vary particle sizes
    for (let i = 0; i < maxParticles; i++) {
      sizes[i] = particleSize * (0.8 + Math.random() * 0.4); // ±20% size variation
    }

    // Apply geometry attributes
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    // Create particle system and add to scene
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        size: particleSize,
        color: particleColor,
      })
    );
    particles.name = "temp_particles";

    scene.add(particles);

    // Store reference
    particlesRef.current = particles;

    // Set up simple jitter animation around base positions
    const basePositions = positions.slice();
    const jitterAmount = 0.05; // max offset for jiggle
    const jitterInterval = 100; // milliseconds
    const jitterId = setInterval(() => {
      if (!particlesRef.current) return;
      const posAttr = particlesRef.current.geometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const idx = i * 3;
        posAttr.array[idx] =
          basePositions[idx] + (Math.random() * 2 - 1) * jitterAmount;
        posAttr.array[idx + 1] =
          basePositions[idx + 1] + (Math.random() * 2 - 1) * jitterAmount;
        posAttr.array[idx + 2] =
          basePositions[idx + 2] + (Math.random() * 2 - 1) * jitterAmount;
      }
      posAttr.needsUpdate = true;
    }, jitterInterval);

    // Cleanup on effect teardown
    return () => {
      clearInterval(jitterId);
      cleanupParticles();
    };
  }, [model, scene, temperature, visibility?.temperature]);

  return null;
};

export default TempParticle;
