# ⚡ Quick Start Deployment Guide

## 🎯 Overview
This guide will help you deploy Toofy to production in 30 minutes.

---

## 📋 What You Need

1. **GitHub Account** - Repository with your code
2. **Vercel Account** - For frontend hosting (free)
3. **Render Account** - For backend hosting (free)
4. **MongoDB Atlas Account** - For database (free tier available)
5. **iDrivee2 Credentials** - For image storage

---

## 🚀 Step 1: Backend Deployment (Render) - 10 minutes

### 1.1 Push to GitHub
```bash
cd backend
git add .
git commit -m "Ready for production"
git push origin main
```

### 1.2 Create Render Account
- Go to https://render.com
- Sign up with GitHub
- Authorize Render to access your repositories

### 1.3 Create Web Service
1. Click "New +" → "Web Service"
2. Select your GitHub repository
3. Fill in:
   - **Name**: `toofy-backend`
   - **Runtime**: `Go`
   - **Build Command**: `go build -o main .`
   - **Start Command**: `./main`
   - **Region**: Choose your region
4. Click "Create Web Service"

### 1.4 Add Environment Variables
In Render dashboard:
1. Go to your service
2. Click "Environment"
3. Add these variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/toofy?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-12345
IDRIVEE2_ACCESS_KEY=your-access-key
IDRIVEE2_SECRET_KEY=your-secret-key
IDRIVEE2_ENDPOINT=your-endpoint-url
IDRIVEE2_BUCKET=cover-animes
PORT=8081
```

### 1.5 Wait for Deployment
- Render will automatically deploy
- Check logs for any errors
- Once deployed, you'll get a URL like: `https://toofy-backend.onrender.com`

### 1.6 Test Backend
```bash
curl https://toofy-backend.onrender.com/api/anime
```

Should return: `{"success":true,"data":{"data":[],...}}`

---

## 🎨 Step 2: Frontend Deployment (Vercel) - 10 minutes

### 2.1 Update Environment Variables
Edit `frontend/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://toofy-backend.onrender.com/api
```

### 2.2 Push to GitHub
```bash
cd frontend
git add .env.production
git commit -m "Update backend URL for production"
git push origin main
```

### 2.3 Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub
- Authorize Vercel to access your repositories

### 2.4 Deploy Project
1. Click "Add New..." → "Project"
2. Select your GitHub repository
3. Fill in:
   - **Project Name**: `toofy-frontend`
   - **Root Directory**: `frontend`
   - **Framework**: `Next.js`
4. Click "Deploy"

### 2.5 Add Environment Variables
1. Go to "Settings" → "Environment Variables"
2. Add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://toofy-backend.onrender.com/api`
3. Click "Save"

### 2.6 Redeploy
1. Go to "Deployments"
2. Click "Redeploy" on the latest deployment
3. Wait for build to complete

### 2.7 Test Frontend
- Visit your Vercel URL: `https://toofy-frontend.vercel.app`
- Try logging in
- Test adding an anime

---

## ✅ Verification Checklist

### Backend
- [ ] Backend URL accessible: `https://toofy-backend.onrender.com`
- [ ] API returns data: `GET /api/anime`
- [ ] No errors in Render logs

### Frontend
- [ ] Frontend URL accessible: `https://toofy-frontend.vercel.app`
- [ ] Page loads without errors
- [ ] No CORS errors in browser console
- [ ] Can login successfully

### Integration
- [ ] Frontend can reach backend
- [ ] API calls work correctly
- [ ] Images upload successfully
- [ ] Data persists in database

---

## 🔧 Troubleshooting

### Backend Won't Deploy
**Problem**: Render shows build error
**Solution**:
1. Check Render logs for specific error
2. Verify all Go dependencies are in `go.mod`
3. Ensure `.env` variables are set
4. Try redeploying

### Frontend Won't Deploy
**Problem**: Vercel shows build error
**Solution**:
1. Check Vercel logs for specific error
2. Verify `NEXT_PUBLIC_API_URL` is set
3. Ensure all dependencies are in `package.json`
4. Try redeploying

### CORS Error
**Problem**: Browser shows CORS error
**Solution**:
1. Check backend CORS configuration in `main.go`
2. Update `AllowOrigins` to include Vercel URL
3. Redeploy backend

### API Connection Failed
**Problem**: Frontend can't reach backend
**Solution**:
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check backend is running
3. Test API with curl
4. Check network connectivity

---

## 📊 Next Steps

1. **Monitor Performance**
   - Check Render logs regularly
   - Monitor Vercel analytics
   - Track database performance

2. **Set Up Alerts**
   - Enable error notifications
   - Set up uptime monitoring
   - Configure backup alerts

3. **Optimize**
   - Enable caching
   - Optimize images
   - Monitor database queries

4. **Scale**
   - Upgrade Render plan if needed
   - Add CDN if needed
   - Optimize database indexes

---

## 🎉 Success!

Your Toofy Anime Platform is now live!

**Frontend**: https://toofy-frontend.vercel.app
**Backend**: https://toofy-backend.onrender.com

Share it with the world! 🚀

---

## 📞 Need Help?

1. Check `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Review `DEPLOYMENT_CHECKLIST.md` for step-by-step guide
3. Check logs in Render and Vercel dashboards
4. Review browser console for errors

Good luck! 🍀
