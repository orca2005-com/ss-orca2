import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  animate?: boolean;
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4 md:p-6',
  lg: 'p-6 md:p-8'
};

export function Card({ 
  children, 
  className = '', 
  padding = 'md', 
  hover = false,
  animate = false,
  onClick 
}: CardProps) {
  const baseClasses = 'bg-dark-lighter rounded-xl transition-all duration-200';
  const hoverClasses = hover ? 'hover:bg-dark-light hover:shadow-lg cursor-pointer' : '';
  const interactiveClasses = onClick ? 'cursor-pointer ultra-touch' : '';
  
  const classes = `
    ${baseClasses}
    ${paddingClasses[padding]}
    ${hoverClasses}
    ${interactiveClasses}
    ${className}
  `.trim();

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={hover ? { scale: 1.02 } : undefined}
        className={classes}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}