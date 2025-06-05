
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

## 📱 Testing on Physical Devices

Testing the Echo app on real phones is essential for proximity features, GPS functionality, and native capabilities. Here's a comprehensive guide for testing on both iOS and Android devices.

### 🔧 Prerequisites for Mobile Testing

#### Required Tools
- **For iOS Testing:**
  - macOS computer with Xcode 14+ installed
  - iOS device with iOS 13+ or iOS Simulator
  - Apple Developer account (free tier sufficient for testing)
  - USB cable for device connection

- **For Android Testing:**
  - Android Studio installed on any OS (Windows, macOS, Linux)
  - Android device with Android 7.0+ (API level 24+) or Android Emulator
  - USB cable for device connection
  - USB debugging enabled on Android device

#### Development Environment Setup
```bash
# Install Capacitor if not already installed
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
```

### 📲 Step-by-Step Mobile Testing Guide

#### Phase 1: Initial Setup (One-time setup)

1. **Export Project to GitHub**
   - Click the "Export to GitHub" button in the Lovable interface
   - This creates a repository with your complete project code

2. **Clone to Local Development**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   npm install
   ```

3. **Initialize Capacitor** (if not already done)
   ```bash
   npx cap init
   # Follow prompts or use the pre-configured settings
   ```

#### Phase 2: Platform Setup

4. **Add Mobile Platforms**
   ```bash
   # Add iOS platform (macOS only)
   npx cap add ios
   
   # Add Android platform (any OS)
   npx cap add android
   ```

5. **Build the Web App**
   ```bash
   npm run build
   ```

6. **Sync with Native Platforms**
   ```bash
   npx cap sync
   ```

#### Phase 3: iOS Testing

7. **Open iOS Project in Xcode**
   ```bash
   npx cap open ios
   ```

8. **Configure iOS Project in Xcode**
   - Set your development team in "Signing & Capabilities"
   - Ensure Bundle Identifier is unique (e.g., `com.yourname.echo`)
   - Add required permissions to `Info.plist`:
     ```xml
     <key>NSLocationWhenInUseUsageDescription</key>
     <string>Echo needs location access to find nearby users</string>
     <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
     <string>Echo needs location access to connect you with nearby people</string>
     <key>NSBluetoothPeripheralUsageDescription</key>
     <string>Echo uses Bluetooth to detect nearby users for social connections</string>
     <key>NSBluetoothAlwaysUsageDescription</key>
     <string>Echo uses Bluetooth to detect nearby users for social connections</string>
     ```

9. **Test on iOS Device/Simulator**
   - Connect your iPhone via USB (for device testing)
   - Select your device or simulator in Xcode
   - Press the "Play" button to build and run
   - Trust the developer certificate on your device if prompted

#### Phase 4: Android Testing

10. **Enable Developer Options on Android Device**
    ```
    Settings → About Phone → Tap "Build Number" 7 times
    Settings → Developer Options → Enable "USB Debugging"
    ```

11. **Open Android Project**
    ```bash
    npx cap open android
    ```

12. **Configure Android Project in Android Studio**
    - Update app permissions in `android/app/src/main/AndroidManifest.xml`:
    ```xml
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
    ```

13. **Test on Android Device/Emulator**
    - Connect your Android device via USB
    - Or create/start an Android Virtual Device (AVD)
    - Click the "Run" button in Android Studio
    - Allow USB debugging when prompted on device

### 🧪 Testing Scenarios & Features

#### Basic Functionality Tests
1. **Authentication Flow**
   - Sign up with new email
   - Verify email works
   - Log in/log out functionality
   - Password reset (if implemented)

2. **Profile Management**
   - Create and edit profile
   - Upload profile photos
   - Set interests and bio
   - Toggle visibility settings

3. **Responsive Design**
   - Test on different screen sizes
   - Portrait/landscape orientation
   - Touch interactions and gestures

#### Proximity Features Testing (Future Implementation)
4. **Location Services**
   - Grant location permissions
   - Test GPS accuracy
   - Background location tracking
   - Battery usage monitoring

5. **Bluetooth Functionality**
   - Grant Bluetooth permissions
   - Test device discovery
   - Background Bluetooth scanning
   - Range testing (1m, 5m, 10m distances)

6. **Real-time Features**
   - Push notifications
   - Real-time updates
   - Network connectivity handling
   - Offline mode functionality

### 🔍 Testing Multiple Devices

#### Two-Device Testing Setup
1. **Prepare Multiple Test Accounts**
   ```bash
   # Create test accounts:
   test1@example.com
   test2@example.com
   test3@example.com
   ```

2. **Install on Multiple Devices**
   - Install the app on 2-3 different phones
   - Use different test accounts on each device
   - Test proximity detection between devices

3. **Proximity Testing Protocol**
   ```
   Distance Tests:
   - 1 meter apart
   - 5 meters apart
   - 10 meters apart
   - Different floors/rooms
   - Moving scenarios (walking past each other)
   ```

#### Group Testing (3+ devices)
4. **Multi-User Scenarios**
   - Group proximity detection
   - Multiple users in same location
   - Network behavior under load
   - Notification handling with multiple users

### 🛠️ Development Workflow for Mobile

#### Continuous Testing Process
```bash
# Make changes to your code
npm run build

# Sync changes to mobile platforms
npx cap sync

# For iOS
npx cap run ios

# For Android
npx cap run android
```

#### Live Reload Setup (Advanced)
```bash
# Start dev server
npm run dev

# In another terminal, sync with live reload
npx cap run ios --livereload --external
npx cap run android --livereload --external
```

### 🐛 Common Issues & Solutions

#### iOS Issues
- **Code signing errors**: Ensure you have a valid Apple Developer account
- **Permission denied**: Check Info.plist permissions
- **App crashes on device**: Check Xcode console for detailed error logs

#### Android Issues
- **USB debugging not working**: Try different USB cable or port
- **Build failures**: Clean and rebuild project in Android Studio
- **Permission issues**: Verify AndroidManifest.xml permissions

#### General Issues
- **Slow build times**: Use `npx cap sync` instead of full rebuild when possible
- **Network issues**: Test on both WiFi and cellular connections
- **Battery drain**: Monitor background processes and optimize location/Bluetooth usage

### 📊 Performance Testing

#### Metrics to Monitor
1. **Battery Usage**
   - Background location tracking impact
   - Bluetooth scanning efficiency
   - Network request optimization

2. **Memory Usage**
   - App memory footprint
   - Memory leaks during extended use
   - Image loading and caching

3. **Network Performance**
   - API response times
   - Real-time update latency
   - Offline/online transition handling

#### Testing Tools
- **iOS**: Xcode Instruments for performance profiling
- **Android**: Android Studio Profiler for memory/CPU monitoring
- **Cross-platform**: Chrome DevTools for web performance

### 🔄 Regular Testing Routine

#### Weekly Testing Checklist
- [ ] Test latest features on both iOS and Android
- [ ] Verify authentication flows work correctly
- [ ] Check responsive design on different screen sizes
- [ ] Test app performance and battery usage
- [ ] Verify push notifications (when implemented)
- [ ] Test proximity features with multiple devices

#### Before Release Testing
- [ ] Complete end-to-end user journey testing
- [ ] Multi-device proximity testing
- [ ] Network connectivity edge cases
- [ ] Performance benchmarking
- [ ] Accessibility testing
- [ ] Security testing (location data handling)

This comprehensive testing approach ensures your Echo app works flawlessly across different devices and scenarios, providing the best user experience for proximity-based social networking.

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
- **Capacitor** - Native mobile deployment

### State Management
- **React Context** - Authentication state
- **TanStack Query** - Server state management
- **React Hooks** - Local component state

### Mobile Development

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
4. Test thoroughly on multiple devices
5. Submit a pull request

## 📋 Roadmap Priority

### Phase 1 (Current) - Foundation ✅
- Authentication system
- Basic user profiles
- Database schema
- UI framework
- Mobile testing infrastructure

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
- App store deployment

## 🆘 Support & Resources

### Documentation
- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)

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
- Mobile deployment via [Capacitor](https://capacitorjs.com/)

---

**Ready to connect people through proximity? Let's build the future of local social networking!** 🌍✨
