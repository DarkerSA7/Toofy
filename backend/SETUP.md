# دليل الإعداد - Toofy Backend

## المتطلبات الأساسية

قبل البدء، تأكد من تثبيت:

1. **Go 1.21+**
   - [تحميل Go](https://golang.org/dl/)
   - تحقق من التثبيت: `go version`

2. **MongoDB**
   - خيار 1: MongoDB Atlas (سحابي) - [رابط التسجيل](https://www.mongodb.com/cloud/atlas)
   - خيار 2: MongoDB محلي - [تحميل MongoDB](https://www.mongodb.com/try/download/community)
   - خيار 3: Docker (الأسهل)

3. **Git** (اختياري)
   - [تحميل Git](https://git-scm.com/)

## الخطوة 1: إعداد MongoDB

### الخيار A: استخدام Docker (الموصى به)

```bash
# تثبيت Docker من https://www.docker.com/

# تشغيل MongoDB و Mongo Express
cd backend
docker-compose up -d

# MongoDB سيكون متاحاً على: localhost:27017
# Mongo Express (واجهة ويب) على: http://localhost:8081
# اسم المستخدم: admin
# كلمة المرور: password
```

### الخيار B: MongoDB Atlas (سحابي)

1. انتقل إلى [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. أنشئ حساباً جديداً
3. أنشئ مشروعاً جديداً
4. أنشئ cluster جديد (اختر الخطة المجانية)
5. انسخ connection string
6. ضع الـ connection string في ملف `.env`

### الخيار C: MongoDB محلي

```bash
# Windows
# قم بتحميل MongoDB Community Edition من الموقع الرسمي
# واتبع التعليمات

# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install mongodb
sudo systemctl start mongodb
```

## الخطوة 2: إعداد البيئة

### 1. استنساخ المشروع (إذا كان في Git)

```bash
git clone <repository-url>
cd toofy4/backend
```

### 2. إنشاء ملف `.env`

```bash
# Windows (PowerShell)
New-Item -Path . -Name ".env" -ItemType "file"

# macOS/Linux
touch .env
```

### 3. ملء ملف `.env`

```env
# MongoDB Configuration
MONGODB_URI=mongodb://admin:password@localhost:27017/toofy?authSource=admin
MONGODB_DB=toofy

# أو إذا كنت تستخدم MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/toofy?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRY=24h

# Server Configuration
PORT=8081
ENV=development

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
```

## الخطوة 3: تثبيت المكتبات

```bash
# تحميل المكتبات
go mod download

# تحديث go.sum
go mod tidy
```

## الخطوة 4: تشغيل الخادم

### الطريقة 1: استخدام go run

```bash
go run main.go
```

### الطريقة 2: استخدام Makefile

```bash
make run
```

### الطريقة 3: بناء وتشغيل البرنامج

```bash
# بناء البرنامج
go build -o bin/toofy-backend main.go

# تشغيل البرنامج
./bin/toofy-backend  # macOS/Linux
.\bin\toofy-backend.exe  # Windows
```

## الخطوة 5: التحقق من التشغيل

```bash
# في نافذة terminal جديدة
curl http://localhost:8081/health

# يجب أن تحصل على:
# {"status":"ok","message":"Server is running"}
```

## الخطوة 6: اختبار API

### تسجيل مستخدم جديد

```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### تسجيل الدخول

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

احفظ التوكن الذي تحصل عليه من الرد.

### الحصول على جميع المستخدمين

```bash
curl -X GET http://localhost:8081/api/users \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

## استخدام Postman (اختياري)

1. قم بتحميل [Postman](https://www.postman.com/downloads/)
2. استورد المتغيرات:
   - `base_url`: `http://localhost:8081/api`
   - `token`: (سيتم ملؤه بعد تسجيل الدخول)

3. أنشئ طلبات للـ endpoints المختلفة

## استكشاف الأخطاء

### خطأ: "Failed to connect to MongoDB"

**الحل:**
- تأكد من تشغيل MongoDB
- تحقق من connection string في `.env`
- تأكد من اسم المستخدم وكلمة المرور

### خطأ: "Port 8081 already in use"

**الحل:**
```bash
# ابحث عن العملية التي تستخدم المنفذ
# Windows
netstat -ano | findstr :8081

# macOS/Linux
lsof -i :8081

# أوقف العملية أو غير المنفذ في .env
```

### خطأ: "Cannot find module"

**الحل:**
```bash
go mod download
go mod tidy
```

## الخطوات التالية

1. ✅ تشغيل Backend
2. ⏭️ ربط Frontend مع Backend
3. ⏭️ إضافة ميزات إضافية (2FA, WebSocket, إلخ)

## المراجع

- [Go Documentation](https://golang.org/doc/)
- [Fiber Documentation](https://docs.gofiber.io/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Documentation](https://jwt.io/)

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من ملف README.md
2. تحقق من ملف API.md
3. اطلب المساعدة في المشروع

---

**ملاحظة:** لا تنسَ تغيير `JWT_SECRET` في الإنتاج!
