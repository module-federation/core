#!/bin/bash

# Kill ports only if they are in use
# Usage: ./kill-ports-if-used.sh 3000 3001 3002

for port in "$@"; do
  if lsof -ti:"$port" >/dev/null 2>&1; then
    echo "Port $port is in use, killing process..."
    npx kill-port "$port" 2>/dev/null || true
  else
    echo "Port $port is not in use, skipping..."
  fi
done