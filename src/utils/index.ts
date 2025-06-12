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
interface ApiError {
  response?: {
    data?: {
      message?: string;
      code?: string;
      errors?: Record<string, string[]>;
    };
    status?: number;
  };
  message?: string;
  code?: string;
}

export const handleApiError = (error: ApiError) => {
  // Handle validation errors
  if (error.response?.data?.errors) {
    const firstError = Object.values(error.response.data.errors)[0][0];
    return {
      message: firstError,
      code: 'VALIDATION_ERROR'
    };
  }

  // Handle specific HTTP status codes
  if (error.response?.status) {
    switch (error.response.status) {
      case 401:
        return {
          message: 'Your session has expired. Please log in again.',
          code: 'UNAUTHORIZED'
        };
      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          code: 'FORBIDDEN'
        };
      case 404:
        return {
          message: 'The requested resource was not found.',
          code: 'NOT_FOUND'
        };
      case 429:
        return {
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMITED'
        };
      case 500:
        return {
          message: 'An internal server error occurred. Please try again later.',
          code: 'SERVER_ERROR'
        };
    }
  }

  // Handle network errors
  if (error.message?.includes('Network Error')) {
    return {
      message: 'Unable to connect to the server. Please check your internet connection.',
      code: 'NETWORK_ERROR'
    };
  }

  // Handle timeout errors
  if (error.message?.includes('timeout')) {
    return {
      message: 'The request timed out. Please try again.',
      code: 'TIMEOUT_ERROR'
    };
  }

  // Handle specific error codes
  if (error.code) {
    switch (error.code) {
      case 'ECONNABORTED':
        return {
          message: 'The request was aborted. Please try again.',
          code: 'ABORTED_ERROR'
        };
      case 'ERR_NETWORK':
        return {
          message: 'Network error. Please check your connection.',
          code: 'NETWORK_ERROR'
        };
    }
  }

  // Handle custom error messages
  if (error.response?.data?.message) {
    return {
      message: error.response.data.message,
      code: error.response.data.code || 'UNKNOWN_ERROR'
    };
  }

  // Fallback error
  return {
    message: 'An unexpected error occurred. Please try again later.',
    code: 'UNKNOWN_ERROR'
  };
};

// Device detection
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};