#!/bin/bash

# Kill ports only if they are in use
# Usage: ./kill-ports-if-used.sh 3000 3001 3002

ports_in_use=()

for port in "$@"; do
  if lsof -ti:"$port" >/dev/null 2>&1; then
    echo "Port $port is in use, adding to kill list..."
    ports_in_use+=("$port")
  else
    echo "Port $port is not in use, skipping..."
  fi
done

if [ ${#ports_in_use[@]} -gt 0 ]; then
  echo "Killing ports: ${ports_in_use[*]}"
  npx kill-port "${ports_in_use[@]}" 2>/dev/null || true
else
  echo "No ports to kill."
fi