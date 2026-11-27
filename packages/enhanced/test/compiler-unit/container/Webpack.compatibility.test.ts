import ModuleFederationPlugin from '../../../src/lib/container/ModuleFederationPlugin';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import type { Stats } from 'webpack';

const webpack = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const ORIGIN = 'https://cdn.test';
const PAGE_URL = `${ORIGIN}/app/index.html`;

// These are real builds, not mocked Webpack internals. `pnpm run test` runs the
// suite on the package's Webpack, then `test:webpack-legacy` reruns it in a
// fresh process with FEDERATION_WEBPACK_PATH pointing to the workspace root's.
describe(`enhanced integration with Webpack ${webpack.version}`, () => {
  let context: string;
  let outputPath: string;

  beforeEach(() => {
    context = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-webpack-compat-'));
    outputPath = path.join(context, 'dist');
    fs.writeFileSync(
      path.join(context, 'package.json'),
      JSON.stringify({ name: 'webpack-compat-host', version: '1.0.0' }),
    );
    fs.writeFileSync(
      path.join(context, 'main.js'),
      `export const loadRemote = () => import('remote/value');
       globalThis.__lazyResult = import('./lazy.js');`,
    );
    fs.writeFileSync(path.join(context, 'shared.js'), 'export default 1;');
    fs.writeFileSync(
      path.join(context, 'lazy.js'),
      "import shared from './shared.js'; export default shared + 1;",
    );
    fs.writeFileSync(path.join(context, 'exposed.js'), 'export default 3;');
  });

  afterEach(() => {
    fs.rmSync(context, { recursive: true, force: true });
  });

  const build = async (
    mode: 'development' | 'production',
    publicPath: string,
  ) => {
    const compiler = webpack({
      mode,
      devtool: false,
      context,
      entry: './main.js',
      target: 'web',
      output: {
        path: outputPath,
        filename: 'static/js/[name].[contenthash:8].js',
        chunkFilename: 'static/js/chunks/[name].[contenthash].js',
        publicPath,
        uniqueName: 'webpack-compat-host',
      },
      optimization: { minimize: false },
      plugins: [
        new ModuleFederationPlugin({
          name: 'host',
          filename: 'remoteEntry.js',
          remotes: {
            remote: 'remoteGlobal@https://example.invalid/remoteEntry.js',
          },
          exposes: { './value': './exposed.js' },
          shared: {
            './shared.js': { requiredVersion: false, singleton: true },
          },
          dts: false,
          manifest: false,
        }),
      ],
    });
    let stats: Stats | undefined;
    try {
      stats = await new Promise<Stats | undefined>((resolve, reject) => {
        compiler.run((error, result) =>
          error ? reject(error) : resolve(result),
        );
      });
    } finally {
      await new Promise<void>((resolve, reject) => {
        compiler.close((error) => (error ? reject(error) : resolve()));
      });
    }
    if (!stats) throw new Error('Webpack did not return stats');
    expect(
      stats.hasErrors(),
      stats.toString({ all: false, errors: true }),
    ).toBe(false);
    return stats;
  };

  // Loads the entry as a browser would, serving each script tag from disk, and
  // reports which URLs the emitted runtime asked for.
  const runInBrowser = async (entryFile: string, assetBaseUrl: string) => {
    const requested: string[] = [];
    const sandbox: any = {
      console,
      setTimeout,
      clearTimeout,
      URL,
      location: new URL(PAGE_URL),
    };
    const load = (url: string) => {
      if (!url.startsWith(assetBaseUrl)) {
        throw new Error(`${url} is outside ${assetBaseUrl}`);
      }
      const file = path.join(outputPath, url.slice(assetBaseUrl.length));
      vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, {
        filename: file,
      });
    };
    sandbox.document = {
      baseURI: PAGE_URL,
      currentScript: {
        tagName: 'SCRIPT',
        src: `${assetBaseUrl}${entryFile}`,
      },
      createElement: () => {
        const attributes: Record<string, string> = {};
        return {
          tagName: 'SCRIPT',
          setAttribute: (key: string, value: string) => {
            attributes[key] = value;
          },
          getAttribute: (key: string) => attributes[key],
          removeAttribute: (key: string) => delete attributes[key],
        };
      },
      getElementsByTagName: () => [],
      head: {
        appendChild: (script: any) => {
          const url = new URL(script.src, PAGE_URL).href;
          requested.push(url);
          setTimeout(() => {
            try {
              load(url);
              script.onload?.({ type: 'load', target: script });
            } catch (error) {
              script.onerror?.(error);
            }
          });
          return script;
        },
        removeChild: () => undefined,
      },
    };
    sandbox.document.documentElement = sandbox.document.head;
    sandbox.document.body = sandbox.document.head;

    vm.createContext(sandbox);
    const contextGlobal = vm.runInContext('globalThis', sandbox);
    sandbox.self = contextGlobal;
    sandbox.window = contextGlobal;
    sandbox.document.defaultView = contextGlobal;
    load(`${assetBaseUrl}${entryFile}`);
    const lazy = await sandbox.__lazyResult;
    return { lazy, requested };
  };

  for (const mode of ['development', 'production'] as const) {
    it(`builds a ${mode} host/container with remotes, sharing and hashed assets`, async () => {
      const stats = await build(mode, './');
      const assets = stats.compilation.getAssets();
      expect(assets.some(({ name }) => name === 'remoteEntry.js')).toBe(true);
      expect(
        assets.some(({ name }) =>
          /^static\/js\/main\.[a-f0-9]{8}\.js$/.test(name),
        ),
      ).toBe(true);
      const read = (name: string) =>
        fs.readFileSync(path.join(outputPath, name), 'utf8');
      const sources = assets
        .filter(({ name }) => name.endsWith('.js'))
        .map(({ name }) => read(name))
        .join('\n');
      expect(sources).toContain('https://example.invalid/remoteEntry.js');
      expect(sources).toContain('remoteGlobal');
      const mainAsset = assets.find(({ name }) =>
        name.startsWith('static/js/main.'),
      );
      expect(read(mainAsset!.name)).toMatch(/rootOutputDir: "\.\.\/\.\.\/"/);
      expect(read('remoteEntry.js')).toMatch(/rootOutputDir: ""/);
    });

    for (const [publicPath, assetBaseUrl] of [
      ['./', `${ORIGIN}/app/`],
      ['../assets/', `${ORIGIN}/assets/`],
      ['auto', `${ORIGIN}/cdn/`],
    ]) {
      it(`loads hashed async chunks in ${mode} with publicPath ${publicPath}`, async () => {
        const stats = await build(mode, publicPath);
        const entryFile = stats.compilation
          .getAssets()
          .map(({ name }) => name)
          .find((name) => name.startsWith('static/js/main.'))!;
        const { lazy, requested } = await runInBrowser(entryFile, assetBaseUrl);
        expect(lazy.default).toBe(2);
        expect(requested.length).toBeGreaterThan(0);
        for (const url of requested) {
          expect(url).toMatch(/\/static\/js\/chunks\/.+\.[a-f0-9]{20}\.js$/);
          expect(url.startsWith(assetBaseUrl)).toBe(true);
        }
      });
    }
  }
});
