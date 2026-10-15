---
"@module-federation/bridge-react": minor
"@module-federation/modern-js-v3": patch
---

Allow Bridge providers to inject a framework streaming renderer alongside browser render and hydration callbacks. Keep the same producer component tree across SSR and hydration, expose a DOM-free server provider, and select Modern callbacks by build target while retaining explicit Module Federation exposes and Service App revision checks.
