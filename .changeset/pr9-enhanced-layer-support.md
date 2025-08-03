---
"@module-federation/enhanced": minor
---

feat: implement enhanced layer support with issuerLayer fallback logic

- Add issuerLayer parameter support throughout ConsumeSharedPlugin and related modules
- Implement issuerLayer fallback pattern in module resolution (tries issuerLayer first, then falls back to undefined)
- Add createLookupKeyForSharing utility to generate layer-aware lookup keys (e.g., "(client)react")
- Support layer-specific module sharing configuration with proper precedence rules
- Add comprehensive unit tests for issuerLayer fallback behavior and utility functions
- Fix test infrastructure issues and improve test assertions for better CI stability

This completes PR9: Enhanced Layer Support as defined in the incremental PR plan, enabling more granular control over shared module resolution based on issuer layers.