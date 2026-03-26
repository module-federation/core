# Sub-skill: integrate

Integrate Module Federation into an existing project — add provider (exposes modules) or consumer (loads remote modules) configuration.

## Step 1: Detect project

Collect MFContext by reading and following the instructions in `./context.md`, passing ARGS as the project root.

If no bundler can be detected (no `rsbuild.config`, `rspack.config`, `webpack.config`, `modern.config`, `next.config`, `vite.config` found), this is likely a new project. Tell the user:

> This looks like a new project. Run the following command to scaffold a full Module Federation project:
>
> ```bash
> npm create module-federation@latest
> ```

Then stop.

If MF is already configured (MFContext shows existing `remotes` or `exposes`), inform the user what is already configured and ask if they want to add/modify the configuration or stop.

---

## Step 2: Gather parameters

Ask the user the following questions (combine into one AskUserQuestion call):

1. **Role** — What role should this app play?
   - `consumer` — loads modules from remote apps (default)
   - `provider` — exposes modules to other apps
   - `both` — exposes modules and loads remote modules

2. **App name** — What should the MF name be for this app?
   - Suggest the `name` field from `package.json` (snake_case, no hyphens). Hyphens are not allowed in MF names.

3. **Role-specific**:
   - If **consumer** or **both**: Do you want to connect to the public demo provider to see MF working immediately, or configure your own remotes?
     - `demo` — use the public demo provider (default for consumers)
     - `custom` — I'll specify my own remote URLs
   - If **provider** or **both**: What module(s) do you want to expose? Provide `key: path` pairs, e.g. `./Button: ./src/components/Button.tsx`. If unsure, use `'.' : './src/index'` as a default.

---

## Step 3: Build the MF config object

Construct the MF config based on the gathered parameters:

### Remote entries (for consumer / both)

**Demo provider** (use when user chose `demo`):
```ts
remotes: {
  'provider': 'rslib_provider@https://unpkg.com/module-federation-rslib-provider@latest/dist/mf/mf-manifest.json',
},
```

The demo provider exposes a React component at `'provider'`. The user can import it in their app:
```tsx
import ProviderApp from 'provider';
```

**Custom remotes** (use when user chose `custom`):
Ask the user to provide remote entries in the format `name: url`, then use them as-is.

### Exposes (for provider / both)

Use the entries provided by the user. Example:
```ts
exposes: {
  './Button': './src/components/Button.tsx',
},
```

### Shared deps

Read `package.json` to check which frameworks are present. Set singletons accordingly:
- If `react` + `react-dom` present: add both as `{ singleton: true }`
- If `vue` present: add as `{ singleton: true }`
- If both (rare): add all as singletons

---

## Step 4: Generate files

Apply the correct pattern for the detected bundler:

---

### Rsbuild

**Detected by**: `rsbuild.config.ts` / `rsbuild.config.js` in project root.

#### 4a. Create `module-federation.config.ts`

```ts
import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: '<app-name>',
  // exposes: { ... },        // provider / both only
  // remotes: { ... },        // consumer / both only
  shareStrategy: 'loaded-first',
  shared: {
    // react + react-dom or vue — from Step 3
  },
});
```

#### 4b. Modify `rsbuild.config.ts`

```diff
+import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
+import moduleFederationConfig from './module-federation.config';

 export default defineConfig({
   plugins: [
     pluginReact(),
+    pluginModuleFederation(moduleFederationConfig),
   ],
 });
```

#### 4c. Install

```bash
pnpm add @module-federation/rsbuild-plugin
```

---

### Modern.js

**Detected by**: `modern.config.ts` / `modern.config.js` in project root.

#### 4a. Create `module-federation.config.ts`

```ts
import { createModuleFederationConfig } from '@module-federation/modern-js-v3';

export default createModuleFederationConfig({
  name: '<app-name>',
  // exposes: { ... },        // provider / both only
  // remotes: { ... },        // consumer / both only
  shared: {
    // react + react-dom or vue — from Step 3
  },
});
```

#### 4b. Modify `modern.config.ts`

```diff
+import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

 export default defineConfig({
   plugins: [
     appTools(),
+    moduleFederationPlugin(),
   ],
 });
```

#### 4c. For consumer: add type paths

Modify `tsconfig.json` to resolve remote types:

```diff
 {
   "compilerOptions": {
+    "paths": {
+      "*": ["./@mf-types/*"]
+    }
   }
 }
```

#### 4d. Install

```bash
pnpm add @module-federation/modern-js-v3
```

---

### Rspack

**Detected by**: `rspack.config.ts` / `rspack.config.js` in project root.

#### 4a. Modify `rspack.config.ts` / `rspack.config.js`

```diff
+const { ModuleFederationPlugin } = require('@module-federation/enhanced/rspack');

 module.exports = {
+  experiments: {
+    asyncStartup: true,
+  },
   plugins: [
+    new ModuleFederationPlugin({
+      name: '<app-name>',
+      // exposes: { ... },   // provider / both only
+      // remotes: { ... },   // consumer / both only
+      shared: {
+        // from Step 3
+      },
+    }),
   ],
 };
```

> Note: `experiments.asyncStartup` requires Rspack > 1.7.4.

#### 4b. Install

```bash
pnpm add @module-federation/enhanced
```

---

### Webpack

**Detected by**: `webpack.config.ts` / `webpack.config.js` in project root.

#### 4a. Modify `webpack.config.js`

```diff
+const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

 module.exports = {
+  experiments: {
+    asyncStartup: true,
+  },
   plugins: [
+    new ModuleFederationPlugin({
+      name: '<app-name>',
+      filename: 'remoteEntry.js',
+      // exposes: { ... },   // provider / both only
+      // remotes: { ... },   // consumer / both only
+      shared: {
+        // from Step 3
+      },
+    }),
   ],
 };
```

#### 4b. Install

```bash
pnpm add @module-federation/enhanced
```

---

### Next.js

**Detected by**: `next.config.ts` / `next.config.mjs` / `next.config.js` in project root.

> **Deprecation warning**: `@module-federation/nextjs-mf` only supports Pages Router (not App Router) and is no longer actively maintained. For new projects, consider using Rsbuild or Modern.js instead.

#### 4a. Modify `next.config.mjs`

```diff
+import { NextFederationPlugin } from '@module-federation/nextjs-mf';

 const nextConfig = {
   webpack(config, options) {
+    config.plugins.push(
+      new NextFederationPlugin({
+        name: '<app-name>',
+        filename: 'static/chunks/remoteEntry.js',
+        // exposes: { ... },   // provider / both only
+        // remotes: {          // consumer / both only
+        //   remote: `remote@http://localhost:3001/static/${options.isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
+        // },
+        shared: {},
+        extraOptions: {
+          exposePages: true,
+          enableImageLoaderFix: true,
+          enableUrlLoaderFix: true,
+        },
+      })
+    );
     return config;
   },
 };
```

#### 4b. Enable local Webpack

Add to `.env.local`:
```
NEXT_PRIVATE_LOCAL_WEBPACK=true
```

#### 4c. Install

```bash
pnpm add @module-federation/nextjs-mf webpack -D
```

---

### Vite

**Detected by**: `vite.config.ts` / `vite.config.js` in project root.

#### 4a. Modify `vite.config.ts`

```diff
+import { federation } from '@module-federation/vite';

 export default defineConfig({
   plugins: [
+    federation({
+      name: '<app-name>',
+      // exposes: { ... },   // provider / both only
+      // remotes: { ... },   // consumer / both only
+      shared: {
+        // from Step 3
+      },
+    }),
   ],
 });
```

#### 4b. Install

```bash
pnpm add @module-federation/vite
```

---

## Step 5: Auto-insert remote component (consumer / both only)

Skip this step entirely for provider-only role.

Ask the user:

> Do you want me to automatically add the remote component to your app's entry so you can see it working right away?

If the user says **no**, just show the code snippet as a reference and move on to Step 6.

If the user says **yes**:

### 5a. Locate the entry file

Search for the entry component file in this priority order:

| Bundler | Candidates (in order) |
|---|---|
| Rsbuild | `src/App.tsx`, `src/App.jsx`, `src/App.js` |
| Modern.js | `src/routes/page.tsx`, `src/routes/page.jsx` |
| Webpack / Rspack | `src/App.tsx`, `src/App.jsx`, `src/App.js`, `src/index.tsx`, `src/index.jsx` |
| Next.js | `pages/index.tsx`, `pages/index.jsx`, `pages/index.js` |
| Vite | `src/App.tsx`, `src/App.jsx`, `src/App.js` |

Read the first file that exists. If none found, tell the user which file to modify manually and show the snippet — do not attempt blind writes.

### 5b. Determine remote name and import path

Use the remote name from the config generated in Step 4:
- If demo provider: remote name is `provider`, import path is `'provider'`
- If custom remotes: use the first remote name the user specified

### 5c. Edit the entry file

Add the import at the top of the file (after existing imports) and render the component inside the existing JSX return.

**For React (Rsbuild / Rspack / Webpack / Vite)**

Add import after the last existing import line:
```tsx
import ProviderApp from 'provider';
```

Insert `<ProviderApp />` inside the existing JSX return. Find a natural place — inside a `<div>`, after existing content. Do not restructure the component; just append the element.

**For Modern.js** (`src/routes/page.tsx`)

Same pattern — add import and render `<ProviderApp />` in the returned JSX.

**For Next.js** (`pages/index.tsx`)

Same pattern — add import and render `<ProviderApp />` in the returned JSX.

### 5d. Add TypeScript declaration (if TypeScript project)

Check if `tsconfig.json` exists. If it does, create `src/remote.d.ts` (or add to an existing `src/declarations.d.ts` / `src/env.d.ts` if present):

```ts
declare module '<remote-name>' {
  const Component: React.ComponentType;
  export default Component;
}
```

Replace `<remote-name>` with the actual remote name (e.g., `provider`).

### Provider: how to verify the exposed module

Tell the user that after running the dev server, the manifest will be available at:
- Rsbuild / Rspack / Webpack / Modern.js: `http://localhost:<port>/mf-manifest.json`
- Next.js: `http://localhost:<port>/static/chunks/remoteEntry.js`

Another app can reference this app as a remote using:
```ts
remotes: {
  '<app-name>': '<app-name>@http://localhost:<port>/mf-manifest.json',
},
```

---

## Step 6: Summary

Output a concise summary:
- What files were created or modified
- What packages were installed
- How to start the dev server (use existing script from `package.json`)
- Next steps (e.g., add more remotes, configure shared deps, set up type generation)
