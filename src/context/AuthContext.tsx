import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { auth, db, subscriptions } from '../lib/supabase';
import { handleApiError, sanitizeText, validateEmail, validatePassword } from '../utils';

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
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await auth.getSession();
        
        if (session?.user && mounted) {
          await loadUserData(session.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserData(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setFollowingList([]);
        setUnreadMessages(0);
        setUnreadNotifications(0);
      }
      
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load user data from database
  const loadUserData = async (supabaseUser: SupabaseUser) => {
    try {
      const userData = await db.getUser(supabaseUser.id);
      setUser(userData);

      // Load following list
      const following = await db.getFollowing(supabaseUser.id);
      setFollowingList(following.map(f => f.id));

      // Load unread counts
      await loadUnreadCounts(supabaseUser.id);

      // Subscribe to real-time notifications
      subscriptions.subscribeToNotifications(supabaseUser.id, () => {
        loadUnreadCounts(supabaseUser.id);
      });

    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    }
  };

  // Load unread counts
  const loadUnreadCounts = async (userId: string) => {
    try {
      const notifications = await db.getNotifications(userId, 50);
      const unreadCount = notifications.filter(n => !n.is_read).length;
      setUnreadNotifications(unreadCount);

      // For messages, we'd need to implement a more complex query
      // For now, using a placeholder
      setUnreadMessages(0);
    } catch (error) {
      console.error('Error loading unread counts:', error);
    }
  };

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

      const { data, error } = await auth.signInWithPassword({
        email: sanitizeText(email.toLowerCase()),
        password: password
      });

      if (error) throw error;

      if (data.user) {
        await loadUserData(data.user);
        navigate('/home');
      }
    } catch (error: any) {
      const apiError = handleApiError(error);
      setError(apiError.message);
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

      const { data, error } = await auth.signUp({
        email: sanitizeText(signupData.email.toLowerCase()),
        password: signupData.password,
        options: {
          data: {
            full_name: sanitizeText(signupData.fullName),
            role: sanitizeText(signupData.role)
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // User will be automatically created in the database via trigger
        navigate('/login', {
          state: {
            message: 'Account created successfully! Please check your email to verify your account.',
            email: signupData.email
          }
        });
      }
    } catch (error: any) {
      const apiError = handleApiError(error);
      setError(apiError.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
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
      
      // Update user table
      if (profileData.full_name || profileData.bio || profileData.location || profileData.sport) {
        await db.updateUser(user.id, {
          full_name: profileData.full_name,
          bio: profileData.bio,
          location: profileData.location,
          sport: profileData.sport,
          avatar_url: profileData.avatar_url,
          cover_image_url: profileData.cover_image_url,
          website_url: profileData.website_url
        });
      }

      // Update user profile table
      if (profileData.achievements || profileData.certifications) {
        await db.updateUserProfile(user.id, {
          achievements: profileData.achievements,
          certifications: profileData.certifications,
          experience_years: profileData.experience_years,
          skill_level: profileData.skill_level,
          position: profileData.position,
          team_size: profileData.team_size,
          founded_year: profileData.founded_year
        });
      }

      // Reload user data
      await loadUserData({ id: user.id } as SupabaseUser);
      
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
      await db.followUser(user.id, userId);
      setFollowingList(prev => [...prev, userId]);
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await db.unfollowUser(user.id, userId);
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
      // Create or get conversation
      const conversationId = await db.createOrGetConversation(user.id, recipientId);
      
      // Send message
      await db.sendMessage(conversationId, user.id, content);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await db.markNotificationAsRead(notificationId);
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user) return;
    
    try {
      await db.markAllNotificationsAsRead(user.id);
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
      unreadNotifications
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