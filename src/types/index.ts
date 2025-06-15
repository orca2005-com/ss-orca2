export interface Post {
  id: string;
  content: string;
  media?: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  expiresAt?: string;
}

export interface Profile {
  id: string;
  name: string;
  role: string; // Changed from union type to string for flexibility
  avatar: string;
  coverImage: string;
  sport: string;
  location: string;
  bio: string;
  stats: {
    followers: number;
    following: number; // Changed from connections to following
  };
  achievements: string[];
  certifications?: string[];
  posts: Post[];
  media: { id: string; url: string; type: 'image' | 'video'; title: string }[];
  externalLink?: string;
  isPrivate: boolean;
  followers: Follower[];
  following: Following[];
}

export interface Follower {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Following {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Connection {
  id: number;
  name: string;
  role: string;
  avatar: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  media?: string[];
  isRead: boolean;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  isTyping: boolean;
  lastSeen: Date;
  messages: Message[];
  participants: string[];
  isGroup: boolean;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'message' | 'rating' | 'follow';
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  isRead: boolean;
}

// API Response types
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

// Hook return types
export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Utility types
export type NotificationType = 'like' | 'comment' | 'message' | 'rating' | 'follow';
export type PostStatus = 'draft' | 'published' | 'archived';
export type MediaType = 'image' | 'video';