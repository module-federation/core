---
"@module-federation/rsbuild-plugin": patch
---

fix(rsbuild-plugin): improve build configuration and type handling

- Enhanced package.json exports for better module resolution
- Improved project.json configuration with proper build targets
- Enhanced rollup.config.js with better entry points and external handling
- Added missing TypeScript configuration files (tsconfig.lib.json, tsconfig.spec.json)
- Fixed minor code issues in cli/index.ts and utils/ssr.ts