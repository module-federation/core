---
'@module-federation/rsbuild-plugin': patch
---

fix: add missing vitest imports to rsbuild-plugin test file

Fixes CI test failure by adding missing `describe`, `expect`, and `it` imports from vitest to the test file. This resolves the "ReferenceError: describe is not defined" error that was causing the rsbuild-plugin tests to fail.