#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -eq 0 ]; then
  echo "Usage: $0 <nx arguments...>" >&2
  exit 1
fi

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git_dir="$(git rev-parse --path-format=absolute --git-dir)"
  git_common_dir="$(git rev-parse --path-format=absolute --git-common-dir)"
else
  git_dir=""
  git_common_dir=""
fi

if [ -n "$git_dir" ] && [ "$git_dir" != "$git_common_dir" ]; then
  exec env NX_DAEMON=false pnpm exec nx "$@"
fi

exec pnpm exec nx "$@"
