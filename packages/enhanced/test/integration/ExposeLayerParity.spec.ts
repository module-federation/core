/** @rstest-environment node */
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const nativeRequire = process
  .getBuiltinModule('module')
  .createRequire(__filename);
const manifestRequire = process
  .getBuiltinModule('module')
  .createRequire(nativeRequire.resolve('@module-federation/manifest'));
const compilers = {
  webpack: nativeRequire('webpack'),
  rspack: manifestRequire('@rspack/core').rspack,
};

it.each([
  ['webpack', true, false, undefined],
  ['rspack', true, false, undefined],
  ['webpack', false, true, undefined],
  ['rspack', false, true, undefined],
  ['webpack', true, true, 'rule'],
  ['rspack', true, true, 'rule'],
] as const)(
  '%s executes expose layers (manifest: %s, array form: %s, rule: %s)',
  async (bundler, manifest, arrayForm, ruleLayer) => {
    const directory = await mkdtemp(path.join(tmpdir(), 'mf-expose-layer-'));
    const Plugin = nativeRequire(
      `@module-federation/enhanced${bundler === 'rspack' ? '/rspack' : ''}`,
    ).ModuleFederationPlugin;
    const source = path.join(directory, 'source.js');
    const output = path.join(directory, 'dist');
    try {
      await writeFile(path.join(directory, 'package.json'), '{}');
      await writeFile(source, 'export default {};');
      await writeFile(
        path.join(directory, 'side-effect.js'),
        'globalThis.exposeSideEffect = true;',
      );
      await writeFile(
        path.join(directory, 'layer-loader.cjs'),
        'module.exports = function () { return "export default " + JSON.stringify({ layer: this._module.layer ?? null }) + ";"; };',
      );
      const cached = bundler === 'webpack' && manifest && !arrayForm;
      // Reopen a fresh compiler twice, then change only the expose layer.
      for (const pass of cached ? [0, 1, 2] : [0]) {
        const exposes = {
          './Server': {
            import: './source.js',
            layer: pass === 2 ? 'updated' : 'server',
          },
          './Client': {
            import: ['./side-effect.js', './source.js'],
            name: 'client',
            layer: 'client',
          },
          './Inherited': { import: './source.js' },
          './String': './source.js',
          './List': ['./side-effect.js', './source.js'],
        };
        const compiler = compilers[bundler]({
          context: directory,
          mode: 'development',
          devtool: false,
          target: 'node',
          entry: {},
          experiments: { layers: true },
          cache: cached
            ? {
                type: 'filesystem',
                cacheDirectory: path.join(directory, 'cache'),
              }
            : false,
          module: {
            rules: [
              {
                test: source,
                layer: ruleLayer,
                use: path.join(directory, 'layer-loader.cjs'),
              },
            ],
          },
          output: {
            path: output,
            publicPath: '/',
            uniqueName: 'expose_layers',
          },
          plugins: [
            new Plugin({
              name: 'expose_layers',
              filename: 'remoteEntry.cjs',
              library: { type: 'commonjs-module' },
              dts: false,
              manifest,
              exposes: arrayForm
                ? [
                    ...Object.entries(exposes).map(([key, value]) => ({
                      [key]: value,
                    })),
                    './source.js',
                  ]
                : exposes,
            }),
          ],
        });
        const stats = await new Promise<any>((resolve, reject) => {
          compiler.run((error: Error | null, stats: any) => {
            compiler.close((closeError: Error | null) => {
              if (error || closeError || !stats || stats.hasErrors())
                reject(error ?? closeError ?? new Error(stats?.toString()));
              else resolve(stats);
            });
          });
        });
        if (cached && pass === 1) {
          const modules = stats.toJson({
            all: false,
            modules: true,
            cachedModules: true,
          }).modules;
          expect(
            modules.some(
              (module: any) =>
                module.nameForCondition === source && module.built === false,
            ),
          ).toBe(true);
        }
        for (const filename of Object.keys(nativeRequire.cache)) {
          if (filename.startsWith(output + path.sep))
            delete nativeRequire.cache[filename];
        }
        const container = nativeRequire(path.join(output, 'remoteEntry.cjs'));
        await container.init({});
        const expected = {
          './Server': ruleLayer ?? (pass === 2 ? 'updated' : 'server'),
          './Client': ruleLayer ?? 'client',
          './Inherited': ruleLayer ?? null,
          './String': ruleLayer ?? null,
          './List': ruleLayer ?? null,
          ...(arrayForm ? { './source.js': ruleLayer ?? null } : {}),
        };
        const instances = new Set();
        for (const [key, layer] of Object.entries(expected)) {
          const factory = await container.get(key);
          const value = factory().default;
          expect(value).toEqual({ layer });
          if (['./Server', './Client', './Inherited'].includes(key))
            instances.add(value);
        }
        expect(instances.size).toBe(ruleLayer ? 1 : 3);
        expect(globalThis.exposeSideEffect).toBe(true);
        delete globalThis.exposeSideEffect;
        if (manifest) {
          for (const filename of ['mf-manifest.json', 'mf-stats.json']) {
            const artifact = JSON.parse(
              await readFile(path.join(output, filename), 'utf8'),
            );
            expect(artifact.exposes).toHaveLength(Object.keys(expected).length);
            expect(
              artifact.exposes.find((item: any) => item.name === 'Server')
                .layer,
            ).toBe(pass === 2 ? 'updated' : 'server');
          }
        } else {
          await expect(
            readFile(path.join(output, 'mf-manifest.json')),
          ).rejects.toMatchObject({ code: 'ENOENT' });
        }
      }
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
  60000,
);
