import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoginFormProps {
  onSubmit: (email: string, password: string, remember: boolean) => void;
  prefillEmail?: string;
}

export function LoginForm({ onSubmit, prefillEmail = '' }: LoginFormProps) {
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(false);

  // Update email when prefillEmail changes
  useEffect(() => {
    setEmail(prefillEmail);
  }, [prefillEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(true);
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
      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 bg-dark-lighter border ${
              error && !email ? 'border-red-500' : 'border-dark-light'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            transition-all duration-200 text-white placeholder-gray-400`}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 bg-dark-lighter border ${
              error && !password ? 'border-red-500' : 'border-dark-light'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            transition-all duration-200 text-white placeholder-gray-400`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-dark-light bg-dark-lighter text-accent focus:ring-accent focus:ring-offset-dark"
          />
          <span className="text-sm text-gray-300">Remember me</span>
        </label>
        <Link 
          to="/forgot-password" 
          className="text-sm text-accent hover:text-accent-light transition-colors"
        >
          Forgot Password?
        </Link>
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center space-x-2 bg-accent hover:bg-accent-dark 
        text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
      >
        <LogIn className="h-5 w-5" />
        <span>Sign In</span>
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