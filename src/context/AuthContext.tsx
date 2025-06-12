import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { mockProfiles } from '../data/mockProfiles';
import { handleApiError, storage } from '../utils';
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
          // Check if token is expired
          if (storedUser.expiresAt && new Date(storedUser.expiresAt) > new Date()) {
            setUser(storedUser);
          } else {
            // Token expired, clear storage and redirect to login
            storage.remove(STORAGE_KEYS.AUTH_TOKEN);
            navigate('/login', { state: { message: 'Your session has expired. Please log in again.' } });
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: userData.email,
        name: userData.fullName,
        role: userData.role,
      };
      
      return newUser;
    } catch (error) {
      throw new Error('Failed to create user account');
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

      const signupData = storage.get<SignupData>('signupData');
      
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

      // Simulate API call with error handling
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.05) {
            reject(new Error(ERROR_MESSAGES.SERVER_ERROR));
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
      
      try {
        storage.set(STORAGE_KEYS.AUTH_TOKEN, userWithExpiration);
      } catch (storageError) {
        console.warn('Failed to save user to localStorage:', storageError);
        throw new Error('Failed to save session');
      }

      navigate('/home');
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