import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, UserMinus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export type FollowStatus = 'none' | 'following' | 'follows_you';

interface FollowButtonProps {
  userId: string;
  currentUserId?: string;
  onFollowChange?: (userId: string, newStatus: FollowStatus) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTextOnMobile?: boolean;
}

export function FollowButton({ 
  userId, 
  currentUserId, 
  onFollowChange, 
  className = '',
  size = 'md',
  showTextOnMobile = true
}: FollowButtonProps) {
  const { user, followUser, unfollowUser, isFollowing } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Don't show follow button for own profile
  if (userId === (currentUserId || user?.id)) return null;

  const following = isFollowing(userId);

  const handleFollow = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (following) {
        await unfollowUser(userId);
        onFollowChange?.(userId, 'none');
      } else {
        await followUser(userId);
        onFollowChange?.(userId, 'following');
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Loading...';
    if (following) {
      return isHovered ? 'Unfollow' : 'Following';
    }
    return 'Follow';
  };

  const getButtonIcon = () => {
    if (isLoading) return null;
    if (following) {
      return isHovered ? UserMinus : UserCheck;
    }
    return UserPlus;
  };

  const getButtonStyle = () => {
    if (following) {
      if (isHovered) {
        return 'bg-red-600 text-white border border-red-500 hover:bg-red-700';
      }
      return 'bg-gray-600 text-white border border-gray-500 hover:bg-gray-700';
    }
    return 'bg-accent text-white hover:bg-accent-dark';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm min-h-[36px]';
      case 'lg':
        return 'px-6 py-3 text-base min-h-[48px]';
      default:
        return 'px-4 py-2 text-sm min-h-[44px]';
    }
  };

  const ButtonIcon = getButtonIcon();

  return (
    <motion.button
      onClick={handleFollow}
      disabled={isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center justify-center space-x-2 rounded-lg font-medium transition-all duration-200 ultra-touch disabled:opacity-50 disabled:cursor-not-allowed ${getButtonStyle()} ${getSizeClasses()} ${className}`}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {ButtonIcon && <ButtonIcon className="w-4 h-4" />}
          {showTextOnMobile && (
            <span className={size === 'sm' ? 'hidden sm:inline' : ''}>
              {getButtonText()}
            </span>
          )}
        </>
      )}
    </motion.button>
  );
}