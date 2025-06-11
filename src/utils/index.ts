import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// Date utilities
export const formatDate = (date: Date | string, formatStr: string = 'MMM d, yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
};

export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return format(dateObj, 'h:mm a');
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Validation
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Local Storage
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }
};

// Error handling
export const handleApiError = (error: any) => {
  if (error.response?.data) {
    return {
      message: error.response.data.message || 'An error occurred',
      code: error.response.data.code || 'UNKNOWN_ERROR'
    };
  }
  
  if (error.message) {
    return {
      message: error.message,
      code: 'NETWORK_ERROR'
    };
  }
  
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
};

// Device detection
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};