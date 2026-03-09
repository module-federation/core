#!/usr/bin/env bash
set -euo pipefail

nx_args=("$@")
if [ "${#nx_args[@]}" -gt 0 ] && [ "${nx_args[0]}" = "--" ]; then
  nx_args=("${nx_args[@]:1}")
fi

if [ "${#nx_args[@]}" -eq 0 ]; then
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
  exec env NX_DAEMON=false pnpm exec nx "${nx_args[@]}"
fi

exec pnpm exec nx "${nx_args[@]}"
