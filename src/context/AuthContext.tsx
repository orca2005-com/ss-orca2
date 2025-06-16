import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { mockProfiles } from '../data/mockProfiles';
import { handleApiError, storage, validateEmail, validatePassword, sanitizeText, createRateLimiter, validateInput } from '../utils';
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
  updateProfile: (profileData: any) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  sendMessage: (recipientId: string, content: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Enhanced rate limiter for login attempts (5 attempts per 15 minutes)
const loginRateLimiter = createRateLimiter(5, 15 * 60 * 1000);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(3);
  const [unreadNotifications, setUnreadNotifications] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followingList, setFollowingList] = useState<string[]>([]);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = storage.get<StoredUser>(STORAGE_KEYS.AUTH_TOKEN);
        if (storedUser) {
          // Enhanced validation of stored user data
          if (!storedUser.id || !storedUser.email || !storedUser.name) {
            console.warn('Invalid stored user data');
            storage.remove(STORAGE_KEYS.AUTH_TOKEN);
            return;
          }

          // Validate email format
          if (!validateEmail(storedUser.email)) {
            console.warn('Invalid email in stored user data');
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
            
            // Additional validation
            if (!sanitizedUser.id || !sanitizedUser.email || !sanitizedUser.name) {
              console.warn('User data failed sanitization');
              storage.remove(STORAGE_KEYS.AUTH_TOKEN);
              return;
            }
            
            setUser(sanitizedUser);
            
            // Load user's following list
            const storedFollowing = storage.get<string[]>(`following_${sanitizedUser.id}`) || [];
            setFollowingList(storedFollowing);
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
      // Enhanced validation of input data
      if (!userData.email || !userData.fullName || !userData.role) {
        throw new Error('Missing required user data');
      }

      // Validate email format
      const emailValidation = validateInput(userData.email, 'email');
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error || 'Invalid email format');
      }

      // Validate name
      const nameValidation = validateInput(userData.fullName, 'text', 100);
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.error || 'Invalid name format');
      }

      // Validate role
      const roleValidation = validateInput(userData.role, 'text', 50);
      if (!roleValidation.isValid) {
        throw new Error(roleValidation.error || 'Invalid role format');
      }

      // Sanitize input data
      const sanitizedData = {
        email: sanitizeText(userData.email.toLowerCase()),
        fullName: sanitizeText(userData.fullName),
        role: sanitizeText(userData.role)
      };

      // Additional security checks
      if (!sanitizedData.email || !sanitizedData.fullName || !sanitizedData.role) {
        throw new Error('Data sanitization failed');
      }

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
      // Enhanced input validation
      if (!email || !password) {
        throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
      }

      // Validate input types
      if (typeof email !== 'string' || typeof password !== 'string') {
        throw new Error('Invalid input types');
      }

      // Sanitize inputs
      const sanitizedEmail = sanitizeText(email.toLowerCase());
      const sanitizedPassword = password; // Don't sanitize password as it may contain special chars

      // Enhanced email validation
      const emailValidation = validateInput(sanitizedEmail, 'email');
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error || 'Please enter a valid email address');
      }

      // Enhanced password validation
      const passwordValidation = validatePassword(sanitizedPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0] || ERROR_MESSAGES.WEAK_PASSWORD);
      }

      // Enhanced rate limiting check with user agent fingerprinting
      const clientId = `${sanitizedEmail}_${navigator.userAgent.slice(0, 50)}`;
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

      // Simulate API call with enhanced error handling
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

      // Load user's following list
      const storedFollowing = storage.get<string[]>(`following_${mockUser.id}`) || [];
      setFollowingList(storedFollowing);

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
      setFollowingList([]);
      
      // Clear all stored data securely
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
      
      // Enhanced validation and sanitization
      if (typeof resourceOwnerId !== 'string') return false;
      
      const sanitizedUserId = sanitizeText(user.id);
      const sanitizedResourceId = sanitizeText(resourceOwnerId);
      
      if (!sanitizedUserId || !sanitizedResourceId) return false;
      
      return sanitizedUserId === sanitizedResourceId;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      
      // Update stored user data
      const userWithExpiration: StoredUser = {
        ...updatedUser,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      storage.set(STORAGE_KEYS.AUTH_TOKEN, userWithExpiration, 24);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const followUser = async (userId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newFollowingList = [...followingList, userId];
      setFollowingList(newFollowingList);
      storage.set(`following_${user.id}`, newFollowingList);
      
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newFollowingList = followingList.filter(id => id !== userId);
      setFollowingList(newFollowingList);
      storage.set(`following_${user.id}`, newFollowingList);
      
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  };

  const isFollowing = (userId: string) => {
    return followingList.includes(userId);
  };

  const sendMessage = async (recipientId: string, content: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, this would send the message to the backend
      console.log('Message sent:', { recipientId, content, senderId: user.id });
      
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    // In a real app, this would update the backend
    console.log('Notification marked as read:', notificationId);
  };

  const markAllNotificationsAsRead = () => {
    setUnreadNotifications(0);
    // In a real app, this would update the backend
    console.log('All notifications marked as read');
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
      createUserAccount,
      updateProfile,
      followUser,
      unfollowUser,
      isFollowing,
      sendMessage,
      markNotificationAsRead,
      markAllNotificationsAsRead
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