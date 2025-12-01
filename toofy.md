# Login System Architecture with Go and Fiber (Using MongoDB Atlas + WebSocket)

version
go 1.21

require (
	github.com/gofiber/fiber/v2 v2.52.5
	github.com/golang-jwt/jwt/v5 v5.2.0
	github.com/joho/godotenv v1.5.1
	go.mongodb.org/mongo-driver v1.14.0
	golang.org/x/crypto v0.21.0
    and more...

## Prerequisites
1. **Go (Golang)** for backend development.
2. **Fiber** web framework for Go.
3. **JWT (JSON Web Tokens)** or **Sessions** for session management.
4. **RBAC (Role-Based Access Control)** to manage permissions.
5. **MongoDB Atlas** as the database to store user data and roles.
6. **WebSocket** for real-time communication to update user statuses and information without reloading the page.
7. **bcrypt** for securely hashing passwords.
8. **gorilla/websocket** to manage WebSocket connections (if using WebSockets).
9. **go.mongodb.org/mongo-driver** for connecting to MongoDB in Go.

## Application Structure
- **Middleware**: For session and JWT verification, checking roles and permissions, and managing WebSocket connections.
- **Routes**: Routes for login, logout, session verification, WebSocket upgrade, etc.
- **Controllers**: Contains the business logic for user operations like registration, login, and real-time notifications via WebSocket.
- **Models**: Represents entities in MongoDB (e.g., User, Role).
- **Services**: Business logic for permissions, role validation, and **real-time user status updates** using WebSocket.
- **Database**: MongoDB Atlas for storing user, role, and session data.
- **WebSocket**: Real-time communication for updating the user interface (UI) immediately when changes occur (such as user login/logout or status changes), **without requiring page reloads** or re-authentication.

## Design Details

### A. Users and Roles

#### 1. **User Collection** in MongoDB:
- **User Collection** يحتوي على بيانات المستخدمين ويحتوي على الحقول التالية:
    - `id`: معرف فريد للمستخدم.
    - `username`: اسم المستخدم.
    - `password_hash`: كلمة المرور المخزنة بعد التجزئة.
    - `role`: الدور المرتبط بالمستخدم (مثال: `admin`, `user`, `manager`).

```go
type User struct {
    ID           primitive.ObjectID `json:"id" bson:"_id,omitempty"`
    Username     string             `json:"username" bson:"username"`
    PasswordHash string             `json:"-" bson:"password_hash"`
    Role         string             `json:"role" bson:"role"`  // Reference to the role (role name)
    CreatedAt    time.Time          `json:"created_at" bson:"created_at"`
}
