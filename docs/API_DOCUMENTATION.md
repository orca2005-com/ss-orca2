# SportNet API Documentation

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.sportnet.com`

## Authentication
All API requests require authentication using JWT tokens.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## API Endpoints

### 1. Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "fullName": "John Doe",
  "role": "player"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "player"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "player",
      "lastLogin": "2024-01-15T10:30:00Z"
    },
    "token": "jwt_token_here",
    "expiresIn": "24h"
  }
}
```

#### POST /auth/logout
Logout user and invalidate token.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST /auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "newSecurePassword123!"
}
```

### 2. User Profile Endpoints

#### GET /users/profile
Get current user's profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "profile": {
      "fullName": "John Doe",
      "bio": "Professional basketball player",
      "sport": "Basketball",
      "location": "New York, USA",
      "avatarUrl": "https://...",
      "coverImageUrl": "https://...",
      "stats": {
        "followers": 1234,
        "connections": 89,
        "posts": 156
      }
    }
  }
}
```

#### PUT /users/profile
Update user profile.

**Request Body:**
```json
{
  "fullName": "John Smith",
  "bio": "Updated bio",
  "sport": "Basketball",
  "location": "Los Angeles, USA",
  "website": "https://johnsmith.com"
}
```

#### GET /users/:id/profile
Get another user's profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "profile": {
      "fullName": "Sarah Johnson",
      "bio": "Tennis coach with 10+ years experience",
      "sport": "Tennis",
      "location": "London, UK",
      "isPrivate": false,
      "isConnected": true,
      "mutualConnections": 15
    }
  }
}
```

### 3. Posts Endpoints

#### GET /posts
Get posts feed.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `type` (string): Filter by post type
- `author` (string): Filter by author ID

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "content": "Great training session today!",
        "author": {
          "id": "uuid",
          "name": "John Doe",
          "avatar": "https://...",
          "role": "player"
        },
        "media": [
          {
            "type": "image",
            "url": "https://...",
            "thumbnail": "https://..."
          }
        ],
        "stats": {
          "likes": 42,
          "comments": 8,
          "shares": 3
        },
        "isLiked": false,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

#### POST /posts
Create a new post.

**Request Body:**
```json
{
  "content": "Just finished an amazing training session!",
  "visibility": "public",
  "media": [
    {
      "type": "image",
      "url": "https://...",
      "alt": "Training session photo"
    }
  ],
  "tags": ["training", "basketball"]
}
```

#### GET /posts/:id
Get specific post.

#### PUT /posts/:id
Update post (only by author).

#### DELETE /posts/:id
Delete post (only by author).

#### POST /posts/:id/like
Like/unlike a post.

#### GET /posts/:id/comments
Get post comments.

#### POST /posts/:id/comments
Add comment to post.

### 4. Connections Endpoints

#### GET /connections
Get user's connections.

**Query Parameters:**
- `status` (string): Filter by status (pending, accepted, rejected)
- `type` (string): Filter by connection type

**Response:**
```json
{
  "success": true,
  "data": {
    "connections": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "name": "Sarah Johnson",
          "avatar": "https://...",
          "role": "coach",
          "sport": "Tennis"
        },
        "status": "accepted",
        "type": "professional",
        "connectedAt": "2024-01-10T15:20:00Z"
      }
    ]
  }
}
```

#### POST /connections
Send connection request.

**Request Body:**
```json
{
  "userId": "target_user_uuid",
  "type": "professional",
  "message": "I'd like to connect with you"
}
```

#### PUT /connections/:id
Accept/reject connection request.

**Request Body:**
```json
{
  "status": "accepted"
}
```

#### DELETE /connections/:id
Remove connection.

### 5. Messages Endpoints

#### GET /conversations
Get user's conversations.

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "type": "direct",
        "participants": [
          {
            "id": "uuid",
            "name": "Sarah Johnson",
            "avatar": "https://...",
            "isOnline": true
          }
        ],
        "lastMessage": {
          "content": "See you at practice tomorrow!",
          "timestamp": "2024-01-15T16:45:00Z",
          "sender": "uuid"
        },
        "unreadCount": 2
      }
    ]
  }
}
```

#### GET /conversations/:id/messages
Get messages in conversation.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Messages per page

#### POST /conversations/:id/messages
Send message.

**Request Body:**
```json
{
  "content": "Hello! How are you?",
  "type": "text",
  "replyTo": "message_uuid" // optional
}
```

#### POST /conversations
Create new conversation.

**Request Body:**
```json
{
  "type": "direct",
  "participants": ["user_uuid"],
  "message": "Initial message content"
}
```

### 6. Teams Endpoints

#### GET /teams
Get teams list.

**Query Parameters:**
- `sport` (string): Filter by sport
- `location` (string): Filter by location
- `recruiting` (boolean): Filter recruiting teams

#### POST /teams
Create new team.

**Request Body:**
```json
{
  "name": "Thunder Basketball Club",
  "sport": "Basketball",
  "description": "Professional basketball team",
  "location": "Chicago, USA",
  "teamType": "professional",
  "maxMembers": 25
}
```

#### GET /teams/:id
Get team details.

#### PUT /teams/:id
Update team (only by owner/admin).

#### POST /teams/:id/join
Request to join team.

#### GET /teams/:id/members
Get team members.

#### POST /teams/:id/members
Add team member (only by admin).

#### DELETE /teams/:id/members/:userId
Remove team member.

### 7. Events Endpoints

#### GET /events
Get events list.

**Query Parameters:**
- `sport` (string): Filter by sport
- `location` (string): Filter by location
- `startDate` (date): Filter by start date
- `endDate` (date): Filter by end date

#### POST /events
Create new event.

**Request Body:**
```json
{
  "title": "Basketball Tournament",
  "description": "Annual championship tournament",
  "eventType": "tournament",
  "sport": "Basketball",
  "startTime": "2024-02-15T10:00:00Z",
  "endTime": "2024-02-15T18:00:00Z",
  "location": "Madison Square Garden",
  "maxParticipants": 100,
  "registrationRequired": true
}
```

#### GET /events/:id
Get event details.

#### POST /events/:id/register
Register for event.

#### GET /events/:id/participants
Get event participants.

### 8. Search Endpoints

#### GET /search/users
Search users.

**Query Parameters:**
- `q` (string): Search query
- `sport` (string): Filter by sport
- `role` (string): Filter by role
- `location` (string): Filter by location

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "name": "John Smith",
        "avatar": "https://...",
        "role": "player",
        "sport": "Basketball",
        "location": "New York, USA",
        "mutualConnections": 5
      }
    ],
    "total": 25
  }
}
```

#### GET /search/teams
Search teams.

#### GET /search/events
Search events.

#### GET /search/posts
Search posts.

### 9. Notifications Endpoints

#### GET /notifications
Get user notifications.

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "like",
        "title": "Someone liked your post",
        "content": "John Doe liked your recent post",
        "sender": {
          "id": "uuid",
          "name": "John Doe",
          "avatar": "https://..."
        },
        "isRead": false,
        "actionUrl": "/posts/uuid",
        "createdAt": "2024-01-15T14:30:00Z"
      }
    ],
    "unreadCount": 5
  }
}
```

#### PUT /notifications/:id/read
Mark notification as read.

#### PUT /notifications/read-all
Mark all notifications as read.

#### DELETE /notifications/:id
Delete notification.

### 10. Analytics Endpoints

#### GET /analytics/dashboard
Get user dashboard analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "profileViews": 156,
    "postEngagement": {
      "totalLikes": 342,
      "totalComments": 89,
      "totalShares": 23
    },
    "connectionGrowth": [
      { "date": "2024-01-01", "count": 45 },
      { "date": "2024-01-02", "count": 47 }
    ],
    "topPosts": [
      {
        "id": "uuid",
        "content": "Great game today!",
        "likes": 45,
        "comments": 12
      }
    ]
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Email is required"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

## Rate Limiting

### Limits
- **Authentication**: 5 requests per 15 minutes
- **API Calls**: 100 requests per minute
- **File Uploads**: 5 requests per minute
- **Search**: 50 requests per minute

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## File Upload

### POST /upload
Upload files (images, videos, documents).

**Request:**
- Content-Type: `multipart/form-data`
- Max file size: 10MB (images), 50MB (videos)

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.sportnet.com/uploads/...",
    "thumbnail": "https://cdn.sportnet.com/thumbnails/...",
    "fileSize": 1024000,
    "mimeType": "image/jpeg"
  }
}
```

## WebSocket Events

### Connection
```javascript
const socket = io('wss://api.sportnet.com', {
  auth: {
    token: 'jwt_token_here'
  }
});
```

### Events
- `message:new` - New message received
- `notification:new` - New notification
- `connection:request` - New connection request
- `user:online` - User came online
- `user:offline` - User went offline
- `typing:start` - User started typing
- `typing:stop` - User stopped typing

## SDK Examples

### JavaScript/TypeScript
```javascript
import { SportNetAPI } from '@sportnet/sdk';

const api = new SportNetAPI({
  baseURL: 'https://api.sportnet.com',
  token: 'your_jwt_token'
});

// Get user profile
const profile = await api.users.getProfile();

// Create post
const post = await api.posts.create({
  content: 'Great training session!',
  visibility: 'public'
});

// Send message
const message = await api.messages.send('conversation_id', {
  content: 'Hello!',
  type: 'text'
});
```

### React Hooks
```javascript
import { useUser, usePosts, useConnections } from '@sportnet/react-hooks';

function Dashboard() {
  const { user, loading } = useUser();
  const { posts, createPost } = usePosts();
  const { connections, sendRequest } = useConnections();

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

This API documentation provides comprehensive coverage of all SportNet platform endpoints with proper authentication, error handling, and rate limiting.