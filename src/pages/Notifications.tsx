import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { NotificationItem } from '../components/notifications/NotificationItem';
import { SimpleLoader } from '../components/ui/SimpleLoader';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

export default function Notifications() {
  const { markNotificationAsRead, markAllNotificationsAsRead } = useAuth();
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  // Use API hook for notifications
  const {
    data: notificationsData,
    loading: isLoading,
    error: notificationsError,
    refetch
  } = useApi(() => apiService.getNotifications());

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (notificationsData?.notifications) {
      setNotifications(notificationsData.notifications);
    }
  }, [notificationsData]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
    await markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true);
    
    try {
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
      // Revert on error
      refetch();
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      // In a real app, you'd call an API to delete the notification
      // await apiService.deleteNotification(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <SimpleLoader size="lg" />
          <p className="text-accent text-lg font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark mobile-optimized">
      <div className="max-w-2xl mx-auto mobile-padding pb-20 md:pb-8 pt-4 md:pt-8">
        <div className="card-mobile">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-[10px] md:text-xs text-white font-medium">{unreadCount}</span>
                  </div>
                )}
              </div>
              <h1 className="heading-mobile">Notifications</h1>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <motion.button
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllRead}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center ultra-touch bg-dark text-gray-300 rounded-lg hover:bg-dark-light transition-colors text-xs md:text-sm disabled:opacity-50"
                  title="Mark all as read"
                >
                  {isMarkingAllRead ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="hidden md:inline ml-1">Mark all read</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {notificationsError ? (
              <div className="text-center py-8 text-red-400">
                <p>Error loading notifications: {notificationsError}</p>
                <button
                  onClick={refetch}
                  className="mt-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors ultra-touch"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <AnimatePresence>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                  />
                ))}
              </AnimatePresence>
            )}
            
            {notifications.length === 0 && !isLoading && !notificationsError && (
              <div className="text-center py-8">
                <Bell className="w-10 h-10 md:w-12 md:h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-sm md:text-base text-gray-400 mb-2">No notifications</p>
                <p className="text-xs md:text-sm text-gray-500">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}