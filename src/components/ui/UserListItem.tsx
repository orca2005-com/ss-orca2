import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Avatar } from './Avatar';

interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface UserListItemProps {
  user: User;
  index?: number;
  showChevron?: boolean;
  hoverColor?: string;
  onClick?: (userId: string) => void;
  rightElement?: React.ReactNode;
  className?: string;
}

export function UserListItem({ 
  user, 
  index = 0, 
  showChevron = true, 
  hoverColor = 'accent',
  onClick,
  rightElement,
  className = ''
}: UserListItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(user.id);
    } else {
      navigate(`/profile/${user.id}`);
    }
  };

  const getHoverColorClasses = () => {
    switch (hoverColor) {
      case 'green':
        return 'hover:border-green-400/30 group-hover:text-green-400';
      case 'blue':
        return 'hover:border-blue-400/30 group-hover:text-blue-400';
      case 'accent':
      default:
        return 'hover:border-accent/30 group-hover:text-accent';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      onClick={handleClick}
      className={`flex items-center space-x-4 bg-dark/50 rounded-xl p-4 border border-white/5 ${getHoverColorClasses()} transition-all cursor-pointer group ${className}`}
    >
      <div className="relative">
        <Avatar
          src={user.avatar}
          alt={user.name}
          size="md"
          className={`border-2 border-white/10 ${hoverColor === 'green' ? 'group-hover:border-green-400/50' : hoverColor === 'blue' ? 'group-hover:border-blue-400/50' : 'group-hover:border-accent/50'} transition-colors`}
        />
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-dark-lighter ${hoverColor === 'green' ? 'bg-green-400' : hoverColor === 'blue' ? 'bg-blue-400' : 'bg-accent'}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-white transition-colors truncate ${getHoverColorClasses().split(' ')[1]}`}>
          {user.name}
        </p>
        <p className="text-sm text-gray-400">{user.role}</p>
      </div>
      
      {rightElement || (showChevron && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className={`w-5 h-5 ${hoverColor === 'green' ? 'text-green-400' : hoverColor === 'blue' ? 'text-blue-400' : 'text-accent'}`} />
        </div>
      ))}
    </motion.div>
  );
}