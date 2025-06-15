// Service for sending notifications to the server
export class NotificationService {
  private static instance: NotificationService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.sportsync.com' 
      : 'http://localhost:3001';
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Send a like notification
  async sendLikeNotification(postId: string, postOwnerId: string, likerId: string) {
    try {
      await fetch(`${this.baseUrl}/api/notifications/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          postId,
          postOwnerId,
          likerId,
          type: 'like'
        })
      });
    } catch (error) {
      console.error('Failed to send like notification:', error);
    }
  }

  // Send a follow notification
  async sendFollowNotification(followerId: string, followedId: string) {
    try {
      await fetch(`${this.baseUrl}/api/notifications/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          followerId,
          followedId,
          type: 'follow'
        })
      });
    } catch (error) {
      console.error('Failed to send follow notification:', error);
    }
  }

  // Send a comment notification
  async sendCommentNotification(postId: string, postOwnerId: string, commenterId: string, comment: string) {
    try {
      await fetch(`${this.baseUrl}/api/notifications/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          postId,
          postOwnerId,
          commenterId,
          comment,
          type: 'comment'
        })
      });
    } catch (error) {
      console.error('Failed to send comment notification:', error);
    }
  }

  // Send a message notification
  async sendMessageNotification(senderId: string, receiverId: string, messagePreview: string) {
    try {
      await fetch(`${this.baseUrl}/api/notifications/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          senderId,
          receiverId,
          messagePreview,
          type: 'message'
        })
      });
    } catch (error) {
      console.error('Failed to send message notification:', error);
    }
  }
}

export const notificationService = NotificationService.getInstance();