---
"@module-federation/manifest": patch
"@module-federation/managers": patch
"@module-federation/enhanced": patch
---

fix: BuildVersion now correctly reads from project's package.json

- Fixed getBuildVersion() to accept optional root parameter for correct directory resolution
- Updated StatsManager to use compiler.context when determining build version
- Ensures buildVersion in mf-manifest.json matches the project's package.json version
- Resolves issue #3835 where buildVersion was reading from wrong package.json location