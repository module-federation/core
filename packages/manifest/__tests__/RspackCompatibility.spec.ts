/** @jest-environment node */
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parse } from 'yaml';
import type { Stats } from '@module-federation/sdk';
import type { Stats as RspackStats } from '@rspack/core';
import type { Compiler, Compilation } from 'webpack';
import { ManifestManager } from '../src/ManifestManager';
import { StatsManager } from '../src/StatsManager';

// Use Node's loader for the preview and an explicitly pinned legacy host.
const nativeRequire = process
  .getBuiltinModule('module')
  .createRequire(__filename);
const hostRequire = process
  .getBuiltinModule('module')
  .createRequire(nativeRequire.resolve('@rspack/core-legacy/package.json'));
const host = hostRequire('@rspack/core');
const rspackPreviewRemote = nativeRequire('@rspack/core');
const hostTools = hostRequire.resolve('@module-federation/runtime-tools', {
  paths: [path.dirname(hostRequire.resolve('@rspack/core/package.json'))],
});
const toolsRequire = process
  .getBuiltinModule('module')
  .createRequire(hostTools);
const { JSDOM } = process
  .getBuiltinModule('module')
  .createRequire(hostRequire.resolve('jest-environment-jsdom'))('jsdom');

beforeAll(() => {
  const remotePreview =
    nativeRequire('../package.json').devDependencies['@rspack/core'];
  const remotePackage = nativeRequire.resolve('@rspack/core/package.json');
  const revision = remotePreview.slice(remotePreview.lastIndexOf('@') + 1);
  // pnpm truncates long URL dependency directory names, retaining the SHA prefix.
  expect(remotePackage).toContain(revision.slice(0, 12));
  const bindingRequire = process
    .getBuiltinModule('module')
    .createRequire(remotePackage);
  const bindingPath = bindingRequire.resolve('@rspack/binding');
  expect(bindingPath).toContain(revision);
  const platformRequire = process
    .getBuiltinModule('module')
    .createRequire(bindingPath);
  const lock = parse(
    readFileSync(path.resolve(__dirname, '../../../pnpm-lock.yaml'), 'utf8'),
  );
  const compilerVersion =
    lock.importers['packages/manifest'].devDependencies['@rspack/core'].version;
  const bindingVersion =
    lock.snapshots[`@rspack/core@${compilerVersion}`].dependencies[
      '@rspack/binding'
    ];
  // Single-platform preview publishes replace the wrapper's optional metadata.
  // The frozen lock preserves the exact binary URLs installed by CI.
  const binaryVersions = {
    ...lock.snapshots[`@rspack/binding@${bindingVersion}`].optionalDependencies,
    ...platformRequire('./package.json').optionalDependencies,
  };
  const nativeBindings = Object.keys(nativeRequire.cache).filter(
    (file) => file.endsWith('.node') && file.includes('@rspack+binding'),
  );
  expect(
    nativeBindings.some((file) => {
      const { name, version } = nativeRequire(
        path.join(path.dirname(file), 'package.json'),
      );
      return (
        binaryVersions[name]?.split('@').at(-1)?.startsWith(revision) &&
        version === nativeRequire('@rspack/core/package.json').version &&
        platformRequire.resolve(name) === file
      );
    }),
  ).toBe(true);
  console.info('Federation compatibility versions', {
    host: hostRequire('@rspack/core/package.json').version,
    runtime: toolsRequire('@module-federation/runtime/package.json').version,
    hostTools,
    remote: remotePreview,
    remoteRuntime: nativeRequire(
      '@module-federation/runtime-tools/package.json',
    ).version,
    remotePackage,
  });
});

async function withBrowserFixture<T>(
  run: (fixture: {
    directory: string;
    origin: string;
    requests: string[];
    load: <R>(entry: string, warnings?: string[]) => Promise<R>;
  }) => Promise<T>,
): Promise<T> {
  const directory = await mkdtemp(path.join(tmpdir(), 'mf-old-host-'));
  const requests: string[] = [];
  const server = createServer(async (request, response) => {
    requests.push(request.url!);
    try {
      const file = path.join(
        directory,
        new URL(request.url!, 'http://localhost').pathname,
      );
      response.setHeader(
        'Content-Type',
        file.endsWith('.json') ? 'application/json' : 'text/javascript',
      );
      response.end(await readFile(file));
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as import('node:net').AddressInfo;
  const origin = `http://127.0.0.1:${address.port}/`;
  let window: Window | undefined;
  async function load<T>(entry: string, warnings?: string[]): Promise<T> {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const value = await new Promise<T>((resolve, reject) => {
      timeout = setTimeout(
        () => reject(new Error(`Host did not finish loading ${entry}`)),
        10000,
      );
      const browser = new JSDOM(`<script src="${entry}"></script>`, {
        url: origin,
        runScripts: 'dangerously',
        resources: 'usable',
        beforeParse(
          browserWindow: Window & {
            complete?: typeof resolve;
            fail?: typeof reject;
          },
        ) {
          if (warnings)
            browserWindow.console.warn = (...args) =>
              warnings.push(args.map(String).join(' '));
          browserWindow.fetch = fetch;
          browserWindow.complete = resolve;
          browserWindow.fail = reject;
        },
      });
      window = browser.window;
    }).finally(() => {
      clearTimeout(timeout);
      window?.close();
    });
    return value;
  }
  try {
    return await run({ directory, origin, requests, load });
  } finally {
    window?.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await rm(directory, { recursive: true, force: true });
  }
}

it.each([
  ['remoteEntry.js', 'default'],
  ['mf-manifest.json', 'default'],
  ['remoteEntry.js', 'custom'],
  ['mf-manifest.json', 'custom'],
])(
  'old host loads a new ordinary remote via %s in %s scope',
  async (entry, shareScope) => {
    expect(hostRequire('@rspack/core/package.json').version).toBe('1.3.9');
    expect(
      toolsRequire('@module-federation/runtime/package.json').version,
    ).toBe('0.13.1');
    expect(nativeRequire('@rspack/core/package.json').version).toBe(
      '2.3.0-beta.1',
    );
    expect(
      nativeRequire('@module-federation/runtime-tools/package.json').version,
    ).toBe(nativeRequire('../package.json').version);
    await withBrowserFixture(async ({ directory, origin, requests, load }) => {
      // Isolate fixture module rules from package.json files above the temp dir.
      await writeFile(path.join(directory, 'package.json'), '{}');
      await writeFile(
        path.join(directory, 'component.js'),
        'export { default } from "shared-value";',
      );
      await writeFile(
        path.join(directory, 'remote-shared.js'),
        'export default { source: "remote fallback" };',
      );
      await writeFile(
        path.join(directory, 'host-shared.js'),
        'export default { source: "host singleton" };',
      );
      await writeFile(
        path.join(directory, 'bootstrap.js'),
        'import value from "ordinary/Component"; import shared from "shared-value"; export default { source: value.source, same: value === shared };',
      );
      await writeFile(
        path.join(directory, 'host.js'),
        'import("./bootstrap").then(({default: value}) => window.complete(value), window.fail);',
      );
      for (const [compiler, name] of [
        [rspackPreviewRemote, 'ordinary'],
        [host, 'host'],
      ] as const) {
        const isHost = name === 'host';
        const result = await new Promise<RspackStats>((resolve, reject) =>
          compiler.rspack(
            {
              context: directory,
              mode: 'development',
              devtool: false,
              entry: isHost ? './host.js' : {},
              output: {
                path: path.join(directory, name),
                publicPath: `${origin}${name}/`,
                uniqueName: name,
              },
              plugins: [
                new compiler.container.ModuleFederationPlugin({
                  name,
                  filename: 'remoteEntry.js',
                  shareScope,
                  implementation: isHost
                    ? hostTools
                    : nativeRequire.resolve(
                        '@module-federation/runtime-tools/bundler',
                      ),
                  ...(isHost
                    ? {
                        remotes: {
                          ordinary: `ordinary@${origin}ordinary/${entry}`,
                        },
                      }
                    : {
                        manifest: true,
                        exposes: { './Component': './component.js' },
                      }),
                  shared: {
                    'shared-value': {
                      import: `./${isHost ? 'host' : 'remote'}-shared.js`,
                      singleton: true,
                      version: isHost ? '2.0.0' : '1.0.0',
                      requiredVersion: false,
                      shareScope,
                    },
                  },
                }),
              ],
            },
            (error: Error | null, stats: RspackStats) => {
              if (error || !stats || stats.hasErrors())
                reject(error ?? new Error(stats?.toString()));
              else resolve(stats);
            },
          ),
        );
        if (!isHost) {
          const stats: Stats = JSON.parse(
            await readFile(path.join(directory, name, 'mf-stats.json'), 'utf8'),
          );
          const manager = new StatsManager();
          manager.init(
            { name, filename: 'remoteEntry.js' },
            { pluginVersion: 'test', bundler: 'rspack' },
          );
          const nativeCompiler = result.compilation
            .compiler as unknown as Compiler;
          const manifest = new ManifestManager().generateManifest({
            stats: manager.updateStats(stats, nativeCompiler),
            compiler: nativeCompiler,
            compilation: result.compilation as unknown as Compilation,
            publicPath: `${origin}${name}/`,
            bundler: 'rspack',
          });
          await writeFile(
            path.join(directory, name, 'mf-manifest.json'),
            JSON.stringify(manifest),
          );
        }
      }
      const manifest = JSON.parse(
        await readFile(
          path.join(directory, 'ordinary/mf-manifest.json'),
          'utf8',
        ),
      );
      expect(manifest.shared).toEqual([
        expect.objectContaining({
          id: 'ordinary:shared-value',
          name: 'shared-value',
        }),
      ]);
      expect(manifest.shared[0].layer).toBeUndefined();
      const value = await load('host/main.js');
      expect(value).toEqual({ source: 'host singleton', same: true });
      expect(requests).toContain('/ordinary/remoteEntry.js');
      if (entry === 'mf-manifest.json')
        expect(requests).toContain('/ordinary/mf-manifest.json');
    });
  },
  30000,
);

const webpack: typeof import('webpack') = nativeRequire('webpack');
const enhancedPath = nativeRequire.resolve(
  '../../enhanced/dist/src/webpack.js',
);
const releasedEnhancedPath = nativeRequire.resolve(
  '@module-federation/enhanced-legacy/webpack',
);

type Release = 'old' | 'new' | 'layered';
type Route = [name: string, scope: string];
type Fleet = {
  name: string;
  routes: Route[];
  middle?: Route[];
  order: string[];
  upgrades: string[];
};
const fleets: Fleet[] = [
  {
    name: 'default',
    routes: [['first', 'default']],
    order: ['first'],
    upgrades: ['top', 'first'],
  },
  {
    name: 'renamed',
    routes: [['first', 'renamed']],
    order: ['first'],
    upgrades: ['top', 'first'],
  },
  ...[
    ['first', 'second'],
    ['second', 'first'],
  ].map(
    (order): Fleet => ({
      name: `two remotes, ${order[0]} first`,
      routes: [
        ['first', 'default'],
        ['second', 'renamed'],
      ],
      order,
      upgrades: ['top', 'first', 'second'],
    }),
  ),
  {
    name: 'three-app chain',
    routes: [['first', 'default']],
    middle: [['second', 'renamed']],
    order: ['first'],
    upgrades: ['first'],
  },
];

function runWebpack(config: import('webpack').Configuration) {
  return new Promise<void>((resolve, reject) => {
    const compiler = webpack(config);
    compiler.run((error, stats) => {
      compiler.close((closeError) => {
        if (error || closeError || !stats || stats.hasErrors()) {
          reject(
            error ??
              closeError ??
              new Error(stats?.toString() ?? 'Webpack produced no stats'),
          );
        } else resolve();
      });
    });
  });
}

function enhancedPlugin(release: Release) {
  return nativeRequire(release === 'old' ? releasedEnhancedPath : enhancedPath)
    .ModuleFederationPlugin;
}

function singleton(importPath: string, version: string) {
  return {
    import: importPath,
    version,
    requiredVersion: false,
    singleton: true,
    shareScope: 'default',
  };
}

function promiseRemote(url: string, name: string) {
  return `(new Promise((resolve, reject) => __webpack_require__.l(${JSON.stringify(url)}, () => window[${JSON.stringify(name)}] ? resolve(window[${JSON.stringify(name)}]) : reject(new Error('Remote entry did not load: ${name}')), ${JSON.stringify(name)})))`;
}

async function webpackApp({
  directory,
  origin,
  output,
  name,
  release,
  routes = [],
  entry,
  expose,
}: {
  directory: string;
  origin: string;
  output: string;
  name: string;
  release: Release;
  routes?: Route[];
  entry?: string;
  expose?: string;
}) {
  const Plugin = enhancedPlugin(release);
  const version =
    name === 'second' ? '3.0.0' : name === 'top' ? '2.0.0' : '1.0.0';
  await runWebpack({
    context: directory,
    mode: 'development',
    devtool: false,
    entry: entry || {},
    experiments: { layers: release === 'layered' },
    output: {
      path: path.join(directory, output, name),
      publicPath: `${origin}${output}/${name}/`,
      uniqueName: name,
    },
    plugins: [
      new Plugin({
        name,
        filename: 'remoteEntry.js',
        dts: false,
        manifest: false,
        shareStrategy: 'version-first',
        remoteType: 'promise',
        ...(expose && { exposes: { './Component': expose } }),
        remotes: Object.fromEntries(
          routes.map(([remote, shareScope]) => [
            remote,
            {
              external: promiseRemote(
                `${origin}${output}/${remote}/remoteEntry.js`,
                remote,
              ),
              shareScope,
            },
          ]),
        ),
        shared: {
          'shared-value': singleton(`./${name}-shared.js`, version),
          ...(release === 'layered' && {
            './extra.js': {
              shareScope: 'extra',
              shareKey: 'extra-widget',
              layer: 'internal',
              version: '1.0.0',
            },
          }),
        },
      }),
    ],
  });
}

it.each(fleets)(
  'matches the published Webpack fleet for $name',
  async ({ routes, middle, order, upgrades }) => {
    await withBrowserFixture(async ({ directory, origin, load }) => {
      const names =
        middle || routes.length === 2
          ? ['top', 'first', 'second']
          : ['top', 'first'];
      await Promise.all(
        Object.entries({
          'package.json': '{}',
          'extra.js': 'export default "extra widget";',
          'host.js':
            'import("./observe.js").then(({ run }) => run()).then(window.complete, window.fail);',
          'observe.js': `
        ${routes.map(([name]) => `export const open_${name} = () => import('${name}/Component');`).join('\n')}
        export async function run() {
          const imports = [];
          ${order.map((name) => `imports.push((await open_${name}()).default);`).join('\n')}
          const own = (await import('shared-value')).default;
          return { provider: own.source, remotes: imports.map(value => ({ provider: value.source, same: own === value })) };
        }`,
          ...Object.fromEntries(
            names.flatMap((name) => [
              [
                `${name}-shared.js`,
                `export default { source: ${JSON.stringify(name)} };`,
              ],
              [
                `${name}-component.js`,
                `export { default } from 'shared-value'; ${name === 'first' && middle ? "export const openOther = () => import('second/Component');" : ''}`,
              ],
            ]),
          ),
        }).map(([file, contents]) =>
          writeFile(path.join(directory, file), contents),
        ),
      );

      async function observe(
        output: string,
        upgraded?: string,
        release: Release = 'old',
      ) {
        for (const name of [...names].reverse()) {
          await webpackApp({
            directory,
            origin,
            output,
            name,
            release: name === upgraded ? release : 'old',
            routes: name === 'top' ? routes : name === 'first' ? middle : [],
            ...(name === 'top'
              ? { entry: './host.js' }
              : { expose: `./${name}-component.js` }),
          });
        }
        const warnings: string[] = [];
        return {
          result: await load(`${output}/top/main.js`, warnings),
          warnings: warnings.filter((msg) =>
            /initializ.*(?:sharing|container|external)|already been initialized/i.test(
              msg,
            ),
          ),
        };
      }
      const reference = await observe('reference');
      console.info(
        'Fleet reference',
        JSON.stringify({ order, routes, middle, reference }),
      );
      for (const release of ['new', 'layered'] as const)
        for (const upgraded of upgrades) {
          const observed = await observe(
            `${upgraded}-${release}`,
            upgraded,
            release,
          );
          console.info(
            'Fleet mixed pairing',
            JSON.stringify({
              order,
              routes,
              middle,
              release,
              upgraded,
              observed,
            }),
          );
          expect(observed).toEqual(reference);
        }
    });
  },
  30000,
);

it.each(['sharing first', 'remote first'])(
  'runtime 0.13.1 preserves singleton selection with %s',
  async (order) => {
    await withBrowserFixture(async ({ directory, origin, load }) => {
      await Promise.all(
        Object.entries({
          'package.json': '{}',
          'top-shared.js': 'export default { source: "host singleton" };',
          'first-shared.js': 'export default { source: "remote fallback" };',
          'first-component.js': 'export { default } from "shared-value";',
          'extra.js': 'export default "extra widget";',
        }).map(([file, contents]) =>
          writeFile(path.join(directory, file), contents),
        ),
      );
      async function observe(release: Release) {
        await webpackApp({
          directory,
          origin,
          output: release,
          name: 'first',
          release,
          expose: './first-component.js',
        });
        await writeFile(
          path.join(directory, 'host.js'),
          `
        async function run() {
          const instance = __webpack_require__.federation.instance;
          ${order === 'sharing first' ? 'await Promise.all(instance.initializeSharing("default"));' : ''}
          const component = (await instance.loadRemote('first/Component')).default;
          const own = (await instance.loadShare('shared-value'))().default;
          const extra = instance.shareScopeMap.extra;
          const provider = extra?.[Symbol.for('module-federation.share-scope.layers')]
            ?.get('extra-widget')?.get('internal')?.['1.0.0'];
          return { provider: component.source, same: component === own,
            pools: Object.keys(instance.shareScopeMap).sort(),
            extra: provider ? (await provider.get())().default : null };
        }
        run().then(window.complete, window.fail);`,
        );
        await new Promise<void>((resolve, reject) => {
          host.rspack(
            {
              context: directory,
              mode: 'development',
              devtool: false,
              entry: './host.js',
              output: {
                path: path.join(directory, release, 'top'),
                publicPath: `${origin}${release}/top/`,
                uniqueName: 'runtime-0131',
              },
              plugins: [
                new host.container.ModuleFederationPlugin({
                  name: 'top',
                  implementation: hostTools,
                  shareStrategy: 'version-first',
                  remotes: {
                    first: `first@${origin}${release}/first/remoteEntry.js`,
                  },
                  shared: {
                    'shared-value': singleton('./top-shared.js', '2.0.0'),
                  },
                }),
              ],
            },
            (error: Error | null, stats: RspackStats) => {
              if (error || !stats || stats.hasErrors())
                reject(error ?? new Error(stats?.toString()));
              else resolve();
            },
          );
        });
        const warnings: string[] = [];
        const result = await load<{
          provider: string;
          same: boolean;
          pools: string[];
          extra: string | null;
        }>(`${release}/top/main.js`, warnings);
        return { ...result, warnings };
      }
      const reference = await observe('old');
      const unlayered = await observe('new');
      const layered = await observe('layered');
      console.info(
        'Runtime 0.13.1 touch order',
        JSON.stringify({ order, reference, unlayered, layered }),
      );
      expect(reference).toMatchObject({
        same: true,
        pools: ['default'],
        extra: null,
        warnings: [],
      });
      expect(unlayered).toEqual(reference);
      expect(layered).toEqual({
        ...reference,
        ...(order === 'remote first' && {
          pools: ['default', 'extra'],
          extra: 'extra widget',
        }),
      });
    });
  },
  30000,
);
