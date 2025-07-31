---
"@module-federation/rsbuild-plugin": patch
---

fix: add build dependencies configuration to project.json

- Add `dependsOn` configuration to ensure dependencies are built before this package
- Improves build reliability by ensuring proper dependency ordering
- Fixes potential build issues when dependencies haven't been built yet