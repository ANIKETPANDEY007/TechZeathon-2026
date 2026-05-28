import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';
import Home from './pages/Home';
import ForFamilies from './pages/ForFamilies';
import ForCareCenters from './pages/ForCareCenters';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { useMLStatus } from './hooks/useMLStatus';
import { getProfile } from './api/fallingdown';
import toast from 'react-hot-toast';
import './App.css';

// Protected Route Guard
const ProtectedRoute = ({ children, user }) => {
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

function App() {
  const { isOnline } = useMLStatus();
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Verify and sync token profile
  useEffect(() => {
    const syncProfile = async () => {
      if (localStorage.getItem('token')) {
        try {
          const res = await getProfile();
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    };
    syncProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Signed out successfully');
  };

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#000' }}>
        {/* ML Offline Banner */}
        {!isOnline && (
          <div className="alert-banner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
            </svg>
            ML backend is offline — connect your Python server to enable live detection.
          </div>
        )}
        <Navbar user={user} onLogout={handleLogout} />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/families" element={<ForFamilies />} />
            <Route path="/care-centers" element={<ForCareCenters />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
            <Route
              path="/dashboard"
              element={<Dashboard user={user} />}
            />
          </Routes>
        </main>
        <Footer />
        <ChatbotWidget />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15,15,18,0.95)',
              color: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              backdropFilter: 'blur(20px)',
              fontSize: '0.875rem',
              fontWeight: 500,
              fontFamily: 'Inter, -apple-system, sans-serif',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            },
            success: {
              iconTheme: { primary: '#34d399', secondary: 'rgba(15,15,18,0.95)' },
            },
            error: {
              iconTheme: { primary: '#fb7185', secondary: 'rgba(15,15,18,0.95)' },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
