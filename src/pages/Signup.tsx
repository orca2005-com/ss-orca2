import React from 'react';
import { Link } from 'react-router-dom';
import { SignupForm } from '../components/auth/SignupForm';
import { motion } from 'framer-motion';

export default function Signup() {
  return (
    <div className="min-h-screen bg-dark flex">
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-dark-lighter">
        <div className="flex items-center space-x-3">
          <img 
            src="/Group_2__6_-removebg-preview.png" 
            alt="SportNet Logo" 
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-4xl font-bold text-accent">SportNet</h1>
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
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="mt-2 text-gray-400">Join our sports network</p>
          </div>
          <SignupForm />
          <p className="text-center text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-light transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}