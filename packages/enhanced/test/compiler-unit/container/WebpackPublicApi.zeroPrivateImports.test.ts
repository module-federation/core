/*
 * @rstest-environment node
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

describe('webpack 5.113.0+ / webpack 6 zero private path imports', () => {
  it('builds exposes, remotes, shared, asyncStartup, and AsyncBoundaryPlugin with zero webpack/lib/* or webpack/schemas/* imports from enhanced/dist', () => {
    const packageRoot = path.resolve(__dirname, '../../..');
    const distDir = path.join(packageRoot, 'dist');
    const distEntry = path.join(distDir, 'src/index.js');
    expect(fs.existsSync(distEntry)).toBe(true);

    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'mf-zero-private-imports-'),
    );
    const runnerScript = path.join(tmpDir, 'run.cjs');

    // Run in a clean child process so Module._load interception observes the
    // exact cold-load sequence of packages/enhanced/dist with a webpack 5.113+
    // public API surface on compiler.webpack.
    fs.writeFileSync(
      runnerScript,
      `
      const Module = require('node:module');
      const fs = require('node:fs');
      const path = require('node:path');
      const vm = require('node:vm');

      const distDir = ${JSON.stringify(distDir)};
      const distEntry = ${JSON.stringify(distEntry)};
      const packageRoot = ${JSON.stringify(packageRoot)};
      const workDir = ${JSON.stringify(tmpDir)};
      const pkgRequire = Module.createRequire(path.join(packageRoot, 'package.json'));
      const sdkDir = path.dirname(
        pkgRequire.resolve('@module-federation/sdk/normalize-webpack-path')
      );

      // Load real webpack and assemble a full 5.113.0+ public API surface BEFORE
      // installing the Module._load private-path blocker.
      const realWebpack = pkgRequire('webpack');
      const loadInternal = (legacy, relocated) => {
        try {
          return pkgRequire(legacy);
        } catch {
          return pkgRequire(relocated);
        }
      };

      const EntryDependency =
        realWebpack.dependencies?.EntryDependency ||
        loadInternal(
          'webpack/lib/dependencies/EntryDependency',
          'webpack/lib/entry/EntryDependency',
        );
      const StaticExportsDependency =
        realWebpack.dependencies?.StaticExportsDependency ||
        loadInternal(
          'webpack/lib/dependencies/StaticExportsDependency',
          'webpack/lib/dependencies/core/StaticExportsDependency',
        );
      const ModuleDependency =
        realWebpack.dependencies?.ModuleDependency ||
        loadInternal(
          'webpack/lib/dependencies/ModuleDependency',
          'webpack/lib/dependencies/core/ModuleDependency',
        );
      const ModuleNotFoundError =
        realWebpack.ModuleNotFoundError ||
        loadInternal(
          'webpack/lib/ModuleNotFoundError',
          'webpack/lib/errors/ModuleNotFoundError',
        );
      const semver =
        realWebpack.sharing?.semver ||
        loadInternal('webpack/lib/util/semver', 'webpack/lib/sharing/semver');
      const extractUrlAndGlobal =
        realWebpack.container?.extractUrlAndGlobal ||
        loadInternal(
          'webpack/lib/util/extractUrlAndGlobal',
          'webpack/lib/externals/extractUrlAndGlobal',
        );
      const getUndoPath =
        realWebpack.util?.getUndoPath ||
        pkgRequire('webpack/lib/util/identifier').getUndoPath;
      const SortableSet =
        realWebpack.util?.SortableSet ||
        pkgRequire('webpack/lib/util/SortableSet');
      const SetHelpers =
        realWebpack.util?.SetHelpers || pkgRequire('webpack/lib/util/SetHelpers');
      const ChunkHelpers =
        realWebpack.javascript?.ChunkHelpers ||
        pkgRequire('webpack/lib/javascript/ChunkHelpers');
      const StartupEntrypointRuntimeModule =
        realWebpack.runtime?.StartupEntrypointRuntimeModule ||
        pkgRequire('webpack/lib/runtime/StartupEntrypointRuntimeModule');

      const wrapNamespace = (base, overrides) =>
        new Proxy(Object.create(null), {
          get(_t, prop) {
            if (Object.prototype.hasOwnProperty.call(overrides, prop)) {
              return overrides[prop];
            }
            return base ? base[prop] : undefined;
          },
          has(_t, prop) {
            return (
              Object.prototype.hasOwnProperty.call(overrides, prop) ||
              (base ? prop in base : false)
            );
          },
        });

      const publicOverrides = {
        ModuleNotFoundError,
        dependencies: wrapNamespace(realWebpack.dependencies, {
          ModuleDependency,
          EntryDependency,
          StaticExportsDependency,
        }),
        sharing: wrapNamespace(realWebpack.sharing, {
          semver,
        }),
        container: wrapNamespace(realWebpack.container, {
          extractUrlAndGlobal,
        }),
        util: wrapNamespace(realWebpack.util, {
          getUndoPath,
          SortableSet,
          SetHelpers,
        }),
        javascript: wrapNamespace(realWebpack.javascript, {
          ChunkHelpers,
        }),
        runtime: wrapNamespace(realWebpack.runtime || {}, {
          RuntimeGlobals:
            realWebpack.runtime?.RuntimeGlobals || realWebpack.RuntimeGlobals,
          RuntimeModule:
            realWebpack.runtime?.RuntimeModule || realWebpack.RuntimeModule,
          StartupEntrypointRuntimeModule,
        }),
      };

      const publicWebpack = new Proxy(
        (...args) => realWebpack(...args),
        {
          get(_t, prop) {
            if (Object.prototype.hasOwnProperty.call(publicOverrides, prop)) {
              return publicOverrides[prop];
            }
            return realWebpack[prop];
          },
          has(_t, prop) {
            return (
              Object.prototype.hasOwnProperty.call(publicOverrides, prop) ||
              prop in realWebpack
            );
          },
        },
      );

      // Prepare project fixture exercising exposes, remotes, shared (with package.json),
      // asyncStartup, AsyncBoundaryPlugin, and runtimeChunk: 'single'.
      const srcDir = path.join(workDir, 'project');
      const outDir = path.join(workDir, 'dist');
      fs.mkdirSync(path.join(srcDir, 'node_modules/shared-pkg'), { recursive: true });
      fs.writeFileSync(
        path.join(srcDir, 'package.json'),
        JSON.stringify({
          name: 'zero-private-host',
          version: '1.0.0',
          dependencies: { 'shared-pkg': '^1.0.0' },
        }),
      );
      fs.writeFileSync(
        path.join(srcDir, 'node_modules/shared-pkg/package.json'),
        JSON.stringify({ name: 'shared-pkg', version: '1.2.3' }),
      );
      fs.writeFileSync(
        path.join(srcDir, 'node_modules/shared-pkg/index.js'),
        'export default "shared-ok";',
      );
      fs.writeFileSync(
        path.join(srcDir, 'local-shared.js'),
        'export default "local-ok";',
      );
      fs.writeFileSync(
        path.join(srcDir, 'exposed.js'),
        'export default "exposed-ok";',
      );
      fs.writeFileSync(
        path.join(srcDir, 'lazy.js'),
        'import sharedPkg from "shared-pkg"; import localShared from "./local-shared.js"; export default sharedPkg + ":" + localShared;',
      );
      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        'export const loadRemote = () => import("remote/value"); import("./lazy.js").then((m) => globalThis.__resolveLazy(m.default), (e) => globalThis.__rejectLazy(e));',
      );

      // Install Module._load interceptor BEFORE loading enhanced/dist
      const privateImports = [];
      const originalLoad = Module._load;
      const isPrivateWebpackRequest = (request) => {
        if (typeof request !== 'string') return false;
        const normalized = request.replace(/\\\\/g, '/');
        if (/^webpack\\/(lib|schemas)(\\/|$)/.test(normalized)) return true;
        if (/\\/webpack\\/(lib|schemas)\\//.test(normalized)) {
          // Allow top-level webpack entry lib/index.js only if not a private subpath
          if (/\\/webpack\\/lib\\/index(\\.js)?$/.test(normalized)) return false;
          return true;
        }
        return false;
      };

      Module._load = function (request, parent, isMain) {
        const parentFile = parent && parent.filename ? parent.filename : '';
        const fromEnhanced =
          parentFile.startsWith(distDir + path.sep) ||
          parentFile.startsWith(sdkDir + path.sep);
        if (fromEnhanced && isPrivateWebpackRequest(request)) {
          privateImports.push({ request, parent: parentFile });
          throw new Error(
            'Forbidden private webpack import from enhanced: ' +
              request +
              ' (caller: ' +
              parentFile +
              ')',
          );
        }
        return originalLoad.call(this, request, parent, isMain);
      };

      // Clear FEDERATION_WEBPACK_PATH to ensure compiler.webpack is the source of truth.
      delete process.env['FEDERATION_WEBPACK_PATH'];

      const { ModuleFederationPlugin, AsyncBoundaryPlugin } = require(distEntry);

      const compiler = realWebpack({
        mode: 'development',
        devtool: false,
        context: srcDir,
        entry: './index.js',
        target: 'web',
        output: {
          path: outDir,
          filename: '[name].js',
          chunkFilename: 'chunks/[name].js',
          publicPath: '/',
          uniqueName: 'zero-private-host',
        },
        optimization: {
          minimize: false,
          runtimeChunk: 'single',
        },
        plugins: [
          // Inject 5.113.0+ public API webpack onto compiler before MF plugins apply
          {
            apply(c) {
              c.webpack = publicWebpack;
            },
          },
          new ModuleFederationPlugin({
            name: 'host',
            filename: 'remoteEntry.js',
            remotes: {
              remote: 'remoteGlobal@https://example.invalid/remoteEntry.js',
            },
            exposes: {
              './exposed': './exposed.js',
            },
            shared: {
              'shared-pkg': { singleton: true },
              './local-shared.js': { requiredVersion: false, singleton: true },
            },
            experiments: {
              asyncStartup: true,
            },
            dts: false,
            manifest: false,
          }),
          new AsyncBoundaryPlugin(),
        ],
      });

      (async () => {
        const stats = await new Promise((resolve, reject) => {
          compiler.run((err, res) => (err ? reject(err) : resolve(res)));
        });
        await new Promise((resolve, reject) => {
          compiler.close((err) => (err ? reject(err) : resolve()));
        });

        const errors = stats.hasErrors()
          ? stats.toJson({ all: false, errors: true }).errors
          : [];

        // Execute emitted bundle + remoteEntry in a simulated browser VM
        const runBrowser = async () => {
          const sandbox = {
            console,
            setTimeout,
            clearTimeout,
            URL,
            location: new URL('https://cdn.test/index.html'),
          };
          const evalAsset = (relPath) => {
            const fullPath = path.join(outDir, relPath.replace(/^\\//, ''));
            vm.runInContext(fs.readFileSync(fullPath, 'utf8'), sandbox, {
              filename: fullPath,
            });
          };
          sandbox.document = {
            baseURI: 'https://cdn.test/index.html',
            currentScript: { tagName: 'SCRIPT', src: 'https://cdn.test/main.js' },
            createElement: () => {
              const attrs = {};
              return {
                tagName: 'SCRIPT',
                setAttribute: (k, v) => { attrs[k] = v; },
                getAttribute: (k) => attrs[k],
                removeAttribute: (k) => { delete attrs[k]; },
              };
            },
            getElementsByTagName: () => [],
            head: {
              appendChild: (script) => {
                const url = new URL(script.src, 'https://cdn.test/index.html');
                setTimeout(() => {
                  try {
                    evalAsset(url.pathname);
                    script.onload && script.onload({ type: 'load', target: script });
                  } catch (e) {
                    script.onerror && script.onerror(e);
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
          const g = vm.runInContext('globalThis', sandbox);
          sandbox.self = g;
          sandbox.window = g;
          sandbox.document.defaultView = g;

          const lazyPromise = new Promise((resolve, reject) => {
            sandbox.__resolveLazy = resolve;
            sandbox.__rejectLazy = reject;
          });
          evalAsset('runtime.js');
          evalAsset('main.js');
          const lazyDefault = await lazyPromise;

          evalAsset('remoteEntry.js');
          const container = await sandbox.host;
          await container.init({});
          const exposedFactory = await container.get('./exposed');
          const exposedResult = exposedFactory();

          return {
            lazyDefault,
            exposedDefault: exposedResult && exposedResult.default,
          };
        };

        const runtimeResult = errors.length === 0 ? await runBrowser() : null;

        process.stdout.write(
          JSON.stringify({
            errors,
            privateImports,
            runtimeResult,
          }),
        );
      })().catch((err) => {
        console.error(err);
        process.exit(1);
      });
      `,
    );

    try {
      const output = execFileSync(process.execPath, [runnerScript], {
        cwd: packageRoot,
        encoding: 'utf8',
        env: {
          ...process.env,
          NODE_OPTIONS: '',
        },
      });
      const result = JSON.parse(output);
      expect(result.errors).toEqual([]);
      expect(result.privateImports).toEqual([]);
      expect(result.runtimeResult).toEqual({
        lazyDefault: 'shared-ok:local-ok',
        exposedDefault: 'exposed-ok',
      });
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }, 60000);
});
