import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [localError, setLocalError] = useState(false);

  // Update email when prefillEmail changes
  useEffect(() => {
    setEmail(prefillEmail);
  }, [prefillEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError(true);
      return;
    }
    onSubmit(email, password, remember);
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500 text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isBlocked}
            className={`w-full pl-10 pr-4 py-3 bg-dark-lighter border ${
              (localError && !email) || error ? 'border-red-500' : 'border-dark-light'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            transition-all duration-200 text-white placeholder-gray-400 ${
              isBlocked ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isBlocked}
            className={`w-full pl-10 pr-4 py-3 bg-dark-lighter border ${
              (localError && !password) || error ? 'border-red-500' : 'border-dark-light'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            transition-all duration-200 text-white placeholder-gray-400 ${
              isBlocked ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            disabled={isBlocked}
            className="rounded border-dark-light bg-dark-lighter text-accent focus:ring-accent"
          />
          <span className="text-sm text-gray-400">Remember me</span>
        </label>
        <Link to="/forgot-password" className="text-sm text-accent hover:text-accent-light transition-colors">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isBlocked}
        className={`w-full py-3 px-4 bg-accent hover:bg-accent-light text-white rounded-lg font-medium
        transition-colors duration-200 ${
          isBlocked ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isBlocked ? `Try again in ${blockTimeLeft} seconds` : 'Sign in'}
      </button>

      <p className="text-center text-gray-400">
        Don't have an account?{' '}
        <Link 
          to="/signup" 
          className="text-accent hover:text-accent-light transition-colors"
        >
          Sign up
        </Link>
      </p>
    </motion.form>
  );
}