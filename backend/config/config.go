package config

import (
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoDBURI      string
	MongoDBDB       string
	JWTSecret       string
	JWTExpiry       time.Duration
	Port            string
	Env             string
	CORSOrigins     []string
	E2Endpoint      string
	E2Region        string
	E2AccessKeyID   string
	E2SecretKey     string
	E2Bucket        string
}

func LoadConfig() *Config {
	// Load .env file
	godotenv.Load()

	// Parse JWT expiry
	jwtExpiry := 24 * time.Hour
	if expiry := os.Getenv("JWT_EXPIRY"); expiry != "" {
		if duration, err := time.ParseDuration(expiry); err == nil {
			jwtExpiry = duration
		}
	}

	return &Config{
		MongoDBURI:    getEnv("MONGODB_URI", "mongodb+srv://localhost:27017"),
		MongoDBDB:     getEnv("MONGODB_DB", "toofy"),
		JWTSecret:     getEnv("JWT_SECRET", "your-secret-key"),
		JWTExpiry:     jwtExpiry,
		Port:          getEnv("PORT", "8081"),
		Env:           getEnv("ENV", "development"),
		E2Endpoint:    getEnv("E2_ENDPOINT", "s3.eu-central-2.idrivee2.com"),
		E2Region:      getEnv("E2_REGION", "eu-central-2"),
		E2AccessKeyID: getEnv("E2_ACCESS_KEY_ID", ""),
		E2SecretKey:   getEnv("E2_SECRET_ACCESS_KEY", ""),
		E2Bucket:      getEnv("E2_BUCKET", "cover-animes"),
		CORSOrigins: []string{
			"http://localhost:3000",
			"http://localhost:8081",
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
