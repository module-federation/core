const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const assert = require('assert/strict');
const os = require('os');
const root =
  process.env.MF_REPRO_BUILD_ROOT || path.resolve(__dirname, '../..');
const enhancedRoot = path.join(root, 'packages/enhanced');
const nodeRoot = path.join(root, 'packages/node');
const fixture =
  process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), 'mf-node-copies-'));
if (!process.argv[2]) {
  try {
    fs.mkdirSync(fixture, { recursive: true });
    for (const [name, source] of [
      ['app-enhanced', enhancedRoot],
      ['node-enhanced', enhancedRoot],
      ['node', nodeRoot],
    ]) {
      const dest = path.join(fixture, name);
      fs.cpSync(path.join(source, 'dist'), path.join(dest, 'dist'), {
        recursive: true,
      });
      fs.copyFileSync(
        path.join(source, 'package.json'),
        path.join(dest, 'package.json'),
      );
    }
    const nested = path.join(fixture, 'node/node_modules/@module-federation');
    fs.mkdirSync(nested, { recursive: true });
    if (!fs.existsSync(path.join(nested, 'enhanced')))
      fs.symlinkSync(
        path.join(fixture, 'node-enhanced'),
        path.join(nested, 'enhanced'),
      );
    const src = path.join(fixture, 'src');
    fs.mkdirSync(src, { recursive: true });
    fs.writeFileSync(
      path.join(src, 'index.js'),
      "module.exports = Promise.all([import('app-dep'), import('node-dep'), import('appRemote/thing'), import('nodeRemote/thing')]).then(values => values.map(value => value.default));",
    );
    fs.writeFileSync(path.join(src, 'exposed.js'), 'module.exports = 99;');
    for (const name of ['app-dep', 'node-dep']) {
      const dir = path.join(src, 'node_modules', name);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, 'package.json'),
        JSON.stringify({ name, version: '1.0.0', main: 'index.js' }),
      );
      fs.writeFileSync(
        path.join(dir, 'index.js'),
        `module.exports = '${name}';`,
      );
    }
    fs.writeFileSync(
      path.join(src, 'marker.js'),
      "module.exports = () => ({name:'marker', beforeInit(args) { (globalThis.__mfInit || (globalThis.__mfInit = [])).push(args.options.name); return args; }});",
    );
    const env = {
      ...process.env,
      NODE_PATH: [
        path.join(enhancedRoot, 'node_modules'),
        path.join(root, 'node_modules'),
      ].join(path.delimiter),
    };
    const results = {};
    for (const order of [
      'app,node',
      'node,app',
      'same-app,node',
      'same-node,app',
      'app',
      'node',
    ]) {
      try {
        results[order] = JSON.parse(
          execFileSync(process.execPath, [__filename, fixture, order], {
            env,
            cwd: src,
            encoding: 'utf8',
            timeout: 120000,
          }),
        );
      } catch (error) {
        results[order] = {
          harnessError: error.message,
          stdout: error.stdout?.toString(),
          stderr: error.stderr?.toString(),
        };
      }
    }
    process.stdout.write(JSON.stringify(results, null, 2));
    const passed = Object.values(results).every(
      (result) =>
        result.assertions?.remoteExecution === true &&
        result.assertions?.firstRuntimeMarker === true &&
        Array.isArray(result.errors) &&
        result.errors.length === 0 &&
        !result.harnessError &&
        !result.thrown &&
        !result.executionError,
    );
    if (!passed) process.exitCode = 1;
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
} else {
  let workerServer;
  (async () => {
    const sameCopy = process.argv[3].startsWith('same-');
    const order = process.argv[3].replace('same-', '').split(',');
    fs.unlinkSync(
      path.join(fixture, 'node/node_modules/@module-federation/enhanced'),
    );
    fs.symlinkSync(
      path.join(fixture, sameCopy ? 'app-enhanced' : 'node-enhanced'),
      path.join(fixture, 'node/node_modules/@module-federation/enhanced'),
    );
    const src = path.join(fixture, 'src');
    const webpack = require(
      require.resolve('webpack', { paths: [enhancedRoot] }),
    );
    const appRoot = path.join(fixture, 'app-enhanced');
    const nodeEnhancedRoot = path.join(
      fixture,
      sameCopy ? 'app-enhanced' : 'node-enhanced',
    );
    const { ModuleFederationPlugin } = require(appRoot);
    const NodeFederationPlugin = require(
      path.join(fixture, 'node/dist/src/plugins/NodeFederationPlugin.js'),
    ).default;
    const requests = [];
    const server = (workerServer = require('http').createServer((req, res) => {
      requests.push(req.url);
      const name = req.url.includes('app') ? 'app' : 'node';
      res.end(
        `module.exports = { get: () => Promise.resolve(() => '${name}-remote'), init: () => undefined };`,
      );
    }));
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    const opts = (name) => ({
      name,
      remoteType: 'script',
      remotes: Object.fromEntries(
        ['app', 'node'].map((remote) => [
          remote + 'Remote',
          remote + 'Container@http://127.0.0.1:' + port + '/' + remote + '.js',
        ]),
      ),
      filename: `${name}Remote.js`,
      library: { type: 'commonjs-module' },
      exposes: { './exposed': './exposed.js' },
      shared: { [`${name}-dep`]: { singleton: true } },
      runtimePlugins: [path.join(src, 'marker.js')],
      dts: false,
      manifest: false,
    });
    const plugins = {
      app: () => new ModuleFederationPlugin(opts('app')),
      node: () =>
        new NodeFederationPlugin(
          { ...opts('node'), useRuntimePlugin: true },
          {},
        ),
    };
    const result = { order, sameCopy, events: { app: [], node: [] } };
    const inspect = {
      apply(compiler) {
        compiler.hooks.thisCompilation.tap('Inspection', (compilation) => {
          const A = require(
            path.join(
              appRoot,
              'dist/src/lib/container/runtime/FederationModulesPlugin.js',
            ),
          ).default;
          const B = require(
            path.join(
              nodeEnhancedRoot,
              'dist/src/lib/container/runtime/FederationModulesPlugin.js',
            ),
          ).default;
          const hooksA = A.getCompilationHooks(compilation),
            hooksB = B.getCompilationHooks(compilation);
          result.sameHooks = hooksA === hooksB;
          result.embedSubscribers = [hooksA, hooksB].map((h) =>
            h.addFederationRuntimeDependency.taps.map((t) => t.name),
          );
          for (const [name, hooks] of [
            ['app', hooksA],
            ['node', hooksB],
          ])
            hooks.addFederationRuntimeDependency.tap('Inspection', (dep) =>
              result.events[name].push(dep.request),
            );
          compilation.hooks.finishModules.tap('Inspection', () => {
            result.runtimeFactories = [
              ...compilation.dependencyFactories.keys(),
            ].filter((k) => k.name === 'FederationRuntimeDependency').length;
          });
        });
      },
    };
    const output = path.join(
      fixture,
      'out-' + (sameCopy ? 'same-' : '') + order.join('-'),
    );
    const compiler = webpack({
      mode: 'development',
      target: 'async-node',
      devtool: false,
      context: src,
      entry: './index.js',
      output: {
        path: output,
        filename: 'main.js',
        library: { type: 'commonjs2' },
        publicPath: '/',
        uniqueName: 'mixed-' + order.join('-'),
      },
      plugins: [...order.map((name) => plugins[name]()), inspect],
      infrastructureLogging: { level: 'error' },
    });
    result.embedTaps = compiler.hooks.thisCompilation.taps.filter(
      (t) => t.name === 'EmbedFederationRuntimePlugin',
    ).length;
    const stats = await new Promise((resolve, reject) =>
      compiler.run((err, stats) => (err ? reject(err) : resolve(stats))),
    );
    result.errors = stats.compilation.errors.map((e) => e.message);
    result.warnings = stats.compilation.warnings.map((e) => e.message);
    result.runtimeModules = [...stats.compilation.modules]
      .filter((m) => m.constructor.name.includes('FederationRuntime'))
      .map((m) => {
        const code = m.generate?.() || '';
        return {
          chunk: m.chunk?.name,
          id: m.identifier(),
          generated: !!code,
          startup: code.includes('prevStartup'),
          initOptions: code.match(/initOptions: (.*),/)?.[1],
        };
      });
    await new Promise((resolve, reject) =>
      compiler.close((error) => (error ? reject(error) : resolve())),
    );
    if (!result.errors.length) {
      try {
        result.execution = await require(path.join(output, 'main.js'));
        result.initialized = globalThis.__mfInit;
      } catch (error) {
        result.executionError = error.stack;
      }
      result.initialized = globalThis.__mfInit;
      result.serverRequests = requests;
    }
    result.assertions = {};
    try {
      assert.deepEqual(result.errors, []);
      assert.deepEqual(result.execution, [
        'app-dep',
        'node-dep',
        'app-remote',
        'node-remote',
      ]);
      assert.deepEqual([...new Set(requests)].sort(), ['/app.js', '/node.js']);
      result.assertions.remoteExecution = true;
    } catch (error) {
      result.assertions.remoteExecution = error.message;
    }
    try {
      assert.deepEqual(result.initialized, [order[0]]);
      result.assertions.firstRuntimeMarker = true;
    } catch (error) {
      result.assertions.firstRuntimeMarker = error.message;
    }
    await new Promise((resolve) => server.close(resolve));
    process.stdout.write(JSON.stringify(result));
  })().catch((error) => {
    workerServer?.close();
    process.stdout.write(JSON.stringify({ thrown: error.stack }));
    process.exitCode = 1;
  });
}
