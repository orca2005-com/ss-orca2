import React from 'react';
import { Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ConnectionCard } from '../ui/ConnectionCard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Connection {
  id: string;
  name: string;
  role: string;
  avatar: string;
  mutualConnections?: number;
}

interface SuggestedConnectionsProps {
  connections: Connection[];
}

export function SuggestedConnections({ connections }: SuggestedConnectionsProps) {
  const navigate = useNavigate();
  const [dismissedUsers, setDismissedUsers] = React.useState<string[]>([]);
  const [connectedUsers, setConnectedUsers] = React.useState<Set<string>>(new Set());

  const handleConnect = (id: string) => {
    setConnectedUsers(prev => new Set([...prev, id]));
    
    // In a real app, this would call an API to create a connection request
    console.log('Connected to user:', id);
  };

  const handleDismiss = (id: string) => {
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
    <Card>
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
            <ConnectionCard
              key={connection.id}
              connection={connection}
              onConnect={handleConnect}
              onDismiss={handleDismiss}
              onViewProfile={handleViewProfile}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredConnections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <Button
            variant="outline"
            fullWidth
            size="sm"
            onClick={() => navigate('/search')}
          >
            See More Suggestions
          </Button>
        </motion.div>
      )}
    </Card>
  );
}