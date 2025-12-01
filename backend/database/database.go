package database

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database

func Connect(mongoURI, dbName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	// Verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	DB = client.Database(dbName)
	fmt.Println("✓ Connected to MongoDB successfully")

	// Create indexes
	createIndexes()

	return nil
}

func createIndexes() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Create indexes for users collection
	usersCollection := DB.Collection("users")
	emailIndexModel := mongo.IndexModel{
		Keys: map[string]int{"email": 1},
		Options: options.Index().SetUnique(true).SetSparse(true),
	}
	_, err := usersCollection.Indexes().CreateOne(ctx, emailIndexModel)
	if err != nil {
		fmt.Printf("Warning: Failed to create email index: %v\n", err)
	}

	// Create indexes for anime collection
	animeCollection := DB.Collection("anime")
	slugIndexModel := mongo.IndexModel{
		Keys: map[string]int{"slug": 1},
		Options: options.Index().SetUnique(true).SetSparse(true),
	}
	_, err = animeCollection.Indexes().CreateOne(ctx, slugIndexModel)
	if err != nil {
		fmt.Printf("Warning: Failed to create anime slug index: %v\n", err)
	}
}

func Disconnect() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if DB != nil {
		return DB.Client().Disconnect(ctx)
	}
	return nil
}
