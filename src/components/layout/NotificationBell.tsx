import React from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';

export function NotificationBell() {
  const { unreadCount, setShowNotificationCenter, isConnected } = useNotifications();

  return (
    <button
      onClick={() => setShowNotificationCenter(true)}
      className="relative p-2 text-gray-400 hover:text-white transition-colors ultra-touch"
    >
      <Bell className="w-6 h-6" />
      
      {/* Unread count badge */}
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </motion.span>
      )}

      {/* Connection status indicator */}
      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-dark-lighter ${
        isConnected ? 'bg-green-500' : 'bg-red-500'
      }`} />
    </button>
  );
}