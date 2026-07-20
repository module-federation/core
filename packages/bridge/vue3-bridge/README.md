# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended Setup

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (previously Volar) and disable Vetur

- Use [vue-tsc](https://github.com/vuejs/language-tools/tree/master/packages/tsc) for performing the same type checking from the command line, or for generating d.ts files for SFCs.

## Bridge SSR V1 hydration

Serialize only `toBridgeSSRReference(result)` in host JSON. On the client, create
`createBridgeHydrationRegistry(document)` and call
`provideBridgeHydrationRegistry(app, registry)` before `app.mount(...)`. The full
server result is rendered once into its document slot; the client reference
consumes that slot's validated snapshot once. Missing slots use CSR, while
malformed slots throw. Vue Router 4 is the supported V1 router.
