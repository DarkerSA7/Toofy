package controllers

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"toofy-backend/database"
	"toofy-backend/models"
	"toofy-backend/utils"
)

type UsersController struct{}

func NewUsersController() *UsersController {
	return &UsersController{}
}

// GetAllUsers returns all users
func (uc *UsersController) GetAllUsers(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	usersCollection := database.DB.Collection("users")
	cursor, err := usersCollection.Find(ctx, bson.M{})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to fetch users",
			Error:   err.Error(),
		})
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err = cursor.All(ctx, &users); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to parse users",
			Error:   err.Error(),
		})
	}

	if users == nil {
		users = []models.User{}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Users retrieved successfully",
		"data": fiber.Map{
			"users": users,
		},
	})
}

// GetUserByID returns a user by ID
func (uc *UsersController) GetUserByID(c *fiber.Ctx) error {
	userID := c.Params("id")

	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid user ID",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	usersCollection := database.DB.Collection("users")
	var user models.User
	err = usersCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Success: false,
			Message: "User not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "User retrieved successfully",
		"data": fiber.Map{
			"user": user,
		},
	})
}

// UpdateUserRole updates a user's role
func (uc *UsersController) UpdateUserRole(c *fiber.Ctx) error {
	userID := c.Params("id")

	var req struct {
		Role string `json:"role"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid request body",
			Error:   err.Error(),
		})
	}

	// Validate role
	validRoles := map[string]bool{"admin": true, "editor": true, "vip": true, "user": true}
	if !validRoles[req.Role] {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid role. Must be 'admin', 'editor', 'vip', or 'user'",
		})
	}

	// Get current user role from context (set by auth middleware)
	currentUserRoleInterface := c.Locals("role")
	if currentUserRoleInterface == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(models.ErrorResponse{
			Success: false,
			Message: "User role not found in context",
		})
	}
	
	currentUserRole, ok := currentUserRoleInterface.(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid user role in context",
		})
	}

	// Check if user has permission to manage roles
	if !models.HasPermission(currentUserRole, models.PermManageLowerRoles) && !models.HasPermission(currentUserRole, models.PermManageRoles) {
		return c.Status(fiber.StatusForbidden).JSON(models.ErrorResponse{
			Success: false,
			Message: "You don't have permission to manage user roles",
		})
	}

	// If user has PermManageLowerRoles (editor), check if they can manage this role
	if models.HasPermission(currentUserRole, models.PermManageLowerRoles) && !models.HasPermission(currentUserRole, models.PermManageRoles) {
		if !models.CanManageRole(currentUserRole, req.Role) {
			return c.Status(fiber.StatusForbidden).JSON(models.ErrorResponse{
				Success: false,
				Message: "You can only manage roles lower than your own",
			})
		}
	}

	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid user ID",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	usersCollection := database.DB.Collection("users")
	result, err := usersCollection.UpdateOne(
		ctx,
		bson.M{"_id": objID},
		bson.M{"$set": bson.M{
			"role":        req.Role,
			"permissions": models.GetPermissionsForRole(req.Role),
			"updatedAt":   time.Now(),
		}},
	)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to update user",
			Error:   err.Error(),
		})
	}

	if result.MatchedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Success: false,
			Message: "User not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "User role updated successfully",
	})
}

// DeleteUser deletes a user
func (uc *UsersController) DeleteUser(c *fiber.Ctx) error {
	userID := c.Params("id")

	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid user ID",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	usersCollection := database.DB.Collection("users")
	result, err := usersCollection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to delete user",
			Error:   err.Error(),
		})
	}

	if result.DeletedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Success: false,
			Message: "User not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "User deleted successfully",
	})
}

// CreateUser creates a new user (admin only)
func (uc *UsersController) CreateUser(c *fiber.Ctx) error {
	var req struct {
		DisplayName string `json:"displayName"`
		Email       string `json:"email"`
		Password    string `json:"password"`
		Role        string `json:"role"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid request body",
			Error:   err.Error(),
		})
	}

	// Validate input
	if req.DisplayName == "" || req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "All fields are required",
		})
	}

	if len(req.Password) < 8 {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Password must be at least 8 characters",
		})
	}

	// Validate role
	if req.Role == "" {
		req.Role = "user"
	}
	validRoles := map[string]bool{"admin": true, "editor": true, "vip": true, "user": true}
	if !validRoles[req.Role] {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid role. Must be 'admin', 'editor', 'vip', or 'user'",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if user already exists
	usersCollection := database.DB.Collection("users")
	var existingUser models.User
	err := usersCollection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&existingUser)
	if err == nil {
		return c.Status(fiber.StatusConflict).JSON(models.ErrorResponse{
			Success: false,
			Message: "Email already registered",
		})
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to process password",
			Error:   err.Error(),
		})
	}

	// Create new user with permissions based on role
	newUser := models.User{
		ID:           primitive.NewObjectID(),
		DisplayName:  req.DisplayName,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		Role:         req.Role,
		Permissions:  models.GetPermissionsForRole(req.Role),
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
		IsActive:     true,
	}

	result, err := usersCollection.InsertOne(ctx, newUser)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to create user",
			Error:   err.Error(),
		})
	}

	newUser.ID = result.InsertedID.(primitive.ObjectID)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "User created successfully",
		"data": fiber.Map{
			"user": newUser,
		},
	})
}
