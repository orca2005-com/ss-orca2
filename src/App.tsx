import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { NetworkStatus } from './components/ui/NetworkStatus';
import { MainLayout } from './components/layout/MainLayout';
import { ConnectionProvider } from './context/ConnectionContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreateProfile from './pages/CreateProfile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import ConnectionRequests from './pages/ConnectionRequests';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';

function App() {
  const location = useLocation();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 bg-dark flex items-center justify-center">
        <div className="text-center space-y-6">
          {/* Logo with Animation */}
          <div className="flex justify-center">
            <div className="logo-container">
              <img 
                src="/Group_2__6_-removebg-preview.png" 
                alt="SportNet Logo" 
                className="logo-animated w-24 h-24 md:w-32 md:h-32 object-contain"
              />
            </div>
          </div>
          
          {/* App Name with Fade-in Animation */}
          <div className="app-name-animated">
            <p className="text-accent text-xl md:text-2xl font-bold tracking-wide">SportNet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ConnectionProvider>
        <div className="mobile-optimized">
          <NetworkStatus />
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/create-profile" element={<CreateProfile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/connection-requests" element={<ConnectionRequests />} />
            
            <Route element={<MainLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile/:id" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </ConnectionProvider>
    </ErrorBoundary>
  );
}

export default App;