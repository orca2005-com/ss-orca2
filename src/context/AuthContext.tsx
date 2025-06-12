import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { mockProfiles } from '../data/mockProfiles';
import { handleApiError, storage, validateEmail, validatePassword, sanitizeText, createRateLimiter } from '../utils';
import { STORAGE_KEYS, ERROR_MESSAGES } from '../constants';

interface StoredUser extends User {
  expiresAt: string;
}

interface SignupData {
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  canModify: (resourceOwnerId: string) => boolean;
  unreadMessages: number;
  unreadNotifications: number;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  createUserAccount: (userData: SignupData) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Rate limiter for login attempts (5 attempts per 15 minutes)
const loginRateLimiter = createRateLimiter(5, 15 * 60 * 1000);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = storage.get<StoredUser>(STORAGE_KEYS.AUTH_TOKEN);
        if (storedUser) {
          // Validate stored user data
          if (!storedUser.id || !storedUser.email || !storedUser.name) {
            console.warn('Invalid stored user data');
            storage.remove(STORAGE_KEYS.AUTH_TOKEN);
            return;
          }

          // Check if token is expired
          if (storedUser.expiresAt && new Date(storedUser.expiresAt) > new Date()) {
            // Sanitize user data
            const sanitizedUser: User = {
              id: sanitizeText(storedUser.id),
              email: sanitizeText(storedUser.email),
              name: sanitizeText(storedUser.name),
              role: sanitizeText(storedUser.role)
            };
            setUser(sanitizedUser);
          } else {
            // Token expired, clear storage and redirect to login
            storage.remove(STORAGE_KEYS.AUTH_TOKEN);
            navigate('/login', { 
              state: { message: 'Your session has expired. Please log in again.' },
              replace: true 
            });
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      }
    };

    checkAuth();
  }, [navigate]);

  const createUserAccount = async (userData: SignupData): Promise<User> => {
    try {
      // Validate input data
      if (!userData.email || !userData.fullName || !userData.role) {
        throw new Error('Missing required user data');
      }

      if (!validateEmail(userData.email)) {
        throw new Error('Invalid email format');
      }

      // Sanitize input data
      const sanitizedData = {
        email: sanitizeText(userData.email.toLowerCase()),
        fullName: sanitizeText(userData.fullName),
        role: sanitizeText(userData.role)
      };

      // Simulate API call with validation
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate validation errors
          if (sanitizedData.email === 'test@blocked.com') {
            reject(new Error('This email is not allowed'));
            return;
          }
          resolve(true);
        }, 1000);
      });
      
      const newUser: User = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        email: sanitizedData.email,
        name: sanitizedData.fullName,
        role: sanitizedData.role,
      };
      
      return newUser;
    } catch (error) {
      console.error('Error creating user account:', error);
      throw new Error('Failed to create user account');
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Input validation
      if (!email || !password) {
        throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
      }

      // Sanitize inputs
      const sanitizedEmail = sanitizeText(email.toLowerCase());
      const sanitizedPassword = password; // Don't sanitize password as it may contain special chars

      // Validate email format
      if (!validateEmail(sanitizedEmail)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password
      const passwordValidation = validatePassword(sanitizedPassword);
      if (!passwordValidation.isValid) {
        throw new Error('Password does not meet security requirements');
      }

      // Rate limiting check
      const clientId = `${sanitizedEmail}_${navigator.userAgent}`;
      if (!loginRateLimiter(clientId)) {
        throw new Error('Too many login attempts. Please try again in 15 minutes.');
      }

      // Get signup data if exists
      const signupData = storage.get<SignupData>('signupData');
      
      let mockUser: User;
      
      if (signupData && signupData.email === sanitizedEmail) {
        mockUser = await createUserAccount(signupData);
        storage.remove('signupData');
      } else {
        // Use existing mock user
        const profile = Object.values(mockProfiles).find(p => 
          p.name.toLowerCase().includes('john') || p.id === '1'
        );
        
        if (!profile) {
          throw new Error('User not found');
        }

        mockUser = {
          id: profile.id,
          email: sanitizedEmail,
          name: profile.name,
          role: profile.role,
        };
      }

      // Simulate API call with error handling
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate various error conditions
          if (Math.random() < 0.02) { // 2% chance of server error
            reject(new Error(ERROR_MESSAGES.SERVER_ERROR));
          } else if (sanitizedEmail === 'blocked@example.com') {
            reject(new Error('This account has been suspended'));
          } else if (sanitizedPassword === 'wrongpassword') {
            reject(new Error('Invalid credentials'));
          } else {
            resolve(true);
          }
        }, 1000);
      });

      // Add expiration time to user object (24 hours from now)
      const userWithExpiration: StoredUser = {
        ...mockUser,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      setUser(mockUser);
      
      // Store user data securely
      const stored = storage.set(STORAGE_KEYS.AUTH_TOKEN, userWithExpiration, 24);
      if (!stored) {
        console.warn('Failed to save user session');
        // Continue anyway as user is logged in
      }

      navigate('/home', { replace: true });
    } catch (error) {
      const apiError = handleApiError(error as any);
      setError(apiError.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      setUnreadMessages(0);
      setUnreadNotifications(0);
      setError(null);
      
      // Clear all stored data
      const keysToRemove = [
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_PREFERENCES,
        'signupData'
      ];
      
      keysToRemove.forEach(key => {
        try {
          storage.remove(key);
        } catch (storageError) {
          console.warn(`Failed to clear ${key}:`, storageError);
        }
      });
      
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      // Force navigation even if there's an error
      navigate('/login', { replace: true });
    }
  };

  const canModify = (resourceOwnerId: string) => {
    try {
      if (!user || !resourceOwnerId) return false;
      
      // Sanitize inputs
      const sanitizedUserId = sanitizeText(user.id);
      const sanitizedResourceId = sanitizeText(resourceOwnerId);
      
      return sanitizedUserId === sanitizedResourceId;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user, 
      canModify,
      unreadMessages,
      unreadNotifications,
      isLoading,
      error,
      clearError,
      createUserAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}