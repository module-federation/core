#!/usr/bin/env python3
import argparse
import json
import subprocess
import sys
from pathlib import Path


VALID_RELEASE_TYPES = {"patch", "minor", "major", "none"}


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


def load_changeset_config(repo_root: Path) -> dict:
    return json.loads((repo_root / ".changeset" / "config.json").read_text())


def discover_packages(repo_root: Path) -> dict[str, dict]:
    packages: dict[str, dict] = {}
    for pkg_json in repo_root.rglob("package.json"):
        if "node_modules" in pkg_json.parts:
            continue
        try:
            data = json.loads(pkg_json.read_text())
        except Exception:
            continue
        name = data.get("name")
        if not name:
            continue
        rel_dir = pkg_json.parent.relative_to(repo_root)
        private = bool(data.get("private", False))
        packages[name] = {
            "dir": str(rel_dir),
            "private": private,
        }
    return packages


def changed_files(repo_root: Path, base: str) -> list[str]:
    merge_base = run(["git", "merge-base", "HEAD", base], repo_root)
    out = run(["git", "diff", "--name-only", f"{merge_base}...HEAD"], repo_root)
    if not out:
        return []
    return [line for line in out.splitlines() if line]


def package_for_file(path_str: str, packages: dict[str, dict]) -> str | None:
    best_name = None
    best_len = -1
    for name, meta in packages.items():
        pkg_dir = meta["dir"].rstrip("/")
        if not pkg_dir:
            continue
        if path_str == pkg_dir or path_str.startswith(f"{pkg_dir}/"):
            if len(pkg_dir) > best_len:
                best_len = len(pkg_dir)
                best_name = name
    return best_name


def parse_changeset_file(path: Path) -> dict:
    text = path.read_text().strip()
    lines = text.splitlines()
    if len(lines) < 3 or lines[0].strip() != "---":
        raise ValueError("Changeset file must start with frontmatter delimited by ---")
    end_index = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_index = i
            break
    if end_index is None:
        raise ValueError("Changeset file frontmatter is missing the closing ---")

    releases: dict[str, str] = {}
    for raw in lines[1:end_index]:
        line = raw.strip()
        if not line:
            continue
        if ":" not in line:
            raise ValueError(f"Invalid frontmatter line: {raw}")
        pkg, release_type = line.split(":", 1)
        pkg = pkg.strip().strip("\"'")
        release_type = release_type.strip().strip("\"'")
        if release_type not in VALID_RELEASE_TYPES:
            raise ValueError(f"Invalid release type for {pkg}: {release_type}")
        releases[pkg] = release_type

    summary = "\n".join(lines[end_index + 1 :]).strip()
    return {"releases": releases, "summary": summary}


def build_report(repo_root: Path, base: str, file_path: Path | None) -> dict:
    config = load_changeset_config(repo_root)
    packages = discover_packages(repo_root)
    ignored = set(config.get("ignore", []))
    fixed_groups = [set(group) for group in config.get("fixed", [])]
    files = changed_files(repo_root, base)

    touched_packages = sorted(
        {
            pkg
            for file_path_str in files
            for pkg in [package_for_file(file_path_str, packages)]
            if pkg
        }
    )
    touched_publishable = [pkg for pkg in touched_packages if pkg not in ignored]

    report = {
        "base": base,
        "changed_files_count": len(files),
        "touched_packages": touched_packages,
        "touched_publishable_packages": touched_publishable,
        "ignored_touched_packages": [pkg for pkg in touched_packages if pkg in ignored],
        "fixed_groups_hit": [
            sorted(group)
            for group in fixed_groups
            if any(pkg in group for pkg in touched_publishable)
        ],
    }

    if file_path is not None:
        parsed = parse_changeset_file(file_path)
        listed = sorted(parsed["releases"].keys())
        unknown = [pkg for pkg in listed if pkg not in packages]
        ignored_listed = [pkg for pkg in listed if pkg in ignored]
        missing_for_touched = [pkg for pkg in touched_publishable if pkg not in listed]
        extra_without_touched_files = [pkg for pkg in listed if pkg not in touched_publishable]
        report["changeset"] = {
            "path": str(file_path.relative_to(repo_root)),
            "releases": parsed["releases"],
            "summary_present": bool(parsed["summary"]),
            "unknown_packages": unknown,
            "ignored_packages": ignored_listed,
            "missing_touched_publishable_packages": missing_for_touched,
            "packages_without_touched_files": extra_without_touched_files,
        }

    return report


def print_text(report: dict) -> None:
    print(f"Base: {report['base']}")
    print(f"Changed files: {report['changed_files_count']}")

    def print_list(label: str, values: list[str]) -> None:
        print(f"{label}:")
        if not values:
            print("- none")
            return
        for value in values:
            print(f"- {value}")

    print_list("Touched packages", report["touched_packages"])
    print_list("Touched publishable packages", report["touched_publishable_packages"])
    print_list("Ignored touched packages", report["ignored_touched_packages"])

    fixed_groups = report["fixed_groups_hit"]
    print("Fixed groups hit:")
    if not fixed_groups:
        print("- none")
    else:
        for group in fixed_groups:
            print(f"- {', '.join(group)}")

    changeset = report.get("changeset")
    if not changeset:
        return

    print(f"Changeset file: {changeset['path']}")
    print("Listed releases:")
    if not changeset["releases"]:
        print("- none")
    else:
        for pkg, release_type in changeset["releases"].items():
            print(f"- {pkg}: {release_type}")
    print(f"Summary present: {'yes' if changeset['summary_present'] else 'no'}")
    print_list("Unknown packages", changeset["unknown_packages"])
    print_list("Ignored packages in changeset", changeset["ignored_packages"])
    print_list(
        "Touched publishable packages missing from changeset",
        changeset["missing_touched_publishable_packages"],
    )
    print_list(
        "Changeset packages without touched files",
        changeset["packages_without_touched_files"],
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Inspect changed packages on the branch and validate a changeset file against repo config."
    )
    parser.add_argument("--base", default="origin/main", help="Branch or ref to diff against")
    parser.add_argument("--file", help="Optional .changeset/*.md file to validate")
    parser.add_argument("--json", action="store_true", help="Emit JSON")
    args = parser.parse_args()

    cwd = Path.cwd()
    repo_root = find_repo_root(cwd)
    file_path = Path(args.file).resolve() if args.file else None

    try:
        report = build_report(repo_root, args.base, file_path)
    except subprocess.CalledProcessError as exc:
        sys.stderr.write(exc.stderr)
        return exc.returncode
    except Exception as exc:
        sys.stderr.write(f"{exc}\n")
        return 1

    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
    else:
        print_text(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
