import React from 'react';
import { OptimizedImage } from './OptimizedImage';
import { getOptimizedPexelsUrl, createPlaceholderUrl } from '../../utils/imageOptimization';
import { Users } from 'lucide-react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  onClick?: () => void;
  priority?: boolean;
  showGroupIndicator?: boolean;
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
  showGroupIndicator = false,
  quality = 'low'
}: AvatarProps) {
  const baseClasses = `${sizeClasses[size]} rounded-full object-cover border-2 border-white/10 transition-all duration-200`;
  const interactiveClasses = onClick ? 'cursor-pointer hover:ring-2 hover:ring-accent hover:scale-105' : '';
  const finalClasses = `${baseClasses} ${interactiveClasses} ${className}`;

  return (
    <div className="relative inline-block">
      <OptimizedImage
        src={getOptimizedPexelsUrl(src, quality)}
        alt={alt}
        className={finalClasses}
        placeholder={createPlaceholderUrl(src)}
        priority={priority}
        onClick={onClick}
      />
      
      {showGroupIndicator && (
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-accent rounded-full border-2 border-dark-lighter flex items-center justify-center">
          <Users className="w-2.5 h-2.5 text-white" />
        </div>
      )}
    </div>
  );
}