// Mock Supabase client for development
export const supabase = {
  auth: {
    signUp: async (data: any) => {
      // Simulate signup
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { data: { user: { id: '1', email: data.email } }, error: null };
    },
    signInWithPassword: async (data: any) => {
      // Simulate login
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { data: { user: { id: '1', email: data.email } }, error: null };
    },
    signOut: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { error: null };
    },
    getSession: async () => {
      return { data: { session: null }, error: null };
    },
    onAuthStateChange: (callback: any) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }
};

// Mock auth helpers
export const auth = supabase.auth;

// Mock database helpers
export const db = {
  async getUser(id: string) {
    // Return mock user data
    return {
      id,
      email: 'user@example.com',
      full_name: 'Mock User',
      role: 'player',
      sport: 'Basketball',
      location: 'New York, USA',
      bio: 'Mock user bio',
      avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
      user_profiles: {
        stats: { followers: 0, following: 0, posts: 0 }
      }
    };
  },

  async updateUser(id: string, updates: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...updates, id };
  },

  async getPosts(limit = 20) {
    // Return mock posts
    return [];
  },

  async createPost(post: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id: Date.now().toString(), ...post };
  },

  async deletePost(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  async getNotifications(userId: string) {
    return [];
  },

  async markNotificationAsRead(id: string) {
    await new Promise(resolve => setTimeout(resolve, 200));
  },

  async searchUsers(query: string, filters: any = {}) {
    return [];
  }
};

// Mock subscriptions
export const subscriptions = {
  subscribeToNotifications: (userId: string, callback: any) => {
    return { unsubscribe: () => {} };
  }
};

// Mock storage
export const storage = {
  async uploadFile(bucket: string, path: string, file: File) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { path };
  },

  async getPublicUrl(bucket: string, path: string) {
    return URL.createObjectURL(new Blob());
  }
};