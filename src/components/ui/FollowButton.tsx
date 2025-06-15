import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [followStatus, setFollowStatus] = useState<FollowStatus>('none');
  const [isLoading, setIsLoading] = useState(false);

  // Don't show follow button for own profile
  if (userId === currentUserId) return null;

  // Initialize follow status
  useEffect(() => {
    const checkFollowStatus = () => {
      // For demo purposes, randomly assign follow status
      // In real app, this would come from your backend
      const random = Math.random();
      
      if (random < 0.3) {
        setFollowStatus('follows_you');
      } else if (random < 0.6) {
        setFollowStatus('following');
      } else {
        setFollowStatus('none');
      }
    };
    
    setTimeout(checkFollowStatus, 100);
  }, [userId]);

  const handleFollow = async () => {
    setIsLoading(true);
    
    // Simulate follow/unfollow process
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let newStatus: FollowStatus;
    
    // Simple toggle logic - much clearer!
    if (followStatus === 'following') {
      // If following, unfollow
      newStatus = 'none';
    } else {
      // If not following, follow
      newStatus = 'following';
    }
    
    setFollowStatus(newStatus);
    onFollowChange?.(userId, newStatus);
    setIsLoading(false);
  };

  // SIMPLIFIED LOGIC: Only 2 states that matter to users
  const getFollowButtonText = () => {
    if (followStatus === 'following') {
      return 'Following';
    }
    return 'Follow';
  };

  const getFollowButtonIcon = () => {
    if (followStatus === 'following') {
      return UserCheck;
    }
    return UserPlus;
  };

  // MUCH SIMPLER COLOR LOGIC:
  const getFollowButtonStyle = () => {
    if (followStatus === 'following') {
      // GRAY: When you're following them (subtle, less prominent)
      return 'bg-gray-600 text-white border border-gray-500 hover:bg-gray-700';
    }
    // GREEN: When you can follow them (call to action)
    return 'bg-accent text-white hover:bg-accent-dark';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const FollowIcon = getFollowButtonIcon();

  return (
    <motion.button
      onClick={handleFollow}
      disabled={isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center justify-center space-x-2 rounded-lg font-medium transition-all duration-200 ultra-touch disabled:opacity-50 disabled:cursor-not-allowed ${getFollowButtonStyle()} ${getSizeClasses()} ${className}`}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <FollowIcon className="w-4 h-4" />
          {showTextOnMobile && <span className={size === 'sm' ? 'hidden sm:inline' : ''}>{getFollowButtonText()}</span>}
        </>
      )}
    </motion.button>
  );
}