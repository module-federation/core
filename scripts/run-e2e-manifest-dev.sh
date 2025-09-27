#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$ROOT_DIR"

# Ensure devtools postinstall hook is skipped like in CI.
export SKIP_DEVTOOLS_POSTINSTALL="${SKIP_DEVTOOLS_POSTINSTALL:-true}"

echo "[e2e-manifest-dev] Installing workspace dependencies"
pnpm install

echo "[e2e-manifest-dev] Ensuring Cypress binary is installed"
npx cypress install

echo "[e2e-manifest-dev] Building all tagged packages"
npx nx run-many --targets=build --projects=tag:type:pkg --skip-nx-cache

echo "[e2e-manifest-dev] Checking if manifest host is affected"
if ! node tools/scripts/ci-is-affected.mjs --appName=manifest-webpack-host; then
  echo "[e2e-manifest-dev] Manifest host not affected; skipping E2E run"
  exit 0
fi

cleanup() {
  echo "[e2e-manifest-dev] Cleaning up background processes and ports"
  npx kill-port 3013 3009 3010 3011 3012 4001 >/dev/null 2>&1 || true
  if [[ -n "${DEV_PID:-}" ]] && kill -0 "$DEV_PID" >/dev/null 2>&1; then
    kill "$DEV_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

echo "[e2e-manifest-dev] Starting manifest dev servers"
export NX_SKIP_NX_CACHE=1
pnpm run app:manifest:dev >/tmp/e2e-manifest-dev.log 2>&1 &
DEV_PID=$!

echo "[e2e-manifest-dev] Waiting for required ports"
npx wait-on tcp:3009 tcp:3012 http://127.0.0.1:4001/

echo "[e2e-manifest-dev] Running manifest host Cypress suites"
TIMEOUT_SECONDS=300
if ! timeout "$TIMEOUT_SECONDS" npx nx run-many --target=e2e --projects=manifest-webpack-host --parallel=2 --skip-nx-cache; then
  echo "[e2e-manifest-dev] E2E run timed out after ${TIMEOUT_SECONDS}s" >&2
  cleanup
  exit 1
fi

echo "[e2e-manifest-dev] Completed successfully"
