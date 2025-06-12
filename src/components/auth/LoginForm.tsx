import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { validateEmail, sanitizeText } from '../../utils';
import { ERROR_MESSAGES } from '../../constants';

interface LoginFormProps {
  onSubmit: (email: string, password: string, remember: boolean) => void;
  prefillEmail?: string;
  error?: string | null;
  isBlocked?: boolean;
  blockTimeLeft?: number;
}

export function LoginForm({ onSubmit, prefillEmail = '', error, isBlocked, blockTimeLeft }: LoginFormProps) {
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update email when prefillEmail changes
  useEffect(() => {
    setEmail(prefillEmail);
  }, [prefillEmail]);

  // Clear local error when inputs change
  useEffect(() => {
    setLocalError(null);
  }, [email, password]);

  const validateForm = (): string | null => {
    if (!email.trim()) {
      return ERROR_MESSAGES.REQUIRED_FIELD + ' (Email)';
    }

    if (!password.trim()) {
      return ERROR_MESSAGES.REQUIRED_FIELD + ' (Password)';
    }

    if (!validateEmail(email)) {
      return ERROR_MESSAGES.INVALID_EMAIL;
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || isBlocked) return;

    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);

    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeText(email.trim().toLowerCase());
      const sanitizedPassword = password; // Don't sanitize password as it may contain special chars

      await onSubmit(sanitizedEmail, sanitizedPassword, remember);
    } catch (err) {
      // Error is handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Prevent XSS by limiting input length and sanitizing
    if (value.length <= 254) { // RFC 5321 email length limit
      setEmail(value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Limit password length for security
    if (value.length <= 128) {
      setPassword(value);
    }
  };

  const displayError = error || localError;

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {displayError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500 text-sm"
        >
          {displayError}
        </motion.div>
      )}
      
      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            disabled={isBlocked || isSubmitting}
            autoComplete="email"
            required
            aria-label="Email address"
            className={`w-full pl-10 pr-4 py-3 bg-dark-lighter border ${
              displayError ? 'border-red-500' : 'border-dark-light'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            transition-all duration-200 text-white placeholder-gray-400 ${
              (isBlocked || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            disabled={isBlocked || isSubmitting}
            autoComplete="current-password"
            required
            aria-label="Password"
            className={`w-full pl-10 pr-12 py-3 bg-dark-lighter border ${
              displayError ? 'border-red-500' : 'border-dark-light'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            transition-all duration-200 text-white placeholder-gray-400 ${
              (isBlocked || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isBlocked || isSubmitting}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            disabled={isBlocked || isSubmitting}
            className="rounded border-dark-light bg-dark-lighter text-accent focus:ring-accent disabled:opacity-50"
            aria-label="Remember me"
          />
          <span className="text-sm text-gray-400">Remember me</span>
        </label>
        <Link 
          to="/forgot-password" 
          className="text-sm text-accent hover:text-accent-light transition-colors"
          tabIndex={isBlocked || isSubmitting ? -1 : 0}
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isBlocked || isSubmitting}
        className={`w-full py-3 px-4 bg-accent hover:bg-accent-light text-white rounded-lg font-medium
        transition-colors duration-200 flex items-center justify-center space-x-2 ${
          (isBlocked || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label={isBlocked ? `Try again in ${blockTimeLeft} seconds` : isSubmitting ? 'Signing in...' : 'Sign in'}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Signing in...</span>
          </>
        ) : isBlocked ? (
          <span>Try again in {blockTimeLeft} seconds</span>
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            <span>Sign in</span>
          </>
        )}
      </button>

      <p className="text-center text-gray-400">
        Don't have an account?{' '}
        <Link 
          to="/signup" 
          className="text-accent hover:text-accent-light transition-colors"
          tabIndex={isBlocked || isSubmitting ? -1 : 0}
        >
          Sign up
        </Link>
      </p>
    </motion.form>
  );
}