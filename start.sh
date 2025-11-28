#!/bin/bash

# Wordle Full-Stack Application Startup Script

echo "========================================="
echo "  Wordle Full-Stack Application"
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available!"
    echo "Please install Docker Compose or update Docker Desktop."
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Check for running containers
if docker compose ps | grep -q "Up"; then
    echo "⚠️  Containers are already running!"
    echo ""
    read -p "Do you want to restart them? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Stopping existing containers..."
        docker compose down
    else
        echo "Keeping existing containers running."
        exit 0
    fi
fi

# Ask for mode
echo "Choose mode:"
echo "1) Production (recommended for testing)"
echo "2) Development (with hot reload)"
read -p "Enter choice (1 or 2): " -n 1 -r mode
echo ""

if [ "$mode" = "2" ]; then
    echo "Starting in DEVELOPMENT mode..."
    docker compose -f docker-compose.dev.yml up -d
    COMPOSE_FILE="docker-compose.dev.yml"
else
    echo "Starting in PRODUCTION mode..."
    docker compose up -d
    COMPOSE_FILE="docker-compose.yml"
fi

echo ""
echo "Building and starting containers..."
echo "(This may take a few minutes on first run)"
echo ""

# Wait for containers to be healthy
echo "Waiting for services to start..."
sleep 10

# Check health status
echo ""
echo "========================================="
echo "  Application Status"
echo "========================================="
docker compose -f "$COMPOSE_FILE" ps
echo ""

echo "========================================="
echo "  Access the Application"
echo "========================================="
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo ""

echo "========================================="
echo "  Useful Commands"
echo "========================================="
echo "View logs:     docker compose logs -f"
echo "Stop app:      docker compose down"
if [ "$mode" = "2" ]; then
    echo "Restart:       docker compose -f docker-compose.dev.yml restart"
else
    echo "Restart:       docker compose restart"
fi
echo ""

echo "✅ Application started successfully!"
