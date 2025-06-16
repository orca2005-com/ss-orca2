import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Not set');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Please check your VITE_SUPABASE_URL in .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Auth helpers
export const auth = supabase.auth;

// Database helpers with error handling
export const db = {
  // Users
  async getUser(id: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_profiles (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  async updateUser(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async updateUserProfile(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Posts
  async getPosts(limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:users!posts_author_id_fkey (
            id,
            full_name,
            avatar_url,
            role
          ),
          post_interactions (
            interaction_type,
            user_id
          ),
          comments (
            id
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },

  async createPost(post: any) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select(`
          *,
          author:users!posts_author_id_fkey (
            id,
            full_name,
            avatar_url,
            role
          )
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  async deletePost(id: string) {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Post interactions
  async toggleLike(postId: string, userId: string) {
    try {
      // Check if already liked
      const { data: existing } = await supabase
        .from('post_interactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('interaction_type', 'like')
        .single();

      if (existing) {
        // Unlike
        const { error } = await supabase
          .from('post_interactions')
          .delete()
          .eq('id', existing.id);
        
        if (error) throw error;
        return false;
      } else {
        // Like
        const { error } = await supabase
          .from('post_interactions')
          .insert({
            post_id: postId,
            user_id: userId,
            interaction_type: 'like'
          });
        
        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  // Comments
  async getComments(postId: string) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:users!comments_author_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  async createComment(comment: any) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert(comment)
        .select(`
          *,
          author:users!comments_author_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  async deleteComment(id: string) {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // Follows
  async followUser(followerId: string, followingId: string) {
    try {
      const { data, error } = await supabase
        .from('follows')
        .insert({
          follower_id: followerId,
          following_id: followingId,
          status: 'active'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  },

  async unfollowUser(followerId: string, followingId: string) {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  },

  async isFollowing(followerId: string, followingId: string) {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .eq('status', 'active')
        .single();
      
      return !error && !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  },

  async getFollowers(userId: string) {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower:users!follows_follower_id_fkey (
            id,
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('following_id', userId)
        .eq('status', 'active');
      
      if (error) throw error;
      return data?.map(item => item.follower) || [];
    } catch (error) {
      console.error('Error fetching followers:', error);
      return [];
    }
  },

  async getFollowing(userId: string) {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following:users!follows_following_id_fkey (
            id,
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('follower_id', userId)
        .eq('status', 'active');
      
      if (error) throw error;
      return data?.map(item => item.following) || [];
    } catch (error) {
      console.error('Error fetching following:', error);
      return [];
    }
  },

  // Messages
  async getConversations(userId: string) {
    try {
      const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation:conversations (
            id,
            type,
            name,
            updated_at,
            conversation_participants!inner (
              user:users (
                id,
                full_name,
                avatar_url
              )
            )
          ),
          last_read_at
        `)
        .eq('user_id', userId)
        .is('left_at', null)
        .order('conversation.updated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  async getMessages(conversationId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  async sendMessage(conversationId: string, senderId: string, content: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          message_type: 'text'
        })
        .select(`
          *,
          sender:users!messages_sender_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async createOrGetConversation(user1Id: string, user2Id: string) {
    try {
      const { data, error } = await supabase.rpc('find_or_create_conversation', {
        user1_id: user1Id,
        user2_id: user2Id
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating/getting conversation:', error);
      throw error;
    }
  },

  // Notifications
  async getNotifications(userId: string, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:users!notifications_sender_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async markNotificationAsRead(id: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async markAllNotificationsAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Search
  async searchUsers(query: string, filters: any = {}) {
    try {
      let queryBuilder = supabase
        .from('users')
        .select(`
          id,
          full_name,
          avatar_url,
          role,
          sport,
          location,
          user_profiles (
            skill_level
          )
        `)
        .eq('is_active', true);

      // Apply text search
      if (query) {
        queryBuilder = queryBuilder.or(`
          full_name.ilike.%${query}%,
          role.ilike.%${query}%,
          sport.ilike.%${query}%,
          location.ilike.%${query}%
        `);
      }

      // Apply filters
      if (filters.role && filters.role !== 'all') {
        queryBuilder = queryBuilder.ilike('role', `%${filters.role}%`);
      }
      if (filters.location && filters.location !== 'all') {
        queryBuilder = queryBuilder.ilike('location', `%${filters.location}%`);
      }
      if (filters.sport && filters.sport !== 'all') {
        queryBuilder = queryBuilder.ilike('sport', `%${filters.sport}%`);
      }

      const { data, error } = await queryBuilder.limit(50);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
};

// Real-time subscriptions
export const subscriptions = {
  // Subscribe to new messages in a conversation
  subscribeToMessages(conversationId: string, callback: (message: any) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to notifications
  subscribeToNotifications(userId: string, callback: (notification: any) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to new posts
  subscribeToPosts(callback: (post: any) => void) {
    return supabase
      .channel('posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        callback
      )
      .subscribe();
  }
};

// File upload helpers
export const storage = {
  async uploadFile(bucket: string, path: string, file: File) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  async getPublicUrl(bucket: string, path: string) {
    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error getting public URL:', error);
      return '';
    }
  },

  async deleteFile(bucket: string, path: string) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
};