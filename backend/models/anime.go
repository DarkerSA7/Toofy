package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Anime struct {
	ID                primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Title             string             `json:"title" bson:"title"`
	Slug              string             `json:"slug" bson:"slug"`
	AlternativeNames  []string           `json:"alternativeNames" bson:"alternativeNames"`
	Description       string             `json:"description" bson:"description"`
	CoverUrl          string             `json:"coverUrl" bson:"coverUrl"`
	Genres            []string           `json:"genres" bson:"genres"`
	Status            string             `json:"status" bson:"status"` // ongoing, completed, upcoming
	Type              string             `json:"type" bson:"type"`     // TV, Movie, OVA, ONA, Special
	EpisodeCount      int                `json:"episodeCount" bson:"episodeCount"`
	Studio            string             `json:"studio" bson:"studio"`
	Season            string             `json:"season" bson:"season"` // spring, summer, fall, winter
	SeasonYear        int                `json:"seasonYear" bson:"seasonYear"`
	CreatedAt         time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt         time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type AnimeListResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    struct {
		Data       []Anime `json:"data"`
		Total      int     `json:"total"`
		Page       int     `json:"page"`
		Limit      int     `json:"limit"`
		TotalPages int     `json:"total_pages"`
	} `json:"data"`
}
