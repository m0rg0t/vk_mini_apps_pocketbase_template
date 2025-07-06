@echo off
echo Building and deploying production environment...
docker-compose up --build -d
echo Production environment is running!
