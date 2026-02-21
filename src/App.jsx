import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import AddCategory from "./components/AddCategory";
import AddProduct from "./components/AddProduct";
import ViewProducts from "./components/ViewProducts";
import OfferMaster from "./components/OfferMaster";
import AdminOfferMaster from "./components/AdminOfferMaster";
import AdminBranchMaster from "./components/Adminbranchmaster";
import BranchOffersPage from "./components/BranchOffersPage"; // ✅ NEW
import { setAuthToken } from "./services/api";
import './App.css';

function AppRoutes() {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const type = user?.is_admin ? 'admin' : 'user';
        
        setAuthToken(token);
        setUserData(user);
        setUserType(type);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        handleLogout();
      }
    }
    setIsLoading(false);
  };

  const handleAdminLogin = (user) => {
    setUserData(user);
    setUserType('admin');
    setIsAuthenticated(true);
    console.log('Admin logged in:', user);
  };

  const handleUserLogin = (user) => {
    setUserData(user);
    setUserType('user');
    setIsAuthenticated(true);
    console.log('User logged in:', user);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    setAuthToken(null);
    setUserData(null);
    setUserType(null);
    setIsAuthenticated(false);

    navigate('/login', { replace: true });
  };

  // Protected Route Component
  const ProtectedRoute = ({ children, allowedUserType }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    if (allowedUserType && userType !== allowedUserType) {
      // If user tries to access wrong dashboard, redirect to correct one
      const correctPath = userType === 'admin' ? '/admin-dashboard' : '/user-dashboard';
      return <Navigate to={correctPath} replace />;
    }

    return children;
  };

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>

        {/* ✅ PUBLIC ROUTE - No auth required - for QR code scanning */}
        <Route
          path="/branch/:branchId/offers"
          element={<BranchOffersPage />}
        />

        {/* Login Route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={userType === 'admin' ? '/admin-dashboard' : '/user-dashboard'} replace />
            ) : (
              <Login onAdminLogin={handleAdminLogin} onUserLogin={handleUserLogin} />
            )
          }
        />

        {/* ========== ADMIN ROUTES ========== */}
        
        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedUserType="admin">
              <AdminDashboard onLogout={handleLogout} userData={userData} />
            </ProtectedRoute>
          }
        />

        {/* Admin Offer Master */}
        <Route
          path="/admin/offer-master"
          element={
            <ProtectedRoute allowedUserType="admin">
              <AdminOfferMaster onLogout={handleLogout} userData={userData} />
            </ProtectedRoute>
          }
        />

        {/* Admin Branch Master */}
        <Route
          path="/admin/branch-master"
          element={
            <ProtectedRoute allowedUserType="admin">
              <AdminBranchMaster onLogout={handleLogout} userData={userData} />
            </ProtectedRoute>
          }
        />

        {/* ========== USER ROUTES ========== */}

        {/* User Dashboard */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedUserType="user">
              <UserDashboard onLogout={handleLogout} userData={userData} />
            </ProtectedRoute>
          }
        />

        {/* Add Category */}
        <Route
          path="/add-category"
          element={
            <ProtectedRoute allowedUserType="user">
              <AddCategory onLogout={handleLogout} userData={userData} />
            </ProtectedRoute>
          }
        />

        {/* Add Product */}
        <Route
          path="/add-product"
          element={
            <ProtectedRoute allowedUserType="user">
              <AddProduct onLogout={handleLogout} userData={userData} />
            </ProtectedRoute>
          }
        />

        {/* View Products */}
        <Route
          path="/view-products"
          element={
            <ProtectedRoute allowedUserType="user">
              <ViewProducts onLogout={handleLogout} userData={userData} />
            </ProtectedRoute>
          }
        />

        {/* Offer Master (User View) */}
        <Route
          path="/offer-master"
          element={
            <ProtectedRoute allowedUserType="user">
              <OfferMaster onLogout={handleLogout} userData={userData} />
            </ProtectedRoute>
          }
        />

        {/* Root Route */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={userType === 'admin' ? '/admin-dashboard' : '/user-dashboard'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-all Route */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? (userType === 'admin' ? '/admin-dashboard' : '/user-dashboard') : '/login'} replace />
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;