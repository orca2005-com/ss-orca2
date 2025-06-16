import React from 'react';
import { OptimizedImage } from './OptimizedImage';
import { getOptimizedPexelsUrl, createPlaceholderUrl } from '../../utils/imageOptimization';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  onClick?: () => void;
  priority?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20'
};

export function Avatar({ 
  src, 
  alt, 
  size = 'md', 
  className = '', 
  onClick, 
  priority = false,
  quality = 'low'
}: AvatarProps) {
  const baseClasses = `${sizeClasses[size]} rounded-full object-cover border-2 border-white/10 transition-all duration-200`;
  const interactiveClasses = onClick ? 'cursor-pointer hover:ring-2 hover:ring-accent hover:scale-105' : '';
  const finalClasses = `${baseClasses} ${interactiveClasses} ${className}`;

  // Ensure src is a valid URL or provide a fallback
  const validSrc = src && typeof src === 'string' ? src : 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg';

  return (
    <OptimizedImage
      src={getOptimizedPexelsUrl(validSrc, quality)}
      alt={alt}
      className={finalClasses}
      placeholder={createPlaceholderUrl(validSrc)}
      priority={priority}
      onClick={onClick}
    />
  );
}