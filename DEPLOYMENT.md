# Deployment Guide - EduManage SMS

## Prerequisites
- GitHub account with your code pushed to a repository
- Vercel account (free): https://vercel.com
- Render account (free): https://render.com
- PostgreSQL database (Render provides free tier)

---

## Step 1: Push Code to GitHub

If not already done:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## Step 2: Deploy Backend on Render

### 2.1 Create PostgreSQL Database
1. Go to https://dashboard.render.com
2. Click **New +** → **PostgreSQL**
3. Fill in:
   - Name: `edumanage-db`
   - Database: `edumanage`
   - User: `edumanage_user`
   - Region: Oregon (US West)
   - Plan: **Free**
4. Click **Create Database**
5. Wait for creation, then copy the **Internal Database URL** (starts with `postgresql://`)

### 2.2 Deploy Backend Service
1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - Name: `edumanage-backend`
   - Region: Oregon (same as database)
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: **Python 3**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Plan: **Free**

4. Add Environment Variables (click **Advanced** → **Add Environment Variable**):

| Key | Value |
|-----|-------|
| `DATABASE_URL` | (paste the Internal Database URL from step 2.1) |
| `SECRET_KEY` | (click "Generate" for a random secure key) |
| `FRONTEND_URL` | `https://your-app-name.vercel.app` (update after Vercel deploy) |
| `GOOGLE_CLIENT_ID` | (your Google OAuth client ID) |
| `GOOGLE_CLIENT_SECRET` | (your Google OAuth client secret) |
| `GOOGLE_REDIRECT_URI` | `https://edumanage-backend.onrender.com/api/auth/google/callback` |
| `ADMIN_EMAILS` | `your-admin-email@gmail.com` |

5. Click **Create Web Service**
6. Wait for deployment (takes 2-5 minutes)
7. Copy your backend URL: `https://edumanage-backend.onrender.com`

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Import Project
1. Go to https://vercel.com/new
2. Click **Import** next to your GitHub repository
3. Configure:
   - Framework Preset: **Vite**
   - Root Directory: `frontend`

### 3.2 Add Environment Variables
Click **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://edumanage-backend.onrender.com/api` |

### 3.3 Deploy
1. Click **Deploy**
2. Wait for build (takes 1-2 minutes)
3. Copy your frontend URL: `https://your-app-name.vercel.app`

---

## Step 4: Update OAuth Redirect URIs

### Update Render Backend
Go to your Render dashboard → Web Service → Environment:
- Update `FRONTEND_URL` to your actual Vercel URL

### Update Google Cloud Console (if using Google OAuth)
1. Go to https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client
3. Add Authorized redirect URIs:
   - `https://edumanage-backend.onrender.com/api/auth/google/callback`
4. Add Authorized JavaScript origins:
   - `https://your-app-name.vercel.app`
   - `https://edumanage-backend.onrender.com`

### Similar for Microsoft/GitHub OAuth
Update redirect URIs in respective developer consoles.

---

## Step 5: Verify Deployment

1. Visit your Vercel URL
2. Click "Login with Google" (or configured provider)
3. Verify you can log in and access the dashboard

---

## Troubleshooting

### Backend not starting
- Check Render logs for errors
- Verify DATABASE_URL is correct
- Ensure all required env variables are set

### Render build fails with "Could not fetch Python version"
- Update `backend/runtime.txt` to a currently available patch version (example: `python-3.11.11`)
- Commit and push the change, then trigger **Manual Deploy** in Render
- Avoid pinning to very old patch versions because they may be removed from the build image catalog

### CORS errors
- Verify FRONTEND_URL in Render matches your Vercel URL exactly
- No trailing slash in URLs

### OAuth not working
- Double-check redirect URIs match exactly
- Ensure OAuth credentials are correct
- Check browser console for specific errors

### Database connection issues
- Use Internal Database URL (not External) for better performance
- Verify database is in the same region as web service

---

## Free Tier Limitations

### Render (Free)
- Web service spins down after 15 mins of inactivity
- First request after sleep takes ~30 seconds
- 750 hours/month

### Vercel (Free)
- 100GB bandwidth/month
- Serverless function limits apply

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed

### Render
1. Go to Web Service → Settings → Custom Domains
2. Add domain and configure DNS

---

## Environment Variables Reference

### Backend (Render)
```
DATABASE_URL=postgresql://user:pass@host/dbname
SECRET_KEY=your-secret-key-here
FRONTEND_URL=https://your-app.vercel.app
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/auth/google/callback
ADMIN_EMAILS=admin@example.com
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com/api
```
