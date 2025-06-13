import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageCircle, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

export function BottomNavigation() {
  const location = useLocation();
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = React.useState(0);
  const [unreadNotifications, setUnreadNotifications] = React.useState(0);

  // This would be replaced with real data from an API
  React.useEffect(() => {
    // Simulate fetching unread counts
    setUnreadMessages(0);
    setUnreadNotifications(0);
  }, []);

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/messages', icon: MessageCircle, label: 'Messages', count: unreadMessages },
    { path: '/notifications', icon: Bell, label: 'Notifications', count: unreadNotifications },
    { path: user ? `/profile/${user.id}` : '/profile/1', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark/95 backdrop-blur-sm border-t border-dark-light z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex flex-col items-center py-2 px-3 relative ultra-touch transition-all duration-100',
                isActive ? 'text-accent' : 'text-gray-400'
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.count > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 flex items-center justify-center bg-accent rounded-full text-[8px] font-medium text-white"
                  >
                    {item.count}
                  </motion.span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomNav"
                  className="absolute top-0 left-0 right-0 h-0.5 bg-accent"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}