# Deployment Guide for SyncTunes

## Quick Start for Local Development

### Prerequisites
1. **Node.js 18+** - Download from https://nodejs.org
2. **Git** - For cloning the repository

### Setup Steps

1. **Clone and install:**
```bash
git clone <your-repo-url>
cd synctunes
npm install
```

2. **Install yt-dlp (for music functionality):**

**Windows:**
```bash
# Using chocolatey (recommended)
choco install yt-dlp

# Or download from: https://github.com/yt-dlp/yt-dlp/releases
# Add the exe to your PATH
```

**macOS:**
```bash
# Using homebrew
brew install yt-dlp

# Or using pip
pip install yt-dlp
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install yt-dlp

# Or using pip
pip install yt-dlp
```

3. **Run locally:**
```bash
npm run dev
```

Visit `http://localhost:5000` - your app is running!

---

## Cloud Deployment Options

### Option 1: Render (Recommended - Best for this app)

**Why Render?** 
- Full WebSocket support ✅
- Can install yt-dlp ✅  
- PostgreSQL database included ✅
- Simple deployment ✅

**Steps:**
1. Push your code to GitHub
2. Go to https://render.com and connect your GitHub
3. Create a new "Web Service"
4. Settings:
   - **Repository:** Your GitHub repo
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node

5. Add environment variables:
   ```
   NODE_ENV=production
   ```

6. **For yt-dlp support,** update build command to:
   ```bash
   apt-get update && apt-get install -y python3-pip && pip3 install yt-dlp && npm install && npm run build
   ```

**Cost:** Free tier available, then $7/month

---

### Option 2: Railway

**Why Railway?**
- Very simple setup ✅
- WebSocket support ✅
- Good performance ✅

**Steps:**
1. Push code to GitHub
2. Go to https://railway.app
3. "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects and deploys!

**Environment variables:**
```
NODE_ENV=production
```

**Cost:** $5/month minimum

---

### Option 3: Vercel (Limited functionality)

**Limitations:** 
- WebSocket support is limited ⚠️
- Cannot install yt-dlp easily ⚠️
- Real-time features may not work properly ⚠️

**Only use Vercel if:**
- You want static hosting only
- You'll handle music streaming differently
- You don't need real-time features

**Steps:**
```bash
npm install -g vercel
vercel --prod
```

---

### Option 4: Heroku

**Steps:**
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add buildpacks:
   ```bash
   heroku buildpacks:add heroku/nodejs
   heroku buildpacks:add heroku-community/apt
   ```
5. Create `Aptfile` for yt-dlp:
   ```
   python3-pip
   ```
6. Deploy:
   ```bash
   git push heroku main
   ```

**Cost:** $7/month minimum

---

## Database Setup (Production)

For production, you'll need PostgreSQL:

### Render Database:
1. Create PostgreSQL database in Render
2. Copy the connection string
3. Add as environment variable: `DATABASE_URL`

### Railway Database:
1. Add PostgreSQL plugin
2. Connection string auto-provided

### External Database (any platform):
Use services like:
- **Neon** (free tier): https://neon.tech
- **Supabase** (free tier): https://supabase.com  
- **PlanetScale** (free tier): https://planetscale.com

---

## Production Checklist

Before deploying:

- [ ] Code pushed to GitHub
- [ ] Environment variables set
- [ ] Database configured (if using persistent storage)
- [ ] yt-dlp installation method chosen
- [ ] WebSocket support confirmed on platform
- [ ] Domain name ready (optional)

---

## Troubleshooting

**App won't start:**
- Check Node.js version (needs 18+)
- Verify all dependencies installed: `npm install`
- Check environment variables

**Music search not working:**
- Ensure yt-dlp is installed on server
- Check if hosting platform allows subprocess execution
- Try Railway or Render instead of Vercel

**WebSocket connection fails:**
- Verify platform supports WebSockets
- Check if firewall blocking connections
- Use wss:// for HTTPS deployments

**Build fails:**
- Check TypeScript errors: `npm run check`
- Ensure all imports are correct
- Verify all dependencies in package.json

---

## Cost Comparison

| Platform | Free Tier | Paid Tier | WebSocket | yt-dlp | Best For |
|----------|-----------|-----------|-----------|---------|----------|
| **Render** | ✅ 750hrs/month | $7/month | ✅ | ✅ | **Recommended** |
| **Railway** | $5 credit | $5/month | ✅ | ✅ | Simple setup |
| **Vercel** | ✅ Generous | $20/month | ⚠️ | ❌ | Frontend only |
| **Heroku** | ❌ | $7/month | ✅ | ✅ | Enterprise |

**Recommendation:** Start with Render free tier, upgrade as needed.