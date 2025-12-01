package main

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"toofy-backend/config"
	"toofy-backend/database"
	"toofy-backend/routes"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Connect to MongoDB
	err := database.Connect(cfg.MongoDBURI, cfg.MongoDBDB)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Disconnect()

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName: "Toofy Backend",
	})

	// CORS Middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000,http://localhost:8081",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Content-Type,Authorization",
	}))

	// Setup routes
	routes.SetupRoutes(app, cfg)

	// Start server
	port := cfg.Port
	if port == "" {
		port = "8081"
	}

	fmt.Printf("✓ Server starting on port %s\n", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
