import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, DivideIcon as LucideIcon } from 'lucide-react';

interface TabSectionProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  emptyState?: {
    icon: LucideIcon;
    title: string;
    subtitle: string;
  };
  showAllButton?: {
    totalCount: number;
    isExpanded: boolean;
    onToggle: () => void;
    itemName: string;
  };
  iconColor?: string;
  className?: string;
}

const containerAnimation = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { type: "spring", stiffness: 300, damping: 30 }
};

export function TabSection({ 
  icon: Icon, 
  title, 
  subtitle, 
  children, 
  emptyState,
  showAllButton,
  iconColor = 'accent',
  className = ''
}: TabSectionProps) {
  const getIconColorClasses = () => {
    switch (iconColor) {
      case 'blue':
        return 'bg-blue-400/20 text-blue-400';
      case 'green':
        return 'bg-green-400/20 text-green-400';
      case 'yellow':
        return 'bg-yellow-400/20 text-yellow-400';
      case 'purple':
        return 'bg-purple-400/20 text-purple-400';
      case 'red':
        return 'bg-red-400/20 text-red-400';
      default:
        return 'bg-accent/20 text-accent';
    }
  };

  const getButtonColorClasses = () => {
    switch (iconColor) {
      case 'blue':
        return 'text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20';
      case 'green':
        return 'text-green-400 hover:text-green-300 bg-green-400/10 hover:bg-green-400/20';
      case 'yellow':
        return 'text-yellow-400 hover:text-yellow-300 bg-yellow-400/10 hover:bg-yellow-400/20';
      case 'purple':
        return 'text-purple-400 hover:text-purple-300 bg-purple-400/10 hover:bg-purple-400/20';
      case 'red':
        return 'text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20';
      default:
        return 'text-accent hover:text-accent-light bg-accent/10 hover:bg-accent/20';
    }
  };

  return (
    <motion.div {...containerAnimation} className={className}>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getIconColorClasses()}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-400">{subtitle}</p>
          </div>
        </div>

        {/* Content */}
        {React.Children.count(children) > 0 ? (
          <div className="space-y-3 md:space-y-4">
            {children}
          </div>
        ) : emptyState ? (
          <div className="text-center py-12">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${getIconColorClasses()}`}>
              <emptyState.icon className="w-8 h-8" />
            </div>
            <p className="text-gray-400 text-lg font-medium">{emptyState.title}</p>
            <p className="text-gray-500 text-sm">{emptyState.subtitle}</p>
          </div>
        ) : null}

        {/* Show All Button */}
        {showAllButton && showAllButton.totalCount > 3 && (
          <motion.button
            onClick={showAllButton.onToggle}
            className={`flex items-center justify-center space-x-2 w-full py-3 transition-colors font-medium rounded-xl ${getButtonColorClasses()}`}
          >
            <span>
              {showAllButton.isExpanded 
                ? 'Show Less' 
                : `Show All ${showAllButton.totalCount} ${showAllButton.itemName}`
              }
            </span>
            <ChevronRight className={`w-4 h-4 transform transition-transform ${showAllButton.isExpanded ? 'rotate-90' : ''}`} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}