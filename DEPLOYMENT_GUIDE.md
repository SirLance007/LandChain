# 🚀 LandChain Deployment Guide

## Quick Deployment Steps

### 1. Frontend Deployment (Vercel)
```bash
cd frontend
npm install -g vercel
vercel --prod
```

### 2. Backend Deployment (Railway)
```bash
cd backend
npm install -g @railway/cli
railway login
railway init
railway up
```

### 3. Environment Variables Setup

#### Backend Environment Variables (Railway Dashboard):
- `MONGODB_URI`: Your MongoDB connection string
- `PINATA_API_KEY`: Your Pinata API key
- `PINATA_SECRET_KEY`: Your Pinata secret key
- `CONTRACT_ADDRESS`: 0x2CfB760420FbD34cf7b769a78D0eF4eA4a89d600
- `MONAD_RPC_URL`: https://testnet-rpc.monad.xyz
- `PRIVATE_KEY`: Your blockchain private key
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `SESSION_SECRET`: Random secure string
- `FRONTEND_URL`: Your Vercel frontend URL

#### Frontend Environment Variables (Vercel Dashboard):
- `REACT_APP_API_URL`: Your Railway backend URL + /api
- `REACT_APP_GOOGLE_CLIENT_ID`: Your Google OAuth client ID

### 4. Domain Configuration
- Frontend: `https://landchain-frontend.vercel.app`
- Backend: `https://landchain-backend.railway.app`

### 5. Google OAuth Setup
Update Google OAuth settings:
- Authorized origins: Add your Vercel domain
- Authorized redirect URIs: Add your Vercel domain + /auth/google/callback

### 6. Database Setup
- Use MongoDB Atlas for production database
- Update connection string in environment variables

## Alternative: One-Click Deploy

### Vercel (Frontend)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JaideepSinghChouhan/landchain&project-name=landchain-frontend&root-directory=frontend)

### Railway (Backend)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/JaideepSinghChouhan/landchain&referralCode=landchain)

## Post-Deployment Checklist
- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] Database connection works
- [ ] Google OAuth works
- [ ] File upload (IPFS) works
- [ ] Blockchain integration works
- [ ] Property registration works
- [ ] Property transfers work

## Troubleshooting
- Check environment variables
- Verify CORS settings
- Check database connection
- Verify API endpoints
- Test blockchain connectivity