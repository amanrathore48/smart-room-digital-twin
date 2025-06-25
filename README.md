# Smart Room Digital Twin (Frontend)

A real-time 3D visualization of smart home sensors using Three.js, React, and WebSockets. This frontend application creates an interactive digital twin that displays environmental data (temperature, humidity, CO2), occupancy status, and lighting conditions.

![Smart Room Digital Twin](./docs/ss-main.png)

## Features

- **3D Visualization**: Interactive 3D model of a smart room with real-time sensor visualizations
- **Sensor Visualizations**:
  - **Temperature**: Particle effect with color gradient (blue to red)
  - **Humidity**: Fog effect that intensifies with humidity levels
  - **CO2**: Black particle effect with density based on PPM levels
  - **Occupancy**: Avatar model that appears when room is occupied
  - **Lighting**: Light model that turns on/off based on light sensor
- **Manual Mode**: Override sensor values for testing and demonstration
- **Keyboard Controls**: Navigate the 3D scene using keyboard controls
  - Arrow keys for movement
  - +/- keys to adjust movement speed
- **Debug Tools**: Visualize scene information and bounding boxes
- **Loading Animation**: Custom 3D loader while model is loading

## Screenshots

![Manual Control Panel](./docs/ss-manual.png)
_Manual control panel for overriding sensor values during testing_

![Debug View](./docs/ss-debug.png)
_Debug view with bounding boxes and scene information for development_

## Tech Stack

- **Frontend**:
  - Next.js (React framework)
  - Three.js / React Three Fiber for 3D rendering
  - Tailwind CSS for styling
  - WebSocket client for real-time data communication

## Backend Integration

This frontend application connects to a separate backend service that handles sensor data and WebSocket communication. The backend repository must be set up separately to enable real-time data functionality.

For the backend code, please refer to the [Smart Room Digital Twin Repository](https://github.com/amanrathore48/smart-room-digital-twin) and navigate to the backend folder.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/amanrathore48/smart-room-digital-twin.git
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

### Running the Frontend

1. Start the frontend development server:

   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

### Backend Connection

This frontend application expects a WebSocket connection to a backend server. By default, it will try to connect to `ws://localhost:5001`.

To enable real-time functionality, you need to:

1. Set up the backend from the same repository by navigating to the backend directory
2. Start the backend server before using real-time features in the frontend
3. Alternatively, use the Manual Control Panel in the frontend for testing without a backend connection

## Usage Guide

### Sensor Panel

- Toggle the visibility of each sensor visualization
- Monitor current sensor values
- Disconnect/Reconnect from the WebSocket server

### Manual Control Panel

- Enable manual mode to override sensor values
- Adjust temperature, humidity, and CO2 levels using sliders
- Toggle occupancy and lighting status

### 3D Navigation

- Use arrow keys to move camera position
- Use +/- keys to adjust movement speed
- Click and drag to rotate the view
- Scroll to zoom in/out

## Project Structure

```
frontend/
  public/           # Static assets including 3D models
    avatar.glb      # 3D avatar model for occupancy visualization
    living_room.glb # Main room 3D model
    particle.png    # Particle texture for effects
    red_house.glb   # Alternative house model
  src/
    app/            # Next.js app directory
    components/     # React components
      scene/        # Three.js scene components
      three/        # Three.js utility components
      ManualControlPanel.jsx  # Controls for manual mode
      SensorPanel.jsx         # Display and control for sensors
      SmartRoomScene.jsx      # Main 3D scene component
    context/        # React context providers
      SensorContext.jsx       # Context for sensor data
    utils/          # Utility functions
      threeJsHelpers.js       # Helper functions for Three.js
```
