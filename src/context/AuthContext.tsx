import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { mockProfiles } from '../data/mockProfiles';
import { handleApiError, storage } from '../utils';
import { STORAGE_KEYS, ERROR_MESSAGES } from '../constants';

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
  createUserAccount: (userData: any) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = storage.get<User>(STORAGE_KEYS.AUTH_TOKEN);
      return savedUser;
    } catch (error) {
      console.error('Error loading saved user:', error);
      return null;
    }
  });
  
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let messageInterval: NodeJS.Timeout;
    let notificationInterval: NodeJS.Timeout;

    try {
      messageInterval = setInterval(() => {
        try {
          setUnreadMessages(prev => Math.floor(Math.random() * 5));
        } catch (error) {
          console.error('Error updating messages:', error);
        }
      }, 5000);

      notificationInterval = setInterval(() => {
        try {
          setUnreadNotifications(prev => Math.floor(Math.random() * 8));
        } catch (error) {
          console.error('Error updating notifications:', error);
        }
      }, 7000);
    } catch (error) {
      console.error('Error setting up intervals:', error);
    }

    return () => {
      if (messageInterval) clearInterval(messageInterval);
      if (notificationInterval) clearInterval(notificationInterval);
    };
  }, []);

  const createUserAccount = async (userData: any): Promise<User> => {
    try {
      const userId = Date.now().toString();
      
      const newUser: User = {
        id: userId,
        email: userData.email,
        name: userData.fullName,
        role: userData.role,
      };

      const newProfile = {
        id: userId,
        name: userData.fullName,
        role: userData.role,
        avatar: getDefaultAvatar(userData.role),
        coverImage: getDefaultCoverImage(userData.role),
        sport: userData.sport || getDefaultSport(userData.role),
        location: userData.location || 'Location not set',
        bio: userData.bio || getBioByRole(userData.role),
        stats: {
          followers: 0,
          connections: 0
        },
        achievements: userData.achievements || [],
        certifications: shouldHaveCertifications(userData.role) ? (userData.certifications || []) : undefined,
        posts: [],
        media: [],
        isPrivate: false,
        connections: [],
        externalLink: userData.website || undefined
      };

      (mockProfiles as any)[userId] = newProfile;

      return newUser;
    } catch (error) {
      console.error('Error creating user account:', error);
      throw new Error('Failed to create account');
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!email || !password) {
        throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
      }

      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const signupData = storage.get('signupData');
      
      let mockUser: User;
      
      if (signupData && signupData.email === email) {
        mockUser = await createUserAccount(signupData);
        storage.remove('signupData');
      } else {
        mockUser = {
          id: '1',
          email,
          name: mockProfiles['1'].name,
          role: mockProfiles['1'].role,
        };
      }

      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.05) {
            reject(new Error(ERROR_MESSAGES.SERVER_ERROR));
          } else {
            resolve(true);
          }
        }, 1000);
      });

      setUser(mockUser);
      
      try {
        storage.set(STORAGE_KEYS.AUTH_TOKEN, mockUser);
      } catch (storageError) {
        console.warn('Failed to save user to localStorage:', storageError);
      }

      navigate('/home');
    } catch (error) {
      const apiError = handleApiError(error);
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
      
      try {
        storage.remove(STORAGE_KEYS.AUTH_TOKEN);
        storage.remove(STORAGE_KEYS.USER_PREFERENCES);
        storage.remove('signupData');
      } catch (storageError) {
        console.warn('Failed to clear localStorage:', storageError);
      }
      
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login');
    }
  };

  const canModify = (resourceOwnerId: string) => {
    try {
      if (!user) return false;
      return user.id === resourceOwnerId;
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

function getDefaultAvatar(role: string): string {
  const lowerRole = role.toLowerCase();
  if (lowerRole.includes('team') || lowerRole.includes('club')) {
    return 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg';
  }
  if (lowerRole.includes('coach') || lowerRole.includes('trainer')) {
    return 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg';
  }
  return 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg';
}

function getDefaultCoverImage(role: string): string {
  const lowerRole = role.toLowerCase();
  if (lowerRole.includes('team') || lowerRole.includes('club')) {
    return 'https://images.pexels.com/photos/869258/pexels-photo-869258.jpeg';
  }
  if (lowerRole.includes('coach') || lowerRole.includes('trainer')) {
    return 'https://images.pexels.com/photos/2277981/pexels-photo-2277981.jpeg';
  }
  return 'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg';
}

function getDefaultSport(role: string): string {
  const lowerRole = role.toLowerCase();
  if (lowerRole.includes('nutritionist')) return 'Nutrition & Wellness';
  if (lowerRole.includes('physiotherapist') || lowerRole.includes('physio')) return 'Sports Medicine';
  if (lowerRole.includes('psychologist')) return 'Mental Performance';
  if (lowerRole.includes('journalist')) return 'Sports Media';
  if (lowerRole.includes('agent')) return 'Athlete Representation';
  return 'General Sports';
}

function getBioByRole(role: string): string {
  const lowerRole = role.toLowerCase();
  if (lowerRole.includes('team') || lowerRole.includes('club')) {
    return 'Building champions through teamwork, dedication, and sporting excellence.';
  }
  if (lowerRole.includes('coach') || lowerRole.includes('trainer')) {
    return 'Experienced coach committed to developing talent and achieving success.';
  }
  if (lowerRole.includes('nutritionist')) {
    return 'Sports nutrition specialist helping athletes optimize their performance through proper nutrition.';
  }
  if (lowerRole.includes('physiotherapist') || lowerRole.includes('physio')) {
    return 'Sports physiotherapist dedicated to injury prevention and rehabilitation for athletes.';
  }
  if (lowerRole.includes('psychologist')) {
    return 'Sports psychologist focused on mental performance and athlete wellbeing.';
  }
  if (lowerRole.includes('journalist')) {
    return 'Sports journalist covering the latest news and stories in the sports world.';
  }
  if (lowerRole.includes('agent')) {
    return 'Sports agent representing athletes and helping them achieve their career goals.';
  }
  return 'Passionate professional dedicated to excellence and continuous improvement in sports.';
}

function shouldHaveCertifications(role: string): boolean {
  const lowerRole = role.toLowerCase();
  return lowerRole.includes('coach') || lowerRole.includes('trainer') || 
         lowerRole.includes('nutritionist') || lowerRole.includes('physiotherapist') ||
         lowerRole.includes('psychologist') || lowerRole.includes('therapist');
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}