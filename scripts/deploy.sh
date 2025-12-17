#!/bin/bash

# Teslo Shop Backend Deployment Script

set -e

echo "🚀 Starting Teslo Shop Backend Deployment..."

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo "❌ .env.prod file not found. Please create it with production environment variables."
    exit 1
fi

# Load production environment variables
export $(cat .env.prod | xargs)

echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

echo "🗄️ Starting database..."
docker-compose -f docker-compose.prod.yml up -d postgres

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🔄 Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

echo "🌱 Seeding database (if needed)..."
docker-compose -f docker-compose.prod.yml run --rm app npm run prisma:seed

echo "🚀 Starting application..."
docker-compose -f docker-compose.prod.yml up -d app

echo "🔍 Checking application health..."
sleep 15

# Health check
if curl -f http://localhost:3002/api/health > /dev/null 2>&1; then
    echo "✅ Deployment successful! Application is healthy."
    echo "📚 API Documentation: http://localhost:3002/api/docs"
else
    echo "❌ Deployment failed! Application health check failed."
    echo "📋 Checking logs..."
    docker-compose -f docker-compose.prod.yml logs app
    exit 1
fi

echo "🎉 Teslo Shop Backend deployed successfully!"