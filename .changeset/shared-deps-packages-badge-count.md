---
"@module-federation/devtools": patch
---

Fix the shared dependencies packages badge rendering its count twice. The badge printed `stats.totalPackages` next to the `packagesBadge` translation, which already interpolates the same value, so a single package showed as "11 packages".
