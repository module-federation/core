---
'@module-federation/runtime-core': major
'@module-federation/runtime': major
'@module-federation/webpack-bundler-runtime': major
'@module-federation/modern-js-v3': minor
---

Replace forced remote registration with asynchronous `updateRemotes`. Identical registrations are idempotent; conflicting registrations and `force: true` now throw. Updates validate the complete batch, serialize cleanup and replacement, and update every attached bundler. Callers must await completion and coordinate application work.

Modern SSR updates support batch upserts, monotonic application revisions, duplicate suppression, observable publication status, and explicit recovery using retained target registrations. Static updates retain proven entry scope; dynamic or failed updates rebuild the application in the same process.
