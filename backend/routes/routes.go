package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"toofy-backend/config"
	"toofy-backend/controllers"
	"toofy-backend/handlers"
	"toofy-backend/middleware"
)

func SetupRoutes(app *fiber.App, cfg *config.Config) {
	// Initialize controllers
	authCtrl := controllers.NewAuthController(cfg)
	usersCtrl := controllers.NewUsersController()
	animeCtrl := controllers.NewAnimeController()
	episodesCtrl := controllers.NewEpisodesController()
	uploadCtrl := controllers.NewUploadController(cfg)

	// Public routes
	api := app.Group("/api")

	// Auth routes (public)
	auth := api.Group("/auth")
	auth.Post("/register", authCtrl.Register)
	auth.Post("/login", authCtrl.Login)

	// Public anime routes (read-only)
	publicAnime := api.Group("/anime")
	publicAnime.Get("", animeCtrl.GetAllAnime)
	publicAnime.Get("/:id", animeCtrl.GetAnimeByID)

	// Initialize slider controller
	sliderCtrl := controllers.NewSliderController()

	// Public slider routes (read-only)
	publicSlider := api.Group("/slider")
	publicSlider.Get("", sliderCtrl.GetAllSliderItems)

	// Image route (public - no auth needed) - MUST be before protected middleware
	api.Get("/upload/image/*", uploadCtrl.GetImage)

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(cfg))

	// Auth protected routes
	protected.Get("/auth/me", authCtrl.GetCurrentUser)

	// Users routes
	users := protected.Group("/users")
	users.Get("", usersCtrl.GetAllUsers)
	users.Get("/:id", usersCtrl.GetUserByID)
	users.Post("", usersCtrl.CreateUser)
	users.Put("/:id/role", func(c *fiber.Ctx) error {
		userID := c.Params("id")
		err := usersCtrl.UpdateUserRole(c)
		
		// Broadcast update if successful
		if c.Response().StatusCode() == fiber.StatusOK {
			handlers.BroadcastUserUpdate(userID, "role_updated", fiber.Map{
				"message": "User role was updated",
			})
		}
		
		return err
	})
	users.Delete("/:id", func(c *fiber.Ctx) error {
		userID := c.Params("id")
		err := usersCtrl.DeleteUser(c)
		
		// If successful, broadcast the deletion
		if c.Response().StatusCode() == fiber.StatusOK {
			handlers.BroadcastUserUpdate(userID, "user_deleted", fiber.Map{
				"message": "User was deleted",
			})
		}
		
		return err
	})

	// Anime routes (protected - write operations only)
	anime := protected.Group("/anime")
	anime.Post("", animeCtrl.CreateAnime)
	anime.Put("/:id", animeCtrl.UpdateAnime)
	anime.Delete("/:id", animeCtrl.DeleteAnime)

	// Upload routes (protected)
	upload := protected.Group("/upload")
	upload.Post("/cover", uploadCtrl.UploadCover)
	upload.Delete("/cover", uploadCtrl.DeleteCover)

	// Episodes routes
	episodes := protected.Group("/episodes")
	episodes.Get("", episodesCtrl.GetEpisodesByAnimeID)

	// Protected slider routes (write operations)
	protectedSlider := protected.Group("/slider")
	protectedSlider.Put("", sliderCtrl.UpdateSliderItems)

	// WebSocket routes
	app.Use("/ws", handlers.WebSocketHandler)
	app.Get("/ws", websocket.New(func(c *websocket.Conn) {
		// Get user ID from query
		userID := c.Query("userID")
		if userID == "" {
			c.Close()
			return
		}
		
		// Pass userID to handler
		handlers.WebSocketUpgrade(c, userID)
	}))

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"message": "Server is running",
		})
	})
}
