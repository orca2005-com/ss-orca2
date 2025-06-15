export const APP_NAME = 'SportSYNC';
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for videos
export const MESSAGE_MAX_LENGTH = 1000;
export const POST_MAX_LENGTH = 500;
export const BIO_MAX_LENGTH = 150;
export const NAME_MAX_LENGTH = 100;
export const LOCATION_MAX_LENGTH = 100;

// Enhanced security constants
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
export const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
export const CSRF_TOKEN_LENGTH = 32;
export const MAX_RETRY_ATTEMPTS = 3;
export const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

// Enhanced file type restrictions
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain'];
export const BLOCKED_FILE_EXTENSIONS = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.jar', '.js', '.vbs', '.php', '.asp', '.jsp'];

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'sportsync_auth_token',
  USER_PREFERENCES: 'sportsync_user_preferences',
  CSRF_TOKEN: 'sportsync_csrf_token'
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
  VIDEO_TOO_LARGE: `Video size must be less than ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`,
  INVALID_FILE_TYPE: 'File type not supported',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  ACCOUNT_LOCKED: 'Account temporarily locked due to multiple failed login attempts.',
  WEAK_PASSWORD: 'Password does not meet security requirements.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  REQUIRED_FIELD: 'This field is required.',
  TEXT_TOO_LONG: 'Text exceeds maximum length.',
  INVALID_URL: 'Please enter a valid URL.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  CONTENT_BLOCKED: 'Content blocked for security reasons.',
  MALICIOUS_CONTENT: 'Potentially malicious content detected.',
  INVALID_INPUT: 'Invalid input detected.',
  SANITIZATION_FAILED: 'Input sanitization failed.',
  SUSPICIOUS_ACTIVITY: 'Suspicious activity detected.'
} as const;

// API endpoints (for future use)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password'
  },
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE: '/api/user/update',
    DELETE: '/api/user/delete',
    UPLOAD_AVATAR: '/api/user/avatar'
  },
  POSTS: {
    LIST: '/api/posts',
    CREATE: '/api/posts',
    UPDATE: '/api/posts/:id',
    DELETE: '/api/posts/:id',
    LIKE: '/api/posts/:id/like',
    COMMENT: '/api/posts/:id/comments'
  },
  MESSAGES: {
    LIST: '/api/messages',
    SEND: '/api/messages',
    DELETE: '/api/messages/:id',
    MARK_READ: '/api/messages/:id/read'
  },
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: '/api/notifications/:id/read',
    MARK_ALL_READ: '/api/notifications/read-all',
    DELETE: '/api/notifications/:id'
  }
} as const;

// Enhanced rate limiting configurations
export const RATE_LIMITS = {
  LOGIN: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  REGISTER: { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  POST_CREATE: { requests: 10, windowMs: 60 * 1000 }, // 10 posts per minute
  MESSAGE_SEND: { requests: 30, windowMs: 60 * 1000 }, // 30 messages per minute
  FILE_UPLOAD: { requests: 5, windowMs: 60 * 1000 }, // 5 uploads per minute
  PASSWORD_RESET: { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  SEARCH: { requests: 100, windowMs: 60 * 1000 }, // 100 searches per minute
  PROFILE_UPDATE: { requests: 10, windowMs: 60 * 1000 } // 10 updates per minute
} as const;

// Enhanced Content Security Policy
export const CSP_DIRECTIVES = {
  DEFAULT_SRC: ["'self'"],
  SCRIPT_SRC: ["'self'", "'unsafe-inline'"],
  STYLE_SRC: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  IMG_SRC: ["'self'", "data:", "https:", "blob:"],
  FONT_SRC: ["'self'", "https://fonts.gstatic.com"],
  CONNECT_SRC: ["'self'", "https:"],
  MEDIA_SRC: ["'self'", "blob:", "https:"],
  FRAME_SRC: ["'none'"],
  OBJECT_SRC: ["'none'"],
  BASE_URI: ["'self'"],
  FORM_ACTION: ["'self'"],
  FRAME_ANCESTORS: ["'none'"],
  UPGRADE_INSECURE_REQUESTS: []
} as const;

// Enhanced feature flags
export const FEATURES = {
  ENABLE_VIDEO_UPLOAD: true,
  ENABLE_FILE_SHARING: true,
  ENABLE_REAL_TIME_MESSAGING: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: false, // Disabled for privacy
  ENABLE_THIRD_PARTY_LOGIN: false, // Disabled for security
  ENABLE_CONTENT_MODERATION: true,
  ENABLE_RATE_LIMITING: true,
  ENABLE_CSRF_PROTECTION: true,
  ENABLE_XSS_PROTECTION: true,
  ENABLE_INPUT_SANITIZATION: true,
  ENABLE_URL_VALIDATION: true
} as const;

// Environment-specific configurations
export const CONFIG = {
  DEVELOPMENT: {
    API_BASE_URL: 'http://localhost:3000',
    ENABLE_DEBUG_LOGS: true,
    ENABLE_MOCK_DATA: true,
    STRICT_CSP: false
  },
  PRODUCTION: {
    API_BASE_URL: 'https://api.sportsync.com',
    ENABLE_DEBUG_LOGS: false,
    ENABLE_MOCK_DATA: false,
    STRICT_CSP: true
  }
} as const;

// Security headers
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
} as const;