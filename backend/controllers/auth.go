package controllers

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"toofy-backend/config"
	"toofy-backend/database"
	"toofy-backend/models"
	"toofy-backend/utils"
)

type AuthController struct {
	cfg *config.Config
}

func NewAuthController(cfg *config.Config) *AuthController {
	return &AuthController{cfg: cfg}
}

// ensureUserPermissions ensures user has correct permissions for their role
func (ac *AuthController) ensureUserPermissions(ctx context.Context, user *models.User) error {
	permissions := models.GetPermissionsForRole(user.Role)
	user.Permissions = permissions

	usersCollection := database.DB.Collection("users")
	_, err := usersCollection.UpdateOne(
		ctx,
		bson.M{"_id": user.ID},
		bson.M{"$set": bson.M{
			"permissions": permissions,
			"updatedAt":   time.Now(),
		}},
	)
	return err
}

// Register creates a new user
func (ac *AuthController) Register(c *fiber.Ctx) error {
	var req models.RegisterRequest

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

	// Create new user with default permissions for "user" role
	newUser := models.User{
		ID:           primitive.NewObjectID(),
		DisplayName:  req.DisplayName,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		Role:         "user", // Default role
		Permissions:  models.GetPermissionsForRole("user"),
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

	// Generate token
	token, err := utils.GenerateToken(newUser.ID, newUser.Email, newUser.Role, ac.cfg.JWTSecret, ac.cfg.JWTExpiry)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to generate token",
			Error:   err.Error(),
		})
	}

	response := models.LoginResponse{
		Success: true,
		Message: "User registered successfully",
	}
	response.Data.Token = token
	response.Data.User = newUser

	return c.Status(fiber.StatusCreated).JSON(response)
}

// Login authenticates a user
func (ac *AuthController) Login(c *fiber.Ctx) error {
	var req models.LoginRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid request body",
			Error:   err.Error(),
		})
	}

	// Validate input
	if req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Email and password are required",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Find user by email
	usersCollection := database.DB.Collection("users")
	var user models.User
	err := usersCollection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid email or password",
		})
	}

	// Verify password
	if !utils.VerifyPassword(user.PasswordHash, req.Password) {
		return c.Status(fiber.StatusUnauthorized).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid email or password",
		})
	}

	// Ensure user has correct permissions for their role
	if err := ac.ensureUserPermissions(ctx, &user); err != nil {
		// Silently handle error - don't fail the request
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID, user.Email, user.Role, ac.cfg.JWTSecret, ac.cfg.JWTExpiry)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to generate token",
			Error:   err.Error(),
		})
	}

	response := models.LoginResponse{
		Success: true,
		Message: "Login successful",
	}
	response.Data.Token = token
	response.Data.User = user

	return c.Status(fiber.StatusOK).JSON(response)
}

// GetCurrentUser returns the current authenticated user
func (ac *AuthController) GetCurrentUser(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Convert string ID to ObjectID
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid user ID",
		})
	}

	// Find user
	usersCollection := database.DB.Collection("users")
	var user models.User
	err = usersCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Success: false,
			Message: "User not found",
		})
	}

	// Ensure user has correct permissions for their role
	if err := ac.ensureUserPermissions(ctx, &user); err != nil {
		// Silently handle error - don't fail the request
	}

	response := models.AuthResponse{
		Success: true,
		Message: "User retrieved successfully",
	}
	response.Data.User = user

	return c.Status(fiber.StatusOK).JSON(response)
}
