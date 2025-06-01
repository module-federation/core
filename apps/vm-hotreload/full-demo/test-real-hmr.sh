#!/bin/bash

# Real HMR Testing Script - Tests actual hot module replacement
echo "🔥 Starting Real HMR Testing..."

# Change to the demo directory
cd "$(dirname "$0")"

# Function to cleanup processes on exit
cleanup() {
    echo "\n🧹 Cleaning up processes..."
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null
        echo "Stopped servers (PID: $SERVER_PID)"
    fi
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start the servers in background
echo "📡 Starting backend and client servers..."
pnpm run start:all &
SERVER_PID=$!

# Wait for servers to start up
echo "⏳ Waiting for servers to initialize..."
sleep 8

# Check if servers are running
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Servers failed to start"
    exit 1
fi

# Test backend health
echo "\n🔍 Testing backend health..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Backend is responding"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Get available updates
echo "\n📋 Getting available updates..."
available_updates=$(curl -s http://localhost:3000/api/available-updates)
echo "Available updates: $available_updates"

# Test HMR with component update
echo "\n🔥 Testing Component HMR Update..."
echo "This should trigger the module.hot.accept('./components.js') callback"
response1=$(curl -s -X POST http://localhost:3000/api/trigger-update \
    -H "Content-Type: application/json" \
    -d '{"updateId": "component-update", "description": "Testing component hot reload"}')

if [ $? -eq 0 ]; then
    echo "✅ Component HMR update triggered"
else
    echo "❌ Component HMR update failed"
    exit 1
fi

# Wait to see the hot reload in action
echo "\n⏳ Waiting 5 seconds to observe hot reload..."
sleep 5

# Test HMR with module update
echo "\n🔥 Testing Module HMR Update..."
echo "This should trigger the module.hot.accept('./app.js') callback"
response2=$(curl -s -X POST http://localhost:3000/api/trigger-update \
    -H "Content-Type: application/json" \
    -d '{"updateId": "module-update", "description": "Testing app module hot reload"}')

if [ $? -eq 0 ]; then
    echo "✅ Module HMR update triggered"
else
    echo "❌ Module HMR update failed"
    exit 1
fi

# Wait to see the hot reload in action
echo "\n⏳ Waiting 5 seconds to observe hot reload..."
sleep 5

# Test HMR with data update
echo "\n🔥 Testing Data HMR Update..."
response3=$(curl -s -X POST http://localhost:3000/api/trigger-update \
    -H "Content-Type: application/json" \
    -d '{"updateId": "data-update", "description": "Testing data hot reload"}')

if [ $? -eq 0 ]; then
    echo "✅ Data HMR update triggered"
else
    echo "❌ Data HMR update failed"
    exit 1
fi

# Wait to see the hot reload in action
echo "\n⏳ Waiting 5 seconds to observe hot reload..."
sleep 5

# Test HMR with style update
echo "\n🔥 Testing Style HMR Update..."
response4=$(curl -s -X POST http://localhost:3000/api/trigger-update \
    -H "Content-Type: application/json" \
    -d '{"updateId": "style-update", "description": "Testing style hot reload"}')

if [ $? -eq 0 ]; then
    echo "✅ Style HMR update triggered"
else
    echo "❌ Style HMR update failed"
    exit 1
fi

echo "\n🔍 Check the client console output for:"
echo "   • '🔄 Hot reloading app module...' messages"
echo "   • '🔄 Hot reloading UI components...' messages"
echo "   • '🔄 Hot reloading configuration...' messages"
echo "   • '🔄 Hot reloading styles...' messages"
echo "\n⚡ If you see these messages, HMR is working correctly!"
echo "\n🌐 Access URLs:"
echo "   • Client: http://localhost:3000"
echo "   • Admin: http://localhost:3000/admin"
echo "\nPress Ctrl+C to stop the servers and exit."

# Keep the script running to maintain servers
while kill -0 $SERVER_PID 2>/dev/null; do
    sleep 1
done

echo "\n⚠️  Servers have stopped unexpectedly"
exit 1
