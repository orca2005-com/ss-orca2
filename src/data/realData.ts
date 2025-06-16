// Real data structure templates for database integration
// These interfaces define the expected data structure from your backend

export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  coverImage?: string;
  sport?: string;
  location?: string;
  bio?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabasePost {
  id: string;
  authorId: string;
  content: string;
  mediaUrls?: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  replyToId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  mediaUrls?: string[];
  replyToId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseChat {
  id: string;
  participants: string[];
  isGroup: boolean;
  name?: string;
  avatar?: string;
  lastMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseNotification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'rating';
  actorId: string;
  entityId?: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface DatabaseLike {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Error types
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}