---
"@module-federation/rsbuild-plugin": patch
---

fix(rsbuild-plugin): add build dependencies configuration to project.json

- Add dependsOn configuration to ensure dependencies are built before the plugin
- Improves build reliability and fixes potential issues when dependencies haven't been built