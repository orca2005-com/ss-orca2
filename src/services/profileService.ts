import { supabase, supabaseHelpers } from '../lib/supabase';
import { sanitizeText } from '../utils';

export interface ProfileData {
  full_name: string;
  bio?: string;
  sport?: string;
  position?: string;
  location?: string;
  website_url?: string;
  avatar_url?: string;
  cover_image_url?: string;
  is_private?: boolean;
}

export interface Achievement {
  id?: string;
  title: string;
  description?: string;
  achievement_type?: string;
  date_achieved?: string;
  issuing_organization?: string;
}

class ProfileService {
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          users!inner(role, email, status)
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw new Error('Failed to fetch profile');
    }
  }

  async updateProfile(userId: string, profileData: ProfileData) {
    try {
      // Get current user to ensure they're authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        throw new Error('Unauthorized: Cannot update another user\'s profile');
      }

      // Sanitize inputs
      const sanitizedData = {
        full_name: sanitizeText(profileData.full_name),
        bio: profileData.bio ? sanitizeText(profileData.bio) : null,
        sport: profileData.sport ? sanitizeText(profileData.sport) : null,
        position: profileData.position ? sanitizeText(profileData.position) : null,
        location: profileData.location ? sanitizeText(profileData.location) : null,
        website_url: profileData.website_url || null,
        avatar_url: profileData.avatar_url || null,
        cover_image_url: profileData.cover_image_url || null,
        is_private: profileData.is_private || false,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(sanitizedData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      // Ensure user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        throw new Error('Unauthorized: Cannot upload avatar for another user');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Upload file
      await supabaseHelpers.uploadFile('avatars', fileName, file);

      // Get public URL
      const publicUrl = supabaseHelpers.getPublicUrl('avatars', fileName);

      // Update profile with new avatar URL
      await this.updateProfile(userId, { 
        full_name: '', // This will be ignored in the update
        avatar_url: publicUrl 
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      throw new Error('Failed to upload avatar');
    }
  }

  async uploadCoverImage(userId: string, file: File): Promise<string> {
    try {
      // Ensure user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        throw new Error('Unauthorized: Cannot upload cover image for another user');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/cover.${fileExt}`;

      // Upload file
      await supabaseHelpers.uploadFile('covers', fileName, file);

      // Get public URL
      const publicUrl = supabaseHelpers.getPublicUrl('covers', fileName);

      // Update profile with new cover URL
      await this.updateProfile(userId, { 
        full_name: '', // This will be ignored in the update
        cover_image_url: publicUrl 
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Upload cover image error:', error);
      throw new Error('Failed to upload cover image');
    }
  }

  async getAchievements(userId: string) {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      console.error('Get achievements error:', error);
      throw new Error('Failed to fetch achievements');
    }
  }

  async addAchievement(userId: string, achievement: Achievement) {
    try {
      // Ensure user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        throw new Error('Unauthorized: Cannot add achievement for another user');
      }

      const sanitizedAchievement = {
        user_id: userId,
        title: sanitizeText(achievement.title),
        description: achievement.description ? sanitizeText(achievement.description) : null,
        achievement_type: achievement.achievement_type || 'personal',
        date_achieved: achievement.date_achieved || null,
        issuing_organization: achievement.issuing_organization ? sanitizeText(achievement.issuing_organization) : null,
        verification_status: 'unverified',
        is_featured: false,
        display_order: 0
      };

      const { data, error } = await supabase
        .from('achievements')
        .insert(sanitizedAchievement)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Add achievement error:', error);
      throw new Error('Failed to add achievement');
    }
  }

  async deleteAchievement(achievementId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', achievementId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Delete achievement error:', error);
      throw new Error('Failed to delete achievement');
    }
  }

  async searchUsers(query: string, filters?: {
    sport?: string;
    role?: string;
    location?: string;
  }) {
    try {
      const { data, error } = await supabase.rpc('search_users', {
        search_query: sanitizeText(query),
        sport_filter: filters?.sport ? sanitizeText(filters.sport) : null,
        role_filter: filters?.role ? sanitizeText(filters.role) : null,
        location_filter: filters?.location ? sanitizeText(filters.location) : null,
        limit_count: 50
      });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      console.error('Search users error:', error);
      throw new Error('Failed to search users');
    }
  }

  async getConnections(userId: string) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          requester:profiles!connections_requester_id_fkey(full_name, avatar_url, sport, location),
          addressee:profiles!connections_addressee_id_fkey(full_name, avatar_url, sport, location)
        `)
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      console.error('Get connections error:', error);
      throw new Error('Failed to fetch connections');
    }
  }

  async sendConnectionRequest(requesterId: string, addresseeId: string, message?: string) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: requesterId,
          addressee_id: addresseeId,
          status: 'pending',
          connection_type: 'general',
          message: message ? sanitizeText(message) : null
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Send connection request error:', error);
      throw new Error('Failed to send connection request');
    }
  }

  async respondToConnectionRequest(connectionId: string, status: 'accepted' | 'rejected') {
    try {
      const { data, error } = await supabase
        .from('connections')
        .update({
          status,
          responded_at: new Date().toISOString()
        })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Respond to connection request error:', error);
      throw new Error('Failed to respond to connection request');
    }
  }
}

export const profileService = new ProfileService();