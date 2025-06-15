import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export interface RealTimeNotification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'follow_request' | 'message' | 'mention';
  userId: string;
  targetUserId: string;
  data: {
    userName: string;
    userAvatar: string;
    postId?: string;
    messageId?: string;
    content?: string;
  };
  timestamp: Date;
  read: boolean;
}

interface UseRealTimeNotificationsReturn {
  notifications: RealTimeNotification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
}

export function useRealTimeNotifications(): UseRealTimeNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!user?.id) return;

    try {
      // In production, this would be your WebSocket server URL
      const wsUrl = `ws://localhost:8080/notifications?userId=${user.id}`;
      
      // For demo purposes, we'll simulate WebSocket with EventSource (Server-Sent Events)
      // or use a mock WebSocket implementation
      
      // Mock WebSocket for demo
      const mockWs = {
        readyState: 1, // OPEN
        send: (data: string) => {
          console.log('Sending:', data);
        },
        close: () => {
          setIsConnected(false);
        },
        addEventListener: (event: string, handler: Function) => {
          if (event === 'open') {
            setTimeout(() => {
              setIsConnected(true);
              reconnectAttempts.current = 0;
              handler();
            }, 1000);
          }
        },
        removeEventListener: () => {}
      };

      wsRef.current = mockWs as any;

      // Simulate receiving notifications
      const simulateNotifications = () => {
        const mockNotifications = [
          {
            id: Date.now().toString(),
            type: 'like' as const,
            userId: '3',
            targetUserId: user.id,
            data: {
              userName: 'Sarah Johnson',
              userAvatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
              postId: '1',
              content: 'liked your post'
            },
            timestamp: new Date(),
            read: false
          },
          {
            id: (Date.now() + 1).toString(),
            type: 'follow' as const,
            userId: '4',
            targetUserId: user.id,
            data: {
              userName: 'Mike Rodriguez',
              userAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
              content: 'started following you'
            },
            timestamp: new Date(),
            read: false
          }
        ];

        // Simulate random notifications
        setInterval(() => {
          if (Math.random() < 0.3) { // 30% chance every 10 seconds
            const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
            const newNotification = {
              ...randomNotification,
              id: Date.now().toString(),
              timestamp: new Date()
            };
            
            setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
            
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
              new Notification(`SportSYNC - ${newNotification.data.userName}`, {
                body: newNotification.data.content,
                icon: newNotification.data.userAvatar,
                tag: newNotification.id
              });
            }
          }
        }, 10000);
      };

      mockWs.addEventListener('open', () => {
        console.log('Connected to notifications');
        simulateNotifications();
      });

    } catch (error) {
      console.error('Failed to connect to notifications:', error);
      scheduleReconnect();
    }
  }, [user?.id]);

  // Schedule reconnection
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    reconnectAttempts.current++;

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Reconnecting... Attempt ${reconnectAttempts.current}`);
      connect();
    }, delay);
  }, [connect]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    // Send to server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'mark_read',
        notificationId
      }));
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Send to server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'mark_all_read'
      }));
    }
  }, []);

  // Clear notification
  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );

    // Send to server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'clear_notification',
        notificationId
      }));
    }
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Connect on mount and user change
  useEffect(() => {
    if (user?.id) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user?.id, connect]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotification
  };
}