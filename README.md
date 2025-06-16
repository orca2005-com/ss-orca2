# SportSYNC - Sports Networking Platform

A modern, mobile-first sports networking platform built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **User Authentication** - Secure login/signup with JWT tokens
- **Profile Management** - Comprehensive user profiles with media uploads
- **Social Feed** - Real-time posts, likes, comments, and sharing
- **Messaging System** - Real-time chat with media support
- **Search & Discovery** - Advanced search with filters
- **Follow System** - Connect with athletes, coaches, and teams
- **Notifications** - Real-time activity notifications
- **Mobile-First Design** - Optimized for all devices

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context + Hooks
- **Build Tool**: Vite
- **Deployment**: Netlify

## 📱 Mobile-First Architecture

This application is built with a mobile-first approach:

- Touch-optimized interactions (44px minimum touch targets)
- iOS-safe input handling (prevents zoom on focus)
- Native-like navigation and gestures
- Responsive layouts for all screen sizes
- Performance optimized for mobile devices

## 🔧 Backend Integration

The frontend is ready for backend integration with:

### API Service Layer
- Centralized API calls in `src/services/api.ts`
- Type-safe request/response handling
- Automatic authentication token management
- Error handling and retry logic

### Data Models
- Database-ready interfaces in `src/data/realData.ts`
- Consistent data structures for all entities
- Pagination support for large datasets

### Required Backend Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

#### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `GET /api/users/:id` - Get user profile
- `GET /api/users/search` - Search users
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user

#### Posts
- `GET /api/posts/feed` - Get user feed
- `POST /api/posts` - Create post
- `POST /api/posts/:id/like` - Like post
- `DELETE /api/posts/:id/like` - Unlike post
- `POST /api/posts/:id/comments` - Add comment

#### Messages
- `GET /api/chats` - Get user chats
- `GET /api/chats/:id/messages` - Get chat messages
- `POST /api/chats/:id/messages` - Send message
- `POST /api/chats` - Create new chat

#### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

#### File Upload
- `POST /api/upload` - Upload files (images, videos)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd sportsync
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your backend API URL and other configuration
```

4. Start the development server
```bash
npm run dev
```

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_DATABASE_URL=your_database_url
VITE_JWT_SECRET=your_jwt_secret
VITE_UPLOAD_MAX_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,video/mp4
```

## 📦 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── feed/           # Feed-related components
│   ├── layout/         # Layout components
│   ├── messages/       # Messaging components
│   ├── notifications/  # Notification components
│   ├── profile/        # Profile components
│   ├── search/         # Search components
│   └── ui/             # Generic UI components
├── context/            # React Context providers
├── data/               # Data models and types
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API service layer
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🎨 Design System

The application uses a comprehensive design system with:

- **Color System**: Primary, secondary, accent, and semantic colors
- **Typography**: Responsive text scales with proper hierarchy
- **Spacing**: Consistent 8px spacing system
- **Components**: Reusable, accessible UI components
- **Animations**: Smooth, purposeful micro-interactions

## 🔒 Security Features

- Input sanitization and validation
- XSS protection
- CSRF protection
- Rate limiting
- Secure authentication flow
- Content security policies

## 📱 PWA Ready

The application is Progressive Web App ready with:

- Service worker support
- Offline functionality
- App-like experience on mobile devices
- Push notification support

## 🚀 Deployment

The application is configured for easy deployment to Netlify:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@sportsync.com or join our Slack channel.