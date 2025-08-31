#!/bin/bash

echo "🚀 Building PowerPoint AI Automation for deployment..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Frontend built successfully!"
echo "📁 Build files are in: frontend/dist/"
echo ""
echo "🌐 Next steps:"
echo "1. Push code to GitHub"
echo "2. Deploy backend to Railway.app"
echo "3. Deploy frontend to Vercel.com"
echo "4. Update VITE_API_BASE_URL in Vercel settings"
