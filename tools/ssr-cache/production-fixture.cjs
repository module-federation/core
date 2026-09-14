const fs = require('node:fs/promises');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const mf = path.resolve(__dirname, '../..');
const root = process.env.SSR_CACHE_PRODUCTION_DIR;
const installed = process.env.SSR_CACHE_PACKAGES_ROOT;
const deps = path.join(
  installed || path.join(mf, 'apps/modernjs-ssr/host'),
  'node_modules',
);
const modern = process.env.SSR_CACHE_MODERN_ROOT;
const appTools = installed
  ? path.join(deps, '@modern-js/app-tools')
  : path.join(modern || '', 'packages/solutions/app-tools');
const runtime = installed
  ? path.join(deps, '@modern-js/runtime')
  : path.join(modern || '', 'packages/runtime/plugin-runtime');
const react = installed
  ? path.join(deps, 'react')
  : path.join(runtime, 'node_modules/react');
const reactDOM = installed
  ? path.join(deps, 'react-dom')
  : path.join(runtime, 'node_modules/react-dom');
const assetURL = process.env.SSR_CACHE_ASSET_URL;
if (!root || (!modern && !installed) || !assetURL)
  throw new Error(
    'Run production.cjs with SSR_CACHE_MODERN_ROOT or SSR_CACHE_PACKAGES_ROOT',
  );
(async () => {
  for (const app of ['remote', 'host']) {
    const dir = path.join(root, app);
    await fs.mkdir(path.join(dir, 'src/routes'), { recursive: true });
    const modules = path.join(dir, 'node_modules');
    if ((await fs.lstat(modules).catch(() => null))?.isSymbolicLink())
      await fs.unlink(modules);
    await fs.mkdir(modules, { recursive: true });
    const overrides = {
      '@modern-js/app-tools': appTools,
      '@modern-js/runtime': runtime,
      react,
      'react-dom': reactDOM,
    };
    for (const generated of ['.modern-js', '.cache']) {
      const target = path.join(modules, generated);
      if ((await fs.lstat(target).catch(() => null))?.isSymbolicLink())
        await fs.unlink(target);
    }
    for (const scope of await fs.readdir(deps)) {
      if (scope.startsWith('.')) continue;
      const names = scope.startsWith('@')
        ? (await fs.readdir(path.join(deps, scope))).map(
            (name) => scope + '/' + name,
          )
        : [scope];
      for (const name of names) {
        const target = path.join(modules, name);
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs
          .symlink(overrides[name] || path.join(deps, name), target)
          .catch((e) => {
            if (e.code !== 'EEXIST') throw e;
          });
      }
    }
    await fs.writeFile(
      path.join(dir, 'package.json'),
      JSON.stringify({
        name: `r6-${app}`,
        private: true,
        dependencies: {
          react: JSON.parse(await fs.readFile(path.join(react, 'package.json')))
            .version,
          'react-dom': JSON.parse(
            await fs.readFile(path.join(reactDOM, 'package.json')),
          ).version,
          '@modern-js/runtime': JSON.parse(
            await fs.readFile(path.join(runtime, 'package.json')),
          ).version,
        },
      }),
    );
    await fs.writeFile(
      path.join(dir, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { jsx: 'react-jsx' } }),
    );
    const config =
      app === 'remote'
        ? {
            name: 'r6_remote',
            filename: 'remoteEntry.js',
            dts: false,
            exposes: { './Counter': './src/Counter.tsx' },
            shared: {
              react: { singleton: true },
              'react-dom': { singleton: true },
            },
          }
        : {
            name: 'r6_host',
            dts: false,
            remotes: { remote: `r6_remote@${assetURL}/v1/mf-manifest.json` },
            shared: {
              react: { singleton: true },
              'react-dom': { singleton: true },
            },
          };
    await fs.writeFile(
      path.join(dir, 'modern.config.ts'),
      `import {appTools,defineConfig} from '@modern-js/app-tools'; import {moduleFederationPlugin} from '@module-federation/modern-js-v3'; export default defineConfig({output:{disableTsChecker:true,${app === 'remote' ? `assetPrefix:'${assetURL}/v1/',` : ''}},source:{alias:{react:${JSON.stringify(react)}, 'react-dom':${JSON.stringify(reactDOM)}}},server:{ssr:{mode:'stream'}},plugins:[appTools(),moduleFederationPlugin({ssr:{cacheUpdates:true},config:${JSON.stringify(config)}})]});`,
    );
    await fs.writeFile(
      path.join(dir, 'src/routes/layout.tsx'),
      `import {Outlet} from '@modern-js/runtime/router'; export default () => <Outlet/>;`,
    );
    await fs.writeFile(
      path.join(dir, 'src/routes/page.tsx'),
      app === 'remote'
        ? `export default () => <p>provider</p>;`
        : `import Counter from 'remote/Counter'; import {Suspense,use} from 'react'; function Held(){if(typeof document==='undefined' && globalThis.__r6Stream){globalThis.__r6Stream.started();use(globalThis.__r6Stream.promise);} return <span>stream complete</span>;} export default () => <main><h1>SSR release</h1><Counter /><Suspense fallback={<span>stream pending</span>}><Held /></Suspense></main>;`,
    );
    if (app === 'host')
      await fs.writeFile(
        path.join(dir, 'src/routes/page.data.ts'),
        `export const loader = async ({request}) => {await globalThis.__r6Loader?.(request);return {data:'loader-ready'}}; export const action=async({request})=>{globalThis.__r6Actions=(globalThis.__r6Actions||0)+1;return {action:await request.text()}};`,
      );
    if (app === 'remote')
      await fs.writeFile(
        path.join(dir, 'src/Counter.tsx'),
        `import {useState,useEffect} from 'react'; export const release='v1'; export default function Counter(){const [n,set]=useState(0); useEffect(()=>{document.getElementById("remote-counter").dataset.hydrated="true"},[]); return <button id="remote-counter" onClick={()=>set(n+1)}>v1:{n}</button>}`,
      );
    const result = spawnSync(
      process.execPath,
      [path.join(appTools, 'bin/modern.js'), 'build'],
      {
        cwd: dir,
        env: {
          ...process.env,
          NODE_ENV: 'production',
          TS_NODE_COMPILER: 'typescript-compiler',
        },
        stdio: 'inherit',
      },
    );
    if (result.status !== 0)
      throw new Error(`Modern build failed: ${result.status ?? result.signal}`);
  }
  const dir = path.join(root, 'remote');
  await fs.mkdir(path.join(root, 'releases'), { recursive: true });
  await fs.cp(path.join(dir, 'dist'), path.join(root, 'releases/v1'), {
    recursive: true,
  });
  for (const file of ['modern.config.ts', 'src/Counter.tsx']) {
    const text = await fs.readFile(path.join(dir, file), 'utf8');
    await fs.writeFile(path.join(dir, file), text.replaceAll('v1', 'v2'));
  }
  const result = spawnSync(
    process.execPath,
    [path.join(appTools, 'bin/modern.js'), 'build'],
    {
      cwd: dir,
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: 'inherit',
    },
  );
  if (result.status !== 0)
    throw new Error(
      `Provider v2 build failed: ${result.status ?? result.signal}`,
    );
  await fs.cp(path.join(dir, 'dist'), path.join(root, 'releases/v2'), {
    recursive: true,
  });
})();
