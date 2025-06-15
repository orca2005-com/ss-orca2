import React from 'react';
import { motion } from 'framer-motion';

interface Stat {
  label: string;
  value: string | number;
  onClick?: () => void;
}

interface StatsDisplayProps {
  stats: Stat[];
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatsDisplay({ 
  stats, 
  layout = 'horizontal', 
  size = 'md',
  className = '' 
}: StatsDisplayProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          value: 'text-lg font-bold',
          label: 'text-xs'
        };
      case 'lg':
        return {
          value: 'text-3xl md:text-4xl font-bold',
          label: 'text-base'
        };
      default:
        return {
          value: 'text-2xl md:text-3xl font-bold',
          label: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const containerClasses = layout === 'horizontal' 
    ? 'flex items-center justify-center lg:justify-start space-x-8'
    : 'grid grid-cols-1 gap-4';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={`${containerClasses} ${className}`}
    >
      {stats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          <div 
            className={`text-center group ${stat.onClick ? 'cursor-pointer' : ''}`}
            onClick={stat.onClick}
          >
            <div className="relative">
              <p className={`${sizeClasses.value} text-white group-hover:text-accent transition-colors`}>
                {stat.value}
              </p>
              <div className="absolute -inset-2 bg-accent/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </div>
            <p className={`${sizeClasses.label} text-gray-400 font-medium`}>{stat.label}</p>
          </div>
          {layout === 'horizontal' && index < stats.length - 1 && (
            <div className="w-px h-12 bg-white/20" />
          )}
        </React.Fragment>
      ))}
    </motion.div>
  );
}