// @ts-nocheck

import ModuleFederationPlugin from '../../../src/lib/container/ModuleFederationPlugin';
import ContainerReferencePlugin from '../../../src/lib/container/ContainerReferencePlugin';
import RemoteRuntimeModule from '../../../src/lib/container/RemoteRuntimeModule';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import path from 'path';
import fs from 'fs';
import os from 'os';
import vm from 'vm';

const webpack = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const MISSING_RUNTIME_WARNING = 'without the federation runtime';

// Tools like worker-loader compile a web worker in a child compiler created with
// `compilation.createChildCompiler`. Webpack copies every parent compiler hook into
// the child except `thisCompilation` (and make/compile/emit/...). The federation
// runtime (`__webpack_require__.federation`) is injected from `thisCompilation`, so it
// never reaches the child. Federation plugins tapping inheritable hooks must therefore
// skip child compilations, otherwise the child bundle reads
// `__webpack_require__.federation.bundlerRuntimeOptions` and throws on start.
describe('federation plugins in child compilers', () => {
  let context: string;

  beforeEach(() => {
    context = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-child-compiler-'));
    fs.writeFileSync(
      path.join(context, 'package.json'),
      JSON.stringify({
        name: 'host',
        version: '1.0.0',
        dependencies: { 'shared-lib': '1.0.0' },
      }),
    );
    const sharedLibDir = path.join(context, 'node_modules', 'shared-lib');
    fs.mkdirSync(sharedLibDir, { recursive: true });
    fs.writeFileSync(
      path.join(sharedLibDir, 'package.json'),
      JSON.stringify({
        name: 'shared-lib',
        version: '1.0.0',
        main: 'index.js',
      }),
    );
    fs.writeFileSync(
      path.join(sharedLibDir, 'index.js'),
      'module.exports = { value: 42 };',
    );
    fs.writeFileSync(
      path.join(context, 'main.js'),
      "import('remote/thing');\nimport('shared-lib');\n",
    );
    // The worker uses a shared module and has an async chunk: the two triggers that
    // made the remotes/sharing runtime appear in child bundles.
    fs.writeFileSync(
      path.join(context, 'worker.js'),
      [
        "import { value } from 'shared-lib';",
        'self.onmessage = async () => {',
        "  const lazy = await import('./lazy.js');",
        '  self.postMessage(value + lazy.default);',
        '};',
      ].join('\n'),
    );
    fs.writeFileSync(path.join(context, 'lazy.js'), 'export default 1;');
  });

  afterEach(() => {
    fs.rmSync(context, { recursive: true, force: true });
  });

  // Builds a federated host whose `make` hook compiles `worker.js` in a child compiler,
  // the way worker-loader does. `setupChild` can apply extra plugins to the child.
  const build = async (setupChild?: (child) => void) => {
    const result = { childSource: '', childWarnings: [] as Error[] };

    const childCompilerPlugin = {
      apply(compiler) {
        compiler.hooks.make.tapAsync('ChildWorkerPlugin', (compilation, cb) => {
          const child = compilation.createChildCompiler('worker', {
            filename: 'worker.js',
            chunkFilename: 'worker.[id].js',
            globalObject: 'self',
          });
          new webpack.webworker.WebWorkerTemplatePlugin().apply(child);
          new webpack.EntryPlugin(context, './worker.js', 'worker').apply(
            child,
          );
          setupChild?.(child);
          child.runAsChild((err, entries, childCompilation) => {
            if (err) return cb(err);
            const errors = childCompilation.getErrors();
            if (errors.length) return cb(errors[0]);
            result.childWarnings = childCompilation.getWarnings();
            result.childSource = childCompilation.assets['worker.js']
              .source()
              .toString();
            cb();
          });
        });
      },
    };

    const compiler = webpack({
      mode: 'development',
      devtool: false,
      context,
      entry: { main: './main.js' },
      output: {
        path: path.join(context, 'dist'),
        uniqueName: 'mf-child-compiler',
        publicPath: 'auto',
      },
      plugins: [
        new ModuleFederationPlugin({
          name: 'host',
          filename: 'remoteEntry.js',
          exposes: { './lazy': './lazy.js' },
          remotes: { remote: 'remote@http://localhost:3001/remoteEntry.js' },
          shared: { 'shared-lib': { requiredVersion: '1.0.0' } },
          manifest: false,
          dts: false,
        }),
        childCompilerPlugin,
      ],
    });

    const stats = await new Promise<any>((resolve, reject) => {
      compiler.run((err, s) => (err ? reject(err) : resolve(s)));
    });
    await new Promise<void>((resolve) => compiler.close(() => resolve()));
    if (stats.hasErrors()) {
      throw new Error(stats.toString({ all: false, errors: true }));
    }
    return {
      ...result,
      parentWarnings: stats.compilation.getWarnings(),
      mainSource: fs.readFileSync(
        path.join(context, 'dist', 'main.js'),
        'utf8',
      ),
    };
  };

  const runAsWorker = (source: string) => {
    const self: any = {
      location: { href: 'http://localhost/worker.js' },
      importScripts() {},
      postMessage() {},
    };
    self.self = self;
    vm.runInNewContext(source, {
      self,
      importScripts: self.importScripts,
      location: self.location,
    });
  };

  it('does not emit federation runtime code into a child compilation', async () => {
    const { mainSource, childSource, parentWarnings } = await build();

    // The parent build keeps its federation runtime, without false diagnostics.
    expect(mainSource).toContain('bundlerRuntimeOptions');
    expect(
      parentWarnings.filter((w) => w.message.includes(MISSING_RUNTIME_WARNING)),
    ).toHaveLength(0);

    // The child (worker) build stays a plain webpack bundle.
    expect(childSource).not.toBe('');
    expect(childSource).not.toContain('bundlerRuntimeOptions');
    expect(childSource).not.toContain('register("shared-lib"');

    // And its bootstrap runs without touching an undefined `federation` object.
    expect(() => runAsWorker(childSource)).not.toThrow();
  });

  it('still runs federation plugins applied directly to a child compiler', async () => {
    // Only inherited taps are skipped. A plugin applied to the child compiler itself runs,
    // and the federation runtime is injected into that child as well.
    const { childSource, childWarnings } = await build((child) => {
      new ContainerReferencePlugin({
        remoteType: 'script',
        remotes: { remote: 'remote@http://localhost:3001/remoteEntry.js' },
      }).apply(child);
    });

    expect(childSource).toContain('bundlerRuntimeOptions');
    expect(childSource).toMatch(/__webpack_require__\.federation\s*=\s*\{/);
    expect(
      childWarnings.filter((w) => w.message.includes(MISSING_RUNTIME_WARNING)),
    ).toHaveLength(0);
  });

  it('warns at build time when the remotes runtime is emitted without the federation runtime', async () => {
    // Reproduces the pre-fix situation directly: the remotes runtime lands in a runtime that
    // the federation runtime was never injected into. That bundle would throw at startup.
    fs.writeFileSync(path.join(context, 'plain.js'), "import('./lazy.js');\n");
    const leakRemotesRuntime = {
      apply(compiler) {
        compiler.hooks.thisCompilation.tap(
          'LeakRemotesRuntime',
          (compilation) => {
            compilation.hooks.runtimeRequirementInTree
              .for(webpack.RuntimeGlobals.ensureChunkHandlers)
              .tap('LeakRemotesRuntime', (chunk) => {
                compilation.addRuntimeModule(chunk, new RemoteRuntimeModule());
              });
          },
        );
      },
    };

    const compiler = webpack({
      mode: 'development',
      devtool: false,
      context,
      entry: { plain: './plain.js' },
      output: { path: path.join(context, 'dist-plain'), publicPath: 'auto' },
      plugins: [leakRemotesRuntime],
    });
    const stats = await new Promise<any>((resolve, reject) => {
      compiler.run((err, s) => (err ? reject(err) : resolve(s)));
    });
    await new Promise<void>((resolve) => compiler.close(() => resolve()));

    const source = fs.readFileSync(
      path.join(context, 'dist-plain', 'plain.js'),
      'utf8',
    );
    expect(source).toContain('bundlerRuntimeOptions');
    expect(
      stats.compilation
        .getWarnings()
        .some((w) => w.message.includes(MISSING_RUNTIME_WARNING)),
    ).toBe(true);
  });
});
