---
"@module-federation/bridge-shared": patch
"@module-federation/bridge-react": patch
"@module-federation/nextjs-mf": patch
"@module-federation/modern-js": patch
"@module-federation/bridge-vue3": patch
"@module-federation/third-party-dts-extractor": patch
"@module-federation/rsbuild-plugin": patch
---

refactor: sink React packages from root to individual packages

- Removed React dependencies from root package.json and moved them to packages that actually need them
- Fixed rsbuild-plugin configuration to match workspace patterns
- Updated tests to handle platform-specific files
- This change improves dependency management by ensuring packages only have the dependencies they actually use
