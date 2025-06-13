import { supabase } from '../lib/supabase';
import { validateEmail, validatePassword, sanitizeText } from '../utils';
import { ERROR_MESSAGES } from '../constants';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  profile?: {
    full_name: string;
    avatar_url?: string;
    sport?: string;
    location?: string;
  };
}

class AuthService {
  async signUp({ email, password, fullName, role }: SignUpData): Promise<User> {
    try {
      // Validate inputs
      const emailValidation = validateEmail(email);
      if (!emailValidation) {
        throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0] || ERROR_MESSAGES.WEAK_PASSWORD);
      }

      // Sanitize inputs
      const sanitizedEmail = sanitizeText(email.toLowerCase());
      const sanitizedFullName = sanitizeText(fullName);
      const sanitizedRole = sanitizeText(role);

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: password,
        options: {
          data: {
            full_name: sanitizedFullName,
            role: sanitizedRole
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Create user record in users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: sanitizedEmail,
          role: sanitizedRole,
          status: 'active'
        });

      if (userError) {
        console.error('Error creating user record:', userError);
        // Don't throw here as auth user is already created
      }

      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: sanitizedFullName,
          display_name: sanitizedFullName.split(' ')[0],
          is_private: false,
          privacy_settings: {
            profile_visibility: 'public',
            contact_visibility: 'connections',
            activity_visibility: 'public'
          }
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      return {
        id: authData.user.id,
        email: sanitizedEmail,
        role: sanitizedRole,
        profile: {
          full_name: sanitizedFullName
        }
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  }

  async signIn({ email, password }: SignInData): Promise<User> {
    try {
      // Validate inputs
      if (!validateEmail(email)) {
        throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
      }

      const sanitizedEmail = sanitizeText(email.toLowerCase());

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: password
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Authentication failed');
      }

      // Update last login
      await supabase
        .from('users')
        .update({ 
          last_login: new Date().toISOString(),
          login_attempts: 0,
          locked_until: null
        })
        .eq('id', authData.user.id);

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      // Get user role from users table
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      return {
        id: authData.user.id,
        email: authData.user.email!,
        role: userData?.role || 'player',
        profile: profile ? {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          sport: profile.sport,
          location: profile.location
        } : undefined
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Authentication failed');
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get user role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email!,
        role: userData?.role || 'player',
        profile: profile ? {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          sport: profile.sport,
          location: profile.location
        } : undefined
      };
    } catch (error: any) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      if (!validateEmail(email)) {
        throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
      }

      const { error } = await supabase.auth.resetPasswordForEmail(
        sanitizeText(email.toLowerCase()),
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      );

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to send reset email');
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0] || ERROR_MESSAGES.WEAK_PASSWORD);
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();