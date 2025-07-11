---
"@module-federation/runtime-tools": patch
---

fix: add files property to package.json to exclude build config from npm publish

Fixes #3873 where .swcrc file was being published to npm causing Jest test failures.
Only dist/ and README.md will now be included in the published package.