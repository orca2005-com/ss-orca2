import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { UserListItem } from '../ui/UserListItem';

interface MutualFollower {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface MutualConnectionsProps {
  connections: MutualFollower[];
  onViewProfile: (id: string) => void;
}

export function MutualConnections({ connections, onViewProfile }: MutualConnectionsProps) {
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
          <UserListItem
            key={connection.id}
            user={connection}
            index={index}
            onClick={onViewProfile}
            hoverColor="accent"
          />
        ))}
      </div>
    </div>
  );
}