# Bridge React — HMR internals & zero-boilerplate integration

This document contains the implementation-level details of the built-in HMR
runtime shipped in `@module-federation/bridge-react` (v2.8.2+), as well as the
reference design for automatically injecting `rootComponentGetter` through a
compiler plugin so framework users (Modern.js / Rspack / Webpack) do not need
to write any HMR-specific glue by hand.

Consumer of the library can safely ignore this file and only consult the
`rootComponentGetter` section in the package README for day-to-day usage.

---

## 1. How HMR works inside the Bridge

When the Host loads a Bridge remote, React caches the `render` / `destroy`
handle returned by the *first* `createBridgeComponent()` factory call in a
`providerInfoRef`. Because JavaScript captures function references **by value**
in closures, simply replacing the `App` module code on disk does not update the
Bridge's internal `rootComponent` binding. The built-in runtime solves this by:

1. Recording the latest `rootComponent` for every caller site in a global
   `Map<CallerKey, LatestEntry>`.
2. Registering every currently-mounted Bridge DOM/root in a global registry.
3. Monkey-patching the Rspack `rspackHotUpdate{name}` globals and (when
   available) calling `import.meta.webpackHot.accept()` inside the caller's
   compilation scope.
4. After every HMR apply, re-invoking `root.render(...)` on each cached React
   root and reading the **latest** root component via the getter map → React
   Fiber reconciliation updates only the changed DOM text, no reload.

Source locations inside the monorepo:

- Runtime implementation:
  `packages/bridge/bridge-react/src/provider/versions/hmr-runtime.ts`
- `RawComponent` that reads through the getter map (instead of closing over a
  fixed reference):
  `packages/bridge/bridge-react/src/provider/versions/bridge-base.tsx`
- `registerLatest` / `installHMRHooks` call sites (v18, v19 and legacy):
  `packages/bridge/bridge-react/src/provider/versions/v18.ts`
  `packages/bridge/bridge-react/src/provider/versions/v19.ts`
  `packages/bridge/bridge-react/src/provider/versions/legacy.ts`

---

## 2. Zero-boilerplate HMR integration (Modern.js / Rspack / Webpack)

Adding `rootComponentGetter` by hand is fine for one-off remotes, but for
company-wide presets / frameworks we recommend **automating the getter
injection at compile time** so your users write literally zero extra code:

```tsx
// What the user writes — unchanged since v2.8.1
import { createBridgeComponent } from '@module-federation/bridge-react/v18';
import App from './App';

export default createBridgeComponent({
  rootComponent: App,
});

// What the loader rewrites it to, **before** handing off to rspack:
// export default createBridgeComponent({
//   rootComponent: App,
//   rootComponentGetter: () => (require as any)('./App').default,  // ← injected
// });
```

### 2.1 Reference Babel plugin (AST injector)

Use a Babel plugin (Babel-loader works in both Rspack and Webpack) with this
visitor pattern. The plugin never overwrites a `rootComponentGetter` that was
already authored by the user.

```ts
// babel-plugin-mf-bridge-hmr-getter.ts  (POC — ship in a plugin)
import type { PluginObj, NodePath } from '@babel/core';
import * as t from '@babel/types';

export default function mfBridgeHMRGetterPlugin(): PluginObj {
  return {
    name: 'module-federation-bridge-react-hmr-getter',
    visitor: {
      CallExpression(callPath: NodePath<t.CallExpression>) {
        const callee = callPath.node.callee;
        if (!t.isIdentifier(callee, { name: 'createBridgeComponent' })) return;
        const [arg0] = callPath.node.arguments;
        if (!t.isObjectExpression(arg0)) return;

        // Respect user-authored getter — never overwrite.
        const hasGetter = arg0.properties.some(
          (p) =>
            t.isObjectProperty(p) &&
            t.isIdentifier(p.key, { name: 'rootComponentGetter' }),
        );
        if (hasGetter) return;

        const rootProp = arg0.properties.find(
          (p) =>
            t.isObjectProperty(p) &&
            t.isIdentifier(p.key, { name: 'rootComponent' }) &&
            t.isIdentifier((p as t.ObjectProperty).value),
        ) as t.ObjectProperty | undefined;
        if (!rootProp) return;
        const localName = (rootProp.value as t.Identifier).name;

        // Reverse-map localName → import specifier source + kind (default / named)
        let source: string | undefined;
        let kind: 'default' | 'named' = 'default';
        let namedKey: string | undefined;
        callPath.scope.path.traverse({
          ImportDeclaration(p: NodePath<t.ImportDeclaration>) {
            for (const spec of p.node.specifiers) {
              if (
                t.isImportDefaultSpecifier(spec) &&
                spec.local.name === localName
              ) {
                source = p.node.source.value;
                kind = 'default';
                return;
              }
              if (
                t.isImportSpecifier(spec) &&
                spec.local.name === localName
              ) {
                source = p.node.source.value;
                kind = 'named';
                namedKey = t.isIdentifier(spec.imported)
                  ? spec.imported.name
                  : spec.imported.value;
                return;
              }
            }
          },
        });
        if (!source) return;

        // Inject rootComponentGetter: () => require('<source>').<default|NamedKey>
        const requireCall = t.callExpression(t.identifier('require'), [
          t.stringLiteral(source),
        ]);
        const accessor =
          kind === 'default'
            ? t.memberExpression(requireCall, t.identifier('default'))
            : t.memberExpression(requireCall, t.identifier(namedKey!));
        arg0.properties.push(
          t.objectProperty(
            t.identifier('rootComponentGetter'),
            t.arrowFunctionExpression([], accessor),
          ),
        );
      },
    },
  };
}
```

### 2.2 Wire the plugin into Modern.js (recommended home)

Place the Babel plugin in a Modern.js `@modern-js/app-tools` plugin through the
`tools.rspack` / `tools.webpack` hooks, gated on `NODE_ENV !== 'production'` so
it never adds unused getter lambdas to your build. Follow the same pattern that
`@module-federation/bridge-react-webpack-plugin` already uses for router alias
injection today (`packages/bridge/bridge-react-webpack-plugin/src/router-alias.ts`).

```ts
// modern.config.ts — Minimal working example for Modern.js zero-boilerplate HMR
import { defineConfig } from '@modern-js/app-tools';
import pluginBridgeReactHMR from './babel-plugin-mf-bridge-hmr-getter';

export default defineConfig({
  tools: {
    rspack: {
      module: {
        rules:
          process.env.NODE_ENV === 'production'
            ? []
            : [
                {
                  test: /\.(tsx?|jsx?)$/,
                  exclude: /node_modules/,
                  use: [
                    {
                      loader: 'babel-loader',
                      options: {
                        plugins: [pluginBridgeReactHMR],
                        cacheDirectory: true,
                      },
                    },
                  ],
                },
              ],
      },
    },
  },
});
```

### 2.3 Follow-up work (tracked in the `@module-federation/bridge-react` monorepo)

- [ ] Port the plugin above into `@module-federation/bridge-react-webpack-plugin`
      alongside the existing router-alias injections, so every user of
      `bridge-react-webpack-plugin` gets HMR getter injection **for free**.
- [ ] Implement the equivalent `swc_core` plugin for rspack projects that disable
      `babel-loader` entirely (SWC AST visitor is structurally identical; only
      the API surface changes).
- [ ] Expose a pre-packaged `@modern-js/plugin-module-federation-bridge-hmr`
      meta-package that turns the loader on by default for Modern.js apps that
      import `@module-federation/bridge-react` (feature-detect the bridge import
      in the dependency graph, skip otherwise).
