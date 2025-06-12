import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-4 py-4 text-base'
};

export function Input({
  label,
  error,
  icon: Icon,
  iconPosition = 'left',
  size = 'md',
  fullWidth = true,
  className = '',
  ...props
}: InputProps) {
  const baseClasses = 'bg-dark-lighter border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 ultra-touch';
  const errorClasses = error ? 'border-red-500' : 'border-dark-light';
  const widthClasses = fullWidth ? 'w-full' : '';
  const paddingClasses = Icon ? 
    (iconPosition === 'left' ? 'pl-10 pr-4' : 'pl-4 pr-10') : 
    sizeClasses[size];

  const inputClasses = `
    ${baseClasses}
    ${errorClasses}
    ${widthClasses}
    ${paddingClasses}
    ${className}
  `.trim();

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        )}
        
        <input
          className={inputClasses}
          {...props}
        />
        
        {Icon && iconPosition === 'right' && (
          <Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}