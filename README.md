# SportNet - Sports Networking Platform

A comprehensive sports networking platform built with React, TypeScript, and Supabase that connects athletes, coaches, teams, and sports professionals worldwide.

## 🚀 Features

### Core Features
- **User Authentication** - Secure signup/login with email verification
- **Profile Management** - Rich profiles with achievements, certifications, and media
- **Social Feed** - Share posts, images, videos with like/comment system
- **Connections** - Professional networking between users
- **Real-time Messaging** - Direct and group conversations
- **Search & Discovery** - Advanced search with filters
- **Notifications** - Real-time updates for all activities

### User Types
- **Players/Athletes** - Individual sports professionals
- **Teams** - Sports teams and organizations  
- **Coaches** - Trainers and coaching staff
- **Sports Professionals** - Nutritionists, physiotherapists, psychologists, etc.
- **Industry Professionals** - Journalists, agents, referees, etc.

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Lucide React** for icons

### Backend & Database
- **Supabase** for backend services
- **PostgreSQL** database with Row Level Security
- **Real-time subscriptions** for live updates
- **File storage** for media uploads
- **Edge functions** for serverless operations

### Security & Performance
- **Row Level Security (RLS)** for data protection
- **Input sanitization** and validation
- **Rate limiting** and DDoS protection
- **Optimized images** and lazy loading
- **Progressive Web App** features

## 🏗️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install
```bash
git clone <repository-url>
cd sportnet
npm install
```

### 2. Supabase Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database migrations**:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and run the contents of `supabase/migrations/001_initial_schema.sql`
   - Copy and run the contents of `supabase/migrations/002_storage_setup.sql`

3. **Configure Authentication**:
   - Go to Authentication > Settings
   - Disable email confirmations for development (optional)
   - Configure any social providers if needed

4. **Set up Storage**:
   - The migration will create the necessary storage buckets
   - Verify buckets are created: avatars, covers, post-media, documents

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project settings.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📊 Database Schema

The platform uses a comprehensive PostgreSQL schema with the following main tables:

- **users** - Authentication and basic user info
- **profiles** - Extended user profiles with sports data
- **posts** - User-generated content and media
- **connections** - Professional networking relationships
- **messages** - Real-time messaging system
- **notifications** - Activity notifications
- **achievements** - User accomplishments and certifications
- **likes/comments** - Social interaction features

See `docs/DATABASE_SCHEMA.md` for complete schema documentation.

## 🔐 Security Features

- **Row Level Security (RLS)** on all database tables
- **Input sanitization** to prevent XSS attacks
- **Rate limiting** to prevent abuse
- **Secure file uploads** with type validation
- **Authentication** with JWT tokens
- **Privacy controls** for user profiles and content

## 🎨 Design System

The platform features a modern, responsive design with:

- **Dark theme** optimized for sports content
- **Mobile-first** responsive design
- **Smooth animations** and micro-interactions
- **Accessible** components with proper ARIA labels
- **Consistent** spacing and typography system

## 📱 Mobile Optimization

- **Touch-optimized** interface elements
- **Responsive** breakpoints for all screen sizes
- **Fast loading** with optimized images
- **Offline support** for core features
- **PWA capabilities** for app-like experience

## 🚀 Deployment

### Netlify (Recommended)
1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### Manual Build
```bash
npm run build
```

The built files will be in the `dist` directory.

## 🧪 Testing

```bash
npm run lint  # ESLint checking
```

## 📖 API Documentation

See `docs/API_DOCUMENTATION.md` for complete API reference including:
- Authentication endpoints
- User management
- Posts and media
- Connections and messaging
- Search and notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation in the `docs/` folder
- Create an issue in the repository
- Contact the development team

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core authentication and profiles
- ✅ Social feed and interactions
- ✅ Real-time messaging
- ✅ Search and discovery

### Phase 2 (Upcoming)
- 🔄 Team management features
- 🔄 Event creation and management
- 🔄 Advanced analytics dashboard
- 🔄 Mobile app development

### Phase 3 (Future)
- 📋 Video calling integration
- 📋 Marketplace for sports services
- 📋 Tournament management
- 📋 AI-powered recommendations

---

Built with ❤️ for the sports community