const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Module = require('node:module');
const webpack = require('webpack');

const packageRoot = path.resolve(__dirname, '../../../..');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-public-webpack-'));
process.env.FEDERATION_WEBPACK_PATH = require.resolve('webpack');

// Model the newer public exports using the installed webpack's own classes.
// This keeps the regression test runnable with the repository's older webpack.
const publicWebpack = Object.create(webpack);
const publicExports = {
  ModuleFactory: 'webpack/lib/ModuleFactory',
  ModuleNotFoundError: 'webpack/lib/ModuleNotFoundError',
  'dependencies.EntryDependency': 'webpack/lib/dependencies/EntryDependency',
  'dependencies.StaticExportsDependency':
    'webpack/lib/dependencies/StaticExportsDependency',
  'container.extractUrlAndGlobal': 'webpack/lib/util/extractUrlAndGlobal',
  'sharing.semver': 'webpack/lib/util/semver',
  'util.makeSerializable': 'webpack/lib/util/makeSerializable',
  'util.SortableSet': 'webpack/lib/util/SortableSet',
  'util.SetHelpers': 'webpack/lib/util/SetHelpers',
  'javascript.ChunkHelpers': 'webpack/lib/javascript/ChunkHelpers',
  'runtime.StartupEntrypointRuntimeModule':
    'webpack/lib/runtime/StartupEntrypointRuntimeModule',
};
for (const namespace of [
  'dependencies',
  'container',
  'sharing',
  'util',
  'javascript',
  'runtime',
]) {
  Object.defineProperty(publicWebpack, namespace, {
    value: Object.create(webpack[namespace] || null),
  });
}
for (const [name, request] of Object.entries(publicExports)) {
  const parts = name.split('.');
  const key = parts.pop();
  const target = parts.length ? publicWebpack[parts[0]] : publicWebpack;
  Object.defineProperty(target, key, { value: require(request) });
}
Object.defineProperty(publicWebpack.util, 'getUndoPath', {
  value: require('webpack/lib/util/identifier').getUndoPath,
});

const privateImports = [];
const originalLoad = Module._load;
Module._load = function (request, parent, ...rest) {
  if (parent?.filename?.startsWith(path.join(packageRoot, 'dist'))) {
    if (request === process.env.FEDERATION_WEBPACK_PATH) return publicWebpack;
    if (
      request.startsWith('webpack/lib/') ||
      request.includes(`${path.sep}webpack${path.sep}lib${path.sep}`)
    ) {
      privateImports.push(request);
      throw new Error(`Private webpack import: ${request}`);
    }
  }
  return originalLoad.call(this, request, parent, ...rest);
};

async function run() {
  try {
    const enhanced = require(path.join(packageRoot, 'dist/src/index.js'));
    // Public getters must remain usable before the wrapper initializes a compiler.
    assert.equal(
      enhanced.container.ContainerEntryModule.name,
      'ContainerEntryModule',
    );
    fs.writeFileSync(
      path.join(directory, 'index.js'),
      'import("remote/module");',
    );
    fs.writeFileSync(
      path.join(directory, 'shared.js'),
      'module.exports = require("tapable");',
    );
    const output = path.join(directory, 'dist');
    const compiler = webpack({
      mode: 'development',
      target: 'node',
      context: directory,
      entry: './index.js',
      output: {
        path: output,
        filename: 'main.cjs',
        chunkFilename: '[name].cjs',
        library: { type: 'commonjs2' },
      },
      resolve: {
        modules: [path.join(packageRoot, 'node_modules'), 'node_modules'],
      },
      plugins: [
        {
          apply(compiler) {
            compiler.webpack = publicWebpack;
            new enhanced.ModuleFederationPlugin({
              name: 'public_api',
              filename: 'remoteEntry.cjs',
              library: { type: 'commonjs2' },
              exposes: { './shared': './shared.js' },
              remotes: {
                remote: 'remote@https://example.invalid/remoteEntry.js',
              },
              shared: {
                tapable: { singleton: true, requiredVersion: '^2.3.0' },
              },
              dts: false,
              manifest: false,
            }).apply(compiler);
          },
        },
      ],
    });
    const stats = await new Promise((resolve, reject) => {
      compiler.run((error, stats) => {
        compiler.close((closeError) =>
          error || closeError ? reject(error || closeError) : resolve(stats),
        );
      });
    });
    const errors = stats.toJson({ all: false, errors: true }).errors;
    assert.deepEqual(errors, []);
    const container = require(path.join(output, 'remoteEntry.cjs'));
    await container.init({});
    const shared = (await container.get('./shared'))();
    const hook = new shared.SyncHook(['value']);
    let actual;
    hook.tap('test', (value) => {
      actual = value;
    });
    hook.call('shared module executed');
    assert.equal(actual, 'shared module executed');
    console.log(
      JSON.stringify({ errors, privateImports, sharedModuleExecuted: true }),
    );
  } finally {
    Module._load = originalLoad;
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
