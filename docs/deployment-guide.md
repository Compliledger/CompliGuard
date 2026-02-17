# CompliGuard Deployment Guide

> Deploy backend on **Railway** and frontend on **Vercel** for production.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Frontend (React + Vite)                                │    │
│  │  https://compli-guard.vercel.app                        │    │
│  └──────────────────────────┬──────────────────────────────┘    │
└─────────────────────────────┼───────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         RAILWAY                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Backend (Node.js + Express)                            │    │
│  │  https://compli-guard-api.up.railway.app                │    │
│  │  Port: 3001 (auto-assigned by Railway)                  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Deploy Backend on Railway

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `CompliGuard` repository
4. Railway will auto-detect it as a Node.js project

### Step 3: Configure Build Settings

In the Railway dashboard, go to **Settings** → **Build**:

| Setting | Value |
|---------|-------|
| Root Directory | `/` (root) |
| Build Command | `npm install && npm run build` |
| Start Command | `npm run mock-server` |

### Step 4: Set Environment Variables

Go to **Variables** tab and add:

```env
PORT=3001
NODE_ENV=production
```

### Step 5: Deploy

1. Railway will auto-deploy on push to `main`
2. After deployment, go to **Settings** → **Networking**
3. Click **"Generate Domain"** to get a public URL
4. Note the URL (e.g., `https://compli-guard-api.up.railway.app`)

### Step 6: Verify Backend

```bash
# Health check
curl https://compli-guard-api.up.railway.app/health

# Compliance status
curl https://compli-guard-api.up.railway.app/api/compliance/status
```

---

## Part 2: Deploy Frontend on Vercel

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Select **"Import Git Repository"**
3. Choose your `CompliGuard` repository

### Step 3: Configure Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### Step 4: Set Environment Variables

Add the following environment variable:

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://compli-guard-api.up.railway.app` |

> Replace with your actual Railway backend URL from Step 5 above.

### Step 5: Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy automatically
3. Note your frontend URL (e.g., `https://compli-guard.vercel.app`)

### Step 6: Verify Frontend

1. Open your Vercel URL in a browser
2. Navigate to `/dashboard`
3. Verify the compliance status loads from the backend

---

## Part 3: Railway Configuration Files (Optional)

For more control, add these files to your repo root:

### `railway.toml`

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run mock-server"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 5
```

### `Procfile` (alternative)

```
web: npm run mock-server
```

---

## Part 4: Vercel Configuration (Optional)

Add to `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Part 5: CORS Configuration

The backend already has CORS enabled for all origins. For production, you may want to restrict it:

Edit `src/api/mock-server.ts`:

```typescript
app.use(cors({
  origin: [
    'https://compli-guard.vercel.app',
    'http://localhost:5173'  // for local dev
  ],
  credentials: true
}));
```

---

## Part 6: Custom Domain (Optional)

### Railway (Backend)
1. Go to **Settings** → **Networking**
2. Add custom domain (e.g., `api.compli-guard.com`)
3. Update DNS with the provided CNAME

### Vercel (Frontend)
1. Go to **Settings** → **Domains**
2. Add custom domain (e.g., `compli-guard.com`)
3. Update DNS with the provided A/CNAME records

---

## Quick Commands Summary

### Local Development

```bash
# Terminal 1: Backend
npm run mock-server

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Production Build Test

```bash
# Backend
npm run build
npm run mock-server

# Frontend
cd frontend
npm run build
npm run preview
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Ensure backend allows your frontend origin |
| 404 on refresh | Add Vercel rewrites to `vercel.json` |
| API not connecting | Check `VITE_API_BASE_URL` env var |
| Build fails | Check Node.js version (requires 18+) |
| Health check fails | Ensure `/health` endpoint returns 200 |

---

## Deployment Checklist

- [ ] Backend deployed on Railway
- [ ] Railway domain generated
- [ ] Backend health check passing
- [ ] Frontend deployed on Vercel
- [ ] `VITE_API_BASE_URL` set to Railway URL
- [ ] Dashboard loads compliance status
- [ ] Scenario switching works
- [ ] CORS configured properly

---

## Cost Estimate

| Service | Plan | Cost |
|---------|------|------|
| Railway | Hobby | $5/month (includes $5 credit) |
| Vercel | Hobby | Free |
| **Total** | | ~$5/month |

Both services have free tiers that should be sufficient for hackathon demo purposes.
