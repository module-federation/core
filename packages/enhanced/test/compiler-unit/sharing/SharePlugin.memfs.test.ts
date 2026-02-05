// @ts-nocheck
/*
 * @rstest-environment node
 */

import { rs } from '@rstest/core';
import { vol } from 'memfs';
import SharePlugin from '../../../src/lib/sharing/SharePlugin';
import {
  createRealCompiler,
  createMemfsCompilation,
  createNormalModuleFactory,
} from '../../helpers/webpackMocks';

// Use memfs for fs inside this suite
rs.mock('fs', () => require('memfs').fs);
rs.mock('fs/promises', () => require('memfs').fs.promises);

// Use rs.hoisted() to create mock functions that are hoisted along with rs.mock()
const mocks = rs.hoisted(() => ({
  mockConsumeSharedPlugin: rs.fn().mockImplementation((opts) => ({
    options: opts,
    apply: rs.fn(),
  })),
  mockProvideSharedPlugin: rs.fn().mockImplementation((opts) => ({
    options: opts,
    apply: rs.fn(),
  })),
}));

// Mock child plugins to avoid deep integration
rs.mock('../../../src/lib/sharing/ConsumeSharedPlugin', () => ({
  default: mocks.mockConsumeSharedPlugin,
}));
rs.mock('../../../src/lib/sharing/ProvideSharedPlugin', () => ({
  default: mocks.mockProvideSharedPlugin,
}));

describe('SharePlugin smoke (memfs)', () => {
  beforeEach(() => {
    vol.reset();
    rs.clearAllMocks();
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
    expect(mocks.mockConsumeSharedPlugin).toHaveBeenCalledTimes(1);
    expect(mocks.mockProvideSharedPlugin).toHaveBeenCalledTimes(1);

    // Each child plugin receives shareScope and normalized arrays
    const consumeOpts = mocks.mockConsumeSharedPlugin.mock.calls[0][0];
    const provideOpts = mocks.mockProvideSharedPlugin.mock.calls[0][0];
    expect(consumeOpts.shareScope).toBe('default');
    expect(Array.isArray(consumeOpts.consumes)).toBe(true);
    expect(consumeOpts.consumes).toHaveLength(3);
    expect(provideOpts.shareScope).toBe('default');
    expect(Array.isArray(provideOpts.provides)).toBe(true);
    expect(provideOpts.provides).toHaveLength(3);

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
    const consumeInst = mocks.mockConsumeSharedPlugin.mock.results[0].value;
    const provideInst = mocks.mockProvideSharedPlugin.mock.results[0].value;
    expect(consumeInst.apply).toHaveBeenCalledWith(compiler);
    expect(provideInst.apply).toHaveBeenCalledWith(compiler);
  });
});
