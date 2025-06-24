"use client";

import { SensorProvider } from "@/context/SensorContext.jsx";
import SmartRoomScene from "@/components/SmartRoomScene";
import SensorPanel from "@/components/SensorPanel";
import ManualControlPanel from "@/components/ManualControlPanel";

export default function Home() {
  return (
    <SensorProvider>
      <main className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="absolute inset-0 z-0">
          <SmartRoomScene />
        </div>
        <div className="z-10 relative">
          <SensorPanel />
        </div>
        {/* Manual control panel */}
        <div className="">
          <ManualControlPanel />
        </div>

        {/* Page title overlay */}
        <div className="absolute z-5 top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 backdrop-blur-sm p-3 rounded-lg shadow-lg text-center">
          <h1 className="text-xl font-bold">Smart Room Digital Twin</h1>
          <p className="text-sm text-gray-300">
            Real-time sensor visualization
          </p>
        </div>
      </main>
    </SensorProvider>
  );
}
