"use client";

import { createContext, useState, useContext, useEffect, useRef } from "react";

// Create the context
const SensorContext = createContext();

// Custom hook for using the context
export const useSensor = () => useContext(SensorContext);

// WebSocket URL
const WS_URL = "ws://localhost:5001"; // Adjust if your backend runs on a different port

// Provider component
export function SensorProvider({ children }) {
  // Initial sensor state
  const [sensorData, setSensorData] = useState({
    temperature: 25.6,
    humidity: 62,
    co2: 900,
    occupied: true,
    lightsOn: true,
  });

  // Connection status
  const [isConnected, setIsConnected] = useState(false);

  // Visibility state for each sensor visualization
  const [visibility, setVisibility] = useState({
    temperature: true,
    humidity: true,
    co2: true,
    occupied: true,
    lightsOn: true,
  });

  // Manual data state and connection control
  const [manualMode, setManualMode] = useState(false);
  const [manualData, setManualData] = useState({
    temperature: 20,
    humidity: 50,
    co2: 500,
    occupied: false,
    lightsOn: false,
  });

  // WebSocket reference for controlling connection outside useEffect
  const wsRef = useRef(null);

  // Function to manually disconnect
  const disconnect = () => {
    // Manual disconnect requested

    // Set data attribute to help track manual mode across closures
    document.querySelector("body").setAttribute("data-manual-mode", "true");

    // Close any existing connection
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "disconnect" }));
      }
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setManualMode(true);

    // Clear any existing reconnection attempts
    window.clearTimeout(window._reconnectTimeout);

    // Reset visibility when disconnected
    setVisibility({
      temperature: false,
      humidity: false,
      co2: false,
      occupied: false,
      lightsOn: false,
    });

    // Manual mode activated
  };

  // Function to manually reconnect
  const reconnect = () => {
    // Manual reconnect requested

    // Remove data attribute
    document.querySelector("body").setAttribute("data-manual-mode", "false");

    setManualMode(false);

    // The WebSocket connection will be established by the useEffect
    // when manualMode changes to false
    // Manual mode deactivated
  };

  // Function to update manual sensor data
  const updateManualData = (sensor, value) => {
    setManualData((prev) => ({
      ...prev,
      [sensor]: value,
    }));

    // If in manual mode, also update the main sensor data
    if (manualMode) {
      setSensorData((prev) => ({
        ...prev,
        [sensor]: value,
      }));
    }
  };

  // Initialize DOM data attribute for manual mode tracking
  useEffect(() => {
    document
      .querySelector("body")
      .setAttribute("data-manual-mode", manualMode ? "true" : "false");
  }, [manualMode]);

  // WebSocket connection with improved reconnection handling
  useEffect(() => {
    let ws = null;
    let reconnectAttempts = 0;
    let reconnectTimeout = null;
    const maxReconnectAttempts = 10;
    const initialReconnectDelay = 1000; // Start with 1 second

    // Skip connection if in manual mode
    if (manualMode) {
      return () => {
        // No cleanup needed in manual mode
      }; // Return empty cleanup function
    }

    const connectWebSocket = () => {
      // Clear any pending reconnection attempt
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }

      // Don't try to reconnect if we already have a connection
      if (
        ws &&
        (ws.readyState === WebSocket.CONNECTING ||
          ws.readyState === WebSocket.OPEN)
      ) {
        // WebSocket already connecting or connected
        return;
      }

      // Connecting to WebSocket (keeps track of reconnection attempts)

      try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          // WebSocket connected successfully
          setIsConnected(true);
          reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // Received sensor data

            // Update sensor data state
            setSensorData({
              temperature: data.temperature,
              humidity: data.humidity,
              co2: data.co2,
              occupied: data.occupancy, // Note: backend uses 'occupancy', frontend uses 'occupied'
              lightsOn: data.lights, // Note: backend uses 'lights', frontend uses 'lightsOn'
            });

            // If we receive data, ensure we're marked as connected
            if (!isConnected) setIsConnected(true);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          // Don't set disconnected here - wait for onclose
          // This prevents race conditions between error and close events
        };

        ws.onclose = (event) => {
          console.log(
            `WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`
          );
          setIsConnected(false);

          // Implement exponential backoff for reconnection attempts
          if (reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(
              initialReconnectDelay * Math.pow(1.5, reconnectAttempts),
              30000
            );
            // Will attempt to reconnect shortly

            reconnectAttempts++;
            reconnectTimeout = setTimeout(connectWebSocket, delay);
          } else {
            console.error(
              "Max reconnection attempts reached. Please reload the page."
            );
          }
        };
      } catch (error) {
        console.error("Error creating WebSocket connection:", error);
        // Try to reconnect with exponential backoff
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(
            initialReconnectDelay * Math.pow(1.5, reconnectAttempts),
            30000
          );
          console.log(
            `Error connecting. Will retry in ${delay / 1000} seconds`
          );

          reconnectAttempts++;
          reconnectTimeout = setTimeout(connectWebSocket, delay);
        }
      }
    };

    // Store the function so we can call it from outside useEffect
    const initWebSocket = () => {
      // Double-check we're not in manual mode before initializing
      if (manualMode) {
        // Attempted to initialize WebSocket while in manual mode - aborting
        return;
      }

      try {
        ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("WebSocket connected successfully");
          setIsConnected(true);
          reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("Received sensor data:", data);

            // Handle different message types
            if (data.type === "disconnect_ack") {
              // Server acknowledged disconnect
              return;
            } else if (data.type === "reconnect_ack") {
              // Server acknowledged reconnect
              return;
            } else if (data.type === "manual_data_ack") {
              // Server acknowledged manual data
              return;
            }

            // Update sensor data state with incoming data
            setSensorData({
              temperature: data.temperature,
              humidity: data.humidity,
              co2: data.co2,
              occupied: data.occupancy,
              lightsOn: data.lights,
            });

            // If we receive data, ensure we're marked as connected
            if (!isConnected) setIsConnected(true);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        ws.onclose = (event) => {
          console.log(
            `WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`
          );
          setIsConnected(false);

          // Only attempt reconnect if not in manual mode
          if (reconnectAttempts < maxReconnectAttempts) {
            // Get the current manual mode state (not from closure)
            const currentManualMode =
              document
                .querySelector("body")
                .getAttribute("data-manual-mode") === "true";

            if (!currentManualMode) {
              const delay = Math.min(
                initialReconnectDelay * Math.pow(1.5, reconnectAttempts),
                30000
              );
              console.log(
                `Will attempt to reconnect in ${delay / 1000} seconds`
              );

              reconnectAttempts++;
              reconnectTimeout = setTimeout(initWebSocket, delay);
            } else {
              // In manual mode: skipping reconnection attempt
            }
          }
        };
      } catch (error) {
        console.error("Error creating WebSocket connection:", error);
      }
    };

    // Start connection if not in manual mode
    if (!manualMode) {
      initWebSocket();
    }

    // Add ping to keep connection alive
    const pingInterval = setInterval(() => {
      // Only ping if we have a connection and we're not in manual mode
      if (!manualMode && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000); // Send ping every 30 seconds

    // Store reconnectTimeout in window so we can clear it from outside this closure
    if (reconnectTimeout) {
      window._reconnectTimeout = reconnectTimeout;
    }

    // Cleanup on unmount or when manualMode changes
    return () => {
      // Cleaning up WebSocket effect
      if (pingInterval) clearInterval(pingInterval);
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        window._reconnectTimeout = null;
      }
      if (ws) {
        ws.close();
        ws = null;
      }
    };
  }, [manualMode]); // Add manualMode as a dependency to re-run when it changes

  // Function to toggle sensor visibility
  const toggleSensor = (sensorName) => {
    setVisibility((prev) => ({
      ...prev,
      [sensorName]: !prev[sensorName],
    }));
  };

  const value = {
    sensorData,
    setSensorData,
    visibility,
    toggleSensor,
    isConnected,
    manualMode,
    manualData,
    disconnect,
    reconnect,
    updateManualData,
  };

  return (
    <SensorContext.Provider value={value}>{children}</SensorContext.Provider>
  );
}
