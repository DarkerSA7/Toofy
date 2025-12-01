# 🎌 Toofy - Anime Platform

A modern, high-performance anime platform built with Next.js 16, Go Fiber, and MongoDB.

## 🚀 Features

- **Next.js 16 with Turbopack** - Lightning-fast frontend with ISR On-Demand
- **Go Fiber API** - High-performance backend with JWT authentication
- **MongoDB** - Scalable database for anime data
- **iDrivee2 Storage** - S3-compatible image storage
- **Real-time Updates** - WebSocket support for live data
- **Responsive Design** - Beautiful UI with Tailwind CSS
- **Image Optimization** - Automatic image caching and optimization

## 📋 Tech Stack

### Frontend
- **Framework**: Next.js 16 with Turbopack
- **UI**: React 19 with Tailwind CSS
- **State Management**: Zustand
- **API Client**: Alova
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Form Validation**: React Hook Form + Zod

### Backend
- **Framework**: Go Fiber v2
- **Database**: MongoDB
- **Authentication**: JWT
- **Storage**: iDrivee2 (S3-compatible)
- **CORS**: Fiber CORS middleware

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas
- **Storage**: iDrivee2

## 📁 Project Structure

```
toofy4/
├── frontend/          # Next.js application
│   ├── src/
│   ├── .env.production
│   ├── vercel.json
│   └── next.config.ts
│
└── backend/           # Go Fiber API
    ├── controllers/
    ├── models/
    ├── routes/
    ├── main.go
    ├── go.mod
    └── render.yaml
```

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ (for frontend)
- Go 1.21+ (for backend)
- MongoDB (local or Atlas)
- pnpm (for frontend package management)

### Frontend Setup

```bash
cd frontend
pnpm install
pnpm dev
```

Visit `http://localhost:3000`

### Backend Setup

```bash
cd backend
go mod download
go run main.go
```

Backend runs on `http://localhost:8081`

### Environment Variables

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api
```

**Backend** (`.env`):
```env
MONGODB_URI=mongodb://localhost:27017/toofy
JWT_SECRET=your-secret-key
IDRIVEE2_ACCESS_KEY=your-key
IDRIVEE2_SECRET_KEY=your-secret
IDRIVEE2_ENDPOINT=your-endpoint
IDRIVEE2_BUCKET=cover-animes
PORT=8081
```

## � Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect Vercel to GitHub repository
3. Set `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
4. Deploy

### Backend (Render)
1. Push to GitHub
2. Connect Render to GitHub repository
3. Set environment variables (MongoDB, JWT, iDrivee2)
4. Deploy

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Environment variable protection
- Secure image storage with UUID keys

## 📊 Caching Strategy

- **ISR On-Demand**: Dynamic pages revalidate on-demand
- **Image Caching**: Images cached for 1 year (UUID prevents conflicts)
- **Browser Caching**: Optimized cache headers for performance

## 🧪 Testing

### Frontend
```bash
cd frontend
pnpm test
```

### Backend
```bash
cd backend
go test ./...
```

## 🐛 Troubleshooting

- **CORS Error**: Update backend CORS in `main.go`
- **API Connection Failed**: Check `NEXT_PUBLIC_API_URL` is correct
- **Images Not Loading**: Verify iDrivee2 credentials
- **Database Error**: Check MongoDB connection string

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🎉 Credits

Built with ❤️ for anime enthusiasts worldwide.

---

**Happy Coding! 🚀**
