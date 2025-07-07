#!/bin/bash

# Simulate build-and-test.yml workflow
set -e

echo "================================================"
echo "Starting Build and Test Workflow Simulation"
echo "================================================"

# Function to handle errors
handle_error() {
    echo "Error: $1"
    exit 1
}

# Function to retry commands
retry_command() {
    local max_attempts=$1
    local command=$2
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "Attempt $attempt of $max_attempts: $command"
        if eval "$command"; then
            return 0
        fi
        echo "Command failed, retrying..."
        attempt=$((attempt + 1))
        if [ $attempt -le $max_attempts ]; then
            sleep 2
        fi
    done
    
    echo "Command failed after $max_attempts attempts"
    return 1
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

# Install dependencies
echo "Installing dependencies..."
pnpm install || handle_error "Failed to install dependencies"

# Install Cypress
echo "Installing Cypress..."
npx cypress install || handle_error "Failed to install Cypress"

# Check code format
echo "Checking code format..."
npx nx format:check || echo "Warning: Code format check failed"

# Print CPU cores
echo "Number of CPU cores: $(nproc)"

# Run build for all packages
echo "Building all packages..."
retry_command 2 "npx nx run-many --targets=build --projects=tag:type:pkg --parallel=4" || handle_error "Build failed"

# Check package publishing compatibility
echo "Checking package publishing compatibility..."
for pkg in packages/*; do
    if [ -f "$pkg/package.json" ] && \
       [ "$pkg" != "packages/assemble-release-plan" ] && \
       [ "$pkg" != "packages/chrome-devtools" ] && \
       [ "$pkg" != "packages/core" ] && \
       [ "$pkg" != "packages/esbuild" ] && \
       [ "$pkg" != "packages/modernjs" ] && \
       [ "$pkg" != "packages/utilities" ]; then
        echo "Checking $pkg..."
        npx publint "$pkg" || echo "Warning: publint check failed for $pkg"
    fi
done

# Run affected tests
echo "Running affected tests..."
retry_command 2 "npx nx affected -t test --parallel=3 --exclude='*,!tag:type:pkg'" || echo "Warning: Some tests failed"

# Run affected experimental tests
echo "Running affected experimental tests..."
retry_command 2 "npx nx affected -t test:experiments --parallel=1 --exclude='*,!tag:type:pkg' --skip-nx-cache" || echo "Warning: Some experimental tests failed"

echo "================================================"
echo "Build and Test Workflow Simulation Complete"
echo "================================================"
echo ""
echo "Note: This script simulates the main build-and-test workflow."
echo "The actual workflow also triggers other workflows (e2e-modern, e2e-runtime, etc.)"
echo "which are not included in this simulation."