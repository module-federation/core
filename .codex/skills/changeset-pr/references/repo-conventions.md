# Repo Changesets Notes

## Current Config

- `.changeset/config.json` sets `baseBranch` to `main`.
- `commit` is `false`, so creating a changeset does not auto-commit anything.
- `updateInternalDependencies` is `patch`.
- A large `fixed` group covers many publishable `@module-federation/*` packages.
- `ignore` excludes apps/examples and `@changesets/assemble-release-plan`.

## Practical Implications

- A changeset that names one package can still produce a broader or higher release in `changeset status` because of the fixed group.
- `pnpm exec changeset status` is useful for syntax and release-plan verification, but not enough by itself to prove branch-local scope in this repo because the repo can already contain other pending changesets.
- Use the helper script in `scripts/inspect_changeset_scope.py` to compare the branch diff to the changeset file.

## Relevant Repo Commands

```bash
pnpm run changeset
pnpm run changeset:status
pnpm exec changeset status --verbose
pnpm exec changeset status --output /tmp/changeset-status.json
python3 .codex/skills/changeset-pr/scripts/inspect_changeset_scope.py --base origin/main
python3 .codex/skills/changeset-pr/scripts/inspect_changeset_scope.py --base origin/main --file .changeset/<file>.md
```

## Release Flow Notes

- The release PR workflow builds `@changesets/assemble-release-plan` before the release action runs.
- The repo uses a workspace-local fork of `@changesets/assemble-release-plan`.
- Do not run publish commands unless the user explicitly asks for release execution.
