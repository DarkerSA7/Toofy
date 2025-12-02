package controllers

import (
	"bytes"
	"fmt"
	"io"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"toofy-backend/config"
)

type UploadController struct {
	s3Client *s3.S3
	bucket   string
	endpoint string
	baseURL  string
}

func NewUploadController(cfg *config.Config) *UploadController {
sess, _ := session.NewSession(&aws.Config{
Region:      aws.String(cfg.E2Region),
Credentials: credentials.NewStaticCredentials(cfg.E2AccessKeyID, cfg.E2SecretKey, ""),
Endpoint:    aws.String(fmt.Sprintf("https://%s", cfg.E2Endpoint)),
})

return &UploadController{
	s3Client: s3.New(sess),
	bucket:   cfg.E2Bucket,
	endpoint: cfg.E2Endpoint,
	baseURL:  cfg.BaseURL,
}
}

func (uc *UploadController) UploadCover(c *fiber.Ctx) error {
file, err := c.FormFile("file")
if err != nil {
return c.Status(400).JSON(fiber.Map{"success": false, "message": "File required"})
}

ext := filepath.Ext(file.Filename)
if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
return c.Status(400).JSON(fiber.Map{"success": false, "message": "Invalid file type"})
}

src, _ := file.Open()
defer src.Close()
data, _ := io.ReadAll(src)

key := fmt.Sprintf("covers/%s%s", uuid.New().String(), ext)

_, err = uc.s3Client.PutObject(&s3.PutObjectInput{
Bucket:      aws.String(uc.bucket),
Key:         aws.String(key),
Body:        bytes.NewReader(data),
ContentType: aws.String(file.Header.Get("Content-Type")),
})
if err != nil {
return c.Status(500).JSON(fiber.Map{"success": false, "message": "Upload failed"})
}

// Build full URL using configured base URL
url := fmt.Sprintf("%s/api/upload/image/%s", uc.baseURL, key)
return c.Status(201).JSON(fiber.Map{
	"success": true,
	"data": fiber.Map{"url": url, "key": key},
})
}

func (uc *UploadController) GetImage(c *fiber.Ctx) error {
	key := c.Params("*")
	if key == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Key required"})
	}

	obj, err := uc.s3Client.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(uc.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "Image not found",
		})
	}
	defer obj.Body.Close()

	data, _ := io.ReadAll(obj.Body)
	c.Set("Content-Type", *obj.ContentType)
	c.Set("Cache-Control", "public, max-age=31536000")
	return c.Send(data)
}

func (uc *UploadController) DeleteCover(c *fiber.Ctx) error {
	type DeleteRequest struct {
		URL string `json:"url"`
	}

	var req DeleteRequest
	if err := c.BodyParser(&req); err != nil {
		fmt.Printf("[DeleteCover] BodyParser error: %v\n", err)
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Invalid request"})
	}

	fmt.Printf("[DeleteCover] Received URL: %s\n", req.URL)

	if req.URL == "" {
		fmt.Printf("[DeleteCover] URL is empty\n")
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "URL required"})
	}

	// Extract key from URL
	// Handles both full URLs and relative paths
	// e.g., "http://localhost:8081/api/upload/image/covers/uuid.jpg" -> "covers/uuid.jpg"
	// or "/api/upload/image/covers/uuid.jpg" -> "covers/uuid.jpg"
	key := ""
	
	// Find the position of "/api/upload/image/" in the URL
	apiPath := "/api/upload/image/"
	if idx := strings.Index(req.URL, apiPath); idx != -1 {
		// Extract everything after "/api/upload/image/"
		key = req.URL[idx+len(apiPath):]
	} else {
		// If "/api/upload/image/" not found, try direct path
		key = req.URL
	}

	fmt.Printf("[DeleteCover] Extracted key: %s\n", key)

	if key == "" {
		fmt.Printf("[DeleteCover] Key is empty after extraction\n")
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Invalid URL format"})
	}

	// Delete from S3
	fmt.Printf("[DeleteCover] Deleting from S3 - Bucket: %s, Key: %s\n", uc.bucket, key)
	_, err := uc.s3Client.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(uc.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		fmt.Printf("[DeleteCover] S3 delete error: %v\n", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Delete failed",
			"error":   err.Error(),
			"key":     key,
			"bucket":  uc.bucket,
		})
	}

	fmt.Printf("[DeleteCover] Successfully deleted from S3: %s\n", key)
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Image deleted successfully",
		"key":     key,
	})
}