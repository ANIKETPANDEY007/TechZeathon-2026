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

// Protected Route Guard
const ProtectedRoute = ({ children, user }) => {
  const location = useLocation();
  if (!user) {
    // Save attempted location in history state
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
    toast.success('Logged out successfully');
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {!isOnline && (
          <div className="bg-red-500/90 text-white text-center py-2 text-sm font-medium sticky top-0 z-50">
            ⚠️ ML Backend Offline — Connect your Python server to enable live monitoring.
          </div>
        )}
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/families" element={<ForFamilies />} />
            <Route path="/care-centers" element={<ForCareCenters />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
            <Route 
              path="/dashboard" 
              element={
                <Dashboard user={user} />
              } 
            />
          </Routes>
        </main>
        <Footer />
        <ChatbotWidget />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
