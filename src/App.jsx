import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DiseaseDetection from "./pages/DiseaseDetection.jsx";
import MarketAnalytics from "./pages/MarketAnalytics.jsx";
import WeatherInsights from "./pages/WeatherInsights.jsx";
import SubsidyChecker from "./pages/SubsidyChecker.jsx";
import CropCalendar from "./pages/CropCalendar.jsx";
import AISupport from "./pages/AISupport.jsx";
import Landing from "./pages/Landing.jsx";
import AuthPages from "./pages/AuthPages.jsx";
import Voicechatbot from "./pages/Voicechatbot.jsx";
import CropPrediction from "./pages/CropPrediction.jsx";

export default function App() {
  const [auraEnabled, setAuraEnabled] = useState(false);
  const [soilMoisture, setSoilMoisture] = useState(null); // State for soil moisture data
  const [ws, setWs] = useState(null); // WebSocket instance

  const toggleAura = () => {
    setAuraEnabled(!auraEnabled);
  };

  // WebSocket connection setup
  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:5000"); // Connect to backend WebSocket server

    websocket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "soilMoisture") {
        setSoilMoisture(data.value); // Update soil moisture state
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    websocket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setWs(websocket);

    // Cleanup on unmount
    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  return (
    <Router>
      {/* Aura Light Effect */}
      {auraEnabled && <div className="aura-bg"></div>}

      <Routes>
        {/* Public Pages (No Sidebar & Navbar) */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPages />} />

        {/* Protected Routes (With Sidebar & Navbar) */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <ProtectedLayout
                toggleAura={toggleAura}
                auraEnabled={auraEnabled}
                soilMoisture={soilMoisture} // Pass soil moisture to protected layout
              />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

/* Protected Layout - Includes Sidebar & Navbar */
function ProtectedLayout({ toggleAura, auraEnabled, soilMoisture }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="md:ml-64 flex flex-col h-screen w-full">
        <Navbar toggleAura={toggleAura} auraEnabled={auraEnabled} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/disease-detection" element={<DiseaseDetection />} />
            <Route path="/market-analytics" element={<MarketAnalytics />} />
            <Route path="/weather-insights" element={<WeatherInsights />} />
            <Route path="/subsidy-checker" element={<SubsidyChecker />} />
            <Route path="/crop-calendar" element={<CropCalendar />} />
            <Route path="/ai-support" element={<AISupport />} />
            <Route path="/voice-support" element={<Voicechatbot />} />
            <Route
              path="/crop-prediction"
              element={<CropPrediction soilMoisture={soilMoisture} />} // Pass soil moisture to CropPrediction
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}