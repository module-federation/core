---
"@module-federation/devtools": patch
---

fix(chrome-devtool): Avoid message crashes in devtools by converting functions and other unsafe values into safe placeholders before forwarding module data.
