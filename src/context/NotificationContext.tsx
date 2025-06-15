import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRealTimeNotifications, RealTimeNotification } from '../hooks/useRealTimeNotifications';

interface NotificationContextType {
  notifications: RealTimeNotification[];
  unreadCount: number;
  isConnected: boolean;
  showNotificationCenter: boolean;
  setShowNotificationCenter: (show: boolean) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const realTimeNotifications = useRealTimeNotifications();

  // Auto-show toast for new notifications
  useEffect(() => {
    const latestNotification = realTimeNotifications.notifications[0];
    if (latestNotification && !latestNotification.read) {
      // Show toast notification
      // This could trigger a toast component
    }
  }, [realTimeNotifications.notifications]);

  return (
    <NotificationContext.Provider
      value={{
        ...realTimeNotifications,
        showNotificationCenter,
        setShowNotificationCenter
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}