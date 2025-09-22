// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Navigation } from "./components/navigation";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import EnhancedCourseDetailPage from "./components/EnhancedCourseDetailPage";
import AdminDashboard from "./pages/AdminDashboard";
import JsonData from "./data/data.json";
import SmoothScroll from "smooth-scroll";
import "./App.css";

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const [landingPageData, setLandingPageData] = useState({});

  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div>
          <Navigation />
          <Routes>
            <Route 
              path="/" 
              element={<HomePage data={landingPageData} />} 
            />
            <Route 
              path="/courses" 
              element={<CoursesPage />} 
            />
            <Route 
              path="/course/:courseId" 
              element={<EnhancedCourseDetailPage />} 
            />
            <Route 
              path="/admin" 
              element={<AdminDashboard />} 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;