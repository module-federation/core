/** @jest-environment node */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const REBUILD_TIMEOUT_MS = 30_000;
// Include compiler startup, three watch builds and the webpack cache reload.
const PROCESS_TIMEOUT_MS = 120_000;

describe.each(['webpack', 'rspack', 'rspack-native'] as const)(
  '%s Bridge metadata rebuilds',
  (bundler) => {
    it(
      'updates an aliased re-export in both directions while retaining cached modules',
      async () => {
        const directory = fs.mkdtempSync(
          path.join(os.tmpdir(), 'mf-bridge-watch-'),
        );
        fs.writeFileSync(
          path.join(directory, 'package.json'),
          JSON.stringify({ name: 'watch_remote', version: '1.0.0' }),
        );
        fs.writeFileSync(
          path.join(directory, 'entry.js'),
          "export {default} from '@barrel';",
        );
        fs.writeFileSync(
          path.join(directory, 'barrel.js'),
          "export {default} from '@bridge';",
        );
        fs.writeFileSync(
          path.join(directory, 'bridge.js'),
          'const createBridgeComponent = options => options; export default createBridgeComponent({rootComponent: () => null});',
        );
        fs.writeFileSync(
          path.join(directory, 'card.js'),
          'export default () => null;',
        );
        try {
          await execFileAsync(
            process.execPath,
            [
              '--input-type=module',
              '-e',
              `
          import {createRequire} from 'node:module';
          const require = createRequire(${JSON.stringify(__filename)});
          const fs = require('node:fs');
          const {StatsPlugin} = require('../dist/index.js');
          const build = ${bundler === 'webpack' ? "require('webpack')" : "(await import(require.resolve('@rspack/core'))).rspack"};
          const options = {name: 'watch_remote', exposes: {'./App': './entry.js'}};
          const config = {
            mode: 'production', context: ${JSON.stringify(directory)}, entry: {}, cache: ${bundler === 'webpack' ? `{type: 'filesystem', cacheDirectory: ${JSON.stringify(path.join(directory, 'cache'))}}` : 'true'},
            output: {path: ${JSON.stringify(path.join(directory, 'dist'))}, publicPath: 'https://example.test/'},
            resolve: {alias: {
              '@barrel': ${JSON.stringify(path.join(directory, 'barrel.js'))},
              '@bridge': ${JSON.stringify(path.join(directory, 'bridge.js'))},
              '@card': ${JSON.stringify(path.join(directory, 'card.js'))},
            }},
            plugins: [
              new ${bundler === 'rspack' ? 'build.container.ModuleFederationPluginV1' : 'build.container.ModuleFederationPlugin'}({...options, ${bundler === 'rspack-native' ? "implementation: require.resolve('../../runtime-tools'), manifest: true," : ''}}),
              new StatsPlugin(options, {pluginVersion: 'test', bundler: ${JSON.stringify(bundler === 'webpack' ? 'webpack' : 'rspack')}}),
            ],
          };
          const compiler = build(config);
          const revisions = [];
          await new Promise((resolve, reject) => {
            let watcher;
            let timer;
            const resetTimer = () => {
              clearTimeout(timer);
              timer = setTimeout(() => {
                watcher?.close(() => {});
                reject(new Error('Watch rebuild timed out after ' + revisions.length + ' completed revisions'));
              }, ${REBUILD_TIMEOUT_MS});
            };
            resetTimer();
            watcher = compiler.watch({aggregateTimeout: 10, poll: 100, ignored: /node_modules/}, (error, stats) => {
              if (error || stats.hasErrors()) {
                clearTimeout(timer);
                watcher.close(() => reject(error || new Error(stats.toString({all:false, errors:true}))));
                return;
              }
              const manifest = JSON.parse(fs.readFileSync(${JSON.stringify(path.join(directory, 'dist/mf-manifest.json'))}, 'utf8'));
              const item = manifest.exposes.find(item => item.path === './App');
              revisions.push(item?.render || null);
              if (revisions.length === 3) {
                clearTimeout(timer);
                watcher.close(error => error ? reject(error) : resolve());
              } else {
                resetTimer();
                fs.writeFileSync(${JSON.stringify(path.join(directory, 'barrel.js'))}, revisions.length === 1 ? "export {default} from '@card';" : "export {default} from '@bridge';");
              }
            });
          });
          await new Promise(resolve => compiler.close(resolve));
          ${
            bundler === 'webpack'
              ? `
          const parser = require('@babel/parser');
          parser.parse = () => {throw new Error('Cached parser metadata was lost');};
          const cachedCompiler = build(config);
          let rebuiltEntry = false;
          let foundEntry = false;
          cachedCompiler.hooks.thisCompilation.tap('VerifyCache', compilation => {
            compilation.hooks.buildModule.tap('VerifyCache', module => {if (module.nameForCondition()?.endsWith('/entry.js')) rebuiltEntry = true;});
            compilation.hooks.finishModules.tap('VerifyCache', modules => {foundEntry = [...modules].some(module => module.nameForCondition()?.endsWith('/entry.js'));});
          });
          await new Promise((resolve, reject) => cachedCompiler.run((error, stats) => error || stats.hasErrors() ? reject(error || new Error(stats.toString({all:false, errors:true}))) : resolve(stats)));
          if (!foundEntry || rebuiltEntry) throw new Error('Filesystem cache was not reused: ' + JSON.stringify({foundEntry, rebuiltEntry}));
          const cachedManifest = JSON.parse(fs.readFileSync(${JSON.stringify(path.join(directory, 'dist/mf-manifest.json'))}, 'utf8'));
          if (cachedManifest.exposes.find(item => item.path === './App')?.render !== 'bridge') throw new Error('Cached Bridge metadata was lost');
          await new Promise(resolve => cachedCompiler.close(resolve));
          `
              : ''
          }
          fs.writeFileSync(${JSON.stringify(path.join(directory, 'revisions.json'))}, JSON.stringify(revisions));
        `,
            ],
            { encoding: 'utf8', timeout: PROCESS_TIMEOUT_MS },
          ).catch((error: Error & { stdout?: string; stderr?: string }) => {
            // Child-process errors can contain circular references on Node 24.
            // Report plain diagnostics so Jest workers preserve the actual failure.
            throw new Error(
              [
                `${bundler} Bridge metadata watch process failed: ${error.message}`,
                error.stdout,
                error.stderr,
              ]
                .filter(Boolean)
                .join('\n'),
            );
          });
          expect(
            JSON.parse(
              fs.readFileSync(path.join(directory, 'revisions.json'), 'utf8'),
            ),
          ).toEqual(['bridge', null, 'bridge']);
        } finally {
          fs.rmSync(directory, { recursive: true, force: true });
        }
      },
      PROCESS_TIMEOUT_MS + 10_000,
    );
  },
);
