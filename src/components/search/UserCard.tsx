import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { ConnectionButton } from '../ui/ConnectionButton';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    sport: string;
    location: string;
    skillLevel: string;
  };
  index: number;
}

export function UserCard({ user, index }: UserCardProps) {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/profile/${user.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-dark-lighter rounded-xl p-3 md:p-4 hover:bg-dark-light transition-colors duration-200"
    >
      <div className="flex items-center space-x-3 md:space-x-4">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-dark"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-white truncate">{user.name}</h3>
          <div className="flex flex-wrap items-center gap-x-2 text-xs md:text-sm text-gray-400">
            <span className="capitalize">{user.role}</span>
            <span className="hidden md:inline">•</span>
            <span>{user.sport}</span>
            <span className="hidden md:inline">•</span>
            <div className="flex items-center space-x-1">
              <Trophy className="w-3 h-3 md:w-4 md:h-4 text-accent" />
              <span>{user.skillLevel}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs md:text-sm text-gray-400 mt-1">
            <MapPin className="h-3 w-3 md:h-4 md:w-4" />
            <span className="truncate">{user.location}</span>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <ConnectionButton
            userId={user.id}
            size="sm"
            showLabel={true}
          />
          <button 
            onClick={handleViewProfile}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-dark text-gray-300 text-xs md:text-sm rounded-lg hover:bg-dark-light hover:text-white transition-colors whitespace-nowrap"
          >
            View Profile
          </button>
        </div>
      </div>
    </motion.div>
  );
}