"use client";

import React from "react";

export const ModelLoader = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black to-gray-900 z-50">
      <div className="text-center px-8 py-10 bg-black bg-opacity-40 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800">
        {/* 3D Model Icon */}
        <div className="mb-6">
          <svg
            className="w-12 h-12 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M21 12l-8-8v6H4v4h9v6l8-8z"
              className="text-blue-500"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M3 16V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              className="text-gray-400"
            />
          </svg>
        </div>

        {/* Triple spinner for more visual interest */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

          {/* Middle ring - different color and speed */}
          <div className="absolute inset-0 m-3 border-4 border-r-4 border-emerald-400 border-r-transparent rounded-full animate-spin-slow"></div>

          {/* Inner ring - third color and direction */}
          <div className="absolute inset-0 m-6 border-4 border-b-4 border-amber-300 border-b-transparent rounded-full animate-spin-reverse"></div>

          {/* Center dot with glow */}
          <div className="absolute inset-0 m-10 bg-white rounded-full shadow-[0_0_15px_5px_rgba(255,255,255,0.4)]"></div>
        </div>

        {/* Loading text with better animation */}
        <div className="text-white font-bold tracking-widest text-lg">
          LOADING SMART ROOM
        </div>

        {/* Progress dots */}
        <div className="mt-2 text-blue-400 font-medium">
          <span className="inline-block animate-bounce mx-0.5 delay-0">.</span>
          <span className="inline-block animate-bounce mx-0.5 delay-150">
            .
          </span>
          <span className="inline-block animate-bounce mx-0.5 delay-300">
            .
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModelLoader;
