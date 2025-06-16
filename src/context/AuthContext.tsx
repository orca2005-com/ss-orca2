import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { apiService } from '../services/api';
import { handleApiError, storage, validateEmail, validatePassword, sanitizeText } from '../utils';
import { STORAGE_KEYS, ERROR_MESSAGES } from '../constants';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followingList, setFollowingList] = useState<string[]>([]);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          // Validate token with backend
          const userData = await apiService.getCurrentUser();
          setUser(userData);
          
          // Load user's following list
          const following = await apiService.getFollowing(userData.id);
          setFollowingList(following.map((f: any) => f.id));
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      }
    };

    checkAuth();
  }, []);

  const createUserAccount = async (userData: SignupData): Promise<User> => {
    try {
      // Enhanced validation of input data
      if (!userData.email || !userData.fullName || !userData.role) {
        throw new Error('Missing required user data');
      }

      // Validate email format
      if (!validateEmail(userData.email)) {
        throw new Error('Invalid email format');
      }

      // Sanitize input data
      const sanitizedData = {
        email: sanitizeText(userData.email.toLowerCase()),
        fullName: sanitizeText(userData.fullName),
        role: sanitizeText(userData.role)
      };

      // Create user via API
      const newUser = await apiService.register(sanitizedData);
      return newUser;
    } catch (error) {
      console.error('Error creating user account:', error);
      throw error;
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

      // Sanitize inputs
      const sanitizedEmail = sanitizeText(email.toLowerCase());

      // Enhanced email validation
      if (!validateEmail(sanitizedEmail)) {
        throw new Error('Please enter a valid email address');
      }

      // Enhanced password validation
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0] || ERROR_MESSAGES.WEAK_PASSWORD);
      }

      // Login via API
      const response = await apiService.login(sanitizedEmail, password);
      
      // Store auth token
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.token, 24);
      
      // Set user data
      setUser(response.user);
      
      // Load user's following list
      const following = await apiService.getFollowing(response.user.id);
      setFollowingList(following.map((f: any) => f.id));

      navigate('/home', { replace: true });
    } catch (error) {
      const apiError = handleApiError(error as any);
      setError(apiError.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setUnreadMessages(0);
      setUnreadNotifications(0);
      setError(null);
      setFollowingList([]);
      
      // Clear all stored data
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      storage.remove(STORAGE_KEYS.USER_PREFERENCES);
      
      navigate('/login', { replace: true });
    }
  };

  const canModify = (resourceOwnerId: string) => {
    try {
      if (!user || !resourceOwnerId) return false;
      return user.id === resourceOwnerId;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setIsLoading(true);
      const updatedUser = await apiService.updateProfile(profileData);
      setUser(updatedUser);
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
      await apiService.followUser(userId);
      setFollowingList(prev => [...prev, userId]);
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await apiService.unfollowUser(userId);
      setFollowingList(prev => prev.filter(id => id !== userId));
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
      // Create or get existing chat
      const chat = await apiService.createChat([user.id, recipientId]);
      
      // Send message
      await apiService.sendMessage(chat.id, content);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setUnreadNotifications(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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