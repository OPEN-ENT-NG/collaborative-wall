#!/bin/bash

# Frontend
cd frontend
./build.sh --no-docker clean init build
cd ..

# Create directory structure and copy frontend dist
cd backend
rm -rf ./src/main/resources/public/*.js
rm -rf ./src/main/resources/public/*.css
cp -R ../frontend/dist/* ./src/main/resources/

# Copy Files
mv ./src/main/resources/img/* ./src/main/resources/public/img
mv ./src/main/resources/*.html ./src/main/resources/view

# Build .
./build.sh --no-docker clean build

# Clean up - remove frontend/dist and backend/src/main/resources
rm -rf ../frontend/dist