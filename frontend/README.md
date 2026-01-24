# LandChain Frontend 🏡⛓️

A modern, animated React frontend for the LandChain blockchain property registry system.

## 🚀 Features

- **Modern UI/UX**: Glass morphism design with blockchain aesthetics
- **Smooth Animations**: GSAP timeline animations and Framer Motion interactions
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Web3 Integration**: MetaMask wallet connection and blockchain interactions
- **Real-time Updates**: Live property status and transaction tracking
- **Interactive Elements**: Drag & drop file uploads, animated particles
- **TypeScript**: Full type safety and better developer experience

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Framer Motion** for complex animations
- **GSAP** for timeline-based animations
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications
- **React Dropzone** for file uploads

## 📦 Installation

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

## 🎨 Design System

### Colors
- **Primary**: Deep Blue (#0B1426) - Trust & Security
- **Secondary**: Electric Blue (#00D4FF) - Tech/Blockchain
- **Accent**: Neon Green (#39FF14) - Success/Verified
- **Warning**: Orange (#FF6B35) - Pending
- **Error**: Red (#FF3B30) - Rejected

### Typography
- **Headers**: Orbitron (Futuristic)
- **Body**: Inter (Clean & Modern)
- **Code**: JetBrains Mono

### Components
- **Glass Morphism**: Translucent cards with backdrop blur
- **Gradient Text**: Blockchain blue to green gradients
- **Animated Buttons**: Hover effects with scale and glow
- **Interactive Cards**: Smooth hover animations

## 📱 Pages

### 1. Landing Page
- Hero section with animated blockchain network
- Feature showcase with staggered animations
- Statistics counter with scroll triggers
- Call-to-action sections

### 2. Dashboard
- Property overview with quick stats
- Recent activity feed
- Interactive property cards
- Quick action buttons

### 3. Register Land
- Multi-step form with smooth transitions
- Drag & drop document upload
- Interactive map integration (placeholder)
- Real-time validation

### 4. My Lands
- Property grid with filtering and sorting
- Search functionality
- Status-based filtering
- Responsive card layout

### 5. Land Details
- Tabbed interface for property information
- Document viewer with IPFS integration
- Blockchain information display
- Interactive map (placeholder)

### 6. Profile
- Wallet information display
- Account settings
- Quick actions
- Statistics overview

## 🎬 Animations

### GSAP Animations
- Hero section timeline
- Scroll-triggered reveals
- Counter animations
- Page transitions

### Framer Motion
- Component hover effects
- Page route animations
- Form step transitions
- Interactive feedback

### Canvas Animations
- Particle background system
- Interactive mouse effects
- Floating blockchain nodes

## 🔗 API Integration

The frontend connects to the backend API for:
- Land registration
- Document upload to IPFS
- Property data retrieval
- User authentication

## 🌐 Web3 Integration

- MetaMask wallet connection
- Account management
- Network switching
- Transaction handling

## 📱 Responsive Design

- Mobile-first approach
- Breakpoint-specific layouts
- Touch-friendly interactions
- Optimized animations for mobile

## 🚀 Build & Deploy

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Test the build:**
   ```bash
   npm run build && serve -s build
   ```

## 🎯 Performance Optimizations

- Lazy loading for heavy components
- Image optimization
- Code splitting
- Animation performance monitoring
- Reduced motion support for accessibility

## 🔧 Development

### Available Scripts
- `npm start` - Development server
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Project Structure
```
src/
├── components/          # Reusable components
│   ├── layout/         # Layout components
│   └── effects/        # Animation components
├── contexts/           # React contexts
├── pages/              # Page components
├── utils/              # Utility functions
└── types/              # TypeScript types
```

## 🎨 Customization

### Colors
Update `tailwind.config.js` to modify the color scheme:
```javascript
colors: {
  blockchain: {
    blue: '#00D4FF',
    green: '#39FF14',
    // ... other colors
  }
}
```

### Animations
Modify animation settings in component files or create new variants in the animation utilities.

## 🐛 Troubleshooting

### Common Issues
1. **MetaMask not detected**: Ensure MetaMask is installed and enabled
2. **API connection failed**: Check backend server is running
3. **Animations not smooth**: Check GPU acceleration is enabled

### Performance Tips
- Use `will-change` CSS property for animated elements
- Implement intersection observer for scroll animations
- Optimize images and assets

## 📄 License

This project is part of the LandChain ecosystem. See the main project README for license information.