export const APP_NAME = 'SportNet';
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MESSAGE_MAX_LENGTH = 1000;
export const POST_MAX_LENGTH = 500;
export const BIO_MAX_LENGTH = 150;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'sportnet_auth_token',
  USER_PREFERENCES: 'sportnet_user_preferences'
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
};