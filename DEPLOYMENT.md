# PowerPoint AI Automation - Deployment Guide

## 🚀 Quick Deploy to Web

### Frontend (Vercel) - FREE
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repo
4. Set Environment Variables:
   - `VITE_API_BASE_URL` = `https://your-backend-url.railway.app`
5. Deploy!

### Backend (Railway) - FREE
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Select backend folder
4. Set Environment Variables:
   - `LITELLM_API_KEY` = `sk-Jb-zYD51whLDcSGpFE3BDw`
   - `LITELLM_BASE_URL` = `https://proxyllm.ximplify.id`
5. Deploy!

## 🔗 Live URLs
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.railway.app`

## 📁 Project Structure
```
ppt/
├── frontend/          # React app
│   ├── vercel.json   # Vercel config
│   └── .env          # Environment variables
└── backend/          # FastAPI server
    ├── Procfile      # Railway config
    ├── requirements.txt
    └── runtime.txt
```
