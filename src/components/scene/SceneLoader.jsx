"use client";

import { useState, useEffect } from "react";

/**
 * SceneLoader component shows loading progress for the 3D scene
 * All styling uses Tailwind CSS only, no inline styles or styled-jsx
 */
const SceneLoader = ({ isLoaded, progress = 0 }) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Create a smoother progress animation
  useEffect(() => {
    // If fully loaded, quickly complete the progress bar
    if (isLoaded) {
      const timer = setTimeout(() => {
        setDisplayProgress(100);
      }, 100);
      return () => clearTimeout(timer);
    }

    // Otherwise animate towards the current progress value
    const timer = setTimeout(() => {
      if (displayProgress < progress) {
        setDisplayProgress((prev) => Math.min(prev + 2, progress));
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [progress, displayProgress, isLoaded]);

  // Don't render if loaded
  if (isLoaded) {
    return null;
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-black/80 z-50">
      <div className="text-center text-white p-5">
        <h2 className="text-xl font-semibold mb-2">Loading 3D Model</h2>
        <div className="w-[300px] h-5 bg-gray-700 rounded-lg mx-auto my-5 overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
            style={{ width: `${displayProgress}%` }}
          ></div>
        </div>
        <p className="text-sm">{displayProgress}%</p>
      </div>
    </div>
  );
};

export default SceneLoader;
