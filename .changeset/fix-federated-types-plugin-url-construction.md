---
"@module-federation/typescript": patch
---

Fix URL construction in FederatedTypesPlugin for Node.js >22.11 compatibility

Fixed incorrect use of `path.join()` for URL construction in FederatedTypesPlugin.ts which was causing "Invalid URL" errors in Node.js versions greater than 22.11. The fix properly uses the URL constructor with the base URL as the second parameter instead of concatenating URLs with path.join().

This resolves compatibility issues when downloading remote types in newer Node.js environments.