import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';
import { RealTimeNotification } from '../../hooks/useRealTimeNotifications';

interface NotificationToastProps {
  notification: RealTimeNotification;
  onClose: () => void;
  onAction?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function NotificationToast({ 
  notification, 
  onClose, 
  onAction,
  autoClose = true,
  duration = 5000 
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
      case 'follow_request':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-accent" />;
    }
  };

  const handleClick = () => {
    if (onAction) {
      onAction();
    }
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-dark-lighter/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl cursor-pointer hover:bg-dark-light transition-colors max-w-sm"
          onClick={handleClick}
        >
          <div className="flex items-start space-x-3">
            <img
              src={notification.data.userAvatar}
              alt={notification.data.userName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {getIcon()}
                <p className="text-sm font-medium text-white truncate">
                  {notification.data.userName}
                </p>
              </div>
              <p className="text-sm text-gray-300">
                {notification.data.content}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {notification.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>

            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}