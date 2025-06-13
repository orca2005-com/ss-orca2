import { supabase, supabaseHelpers } from '../lib/supabase';
import { sanitizeText } from '../utils';

export interface PostData {
  content: string;
  post_type?: string;
  visibility?: string;
  location?: string;
  tags?: string[];
  media?: File[];
}

export interface PostMedia {
  file: File;
  type: 'image' | 'video';
  alt_text?: string;
}

class PostService {
  async createPost(authorId: string, postData: PostData) {
    try {
      // Sanitize content
      const sanitizedContent = sanitizeText(postData.content);
      
      if (!sanitizedContent.trim()) {
        throw new Error('Post content cannot be empty');
      }

      // Create post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          author_id: authorId,
          content: sanitizedContent,
          post_type: postData.post_type || 'text',
          visibility: postData.visibility || 'public',
          status: 'published',
          location: postData.location ? sanitizeText(postData.location) : null,
          tags: postData.tags?.map(tag => sanitizeText(tag)) || null,
          published_at: new Date().toISOString()
        })
        .select()
        .single();

      if (postError) {
        throw new Error(postError.message);
      }

      // Upload media if provided
      if (postData.media && postData.media.length > 0) {
        await this.uploadPostMedia(post.id, postData.media);
      }

      return post;
    } catch (error: any) {
      console.error('Create post error:', error);
      throw new Error('Failed to create post');
    }
  }

  async uploadPostMedia(postId: string, mediaFiles: File[]) {
    try {
      const mediaPromises = mediaFiles.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${postId}/${Date.now()}_${index}.${fileExt}`;
        const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

        // Upload file
        await supabaseHelpers.uploadFile('post-media', fileName, file);

        // Get public URL
        const publicUrl = supabaseHelpers.getPublicUrl('post-media', fileName);

        // Create media record
        return supabase
          .from('post_media')
          .insert({
            post_id: postId,
            media_type: mediaType,
            file_url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            display_order: index
          });
      });

      await Promise.all(mediaPromises);
    } catch (error: any) {
      console.error('Upload post media error:', error);
      throw new Error('Failed to upload media');
    }
  }

  async getFeed(userId: string, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { data, error } = await supabase.rpc('get_user_feed', {
        user_id: userId,
        limit_count: limit,
        offset_count: offset
      });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      console.error('Get feed error:', error);
      throw new Error('Failed to fetch feed');
    }
  }

  async getPost(postId: string) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(full_name, avatar_url, sport),
          post_media(*),
          likes(count),
          comments(count)
        `)
        .eq('id', postId)
        .eq('status', 'published')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Get post error:', error);
      throw new Error('Failed to fetch post');
    }
  }

  async likePost(userId: string, postId: string) {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('likeable_type', 'post')
        .eq('likeable_id', postId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) {
          throw new Error(error.message);
        }

        return { liked: false };
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: userId,
            likeable_type: 'post',
            likeable_id: postId
          });

        if (error) {
          throw new Error(error.message);
        }

        return { liked: true };
      }
    } catch (error: any) {
      console.error('Like post error:', error);
      throw new Error('Failed to like/unlike post');
    }
  }

  async addComment(userId: string, postId: string, content: string, parentId?: string) {
    try {
      const sanitizedContent = sanitizeText(content);
      
      if (!sanitizedContent.trim()) {
        throw new Error('Comment cannot be empty');
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          author_id: userId,
          commentable_type: 'post',
          commentable_id: postId,
          parent_id: parentId || null,
          content: sanitizedContent
        })
        .select(`
          *,
          author:profiles!comments_author_id_fkey(full_name, avatar_url)
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Add comment error:', error);
      throw new Error('Failed to add comment');
    }
  }

  async getComments(postId: string) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles!comments_author_id_fkey(full_name, avatar_url)
        `)
        .eq('commentable_type', 'post')
        .eq('commentable_id', postId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      console.error('Get comments error:', error);
      throw new Error('Failed to fetch comments');
    }
  }

  async deletePost(postId: string, userId: string) {
    try {
      // Verify ownership
      const { data: post } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();

      if (!post || post.author_id !== userId) {
        throw new Error('Unauthorized to delete this post');
      }

      // Soft delete
      const { error } = await supabase
        .from('posts')
        .update({ status: 'deleted' })
        .eq('id', postId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Delete post error:', error);
      throw new Error('Failed to delete post');
    }
  }
}

export const postService = new PostService();