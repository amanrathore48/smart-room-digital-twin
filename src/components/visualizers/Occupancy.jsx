import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const Occupancy = ({ model, scene, stats, visibility }) => {
  const avatarsRef = useRef([]);
  const loaderRef = useRef(new GLTFLoader());
  const positionsRef = useRef(null); // Store fixed positions
  const isLoadedRef = useRef(false);

  useEffect(() => {
    // Cleanup existing avatars
    const cleanup = () => {
      avatarsRef.current.forEach((avatar) => scene.remove(avatar));
      avatarsRef.current = [];
    };
    cleanup();

    // Only show avatars if enabled and stats present
    // Handle both 'occupied' and 'occupancy' properties for compatibility
    const isOccupied =
      stats?.occupied !== undefined ? stats.occupied : stats?.occupancy;

    if (!model || !scene || !visibility?.occupied || !isOccupied) {
      return cleanup;
    }

    // Compute model bounding box
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const min = box.min;
    const max = box.max;

    // Always show just one avatar when occupied
    const count = 1; // We only need one avatar

    // Use a fixed position for the avatar, similar to the light model but positioned lower
    // AVATAR POSITION SETTINGS - Edit these values to adjust position
    const avatarPosition = {
      x: 30, // X position
      y: 45, // Y position (height) - change this to move avatar up/down
      z: -50, // Z position
      rotation: Math.PI / 2, // Face forward
    };

    // Store position for use by the avatar model
    if (!positionsRef.current) {
      positionsRef.current = [avatarPosition];
    }

    // For debugging - force reload
    isLoadedRef.current = false;

    // Load avatar model
    if (!isLoadedRef.current) {
      console.log("Loading avatar model from /avatar.glb");
      isLoadedRef.current = true;

      loaderRef.current.load(
        "/avatar.glb",
        // Success callback
        (gltf) => {
          console.log("Avatar model loaded successfully");

          // Check for empty model
          if (
            !gltf.scene ||
            !gltf.scene.children ||
            gltf.scene.children.length === 0
          ) {
            console.error("Avatar model loaded but appears to be empty");
            isLoadedRef.current = false;
            return;
          }

          const avatarModel = gltf.scene;

          // Adjust scale to fit room
          const avatarBox = new THREE.Box3().setFromObject(avatarModel);
          const avatarSize = avatarBox.getSize(new THREE.Vector3());
          const scaleFactor = (size.y * 0.3) / avatarSize.y; // Avatar should be 30% of room height
          avatarModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

          // Create instances with fixed positions
          for (let i = 0; i < count; i++) {
            const avatar = avatarModel.clone();
            const position = positionsRef.current[i];

            // Use the position values we defined above
            avatar.position.set(
              position.x,
              position.y, // Using the Y value we already defined
              position.z
            );

            // Fixed rotation
            avatar.rotation.y = position.rotation;

            scene.add(avatar);
            avatarsRef.current.push(avatar);
            console.log(`Added avatar ${i + 1}/${count} to scene`);
          }
        },
        // Progress callback
        (xhr) => {
          console.log(
            `Loading avatar: ${Math.floor((xhr.loaded / xhr.total) * 100)}%`
          );
        },
        // Error callback
        (error) => {
          console.error("Error loading avatar model:", error);
          isLoadedRef.current = false; // Reset to try again next time
        }
      );
    } else if (avatarsRef.current.length === 0) {
      // If model is already loaded but no avatars are showing, force reload
      console.log(
        "Avatar model already loaded, but no avatars showing. Forcing reload next time."
      );
      isLoadedRef.current = false; // Force reload next time
    }

    return cleanup;
  }, [model, scene, visibility?.occupied, stats?.occupied]);

  return null;
};

export default Occupancy;
