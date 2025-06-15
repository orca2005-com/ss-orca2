import React from 'react';
import { Avatar } from './Avatar';
import { ProfileLink } from './ProfileLink';

interface UserAvatarProps {
  userId: string;
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  priority?: boolean;
  quality?: 'low' | 'medium' | 'high';
  clickable?: boolean;
}

export function UserAvatar({ 
  userId, 
  src, 
  alt, 
  size = 'md', 
  className = '', 
  priority = false,
  quality = 'low',
  clickable = true
}: UserAvatarProps) {
  if (!clickable) {
    return (
      <Avatar
        src={src}
        alt={alt}
        size={size}
        className={className}
        priority={priority}
        quality={quality}
      />
    );
  }

  return (
    <ProfileLink userId={userId} className="hover:scale-105 transition-transform">
      <Avatar
        src={src}
        alt={alt}
        size={size}
        className={`hover:ring-2 hover:ring-accent transition-all ${className}`}
        priority={priority}
        quality={quality}
      />
    </ProfileLink>
  );
}