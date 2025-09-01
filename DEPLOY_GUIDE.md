# 🚀 PowerPoint AI Automation - Free Deployment Guide

## 📋 Quick Deploy (5 minutes)

### 1️⃣ Push to GitHub
```bash
# Already done! Your code is committed.
# Now push to GitHub:
git remote add origin https://github.com/YOUR_USERNAME/ppt-ai-automation
git branch -M main
git push -u origin main
```

### 2️⃣ Deploy Backend to Render
1. Go to [render.com](https://render.com) 
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repo
5. Use these settings:
   - **Name**: `ppt-ai-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   - `LITELLM_API_KEY` = `sk-Jb-zYD51whLDcSGpFE3BDw`
   - `LITELLM_BASE_URL` = `https://proxyllm.ximplify.id`
7. Deploy! (takes 5-10 minutes)
8. Copy your Render URL: `https://ppt-ai-backend.onrender.com`

### 3️⃣ Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Import Project"
4. Select your GitHub repo
5. Use these settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
6. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://ppt-ai-backend.onrender.com`
7. Deploy! (takes 2-3 minutes)
8. Get your live URL: `https://your-app.vercel.app`

## 🎉 Done! 
Your app is live and ready for clients!

## 🔧 If you need help:
1. Check deployment logs in Render/Vercel dashboards
2. Make sure environment variables are set correctly
3. Both services have free tiers that are perfect for this app
