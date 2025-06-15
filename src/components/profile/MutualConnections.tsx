import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface MutualConnection {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface MutualConnectionsProps {
  connections: MutualConnection[];
  onViewProfile: (id: string) => void;
}

export function MutualConnections({ connections, onViewProfile }: MutualConnectionsProps) {
  const navigate = useNavigate();

  const handleProfileClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${id}`);
  };

  if (connections.length === 0) return null;

  return (
    <div className="bg-dark-lighter rounded-xl p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <Users className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold text-white">
          {connections.length} Mutual Follower{connections.length !== 1 ? 's' : ''}
        </h3>
      </div>

      <div className="space-y-3">
        {connections.map((connection, index) => (
          <motion.button
            key={connection.id}
            onClick={(e) => handleProfileClick(connection.id, e)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-dark transition-colors"
          >
            <img
              src={connection.avatar}
              alt={connection.name}
              className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-accent transition-all"
            />
            <div className="flex-1 text-left">
              <p className="font-medium text-white hover:text-accent transition-colors">{connection.name}</p>
              <p className="text-sm text-gray-400">{connection.role}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}