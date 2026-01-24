# Google OAuth Setup Instructions

## 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" 
   - Click "Enable"

## 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure OAuth consent screen first if prompted:
   - Choose "External" user type
   - Fill in app name: "LandChain"
   - Add your email as developer contact
   - Add scopes: email, profile, openid
4. Create OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: "LandChain Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3001`
     - `http://localhost:5001`
   - Authorized redirect URIs:
     - `http://localhost:5001/api/auth/google/callback`

## 3. Update Environment Variables

Copy the Client ID and Client Secret from Google Console and update `backend/.env`:

```env
GOOGLE_CLIENT_ID=your-actual-google-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret-here
```

## 4. Test the Setup

1. Start backend server: `cd backend && npm start`
2. Start frontend server: `cd frontend && npm start`
3. Go to `http://localhost:3001/login`
4. Click "Continue with Google"
5. Should redirect to Google OAuth consent screen

## 5. Features Added

✅ **Backend:**
- User model with Google OAuth integration
- Session-based authentication
- Auth routes for login/logout
- User-specific land filtering by userId

✅ **Frontend:**
- AuthContext for user management
- Login page with Google OAuth
- Updated Navbar with user profile
- User-specific land filtering
- Protected routes requiring authentication

✅ **Database Schema:**
- Added `userId` field to Land model
- User collection for storing Google OAuth data
- Indexed userId field for faster queries

## 6. How It Works

1. **User Login:** User clicks "Continue with Google" → Redirects to Google OAuth
2. **Authentication:** Google redirects back with user data → Backend creates/updates user
3. **Session:** User session stored in backend, frontend gets user data
4. **Land Registration:** When registering land, userId is automatically added
5. **Filtering:** MyLands and Dashboard show only user's properties using userId
6. **Admin Panel:** Shows all properties (no user filtering)

## 7. Benefits

- **Better Security:** User-specific data isolation
- **Scalability:** Efficient database queries with userId indexing  
- **User Experience:** No need to remember wallet addresses
- **Admin Features:** Easy user management and property oversight