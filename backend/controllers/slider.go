package controllers

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"toofy-backend/database"
)

type SliderItem struct {
	ID         string `bson:"_id" json:"id"`
	AnimeID    string `bson:"animeId" json:"animeId"`
	Title      string `bson:"title" json:"title"`
	CoverUrl   string `bson:"coverUrl" json:"coverUrl"`
	Status     string `bson:"status" json:"status"`
	Type       string `bson:"type" json:"type"`
	Season     string `bson:"season,omitempty" json:"season,omitempty"`
	SeasonYear int    `bson:"seasonYear,omitempty" json:"seasonYear,omitempty"`
	Order      int    `bson:"order" json:"order"`
	CreatedAt  time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt  time.Time `bson:"updatedAt" json:"updatedAt"`
}

type SliderController struct{}

func NewSliderController() *SliderController {
	return &SliderController{}
}

// GetAllSliderItems - Get all slider items sorted by order
func (sc *SliderController) GetAllSliderItems(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := database.DB.Collection("sliders")

	// Find all slider items sorted by order
	opts := options.Find().SetSort(bson.M{"order": 1})
	cursor, err := collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch slider items",
		})
	}
	defer cursor.Close(ctx)

	var items []SliderItem
	if err = cursor.All(ctx, &items); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to parse slider items",
		})
	}

	if items == nil {
		items = []SliderItem{}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    items,
	})
}

// UpdateSliderItems - Update slider items (replace all)
func (sc *SliderController) UpdateSliderItems(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var items []SliderItem
	if err := c.BodyParser(&items); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	collection := database.DB.Collection("sliders")

	// Delete all existing items
	if _, err := collection.DeleteMany(ctx, bson.M{}); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to clear slider items",
		})
	}

	// Insert new items
	if len(items) > 0 {
		docs := make([]interface{}, len(items))
		for i, item := range items {
			item.UpdatedAt = time.Now()
			if item.CreatedAt.IsZero() {
				item.CreatedAt = time.Now()
			}
			docs[i] = item
		}

		if _, err := collection.InsertMany(ctx, docs); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Failed to save slider items",
			})
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Slider items updated successfully",
		"data":    items,
	})
}
