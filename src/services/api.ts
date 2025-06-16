// API service layer for backend integration
// Replace these with your actual backend endpoints

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // User endpoints
  async getCurrentUser() {
    return this.request('/users/me');
  }

  async updateProfile(profileData: any) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserProfile(userId: string) {
    return this.request(`/users/${userId}`);
  }

  async searchUsers(query: string, filters?: any) {
    const params = new URLSearchParams({ q: query, ...filters });
    return this.request(`/users/search?${params}`);
  }

  // Posts endpoints
  async getFeed(page = 1, limit = 10) {
    return this.request(`/posts/feed?page=${page}&limit=${limit}`);
  }

  async createPost(postData: any) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async likePost(postId: string) {
    return this.request(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async unlikePost(postId: string) {
    return this.request(`/posts/${postId}/like`, {
      method: 'DELETE',
    });
  }

  async addComment(postId: string, content: string) {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Follow endpoints
  async followUser(userId: string) {
    return this.request(`/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  async unfollowUser(userId: string) {
    return this.request(`/users/${userId}/follow`, {
      method: 'DELETE',
    });
  }

  async getFollowers(userId: string) {
    return this.request(`/users/${userId}/followers`);
  }

  async getFollowing(userId: string) {
    return this.request(`/users/${userId}/following`);
  }

  // Messages endpoints
  async getChats() {
    return this.request('/chats');
  }

  async getMessages(chatId: string) {
    return this.request(`/chats/${chatId}/messages`);
  }

  async sendMessage(chatId: string, content: string) {
    return this.request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async createChat(participantIds: string[]) {
    return this.request('/chats', {
      method: 'POST',
      body: JSON.stringify({ participants: participantIds }),
    });
  }

  // Notifications endpoints
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // File upload endpoint
  async uploadFile(file: File, type: 'avatar' | 'cover' | 'post' | 'message') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }
}

export const apiService = new ApiService();