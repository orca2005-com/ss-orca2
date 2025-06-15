import React from 'react';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'away' | 'busy';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const statusConfig = {
  online: { color: 'bg-green-500', text: 'Online' },
  offline: { color: 'bg-gray-500', text: 'Offline' },
  away: { color: 'bg-yellow-500', text: 'Away' },
  busy: { color: 'bg-red-500', text: 'Busy' }
};

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4'
};

export function StatusIndicator({ 
  status, 
  size = 'md', 
  className = '', 
  showText = false 
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className={`${sizeClasses[size]} ${config.color} rounded-full`} />
      {showText && (
        <span className="text-xs text-gray-400">{config.text}</span>
      )}
    </div>
  );
}