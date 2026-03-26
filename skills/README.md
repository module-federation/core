# MF Agent Skill

This directory contains the unified Module Federation skill.

Install:

```bash
npx skills add module-federation/core --skill mf -y
```

Main entry:

```text
/mf <sub-command | question>
```

Examples:

```text
/mf docs What is the difference between singleton and requiredVersion?
/mf integrate
/mf type-check
/mf shared-deps
/mf config-check
/mf runtime-error RUNTIME-008
```

Public skill:

- `mf/` — all-in-one Module Federation skill
