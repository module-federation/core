# shared-treeshake

## How to start the demos ?

### Basic 

1. Build host and provider

```bash
# Root directory
pnpm i

pnpm i -g serve

nx build modern-js-plugin

nx build shared-treeshake-host

nx build shared-treeshake-provider

```
2. Serve host and provider

```bash
nx serve shared-treeshake-host

serve apps/shared-treeshake/provider/dist -C -p 3002 
```

3. Visit page

open http://localhost:3001 , it will render success. 

You can check the current loaded shared by executing `__FEDERATION__.__SHARE__["mf_host:0.1.34"].default.antd["4.24.15"].lib()` in browser console.

It will show all antd components (fallback resources).


<!-- 4. Set localStorage to mock snapshot

```bash
localStorage.setItem('calc','no-use')
```

It will use the fallback resources. 

5. Refresh the page (Use fallback)

Execute `__FEDERATION__.__SHARE__["mf_host:0.1.34"].default.antd["4.24.15"].lib()` in browser console.

It will show export all components .  -->

### Advanced

This is combined with deploy server , which can calculate the snapshot of shared resources.

In this demo , you can set `localStorage.setItem('calc','use')` to mock snapshot.

First, need to re-shake the asset:

```bash
nx build:re-shake shared-treeshake-host
```

Second, serve it(`serve apps/shared-treeshake/host/dist-test -C -p 3003` ) and update the `reShakeShareEntry` with real url in `runtimePlugin.ts`

```diff
- reShakeShareEntry:
-   'http://localhost:3003/independent-packages/antd/antd_mf_host.3fc92539.js',
+ reShakeShareEntry:
+   'http://localhost:3003/independent-packages/antd/antd_mf_host.3fc92539.js',
```

Finally, set `localStorage.setItem('calc','use')` and refresh the page.

You will see the shared will use the re-shake shared with 5 modules export only.
