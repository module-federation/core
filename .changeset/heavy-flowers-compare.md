---
'@module-federation/bridge-vue3': patch
---

1. Added type annotations for the argument in the `createBridgeComponent` function.
2. Added passing the instance of the created Vue-application to `appOptions` so that necessary plugins can be registered in this callback.
3. Made `router` returned from `appOptions` optional.
4. Fixed issues reported by TypeScript and ESLint, including allowing `beforeBridgeRenderRes` to be a promise.
5. Updated the documentation.
