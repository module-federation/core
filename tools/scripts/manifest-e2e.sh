#!/usr/bin/env bash
set -euo pipefail

# Orchestrate Manifest demo E2E by starting all required dev servers,
# waiting for readiness, running Cypress, and cleaning up.
# Usage: ./tools/scripts/manifest-e2e.sh [development|production]

MODE="${1:-development}"
export NX_TUI=false

PORTS=(3013 3009 3010 3011 3012 4001)

cleanup() {
  # Best-effort port cleanup
  npx --yes kill-port "${PORTS[@]}" >/dev/null 2>&1 || true
}

trap cleanup EXIT

# Ensure a clean slate
cleanup

run() {
  echo "> $*" >&2
  eval "$@"
}

if [[ "$MODE" != "development" && "$MODE" != "production" ]]; then
  echo "Unknown mode: $MODE (expected development|production)" >&2
  exit 2
fi

echo "Starting Manifest demo servers in $MODE mode..."

if [[ "$MODE" == "production" ]]; then
  run "npx nx run 3009-webpack-provider:serve:production" &
  pids+=("$!")
  run "npx nx run 3010-rspack-provider:serve:production" &
  pids+=("$!")
  run "npx nx run 3011-rspack-manifest-provider:serve:production" &
  pids+=("$!")
  run "npx nx run 3012-rspack-js-entry-provider:serve:production" &
  pids+=("$!")
  # modernjs serve has no production configuration; the serve command always runs the dev server
  run "npx nx run modernjs:serve" &
  pids+=("$!")
  run "npx nx run manifest-webpack-host:serve:production" &
  pids+=("$!")
else
  run "npx nx run 3009-webpack-provider:serve:development" &
  pids+=("$!")
  run "npx nx run 3010-rspack-provider:serve:development" &
  pids+=("$!")
  run "npx nx run 3011-rspack-manifest-provider:serve:development" &
  pids+=("$!")
  run "npx nx run 3012-rspack-js-entry-provider:serve:development" &
  pids+=("$!")
  run "npx nx run modernjs:serve" &
  pids+=("$!")
  run "npx nx run manifest-webpack-host:serve:development" &
  pids+=("$!")
fi

echo "Waiting for ports to be ready..."
npx --yes wait-on tcp:3009 tcp:3010 tcp:3011 tcp:3012 http://127.0.0.1:4001/ tcp:3013

echo "Running Cypress E2E for manifest-webpack-host..."
npx nx run manifest-webpack-host:e2e

echo "E2E complete. Cleaning up."

