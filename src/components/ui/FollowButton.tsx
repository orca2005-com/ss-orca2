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
    
    // Update follow status based on current state - Instagram logic
    if (followStatus === 'none') {
      newStatus = 'following';
    } else if (followStatus === 'follows_you') {
      newStatus = 'following';
    } else {
      newStatus = 'none';
    }
    
    setFollowStatus(newStatus);
    onFollowChange?.(userId, newStatus);
    setIsLoading(false);
  };

  // Instagram-like follow button logic
  const getFollowButtonText = () => {
    if (followStatus === 'follows_you') return 'Follow Back';
    if (followStatus === 'following') return 'Following';
    return 'Follow';
  };

  const getFollowButtonIcon = () => {
    if (followStatus === 'following') {
      return UserCheck;
    }
    return UserPlus;
  };

  // THIS IS THE KEY LOGIC FOR COLORS:
  const getFollowButtonStyle = () => {
    if (followStatus === 'follows_you') {
      // BLUE: When they follow you but you don't follow them back
      return 'bg-blue-500 text-white hover:bg-blue-600';
    }
    if (followStatus === 'following') {
      // LIGHT BLUE/ACCENT: When you're already following them
      return 'bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30';
    }
    // GREEN: Default follow button
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