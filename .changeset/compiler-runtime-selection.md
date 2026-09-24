---
'@module-federation/enhanced': minor
'@module-federation/rspack': minor
'@module-federation/runtime-tools': minor
---

Coordinate runtime-family selection once per compiler. Enhanced and Rspack now
aggregate capability requirements before they apply compatibility defines.
Custom runtime implementations fail when their family is incomplete.

Add the runtime-tools federation facade. The runtime entry that Enhanced
generates now imports the bundler runtime through this facade. Rspack keeps its
legacy bootstrap until the native plugin reports support for the facade
contract.
