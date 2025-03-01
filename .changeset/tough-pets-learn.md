---
'@module-federation/bridge-vue3': patch
---

Fixed several issues:

1. Resolved inconsistencies in naming between `name` and `moduleName` to align with the type defined in `packages/bridge/bridge-shared/src/type.ts`. This also fixed an issue where `name` was being passed to the remote component, and if it was `<router-view>`, it caused rendering issues.

2. Issue: When passing props from a Vue 3 host application to a Vue 3 remote application created with `createRemoteComponent`, the props were being applied as attributes on the root container instead of being passed to the remote component.
Fix: Set `inheritAttrs: false` in `remoteApp.tsx` and explicitly pass all attributes to the remote component using `useAttrs()`.

3. Added a `rootAttrs` parameter to `createRemoteComponent` to allow passing attributes to the root container where the remote application is mounted. This enables setting classes, identifiers, and other attributes for the container element.
