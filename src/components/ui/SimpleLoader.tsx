import React from 'react';

interface SimpleLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function SimpleLoader({ size = 'md', className = '' }: SimpleLoaderProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-2 border-accent border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}