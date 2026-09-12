---
'@module-federation/sdk': patch
'@module-federation/runtime-core': patch
'@module-federation/runtime': patch
'@module-federation/node': patch
---

Introduce side-effect scopes with disposal on remote removal. During synchronous remote evaluation (entry execution in `createScriptNode`, chunk evaluation in `fetchAndRun`/`loadFromFs`, and module factory execution in `wrapModuleFactory`), top-level registrations of `setTimeout`, `setInterval`, `setImmediate`, and `process.on / once / addListener / prependListener` are tracked under the active remote's scope. When a remote is force re-registered or removed (`registerRemotes(remotes, { force: true, disposeSideEffects: true })`), recorded timers are cleared and process listeners are unregistered, preventing heap accumulation and listener leaks across generations in long-running Node SSR hosts.
