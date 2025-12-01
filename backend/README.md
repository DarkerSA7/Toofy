# Toofy Backend - Authentication System

نظام تسجيل الدخول متكامل مع Go و Fiber و MongoDB

## المتطلبات

- Go 1.21+
- MongoDB Atlas (أو MongoDB محلي)
- Git

## التثبيت

### 1. استنساخ المشروع

```bash
cd toofy4/backend
```

### 2. تثبيت المكتبات

```bash
go mod download
```

### 3. إعداد متغيرات البيئة

أنشئ ملف `.env` في جذر المشروع:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/toofy?retryWrites=true&w=majority
MONGODB_DB=toofy

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=24h

# Server Configuration
PORT=8081
ENV=development

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
```

### 4. تشغيل الخادم

```bash
go run main.go
```

الخادم سيبدأ على `http://localhost:8081`

## هيكل المشروع

```
backend/
├── config/          # إعدادات التطبيق
├── database/        # اتصال MongoDB
├── models/          # نماذج البيانات
├── controllers/     # منطق التحكم
├── middleware/      # وسيط المصادقة والتحقق
├── routes/          # تعريف المسارات
├── utils/           # دوال مساعدة (JWT, Password)
├── main.go          # نقطة الدخول
├── go.mod           # ملف المكتبات
└── .env             # متغيرات البيئة
```

## API Endpoints

### المصادقة (Public)

#### تسجيل مستخدم جديد
```http
POST /api/auth/register
Content-Type: application/json

{
  "displayName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**الرد:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "...",
      "displayName": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### تسجيل الدخول
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**الرد:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "...",
      "displayName": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### المستخدم الحالي (Protected)

#### الحصول على بيانات المستخدم الحالي
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**الرد:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "...",
      "displayName": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### المستخدمون (Protected)

#### الحصول على جميع المستخدمين
```http
GET /api/users
Authorization: Bearer <token>
```

#### الحصول على مستخدم بواسطة ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### إنشاء مستخدم جديد
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123",
  "role": "user"
}
```

#### تحديث دور المستخدم
```http
PUT /api/users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "admin"
}
```

#### حذف مستخدم
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

## الميزات

✅ تسجيل مستخدمين جدد
✅ تسجيل الدخول مع JWT
✅ إدارة المستخدمين (CRUD)
✅ نظام الأدوار (Admin/User)
✅ تجزئة كلمات المرور بـ bcrypt
✅ التحقق من صحة المدخلات
✅ معالجة الأخطاء الشاملة
✅ CORS مفعل
✅ MongoDB للتخزين الدائم

## الأمان

- كلمات المرور مجزأة باستخدام bcrypt
- JWT للمصادقة والتفويض
- التحقق من صحة المدخلات
- CORS محدود للنطاقات المسموحة
- معالجة الأخطاء الآمنة

## التطوير المستقبلي

- [ ] نظام WebSocket للتحديثات الفورية
- [ ] إعادة تعيين كلمة المرور
- [ ] المصادقة الثنائية (2FA)
- [ ] تسجيل الأنشطة (Logging)
- [ ] اختبارات الوحدة
- [ ] التوثيق التفاعلي (Swagger)

## الترخيص

MIT
