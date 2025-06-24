import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const Occupancy = ({ model, scene, stats, visibility }) => {
  const avatarsRef = useRef([]);
  const loaderRef = useRef(new GLTFLoader());

  useEffect(() => {
    // Cleanup existing avatars
    const cleanup = () => {
      avatarsRef.current.forEach((avatar) => scene.remove(avatar));
      avatarsRef.current = [];
    };
    cleanup();

    // Only show avatars if enabled and stats present
    if (!model || !scene || !visibility?.occupied || !stats?.occupied) {
      return;
    }

    // Compute model bounding box
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const min = box.min;
    const max = box.max;

    // Limit to max 3 avatars
    const count = Math.min(stats.occupied, 3);

    // Load avatar model
    loaderRef.current.load("/avatar.glb", (gltf) => {
      const avatarModel = gltf.scene;

      // Adjust scale to fit room
      const avatarBox = new THREE.Box3().setFromObject(avatarModel);
      const avatarSize = avatarBox.getSize(new THREE.Vector3());
      const scaleFactor = (size.y * 0.3) / avatarSize.y; // Avatar should be 30% of room height
      avatarModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Create instances
      for (let i = 0; i < count; i++) {
        const avatar = avatarModel.clone();

        // Random position inside box
        const x = THREE.MathUtils.lerp(
          min.x + size.x * 0.1,
          max.x - size.x * 0.1,
          Math.random()
        );
        const z = THREE.MathUtils.lerp(
          min.z + size.z * 0.1,
          max.z - size.z * 0.1,
          Math.random()
        );

        // Position avatar on floor - add a small offset to ensure it's above the base
        avatar.position.set(x, min.y + size.y * 0.4, z);

        // Random rotation
        avatar.rotation.y = Math.random() * Math.PI * 2;

        scene.add(avatar);
        avatarsRef.current.push(avatar);
      }
    });

    return () => cleanup();
  }, [model, scene, visibility?.occupied, stats?.occupied]);

  return null;
};

export default Occupancy;
