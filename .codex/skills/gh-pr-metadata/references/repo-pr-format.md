# Repo PR Format

Source files:
- `.github/pull_request_template.md`
- `AGENTS.md`

## Required PR Body Sections

Keep these sections in this order:

1. `## Description`
2. `## Related Issue`
3. `## Types of changes`
4. `## Checklist`

## Required Checklist Items

Types of changes:
- `- [ ] Docs change / refactoring / dependency upgrade`
- `- [ ] Bug fix (non-breaking change which fixes an issue)`
- `- [ ] New feature (non-breaking change which adds functionality)`

Checklist:
- `- [ ] I have added tests to cover my changes.`
- `- [ ] All new and existing tests passed.`
- `- [ ] I have updated the documentation.`

## Title Convention

Prefer conventional-commit style:

```text
type(scope): short summary
```

Examples:
- `fix(node): normalize remote chunk parsing`
- `docs(agents): prefer normalized webpack path requires`
- `chore(manifest): drop extra compat cleanup`

Avoid:
- bracketed prefixes like `[codex]`
- vague summaries like `update pr`
- titles that do not describe the branch's actual change

