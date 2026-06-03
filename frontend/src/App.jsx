import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Gallery from './pages/Gallery';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminBookings from './pages/AdminBookings';
import AdminAvailability from './pages/AdminAvailability';
import AdminSettings from './pages/AdminSettings';

// Protected Route Component to secure Admin endpoints
const ProtectedRoute = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('tamayi_admin_token');
      if (!token) {
        setIsValid(false);
        setIsVerifying(false);
        return;
      }
      try {
        const res = await fetch('https://tamayi.zimbabwe.workers.dev/api/admin/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          setIsValid(true);
        } else {
          localStorage.removeItem('tamayi_admin_token');
          setIsValid(false);
        }
      } catch (err) {
        console.error('Auth verification failed, assuming offline / session expired:', err);
        // Fallback: clear invalid session token
        localStorage.removeItem('tamayi_admin_token');
        setIsValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, []);

  if (isVerifying) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1A1A1A]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60 font-serif tracking-widest text-sm uppercase">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return isValid ? <Outlet /> : <Navigate to="/admin" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Client facing website wrapped in Navbar/Footer Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Booking />} />
          <Route path="/gallery" element={<Gallery />} />
        </Route>

        {/* Admin Login portal */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* Secure Admin Operations (requires login token) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/availability" element={<AdminAvailability />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
