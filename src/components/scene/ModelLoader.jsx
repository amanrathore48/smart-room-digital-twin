"use client";

import React from "react";

export const ModelLoader = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="w-32 h-32 relative">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 border-8 border-amber-500 rounded-full animate-spin-slow opacity-70"></div>

        {/* Middle spinning ring - opposite direction */}
        <div className="absolute inset-2 border-4 border-blue-400 rounded-full animate-spin-reverse opacity-80"></div>

        {/* Inner spinning cube */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-white animate-pulse-scale">
            <div className="cube-3d">
              <div className="cube-face cube-face-front"></div>
              <div className="cube-face cube-face-back"></div>
              <div className="cube-face cube-face-right"></div>
              <div className="cube-face cube-face-left"></div>
              <div className="cube-face cube-face-top"></div>
              <div className="cube-face cube-face-bottom"></div>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="absolute -bottom-10 left-0 right-0 text-center text-white font-bold">
          LOADING
          <span className="dots-animation">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModelLoader;
