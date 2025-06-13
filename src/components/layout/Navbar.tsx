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
  const { user, signOut } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    { label: 'About Us', path: '/about' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms & Conditions', path: '/terms' },
    { label: 'Logout', action: handleLogout }
  ];

  // Check if we're on a legal page
  const isLegalPage = ['/about', '/privacy', '/terms', '/contact'].includes(location.pathname);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
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
                className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 text-gray-400 hover:text-accent ultra-touch"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium">Home</span>
              </Link>
            )}
            
            {/* Logo and Brand */}
            <Link to="/home" className="flex items-center space-x-3">
              <img 
                src="/Group_2__6_-removebg-preview.png" 
                alt="SportNet Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold text-accent">SportNet</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {!isLegalPage && user && [
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
                    'relative group px-3 py-2 rounded-lg transition-colors duration-200',
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
                  'relative group px-3 py-2 rounded-lg transition-colors duration-200',
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
                className="relative group px-3 py-2 rounded-lg transition-colors duration-200 text-gray-400 hover:text-white"
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
                        key={item.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {item.path ? (
                          <Link
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-dark hover:text-white transition-colors duration-200"
                          >
                            <span>{item.label}</span>
                          </Link>
                        ) : (
                          <button
                            onClick={item.action}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-dark hover:text-white transition-colors duration-200 text-left"
                          >
                            <span>{item.label}</span>
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative group p-2 rounded-lg transition-colors duration-200 text-gray-400 hover:text-white ultra-touch"
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.div>
            </button>

            {/* Mobile Dropdown Menu - Fixed positioning */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-dark-lighter border border-dark-light rounded-lg shadow-lg overflow-hidden z-50"
                  style={{ 
                    right: '0',
                    left: 'auto',
                    transform: 'translateX(0)'
                  }}
                >
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {item.path ? (
                        <Link
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-dark hover:text-white transition-colors duration-200"
                        >
                          <span>{item.label}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={item.action}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-dark hover:text-white transition-colors duration-200 text-left"
                        >
                          <span>{item.label}</span>
                        </button>
                      )}
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