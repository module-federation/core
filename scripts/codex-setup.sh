#!/usr/bin/env bash
set -euo pipefail

corepack enable

install_args=("$@")
if [ "${#install_args[@]}" -gt 0 ] && [ "${install_args[0]}" = "--" ]; then
  install_args=("${install_args[@]:1}")
fi

run_install() {
  local daemon_value="$1"
  shift

  local -a args=("$@")
  local log_file
  log_file="$(mktemp -t codex-setup-pnpm.XXXXXX.log)"

  set +e
  if [ -n "$daemon_value" ]; then
    NX_DAEMON="$daemon_value" pnpm install "${args[@]}" 2>&1 | tee "$log_file"
  else
    pnpm install "${args[@]}" 2>&1 | tee "$log_file"
  fi
  local install_exit_code=${PIPESTATUS[0]}
  set -e

  if [ "$install_exit_code" -eq 0 ]; then
    rm -f "$log_file"
    return 0
  fi

  if grep -Eq "ENOENT: no such file or directory, open '.*node_modules/\\.pnpm/.*/package\\.json'" "$log_file"; then
    echo "[codex-setup] Transient pnpm virtual-store ENOENT detected. Retrying install once."
    set +e
    if [ -n "$daemon_value" ]; then
      NX_DAEMON="$daemon_value" pnpm install "${args[@]}"
    else
      pnpm install "${args[@]}"
    fi
    install_exit_code=$?
    set -e
  fi

  rm -f "$log_file"
  return "$install_exit_code"
}

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git_dir="$(git rev-parse --path-format=absolute --git-dir)"
  git_common_dir="$(git rev-parse --path-format=absolute --git-common-dir)"
else
  git_dir=""
  git_common_dir=""
fi

if [ -n "$git_dir" ] && [ "$git_dir" != "$git_common_dir" ]; then
  echo "[codex-setup] Git worktree detected. Running install with NX_DAEMON=false."
  run_install "false" "${install_args[@]}"

  echo "[codex-setup] Priming Nx project graph cache for daemon-disabled commands."
  NX_DAEMON=false pnpm exec nx show projects --json >/dev/null || true
else
  run_install "" "${install_args[@]}"
fi
