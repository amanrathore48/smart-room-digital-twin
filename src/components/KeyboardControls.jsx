"use client";

import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

// KeyboardControls component for camera navigation in the scene
// Handles keyboard input for moving camera around the scene
export const KeyboardControls = ({
  camera,
  active = true, // This prop is ignored now as we want controls to always be active
}) => {
  const [currentSpeed, setCurrentSpeed] = useState(0.5);
  const movementSpeed = useRef(0.5); // Movement speed per key press - increased from 0.2 to 0.5 for faster movement
  const keysPressed = useRef({}); // To track currently pressed keys

  // Function to adjust movement speed
  const adjustMovementSpeed = (delta) => {
    const newSpeed = Math.max(
      0.1,
      Math.min(2.0, movementSpeed.current + delta)
    ); // Increased max speed to 2.0
    movementSpeed.current = newSpeed;
    setCurrentSpeed(newSpeed);

    // Create speed notification that appears and fades out
    const speedNotification = document.createElement("div");
    speedNotification.textContent = `Camera Speed: ${newSpeed.toFixed(2)}`;
    speedNotification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.7);
      color: #00ff00;
      padding: 8px 15px;
      border-radius: 5px;
      font-family: monospace;
      z-index: 1000;
      transition: opacity 1.5s;
    `;
    document.body.appendChild(speedNotification);

    // Fade out and remove after delay
    setTimeout(() => {
      speedNotification.style.opacity = 0;
      setTimeout(() => {
        document.body.removeChild(speedNotification);
      }, 1500);
    }, 1500);

    // Log removed for cleaner console
  };

  // Keyboard movement controls
  useEffect(() => {
    if (!camera) return; // Only check for camera, always active regardless of debug mode

    // Silent initialization

    const handleKeyDown = (e) => {
      keysPressed.current[e.key] = true;

      // Speed adjustment with + and - keys
      if (e.key === "+" || e.key === "=") {
        adjustMovementSpeed(0.1); // Increased speed adjustment increment
      } else if (e.key === "-" || e.key === "_") {
        adjustMovementSpeed(-0.1); // Increased speed adjustment decrement
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key] = false;
    };

    // Process movement based on keys currently pressed
    const moveCamera = () => {
      // Move forward/backward
      if (keysPressed.current["ArrowUp"]) {
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(
          camera.quaternion
        );
        camera.position.addScaledVector(direction, movementSpeed.current);
      }
      if (keysPressed.current["ArrowDown"]) {
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(
          camera.quaternion
        );
        camera.position.addScaledVector(direction, -movementSpeed.current);
      }

      // Move left/right
      if (keysPressed.current["ArrowLeft"]) {
        const direction = new THREE.Vector3(-1, 0, 0).applyQuaternion(
          camera.quaternion
        );
        camera.position.addScaledVector(direction, movementSpeed.current);
      }
      if (keysPressed.current["ArrowRight"]) {
        const direction = new THREE.Vector3(1, 0, 0).applyQuaternion(
          camera.quaternion
        );
        camera.position.addScaledVector(direction, movementSpeed.current);
      }

      // Always active now, no need to check 'active' flag
      requestAnimationFrame(moveCamera);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    const animationId = requestAnimationFrame(moveCamera);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationId);
      keysPressed.current = {};
    };
  }, [camera]); // Only depend on camera, not active

  // Return null since we don't want to show any persistent UI
  // Speed changes will be shown via temporary notifications
  return null;
};

export default KeyboardControls;
