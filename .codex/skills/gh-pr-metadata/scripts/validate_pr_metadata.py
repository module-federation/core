#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


TITLE_RE = (
    r"^(build|chore|ci|docs|feat|fix|perf|refactor|revert|test)"
    r"(\([^)]+\))?!?: .+"
)

REQUIRED_SECTIONS = [
    "## Description",
    "## Related Issue",
    "## Types of changes",
    "## Checklist",
]

REQUIRED_TYPE_LINES = [
    "- [ ] Docs change / refactoring / dependency upgrade",
    "- [ ] Bug fix (non-breaking change which fixes an issue)",
    "- [ ] New feature (non-breaking change which adds functionality)",
]

REQUIRED_CHECKLIST_LINES = [
    "- [ ] I have added tests to cover my changes.",
    "- [ ] All new and existing tests passed.",
    "- [ ] I have updated the documentation.",
]


def run(cmd: list[str], cwd: Path) -> str:
    proc = subprocess.run(
        cmd,
        cwd=str(cwd),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or proc.stdout.strip())
    return proc.stdout


def read_current_pr(cwd: Path) -> tuple[str, str]:
    raw = run(
        ["gh", "pr", "view", "--json", "title,body", "--jq", "{title: .title, body: .body}"],
        cwd,
    )
    data = json.loads(raw)
    return data["title"], data["body"] or ""


def load_body(args: argparse.Namespace, cwd: Path) -> tuple[str, str]:
    if args.title or args.body or args.body_file:
        title = args.title or ""
        if args.body_file:
            body = Path(args.body_file).read_text()
        else:
            body = args.body or ""
        return title, body
    return read_current_pr(cwd)


def validate_title(title: str) -> list[str]:
    import re

    errors: list[str] = []
    if not title:
      errors.append("title is empty")
      return errors
    if not re.match(TITLE_RE, title):
        errors.append(
            "title does not match conventional format "
            "(expected `type(scope): summary` or `type: summary`)"
        )
    if title.startswith("["):
        errors.append("title should not start with a bracketed prefix")
    return errors


def validate_body(body: str) -> list[str]:
    errors: list[str] = []
    positions: list[int] = []

    for section in REQUIRED_SECTIONS:
        idx = body.find(section)
        if idx == -1:
            errors.append(f"missing section: {section}")
        positions.append(idx)

    valid_positions = [p for p in positions if p != -1]
    if valid_positions and valid_positions != sorted(valid_positions):
        errors.append("required sections are out of order")

    for line in REQUIRED_TYPE_LINES:
        if line not in body:
            errors.append(f"missing type checkbox: {line}")

    for line in REQUIRED_CHECKLIST_LINES:
        if line not in body:
            errors.append(f"missing checklist item: {line}")

    return errors


def print_template() -> None:
    body = """## Description

<!--- Provide a general summary of your changes in the Title above -->
<!--- Describe your changes in detail -->

## Related Issue

<!--- This project only accepts pull requests related to open issues -->
<!--- If suggesting a new feature or change, please discuss it in an issue first -->
<!--- If fixing a bug, there should be an issue describing it with steps to reproduce -->
<!--- Please link to the issue here: -->

## Types of changes

- [ ] Docs change / refactoring / dependency upgrade
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)

## Checklist

- [ ] I have added tests to cover my changes.
- [ ] All new and existing tests passed.
- [ ] I have updated the documentation.
"""
    sys.stdout.write(body)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate PR title/body against repo conventions."
    )
    parser.add_argument("--title", help="Explicit PR title to validate.")
    parser.add_argument("--body", help="Explicit PR body to validate.")
    parser.add_argument("--body-file", help="Path to a PR body file to validate.")
    parser.add_argument(
        "--repo-root",
        default=".",
        help="Repo root. Defaults to current working directory.",
    )
    parser.add_argument(
        "--print-template",
        action="store_true",
        help="Print a repo-compliant PR body scaffold and exit.",
    )
    parser.add_argument(
        "--format",
        choices=["text", "json"],
        default="text",
        help="Output format.",
    )
    args = parser.parse_args()

    if args.print_template:
        print_template()
        return 0

    cwd = Path(args.repo_root).resolve()
    title, body = load_body(args, cwd)

    errors = validate_title(title) + validate_body(body)
    payload = {
        "ok": not errors,
        "title": title,
        "errors": errors,
    }

    if args.format == "json":
        sys.stdout.write(json.dumps(payload, indent=2) + "\n")
    else:
        if errors:
            sys.stdout.write("PR metadata validation failed:\n")
            for error in errors:
                sys.stdout.write(f"- {error}\n")
        else:
            sys.stdout.write("PR metadata validation passed.\n")

    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
