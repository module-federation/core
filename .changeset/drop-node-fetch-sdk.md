---
'@module-federation/sdk': minor
---

chore(sdk): drop the `node-fetch` fallback and optional peer dependency. Native `fetch` was already preferred everywhere it exists (Node 18+); the fallback only fired on EOL Node versions, where the loader-hook path was broken anyway. Removes up to ~9MB of optional install weight (`web-streams-polyfill` et al).
