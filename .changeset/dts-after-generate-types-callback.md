---
'@module-federation/dts-plugin': minor
'@module-federation/sdk': minor
---

feat(dts-plugin): add `afterGenerateTypes` callback to `PluginDtsOptions`

Allows users to hook into the type generation lifecycle. The callback is invoked after each successful `generateTypesAPI` call, in both dev and prod modes, making it possible to perform post-processing (e.g. analyzing generated `.d.ts` files to produce additional artifacts).

```ts
new ModuleFederationPlugin({
  dts: {
    generateTypes: true,
    afterGenerateTypes: async () => {
      // dts files are on disk here
      await analyzeTypesAndGenerateJson();
    },
  },
});
```
