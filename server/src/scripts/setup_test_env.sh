#!/bin/bash

echo "Setting up Timer + Discord test environment..."

# Check if server is running
if ! curl -s http://localhost:8080 > /dev/null; then
    echo "❌ Server is not running on port 8080"
    echo "Starting server..."
    npm start &
    SERVER_PID=$!
    sleep 5
fi

# Set Discord test channel (replace with your actual channel ID)
export TEST_DISCORD_CHANNEL="1446570782951080070"

echo "✅ Environment ready for testing"
echo "Run: node test-timer-discord-api.js"