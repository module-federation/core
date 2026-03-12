---
name: gh-pr-metadata
description: Update the current GitHub PR title and body for this repository so they match the repo's pull request template and conventional-commit title style. Use when a PR title is vague or misformatted, when the PR body is missing required sections or checklist items, when Codex needs to normalize PR metadata before review or merge, or when GitHub comments/checks indicate the PR title or body should be corrected.
---

# GH PR Metadata

## Overview

Normalize the current branch's GitHub PR metadata to this repo's expectations. Keep the title in conventional-commit style, keep the body aligned to `.github/pull_request_template.md`, and validate before handoff.

Ground the PR metadata in the live branch state, not stale branch names or old commit subjects. Always inspect the current branch diff versus its base before rewriting the PR title/body.

Read [references/repo-pr-format.md](./references/repo-pr-format.md) when you need the exact section order, checklist items, or a title example.

## Workflow

1. Resolve the current branch PR.

```bash
gh pr view --json number,title,body,url,headRefName,baseRefName
```

2. Inspect the current branch state against the PR base branch.

At minimum, check:

```bash
git diff --name-status origin/<base>...HEAD
git diff --stat origin/<base>...HEAD
git log --oneline --decorate --no-merges origin/<base>..HEAD
```

Use these to answer:
- what files actually differ from the base right now
- which changes are functional versus cleanup/tooling/docs
- whether the existing PR title/body still matches the current branch after rebases, reverts, or scope narrowing

3. Validate the current title and body.

```bash
python3 .codex/skills/gh-pr-metadata/scripts/validate_pr_metadata.py
```

4. If the PR body needs a clean template scaffold, print one:

```bash
python3 .codex/skills/gh-pr-metadata/scripts/validate_pr_metadata.py --print-template
```

5. Rewrite the PR title in conventional-commit style.

Rules:
- Prefer `type(scope): summary`
- Keep the title short and direct
- Use repo-typical types such as `fix`, `feat`, `docs`, `refactor`, `chore`, `test`, `ci`, `build`, `perf`, `revert`
- Keep the scope tight to the affected package or subsystem when useful
- Do not add prefixes like `[codex]`
- Make sure the title describes the current branch diff, not the original branch intent if the branch was later narrowed or partially reverted

6. Rewrite the PR body to preserve the repo template structure:
- `## Description`
- `## Related Issue`
- `## Types of changes`
- `## Checklist`

7. Update the PR with `gh`.

Prefer writing the body to a temporary file first, then:

```bash
gh pr edit --title "<new-title>" --body-file /tmp/pr-body.md
```

8. Re-run validation and report whether the PR metadata is now compliant.

```bash
python3 .codex/skills/gh-pr-metadata/scripts/validate_pr_metadata.py
```

## Body Guidance

- Keep `Description` prose-first and specific to the branch.
- Reflect the branch as it exists now, especially after rebases, cleanups, or partial reverts.
- Summarize the real file-level themes from the live diff instead of copying commit messages mechanically.
- Put issue references in `Related Issue`; if there is no issue, say so plainly instead of deleting the section.
- In `Types of changes`, check only the boxes that actually apply.
- In `Checklist`, preserve all repo checklist items and mark only the items that are true.
- Do not remove required sections just because the PR is small.
- Keep the body concise; do not turn it into a changelog dump.

## Title Guidance

Good examples:
- `fix(node): normalize remote chunk parsing`
- `chore(manifest): drop extra compat cleanup`
- `docs(agents): prefer normalized webpack path requires`

Bad examples:
- `update pr`
- `fix stuff`
- `[codex] cleanup`

## Validation

Use the helper script to detect:
- non-conventional PR titles
- missing or reordered template sections
- missing repo checklist items

The script validates either the current PR from `gh` or explicit `--title` / `--body-file` input.
