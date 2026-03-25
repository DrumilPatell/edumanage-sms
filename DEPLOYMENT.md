# EduManage SMS - Clean Redeploy Guide (Render + Vercel)

This guide is for a full reset deployment: remove old cloud resources, then deploy fresh.

## 1. Delete Old Cloud Deployments

### Render cleanup
1. Open Render dashboard.
2. Delete old Web Service (`edumanage-backend` or older copies).
3. Delete old PostgreSQL instance if you want a completely fresh database.
4. Confirm no stale environment variables remain in any old service.

### Vercel cleanup
1. Open Vercel dashboard.
2. Delete old project(s) for this repo.
3. Remove old environment variables from deleted projects.

## 2. Keep Only Correct Deployment Files in Repo

Your repo should keep these deployment files:
- `backend/runtime.txt`
- `backend/requirements.txt`
- `frontend/vercel.json`
- `DEPLOYMENT.md`

Current required runtime in `backend/runtime.txt`:
```txt
python-3.11.11
```

## 3. Push Latest Code to GitHub

Run from repo root:
```bash
git add .
git commit -m "reset deployment config"
git push origin main
```

## 4. Deploy Backend on Render (Fresh)

### 4.1 Create new PostgreSQL
1. Render -> New -> PostgreSQL.
2. Set region `Oregon` (or choose one and keep same for web service).
3. Create DB.
4. Copy Internal Database URL.

### 4.2 Create new Web Service
1. Render -> New -> Web Service.
2. Select your GitHub repo.
3. Configure:
   - Name: `edumanage-backend`
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Python`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables before first deploy:

| Key | Required | Value |
|-----|----------|-------|
| `DATABASE_URL` | Yes | Internal DB URL from Render PostgreSQL |
| `SECRET_KEY` | Yes | Generate a random secret |
| `FRONTEND_URL` | Yes | Temporary: `https://example.com` (update later) |
| `ADMIN_EMAILS` | Recommended | `you@example.com` |
| `GOOGLE_CLIENT_ID` | Optional | Only if Google OAuth is used |
| `GOOGLE_CLIENT_SECRET` | Optional | Only if Google OAuth is used |
| `GOOGLE_REDIRECT_URI` | Optional | `https://<your-backend>.onrender.com/api/auth/google/callback` |
| `MICROSOFT_CLIENT_ID` | Optional | Only if Microsoft OAuth is used |
| `MICROSOFT_CLIENT_SECRET` | Optional | Only if Microsoft OAuth is used |
| `MICROSOFT_REDIRECT_URI` | Optional | `https://<your-backend>.onrender.com/api/auth/microsoft/callback` |
| `GITHUB_CLIENT_ID` | Optional | Only if GitHub OAuth is used |
| `GITHUB_CLIENT_SECRET` | Optional | Only if GitHub OAuth is used |
| `GITHUB_REDIRECT_URI` | Optional | `https://<your-backend>.onrender.com/api/auth/github/callback` |

5. Deploy service.
6. After deploy, verify:
   - `https://<your-backend>.onrender.com/health`
   - `https://<your-backend>.onrender.com/api/docs`

## 5. Deploy Frontend on Vercel (Fresh)

1. Vercel -> New Project.
2. Import same GitHub repo.
3. Set:
   - Framework: `Vite`
   - Root Directory: `frontend`
4. Add environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://<your-backend>.onrender.com/api` |

5. Deploy.
6. Copy Vercel URL: `https://<your-frontend>.vercel.app`.

## 6. Final Cross-Update (Important)

1. Go back to Render backend service environment.
2. Update `FRONTEND_URL` to exact Vercel URL.
3. Redeploy backend once.

## 7. OAuth Provider Update (If OAuth Enabled)

Set callback/origin URLs in provider dashboards to your fresh URLs.

Google example:
- Redirect URI: `https://<your-backend>.onrender.com/api/auth/google/callback`
- JS Origin: `https://<your-frontend>.vercel.app`

## 8. Common Failures and Fixes

### "Could not fetch Python version"
- Ensure `backend/runtime.txt` is `python-3.11.11`.
- Push change and redeploy.

### CORS error in browser
- `FRONTEND_URL` in Render must exactly match Vercel URL.
- No trailing slash.

### API calls failing from frontend
- Check `VITE_API_URL` in Vercel points to `/api` on Render backend.
- Redeploy Vercel after env var changes.

### Database connection issues
- Use Render Internal Database URL.
- Ensure backend and DB are in same region.
