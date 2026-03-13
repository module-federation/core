#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


def run(cmd: list[str], cwd: Path) -> str:
    result = subprocess.run(
        cmd,
        cwd=str(cwd),
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def find_repo_root(start: Path) -> Path:
    return Path(run(["git", "rev-parse", "--show-toplevel"], start))


def find_changeset_cli(repo_root: Path) -> Path:
    candidates = [
        repo_root / "node_modules" / "@changesets" / "cli" / "bin.js",
        repo_root / "node_modules" / ".bin" / "changeset",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    raise FileNotFoundError("Unable to locate Changesets CLI under node_modules")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Run Changesets status without shell wrappers so output is stable in non-TTY environments."
    )
    parser.add_argument(
        "--repo-root",
        default=".",
        help="Repo root. Defaults to current working directory.",
    )
    parser.add_argument(
        "--output",
        help="Optional path to write Changesets JSON output.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Pass --verbose to Changesets status.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit a small JSON wrapper with command, exit code, stdout, and stderr.",
    )
    args = parser.parse_args()

    repo_root = find_repo_root(Path(args.repo_root).resolve())
    cli = find_changeset_cli(repo_root)

    cmd = ["node", str(cli), "status"]
    if args.verbose:
        cmd.append("--verbose")
    if args.output:
        cmd.extend(["--output", str(Path(args.output).resolve())])

    proc = subprocess.run(
        cmd,
        cwd=str(repo_root),
        capture_output=True,
        text=True,
        check=False,
    )

    if args.json:
        payload = {
            "command": cmd,
            "exit_code": proc.returncode,
            "stdout": proc.stdout,
            "stderr": proc.stderr,
        }
        sys.stdout.write(json.dumps(payload, indent=2) + "\n")
    else:
        if proc.stdout:
            sys.stdout.write(proc.stdout)
        if proc.stderr:
            sys.stderr.write(proc.stderr)

    return proc.returncode


if __name__ == "__main__":
    raise SystemExit(main())
