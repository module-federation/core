// @ts-nocheck
/*
 * @jest-environment node
 */

import { vol } from 'memfs';
import SharePlugin from '../../../src/lib/sharing/SharePlugin';
import {
  createRealCompiler,
  createMemfsCompilation,
  createNormalModuleFactory,
} from '../../helpers/webpackMocks';

// Use memfs for fs inside this suite
jest.mock('fs', () => require('memfs').fs);
jest.mock('fs/promises', () => require('memfs').fs.promises);

// Mock child plugins to avoid deep integration
jest.mock('../../../src/lib/sharing/ConsumeSharedPlugin', () => {
  return jest
    .fn()
    .mockImplementation((opts) => ({ options: opts, apply: jest.fn() }));
});
jest.mock('../../../src/lib/sharing/ProvideSharedPlugin', () => {
  return jest
    .fn()
    .mockImplementation((opts) => ({ options: opts, apply: jest.fn() }));
});

import ConsumeSharedPlugin from '../../../src/lib/sharing/ConsumeSharedPlugin';
import ProvideSharedPlugin from '../../../src/lib/sharing/ProvideSharedPlugin';

describe('SharePlugin smoke (memfs)', () => {
  beforeEach(() => {
    vol.reset();
    jest.clearAllMocks();
  });

  it('applies child plugins with derived options', () => {
    // Create a tiny project in memfs
    vol.fromJSON({
      '/test-project/src/index.js': 'console.log("hello")',
      '/test-project/package.json': '{"name":"test","version":"1.0.0"}',
      '/test-project/node_modules/react/index.js': 'module.exports = {}',
      '/test-project/node_modules/lodash/index.js': 'module.exports = {}',
    });

    const plugin = new SharePlugin({
      shareScope: 'default',
      shared: {
        react: '^17.0.0',
        lodash: { version: '4.17.21', singleton: true },
        'components/': { version: '1.0.0', eager: false },
      },
    });

    const compiler = createRealCompiler('/test-project');
    expect(() => plugin.apply(compiler as any)).not.toThrow();

    // Child plugins constructed
    expect(ConsumeSharedPlugin).toHaveBeenCalledTimes(1);
    expect(ProvideSharedPlugin).toHaveBeenCalledTimes(1);

    // Each child plugin receives shareScope and normalized arrays
    const consumeOpts = (ConsumeSharedPlugin as jest.Mock).mock.calls[0][0];
    const provideOpts = (ProvideSharedPlugin as jest.Mock).mock.calls[0][0];
    expect(consumeOpts.shareScope).toBe('default');
    expect(Array.isArray(consumeOpts.consumes)).toBe(true);
    expect(provideOpts.shareScope).toBe('default');
    expect(Array.isArray(provideOpts.provides)).toBe(true);

    // Simulate compilation lifecycle
    const compilation = createMemfsCompilation(compiler as any);
    const normalModuleFactory = createNormalModuleFactory();
    expect(() =>
      (compiler as any).hooks.thisCompilation.call(compilation, {
        normalModuleFactory,
      }),
    ).not.toThrow();
    expect(() =>
      (compiler as any).hooks.compilation.call(compilation, {
        normalModuleFactory,
      }),
    ).not.toThrow();

    // Child plugin instances should be applied to the compiler
    const consumeInst = (ConsumeSharedPlugin as jest.Mock).mock.results[0]
      .value;
    const provideInst = (ProvideSharedPlugin as jest.Mock).mock.results[0]
      .value;
    expect(consumeInst.apply).toHaveBeenCalledWith(compiler);
    expect(provideInst.apply).toHaveBeenCalledWith(compiler);
  });
});
