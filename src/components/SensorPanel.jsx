"use client";

import { useSensor } from "@/context/SensorContext.jsx";
import { useState } from "react";

// Icon types for each sensor type
const icons = {
  temperature: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  humidity: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
  co2: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  occupied: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  lightsOn: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  ),
};

// Sensor color themes
const sensorThemes = {
  temperature: {
    active: "bg-gradient-to-r from-orange-500 to-red-500",
    inactive: "bg-gray-800",
  },
  humidity: {
    active: "bg-gradient-to-r from-blue-400 to-blue-600",
    inactive: "bg-gray-800",
  },
  co2: {
    active: "bg-gradient-to-r from-indigo-500 to-purple-600",
    inactive: "bg-gray-800",
  },
  occupied: {
    active: "bg-gradient-to-r from-green-500 to-emerald-600",
    inactive: "bg-gray-800",
  },
  lightsOn: {
    active: "bg-gradient-to-r from-yellow-300 to-amber-500",
    inactive: "bg-gray-800",
  },
};

export default function SensorPanel() {
  const {
    sensorData,
    visibility,
    toggleSensor,
    isConnected,
    disconnect,
    reconnect,
  } = useSensor();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Map of sensor keys to display names
  const sensorNames = {
    temperature: "Temperature",
    humidity: "Humidity",
    co2: "CO₂",
    occupied: "Occupancy",
    lightsOn: "Lights",
  };

  // Map of sensor units
  const sensorUnits = {
    temperature: "°C",
    humidity: "%",
    co2: "ppm",
    occupied: "",
    lightsOn: "",
  };

  // Format sensor values for display
  const formatSensorValue = (key, value) => {
    if (key === "occupied") return value ? "Occupied" : "Vacant";
    if (key === "lightsOn") return value ? "On" : "Off";
    return `${value}${sensorUnits[key]}`;
  };

  return (
    <div className="absolute top-4 right-4 transition-all duration-300">
      {/* Collapsed toggle button */}
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="absolute top-2 right-2 z-10 bg-gray-800 rounded-full p-1 hover:bg-gray-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
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
      {isCollapsed ? (
        <div
          className="w-14 h-14 backdrop-blur-md bg-black bg-opacity-70 rounded-lg shadow-xl
        border border-gray-700 transition-all duration-300"
        >
          {/* Empty div for collapsed state */}
        </div>
      ) : (
        <div
          className="w-64 p-5 backdrop-blur-md bg-black bg-opacity-70 rounded-lg shadow-xl
        border border-gray-700 transition-all duration-300 overflow-hidden"
        >
          <h2 className="font-bold text-lg mb-2 text-center text-white">
            Sensor Controls
          </h2>

          {/* Connection status indicator */}
          <div className="border border-gray-700 rounded-md p-2 mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-300">Server Status:</span>
              <span className="text-xs text-gray-400">ws://localhost:5001</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-sm ${
                    isConnected
                      ? "text-green-500 font-bold"
                      : "text-red-500 font-bold"
                  }`}
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div>
                {isConnected ? (
                  <button
                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                    onClick={() => disconnect()}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                    onClick={() => reconnect()}
                  >
                    Reconnect
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Note about manual controls */}
          <div className="text-center text-xs text-gray-400 mb-3 italic">
            Manual controls available in left sidebar panel
          </div>

          {/* Sensor toggle cards */}
          <div className="space-y-3">
            {Object.keys(sensorNames).map((key) => (
              <SensorCard
                key={key}
                sensorKey={key}
                name={sensorNames[key]}
                icon={icons[key]}
                value={formatSensorValue(key, sensorData[key])}
                isActive={visibility[key]}
                theme={sensorThemes[key]}
                onClick={() => toggleSensor(key)}
                disabled={false}
              />
            ))}
          </div>

          <div className="mt-4 pt-2 text-xs text-center text-gray-400 border-t border-gray-700">
            Press 'D' to toggle debug view
          </div>
        </div>
      )}
    </div>
  );
}

// Modern card-style sensor toggle
function SensorCard({
  sensorKey,
  name,
  icon,
  value,
  isActive,
  theme,
  onClick,
  disabled = false,
}) {
  return (
    <div
      className={`rounded-lg p-3 transition-all duration-300 
        ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}
        ${
          isActive
            ? theme.active + " shadow-lg"
            : theme.inactive + " opacity-70"
        }
        ${disabled ? "" : "hover:shadow-lg transform hover:scale-[1.02]"}`}
      onClick={disabled ? null : onClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-black bg-opacity-20 p-2">{icon}</div>
          <span className="font-medium">{name}</span>
        </div>

        <div
          className={`w-10 h-5 relative rounded-full ${
            isActive ? "bg-white bg-opacity-50" : "bg-gray-600"
          } transition-colors`}
        >
          <div
            className={`absolute w-4 h-4 rounded-full top-0.5 transition-all
              ${
                isActive
                  ? "bg-white translate-x-5"
                  : "bg-gray-400 translate-x-0.5"
              }`}
          />
        </div>
      </div>

      {isActive && (
        <div className="mt-2 font-bold text-lg text-white text-right pr-2">
          {value}
        </div>
      )}
    </div>
  );
}
