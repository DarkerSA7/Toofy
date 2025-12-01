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
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   ├── features/        # Feature modules
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and helpers
│   │   └── stores/          # Zustand stores
│   ├── public/              # Static assets
│   ├── .env.production      # Production environment variables
│   ├── next.config.ts       # Next.js configuration
│   └── vercel.json          # Vercel deployment config
│
├── backend/                  # Go Fiber API
│   ├── controllers/         # API handlers
│   ├── models/              # Data models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── database/            # Database connection
│   ├── config/              # Configuration
│   ├── main.go              # Entry point
│   ├── go.mod               # Go dependencies
│   └── render.yaml          # Render deployment config
│
└── docs/                     # Documentation
    ├── DEPLOYMENT_GUIDE.md
    └── DEPLOYMENT_CHECKLIST.md
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

## 📦 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Anime
- `GET /api/anime` - Get all anime (paginated)
- `GET /api/anime/:id` - Get single anime
- `POST /api/anime` - Create anime (admin)
- `PUT /api/anime/:id` - Update anime (admin)
- `DELETE /api/anime/:id` - Delete anime (admin)

### Episodes
- `GET /api/episodes?animeId=:id` - Get episodes for anime
- `POST /api/episodes` - Create episode (admin)
- `PUT /api/episodes/:id` - Update episode (admin)
- `DELETE /api/episodes/:id` - Delete episode (admin)

### Slider
- `GET /api/slider` - Get slider items
- `PUT /api/slider` - Update slider items (admin)

### Upload
- `POST /api/upload/cover` - Upload anime cover
- `DELETE /api/upload/cover` - Delete anime cover
- `GET /api/upload/image/:key` - Get image

### Users
- `GET /api/users` - Get all users (admin)
- `POST /api/users` - Create user (admin)
- `PUT /api/users/:id/role` - Update user role (admin)
- `DELETE /api/users/:id` - Delete user (admin)

## 🚀 Deployment

### Quick Start
1. Read `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Follow `DEPLOYMENT_CHECKLIST.md` for step-by-step deployment

### Frontend (Vercel)
```bash
# Environment variables needed:
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
```

### Backend (Render)
```bash
# Environment variables needed:
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
IDRIVEE2_ACCESS_KEY=your-key
IDRIVEE2_SECRET_KEY=your-secret
IDRIVEE2_ENDPOINT=your-endpoint
IDRIVEE2_BUCKET=cover-animes
PORT=8081
```

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

## 📝 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist
- [API Documentation](./backend/README.md) - API endpoints reference

## 🐛 Troubleshooting

### Common Issues

**CORS Error**
- Update backend CORS configuration
- Verify frontend URL is allowed

**API Connection Failed**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Check network connectivity

**Images Not Loading**
- Verify iDrivee2 credentials
- Check bucket name is correct
- Verify image URLs in database

**Database Connection Failed**
- Verify MongoDB URI is correct
- Check network access to MongoDB
- Verify credentials

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review deployment logs
3. Check browser console for errors
4. Review backend logs

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🎉 Credits

Built with ❤️ for anime enthusiasts worldwide.

---

**Happy Coding! 🚀**
