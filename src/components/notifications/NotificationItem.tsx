import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Star, UserPlus, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { UserAvatar } from '../ui/UserAvatar';
import { UserName } from '../ui/UserName';

interface NotificationItemProps {
  notification: {
    id: string;
    type: 'like' | 'comment' | 'message' | 'rating' | 'follow';
    user: {
      name: string;
      avatar: string;
    };
    content: string;
    timestamp: Date;
    isRead: boolean;
  };
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  rating: Star,
  message: MessageCircle,
  follow: UserPlus,
};

const notificationColors = {
  like: 'text-red-500',
  comment: 'text-accent',
  rating: 'text-yellow-500',
  message: 'text-accent',
  follow: 'text-accent',
};

// Map notification user names to profile IDs
const userNameToIdMap: Record<string, string> = {
  'John Smith': '1',
  'Sarah Johnson': '3',
  'Elite Sports Academy': '2',
  'Mike Rodriguez': '4',
  'Thunder Basketball Club': '5'
};

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const navigate = useNavigate();
  const Icon = notificationIcons[notification.type];
  const iconColor = notificationColors[notification.type];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    // Only mark as read if clicking on the main content, not buttons
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.notification-content')) {
      onMarkAsRead(notification.id);
    }
  };

  // Get the profile ID from the user name
  const profileId = userNameToIdMap[notification.user.name] || '3'; // Default to Sarah Johnson

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={`relative group p-4 rounded-lg ${
        notification.isRead ? 'bg-dark' : 'bg-dark/50'
      } hover:bg-dark transition-colors duration-200 cursor-pointer`}
      onClick={handleMarkAsRead}
    >
      {/* Delete Button - Always visible on mobile, hover on desktop */}
      <motion.button
        initial={{ opacity: 0.7, scale: 0.9 }}
        animate={{ opacity: 0.7, scale: 0.9 }}
        whileHover={{ opacity: 1, scale: 1 }}
        onClick={handleDelete}
        className="absolute top-3 right-3 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 z-10"
        title="Delete notification"
      >
        <Trash2 className="w-4 h-4" />
      </motion.button>

      <div className="flex items-center space-x-4 pr-8">
        <div className="relative">
          <UserAvatar
            userId={profileId}
            src={notification.user.avatar}
            alt={notification.user.name}
            size="md"
          />
          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-dark">
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
        </div>
        <div className="flex-1 min-w-0 notification-content">
          <p className="text-sm text-gray-300">
            <UserName
              userId={profileId}
              name={notification.user.name}
              className="font-medium text-white"
            />{' '}
            {notification.content}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!notification.isRead && (
            <div className="w-2 h-2 bg-accent rounded-full" />
          )}
        </div>
      </div>
    </motion.div>
  );
}