import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { NetworkStatus } from './components/ui/NetworkStatus';
import { MainLayout } from './components/layout/MainLayout';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreateProfile from './pages/CreateProfile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Search from './pages/Search';
import Profile from './pages/Profile';
import FollowersList from './pages/FollowersList';
import FollowingList from './pages/FollowingList';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-dark flex items-center justify-center">
        <div className="text-center space-y-6">
          {/* Logo with Animation */}
          <div className="flex justify-center">
            <div className="logo-container">
              <img 
                src="/Group_2__6_-removebg-preview.png" 
                alt="SportSYNC Logo" 
                className="logo-animated w-24 h-24 md:w-32 md:h-32 object-contain"
              />
            </div>
          </div>
          
          {/* App Name with Fade-in Animation */}
          <div className="app-name-animated">
            <p className="text-accent text-xl md:text-2xl font-bold tracking-wide">SportSYNC</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Public Route Component (redirects to home if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-dark flex items-center justify-center">
        <div className="text-center space-y-6">
          {/* Logo with Animation */}
          <div className="flex justify-center">
            <div className="logo-container">
              <img 
                src="/Group_2__6_-removebg-preview.png" 
                alt="SportSYNC Logo" 
                className="logo-animated w-24 h-24 md:w-32 md:h-32 object-contain"
              />
            </div>
          </div>
          
          {/* App Name with Fade-in Animation */}
          <div className="app-name-animated">
            <p className="text-accent text-xl md:text-2xl font-bold tracking-wide">SportSYNC</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
}

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
                alt="SportSYNC Logo" 
                className="logo-animated w-24 h-24 md:w-32 md:h-32 object-contain"
              />
            </div>
          </div>
          
          {/* App Name with Fade-in Animation */}
          <div className="app-name-animated">
            <p className="text-accent text-xl md:text-2xl font-bold tracking-wide">SportSYNC</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="mobile-optimized">
        <NetworkStatus />
        <Routes location={location} key={location.pathname}>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Public routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />
          <Route path="/create-profile" element={
            <PublicRoute>
              <CreateProfile />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />
          <Route path="/reset-password" element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } />
          
          {/* Legal pages (accessible to all) */}
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Protected routes */}
          <Route element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile/:id/followers" element={<FollowersList />} />
            <Route path="/profile/:id/following" element={<FollowingList />} />
          </Route>

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;