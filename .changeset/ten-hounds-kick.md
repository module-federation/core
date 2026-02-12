---
'@module-federation/runtime': patch
---

Improve runtime instance resolution by selecting instances from global federation state (including remote-aware matching) and keeping `getInstance` stable after module resets.
