#!/bin/bash

# Development start script for LearnUpon LMS

echo "🚀 Starting LearnUpon LMS in development mode..."

# Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js is not installed. Please install Node.js 14.0.0 or higher."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the application
echo "🌟 Starting proxy server on port 3000..."
echo ""
echo "🔗 Access your application at:"
echo "   - User Transcript: http://localhost:3000/transcript.html"
echo "   - Group Management: http://localhost:3000/groups.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
