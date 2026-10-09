---
'@module-federation/enhanced': patch
---

Give each shared tree-shaking child compiler its own filesystem cache pack and close it after its run. Before, the children overwrote the parent's cache pack, so the next build rebuilt every parent module.
