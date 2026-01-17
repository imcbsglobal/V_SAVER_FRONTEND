// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import Login from "./components/Login";
import GenerateOffer from "./components/GenerateOffer";  // ← Add this import
import OfferView from "./pages/OfferView";        

import "./App.css";

/* ✅ INNER APP THAT CAN USE NAVIGATE */
function AppInner() {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUserType = localStorage.getItem("user_type");
    const storedUser = localStorage.getItem("user");

    if (token && storedUserType) {
      setIsAuthenticated(true);
      setUserType(storedUserType);
      try {
        if (storedUser) setUserData(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  /* ✅ ADMIN LOGIN */
  const handleAdminLogin = (user) => {
    localStorage.setItem("user_type", "admin");
    setIsAuthenticated(true);
    setUserType("admin");
    setUserData(user);
    navigate("/admin-dashboard", { replace: true });
  };

  /* ✅ USER LOGIN */
  const handleUserLogin = (user) => {
    localStorage.setItem("user_type", "user");
    setIsAuthenticated(true);
    setUserType("user");
    setUserData(user);
    navigate("/user-dashboard", { replace: true });
  };

  /* ✅ LOGOUT — NO BLACK SCREEN */
  const handleLogout = () => {
    ["access_token", "refresh_token", "user_type", "user", "admin_details"].forEach((k) =>
      localStorage.removeItem(k)
    );

    setIsAuthenticated(false);
    setUserType(null);
    setUserData(null);

    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "20px",
        color: "#16a34a"
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* ✅ LOGIN */}
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Login onAdminLogin={handleAdminLogin} onUserLogin={handleUserLogin} />
          ) : (
            <Navigate
              to={userType === "admin" ? "/admin-dashboard" : "/user-dashboard"}
              replace
            />
          )
        }
      />

      {/* ✅ ADMIN DASHBOARD */}
      <Route
        path="/admin-dashboard"
        element={
          isAuthenticated && userType === "admin" ? (
            <AdminDashboard onLogout={handleLogout} userData={userData} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ✅ USER DASHBOARD */}
      <Route
        path="/user-dashboard"
        element={
          isAuthenticated && userType === "user" ? (
            <UserDashboard onLogout={handleLogout} userData={userData} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ✅ DEFAULT ROUTES */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/generate-offer" element={<GenerateOffer />} />    {/* ← Add this route */}
        <Route path="/offer/:offerId" element={<OfferView />} />   
    </Routes>
  );
}

/* ✅ ✅ ✅ THIS IS THE MISSING DEFAULT EXPORT THAT CAUSED YOUR ERROR */
export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
