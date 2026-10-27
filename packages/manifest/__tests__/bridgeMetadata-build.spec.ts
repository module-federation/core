/** @jest-environment node */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

describe.each(['webpack', 'rspack'] as const)(
  '%s Bridge manifest production',
  (bundler) => {
    it('publishes source metadata alongside ordinary exposes in a real compilation', async () => {
      const directory = fs.mkdtempSync(
        path.join(os.tmpdir(), `mf-${bundler}-metadata-`),
      );
      const exposes = {
        './App': './app.js',
        './Card': './card.js',
        './Bundled': './bundled.js',
        './Named': './named.js',
        './ReExport': './re-export.js',
      };
      fs.writeFileSync(
        path.join(directory, 'package.json'),
        JSON.stringify({ name: 'metadata_remote', version: '1.0.0' }),
      );
      fs.writeFileSync(path.join(directory, 'entry.js'), 'export {};');
      fs.writeFileSync(
        path.join(directory, 'factory.js'),
        'export const createBridgeComponent = (options) => () => ({render() {}, destroy() {}});',
      );
      fs.writeFileSync(
        path.join(directory, 'app.js'),
        "import {createBridgeComponent as bridge} from '@framework/bundled-provider'; export default bridge({rootComponent: () => null});",
      );
      fs.writeFileSync(
        path.join(directory, 'card.js'),
        'export default () => null;',
      );
      fs.writeFileSync(
        path.join(directory, 'bundled.js'),
        'const createBridgeComponent = (options) => () => ({render() {}, destroy() {}}); export default createBridgeComponent({rootComponent: () => null});',
      );
      fs.writeFileSync(
        path.join(directory, 'named.js'),
        "import {createBridgeComponent} from '@framework/bundled-provider'; export const provider = createBridgeComponent({rootComponent: () => null}); export default () => null;",
      );
      fs.writeFileSync(
        path.join(directory, 're-export.js'),
        "export {default} from './app.js';",
      );
      try {
        execFileSync(
          process.execPath,
          [
            '--input-type=module',
            '-e',
            `
        import {createRequire} from 'node:module';
        const require = createRequire(${JSON.stringify(__filename)});
        const {StatsPlugin} = require('../dist/index.js');
        const build = ${bundler === 'webpack' ? "require('webpack')" : "(await import(require.resolve('@rspack/core'))).rspack"};
        const compiler = build({
          mode: 'production',
          context: ${JSON.stringify(directory)},
          entry: './entry.js',
          output: {path: ${JSON.stringify(path.join(directory, 'dist'))}, publicPath: 'https://example.test/'},
          resolve: {alias: {'@framework/bundled-provider': ${JSON.stringify(path.join(directory, 'factory.js'))}}},
          plugins: [
            new build.container.ModuleFederationPlugin({name: 'metadata_remote', filename: 'remoteEntry.js', exposes: ${JSON.stringify(exposes)}}),
            new StatsPlugin({name: 'metadata_remote', exposes: ${JSON.stringify(exposes)}}, {pluginVersion: 'test', bundler: ${JSON.stringify(bundler)}}),
          ],
        });
        await new Promise((resolve, reject) => compiler.run((error, stats) => {
          if (error || stats?.hasErrors()) reject(error || new Error(stats.toString({all: false, errors: true})));
          else resolve();
        }));
        await new Promise(resolve => compiler.close(resolve));
      `,
          ],
          { stdio: 'pipe' },
        );
        const manifest = JSON.parse(
          fs.readFileSync(
            path.join(directory, 'dist/mf-manifest.json'),
            'utf8',
          ),
        );
        const stats = JSON.parse(
          fs.readFileSync(path.join(directory, 'dist/mf-stats.json'), 'utf8'),
        );
        for (const output of [manifest, stats]) {
          for (const name of ['App', 'Bundled', 'ReExport']) {
            expect(
              output.exposes.find((item: any) => item.name === name),
            ).toMatchObject({ render: 'bridge', isService: false });
          }
          for (const name of ['Card', 'Named']) {
            expect(
              output.exposes.find((item: any) => item.name === name),
            ).not.toHaveProperty('render');
          }
        }
      } finally {
        fs.rmSync(directory, { recursive: true, force: true });
      }
    }, 30000);
  },
);
