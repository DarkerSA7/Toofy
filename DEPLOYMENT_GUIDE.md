# 🚀 Deployment Guide - Toofy Anime Platform

## Overview
- **Frontend**: Vercel (Next.js 16 with Turbopack)
- **Backend**: Render (Go Fiber API)
- **Database**: MongoDB Atlas
- **Storage**: iDrivee2 (S3-compatible)

---

## 📋 Prerequisites

### Required Accounts
1. **Vercel Account** - https://vercel.com
2. **Render Account** - https://render.com
3. **MongoDB Atlas** - https://www.mongodb.com/cloud/atlas
4. **GitHub Account** - For repository linking

### Required Credentials
- MongoDB Connection String
- JWT Secret (any random string)
- iDrivee2 Access Key & Secret Key
- iDrivee2 Endpoint URL
- iDrivee2 Bucket Name: `cover-animes`

---

## 🔧 Part 1: Backend Deployment (Render)

### Step 1: Prepare Backend Repository
```bash
# Make sure all files are committed to GitHub
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Create Render Web Service
1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Fill in the details:
   - **Name**: `toofy-backend`
   - **Runtime**: `Go`
   - **Build Command**: `go build -o main .`
   - **Start Command**: `./main`
   - **Region**: Choose closest to your users

### Step 3: Set Environment Variables in Render
In the Render dashboard, add these environment variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/toofy?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this
IDRIVEE2_ACCESS_KEY=your-idrivee2-access-key
IDRIVEE2_SECRET_KEY=your-idrivee2-secret-key
IDRIVEE2_ENDPOINT=your-idrivee2-endpoint-url
IDRIVEE2_BUCKET=cover-animes
PORT=8081
```

### Step 4: Deploy Backend
- Render will automatically deploy when you push to GitHub
- Check deployment status in Render dashboard
- Note the backend URL: `https://toofy-backend.onrender.com`

### Step 5: Verify Backend
```bash
# Test the backend API
curl https://toofy-backend.onrender.com/api/anime
```

---

## 🎨 Part 2: Frontend Deployment (Vercel)

### Step 1: Update Environment Variables
Edit `.env.production` in the frontend folder:

```env
NEXT_PUBLIC_API_URL=https://toofy-backend.onrender.com/api
```

### Step 2: Commit Changes
```bash
cd frontend
git add .env.production
git commit -m "Update backend URL for production"
git push origin main
```

### Step 3: Deploy to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the `frontend` folder as root directory
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL=https://toofy-backend.onrender.com/api`

### Step 4: Deploy
- Click "Deploy"
- Vercel will automatically build and deploy
- Note the frontend URL: `https://toofy-frontend.vercel.app`

### Step 5: Verify Frontend
- Visit your Vercel URL
- Test login and anime operations
- Check browser console for any errors

---

## 🔗 Connecting Frontend & Backend

### CORS Configuration
The backend already has CORS configured for:
- `http://localhost:3000` (development)
- `http://localhost:8081` (development)
- Any origin in production (adjust as needed)

### Update CORS if needed
Edit `backend/main.go`:
```go
app.Use(cors.New(cors.Config{
    AllowOrigins: "https://your-vercel-url.vercel.app,https://toofy-backend.onrender.com",
    AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
    AllowHeaders: "Content-Type,Authorization",
}))
```

---

## 🧪 Testing Checklist

### Backend Tests
- [ ] Health check: `GET /api/anime`
- [ ] Login: `POST /api/auth/login`
- [ ] Create anime: `POST /api/anime`
- [ ] Upload image: `POST /api/upload/cover`
- [ ] Delete anime: `DELETE /api/anime/:id`

### Frontend Tests
- [ ] Login page loads
- [ ] Can login with credentials
- [ ] Home page displays slider
- [ ] Can add new anime
- [ ] Can edit anime
- [ ] Can delete anime
- [ ] Images load correctly
- [ ] Slider works smoothly

---

## 📊 Monitoring & Debugging

### Render Dashboard
- View logs: https://render.com/dashboard
- Check deployment status
- Monitor resource usage

### Vercel Dashboard
- View logs: https://vercel.com/dashboard
- Check deployment status
- Monitor performance

### Common Issues

#### 1. CORS Error
**Problem**: `Access to XMLHttpRequest blocked by CORS policy`
**Solution**: 
- Update backend CORS settings
- Redeploy backend

#### 2. API Not Found
**Problem**: `404 Not Found` when calling API
**Solution**:
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Check backend logs

#### 3. Images Not Loading
**Problem**: Images show as broken
**Solution**:
- Verify iDrivee2 credentials
- Check bucket name is correct
- Verify image URLs in database

#### 4. Slow Performance
**Problem**: Pages load slowly
**Solution**:
- Check ISR cache is working
- Verify database indexes
- Monitor Render resource usage

---

## 🔄 Continuous Deployment

### Automatic Deployments
Both Vercel and Render are configured for automatic deployment:
- Push to `main` branch → Automatic deployment
- No manual steps needed after initial setup

### Manual Redeployment
**Vercel**: 
- Go to dashboard → Click "Redeploy"

**Render**:
- Go to dashboard → Click "Manual Deploy"

---

## 🛡️ Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB credentials are secure
- [ ] iDrivee2 keys are protected
- [ ] CORS is restricted to known domains
- [ ] No sensitive data in environment variables
- [ ] HTTPS is enforced
- [ ] Rate limiting is configured (optional)

---

## 📞 Support

If you encounter issues:
1. Check the deployment logs
2. Verify all environment variables are set
3. Test API endpoints manually
4. Check browser console for errors
5. Review backend logs for errors

---

## 🎉 Success!

Once everything is working:
- Frontend: `https://your-vercel-url.vercel.app`
- Backend: `https://your-render-url.onrender.com`
- Database: MongoDB Atlas
- Storage: iDrivee2

Your Toofy Anime Platform is now live! 🚀
