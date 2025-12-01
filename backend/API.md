# Toofy Backend - API Documentation

## نظرة عامة

هذا المستند يوضح جميع endpoints المتاحة في نظام المصادقة والمستخدمين.

## Base URL

```
http://localhost:8081/api
```

## المصادقة

جميع الطلبات المحمية تتطلب رأس `Authorization` بالصيغة:

```
Authorization: Bearer <JWT_TOKEN>
```

## Endpoints

### 1. المصادقة (Authentication)

#### 1.1 تسجيل مستخدم جديد

**Endpoint:** `POST /auth/register`

**الوصول:** عام (بدون مصادقة)

**Request Body:**
```json
{
  "displayName": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "SecurePassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "displayName": "أحمد محمد",
      "email": "ahmed@example.com",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "isActive": true
    }
  }
}
```

**Error Response (409 Conflict):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

#### 1.2 تسجيل الدخول

**Endpoint:** `POST /auth/login`

**الوصول:** عام (بدون مصادقة)

**Request Body:**
```json
{
  "email": "ahmed@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "displayName": "أحمد محمد",
      "email": "ahmed@example.com",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "isActive": true
    }
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

#### 1.3 الحصول على بيانات المستخدم الحالي

**Endpoint:** `GET /auth/me`

**الوصول:** محمي (يتطلب JWT)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "displayName": "أحمد محمد",
      "email": "ahmed@example.com",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "isActive": true
    }
  }
}
```

---

### 2. إدارة المستخدمين (Users Management)

#### 2.1 الحصول على جميع المستخدمين

**Endpoint:** `GET /users`

**الوصول:** محمي (يتطلب JWT)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "displayName": "أحمد محمد",
        "email": "ahmed@example.com",
        "role": "user",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "isActive": true
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "displayName": "فاطمة علي",
        "email": "fatima@example.com",
        "role": "admin",
        "createdAt": "2024-01-14T09:15:00Z",
        "updatedAt": "2024-01-14T09:15:00Z",
        "isActive": true
      }
    ]
  }
}
```

---

#### 2.2 الحصول على مستخدم بواسطة ID

**Endpoint:** `GET /users/:id`

**الوصول:** محمي (يتطلب JWT)

**Parameters:**
- `id` (string): معرف المستخدم

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "displayName": "أحمد محمد",
      "email": "ahmed@example.com",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "isActive": true
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

#### 2.3 إنشاء مستخدم جديد

**Endpoint:** `POST /users`

**الوصول:** محمي (يتطلب JWT)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "displayName": "محمد سالم",
  "email": "mohammad@example.com",
  "password": "SecurePassword123",
  "role": "user"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439013",
      "displayName": "محمد سالم",
      "email": "mohammad@example.com",
      "role": "user",
      "createdAt": "2024-01-16T11:45:00Z",
      "updatedAt": "2024-01-16T11:45:00Z",
      "isActive": true
    }
  }
}
```

---

#### 2.4 تحديث دور المستخدم

**Endpoint:** `PUT /users/:id/role`

**الوصول:** محمي (يتطلب JWT)

**Parameters:**
- `id` (string): معرف المستخدم

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User role updated successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid role. Must be 'admin' or 'user'"
}
```

---

#### 2.5 حذف مستخدم

**Endpoint:** `DELETE /users/:id`

**الوصول:** محمي (يتطلب JWT)

**Parameters:**
- `id` (string): معرف المستخدم

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 3. Health Check

#### 3.1 فحص صحة الخادم

**Endpoint:** `GET /health`

**الوصول:** عام (بدون مصادقة)

**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## رموز الحالة (Status Codes)

| الكود | المعنى |
|------|--------|
| 200 | نجح الطلب |
| 201 | تم الإنشاء بنجاح |
| 400 | طلب غير صحيح |
| 401 | غير مصرح (بدون مصادقة) |
| 403 | ممنوع (بدون صلاحيات) |
| 404 | غير موجود |
| 409 | تضارب (مثل: بريد موجود) |
| 500 | خطأ في الخادم |

---

## أمثلة الاستخدام

### استخدام cURL

#### تسجيل مستخدم جديد
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "أحمد محمد",
    "email": "ahmed@example.com",
    "password": "SecurePassword123"
  }'
```

#### تسجيل الدخول
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "SecurePassword123"
  }'
```

#### الحصول على جميع المستخدمين
```bash
curl -X GET http://localhost:8081/api/users \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## ملاحظات مهمة

1. **كلمات المرور:** يجب أن تكون على الأقل 8 أحرف
2. **البريد الإلكتروني:** يجب أن يكون بصيغة صحيحة وفريداً
3. **JWT Token:** صالح لمدة 24 ساعة
4. **الأدوار:** `admin` أو `user`
5. **CORS:** مفعل للنطاقات المسموحة فقط

---

## الأخطاء الشائعة

### 1. خطأ "Missing authorization header"
**السبب:** لم يتم إرسال رأس Authorization
**الحل:** أضف `Authorization: Bearer <token>` إلى الطلب

### 2. خطأ "Invalid or expired token"
**السبب:** انتهت صلاحية التوكن أو كان غير صحيح
**الحل:** قم بتسجيل الدخول مجدداً للحصول على توكن جديد

### 3. خطأ "Email already registered"
**السبب:** البريد الإلكتروني مسجل بالفعل
**الحل:** استخدم بريد إلكتروني مختلف

---

## الدعم

للمزيد من المعلومات، راجع ملف README.md
