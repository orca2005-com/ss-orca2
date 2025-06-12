import React, { useState } from 'react';
import { UserPlus, Check, X, Users } from 'lucide-react';
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
    <div className="bg-dark-lighter rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-accent" />
          <h2 className="text-lg md:text-xl font-semibold text-white">Suggested Connections</h2>
        </div>
        <span className="text-xs text-gray-400 bg-dark px-2 py-1 rounded-full">
          {filteredConnections.length} suggestions
        </span>
      </div>

      <div className="space-y-3 md:space-y-4">
        <AnimatePresence>
          {filteredConnections.map((connection, index) => (
            <motion.div
              key={connection.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="group relative bg-dark/50 hover:bg-dark rounded-xl p-4 transition-all duration-200"
            >
              {/* Dismiss Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                onClick={(e) => handleDismiss(connection.id, e)}
                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                title="Dismiss suggestion"
              >
                <X className="w-4 h-4" />
              </motion.button>

              <div className="flex items-start space-x-4">
                {/* Avatar - Removed green circle and dot */}
                <button
                  onClick={() => handleViewProfile(connection.id)}
                  className="relative flex-shrink-0 hover:scale-105 transition-transform duration-200"
                >
                  <OptimizedImage
                    src={getOptimizedPexelsUrl(connection.avatar, 'low')}
                    alt={connection.name}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-white/10 group-hover:border-accent/50 transition-all duration-200"
                    placeholder={createPlaceholderUrl(connection.avatar)}
                    priority={index < 2}
                  />
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => handleViewProfile(connection.id)}
                    className="block w-full text-left group/profile"
                  >
                    <h3 className="font-semibold text-white group-hover/profile:text-accent transition-colors duration-200 truncate text-sm md:text-base">
                      {connection.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-400 mb-2 truncate">
                      {connection.role}
                    </p>
                  </button>

                  {/* Mutual connections */}
                  <div className="flex items-center space-x-1 mb-3">
                    <Users className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {connection.mutualConnections} mutual connection{connection.mutualConnections !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    {connectedUsers.includes(connection.id) ? (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-accent/20 text-accent rounded-full border border-accent/30"
                      >
                        <Check className="w-4 h-4" />
                        <span className="text-xs font-medium">Connected</span>
                      </motion.div>
                    ) : pendingConnections.includes(connection.id) ? (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30"
                      >
                        <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium">Connecting...</span>
                      </motion.div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleConnect(connection.id, e)}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-accent hover:bg-accent-dark text-white rounded-full transition-all duration-200 text-xs font-medium shadow-lg hover:shadow-xl"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Connect</span>
                      </motion.button>
                    )}

                    {/* View Profile Link */}
                    <button
                      onClick={() => handleViewProfile(connection.id)}
                      className="text-xs text-gray-400 hover:text-accent transition-colors duration-200 font-medium"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* See More Button */}
      {filteredConnections.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full mt-4 py-2 text-sm text-accent hover:text-accent-light transition-colors font-medium border border-accent/30 hover:border-accent/50 rounded-lg hover:bg-accent/5"
        >
          See More Suggestions
        </motion.button>
      )}
    </div>
  );
}