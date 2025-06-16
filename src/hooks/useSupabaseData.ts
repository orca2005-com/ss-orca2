import { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Hook for fetching posts
export function usePosts(limit = 20) {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await db.getPosts(limit);
      
      // Transform data to match component expectations
      const transformedPosts = data.map(post => ({
        id: post.id,
        content: post.content,
        media: post.media_urls?.map((url, index) => ({
          url,
          type: post.media_types?.[index] || 'image'
        })) || [],
        author: {
          id: post.author.id,
          name: post.author.full_name,
          avatar: post.author.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
          role: post.author.role
        },
        likes: post.post_interactions?.filter(i => i.interaction_type === 'like').length || 0,
        comments: post.comments?.length || 0,
        shares: post.post_interactions?.filter(i => i.interaction_type === 'share').length || 0,
        timestamp: new Date(post.created_at)
      }));

      setPosts(transformedPosts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [limit]);

  const createPost = async (content: string, mediaFiles: File[] = []) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // For now, we'll use placeholder URLs for media
      // In production, you'd upload files to Supabase Storage first
      const mediaUrls = mediaFiles.map(file => URL.createObjectURL(file));
      const mediaTypes = mediaFiles.map(file => 
        file.type.startsWith('video/') ? 'video' : 'image'
      );

      const newPost = await db.createPost({
        author_id: user.id,
        content,
        media_urls: mediaUrls,
        media_types: mediaTypes,
        visibility: 'public'
      });

      // Add to local state
      const transformedPost = {
        id: newPost.id,
        content: newPost.content,
        media: mediaUrls.map((url, index) => ({
          url,
          type: mediaTypes[index]
        })),
        author: {
          id: newPost.author.id,
          name: newPost.author.full_name,
          avatar: newPost.author.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
          role: newPost.author.role
        },
        likes: 0,
        comments: 0,
        shares: 0,
        timestamp: new Date(newPost.created_at)
      };

      setPosts(prev => [transformedPost, ...prev]);
      return transformedPost;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await db.deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const isLiked = await db.toggleLike(postId, user.id);
      
      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: isLiked ? post.likes + 1 : post.likes - 1 }
          : post
      ));

      return isLiked;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    posts,
    isLoading,
    error,
    createPost,
    deletePost,
    toggleLike,
    refetch: loadPosts
  };
}

// Hook for fetching user profile
export function useProfile(userId: string) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const data = await db.getUser(userId);
        
        // Transform data to match component expectations
        const transformedProfile = {
          id: data.id,
          name: data.full_name,
          role: data.role,
          avatar: data.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
          coverImage: data.cover_image_url || 'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg',
          sport: data.sport || '',
          location: data.location || '',
          bio: data.bio || '',
          externalLink: data.website_url,
          isPrivate: false,
          stats: data.user_profiles?.stats || { followers: 0, following: 0, posts: 0 },
          achievements: data.user_profiles?.achievements || [],
          certifications: data.user_profiles?.certifications || [],
          posts: [], // Would need separate query
          media: [], // Would need separate query
          followers: [], // Would need separate query
          following: [] // Would need separate query
        };

        setProfile(transformedProfile);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [userId]);

  return { profile, isLoading, error };
}

// Hook for fetching notifications
export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const data = await db.getNotifications(user.id);
        
        // Transform data to match component expectations
        const transformedNotifications = data.map(notification => ({
          id: notification.id,
          type: notification.type,
          user: {
            name: notification.sender?.full_name || 'System',
            avatar: notification.sender?.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
          },
          content: notification.content || '',
          timestamp: new Date(notification.created_at),
          isRead: notification.is_read
        }));

        setNotifications(transformedNotifications);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  return { notifications, isLoading, error };
}

// Hook for search functionality
export function useSearch() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string, filters: any = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await db.searchUsers(query, filters);
      
      // Transform data to match component expectations
      const transformedResults = data.map(user => ({
        id: user.id,
        name: user.full_name,
        avatar: user.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
        role: user.role,
        sport: user.sport || '',
        location: user.location || '',
        skillLevel: user.user_profiles?.skill_level || 'Professional'
      }));

      setResults(transformedResults);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { results, isLoading, error, search };
}