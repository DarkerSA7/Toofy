package controllers

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"toofy-backend/database"
	"toofy-backend/models"
)

type EpisodesController struct{}

func NewEpisodesController() *EpisodesController {
	return &EpisodesController{}
}

// GetEpisodesByAnimeID returns episodes for a specific anime
func (ec *EpisodesController) GetEpisodesByAnimeID(c *fiber.Ctx) error {
	animeID := c.Query("animeId")

	if animeID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "animeId query parameter is required",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	episodesCollection := database.DB.Collection("episodes")

	// Find episodes for the anime
	cursor, err := episodesCollection.Find(ctx, bson.M{"animeId": animeID})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to fetch episodes",
			Error:   err.Error(),
		})
	}
	defer cursor.Close(ctx)

	var episodes []interface{}
	if err = cursor.All(ctx, &episodes); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to parse episodes",
			Error:   err.Error(),
		})
	}

	if episodes == nil {
		episodes = []interface{}{}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Episodes retrieved successfully",
		"data":    episodes,
	})
}
