export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          username: string | null
          role: string
          sport: string | null
          location: string | null
          bio: string | null
          avatar_url: string | null
          cover_image_url: string | null
          website_url: string | null
          phone: string | null
          date_of_birth: string | null
          is_verified: boolean
          is_active: boolean
          privacy_settings: Json
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name: string
          username?: string | null
          role?: string
          sport?: string | null
          location?: string | null
          bio?: string | null
          avatar_url?: string | null
          cover_image_url?: string | null
          website_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          is_verified?: boolean
          is_active?: boolean
          privacy_settings?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          username?: string | null
          role?: string
          sport?: string | null
          location?: string | null
          bio?: string | null
          avatar_url?: string | null
          cover_image_url?: string | null
          website_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          is_verified?: boolean
          is_active?: boolean
          privacy_settings?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          achievements: string[]
          certifications: string[]
          experience_years: number | null
          skill_level: string
          position: string | null
          team_size: number | null
          founded_year: number | null
          specializations: string[]
          languages: string[]
          social_links: Json
          stats: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievements?: string[]
          certifications?: string[]
          experience_years?: number | null
          skill_level?: string
          position?: string | null
          team_size?: number | null
          founded_year?: number | null
          specializations?: string[]
          languages?: string[]
          social_links?: Json
          stats?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievements?: string[]
          certifications?: string[]
          experience_years?: number | null
          skill_level?: string
          position?: string | null
          team_size?: number | null
          founded_year?: number | null
          specializations?: string[]
          languages?: string[]
          social_links?: Json
          stats?: Json
          created_at?: string
          updated_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          status?: string
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          content: string
          media_urls: string[]
          media_types: string[]
          visibility: string
          is_pinned: boolean
          location: string | null
          tags: string[]
          mentions: string[]
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          author_id: string
          content: string
          media_urls?: string[]
          media_types?: string[]
          visibility?: string
          is_pinned?: boolean
          location?: string | null
          tags?: string[]
          mentions?: string[]
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          author_id?: string
          content?: string
          media_urls?: string[]
          media_types?: string[]
          visibility?: string
          is_pinned?: boolean
          location?: string | null
          tags?: string[]
          mentions?: string[]
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      post_interactions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          interaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          interaction_type: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          interaction_type?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          parent_comment_id: string | null
          content: string
          media_urls: string[]
          mentions: string[]
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          parent_comment_id?: string | null
          content: string
          media_urls?: string[]
          mentions?: string[]
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          parent_comment_id?: string | null
          content?: string
          media_urls?: string[]
          mentions?: string[]
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      conversations: {
        Row: {
          id: string
          type: string
          name: string | null
          description: string | null
          avatar_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type?: string
          name?: string | null
          description?: string | null
          avatar_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          name?: string | null
          description?: string | null
          avatar_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          role: string
          joined_at: string
          left_at: string | null
          last_read_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          role?: string
          joined_at?: string
          left_at?: string | null
          last_read_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          role?: string
          joined_at?: string
          left_at?: string | null
          last_read_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string | null
          media_urls: string[]
          media_types: string[]
          message_type: string
          reply_to_message_id: string | null
          is_edited: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content?: string | null
          media_urls?: string[]
          media_types?: string[]
          message_type?: string
          reply_to_message_id?: string | null
          is_edited?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string | null
          media_urls?: string[]
          media_types?: string[]
          message_type?: string
          reply_to_message_id?: string | null
          is_edited?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          sender_id: string | null
          type: string
          title: string | null
          content: string | null
          data: Json
          is_read: boolean
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          recipient_id: string
          sender_id?: string | null
          type: string
          title?: string | null
          content?: string | null
          data?: Json
          is_read?: boolean
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          recipient_id?: string
          sender_id?: string | null
          type?: string
          title?: string | null
          content?: string | null
          data?: Json
          is_read?: boolean
          created_at?: string
          expires_at?: string | null
        }
      }
      media_files: {
        Row: {
          id: string
          uploader_id: string
          filename: string
          original_filename: string | null
          file_path: string
          file_size: number | null
          mime_type: string | null
          width: number | null
          height: number | null
          duration: number | null
          thumbnail_url: string | null
          is_processed: boolean
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          uploader_id: string
          filename: string
          original_filename?: string | null
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          duration?: number | null
          thumbnail_url?: string | null
          is_processed?: boolean
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          uploader_id?: string
          filename?: string
          original_filename?: string | null
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          duration?: number | null
          thumbnail_url?: string | null
          is_processed?: boolean
          metadata?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_or_create_conversation: {
        Args: {
          user1_id: string
          user2_id: string
        }
        Returns: string
      }
      create_notification: {
        Args: {
          recipient_id: string
          sender_id: string
          notification_type: string
          title: string
          content: string
          data?: Json
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}