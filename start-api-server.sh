#!/bin/bash

echo "Starting Voice Search API Server..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if package.json exists for the server
if [ ! -f "server-package.json" ]; then
    echo "Error: server-package.json not found"
    echo "Please make sure you're running this from the project root directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules_server" ]; then
    echo "Installing server dependencies..."
    mkdir -p node_modules_server
    cp server-package.json package.json
    npm install
    mv node_modules node_modules_server
    rm package.json
    echo
fi

# Start the server
echo "Starting API server on http://localhost:3001"
echo "Press Ctrl+C to stop the server"
echo

# Set NODE_PATH to use server modules
export NODE_PATH=node_modules_server
node server.js
