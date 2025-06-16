import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, BookMarked as MarkAsRead } from 'lucide-react';
import { NotificationItem } from '../components/notifications/NotificationItem';
import { SimpleLoader } from '../components/ui/SimpleLoader';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const mockNotifications = [
  {
    id: '1',
    type: 'like' as const,
    user: {
      name: 'Sarah Johnson',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    },
    content: 'liked your recent achievement',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isRead: false,
  },
  {
    id: '2',
    type: 'comment' as const,
    user: {
      name: 'John Smith',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    },
    content: 'commented on your post',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isRead: true,
  },
  {
    id: '3',
    type: 'follow' as const,
    user: {
      name: 'Mike Rodriguez',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
    },
    content: 'started following you',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    isRead: false,
  },
  {
    id: '4',
    type: 'message' as const,
    user: {
      name: 'Elite Sports Academy',
      avatar: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg',
    },
    content: 'sent you a message',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    isRead: false,
  },
  {
    id: '5',
    type: 'rating' as const,
    user: {
      name: 'Coach Martinez',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
    },
    content: 'rated your performance',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    isRead: true,
  }
];

export default function Notifications() {
  const { markNotificationAsRead, markAllNotificationsAsRead } = useAuth();
  const [notifications, setNotifications] = useState<typeof mockNotifications>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setNotifications(mockNotifications);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
    markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    markAllNotificationsAsRead();
    setIsMarkingAllRead(false);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
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
            {notifications.length === 0 && (
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