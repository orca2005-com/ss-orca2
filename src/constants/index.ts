export const APP_NAME = 'SportNet';
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for videos
export const MESSAGE_MAX_LENGTH = 1000;
export const POST_MAX_LENGTH = 500;
export const BIO_MAX_LENGTH = 150;
export const NAME_MAX_LENGTH = 100;
export const LOCATION_MAX_LENGTH = 100;

// Security constants
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
export const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// File type restrictions
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain'];

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'sportnet_auth_token',
  USER_PREFERENCES: 'sportnet_user_preferences'
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