---
name: changeset-pr
description: Create or update a `.changeset/*.md` file for the current branch or PR in this repository, choose the correct package scope and release type, and verify the result against repo-specific Changesets config. Use when a publishable package changed, when a PR is missing a changeset, when an existing changeset needs correction, or when Codex needs to confirm whether a branch should have a changeset at all.
---

# Changeset PR

## Overview

Create a repo-correct changeset for the current branch, or update an existing one without widening scope unnecessarily. Verify both syntax and package scope before handoff.

Ground the changeset in the live branch diff, not stale branch intent. Always inspect the current branch state against its base before choosing package scope or release type.

## Workflow

1. Confirm whether a changeset is needed.
2. Identify the publishable package scope from the live branch diff.
3. Create or edit one `.changeset/*.md` file.
4. Validate the file against repo config and branch scope.
5. Report the exact commands run and any ambiguity that remains.

## Decide Whether A Changeset Is Needed

- Add a changeset when a publishable package behavior changes.
- Do not add one for docs-only or non-behavioral repo changes unless the user explicitly wants release metadata anyway.
- If unsure whether the change is user-visible enough to merit a release note, inspect existing changesets in `.changeset/` and bias toward a short patch changeset rather than skipping silently.

Read [references/repo-conventions.md](./references/repo-conventions.md) when you need the repo-specific fixed-group, ignore-list, or release-flow details.

## Determine Scope

First inspect the live branch state:

```bash
git diff --name-status origin/main...HEAD
git diff --stat origin/main...HEAD
git log --oneline --decorate --no-merges origin/main..HEAD
```

Use that to separate real publishable-package behavior changes from repo-local docs, skills, tooling, or cleanup.

Start with the helper script:

```bash
python3 .codex/skills/changeset-pr/scripts/inspect_changeset_scope.py --base origin/main
```

Use its output to separate:

- touched publishable packages
- ignored packages
- fixed groups that will affect release planning

If the branch touches multiple publishable packages, include only the packages whose behavior actually changed. Do not add app/example packages from the ignore list.

## Create Or Update The Changeset

Prefer editing an existing branch changeset when one already covers the same change. Otherwise create a new file in `.changeset/` with the standard format:

```md
---
"@module-federation/pkg-name": patch
---

Brief user-facing summary of the change.
```

Rules:

- Keep the summary brief and release-note oriented.
- Avoid implementation-detail dumps and nested bullets.
- Use `patch`, `minor`, or `major` unless there is a specific reason to use `none`.
- Quote package names in frontmatter.
- Keep package scope tight even if the fixed group later broadens the computed plan.

The repo has a custom helper:

```bash
pnpm run changegen
```

Use it only if the user explicitly wants generated changeset text or the touched package is already covered by its configured package paths. Otherwise write the file directly.

## Validate

There is no dedicated `changeset validate` command in the official CLI. Use these checks instead:

1. Validate branch scope against the file:

```bash
python3 .codex/skills/changeset-pr/scripts/inspect_changeset_scope.py --base origin/main --file .changeset/<file>.md
```

2. Validate that Changesets can parse and plan the release:

```bash
python3 .codex/skills/changeset-pr/scripts/run_changeset_status.py --verbose
```

3. When machine-readable output is useful:

```bash
python3 .codex/skills/changeset-pr/scripts/run_changeset_status.py --output /tmp/changeset-status.json
```

Interpretation:

- `status` verifies parseability and computed release planning.
- `status` does not prove the changeset is branch-local or minimal in this repo because other pending changesets may already exist.
- Fixed-group packages can cause broader or higher bumps than the frontmatter alone suggests.
- Prefer the helper script over direct `pnpm exec changeset status` in Codex runs because shell wrappers in non-TTY sessions can add `/dev/tty` noise or otherwise make the raw CLI output unreliable.

## Update Existing Changesets

When asked to update a changeset for a branch or PR:

- search `.changeset/*.md` for the affected package name first
- prefer editing the existing file if it clearly belongs to the same branch work
- avoid creating duplicate files for the same single change unless the branch intentionally has multiple release notes

After editing, rerun both validation steps.

## Report Back

Always report:

- whether the branch needed a changeset
- which packages were included
- which commands were run
- whether `changeset status` succeeded
- any fixed-group or ignored-package caveats
