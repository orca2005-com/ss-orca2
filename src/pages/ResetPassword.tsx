import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateEmail } from '../utils';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid or missing reset token');
        setIsTokenValid(false);
        return;
      }

      try {
        // Simulate token validation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, you would validate the token with your backend
        const isValid = token.length === 32; // Simple validation for demo
        setIsTokenValid(isValid);
        
        if (!isValid) {
          setError('Invalid or expired reset token');
        }
      } catch (err) {
        setError('Failed to validate reset token');
        setIsTokenValid(false);
      }
    };

    validateToken();
  }, [token]);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token || !isTokenValid) {
      setError('Invalid reset token');
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.1) { // 10% chance of failure for demo
            reject(new Error('Failed to reset password'));
          } else {
            resolve(true);
          }
        }, 2000);
      });

      setIsSuccess(true);
      
      // Redirect to login after success
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password reset successful. Please log in with your new password.',
            email: '' // You might want to pass the email if available
          }
        });
      }, 3000);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  if (isTokenValid === null) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-400">Validating reset token...</p>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto"
          >
            <AlertCircle className="w-8 h-8 text-red-400" />
          </motion.div>

          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Invalid Reset Link
            </h1>
            <p className="text-gray-400">
              This password reset link is invalid or has expired.
            </p>
          </div>

          <button
            onClick={() => navigate('/forgot-password')}
            className="text-accent hover:text-accent-light transition-colors"
          >
            Request a new reset link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Reset Password</h2>
          <p className="mt-2 text-gray-400">
            Please enter your new password
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

          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center space-x-3"
            >
              <Check className="text-green-500 h-5 w-5" />
              <p className="text-green-500">
                Password reset successful! Redirecting to login...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading || isSuccess}
                placeholder="New Password"
                className={`w-full pl-10 pr-10 py-3 bg-dark-lighter border ${
                  error ? 'border-red-500' : 'border-dark-light'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                transition-all duration-200 text-white placeholder-gray-400 ${
                  (isLoading || isSuccess) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isLoading || isSuccess}
                placeholder="Confirm New Password"
                className={`w-full pl-10 pr-10 py-3 bg-dark-lighter border ${
                  error ? 'border-red-500' : 'border-dark-light'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                transition-all duration-200 text-white placeholder-gray-400 ${
                  (isLoading || isSuccess) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className={`w-full py-3 px-4 bg-accent hover:bg-accent-light text-white rounded-lg font-medium
            transition-colors duration-200 ${
              (isLoading || isSuccess) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Resetting Password...' : isSuccess ? 'Success!' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}