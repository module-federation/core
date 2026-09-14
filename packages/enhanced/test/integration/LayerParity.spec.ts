/** @rstest-environment node */
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Manifest, Stats } from '@module-federation/sdk';

// Use Node's loader for real compilers/plugins, including manifest's pinned
// Rspack preview. Turbo's test task builds the plugins first.
const nativeRequire = process
  .getBuiltinModule('module')
  .createRequire(__filename);
const webpack = nativeRequire('webpack');
const manifestRequire = process
  .getBuiltinModule('module')
  .createRequire(nativeRequire.resolve('@module-federation/manifest'));
const { rspack } = manifestRequire('@rspack/core');
const webpackPlugin = nativeRequire(
  '@module-federation/enhanced',
).ModuleFederationPlugin;
const rspackPlugin = nativeRequire(
  '@module-federation/enhanced/rspack',
).ModuleFederationPlugin;
const { JSDOM } = process
  .getBuiltinModule('module')
  .createRequire(nativeRequire.resolve('jest-environment-jsdom'))('jsdom');

it.each([
  ['rspack', 'rspack', true, true, true],
  ['webpack', 'rspack', false, false, true],
  ['rspack', 'webpack', false, false, true],
  ['webpack', 'rspack', true, true, true],
  ['rspack', 'webpack', true, true, true],
  ['webpack', 'rspack', true, true, false],
  ['rspack', 'webpack', true, true, false],
  ['webpack', 'rspack', true, false, true],
  ['rspack', 'webpack', true, false, true],
  ['webpack', 'rspack', true, false, false],
  ['rspack', 'webpack', true, false, false],
] as const)(
  '%s host loads %s remote (layers: %s, separate scopes: %s, manifest: %s)',
  async (hostBundler, remoteBundler, layered, separateScopes, emitManifest) => {
    const directory = await mkdtemp(path.join(tmpdir(), 'mf-layer-parity-'));
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
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const origin = `http://127.0.0.1:${(server.address() as import('node:net').AddressInfo).port}/`;
    let window: Window | undefined;
    const variants = layered
      ? ([
          ['Server', 'server'],
          ['Client', 'client'],
          ['Omitted', undefined],
        ] as const)
      : ([['Omitted', undefined]] as const);
    try {
      await writeFile(
        path.join(directory, 'package.json'),
        JSON.stringify({ name: 'layer-parity-fixture', version: '1.0.0' }),
      );
      await writeFile(
        path.join(directory, 'component.js'),
        'export { default } from "./shared.js";',
      );
      await writeFile(path.join(directory, 'shared.js'), 'export default {};');
      await writeFile(
        path.join(directory, 'shared-loader.cjs'),
        'module.exports = function () { return "export default " + JSON.stringify({ source: this.getOptions().role, layer: this._module.layer ?? "default" }) + ";"; };',
      );
      for (const [name] of variants) {
        await writeFile(
          path.join(directory, `bootstrap-${name}.js`),
          `import remote from "remote/${name}"; import local from "./shared.js"; export default { remote, local, same: remote === local };`,
        );
      }
      await writeFile(
        path.join(directory, 'host.js'),
        `Promise.all([${variants.map(([name]) => `import("./bootstrap-${name}.js").then(m => m.default)`).join(',')}]).then(window.complete, window.fail);`,
      );
      for (const [role, bundler] of [
        ['remote', remoteBundler],
        ['host', hostBundler],
      ] as const) {
        const isHost = role === 'host';
        const shared = Object.fromEntries(
          (layered ? [undefined, 'server', 'client'] : [undefined]).map(
            (layer) => {
              const scope = separateScopes ? (layer ?? 'default') : 'default';
              return [
                layer ?? 'shared-value',
                {
                  request: emitManifest
                    ? './shared.js'
                    : path.join(directory, 'shared.js'),
                  import: emitManifest
                    ? './shared.js'
                    : path.join(directory, 'shared.js'),
                  shareKey: 'shared-value',
                  shareScope: scope,
                  ...(layer === undefined ? {} : { layer, issuerLayer: layer }),
                  singleton: true,
                  version: isHost ? '2.0.0' : '1.0.0',
                  requiredVersion: '*',
                },
              ];
            },
          ),
        );
        const Plugin = bundler === 'webpack' ? webpackPlugin : rspackPlugin;
        const compile = bundler === 'webpack' ? webpack : rspack;
        const cached =
          bundler === 'webpack' && layered && separateScopes && emitManifest;
        const makeCompiler = () =>
          compile({
            context: directory,
            mode: 'development',
            devtool: false,
            entry: isHost ? './host.js' : {},
            experiments: { layers: true },
            cache: cached
              ? {
                  type: 'filesystem',
                  cacheDirectory: path.join(directory, `${role}-cache`),
                }
              : false,
            module: {
              rules: [
                {
                  test: path.join(directory, 'shared.js'),
                  use: [
                    {
                      loader: path.join(directory, 'shared-loader.cjs'),
                      options: { role },
                    },
                  ],
                },
                ...variants
                  .filter(([, layer]) => layer !== undefined)
                  .map(([name, layer]) => ({
                    test: path.join(directory, `bootstrap-${name}.js`),
                    layer,
                  })),
              ],
            },
            output: {
              path: path.join(directory, role),
              publicPath: `${origin}${role}/`,
              uniqueName: role,
            },
            plugins: [
              new Plugin({
                name: role,
                // Declare every scope exchanged at the container boundary.
                shareScope: separateScopes
                  ? ['default', 'server', 'client']
                  : 'default',
                filename: 'remoteEntry.js',
                dts: false,
                manifest: emitManifest,
                ...(isHost
                  ? {
                      remotes: {
                        remote: `remote@${origin}remote/${emitManifest ? 'mf-manifest.json' : 'remoteEntry.js'}`,
                      },
                    }
                  : {
                      exposes: Object.fromEntries(
                        variants.map(([name, layer]) => [
                          `./${name}`,
                          {
                            import: './component.js',
                            ...(layer === undefined ? {} : { layer }),
                          },
                        ]),
                      ),
                    }),
                shared: emitManifest
                  ? shared
                  : Object.entries(shared).map(([key, value]) => ({
                      [key]: value,
                    })),
              }),
            ],
          });
        for (const pass of cached ? [0, 1] : [0]) {
          const compiler = makeCompiler();
          await new Promise<void>((resolve, reject) => {
            compiler.run(
              (
                error: Error | null,
                stats:
                  | {
                      hasErrors(): boolean;
                      toString(): string;
                      toJson(options: object): any;
                    }
                  | undefined,
              ) => {
                compiler.close((closeError: Error | null) => {
                  if (error || closeError || !stats || stats.hasErrors())
                    reject(error ?? closeError ?? new Error(stats?.toString()));
                  else {
                    try {
                      if (cached && pass === 1) {
                        const modules = stats.toJson({
                          all: false,
                          modules: true,
                          cachedModules: true,
                        }).modules;
                        expect(
                          modules.some(
                            (module: any) =>
                              module.nameForCondition ===
                                path.join(directory, 'shared.js') &&
                              module.built === false,
                          ),
                        ).toBe(true);
                      }
                      resolve();
                    } catch (error) {
                      reject(error);
                    }
                  }
                });
              },
            );
          });
        }
      }
      if (emitManifest) {
        const manifest: Manifest = JSON.parse(
          await readFile(
            path.join(directory, 'remote/mf-manifest.json'),
            'utf8',
          ),
        );
        const stats: Stats = JSON.parse(
          await readFile(path.join(directory, 'remote/mf-stats.json'), 'utf8'),
        );
        for (const artifact of [manifest, stats]) {
          expect(artifact.exposes).toHaveLength(variants.length);
          expect(artifact.shared).toHaveLength(layered ? 3 : 1);
          for (const shared of artifact.shared) {
            expect(shared).toMatchObject({
              name: 'shared-value',
              version: '1.0.0',
              singleton: true,
            });
            const assets = [
              ...shared.assets.js.sync,
              ...shared.assets.js.async,
            ];
            expect(assets.length).toBeGreaterThan(0);
            for (const asset of assets) {
              expect(
                (await readFile(path.join(directory, 'remote', asset))).length,
              ).toBeGreaterThan(0);
            }
          }
          for (const [name, layer] of variants) {
            const expose = artifact.exposes.find((item) => item.name === name)!;
            expect(expose).toBeDefined();
            expect(expose.layer).toBe(layer);
            expect(expose.assets.js.sync.length).toBeGreaterThan(0);
            for (const asset of [
              ...expose.assets.js.sync,
              ...expose.assets.js.async,
            ]) {
              expect(
                (await readFile(path.join(directory, 'remote', asset))).length,
              ).toBeGreaterThan(0);
            }
          }
          if (layered) {
            const serverAssets = artifact.exposes.find(
              (item) => item.name === 'Server',
            )!.assets.js;
            const clientAssets = artifact.exposes.find(
              (item) => item.name === 'Client',
            )!.assets.js;
            expect(serverAssets).not.toEqual(clientAssets);
            for (const layer of ['server', 'client']) {
              expect(artifact.shared).toEqual(
                expect.arrayContaining([
                  expect.objectContaining({
                    name: 'shared-value',
                    layer,
                    ...(separateScopes ? { shareScope: layer } : {}),
                  }),
                ]),
              );
            }
          }
        }
      }
      let timeout: ReturnType<typeof setTimeout> | undefined;
      const result = await new Promise<
        Array<{ remote: unknown; local: unknown; same: boolean }>
      >((resolve, reject) => {
        timeout = setTimeout(
          () =>
            reject(new Error('Mixed host did not finish loading the remote')),
          10000,
        );
        const browser = new JSDOM('<script src="host/main.js"></script>', {
          url: origin,
          runScripts: 'dangerously',
          resources: 'usable',
          beforeParse(
            browserWindow: Window & {
              complete?: typeof resolve;
              fail?: typeof reject;
            },
          ) {
            browserWindow.fetch = fetch;
            browserWindow.complete = resolve;
            browserWindow.fail = reject;
          },
        });
        window = browser.window;
      }).finally(() => clearTimeout(timeout));
      if (layered && !separateScopes) {
        // A singleton is selected per share scope/key, not per compilation layer.
        for (const value of result) {
          expect(value.remote).toMatchObject({ source: 'host' });
          expect(value.same).toBe(true);
          expect(value.remote).toBe(result[0].remote);
        }
      } else {
        expect(result).toEqual(
          variants.map(([, layer]) => ({
            remote: { source: 'host', layer: layer ?? 'default' },
            local: { source: 'host', layer: layer ?? 'default' },
            same: true,
          })),
        );
        if (layered) expect(result[0].remote).not.toBe(result[1].remote);
      }
      if (emitManifest) expect(requests).toContain('/remote/mf-manifest.json');
      expect(requests).toContain('/remote/remoteEntry.js');
    } finally {
      window?.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await rm(directory, { recursive: true, force: true });
    }
  },
  60000,
);
