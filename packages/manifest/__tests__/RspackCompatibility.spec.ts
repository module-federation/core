/** @jest-environment node */
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Stats } from '@module-federation/sdk';
import type { Stats as RspackStats } from '@rspack/core';
import type { Compiler, Compilation } from 'webpack';
import { ManifestManager } from '../src/ManifestManager';
import { StatsManager } from '../src/StatsManager';

// Use Node's loader for the ESM preview, and the root's pinned published host.
const nativeRequire = process
  .getBuiltinModule('module')
  .createRequire(__filename);
const hostRequire = process
  .getBuiltinModule('module')
  .createRequire(path.resolve(__dirname, '../../../package.json'));
const host = hostRequire('@rspack/core');
const remote = nativeRequire('@rspack/core');
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
  console.info('Federation compatibility versions', {
    host: hostRequire('@rspack/core/package.json').version,
    runtime: toolsRequire('@module-federation/runtime/package.json').version,
    hostTools,
    remote: remotePreview,
    remotePackage,
  });
});

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
    expect(nativeRequire('@rspack/core/package.json').version).toBe('2.2.3');
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
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address() as import('node:net').AddressInfo;
    const origin = `http://127.0.0.1:${address.port}/`;
    let window: Window | undefined;
    try {
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
        [remote, 'ordinary'],
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
                        '@module-federation/runtime-tools',
                        {
                          paths: [
                            path.dirname(
                              nativeRequire.resolve(
                                '@rspack/core/package.json',
                              ),
                            ),
                          ],
                        },
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
      expect(manifest.shared[0].identityId).toBeUndefined();
      let timeout: ReturnType<typeof setTimeout> | undefined;
      const value = await new Promise((resolve, reject) => {
        timeout = setTimeout(
          () => reject(new Error('Old host did not finish loading the remote')),
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
      expect(value).toEqual({ source: 'host singleton', same: true });
      expect(requests).toContain('/ordinary/remoteEntry.js');
      if (entry === 'mf-manifest.json')
        expect(requests).toContain('/ordinary/mf-manifest.json');
    } finally {
      window?.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await rm(directory, { recursive: true, force: true });
    }
  },
  30000,
);
