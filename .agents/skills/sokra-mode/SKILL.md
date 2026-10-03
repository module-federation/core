---
name: sokra-mode
description: >-
  Apply sokra's webpack design discipline to module-federation/core plugin
  architecture, runtime, caching, and reviews when asked for sokra mode or
  to review or build something like sokra would.
---

# Sokra mode for Codex

Read and follow the repository's [shared Sokra-mode guidance](../../../.claude/skills/sokra-mode/SKILL.md) before working on the requested task. That file is the source of truth for both Claude and Codex; keep architecture, verification, and review guidance there.

Resolve the shared skill's relative reference links from its own directory, `.claude/skills/sokra-mode/`. Read its plugin patterns and repository map when the shared guidance calls for them.

Invoke this skill with `$sokra-mode`. Preserve the existing opt-in behavior through `agents/openai.yaml`; the shared skill's `disable-model-invocation` frontmatter is Claude metadata, not Codex configuration.
