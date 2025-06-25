"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const Fog = ({ model, scene, stats, visibility }) => {
  const particlesRef = useRef(null);

  // Initialize and cleanup fog particles when model or scene changes
  useEffect(() => {
    // Always clean up existing particles first
    const cleanup = () => {
      if (particlesRef.current) {
        scene.remove(particlesRef.current);
        particlesRef.current.geometry.dispose();
        particlesRef.current.material.dispose();
        particlesRef.current = null;
      }
    };

    cleanup();

    // Exit if any required props are missing or visibility is off
    if (!model || !scene || !visibility?.humidity || !stats?.humidity) {
      return cleanup;
    }

    // Calculate particle count based on humidity percentage
    const minParticles = 5000; // Minimum particles at 0% humidity
    const maxParticles = 50000; // Maximum particles at 100% humidity
    const humidity = stats.humidity; // Get humidity percentage from stats

    // Scale particles linearly with humidity percentage
    const particleCount = Math.floor(
      minParticles + (maxParticles - minParticles) * (humidity / 100)
    );

    const particleSize = 0.03;
    const offset = 30;
    const particleColor = "#ffffff";
    const particleGeometry = new THREE.BufferGeometry();

    // Safely get model bounding box
    let modelBoundingBox;
    try {
      modelBoundingBox = new THREE.Box3().setFromObject(model);
    } catch (error) {
      console.error("Failed to get model bounding box:", error);
      return null; // Exit if we can't get the model bounds
    }

    // Generate positions
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
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
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      size: particleSize,
      color: particleColor,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particlesRef.current = particles;
    scene.add(particles);

    // Add subtle animation to fog particles
    const animate = () => {
      if (!particlesRef.current) return;

      const positionAttr = particlesRef.current.geometry.attributes.position;
      const positions = positionAttr.array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Very subtle random movement to simulate fog drift
        positions[i3] += (Math.random() - 0.5) * 0.03; // X drift
        positions[i3 + 1] += (Math.random() - 0.5) * 0.01; // Y drift
        positions[i3 + 2] += (Math.random() - 0.5) * 0.03; // Z drift

        // Keep particles within bounds
        const margin = offset * 0.5;
        if (positions[i3] < modelBoundingBox.min.x + margin)
          positions[i3] = modelBoundingBox.min.x + margin;
        if (positions[i3] > modelBoundingBox.max.x - margin)
          positions[i3] = modelBoundingBox.max.x - margin;
        if (positions[i3 + 1] < modelBoundingBox.min.y + margin)
          positions[i3 + 1] = modelBoundingBox.min.y + margin;
        if (positions[i3 + 1] > modelBoundingBox.max.y - margin)
          positions[i3 + 1] = modelBoundingBox.max.y - margin;
        if (positions[i3 + 2] < modelBoundingBox.min.z + margin)
          positions[i3 + 2] = modelBoundingBox.min.z + margin;
        if (positions[i3 + 2] > modelBoundingBox.max.z - margin)
          positions[i3 + 2] = modelBoundingBox.max.z - margin;
      }

      positionAttr.needsUpdate = true;
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationId);
      cleanup();
    };
  }, [model, scene, visibility?.humidity, stats?.humidity]);

  return null;
};

export default Fog;
