#!/bin/bash
echo "Starting development environment..."
docker-compose -f docker-compose.dev.yaml up --build --watch
