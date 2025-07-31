#!/bin/bash
echo "Starting Mythos application..."
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi
if [ ! -d "build" ]; then       
    echo "Error: Build not found. Please run ./build.sh first"
    exit 1
fi
if [ ! -d "backend" ]; then
    echo "Error: Backend directory not found"
    exit 1
fi
echo "Stopping any existing servers..."
pkill -f "node server.js" 2>/dev/null || true
echo "Starting server on port 3000..."
cd backend
npm start 