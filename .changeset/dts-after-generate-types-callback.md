---
'@module-federation/dts-plugin': minor
'@module-federation/sdk': minor
---

feat(dts-plugin): add `dts.generateTypes.afterGenerate` callback

Allows users to hook into the type generation lifecycle from
`dts.generateTypes`. The callback runs after each successful type generation in
both dev and prod modes, making it possible to do follow-up work with the
generated files.

```ts
new ModuleFederationPlugin({
  dts: {
    generateTypes: {
      afterGenerate: async ({ zipTypesPath, apiTypesPath }) => {
        await analyzeTypesAndGenerateJson({
          zipTypesPath,
          apiTypesPath,
        });
      },
    },
  },
});
```
