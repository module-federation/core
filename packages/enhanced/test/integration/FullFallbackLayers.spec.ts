/** @rstest-environment node */
import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';

const nativeRequire = process
  .getBuiltinModule('module')
  .createRequire(__filename);
const webpack = nativeRequire('webpack');
const { ModuleFederationPlugin } = nativeRequire('@module-federation/enhanced');
const { JSDOM } = process
  .getBuiltinModule('module')
  .createRequire(nativeRequire.resolve('jest-environment-jsdom'))('jsdom');

it.each([false, true])(
  'executes full shared fallbacks with distinct layer and scope identities (reverse=%s)',
  async (reverse) => {
    const directory = await realpath(
      await mkdtemp(path.join(tmpdir(), 'mf-full-fallback-')),
    );
    const requests: string[] = [];
    const server = createServer(async (request, response) => {
      requests.push(request.url!);
      try {
        response.setHeader('Content-Type', 'text/javascript');
        response.end(
          await readFile(path.join(directory, 'dist', request.url!)),
        );
      } catch {
        response.writeHead(404).end();
      }
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const origin = `http://127.0.0.1:${(server.address() as import('node:net').AddressInfo).port}/`;
    let window: Window | undefined;
    try {
      const variants = [
        { name: 'server', layer: 'server', shareScope: 'default' },
        { name: 'client', layer: 'client', shareScope: 'default' },
        { name: 'custom', layer: 'client', shareScope: 'custom' },
        { name: 'unlayered', layer: undefined, shareScope: 'default' },
      ];
      if (reverse) variants.reverse();
      await writeFile(
        path.join(directory, 'package.json'),
        '{"name":"fallback-fixture","version":"1.0.0"}',
      );
      await writeFile(
        path.join(directory, 'layer-loader.cjs'),
        'module.exports = function(source) { return source + "\\nexport const layer = " + JSON.stringify(this._module.layer ?? "unlayered") + ";"; };',
      );
      for (const { name } of variants) {
        await writeFile(
          path.join(directory, `${name}.js`),
          `export const value = ${JSON.stringify(name)};`,
        );
      }
      const providerLoads = variants.map(
        ({ layer, shareScope }) =>
          `__webpack_require__.federation.instance.loadShare('pkg', ${JSON.stringify({ customShareInfo: { scope: [shareScope], shareConfig: { layer, requiredVersion: '1.0.0' }, treeShaking: { mode: 'server-calc', status: 1 } } })}).then(get => { if (!get) throw new Error('Provider was not registered'); const m = get(); return { value: m.value, layer: m.layer }; })`,
      );
      await writeFile(
        path.join(directory, 'entry.js'),
        `Promise.all([${variants.map(({ name }) => `import('./${name}.js').then(m => ({ value: m.value, layer: m.layer }))`).join(',')}]).then(async consumed => ({ consumed, provided: await Promise.all([${providerLoads.join(',')}]) })).then(window.complete, window.fail);`,
      );
      const plugin = new ModuleFederationPlugin({
        name: 'full_fallback_host',
        dts: false,
        manifest: true,
        shared: Object.fromEntries(
          variants.map(({ name, layer, shareScope }) => [
            name,
            {
              import: `./${name}.js`,
              request: `./${name}.js`,
              shareKey: 'pkg',
              shareScope,
              layer,
              version: '1.0.0',
              requiredVersion: false,
              treeShaking: { mode: 'server-calc' },
            },
          ]),
        ),
      });
      const makeCompiler = () =>
        webpack({
          context: directory,
          mode: 'development',
          devtool: false,
          entry: './entry.js',
          experiments: { layers: true },
          cache: {
            type: 'filesystem',
            cacheDirectory: path.join(directory, 'cache'),
          },
          module: {
            rules: [
              {
                test: /(?:server|client|custom|unlayered)\.js$/,
                use: path.join(directory, 'layer-loader.cjs'),
              },
            ],
          },
          output: {
            path: path.join(directory, 'dist'),
            publicPath: origin,
            uniqueName: 'full_fallback_host',
          },
          plugins: [plugin],
        });
      for (let pass = 0; pass < 2; pass++) {
        const compiler = makeCompiler();
        await new Promise<void>((resolve, reject) =>
          compiler.run((error, stats) =>
            compiler.close((closeError) => {
              if (error || closeError || stats.hasErrors())
                reject(error || closeError || new Error(stats.toString()));
              else {
                try {
                  if (pass === 1)
                    expect(
                      stats
                        .toJson({
                          all: false,
                          modules: true,
                          cachedModules: true,
                        })
                        .modules.some(
                          (module) =>
                            module.nameForCondition?.endsWith('/server.js') &&
                            module.built === false,
                        ),
                    ).toBe(true);
                  resolve();
                } catch (error) {
                  reject(error);
                }
              }
            }),
          ),
        );
      }
      const manifest = JSON.parse(
        await readFile(path.join(directory, 'dist/mf-manifest.json'), 'utf8'),
      );
      expect(manifest.shared).toHaveLength(variants.length);
      expect(new Set(manifest.shared.map((share) => share.fallback)).size).toBe(
        variants.length,
      );
      expect(
        new Set(manifest.shared.map((share) => share.fallbackName)).size,
      ).toBe(variants.length);
      let timeout: ReturnType<typeof setTimeout>;
      const result = await new Promise((resolve, reject) => {
        timeout = setTimeout(
          () => reject(new Error('Full fallback execution timed out')),
          10000,
        );
        window = new JSDOM('<script src="main.js"></script>', {
          url: origin,
          runScripts: 'dangerously',
          resources: 'usable',
          beforeParse(w) {
            w.fetch = fetch;
            w.complete = resolve;
            w.fail = reject;
            w.addEventListener('error', (event) => reject(event.error));
          },
        }).window;
      }).finally(() => clearTimeout(timeout));
      const expected = variants.map(({ name, layer }) => ({
        value: name,
        layer: layer ?? 'unlayered',
      }));
      expect(result).toEqual({ consumed: expected, provided: expected });
      for (const share of manifest.shared)
        expect(requests).toContain(`/${share.fallback}`);
    } finally {
      window?.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await rm(directory, { recursive: true, force: true });
    }
  },
  60000,
);
