#!/usr/bin/env bash
set -euo pipefail

corepack enable

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git_dir="$(git rev-parse --path-format=absolute --git-dir)"
  git_common_dir="$(git rev-parse --path-format=absolute --git-common-dir)"
else
  git_dir=""
  git_common_dir=""
fi

if [ -n "$git_dir" ] && [ "$git_dir" != "$git_common_dir" ]; then
  echo "[codex-setup] Git worktree detected. Running install with NX_DAEMON=false."
  NX_DAEMON=false pnpm install "$@"

  echo "[codex-setup] Priming Nx project graph cache for daemon-disabled commands."
  NX_DAEMON=false pnpm exec nx show projects --json >/dev/null || true
else
  pnpm install "$@"
fi
