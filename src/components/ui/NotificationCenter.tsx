import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { useRealTimeNotifications } from '../../hooks/useRealTimeNotifications';
import { NotificationToast } from './NotificationToast';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification 
  } = useRealTimeNotifications();

  const [toastNotifications, setToastNotifications] = useState<string[]>([]);

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
    // Navigate to relevant page based on notification type
    // This would be implemented based on your routing needs
  };

  const showToast = (notificationId: string) => {
    setToastNotifications(prev => [...prev, notificationId]);
  };

  const hideToast = (notificationId: string) => {
    setToastNotifications(prev => prev.filter(id => id !== notificationId));
  };

  return (
    <>
      {/* Notification Center Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={onClose}
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-dark-lighter border-l border-white/10 z-50 overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-6 h-6 text-accent" />
                    <h2 className="text-lg font-semibold text-white">Notifications</h2>
                    {unreadCount > 0 && (
                      <span className="bg-accent text-white text-xs rounded-full px-2 py-1">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Mark all as read"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 hover:bg-dark/50 transition-colors cursor-pointer group ${
                            !notification.read ? 'bg-accent/5' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <img
                              src={notification.data.userAvatar}
                              alt={notification.data.userName}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white">
                                <span className="font-medium">
                                  {notification.data.userName}
                                </span>{' '}
                                {notification.data.content}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.timestamp.toLocaleString()}
                              </p>
                            </div>

                            <div className="flex items-center space-x-2">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-accent rounded-full" />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearNotification(notification.id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Bell className="w-12 h-12 mb-4" />
                      <p className="text-lg font-medium">No notifications</p>
                      <p className="text-sm">You're all caught up!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications
            .filter(n => toastNotifications.includes(n.id))
            .slice(0, 3) // Show max 3 toasts
            .map((notification) => (
              <NotificationToast
                key={notification.id}
                notification={notification}
                onClose={() => hideToast(notification.id)}
                onAction={() => handleNotificationClick(notification.id)}
              />
            ))}
        </AnimatePresence>
      </div>
    </>
  );
}