import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  toUser: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  connectedAt: Date;
}

interface ConnectionContextType {
  connections: Connection[];
  connectionRequests: ConnectionRequest[];
  pendingRequests: ConnectionRequest[];
  sentRequests: ConnectionRequest[];
  isConnected: (userId: string) => boolean;
  hasRequestPending: (userId: string) => boolean;
  hasSentRequest: (userId: string) => boolean;
  sendConnectionRequest: (userId: string, message?: string) => Promise<void>;
  acceptConnectionRequest: (requestId: string) => Promise<void>;
  declineConnectionRequest: (requestId: string) => Promise<void>;
  removeConnection: (userId: string) => Promise<void>;
  getConnectionStatus: (userId: string) => 'connected' | 'pending' | 'sent' | 'none';
  isLoading: boolean;
  error: string | null;
}

const ConnectionContext = createContext<ConnectionContextType | null>(null);

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    if (user) {
      // Initialize with some mock connections and requests
      const mockConnections: Connection[] = [
        {
          id: '1',
          userId: user.id,
          connectedUserId: '3',
          user: {
            id: '3',
            name: 'Sarah Johnson',
            avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
            role: 'coach'
          },
          connectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      ];

      const mockRequests: ConnectionRequest[] = [
        {
          id: '1',
          fromUserId: '4',
          toUserId: user.id,
          fromUser: {
            id: '4',
            name: 'Mike Rodriguez',
            avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
            role: 'player'
          },
          toUser: {
            id: user.id,
            name: user.name,
            avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
            role: user.role
          },
          status: 'pending',
          message: 'Hi! I saw your profile and would love to connect. I think we could learn a lot from each other!',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      ];

      setConnections(mockConnections);
      setConnectionRequests(mockRequests);
    }
  }, [user]);

  const pendingRequests = connectionRequests.filter(
    req => req.toUserId === user?.id && req.status === 'pending'
  );

  const sentRequests = connectionRequests.filter(
    req => req.fromUserId === user?.id && req.status === 'pending'
  );

  const isConnected = (userId: string): boolean => {
    return connections.some(conn => 
      (conn.userId === user?.id && conn.connectedUserId === userId) ||
      (conn.connectedUserId === user?.id && conn.userId === userId)
    );
  };

  const hasRequestPending = (userId: string): boolean => {
    return connectionRequests.some(req => 
      req.fromUserId === userId && 
      req.toUserId === user?.id && 
      req.status === 'pending'
    );
  };

  const hasSentRequest = (userId: string): boolean => {
    return connectionRequests.some(req => 
      req.fromUserId === user?.id && 
      req.toUserId === userId && 
      req.status === 'pending'
    );
  };

  const getConnectionStatus = (userId: string): 'connected' | 'pending' | 'sent' | 'none' => {
    if (isConnected(userId)) return 'connected';
    if (hasRequestPending(userId)) return 'pending';
    if (hasSentRequest(userId)) return 'sent';
    return 'none';
  };

  const sendConnectionRequest = async (userId: string, message?: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newRequest: ConnectionRequest = {
        id: Date.now().toString(),
        fromUserId: user.id,
        toUserId: userId,
        fromUser: {
          id: user.id,
          name: user.name,
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
          role: user.role
        },
        toUser: {
          id: userId,
          name: 'Target User', // In real app, fetch from API
          avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
          role: 'player'
        },
        status: 'pending',
        message,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setConnectionRequests(prev => [...prev, newRequest]);
    } catch (err) {
      setError('Failed to send connection request');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptConnectionRequest = async (requestId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const request = connectionRequests.find(req => req.id === requestId);
      if (!request) throw new Error('Request not found');

      // Update request status
      setConnectionRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'accepted' as const, updatedAt: new Date() }
            : req
        )
      );

      // Add to connections
      const newConnection: Connection = {
        id: Date.now().toString(),
        userId: user.id,
        connectedUserId: request.fromUserId,
        user: request.fromUser,
        connectedAt: new Date()
      };

      setConnections(prev => [...prev, newConnection]);
    } catch (err) {
      setError('Failed to accept connection request');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const declineConnectionRequest = async (requestId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setConnectionRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'declined' as const, updatedAt: new Date() }
            : req
        )
      );
    } catch (err) {
      setError('Failed to decline connection request');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeConnection = async (userId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setConnections(prev => 
        prev.filter(conn => 
          !(conn.userId === user.id && conn.connectedUserId === userId) &&
          !(conn.connectedUserId === user.id && conn.userId === userId)
        )
      );
    } catch (err) {
      setError('Failed to remove connection');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConnectionContext.Provider value={{
      connections,
      connectionRequests,
      pendingRequests,
      sentRequests,
      isConnected,
      hasRequestPending,
      hasSentRequest,
      sendConnectionRequest,
      acceptConnectionRequest,
      declineConnectionRequest,
      removeConnection,
      getConnectionStatus,
      isLoading,
      error
    }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnections() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnections must be used within a ConnectionProvider');
  }
  return context;
}