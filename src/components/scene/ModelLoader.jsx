"use client";

import React, { useEffect, useState } from "react";

export const ModelLoader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + Math.random() * 5;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md z-50">
      <div className="text-center select-none">
        {/* Animated 3D loader structure */}
        <div className="relative w-40 h-40 mx-auto mb-8 perspective-1000">
          {/* Outer spinning rings with glowing effect */}
          <div className="absolute inset-0 border-4 border-blue-500/50 rounded-full animate-spin-slow shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <div className="absolute inset-2 border-2 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin-reverse"></div>
          <div className="absolute inset-4 border-2 border-emerald-400/70 rounded-full animate-spin-slow"></div>

          {/* Core animated elements */}
          <div className="absolute inset-8 bg-gradient-to-br from-blue-600/40 to-purple-600/40 rounded-full animate-pulse-scale shadow-[0_0_20px_rgba(139,92,246,0.6)]"></div>
          <div className="absolute inset-0 m-12 bg-white/90 rounded-full animate-pulse shadow-[0_0_30px_rgba(255,255,255,0.8)]"></div>

          {/* Orbiting particles */}
          <div
            className="particle absolute h-2 w-2 bg-cyan-300 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            style={{
              top: "20%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              animation: "orbit 3s linear infinite",
            }}
          ></div>
          <div
            className="particle absolute h-3 w-3 bg-fuchsia-300 rounded-full shadow-[0_0_8px_rgba(240,171,252,0.8)]"
            style={{
              top: "50%",
              right: "5%",
              animation: "orbit 4s linear infinite 1s",
            }}
          ></div>
          <div
            className="particle absolute h-2 w-2 bg-emerald-300 rounded-full shadow-[0_0_8px_rgba(110,231,183,0.8)]"
            style={{
              bottom: "20%",
              left: "10%",
              animation: "orbit 3.5s linear infinite 0.5s",
            }}
          ></div>

          {/* Animated techy wireframe */}
          <div className="absolute inset-4 flex items-center justify-center overflow-hidden">
            <div
              className="w-full h-full border border-cyan-400/30 rounded animate-spin-slow"
              style={{ borderRadius: "25%" }}
            ></div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-gray-800 rounded-full mx-auto mb-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Loading text with animated dots */}
        <div className="text-white font-medium tracking-widest">
          LOADING 3D MODEL
          <span className="dots-animation ml-1">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </span>
        </div>

        {/* Progress percentage */}
        <div className="text-blue-400 text-sm font-mono mt-1">
          {Math.floor(progress)}%
        </div>
      </div>
    </div>
  );
};

export default ModelLoader;
