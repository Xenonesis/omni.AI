@echo off
echo Starting Voice Search API Server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if package.json exists for the server
if not exist "server-package.json" (
    echo Error: server-package.json not found
    echo Please make sure you're running this from the project root directory
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules_server" (
    echo Installing server dependencies...
    mkdir node_modules_server
    copy server-package.json package.json
    npm install
    move node_modules node_modules_server
    del package.json
    echo.
)

REM Start the server
echo Starting API server on http://localhost:3001
echo Press Ctrl+C to stop the server
echo.

REM Set NODE_PATH to use server modules
set NODE_PATH=node_modules_server
node server.js

pause
