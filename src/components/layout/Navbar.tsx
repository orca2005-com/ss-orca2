import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, MessageCircle, Bell, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, unreadMessages, unreadNotifications } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleProfileClick = () => {
    if (user?.id) {
      navigate(`/profile/${user.id}`);
    }
  };

  const menuItems = [
    { label: 'About Us', path: '/about' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms & Conditions', path: '/terms' },
  ];

  // Check if we're on a legal page
  const isLegalPage = ['/about', '/privacy', '/terms', '/contact'].includes(location.pathname);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200 safe-area-inset-top',
        isScrolled ? 'bg-dark/95 backdrop-blur-sm shadow-lg py-2' : 'bg-dark py-3'
      )}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Home Button for Legal Pages */}
            {isLegalPage && (
              <Link
                to="/home"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 text-gray-400 hover:text-accent ultra-touch min-h-touch"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Home</span>
              </Link>
            )}
            
            {/* Logo and Brand - MOBILE OPTIMIZED */}
            <Link to="/home" className="flex items-center space-x-2 md:space-x-3 ultra-touch">
              <img 
                src="/Group_2__6_-removebg-preview.png" 
                alt="SportSYNC Logo" 
                className="w-6 h-6 md:w-8 md:h-8 object-contain"
              />
              <span className="text-lg md:text-xl font-bold text-accent">SportSYNC</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {!isLegalPage && [
              { path: '/home', icon: Home, label: 'Home' },
              { path: '/search', icon: Search, label: 'Search' },
              { path: '/messages', icon: MessageCircle, label: 'Messages', count: unreadMessages },
              { path: '/notifications', icon: Bell, label: 'Notifications', count: unreadNotifications },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'relative group px-3 py-2 rounded-lg transition-colors duration-200 min-h-touch',
                    isActive ? 'text-accent' : 'text-gray-400 hover:text-white'
                  )}
                >
                  <div className="relative flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                    {item.count > 0 && (
                      <span className="absolute -top-1 -right-1 text-xs font-medium text-accent">
                        {item.count}
                      </span>
                    )}
                  </div>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent transform origin-left"
                    initial={false}
                    animate={{ scaleX: isActive ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
              );
            })}

            {/* Profile Button */}
            {!isLegalPage && user && (
              <button
                onClick={handleProfileClick}
                className={clsx(
                  'relative group px-3 py-2 rounded-lg transition-colors duration-200 min-h-touch',
                  location.pathname === `/profile/${user.id}` ? 'text-accent' : 'text-gray-400 hover:text-white'
                )}
              >
                <div className="relative flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent transform origin-left"
                  initial={false}
                  animate={{ scaleX: location.pathname === `/profile/${user.id}` ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </button>
            )}

            {/* Hamburger Menu Button */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative group px-3 py-2 rounded-lg transition-colors duration-200 text-gray-400 hover:text-white min-h-touch"
              >
                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: isMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </motion.div>
                </div>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-dark-lighter border border-dark-light rounded-lg shadow-lg overflow-hidden z-50"
                  >
                    {menuItems.map((item, index) => (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-dark hover:text-white transition-colors duration-200 min-h-touch ultra-touch"
                        >
                          <span>{item.label}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* MOBILE: Enhanced Menu Button with better touch target */}
          <div className="md:hidden relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative group p-3 rounded-lg transition-colors duration-200 text-gray-400 hover:text-white ultra-touch min-h-touch-lg min-w-touch-lg"
              aria-label="Toggle menu"
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.div>
            </button>

            {/* MOBILE: Enhanced Dropdown Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-dark-lighter border border-dark-light rounded-lg shadow-lg overflow-hidden z-50"
                  style={{ 
                    right: '0',
                    left: 'auto',
                    transform: 'translateX(0)'
                  }}
                >
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-4 text-base text-gray-300 hover:bg-dark hover:text-white transition-colors duration-200 min-h-touch-lg ultra-touch"
                      >
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}