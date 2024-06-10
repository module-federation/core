---
'@module-federation/enhanced': patch
---

Wrap require of federation runtime module in conditional so that async boundary plugin doesnt crash runtimes who do not implement federation
