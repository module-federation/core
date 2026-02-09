#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_DIR="${ROOT}/../treeshake-server"
BASE_URL="http://127.0.0.1:4000/tree-shaking-shared"

if [[ ! -d "${SERVER_DIR}" ]]; then
  echo "server dir not found: ${SERVER_DIR}" >&2
  exit 1
fi

if lsof -nP -iTCP:4000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "port 4000 already in use; stop the process and retry" >&2
  exit 1
fi

tmp_log="$(mktemp -t treeshake-server.local.XXXXXX.log)"
cleanup() {
  if [[ -n "${server_pid:-}" ]] && kill -0 "${server_pid}" >/dev/null 2>&1; then
    kill "${server_pid}" >/dev/null 2>&1 || true
    # Best-effort wait to avoid leaving a zombie behind.
    wait "${server_pid}" >/dev/null 2>&1 || true
  fi
  echo "server log: ${tmp_log}" >&2
}
trap cleanup EXIT

echo "[curl-backend] starting backend (local)..." >&2
(
  cd "${SERVER_DIR}"
  PORT=4000 HOST=127.0.0.1 \
    ADAPTER_ID=local \
    pnpm dev
) >"${tmp_log}" 2>&1 &
server_pid=$!

echo "[curl-backend] waiting for ${BASE_URL}/healthz ..." >&2
deadline=$((SECONDS + 120))
until curl -fsS "${BASE_URL}/healthz" >/dev/null 2>&1; do
  if (( SECONDS > deadline )); then
    echo "[curl-backend] backend did not become healthy within 120s" >&2
    echo "[curl-backend] last 200 log lines:" >&2
    tail -n 200 "${tmp_log}" >&2 || true
    exit 1
  fi
  sleep 0.5
done

echo "[curl-backend] OK: healthz" >&2

payload='{
  "shared": [
    ["antd", "6.1.0", ["Button","List","Badge"]],
    ["react", "18.2.0", []],
    ["react-dom", "18.2.0", []]
  ],
  "target": ["web", "browserslist:> 0.01%,not dead,not op_mini all"],
  "plugins": [],
  "libraryType": "global",
  "hostName": "@treeshake/shared-host"
}'

echo "[curl-backend] POST /build/check-tree-shaking" >&2
curl -sS -X POST -H "content-type: application/json" \
  --data "${payload}" \
  "${BASE_URL}/build/check-tree-shaking" | tee /dev/stderr >/dev/null

echo "[curl-backend] POST /build (this may take a while)" >&2
curl -sS -X POST -H "content-type: application/json" \
  --data "${payload}" \
  "${BASE_URL}/build" | tee /dev/stderr >/dev/null
