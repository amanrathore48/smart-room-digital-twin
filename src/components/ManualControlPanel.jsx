"use client";

import { useSensor } from "@/context/SensorContext.jsx";
import { useState } from "react";

export default function ManualControlPanel() {
  const { manualMode, manualData, updateManualData, disconnect, isConnected } =
    useSensor();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Only render the panel if in manual mode
  if (!manualMode && isConnected) return null;

  return (
    <div className="absolute top-4 left-4 transition-all duration-300">
      {/* Collapsed toggle button */}
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="absolute top-2 left-2 z-10 bg-amber-800 rounded-full p-1 hover:bg-amber-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isCollapsed ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          )}
        </svg>
      </button>

      {/* Panel container with glass morphism effect */}
      <div
        className={`${isCollapsed ? "w-14 h-14" : "w-64 p-5"} 
        backdrop-blur-md bg-amber-950 bg-opacity-80 rounded-lg shadow-xl
        border border-amber-800 transition-all duration-300 overflow-hidden`}
      >
        {!isCollapsed && (
          <>
            {/* Manual Control Panel */}
            <div className="mb-3">
              <h2 className="font-bold text-lg text-center text-amber-300 mb-2">
                Manual Controls
              </h2>

              {/* Note: Manual controls are always visible even when not in manual mode,
                  but they'll only affect the visualization when in manual mode */}
              <div className="p-3 border border-amber-700 rounded-lg bg-amber-900 bg-opacity-30">
                {/* Temperature control */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-amber-200 font-medium">
                      Temperature (°C):
                    </label>
                    <span className="text-xs font-bold text-white">
                      {manualData.temperature.toFixed(1)}°C
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="30"
                    step="0.1"
                    value={manualData.temperature}
                    onChange={(e) =>
                      updateManualData(
                        "temperature",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-amber-700"
                    disabled={!manualMode}
                  />
                </div>

                {/* Humidity control */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-amber-200 font-medium">
                      Humidity (%):
                    </label>
                    <span className="text-xs font-bold text-white">
                      {manualData.humidity.toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    step="1"
                    value={manualData.humidity}
                    onChange={(e) =>
                      updateManualData("humidity", parseFloat(e.target.value))
                    }
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-amber-700"
                    disabled={!manualMode}
                  />
                </div>

                {/* CO2 control */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-amber-200 font-medium">
                      CO₂ (ppm):
                    </label>
                    <span className="text-xs font-bold text-white">
                      {manualData.co2} ppm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="400"
                    max="2000"
                    step="10"
                    value={manualData.co2}
                    onChange={(e) =>
                      updateManualData("co2", parseInt(e.target.value))
                    }
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-amber-700"
                    disabled={!manualMode}
                  />
                </div>

                {/* Boolean controls */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button
                    className={`text-xs px-2 py-1.5 rounded-md font-medium ${
                      manualData.occupied
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-600 hover:bg-gray-700 text-gray-200"
                    }`}
                    onClick={() =>
                      updateManualData("occupied", !manualData.occupied)
                    }
                    disabled={!manualMode}
                  >
                    {manualData.occupied ? "Occupied ✓" : "Vacant"}
                  </button>

                  <button
                    className={`text-xs px-2 py-1.5 rounded-md font-medium ${
                      manualData.lightsOn
                        ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                        : "bg-gray-600 hover:bg-gray-700 text-gray-200"
                    }`}
                    onClick={() =>
                      updateManualData("lightsOn", !manualData.lightsOn)
                    }
                    disabled={!manualMode}
                  >
                    Lights {manualData.lightsOn ? "On ✓" : "Off"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
