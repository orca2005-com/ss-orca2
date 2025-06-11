import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { NotificationItem } from '../components/notifications/NotificationItem';
import { SimpleLoader } from '../components/ui/SimpleLoader';

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
  }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<typeof mockNotifications>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
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
    <div className="min-h-screen bg-dark py-4 md:py-8 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-dark-lighter rounded-xl p-4 md:p-6 mb-6">
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
              <h1 className="text-lg md:text-2xl font-bold text-white">Notifications</h1>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center justify-center w-8 h-8 md:w-auto md:h-auto md:px-3 md:py-1.5 bg-dark text-gray-300 rounded-lg hover:bg-dark-light transition-colors text-xs md:text-sm ultra-touch"
                  title="Mark all as read"
                >
                  <Check className="w-4 h-4" />
                  <span className="hidden md:inline ml-1">Mark all read</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDeleteNotification}
              />
            ))}
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