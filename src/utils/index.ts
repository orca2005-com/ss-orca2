import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// Date utilities
export const formatDate = (date: Date | string, formatStr: string = 'MMM d, yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export const formatRelativeTime = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    if (isToday(dateObj)) {
      return format(dateObj, 'h:mm a');
    }
    
    if (isYesterday(dateObj)) {
      return 'Yesterday';
    }
    
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return 'Invalid Date';
  }
};

// String utilities with XSS protection
export const sanitizeText = (text: string): string => {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol for security
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .trim();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (typeof text !== 'string') return '';
  if (maxLength <= 0) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  if (typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) return false;
  if (email.length > 254) return false;
  if (email.includes('..')) return false;
  if (email.startsWith('.') || email.endsWith('.')) return false;
  if (email.includes('<') || email.includes('>')) return false;
  
  return true;
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (typeof password !== 'string') {
    return { isValid: false, errors: ['Password must be a string'] };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  const commonPatterns = [
    /(.)\1{2,}/,
    /123456|654321|qwerty|password|admin/i,
    /<script|javascript:|data:|vbscript:/i,
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains common weak patterns or malicious content');
      break;
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateUrl = (url: string): boolean => {
  if (typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) return false;
    
    if (process.env.NODE_ENV === 'production') {
      const hostname = urlObj.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname.startsWith('127.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./) ||
        hostname === '0.0.0.0'
      ) {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (typeof bytes !== 'number' || bytes < 0 || !isFinite(bytes)) {
    return '0 Bytes';
  }
  
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const sizeIndex = Math.min(i, sizes.length - 1);
  return parseFloat((bytes / Math.pow(k, sizeIndex)).toFixed(2)) + ' ' + sizes[sizeIndex];
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  if (!file || !file.type) return false;
  
  const isAllowedType = allowedTypes.some(type => file.type.startsWith(type));
  if (!isAllowedType) return false;
  
  const fileName = file.name.toLowerCase();
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.jar', '.js', '.vbs', '.php', '.asp', '.jsp'];
  const hasDangerousExtension = dangerousExtensions.some(ext => fileName.endsWith(ext));
  
  return !hasDangerousExtension;
};

export const validateFileSize = (file: File, maxSizeInBytes: number): boolean => {
  if (!file) return false;
  return file.size <= maxSizeInBytes && file.size > 0;
};

// Image optimization utilities
export const getOptimizedPexelsUrl = (originalUrl: string, quality: 'low' | 'medium' | 'high' = 'medium'): string => {
  if (!originalUrl.includes('pexels.com')) {
    return originalUrl;
  }

  const qualityMap = {
    low: '?auto=compress&cs=tinysrgb&w=400&q=60',
    medium: '?auto=compress&cs=tinysrgb&w=800&q=75',
    high: '?auto=compress&cs=tinysrgb&w=1200&q=85'
  };
  
  return originalUrl.split('?')[0] + qualityMap[quality];
};

export const createPlaceholderUrl = (originalUrl: string): string => {
  if (!originalUrl.includes('pexels.com')) {
    return originalUrl;
  }
  return originalUrl.split('?')[0] + '?auto=compress&cs=tinysrgb&w=50&q=20';
};

// Local Storage utilities
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof key !== 'string' || !key.trim()) {
      console.error('Invalid storage key');
      return defaultValue || null;
    }
    
    const sanitizedKey = sanitizeText(key);
    if (sanitizedKey !== key) {
      console.error('Storage key contains invalid characters');
      return defaultValue || null;
    }
    
    try {
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage not available');
        return defaultValue || null;
      }
      
      const item = localStorage.getItem(sanitizedKey);
      if (item === null) return defaultValue || null;
      
      const parsed = JSON.parse(item);
      
      if (parsed && typeof parsed === 'object' && parsed.timestamp) {
        if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
          localStorage.removeItem(sanitizedKey);
          return defaultValue || null;
        }
        return parsed.data;
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to get from localStorage:', error);
      try {
        localStorage.removeItem(sanitizedKey);
      } catch (removeError) {
        console.error('Failed to remove corrupted data:', removeError);
      }
      return defaultValue || null;
    }
  },
  
  set: <T>(key: string, value: T, expirationHours?: number): boolean => {
    if (typeof key !== 'string' || !key.trim()) {
      console.error('Invalid storage key');
      return false;
    }
    
    const sanitizedKey = sanitizeText(key);
    if (sanitizedKey !== key) {
      console.error('Storage key contains invalid characters');
      return false;
    }
    
    try {
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage not available');
        return false;
      }
      
      const dataToStore = {
        data: value,
        timestamp: new Date().toISOString(),
        expiresAt: expirationHours ? new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString() : null
      };
      
      const serialized = JSON.stringify(dataToStore);
      
      if (serialized.length > 5 * 1024 * 1024) {
        console.error('Data too large for localStorage');
        return false;
      }
      
      localStorage.setItem(sanitizedKey, serialized);
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  },
  
  remove: (key: string): boolean => {
    if (typeof key !== 'string' || !key.trim()) {
      console.error('Invalid storage key');
      return false;
    }
    
    const sanitizedKey = sanitizeText(key);
    if (sanitizedKey !== key) {
      console.error('Storage key contains invalid characters');
      return false;
    }
    
    try {
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage not available');
        return false;
      }
      
      localStorage.removeItem(sanitizedKey);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  },
  
  clear: (): boolean => {
    try {
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage not available');
        return false;
      }
      
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
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
  name?: string;
}

export const handleApiError = (error: ApiError) => {
  const sanitizeErrorMessage = (message: string): string => {
    if (typeof message !== 'string') return 'An error occurred';
    return sanitizeText(message).slice(0, 200);
  };

  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    const firstErrorKey = Object.keys(errors)[0];
    const firstError = errors[firstErrorKey]?.[0];
    
    if (firstError) {
      return {
        message: sanitizeErrorMessage(firstError),
        code: 'VALIDATION_ERROR'
      };
    }
  }

  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return { message: 'Invalid request. Please check your input.', code: 'BAD_REQUEST' };
      case 401:
        return { message: 'Your session has expired. Please log in again.', code: 'UNAUTHORIZED' };
      case 403:
        return { message: 'You do not have permission to perform this action.', code: 'FORBIDDEN' };
      case 404:
        return { message: 'The requested resource was not found.', code: 'NOT_FOUND' };
      case 429:
        return { message: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' };
      case 500:
        return { message: 'An internal server error occurred. Please try again later.', code: 'SERVER_ERROR' };
      default:
        return { message: 'An unexpected error occurred. Please try again later.', code: 'UNKNOWN_HTTP_ERROR' };
    }
  }

  if (error.message?.toLowerCase().includes('network') || error.name === 'NetworkError') {
    return {
      message: 'Unable to connect to the server. Please check your internet connection.',
      code: 'NETWORK_ERROR'
    };
  }

  if (error.response?.data?.message) {
    return {
      message: sanitizeErrorMessage(error.response.data.message),
      code: error.response.data.code || 'API_ERROR'
    };
  }

  if (error.message) {
    return {
      message: sanitizeErrorMessage(error.message),
      code: error.code || 'UNKNOWN_ERROR'
    };
  }

  return {
    message: 'An unexpected error occurred. Please try again later.',
    code: 'UNKNOWN_ERROR'
  };
};

// Device detection
export const isMobile = (): boolean => {
  try {
    if (typeof navigator === 'undefined') return false;
    
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isMobileUA = mobileRegex.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    
    return hasTouchScreen && (isMobileUA || isSmallScreen);
  } catch (error) {
    console.error('Error detecting mobile device:', error);
    return false;
  }
};

// Rate limiting utility
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();
  
  const cleanup = () => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    for (const [key, timestamps] of requests.entries()) {
      const recentRequests = timestamps.filter(timestamp => timestamp > windowStart);
      if (recentRequests.length === 0) {
        requests.delete(key);
      } else {
        requests.set(key, recentRequests);
      }
    }
  };
  
  setInterval(cleanup, 5 * 60 * 1000);
  
  return (identifier: string): boolean => {
    const sanitizedId = sanitizeText(identifier);
    if (!sanitizedId) return false;
    
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const userRequests = requests.get(sanitizedId) || [];
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    requests.set(sanitizedId, recentRequests);
    
    return true;
  };
};

// Performance utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Input validation
export const validateInput = (value: string, type: 'text' | 'email' | 'password' | 'url', maxLength = 255): { isValid: boolean; error?: string } => {
  if (typeof value !== 'string') {
    return { isValid: false, error: 'Invalid input type' };
  }
  
  if (value.length > maxLength) {
    return { isValid: false, error: `Input too long (max ${maxLength} characters)` };
  }
  
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /on\w+=/i,
    /eval\(/i,
    /expression\(/i
  ];
  
  for (const pattern of maliciousPatterns) {
    if (pattern.test(value)) {
      return { isValid: false, error: 'Input contains potentially malicious content' };
    }
  }
  
  switch (type) {
    case 'email':
      return { isValid: validateEmail(value), error: validateEmail(value) ? undefined : 'Invalid email format' };
    case 'password':
      const passwordResult = validatePassword(value);
      return { isValid: passwordResult.isValid, error: passwordResult.errors[0] };
    case 'url':
      return { isValid: validateUrl(value), error: validateUrl(value) ? undefined : 'Invalid URL format' };
    default:
      return { isValid: true };
  }
};