
# Echo - Proximity Social Network

A real-time proximity-based social networking app that connects people based on physical proximity. Built with React, TypeScript, Supabase, and designed for mobile-first experiences.

## 🌟 Features

### ✅ Implemented
- **User Authentication** - Email/password signup and login
- **User Profiles** - Customizable profiles with bio, interests, and photos
- **Database Integration** - Supabase backend with Row Level Security
- **Responsive Design** - Mobile-first UI with Tailwind CSS
- **Profile Management** - Edit profile information, interests, and visibility

### 🚧 In Development / Next Steps

#### 1. Proximity Detection & Real-time Features
- **GPS Location Services** - Capture user location with permission handling
- **Bluetooth Low Energy (BLE)** - Detect nearby devices for close-range proximity
- **Real-time Notifications** - Push notifications when users are nearby
- **Distance Calculation** - Accurate proximity measurements
- **Location Privacy** - Granular location sharing controls

#### 2. Social Interaction Features
- **Nearby Users Discovery** - See who's around you in real-time
- **Interest Matching** - Connect with people who share similar interests
- **Chat System** - Direct messaging between matched users
- **Mutual Interest System** - "Like" system for expressing interest
- **Profile Visibility Controls** - Choose when and how you're discoverable

#### 3. Enhanced User Experience
- **Photo Upload** - Profile picture and photo sharing capabilities
- **Push Notifications** - Real-time alerts for proximity and matches
- **Offline Mode** - Basic functionality when internet is limited
- **Dark Mode** - Theme switching for better user experience
- **Accessibility** - Screen reader support and keyboard navigation

#### 4. Safety & Privacy Features
- **Block/Report System** - User safety and content moderation
- **Privacy Settings** - Fine-grained control over data sharing
- **Safe Spaces** - Designated areas with enhanced safety features
- **Identity Verification** - Optional verification badges
- **Activity Status** - Online/offline indicators

#### 5. Advanced Features
- **Event Discovery** - Find and create local events
- **Group Formation** - Create interest-based groups
- **Location History** - Timeline of places you've visited (privacy-controlled)
- **Analytics Dashboard** - Personal insights about connections and activity
- **AI Recommendations** - Smart matching based on behavior patterns

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/echo-proximity-social.git
cd echo-proximity-social
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
   - The app is pre-configured with Supabase integration
   - No additional environment variables needed for development

4. **Start development server**
```bash
npm run dev
```

5. **Access the app**
   - Open [http://localhost:5173](http://localhost:5173) in your browser
   - Go to `/auth` to create an account or sign in

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Component library
- **React Router** - Client-side routing
- **Lucide React** - Icon library

### Backend & Services
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Edge Functions
- **Capacitor** (Ready for mobile deployment)

### State Management
- **React Context** - Authentication state
- **TanStack Query** - Server state management
- **React Hooks** - Local component state

## 📱 Mobile Development

This app is built with mobile-first design and can be deployed as a native mobile app using Capacitor.

### Mobile Deployment Steps

1. **Install Capacitor dependencies**
```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
```

2. **Initialize Capacitor**
```bash
npx cap init
```

3. **Build the project**
```bash
npm run build
```

4. **Add mobile platforms**
```bash
npx cap add ios     # For iOS
npx cap add android # For Android
```

5. **Sync and run**
```bash
npx cap sync
npx cap run ios     # For iOS (requires Xcode on macOS)
npx cap run android # For Android (requires Android Studio)
```

## 📊 Database Schema

### Core Tables
- **profiles** - User profile information and preferences
- **encounters** - Records of proximity detections between users
- **interests** - Mutual interest expressions between users

### Key Features
- Row Level Security (RLS) for data privacy
- Automatic profile creation on user signup
- Optimized for real-time proximity queries

## 🔐 Authentication & Security

### Authentication Flow
1. Email/password signup with email verification
2. Automatic profile creation via database triggers
3. Session management with Supabase Auth
4. Secure token refresh handling

### Security Features
- Row Level Security (RLS) policies
- User data isolation
- Secure API endpoints
- Privacy-first design

## 🛠️ Development Workflow

### Key Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── UserProfile.tsx # Profile management
│   ├── NearbyUsers.tsx # Proximity features
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── pages/              # Route components
│   ├── Index.tsx       # Home page
│   ├── Auth.tsx        # Login/signup
│   └── NotFound.tsx    # 404 page
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
├── hooks/              # Custom React hooks
└── lib/                # Utility functions
```

## 🚀 Deployment

### Lovable Platform (Recommended)
1. Click "Publish" in the Lovable editor
2. Your app will be deployed automatically
3. Custom domains available with paid plans

### Manual Deployment
The app can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS Amplify
- GitHub Pages

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Write responsive, mobile-first components
4. Implement proper error handling
5. Add loading states for async operations
6. Follow the existing code structure

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📋 Roadmap Priority

### Phase 1 (Current) - Foundation ✅
- Authentication system
- Basic user profiles
- Database schema
- UI framework

### Phase 2 - Core Proximity Features
- Location services integration
- Bluetooth proximity detection
- Real-time user discovery
- Basic matching system

### Phase 3 - Social Features
- Chat messaging
- Enhanced profiles
- Interest-based matching
- Notification system

### Phase 4 - Advanced Features
- Event discovery
- Group functionality
- Safety features
- Mobile app deployment

## 🆘 Support & Resources

### Documentation
- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Community
- [Lovable Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)
- [Project Issues](https://github.com/your-username/echo-proximity-social/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev) - AI-powered web development
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Ready to connect people through proximity? Let's build the future of local social networking!** 🌍✨
