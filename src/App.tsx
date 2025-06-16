import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { NetworkStatus } from './components/ui/NetworkStatus';
import { MainLayout } from './components/layout/MainLayout';
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
import { useAuth } from './context/AuthContext';

function App() {
  const location = useLocation();
  const { user, isLoading } = useAuth();
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

  // Show loading screen during initial app load
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

  // Show loading screen during auth state check
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-accent text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="mobile-optimized">
        <NetworkStatus />
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Profile creation route - accessible when user exists but profile incomplete */}
          <Route 
            path="/create-profile" 
            element={
              user ? <CreateProfile /> : <Navigate to="/login" replace />
            } 
          />
          
          {/* Protected routes - require authentication and complete profile */}
          <Route element={<MainLayout />}>
            <Route 
              path="/home" 
              element={
                user ? (
                  // Check if profile is complete
                  user.bio && user.location ? (
                    <Home />
                  ) : (
                    <Navigate to="/create-profile" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/search" 
              element={
                user ? (
                  user.bio && user.location ? (
                    <Search />
                  ) : (
                    <Navigate to="/create-profile" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/messages" 
              element={
                user ? (
                  user.bio && user.location ? (
                    <Messages />
                  ) : (
                    <Navigate to="/create-profile" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/notifications" 
              element={
                user ? (
                  user.bio && user.location ? (
                    <Notifications />
                  ) : (
                    <Navigate to="/create-profile" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/profile/:id" 
              element={
                user ? (
                  user.bio && user.location ? (
                    <Profile />
                  ) : (
                    <Navigate to="/create-profile" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/profile/:id/followers" 
              element={
                user ? (
                  user.bio && user.location ? (
                    <FollowersList />
                  ) : (
                    <Navigate to="/create-profile" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/profile/:id/following" 
              element={
                user ? (
                  user.bio && user.location ? (
                    <FollowingList />
                  ) : (
                    <Navigate to="/create-profile" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
          </Route>

          {/* Root redirect */}
          <Route 
            path="/" 
            element={
              user ? (
                user.bio && user.location ? (
                  <Navigate to="/home" replace />
                ) : (
                  <Navigate to="/create-profile" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              user ? (
                user.bio && user.location ? (
                  <Navigate to="/home" replace />
                ) : (
                  <Navigate to="/create-profile" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;