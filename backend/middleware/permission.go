package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"toofy-backend/config"
	"toofy-backend/models"
	"toofy-backend/utils"
)

// extractToken extracts and validates the bearer token from Authorization header
func extractToken(c *fiber.Ctx) (string, error) {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return "", fiber.NewError(fiber.StatusUnauthorized, "Missing authorization token")
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return "", fiber.NewError(fiber.StatusUnauthorized, "Invalid authorization header format")
	}

	return parts[1], nil
}

// RequirePermission checks if user has required permission
func RequirePermission(cfg *config.Config, requiredPermission string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		token, err := extractToken(c)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(models.ErrorResponse{
				Success: false,
				Message: err.Error(),
			})
		}

		claims, err := utils.VerifyToken(token, cfg.JWTSecret)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(models.ErrorResponse{
				Success: false,
				Message: "Invalid token",
			})
		}

		if !models.HasPermission(claims.Role, requiredPermission) {
			return c.Status(fiber.StatusForbidden).JSON(models.ErrorResponse{
				Success: false,
				Message: "Insufficient permissions",
			})
		}

		return c.Next()
	}
}

// RequireRole checks if user has required role
func RequireRole(cfg *config.Config, requiredRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		token, err := extractToken(c)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(models.ErrorResponse{
				Success: false,
				Message: err.Error(),
			})
		}

		claims, err := utils.VerifyToken(token, cfg.JWTSecret)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(models.ErrorResponse{
				Success: false,
				Message: "Invalid token",
			})
		}

		hasRole := false
		for _, r := range requiredRoles {
			if claims.Role == r {
				hasRole = true
				break
			}
		}

		if !hasRole {
			return c.Status(fiber.StatusForbidden).JSON(models.ErrorResponse{
				Success: false,
				Message: "Insufficient permissions",
			})
		}

		return c.Next()
	}
}
