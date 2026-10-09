const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const packageRoot = path.resolve(__dirname, '../../../..');
const tmp =
  process.argv[2] ||
  fs.mkdtempSync(path.join(os.tmpdir(), 'mf-duplicate-enhanced-'));
const secondCopy = path.join(tmp, 'enhanced-copy');
const src = path.join(tmp, 'src');
if (!process.argv[2]) {
  fs.cpSync(path.join(packageRoot, 'dist'), path.join(secondCopy, 'dist'), {
    recursive: true,
  });
  fs.copyFileSync(
    path.join(packageRoot, 'package.json'),
    path.join(secondCopy, 'package.json'),
  );

  fs.mkdirSync(src);
  fs.writeFileSync(
    path.join(src, 'index.js'),
    'import("remote/thing"); import("shared-dep"); import("./exposed");',
  );
  fs.writeFileSync(path.join(src, 'exposed.js'), 'export default 1;');
  fs.mkdirSync(path.join(src, 'node_modules/shared-dep'), { recursive: true });
  fs.writeFileSync(
    path.join(src, 'node_modules/shared-dep/package.json'),
    '{"name":"shared-dep","version":"1.0.0"}',
  );
  fs.writeFileSync(
    path.join(src, 'node_modules/shared-dep/index.js'),
    'module.exports = 1;',
  );
}

const webpack = require(require.resolve('webpack', { paths: [packageRoot] }));

const compile = (ModuleFederationPlugin, name) =>
  new Promise((resolve) => {
    const logs = [];
    const record = (...args) => logs.push(args.join(' '));
    const compiler = webpack({
      mode: 'development',
      devtool: false,
      context: src,
      entry: './index.js',
      output: {
        path: path.join(tmp, `out-${name}`),
        publicPath: '/',
        uniqueName: name,
      },
      cache: {
        type: 'filesystem',
        cacheDirectory: path.join(tmp, `cache-${name}`),
      },
      infrastructureLogging: {
        level: 'warn',
        console: { ...console, warn: record, error: record },
      },
      plugins: [
        new ModuleFederationPlugin({
          name,
          filename: 'remoteEntry.js',
          remotes: { remote: 'remote@http://localhost/remoteEntry.js' },
          exposes: { './exposed': './exposed.js' },
          shared: { 'shared-dep': { singleton: true } },
          dts: false,
        }),
      ],
    });
    compiler.run((err, stats) => {
      const errors = err
        ? [err.message]
        : stats.compilation.errors.map((e) => e.message);
      const modules = err
        ? []
        : stats
            .toJson({ modules: true })
            .modules.filter((m) =>
              /^(remote-module|consume-shared-module|provide-module)$/.test(
                m.moduleType,
              ),
            );
      compiler.close((closeErr) => {
        if (closeErr) errors.push(closeErr.message);
        resolve({
          errors,
          logs,
          federationModules: modules.map((m) => m.moduleType).sort(),
          rebuilt: modules.filter((m) => m.built).length,
        });
      });
    });
  });

(async () => {
  const result = {};
  try {
    if (process.argv[2]) {
      result.pid = process.pid;
      result.loadOrder = process.argv[3].split(',');
      const copies = { first: packageRoot, second: secondCopy };
      for (const name of result.loadOrder) {
        const { ModuleFederationPlugin } = require(copies[name]);
        result[name] = { cold: await compile(ModuleFederationPlugin, name) };
        if (process.argv[4] === 'warm') {
          result[name].warm = await compile(ModuleFederationPlugin, name);
        }
      }
    } else {
      const run = (order, phase) =>
        JSON.parse(
          execFileSync(process.execPath, [__filename, tmp, order, phase], {
            encoding: 'utf-8',
            env: process.env,
          }),
        );
      const initial = run('first,second', 'warm');
      const restored = run('second,first', 'restore');
      result.initial = initial;
      result.restored = restored;
    }
  } catch (error) {
    result.thrown = error.message;
  } finally {
    if (!process.argv[2]) fs.rmSync(tmp, { recursive: true, force: true });
  }
  process.stdout.write(JSON.stringify(result));
})();
