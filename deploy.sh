#!/bin/bash

# LandChain Deployment Script
echo "🚀 Starting LandChain Deployment..."

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📦 Building Frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo "✅ Frontend build successful"

cd ..

echo "🔧 Preparing Backend..."
cd backend
npm install --production
if [ $? -ne 0 ]; then
    echo "❌ Backend dependencies installation failed"
    exit 1
fi
echo "✅ Backend dependencies installed"

cd ..

echo "🎉 Build completed successfully!"
echo ""
echo "Next steps:"
echo "1. Deploy frontend/build folder to Vercel/Netlify"
echo "2. Deploy backend folder to Railway/Heroku"
echo "3. Set up environment variables"
echo "4. Update API URLs"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions"