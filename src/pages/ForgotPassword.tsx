import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateEmail } from '../utils';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);

  // Handle rate limiting
  useEffect(() => {
    if (isBlocked && blockTimeLeft > 0) {
      const timer = setTimeout(() => {
        setBlockTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isBlocked && blockTimeLeft === 0) {
      setIsBlocked(false);
      setAttempts(0);
    }
  }, [isBlocked, blockTimeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isBlocked) {
      setError(`Too many attempts. Please try again in ${blockTimeLeft} seconds`);
      return;
    }

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
      setAttempts(0);
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setIsBlocked(true);
        setBlockTimeLeft(300); // 5 minutes block
        setError('Too many failed attempts. Please try again in 5 minutes');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Reset Password</h2>
          <p className="mt-2 text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center space-x-3"
            >
              <AlertCircle className="text-red-500 h-5 w-5" />
              <p className="text-red-500">{error}</p>
            </motion.div>
          )}

          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center space-x-3"
            >
              <Check className="text-green-500 h-5 w-5" />
              <p className="text-green-500">
                If an account exists with that email, we've sent password reset instructions.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isBlocked || isLoading}
              placeholder="Enter your email"
              className={`w-full pl-10 pr-4 py-3 bg-dark-lighter border ${
                error ? 'border-red-500' : 'border-dark-light'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
              transition-all duration-200 text-white placeholder-gray-400 ${
                (isBlocked || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={isBlocked || isLoading}
            className={`w-full py-3 px-4 bg-accent hover:bg-accent-light text-white rounded-lg font-medium
            transition-colors duration-200 ${
              (isBlocked || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Sending...' : isBlocked ? `Try again in ${blockTimeLeft} seconds` : 'Send Reset Link'}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-accent hover:text-accent-light transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}