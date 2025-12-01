# ✅ Deployment Checklist - Toofy Anime Platform

## 🔧 Pre-Deployment Setup

### Backend (Go Fiber)
- [ ] All code committed to GitHub
- [ ] `.env` file created with all required variables
- [ ] MongoDB connection tested locally
- [ ] iDrivee2 credentials verified
- [ ] CORS configuration updated for production URLs
- [ ] All tests passing: `go test ./...`
- [ ] Backend runs locally: `go run main.go`

### Frontend (Next.js)
- [ ] All code committed to GitHub
- [ ] `.env.production` created with Render backend URL
- [ ] Build succeeds locally: `pnpm build`
- [ ] No console errors in development
- [ ] All environment variables configured
- [ ] API calls use `NEXT_PUBLIC_API_URL`

---

## 🚀 Deployment Steps

### Step 1: Backend Deployment (Render)

#### 1.1 Create Render Account
- [ ] Sign up at https://render.com
- [ ] Verify email

#### 1.2 Connect GitHub
- [ ] Go to Render Dashboard
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub account
- [ ] Select your repository

#### 1.3 Configure Web Service
- [ ] **Name**: `toofy-backend`
- [ ] **Runtime**: `Go`
- [ ] **Build Command**: `go build -o main .`
- [ ] **Start Command**: `./main`
- [ ] **Region**: Select closest to users
- [ ] **Plan**: Free or Paid (as needed)

#### 1.4 Set Environment Variables
In Render dashboard, add:
```
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
IDRIVEE2_ACCESS_KEY=<your-access-key>
IDRIVEE2_SECRET_KEY=<your-secret-key>
IDRIVEE2_ENDPOINT=<your-endpoint>
IDRIVEE2_BUCKET=cover-animes
PORT=8081
```

#### 1.5 Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete
- [ ] Check deployment logs for errors
- [ ] Note the backend URL: `https://toofy-backend.onrender.com`

#### 1.6 Verify Backend
- [ ] Test health check: `curl https://toofy-backend.onrender.com/api/anime`
- [ ] Response should be 200 OK

---

### Step 2: Frontend Deployment (Vercel)

#### 2.1 Create Vercel Account
- [ ] Sign up at https://vercel.com
- [ ] Verify email

#### 2.2 Connect GitHub
- [ ] Go to Vercel Dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Connect GitHub account
- [ ] Select your repository

#### 2.3 Configure Project
- [ ] **Project Name**: `toofy-frontend`
- [ ] **Root Directory**: `frontend`
- [ ] **Framework Preset**: `Next.js`
- [ ] **Build Command**: `pnpm build`
- [ ] **Output Directory**: `.next`

#### 2.4 Set Environment Variables
In Vercel dashboard, add:
```
NEXT_PUBLIC_API_URL=https://toofy-backend.onrender.com/api
```

#### 2.5 Deploy
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Check build logs for errors
- [ ] Note the frontend URL: `https://toofy-frontend.vercel.app`

#### 2.6 Verify Frontend
- [ ] Visit the Vercel URL
- [ ] Page loads without errors
- [ ] Check browser console for errors

---

## 🔗 Integration Testing

### Test Backend → Frontend Connection
- [ ] Frontend can reach backend API
- [ ] No CORS errors in browser console
- [ ] API responses are correct

### Test Core Features
- [ ] Login page loads
- [ ] Can login with credentials
- [ ] Home page displays slider
- [ ] Can add new anime
- [ ] Can edit anime
- [ ] Can delete anime
- [ ] Images upload correctly
- [ ] Images display correctly
- [ ] Slider animation works
- [ ] Pagination works

### Test Edge Cases
- [ ] Add anime without image
- [ ] Edit anime and change image
- [ ] Delete anime with image
- [ ] Bulk operations work
- [ ] Error messages display correctly

---

## 📊 Post-Deployment

### Monitoring
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Monitor Render logs
- [ ] Monitor Vercel logs
- [ ] Check database performance

### Performance
- [ ] Test page load times
- [ ] Test API response times
- [ ] Verify ISR cache is working
- [ ] Check image optimization

### Security
- [ ] Verify HTTPS is enforced
- [ ] Check CORS is restricted
- [ ] Verify JWT tokens work
- [ ] Test authentication flows

---

## 🆘 Troubleshooting

### Backend Won't Deploy
- [ ] Check GitHub is connected
- [ ] Verify all files are committed
- [ ] Check build logs in Render
- [ ] Verify Go version compatibility
- [ ] Check environment variables are set

### Frontend Won't Deploy
- [ ] Check GitHub is connected
- [ ] Verify all files are committed
- [ ] Check build logs in Vercel
- [ ] Verify Node.js version compatibility
- [ ] Check environment variables are set

### API Connection Issues
- [ ] Verify backend URL in `.env.production`
- [ ] Check CORS configuration in backend
- [ ] Verify backend is running
- [ ] Check browser console for errors
- [ ] Test API endpoint directly with curl

### Image Upload Issues
- [ ] Verify iDrivee2 credentials
- [ ] Check bucket name is correct
- [ ] Verify iDrivee2 endpoint is correct
- [ ] Check file permissions

---

## 📝 Final Checklist

- [ ] Backend deployed and running
- [ ] Frontend deployed and running
- [ ] Backend and frontend can communicate
- [ ] All core features tested
- [ ] No errors in logs
- [ ] Performance is acceptable
- [ ] Security measures in place
- [ ] Monitoring configured
- [ ] Team notified of deployment
- [ ] Documentation updated

---

## 🎉 Success!

Your Toofy Anime Platform is now live!

**Frontend**: https://toofy-frontend.vercel.app
**Backend**: https://toofy-backend.onrender.com
**Database**: MongoDB Atlas
**Storage**: iDrivee2

Congratulations! 🚀
