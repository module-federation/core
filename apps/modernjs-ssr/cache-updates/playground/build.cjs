const fs = require('node:fs/promises');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = process.env.SSR_CACHE_PRODUCTION_DIR;
const installed =
  process.env.SSR_CACHE_PACKAGES_ROOT || path.resolve(__dirname, '..');
const deps = path.join(installed, 'node_modules');
const appTools = path.join(deps, '@modern-js/app-tools');
const runtime = path.join(deps, '@modern-js/runtime');
const react = path.join(deps, 'react');
const reactDOM = path.join(deps, 'react-dom');
const baseAssetURL = process.env.SSR_CACHE_ASSET_URL;
if (!root || !installed || !baseAssetURL)
  throw new Error('Run the cache-updates E2E entry');
(async () => {
  for (const app of ['remote', 'remote-b', 'static', 'dynamic']) {
    const dir = path.join(root, app);
    const assetURL = baseAssetURL + (app === 'remote-b' ? '/palette' : '');
    const isRemote = app.startsWith('remote');
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
    const config = isRemote
      ? {
          name: app === 'remote-b' ? 'lab_palette' : 'r6_remote',
          filename: 'remoteEntry.js',
          dts: false,
          exposes: {
            './Counter': './src/Counter.tsx',
            './Palette': './src/Palette.tsx',
          },
          shared: {
            react: { singleton: true },
            'react-dom': { singleton: true },
          },
        }
      : {
          name: 'lab_' + app,
          dts: false,
          remotes: { remote: `r6_remote@${assetURL}/v1/mf-manifest.json` },
          shared: {
            react: { singleton: true },
            'react-dom': { singleton: true },
          },
        };
    await fs.writeFile(
      path.join(dir, 'modern.config.ts'),
      `import {appTools,defineConfig} from '@modern-js/app-tools'; import {moduleFederationPlugin} from '@module-federation/modern-js-v3'; export default defineConfig({tools:{rspack(config,{isServer}){if(isServer)config.optimization.splitChunks=false;}},output:{disableTsChecker:true,${isRemote ? `assetPrefix:'${assetURL}/v1/',` : ''}},source:{${isRemote ? '' : "disableDefaultEntries:true,entries:{index:'src/routes',b:'src/b'},"}alias:{react:${JSON.stringify(react)}, 'react-dom':${JSON.stringify(reactDOM)}}},server:{ssr:{mode:'stream'}},plugins:[appTools(),moduleFederationPlugin({ssr:{cacheUpdates:true},config:${JSON.stringify(config)}})]});`,
    );
    await fs.writeFile(
      path.join(dir, 'src/routes/layout.tsx'),
      `import {Outlet} from '@modern-js/runtime/router'; export default () => <Outlet/>;`,
    );
    if (isRemote) {
      for (const file of ['Counter.tsx', 'Palette.tsx'])
        await fs.copyFile(
          path.join(__dirname, file),
          path.join(dir, 'src', file),
        );
      await fs.writeFile(
        path.join(dir, 'src/routes/page.tsx'),
        'export default () => <p>SSR provider</p>;',
      );
    } else {
      for (const entry of ['routes', 'b']) {
        await fs.mkdir(path.join(dir, 'src', entry), { recursive: true });
        await fs.writeFile(
          path.join(dir, 'src', entry, 'layout.tsx'),
          "import {Outlet} from '@modern-js/runtime/router'; export default () => <Outlet/>;",
        );
        let loader = await fs.readFile(
          path.join(__dirname, 'page.data.ts'),
          'utf8',
        );
        if (entry === 'routes')
          loader = loader
            .replace(
              '// REMOTE_IMPORT',
              "import {release, moduleInstance} from 'remote/Counter';",
            )
            .replace(
              '// REMOTE_FIELDS',
              'remoteRelease:release,remoteModuleInstance:moduleInstance,',
            );
        await fs.writeFile(
          path.join(dir, 'src', entry, 'page.data.ts'),
          loader,
        );
        let page = await fs.readFile(path.join(__dirname, 'Page.tsx'), 'utf8');
        page = page
          .replaceAll('__HOST__', app)
          .replaceAll('__ENTRY__', entry === 'routes' ? 'a' : 'b')
          .replace(
            "import Panel from 'remote/Counter';",
            entry === 'b'
              ? "import Panel from '../Palette';"
              : "import Panel from 'remote/Counter';",
          );
        if (app === 'static')
          page = page
            .replace("import Dynamic from '../Dynamic';", '')
            .replace('<Dynamic />', '');
        await fs.writeFile(path.join(dir, 'src', entry, 'page.tsx'), page);
      }
      for (const file of ['Palette.tsx', 'Dynamic.tsx', 'page.css'])
        await fs.copyFile(
          path.join(__dirname, file),
          path.join(dir, 'src', file),
        );
    }
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
  for (const remote of ['remote', 'remote-b']) {
    const dir = path.join(root, remote);
    const releases = path.join(
      root,
      'releases',
      remote === 'remote-b' ? 'palette' : '',
    );
    await fs.mkdir(releases, { recursive: true });
    await fs.cp(path.join(dir, 'dist'), path.join(releases, 'v1'), {
      recursive: true,
    });
    for (const file of [
      'modern.config.ts',
      'src/Counter.tsx',
      'src/Palette.tsx',
    ]) {
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
    await fs.cp(path.join(dir, 'dist'), path.join(releases, 'v2'), {
      recursive: true,
    });
  }
})();
