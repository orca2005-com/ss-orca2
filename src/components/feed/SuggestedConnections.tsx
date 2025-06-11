import React, { useState } from 'react';
import { UserPlus, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { OptimizedImage } from '../ui/OptimizedImage';
import { getOptimizedPexelsUrl, createPlaceholderUrl } from '../../utils/imageOptimization';

interface Connection {
  id: string;
  name: string;
  role: string;
  avatar: string;
  mutualConnections: number;
}

interface SuggestedConnectionsProps {
  connections: Connection[];
}

export function SuggestedConnections({ connections }: SuggestedConnectionsProps) {
  const navigate = useNavigate();
  const [pendingConnections, setPendingConnections] = useState<string[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [dismissedUsers, setDismissedUsers] = useState<string[]>([]);

  const handleConnect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingConnections(prev => [...prev, id]);
    
    setTimeout(() => {
      setPendingConnections(prev => prev.filter(pendingId => pendingId !== id));
      setConnectedUsers(prev => [...prev, id]);
    }, 2000);
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedUsers(prev => [...prev, id]);
  };

  const handleViewProfile = (id: string) => {
    navigate(`/profile/${id}`);
  };

  const filteredConnections = connections.filter(
    connection => !dismissedUsers.includes(connection.id)
  );

  if (filteredConnections.length === 0) {
    return null;
  }

  return (
    <div className="bg-dark-lighter rounded-xl p-4">
      <h2 className="text-xl font-semibold text-white mb-4">Suggested Connections</h2>
      <AnimatePresence>
        {filteredConnections.map((connection, index) => (
          <motion.div
            key={connection.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.1 }}
            className="group relative"
          >
            <div 
              onClick={() => handleViewProfile(connection.id)}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-dark transition-all duration-200 cursor-pointer mb-2"
            >
              <div className="flex items-center space-x-3">
                <OptimizedImage
                  src={getOptimizedPexelsUrl(connection.avatar, 'low')}
                  alt={connection.name}
                  className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-accent transition-all"
                  placeholder={createPlaceholderUrl(connection.avatar)}
                  priority={index < 2}
                />
                <div>
                  <h3 className="font-medium text-white hover:text-accent transition-colors cursor-pointer">{connection.name}</h3>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-400">{connection.role}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">
                      {connection.mutualConnections} mutual
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {connectedUsers.includes(connection.id) ? (
                  <span className="text-accent flex items-center space-x-1">
                    <Check className="w-5 h-5" />
                    <span className="text-sm">Connected</span>
                  </span>
                ) : pendingConnections.includes(connection.id) ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-accent flex items-center space-x-1"
                  >
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Pending</span>
                  </motion.div>
                ) : (
                  <button
                    onClick={(e) => handleConnect(connection.id, e)}
                    className="text-accent hover:text-accent-light transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={(e) => handleDismiss(connection.id, e)}
                  className="text-gray-400 hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}