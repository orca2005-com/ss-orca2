export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: string;
          status: string;
          created_at: string;
          updated_at: string;
          last_login: string | null;
          login_attempts: number;
          locked_until: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          role: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          login_attempts?: number;
          locked_until?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          status?: string;
          updated_at?: string;
          last_login?: string | null;
          login_attempts?: number;
          locked_until?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          display_name: string | null;
          bio: string | null;
          sport: string | null;
          position: string | null;
          experience_years: number | null;
          skill_level: string | null;
          location: string | null;
          country: string | null;
          city: string | null;
          date_of_birth: string | null;
          gender: string | null;
          height_cm: number | null;
          weight_kg: number | null;
          avatar_url: string | null;
          cover_image_url: string | null;
          website_url: string | null;
          social_links: any;
          privacy_settings: any;
          is_verified: boolean;
          verification_type: string | null;
          is_private: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          display_name?: string | null;
          bio?: string | null;
          sport?: string | null;
          position?: string | null;
          experience_years?: number | null;
          skill_level?: string | null;
          location?: string | null;
          country?: string | null;
          city?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          avatar_url?: string | null;
          cover_image_url?: string | null;
          website_url?: string | null;
          social_links?: any;
          privacy_settings?: any;
          is_verified?: boolean;
          verification_type?: string | null;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          display_name?: string | null;
          bio?: string | null;
          sport?: string | null;
          position?: string | null;
          experience_years?: number | null;
          skill_level?: string | null;
          location?: string | null;
          country?: string | null;
          city?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          avatar_url?: string | null;
          cover_image_url?: string | null;
          website_url?: string | null;
          social_links?: any;
          privacy_settings?: any;
          is_verified?: boolean;
          verification_type?: string | null;
          is_private?: boolean;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          team_id: string | null;
          content: string;
          post_type: string;
          visibility: string;
          status: string;
          metadata: any;
          location: string | null;
          tags: string[] | null;
          is_pinned: boolean;
          is_featured: boolean;
          scheduled_at: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          team_id?: string | null;
          content: string;
          post_type?: string;
          visibility?: string;
          status?: string;
          metadata?: any;
          location?: string | null;
          tags?: string[] | null;
          is_pinned?: boolean;
          is_featured?: boolean;
          scheduled_at?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          team_id?: string | null;
          content?: string;
          post_type?: string;
          visibility?: string;
          status?: string;
          metadata?: any;
          location?: string | null;
          tags?: string[] | null;
          is_pinned?: boolean;
          is_featured?: boolean;
          scheduled_at?: string | null;
          published_at?: string | null;
          updated_at?: string;
        };
      };
      post_media: {
        Row: {
          id: string;
          post_id: string;
          media_type: string;
          file_url: string;
          thumbnail_url: string | null;
          file_name: string | null;
          file_size: number | null;
          mime_type: string | null;
          width: number | null;
          height: number | null;
          duration: number | null;
          alt_text: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          media_type: string;
          file_url: string;
          thumbnail_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          width?: number | null;
          height?: number | null;
          duration?: number | null;
          alt_text?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          media_type?: string;
          file_url?: string;
          thumbnail_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          width?: number | null;
          height?: number | null;
          duration?: number | null;
          alt_text?: string | null;
          display_order?: number;
        };
      };
      connections: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: string;
          connection_type: string;
          message: string | null;
          requested_at: string;
          responded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: string;
          connection_type?: string;
          message?: string | null;
          requested_at?: string;
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          addressee_id?: string;
          status?: string;
          connection_type?: string;
          message?: string | null;
          requested_at?: string;
          responded_at?: string | null;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          type: string;
          name: string | null;
          description: string | null;
          avatar_url: string | null;
          created_by: string | null;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type?: string;
          name?: string | null;
          description?: string | null;
          avatar_url?: string | null;
          created_by?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          name?: string | null;
          description?: string | null;
          avatar_url?: string | null;
          created_by?: string | null;
          is_archived?: boolean;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string | null;
          message_type: string;
          reply_to_id: string | null;
          metadata: any;
          is_edited: boolean;
          edited_at: string | null;
          is_deleted: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content?: string | null;
          message_type?: string;
          reply_to_id?: string | null;
          metadata?: any;
          is_edited?: boolean;
          edited_at?: string | null;
          is_deleted?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string | null;
          message_type?: string;
          reply_to_id?: string | null;
          metadata?: any;
          is_edited?: boolean;
          edited_at?: string | null;
          is_deleted?: boolean;
          deleted_at?: string | null;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          sender_id: string | null;
          type: string;
          title: string;
          content: string | null;
          data: any;
          is_read: boolean;
          read_at: string | null;
          action_url: string | null;
          priority: string;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          sender_id?: string | null;
          type: string;
          title: string;
          content?: string | null;
          data?: any;
          is_read?: boolean;
          read_at?: string | null;
          action_url?: string | null;
          priority?: string;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          sender_id?: string | null;
          type?: string;
          title?: string;
          content?: string | null;
          data?: any;
          is_read?: boolean;
          read_at?: string | null;
          action_url?: string | null;
          priority?: string;
          expires_at?: string | null;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          achievement_type: string | null;
          date_achieved: string | null;
          issuing_organization: string | null;
          verification_status: string;
          verification_document_url: string | null;
          is_featured: boolean;
          display_order: number;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          achievement_type?: string | null;
          date_achieved?: string | null;
          issuing_organization?: string | null;
          verification_status?: string;
          verification_document_url?: string | null;
          is_featured?: boolean;
          display_order?: number;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          achievement_type?: string | null;
          date_achieved?: string | null;
          issuing_organization?: string | null;
          verification_status?: string;
          verification_document_url?: string | null;
          is_featured?: boolean;
          display_order?: number;
          metadata?: any;
          updated_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          likeable_type: string;
          likeable_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          likeable_type: string;
          likeable_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          likeable_type?: string;
          likeable_id?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          author_id: string;
          commentable_type: string;
          commentable_id: string;
          parent_id: string | null;
          content: string;
          is_edited: boolean;
          edited_at: string | null;
          is_deleted: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          commentable_type: string;
          commentable_id: string;
          parent_id?: string | null;
          content: string;
          is_edited?: boolean;
          edited_at?: string | null;
          is_deleted?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          commentable_type?: string;
          commentable_id?: string;
          parent_id?: string | null;
          content?: string;
          is_edited?: boolean;
          edited_at?: string | null;
          is_deleted?: boolean;
          deleted_at?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      user_stats: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          sport: string | null;
          location: string | null;
          connection_count: number;
          post_count: number;
          total_likes: number;
          achievement_count: number;
          created_at: string;
          last_login: string | null;
        };
      };
    };
    Functions: {
      get_user_feed: {
        Args: {
          user_id: string;
          limit_count?: number;
          offset_count?: number;
        };
        Returns: {
          id: string;
          content: string;
          author_id: string;
          author_name: string;
          author_avatar: string;
          author_role: string;
          post_type: string;
          created_at: string;
          like_count: number;
          comment_count: number;
          is_liked: boolean;
        }[];
      };
      search_users: {
        Args: {
          search_query: string;
          sport_filter?: string;
          role_filter?: string;
          location_filter?: string;
          limit_count?: number;
        };
        Returns: {
          id: string;
          full_name: string;
          avatar_url: string;
          role: string;
          sport: string;
          location: string;
          mutual_connections: number;
        }[];
      };
    };
  };
}