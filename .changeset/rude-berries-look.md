---
'@module-federation/bridge-vue3': minor
---

Added the ability to pass parameters to `defineAsyncComponent`, which solves the following issues: 
- Enables control over fallback components and their display parameters; 
- Improves compatibility with Nuxt by allowing configuration of the `suspensible` parameter; 
- Eliminates the package requirement to `Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js"`.
