---
'@module-federation/node': patch
---

Report chunks loaded by the Node runtime plugin as ready to the bundler's
deferred entry startup, so an `async-node` entry with an initial split chunk no
longer resolves to `undefined`.
