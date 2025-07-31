#!/bin/bash
echo "Building Mythos application..."
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi
echo "Building frontend..."
npm run build
echo "Initializing database..."
cd backend
npm run init-db
cd ..
echo "Build completed successfully!"
echo "To start the application, run: ./run.sh" 