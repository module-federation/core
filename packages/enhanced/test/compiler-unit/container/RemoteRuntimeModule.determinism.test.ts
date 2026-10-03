// @ts-nocheck

import ModuleFederationPlugin from '../../../src/lib/container/ModuleFederationPlugin';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import path from 'path';
import fs from 'fs';
import os from 'os';

const webpack = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

// Builds the same host twice. The only difference is the order the entry
// imports its two remotes, which flips the order RemoteModules are added to
// the chunk. The emitted remotes runtime must not depend on that order.
describe('RemoteRuntimeModule output determinism', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'remote-runtime-order-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const buildRemotesRuntime = async (imports: string[]) => {
    const context = fs.mkdtempSync(path.join(tempDir, 'build-'));
    // Static remote imports keep both RemoteModules in the main chunk; the
    // lazy import makes chunk loading a runtime requirement, which is what
    // adds the remotes runtime module.
    fs.writeFileSync(
      path.join(context, 'main.js'),
      [
        ...imports.map((request) => `import '${request}';`),
        "import('./lazy.js');",
      ].join('\n'),
    );
    fs.writeFileSync(path.join(context, 'lazy.js'), 'export default 1;');
    fs.writeFileSync(
      path.join(context, 'package.json'),
      '{ "name": "host", "version": "1.0.0" }',
    );

    const compiler = webpack({
      mode: 'development',
      devtool: false,
      context,
      entry: { main: './main.js' },
      output: {
        path: path.join(context, 'dist'),
        uniqueName: 'remote-runtime-order',
        publicPath: 'auto',
      },
      optimization: { moduleIds: 'named', chunkIds: 'named' },
      plugins: [
        new ModuleFederationPlugin({
          name: 'host',
          remotes: {
            alpha: 'alpha@http://localhost:3001/remoteEntry.js',
            beta: 'beta@http://localhost:3002/remoteEntry.js',
          },
          manifest: false,
        }),
      ],
    });

    const stats = await new Promise<any>((resolve, reject) => {
      compiler.run((err, s) => (err ? reject(err) : resolve(s)));
    });
    await new Promise<void>((resolve) => compiler.close(() => resolve()));
    if (stats.hasErrors()) {
      throw new Error(stats.toString({ all: false, errors: true }));
    }

    const { compilation } = stats;
    const sources: string[] = [];
    for (const chunk of compilation.chunks) {
      for (const runtimeModule of compilation.chunkGraph.getChunkRuntimeModulesIterable(
        chunk,
      )) {
        if (runtimeModule.name === 'remotes loading') {
          sources.push(runtimeModule.getGeneratedCode());
        }
      }
    }
    expect(sources).toHaveLength(1);
    return sources[0];
  };

  it('emits identical remotes runtime code when remote import order changes', async () => {
    const alphaFirst = await buildRemotesRuntime(['alpha/one', 'beta/two']);
    const betaFirst = await buildRemotesRuntime(['beta/two', 'alpha/one']);

    expect(alphaFirst).toContain('webpack/container/remote/alpha/one');
    expect(alphaFirst).toContain('webpack/container/remote/beta/two');
    expect(betaFirst).toBe(alphaFirst);
  });
});
