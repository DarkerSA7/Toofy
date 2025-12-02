package controllers

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
	"toofy-backend/config"
	"toofy-backend/database"
	"toofy-backend/models"
)

type AnimeController struct{}

func NewAnimeController() *AnimeController {
	return &AnimeController{}
}

// GetAllAnime returns all anime with pagination
func (ac *AnimeController) GetAllAnime(c *fiber.Ctx) error {
	page := c.Query("page", "1")
	limit := c.Query("limit", "30")

	pageNum, err := strconv.Atoi(page)
	if err != nil || pageNum < 1 {
		pageNum = 1
	}

	limitNum, err := strconv.Atoi(limit)
	if err != nil || limitNum < 1 {
		limitNum = 30
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	animeCollection := database.DB.Collection("anime")

	// Get total count
	total, err := animeCollection.CountDocuments(ctx, bson.M{})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to count anime",
			Error:   err.Error(),
		})
	}

	// Calculate skip
	skip := int64((pageNum - 1) * limitNum)

	// Find anime with pagination - sort by createdAt descending (newest first)
	opts := options.Find().SetSkip(skip).SetLimit(int64(limitNum)).SetSort(bson.M{"createdAt": -1})
	cursor, err := animeCollection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to fetch anime",
			Error:   err.Error(),
		})
	}
	defer cursor.Close(ctx)

	var animes []models.Anime
	if err = cursor.All(ctx, &animes); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to parse anime",
			Error:   err.Error(),
		})
	}

	if animes == nil {
		animes = []models.Anime{}
	}

	totalPages := (int(total) + limitNum - 1) / limitNum

	response := models.AnimeListResponse{
		Success: true,
		Message: "Anime retrieved successfully",
	}
	response.Data.Data = animes
	response.Data.Total = int(total)
	response.Data.Page = pageNum
	response.Data.Limit = limitNum
	response.Data.TotalPages = totalPages

	return c.Status(fiber.StatusOK).JSON(response)
}

// GetAnimeByID returns a single anime by ID
func (ac *AnimeController) GetAnimeByID(c *fiber.Ctx) error {
	animeID := c.Params("id")

	objID, err := primitive.ObjectIDFromHex(animeID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid anime ID",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	animeCollection := database.DB.Collection("anime")
	var anime models.Anime

	err = animeCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&anime)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Success: false,
			Message: "Anime not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Anime retrieved successfully",
		"data": fiber.Map{
			"anime": anime,
		},
	})
}

// CreateAnime creates a new anime
func (ac *AnimeController) CreateAnime(c *fiber.Ctx) error {
	var req struct {
		Title            string   `json:"title"`
		Slug             string   `json:"slug"`
		AlternativeNames []string `json:"alternativeNames"`
		Description      string   `json:"description"`
		CoverUrl         string   `json:"coverUrl"`
		Genres           []string `json:"genres"`
		Status           string   `json:"status"`
		Type             string   `json:"type"`
		EpisodeCount     int      `json:"episodeCount"`
		Studio           string   `json:"studio"`
		Season           string   `json:"season"`
		SeasonYear       int      `json:"seasonYear"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid request body",
			Error:   err.Error(),
		})
	}

	// Validate required fields
	if req.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Title is required",
		})
	}

	// Validate season if provided
	if req.Season != "" {
		validSeasons := map[string]bool{"spring": true, "summer": true, "fall": true, "winter": true}
		if !validSeasons[req.Season] {
			return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
				Success: false,
				Message: "Invalid season. Must be: spring, summer, fall, or winter",
			})
		}
	}

	// Validate status
	validStatuses := map[string]bool{"ongoing": true, "completed": true, "upcoming": true}
	if !validStatuses[req.Status] {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid status. Must be: ongoing, completed, or upcoming",
		})
	}

	// Validate type
	validTypes := map[string]bool{"TV": true, "Movie": true, "OVA": true, "ONA": true, "Special": true}
	if !validTypes[req.Type] {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid type. Must be: TV, Movie, OVA, ONA, or Special",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	anime := models.Anime{
		Title:            req.Title,
		Slug:             req.Slug,
		AlternativeNames: req.AlternativeNames,
		Description:      req.Description,
		CoverUrl:         req.CoverUrl,
		Genres:           req.Genres,
		Status:           req.Status,
		Type:             req.Type,
		EpisodeCount:     req.EpisodeCount,
		Studio:           req.Studio,
		Season:           req.Season,
		SeasonYear:       req.SeasonYear,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	animeCollection := database.DB.Collection("anime")
	result, err := animeCollection.InsertOne(ctx, anime)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to create anime",
			Error:   err.Error(),
		})
	}

	anime.ID = result.InsertedID.(primitive.ObjectID)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Anime created successfully",
		"data": fiber.Map{
			"anime": anime,
		},
	})
}

// UpdateAnime updates an anime
func (ac *AnimeController) UpdateAnime(c *fiber.Ctx) error {
	animeID := c.Params("id")

	objID, err := primitive.ObjectIDFromHex(animeID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid anime ID",
		})
	}

	var req struct {
		Title            string   `json:"title"`
		Slug             string   `json:"slug"`
		AlternativeNames []string `json:"alternativeNames"`
		Description      string   `json:"description"`
		CoverUrl         string   `json:"coverUrl"`
		Genres           []string `json:"genres"`
		Status           string   `json:"status"`
		Type             string   `json:"type"`
		EpisodeCount     int      `json:"episodeCount"`
		Studio           string   `json:"studio"`
		Season           string   `json:"season"`
		SeasonYear       int      `json:"seasonYear"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid request body",
			Error:   err.Error(),
		})
	}

	// Validate required fields
	if req.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Title is required",
		})
	}

	// Validate season if provided
	if req.Season != "" {
		validSeasons := map[string]bool{"spring": true, "summer": true, "fall": true, "winter": true}
		if !validSeasons[req.Season] {
			return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
				Success: false,
				Message: "Invalid season. Must be: spring, summer, fall, or winter",
			})
		}
	}

	// Validate status
	validStatuses := map[string]bool{"ongoing": true, "completed": true, "upcoming": true}
	if !validStatuses[req.Status] {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid status. Must be: ongoing, completed, or upcoming",
		})
	}

	// Validate type
	validTypes := map[string]bool{"TV": true, "Movie": true, "OVA": true, "ONA": true, "Special": true}
	if !validTypes[req.Type] {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid type. Must be: TV, Movie, OVA, ONA, or Special",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"title":            req.Title,
			"slug":             req.Slug,
			"alternativeNames": req.AlternativeNames,
			"description":      req.Description,
			"coverUrl":         req.CoverUrl,
			"genres":           req.Genres,
			"status":           req.Status,
			"type":             req.Type,
			"episodeCount":     req.EpisodeCount,
			"studio":           req.Studio,
			"season":           req.Season,
			"seasonYear":       req.SeasonYear,
			"updatedAt":        time.Now(),
		},
	}

	animeCollection := database.DB.Collection("anime")
	result, err := animeCollection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to update anime",
			Error:   err.Error(),
		})
	}

	if result.MatchedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Success: false,
			Message: "Anime not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Anime updated successfully",
	})
}

// DeleteAnime deletes an anime and its cover image from S3
func (ac *AnimeController) DeleteAnime(c *fiber.Ctx) error {
	animeID := c.Params("id")

	objID, err := primitive.ObjectIDFromHex(animeID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "Invalid anime ID",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	animeCollection := database.DB.Collection("anime")
	
	// First, get the anime to retrieve its cover URL
	var anime models.Anime
	err = animeCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&anime)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Success: false,
			Message: "Anime not found",
		})
	}

	// Delete the anime from database
	result, err := animeCollection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to delete anime",
			Error:   err.Error(),
		})
	}

	if result.DeletedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Success: false,
			Message: "Anime not found",
		})
	}

	// Note: Image deletion is handled by the frontend via the deleteCover endpoint
	// The frontend will delete the image from iDrive after the anime is deleted from the database

	// Also delete from slider if it exists there
	sliderCollection := database.DB.Collection("slider")
	_, _ = sliderCollection.DeleteOne(ctx, bson.M{"animeId": animeID})

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Anime deleted successfully",
	})
}

// FixImageURLs updates all anime documents with localhost URLs to use the configured BASE_URL
func (ac *AnimeController) FixImageURLs(c *fiber.Ctx, cfg *config.Config) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	animeCollection := database.DB.Collection("anime")

	// Find all anime with localhost URLs
	filter := bson.M{
		"coverUrl": bson.M{
			"$regex": "localhost:8081",
		},
	}

	cursor, err := animeCollection.Find(ctx, filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to query anime",
		})
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to decode results",
		})
	}

	// Update each document
	updatedCount := 0
	for _, result := range results {
		oldURL, ok := result["coverUrl"].(string)
		if !ok {
			continue
		}

		// Extract path after localhost:8081
		parts := strings.Split(oldURL, "localhost:8081")
		if len(parts) < 2 {
			continue
		}

		path := parts[1]
		newURL := cfg.BaseURL + path

		_, err := animeCollection.UpdateOne(
			ctx,
			bson.M{"_id": result["_id"]},
			bson.M{"$set": bson.M{"coverUrl": newURL}},
		)
		if err != nil {
			continue
		}
		updatedCount++
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("Updated %d anime URLs", updatedCount),
		"updated": updatedCount,
	})
}
