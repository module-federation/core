---
"@module-federation/runtime-core": minor
---

Added support for OR ranges in semantic version satisfaction logic with comprehensive unit tests.

- Implemented parsing for OR (||) conditions in version ranges.
  - Split input ranges by || to evaluate alternatives individually.
  - Ensured logical handling of wildcards '*' and 'x' within ranges.
- Refactored internal parsing to support more complex range constructs.
- Added comprehensive test cases to cover diverse scenarios for OR range support.
- Introduced error handling during range processing, with console logging for tracking issues.
