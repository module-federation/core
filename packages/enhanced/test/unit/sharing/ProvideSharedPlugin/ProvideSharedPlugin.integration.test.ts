/*
 * @jest-environment node
 */

import ProvideSharedPlugin from '../../../../src/lib/sharing/ProvideSharedPlugin';
import { vol } from 'memfs';
import {
  createRealCompiler,
  createMemfsCompilation,
  createNormalModuleFactory,
} from '../../../helpers/webpackMocks';

// Mock file system for controlled integration testing
jest.mock('fs', () => require('memfs').fs);
jest.mock('fs/promises', () => require('memfs').fs.promises);

jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  getWebpackPath: jest.fn(() => 'webpack'),
  normalizeWebpackPath: jest.fn((value: string) => value),
}));

jest.mock(
  '../../../../src/lib/container/runtime/FederationRuntimePlugin',
  () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      apply: jest.fn(),
    })),
  }),
);

jest.mock('webpack/lib/util/fs', () => ({
  join: (_fs: unknown, ...segments: string[]) =>
    require('path').join(...segments),
  dirname: (_fs: unknown, filePath: string) =>
    require('path').dirname(filePath),
  readJson: (
    _fs: unknown,
    filePath: string,
    callback: (err: any, data?: any) => void,
  ) => {
    const memfs = require('memfs').fs;
    memfs.readFile(filePath, 'utf8', (error: any, content: string) => {
      if (error) return callback(error);
      try {
        callback(null, JSON.parse(content));
      } catch (parseError) {
        callback(parseError);
      }
    });
  },
}));

describe('ProvideSharedPlugin integration scenarios', () => {
  beforeEach(() => {
    vol.reset();
    jest.clearAllMocks();
  });

  it('applies plugin and registers hooks without throwing', () => {
    const plugin = new ProvideSharedPlugin({
      shareScope: 'default',
      provides: {
        react: '^17.0.0',
        lodash: { version: '^4.17.21', singleton: true },
      },
    });

    const compiler = createRealCompiler();
    expect(() => plugin.apply(compiler as any)).not.toThrow();

    expect(compiler.hooks.compilation.taps.length).toBeGreaterThan(0);
    expect(compiler.hooks.finishMake.taps.length).toBeGreaterThan(0);
  });

  it('executes compilation hooks without errors', async () => {
    const plugin = new ProvideSharedPlugin({
      shareScope: 'default',
      provides: {
        react: '^17.0.0',
        lodash: '^4.17.21',
      },
    });

    const compiler = createRealCompiler();
    plugin.apply(compiler as any);

    const compilation = createMemfsCompilation(compiler);
    const normalModuleFactory = createNormalModuleFactory();

    expect(() =>
      compiler.hooks.thisCompilation.call(compilation, {
        normalModuleFactory,
      }),
    ).not.toThrow();

    expect(() =>
      compiler.hooks.compilation.call(compilation, {
        normalModuleFactory,
      }),
    ).not.toThrow();

    await expect(
      compiler.hooks.finishMake.promise(compilation),
    ).resolves.toBeUndefined();
  });

  it('handles real module matching scenarios with memfs', () => {
    vol.fromJSON({
      '/test-project/src/components/Button.js':
        'export const Button = () => {};',
      '/test-project/src/utils/helpers.js': 'export const helper = () => {};',
      '/test-project/node_modules/lodash/index.js': 'module.exports = {};',
    });

    const plugin = new ProvideSharedPlugin({
      shareScope: 'default',
      provides: {
        './src/components/': { shareKey: 'components' },
        'lodash/': { shareKey: 'lodash' },
        './src/utils/helpers': { shareKey: 'helpers' },
      },
    });

    const compiler = createRealCompiler();
    plugin.apply(compiler as any);

    const compilation = createMemfsCompilation(compiler);
    const normalModuleFactory = createNormalModuleFactory();

    compiler.hooks.compilation.call(compilation, { normalModuleFactory });
    expect((normalModuleFactory.hooks.module as any).tap).toHaveBeenCalled();
  });

  it('supports complex configuration patterns without errors', () => {
    const plugin = new ProvideSharedPlugin({
      shareScope: 'default',
      provides: {
        react: {
          version: '^17.0.0',
          singleton: true,
          eager: false,
          shareKey: 'react',
          shareScope: 'framework',
        },
        lodash: '^4.17.21',
        '@types/react': { version: '^17.0.0', singleton: false },
      },
    });

    const compiler = createRealCompiler();
    expect(() => plugin.apply(compiler as any)).not.toThrow();
  });
});
