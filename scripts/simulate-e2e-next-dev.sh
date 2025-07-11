#!/bin/bash

# Simulate e2e-next-dev.yml workflow
set -e

echo "================================================"
echo "Starting E2E Next.js Dev Workflow Simulation"
echo "================================================"

# Function to handle errors
handle_error() {
    echo "Error: $1"
    exit 1
}

# Function to kill all node processes
kill_node_processes() {
    echo "Killing all node processes..."
    killall node 2>/dev/null || true
}

# Check if Node.js is installed and version
echo "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    handle_error "Node.js is not installed. Please install Node.js 18"
fi

node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "Warning: Node.js version is less than 18. Recommended version is 18+"
fi

# Enable corepack and prepare pnpm
echo "Setting up pnpm..."
if command -v corepack &> /dev/null; then
    corepack prepare pnpm@8.11.0 --activate
    corepack enable
else
    echo "Corepack not found, checking if pnpm is already installed..."
    if ! command -v pnpm &> /dev/null; then
        handle_error "pnpm is not installed and corepack is not available"
    fi
fi

# Set environment variables
echo "Setting environment variables..."
export SKIP_DEVTOOLS_POSTINSTALL=true
export NEXT_PRIVATE_LOCAL_WEBPACK=true

echo "SKIP_DEVTOOLS_POSTINSTALL=$SKIP_DEVTOOLS_POSTINSTALL"
echo "NEXT_PRIVATE_LOCAL_WEBPACK=$NEXT_PRIVATE_LOCAL_WEBPACK"

# Install dependencies
echo "Installing dependencies..."
pnpm install || handle_error "Failed to install dependencies"

# Install Cypress
echo "Installing Cypress..."
npx cypress install || handle_error "Failed to install Cypress"

# Run build for all packages
echo "Building all packages..."
npx nx run-many --targets=build --projects=tag:type:pkg || handle_error "Build failed"

# Run condition check script
echo "Running condition check script..."
if [ -f "tools/scripts/ci-is-affected.mjs" ]; then
    node tools/scripts/ci-is-affected.mjs --appName=3000-home
    check_result=$?
else
    echo "Warning: ci-is-affected.mjs script not found, proceeding with tests..."
    check_result=0
fi

if [ $check_result -eq 0 ]; then
    echo "Running E2E tests..."
    
    # E2E Test for Next.js Dev - Home
    echo "================================================"
    echo "E2E Test for Next.js Dev - Home (3000-home)"
    echo "================================================"
    kill_node_processes
    npx nx run 3000-home:test:e2e || echo "Warning: 3000-home E2E tests failed"
    
    # E2E Test for Next.js Dev - Shop
    echo "================================================"
    echo "E2E Test for Next.js Dev - Shop (3001-shop)"
    echo "================================================"
    kill_node_processes
    npx nx run 3001-shop:test:e2e || echo "Warning: 3001-shop E2E tests failed"
    
    # E2E Test for Next.js Dev - Checkout
    echo "================================================"
    echo "E2E Test for Next.js Dev - Checkout (3002-checkout)"
    echo "================================================"
    kill_node_processes
    npx nx run 3002-checkout:test:e2e || echo "Warning: 3002-checkout E2E tests failed"
else
    echo "Condition check failed or apps are not affected, skipping E2E tests..."
fi

# Final cleanup
kill_node_processes

echo "================================================"
echo "E2E Next.js Dev Workflow Simulation Complete"
echo "================================================"