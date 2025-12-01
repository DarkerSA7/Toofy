# 🐙 GitHub Setup & Deployment

## 📋 Prerequisites

- GitHub account
- Git installed locally
- Repository created on GitHub

---

## 🚀 Initial Setup

### 1. Initialize Git (if not already done)
```bash
cd toofy4
git init
git add .
git commit -m "Initial commit: Toofy Anime Platform"
```

### 2. Add Remote Repository
```bash
git remote add origin https://github.com/YOUR_USERNAME/toofy4.git
git branch -M main
git push -u origin main
```

### 3. Verify Push
```bash
git log --oneline
git remote -v
```

---

## 📁 Repository Structure

```
toofy4/
├── frontend/                    # Next.js application
│   ├── src/
│   ├── public/
│   ├── .env.production         # Production env vars
│   ├── vercel.json             # Vercel config
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                     # Go Fiber API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── database/
│   ├── config/
│   ├── render.yaml             # Render config
│   ├── main.go
│   ├── go.mod
│   └── go.sum
│
├── README.md                    # Project overview
├── DEPLOYMENT_GUIDE.md          # Detailed deployment
├── DEPLOYMENT_CHECKLIST.md      # Step-by-step checklist
├── QUICK_START_DEPLOYMENT.md    # Quick reference
├── DEPLOYMENT_SUMMARY.md        # Deployment summary
└── GITHUB_SETUP.md             # This file
```

---

## 🔐 GitHub Secrets (Optional)

For CI/CD automation, you can add secrets:

### Frontend Secrets
```
VERCEL_TOKEN=your-vercel-token
VERCEL_PROJECT_ID=your-project-id
VERCEL_ORG_ID=your-org-id
```

### Backend Secrets
```
RENDER_API_KEY=your-render-api-key
RENDER_SERVICE_ID=your-service-id
```

---

## 🔄 Branching Strategy

### Main Branch
- Production-ready code
- Automatic deployment to Vercel & Render
- Protected branch (require PR reviews)

### Development Branch
```bash
git checkout -b develop
# Make changes
git push origin develop
```

### Feature Branches
```bash
git checkout -b feature/new-feature
# Make changes
git push origin feature/new-feature
# Create Pull Request on GitHub
```

---

## 📝 Commit Message Convention

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Tests
- `chore`: Build, dependencies

### Examples
```
feat(anime): add bulk delete functionality
fix(upload): resolve image upload timeout
docs(deployment): update deployment guide
refactor(api): simplify error handling
```

---

## 🚀 Deployment Workflow

### Automatic Deployment
```
Push to main
    ↓
GitHub receives push
    ↓
Vercel detects changes (frontend)
    ↓
Vercel builds and deploys
    ↓
Render detects changes (backend)
    ↓
Render builds and deploys
    ↓
Live! ✅
```

### Manual Deployment
```
# Frontend
vercel deploy --prod

# Backend
render deploy
```

---

## 🔗 Connect Vercel

### Step 1: Authorize Vercel
1. Go to https://vercel.com
2. Click "Import Project"
3. Select "GitHub"
4. Authorize Vercel

### Step 2: Select Repository
1. Search for your repository
2. Click "Import"

### Step 3: Configure
1. **Root Directory**: `frontend`
2. **Framework**: `Next.js`
3. **Build Command**: `pnpm build`
4. **Output Directory**: `.next`

### Step 4: Environment Variables
Add:
```
NEXT_PUBLIC_API_URL=https://toofy-backend.onrender.com/api
```

### Step 5: Deploy
Click "Deploy"

---

## 🔗 Connect Render

### Step 1: Authorize Render
1. Go to https://render.com
2. Click "New +"
3. Select "Web Service"
4. Authorize Render

### Step 2: Select Repository
1. Search for your repository
2. Click "Connect"

### Step 3: Configure
1. **Name**: `toofy-backend`
2. **Runtime**: `Go`
3. **Build Command**: `go build -o main .`
4. **Start Command**: `./main`

### Step 4: Environment Variables
Add all required variables

### Step 5: Deploy
Click "Create Web Service"

---

## 📊 Monitoring Deployments

### Vercel Dashboard
- https://vercel.com/dashboard
- View deployment history
- Check build logs
- Monitor performance

### Render Dashboard
- https://render.com/dashboard
- View deployment history
- Check build logs
- Monitor resource usage

---

## 🔄 Updating Deployments

### Frontend Update
```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main

# Vercel automatically deploys
```

### Backend Update
```bash
# Make changes
git add .
git commit -m "fix: resolve bug"
git push origin main

# Render automatically deploys
```

---

## 🛑 Rollback

### Vercel Rollback
1. Go to Vercel Dashboard
2. Click "Deployments"
3. Find previous deployment
4. Click "Promote to Production"

### Render Rollback
1. Go to Render Dashboard
2. Click "Deployments"
3. Find previous deployment
4. Click "Deploy"

---

## 🔐 Security Best Practices

### Secrets Management
- ✅ Never commit `.env` files
- ✅ Use GitHub Secrets for CI/CD
- ✅ Use Vercel/Render environment variables
- ✅ Rotate secrets regularly

### Access Control
- ✅ Use branch protection rules
- ✅ Require PR reviews
- ✅ Limit who can deploy
- ✅ Use SSH keys for Git

### Code Review
- ✅ Require PR reviews
- ✅ Run tests before merge
- ✅ Check code quality
- ✅ Verify no secrets in code

---

## 📋 Pre-Push Checklist

Before pushing to GitHub:

```bash
# 1. Check status
git status

# 2. Run tests
pnpm test          # Frontend
go test ./...      # Backend

# 3. Check linting
pnpm lint          # Frontend
go fmt ./...       # Backend

# 4. Build locally
pnpm build         # Frontend
go build -o main . # Backend

# 5. Commit
git add .
git commit -m "Your message"

# 6. Push
git push origin main
```

---

## 🎯 GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy Frontend
        run: |
          npm install -g vercel
          vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy Backend
        run: |
          curl -X POST https://api.render.com/deploy \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            -d "serviceId=${{ secrets.RENDER_SERVICE_ID }}"
```

---

## 📞 Troubleshooting

### Push Fails
```bash
# Check remote
git remote -v

# Update remote
git remote set-url origin https://github.com/YOUR_USERNAME/toofy4.git

# Try again
git push origin main
```

### Deployment Fails
1. Check GitHub Actions logs
2. Check Vercel/Render logs
3. Verify environment variables
4. Check build commands

### Merge Conflicts
```bash
# Update main
git fetch origin
git merge origin/main

# Resolve conflicts manually
git add .
git commit -m "Resolve conflicts"
git push origin main
```

---

## 🎉 Success!

Your repository is now connected to GitHub and ready for automated deployment!

### Next Steps:
1. Make changes locally
2. Commit and push to GitHub
3. Vercel & Render automatically deploy
4. Monitor deployments in dashboards
5. Celebrate! 🎉

---

**Happy coding! 🚀**
