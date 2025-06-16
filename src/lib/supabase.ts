import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
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
  },

  async updateUser(id: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Posts
  async getPosts(limit = 20, offset = 0) {
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
  },

  async createPost(post: any) {
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
  },

  async deletePost(id: string) {
    const { error } = await supabase
      .from('posts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Post interactions
  async toggleLike(postId: string, userId: string) {
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
  },

  // Comments
  async getComments(postId: string) {
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
  },

  async createComment(comment: any) {
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
  },

  async deleteComment(id: string) {
    const { error } = await supabase
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Follows
  async followUser(followerId: string, followingId: string) {
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
  },

  async unfollowUser(followerId: string, followingId: string) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    
    if (error) throw error;
  },

  async isFollowing(followerId: string, followingId: string) {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .eq('status', 'active')
      .single();
    
    return !error && !!data;
  },

  async getFollowers(userId: string) {
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
  },

  async getFollowing(userId: string) {
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
  },

  // Messages
  async getConversations(userId: string) {
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
  },

  async getMessages(conversationId: string, limit = 50) {
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
  },

  async sendMessage(conversationId: string, senderId: string, content: string) {
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
  },

  async createOrGetConversation(user1Id: string, user2Id: string) {
    const { data, error } = await supabase.rpc('find_or_create_conversation', {
      user1_id: user1Id,
      user2_id: user2Id
    });
    
    if (error) throw error;
    return data;
  },

  // Notifications
  async getNotifications(userId: string, limit = 20) {
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
  },

  async markNotificationAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    if (error) throw error;
  },

  async markAllNotificationsAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
  },

  // Search
  async searchUsers(query: string, filters: any = {}) {
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
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    return data;
  },

  async getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
  }
};