import { ConsumeSharedPlugin } from '../../../src';
import path from 'path';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
const webpack = require(normalizeWebpackPath('webpack'));

const compile = (compiler: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    compiler.run((err: Error | null | undefined, stats: any) => {
      if (err) return reject(err);
      resolve(stats);
    });
  });
};

describe('ConsumeSharedPlugin - Layers Consume Loader Scenario', () => {
  let compiler: any;

  it('should resolve "lib-two" via fallback "lib2" when imported from a specific layer', async () => {
    const webpackConfig = {
      context: path.resolve(
        __dirname,
        '../../configCases/sharing/layers-consume-loader',
      ),
      entry: {
        main: {
          import: './src/index.js',
        },
      },
      mode: 'development',
      devtool: false,
      experiments: {
        layers: true,
      },
      module: {
        rules: [
          {
            test: /tests\/different-layers\.test\.js$/,
            layer: 'differing-layer',
          },
          {
            test: /tests\/prefixed-share\.test\.js$/,
            layer: 'prefixed-layer',
          },
          {
            layer: 'multi-pkg-layer',
            issuerLayer: 'prefixed-layer',
            use: [
              {
                loader: path.resolve(
                  __dirname,
                  '../../configCases/sharing/layers-consume-loader/loaders/multi-pkg-layer-loader.js',
                ),
              },
            ],
          },
          {
            layer: 'required-layer',
            issuerLayer: 'differing-layer',
            exclude: /react\/index2\.js$/,
            use: [
              {
                loader: path.resolve(
                  __dirname,
                  '../../configCases/sharing/layers-consume-loader/loaders/different-layer-loader.js',
                ),
              },
            ],
          },
          {
            test: /react\/index2\.js$/,
            layer: 'explicit-layer',
            use: [
              {
                loader: path.resolve(
                  __dirname,
                  '../../configCases/sharing/layers-consume-loader/loaders/explicit-layer-loader.js',
                ),
              },
            ],
          },
          {
            test: /tests\/lib-two\.test\.js$/,
            layer: 'lib-two-layer',
          },
          {
            test: /lib2\/index\.js$/,
            layer: 'lib-two-required-layer',
            issuerLayer: 'lib-two-layer',
            use: [
              {
                loader: path.resolve(
                  __dirname,
                  '../../configCases/sharing/layers-consume-loader/loaders/different-layer-loader.js',
                ),
              },
            ],
          },
        ],
      },
      plugins: [
        new ConsumeSharedPlugin({
          consumes: {
            react: {
              singleton: true,
            },
            'explicit-layer-react': {
              request: 'react/index2',
              import: 'react/index2',
              shareKey: 'react',
              singleton: true,
              issuerLayer: 'differing-layer',
              layer: 'explicit-layer',
            },
            'differing-layer-react': {
              request: 'react',
              import: 'react',
              shareKey: 'react',
              singleton: true,
              issuerLayer: 'differing-layer',
              layer: 'differing-layer',
            },
            'lib-two': {
              request: 'lib-two',
              import: 'lib2',
              requiredVersion: '^1.0.0',
              strictVersion: true,
              eager: false,
            },
            nonsense: {
              request: 'lib-two',
              import: 'lib2',
              shareKey: 'lib-two',
              requiredVersion: '^1.0.0',
              strictVersion: true,
              eager: true,
              issuerLayer: 'lib-two-layer',
              layer: 'differing-layer',
            },
            'lib-two-layered': {
              import: 'lib2',
              shareKey: 'lib-two',
              requiredVersion: '^1.0.0',
              strictVersion: true,
              eager: true,
              issuerLayer: 'lib-two-layer',
              layer: 'differing-layer',
            },
            multi: {
              request: 'multi-pkg/',
              requiredVersion: '^2.0.0',
              strictVersion: true,
              eager: true,
            },
          },
        }),
      ],
      resolve: {
        modules: [
          path.resolve(
            __dirname,
            '../../configCases/sharing/layers-consume-loader/node_modules',
          ),
          'node_modules',
        ],
      },
    };

    compiler = webpack(webpackConfig);

    const stats = await compile(compiler);

    if (stats.hasErrors()) {
      throw new Error(stats.toJson({ errors: true }).errors);
    }

    const output = stats.toJson({
      modules: true,
      errors: true,
      warnings: true,
      assets: true,
    });

    expect(stats.hasErrors()).toBe(false);
    expect(stats.hasWarnings()).toBe(false);

    const entryModule = output.modules.find((m) =>
      m.name?.endsWith('src/index.js'),
    );
    expect(entryModule).toBeDefined();
    const importsLibTwoTest = entryModule?.reasons?.some((r) =>
      r.moduleName?.endsWith('tests/lib-two.test.js'),
    );

    const libTwoTestModule = output.modules.find((m) =>
      m.name?.endsWith('tests/lib-two.test.js'),
    );
    expect(libTwoTestModule).toBeDefined();
    expect(libTwoTestModule?.layer).toBe('lib-two-layer');

    const consumedLibTwoModule = output.modules.find(
      (m) =>
        m.moduleType === 'consume-shared-module' &&
        m.name?.startsWith('consume shared module (default) lib-two@') &&
        m.issuerId === libTwoTestModule?.id &&
        m.layer === 'differing-layer' &&
        m.reasons?.some(
          (r) =>
            r.moduleId === libTwoTestModule?.id &&
            (r.userRequest === 'lib-two' ||
              r.userRequest === 'lib-two-layered'),
        ),
    );
    expect(consumedLibTwoModule).toBeDefined();

    const lib2ModuleAsFallback = output.modules.find(
      (m) =>
        m.name?.includes('node_modules/lib2/index.js') &&
        m.issuerId === consumedLibTwoModule?.id,
    );
    expect(lib2ModuleAsFallback).toBeDefined();

    const loadedLib2Instance = output.modules.find(
      (m) =>
        m.nameForCondition?.endsWith('node_modules/lib2/index.js') &&
        m.identifier?.includes('different-layer-loader.js') &&
        m.layer === 'required-layer',
    );
    expect(loadedLib2Instance).toBeDefined();
    expect(loadedLib2Instance?.issuerId).toBe(consumedLibTwoModule?.id);

    const differentLayersTestModule = output.modules.find((m) =>
      m.name?.endsWith('tests/different-layers.test.js'),
    );
    expect(differentLayersTestModule).toBeDefined();
    expect(differentLayersTestModule?.layer).toBe('differing-layer');

    const consumedReactModuleFromDiffLayer = output.modules.find(
      (m) =>
        m.moduleType === 'consume-shared-module' &&
        m.name?.startsWith('consume shared module (default) react@') &&
        m.issuerId === differentLayersTestModule?.id &&
        m.layer === 'differing-layer' &&
        m.reasons?.some(
          (r) =>
            r.moduleId === differentLayersTestModule?.id &&
            r.userRequest === 'react',
        ),
    );
    expect(consumedReactModuleFromDiffLayer).toBeDefined();

    const loadedReactInRequiredLayer = output.modules.find(
      (m) =>
        m.nameForCondition?.endsWith('node_modules/react/index.js') &&
        m.identifier?.includes('different-layer-loader.js') &&
        m.layer === 'required-layer' &&
        m.issuerId === consumedReactModuleFromDiffLayer?.id,
    );
    expect(loadedReactInRequiredLayer).toBeDefined();

    const consumedReactIndex2ModuleInExplicitLayer = output.modules.find(
      (m) =>
        m.moduleType === 'consume-shared-module' &&
        m.name?.includes('fallback: ./node_modules/react/index2.js') &&
        m.name?.startsWith('consume shared module (default) react@') &&
        m.issuerId === differentLayersTestModule?.id &&
        m.layer === 'explicit-layer' &&
        m.reasons?.some(
          (r) =>
            r.moduleId === differentLayersTestModule?.id &&
            r.userRequest === 'react/index2',
        ),
    );
    expect(consumedReactIndex2ModuleInExplicitLayer).toBeDefined();

    const loadedReactIndex2InExplicitLayer = output.modules.find(
      (m) =>
        m.nameForCondition?.endsWith('node_modules/react/index2.js') &&
        m.identifier?.includes('explicit-layer-loader.js') &&
        m.layer === 'explicit-layer' &&
        m.issuerId === consumedReactIndex2ModuleInExplicitLayer?.id,
    );
    expect(loadedReactIndex2InExplicitLayer).toBeDefined();
  });
});
