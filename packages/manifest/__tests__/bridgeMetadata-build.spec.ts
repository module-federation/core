/** @jest-environment node */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

describe.each(['webpack', 'rspack', 'rspack-native'] as const)(
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
        './Wrapped': './wrapped.js',
        './RenamedWrapper': './renamed-wrapper.js',
        './RemoteImport': './remote-import.js',
        './RemoteReExport': './remote-re-export.js',
        './AliasExpose': '@entry-alias',
        './AliasChain': './alias-chain.js',
        './NamespaceReExport': './namespace-re-export.js',
        './RuleAlias': './rule-entry.js',
        './Replaced': './replaced-entry.js',
        './ReplacedOrdinary': './replaced-ordinary.js',
        './LoaderBridge': './loader-bridge.js',
        './LoaderOrdinary': './loader-ordinary.js',
        './Query': './query-entry.js?bridge',
        './External': './external-entry.js',
        './MixedDependency': './mixed-entry.js',
        './DefaultImportRelative': './default-import-relative.js',
        './DefaultImportAlias': './default-import-alias.js',
        './DefaultImportOrdinaryRelative':
          './default-import-ordinary-relative.js',
        './DefaultImportOrdinaryAlias': './default-import-ordinary-alias.js',
      };
      const remotes = {
        checkout: 'checkout@https://example.test/remoteEntry.js',
      };
      fs.writeFileSync(
        path.join(directory, 'package.json'),
        JSON.stringify({ name: 'metadata_remote', version: '1.0.0' }),
      );
      fs.writeFileSync(path.join(directory, 'entry.js'), 'export {};');
      const graphFixtures = {
        'alias-chain.js':
          "import {component as Provider} from '@barrel'; const alias = Provider; export {alias as default};",
        'namespace-re-export.js':
          "import * as providers from '@provider'; export default providers['provider'];",
        'barrel.js': "export {provider as component} from '@provider';",
        'provider.js': "export {default as provider} from './app.js';",
        'rule-entry.js': "export {default} from '@choice';",
        'replaced-entry.js': "export {default} from './replacement-target.js';",
        'replacement-target.js': 'export default () => null;',
        'replaced-ordinary.js': "export {default} from './bridge-target.js';",
        'bridge-target.js':
          'const createBridgeComponent = x => x; export default createBridgeComponent({rootComponent: () => null});',
        'loader-bridge.js': 'export default () => null;',
        'loader-ordinary.js':
          'const createBridgeComponent = x => x; export default createBridgeComponent({rootComponent: () => null});',
        'provider-loader.cjs': `module.exports = function () {return "export {default} from '@loader-provider';";};`,
        'ordinary-loader.cjs': `module.exports = function () {return 'export default () => null;';};`,
        'query-entry.js': "export {component as default} from '@barrel';",
        'external-entry.js': "export {default} from '@external-provider';",
        'mixed-entry.js':
          "const ordinary = require('@dual'); export {ordinary}; export {default} from '@dual';",
        'default-import-relative.js':
          "import MyExport from './app.js'; export default MyExport;",
        'default-import-alias.js':
          "import MyExport from '@default-provider'; export default MyExport;",
        'default-import-ordinary-relative.js':
          "import MyExport from './card.js'; export default MyExport;",
        'default-import-ordinary-alias.js':
          "import MyExport from '@default-card'; export default MyExport;",
      };
      for (const [filename, code] of Object.entries(graphFixtures)) {
        fs.writeFileSync(path.join(directory, filename), code);
      }

      fs.writeFileSync(
        path.join(directory, 'remote-import.js'),
        "import Page from 'checkout/pages/checkout/[...slug]'; export default Page;",
      );
      fs.writeFileSync(
        path.join(directory, 'remote-re-export.js'),
        "export {default} from 'checkout/Page';",
      );
      fs.writeFileSync(
        path.join(directory, 'factory.js'),
        'export const createBridgeComponent = (options) => () => ({render() {}, destroy() {}});',
      );
      fs.writeFileSync(
        path.join(directory, 'app.js'),
        "import {createBridgeComponent as bridge} from '@framework/bundled-provider'; export default bridge({'rootComponent': () => null, 'isService': false});",
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
      fs.writeFileSync(
        path.join(directory, 'framework-wrapper.js'),
        "import {createBridgeComponent as coreBridge} from './factory.js'; export function createBridgeComponent(options) {return coreBridge(options);}",
      );
      fs.writeFileSync(
        path.join(directory, 'wrapped.js'),
        "import {createBridgeComponent as bridge} from '@framework/wrapper'; export default bridge({'rootComponent': () => null, 'isService': false});",
      );
      fs.writeFileSync(
        path.join(directory, 'renamed-wrapper.js'),
        "import {createBridgeComponent} from '@framework/wrapper'; function createWeatherApp(options) {return createBridgeComponent(options);} export default createWeatherApp({rootComponent: () => null});",
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
        const parser = require('@babel/parser');
        const originalParse = parser.parse;
        let parseCalls = 0;
        parser.parse = (...args) => { parseCalls++; return originalParse(...args); };
        const compiler = build({
          mode: 'production',
          context: ${JSON.stringify(directory)},
          entry: './entry.js',
          output: {path: ${JSON.stringify(path.join(directory, 'dist'))}, publicPath: 'https://example.test/'},
          resolve: {byDependency: {
            esm: {alias: {'@dual': ${JSON.stringify(path.join(directory, 'app.js'))}}},
            commonjs: {alias: {'@dual': ${JSON.stringify(path.join(directory, 'card.js'))}}},
          }, alias: {
            '@framework/bundled-provider': ${JSON.stringify(path.join(directory, 'factory.js'))},
            '@framework/wrapper': ${JSON.stringify(path.join(directory, 'framework-wrapper.js'))},
            '@entry-alias$': ${JSON.stringify(path.join(directory, 'alias-chain.js'))},
            '@barrel': ${JSON.stringify(path.join(directory, 'barrel.js'))},
            '@provider': ${JSON.stringify(path.join(directory, 'provider.js'))},
            '@choice': ${JSON.stringify(path.join(directory, 'card.js'))},
            '@loader-provider': ${JSON.stringify(path.join(directory, 'app.js'))},
            '@default-provider': ${JSON.stringify(path.join(directory, 'app.js'))},
            '@default-card': ${JSON.stringify(path.join(directory, 'card.js'))},
          }},
          module: {rules: [
            {test: /rule-entry\\.js$/, resolve: {alias: {'@choice': ${JSON.stringify(path.join(directory, 'app.js'))}}}},
            {test: /loader-bridge\\.js$/, use: [${JSON.stringify(path.join(directory, 'provider-loader.cjs'))}]},
            {test: /loader-ordinary\\.js$/, use: [${JSON.stringify(path.join(directory, 'ordinary-loader.cjs'))}]},
          ]},
          externals: {'@external-provider': 'commonjs external-provider'},
          plugins: [
            new build.NormalModuleReplacementPlugin(/replacement-target\\.js$/, ${JSON.stringify(path.join(directory, 'app.js'))}),
            new build.NormalModuleReplacementPlugin(/bridge-target\\.js$/, ${JSON.stringify(path.join(directory, 'card.js'))}),
            new ${bundler === 'rspack' ? 'build.container.ModuleFederationPluginV1' : 'build.container.ModuleFederationPlugin'}({name: 'metadata_remote', filename: 'remoteEntry.js', exposes: ${JSON.stringify(exposes)}, remotes: ${JSON.stringify(remotes)}, ${bundler === 'rspack-native' ? "implementation: require.resolve('../../runtime-tools'), manifest: true," : ''}}),
            new StatsPlugin({name: 'metadata_remote', exposes: ${JSON.stringify(exposes)}, remotes: ${JSON.stringify(remotes)}}, {pluginVersion: 'test', bundler: ${JSON.stringify(bundler === 'webpack' ? 'webpack' : 'rspack')}}),
          ],
        });
        await new Promise((resolve, reject) => compiler.run((error, stats) => {
          if (error || stats?.hasErrors()) reject(error || new Error(stats.toString({all: false, errors: true})));
          else resolve();
        }));
        await new Promise(resolve => compiler.close(resolve));
        require('node:fs').writeFileSync(${JSON.stringify(path.join(directory, 'parse-count.json'))}, JSON.stringify({parseCalls, version: build.rspackVersion || build.version}));
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
        const { parseCalls } = JSON.parse(
          fs.readFileSync(path.join(directory, 'parse-count.json'), 'utf8'),
        );
        if (bundler === 'webpack') expect(parseCalls).toBe(0);
        else expect(parseCalls).toBeGreaterThan(0);
        for (const output of [manifest, stats]) {
          for (const name of [
            'App',
            'Bundled',
            'ReExport',
            'Wrapped',
            'AliasExpose',
            'AliasChain',
            'NamespaceReExport',
            'RuleAlias',
            'Replaced',
            'LoaderBridge',
            'Query',
            'MixedDependency',
            'DefaultImportRelative',
            'DefaultImportAlias',
          ]) {
            expect(
              output.exposes.find((item: any) => item.name === name),
            ).toMatchObject({ render: 'bridge', isService: false });
          }
          for (const name of [
            'Card',
            'Named',
            'RenamedWrapper',
            'RemoteImport',
            'RemoteReExport',
            'ReplacedOrdinary',
            'LoaderOrdinary',
            'External',
            'DefaultImportOrdinaryRelative',
            'DefaultImportOrdinaryAlias',
          ]) {
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
