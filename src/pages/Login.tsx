import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [prefillEmail, setPrefillEmail] = useState<string>('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);

  // Check for success message from signup
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setPrefillEmail(location.state.email || '');
      
      // Clear the message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  }, [location.state]);

  // Handle rate limiting
  useEffect(() => {
    if (isBlocked && blockTimeLeft > 0) {
      const timer = setTimeout(() => {
        setBlockTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isBlocked && blockTimeLeft === 0) {
      setIsBlocked(false);
      setLoginAttempts(0);
    }
  }, [isBlocked, blockTimeLeft]);

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    try {
      if (isBlocked) {
        throw new Error(`Too many attempts. Please try again in ${blockTimeLeft} seconds`);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      await login(email, password);
      setLoginAttempts(0);
    } catch (err: any) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setIsBlocked(true);
        setBlockTimeLeft(300); // 5 minutes block
        throw new Error('Too many failed attempts. Please try again in 5 minutes');
      } else {
        // Let the error bubble up to LoginForm to handle
        throw err;
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-dark-lighter">
        <div className="flex items-center space-x-3">
          <img 
            src="/Group_2__6_-removebg-preview.png" 
            alt="SportSYNC Logo" 
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-4xl font-bold text-accent">SportSYNC</h1>
        </div>
        <div className="space-y-6">
          <h2 className="text-5xl font-bold text-white leading-tight">
            CONNECT, GROW, PROSPER
          </h2>
          <p className="text-xl text-gray-400">
            Join the ultimate sports networking platform
          </p>
        </div>
        <div className="text-gray-400">
          © {new Date().getFullYear()} SportSYNC. All rights reserved.
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">HELLO ATHLETE...</h2>
            <p className="mt-2 text-gray-400">Sign in to your account</p>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="flex items-center space-x-3 p-4 bg-accent/10 border border-accent/20 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                <p className="text-accent text-sm font-medium">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <LoginForm 
            onSubmit={handleLogin} 
            prefillEmail={prefillEmail}
            isBlocked={isBlocked}
            blockTimeLeft={blockTimeLeft}
          />
        </motion.div>
      </div>
    </div>
  );
}