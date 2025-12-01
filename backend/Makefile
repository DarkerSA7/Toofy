.PHONY: help install run build clean test

help:
	@echo "Toofy Backend - Available Commands"
	@echo "===================================="
	@echo "make install    - Download dependencies"
	@echo "make run        - Run the server"
	@echo "make build      - Build the binary"
	@echo "make clean      - Clean build artifacts"
	@echo "make test       - Run tests"

install:
	@echo "Installing dependencies..."
	go mod download
	go mod tidy

run:
	@echo "Starting server..."
	go run main.go

build:
	@echo "Building binary..."
	go build -o bin/toofy-backend main.go

clean:
	@echo "Cleaning..."
	rm -rf bin/
	go clean

test:
	@echo "Running tests..."
	go test ./...

dev:
	@echo "Running in development mode..."
	go run main.go
