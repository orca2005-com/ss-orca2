import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validatePassword, sanitizeText } from '../utils';

interface User {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  role: string;
  sport?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  cover_image_url?: string;
  website_url?: string;
  is_verified: boolean;
  user_profiles?: {
    achievements: string[];
    certifications: string[];
    stats: {
      followers: number;
      following: number;
      posts: number;
    };
  };
}

interface SignupData {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  updateProfile: (profileData: any) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  sendMessage: (recipientId: string, content: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  unreadMessages: number;
  unreadNotifications: number;
  canModify: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(2);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate inputs
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0] || 'Invalid password');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user data
      const mockUser: User = {
        id: '1',
        email: sanitizeText(email.toLowerCase()),
        full_name: 'John Smith',
        role: 'player',
        sport: 'Basketball',
        location: 'New York, USA',
        bio: 'Professional basketball player with 5+ years of experience.',
        avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
        cover_image_url: 'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg',
        is_verified: false,
        user_profiles: {
          achievements: ['Regional Championship MVP 2023', 'All-Star Team Selection 2022'],
          certifications: [],
          stats: { followers: 1234, following: 89, posts: 45 }
        }
      };

      setUser(mockUser);
      navigate('/home');
    } catch (error: any) {
      setError(error.message || 'Invalid email or password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (signupData: SignupData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate inputs
      if (!validateEmail(signupData.email)) {
        throw new Error('Please enter a valid email address');
      }

      const passwordValidation = validatePassword(signupData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0] || 'Password does not meet requirements');
      }

      if (!signupData.fullName.trim()) {
        throw new Error('Full name is required');
      }

      if (!signupData.role.trim()) {
        throw new Error('Role is required');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to login with success message
      navigate('/login', {
        state: {
          message: 'Account created successfully! Please sign in with your credentials.',
          email: signupData.email
        }
      });
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setFollowingList([]);
      setUnreadMessages(0);
      setUnreadNotifications(0);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user state
      setUser(prev => prev ? { ...prev, ...profileData } : null);
      
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
      await new Promise(resolve => setTimeout(resolve, 500));
      setFollowingList(prev => [...prev, userId]);
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
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
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Message sent to:', recipientId, content);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
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
      signup,
      logout,
      isAuthenticated: !!user,
      isLoading,
      error,
      clearError,
      updateProfile,
      followUser,
      unfollowUser,
      isFollowing,
      sendMessage,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      unreadMessages,
      unreadNotifications,
      canModify: true
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