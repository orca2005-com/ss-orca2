import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-dark-lighter">
        <div>
          <h1 className="text-4xl font-bold text-accent">SportNet</h1>
        </div>
        <div className="space-y-6">
          <h2 className="text-5xl font-bold text-white leading-tight">
            RESET YOUR PASSWORD
          </h2>
          <p className="text-xl text-gray-400">
            We'll help you get back to your account
          </p>
        </div>
        <div className="text-gray-400">
          © {new Date().getFullYear()} SportNet. All rights reserved.
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white">Forgot Password?</h2>
                  <p className="mt-2 text-gray-400">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-dark-lighter border ${
                        error ? 'border-red-500' : 'border-dark-light'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                      transition-all duration-200 text-white placeholder-gray-400`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-accent hover:bg-accent-dark 
                    text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Mail className="h-5 w-5" />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center space-x-2 text-accent hover:text-accent-light transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto"
                >
                  <Check className="w-8 h-8 text-white" />
                </motion.div>

                <div>
                  <h2 className="text-3xl font-bold text-white">Check Your Email</h2>
                  <p className="mt-2 text-gray-400">
                    We've sent a password reset link to
                  </p>
                  <p className="text-accent font-medium">{email}</p>
                </div>

                <div className="bg-dark-lighter p-4 rounded-lg">
                  <p className="text-sm text-gray-300 mb-3">
                    Didn't receive the email? Check your spam folder or
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                    }}
                    className="text-accent hover:text-accent-light transition-colors text-sm font-medium"
                  >
                    Try a different email address
                  </button>
                </div>

                <Link 
                  to="/login" 
                  className="inline-flex items-center space-x-2 text-accent hover:text-accent-light transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Sign In</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}