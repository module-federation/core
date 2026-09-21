---
'@module-federation/enhanced': minor
'@module-federation/rspack': minor
'@module-federation/runtime-tools': minor
---

Select the runtime family once per compiler. Enhanced and Rspack now collect
capability requirements before they apply compatibility defines. A custom
runtime implementation fails when its family is incomplete.

Add the default-only runtime facade. Rspack keeps its old bootstrap until the
native plugin supports the facade contract.
