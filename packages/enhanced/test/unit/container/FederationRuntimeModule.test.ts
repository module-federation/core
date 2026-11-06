/*
 * @rstest-environment node
 */

import { rs } from '@rstest/core';

const mocks = rs.hoisted(() => ({
  getFederationGlobal: rs.fn(() => '__FEDERATION__'),
}));

rs.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: (p: string) => p,
}));

rs.mock('../../../src/lib/container/runtime/getFederationGlobal', () => ({
  default: mocks.getFederationGlobal,
}));

rs.mock('webpack', () => {
  class RuntimeModule {
    constructor(public name: string) {}
  }
  return {
    RuntimeModule,
    RuntimeGlobals: { ensureChunkHandlers: '__webpack_require__.f' },
    Template: { asString: (parts: string[]) => parts.join('\n') },
  };
});

const FederationRuntimeModule =
  require('../../../src/lib/container/runtime/FederationRuntimeModule').default;

const UNSETTLED = /\[(?:full|chunk|content)?hash(?::[^\]]+)?\]/;

// Emulates webpack >= 5.111, where hashes are not settled while runtime modules are generated.
const createGetPath = () =>
  rs.fn((template: string) => {
    const hash = UNSETTLED.exec(template);
    if (hash) {
      throw new Error(
        `Path variable ${hash[0]} not implemented in this context`,
      );
    }
    return template;
  });

const createModule = (
  template: string,
  runtimeTemplate: Record<string, unknown> = {},
) => {
  const getPath = createGetPath();
  const chunk = { contentHash: {} };
  const module = new FederationRuntimeModule(
    new Set(['__webpack_require__.f']),
    'host',
    {},
  );
  module.chunk = chunk;
  module.compilation = {
    getPath,
    runtimeTemplate,
    outputOptions: { path: '/out' },
    chunkGraph: { getChunkConditionMap: () => ({}) },
    compiler: {
      webpack: {
        javascript: {
          JavascriptModulesPlugin: {
            chunkHasJs: () => true,
            getChunkFilenameTemplate: () => template,
          },
        },
      },
    },
  };
  return { module, getPath, chunk };
};

const generatedRootOutputDir = () =>
  (mocks.getFederationGlobal.mock.calls.at(-1) as unknown[])[3];

describe('FederationRuntimeModule root output dir', () => {
  beforeEach(() => {
    mocks.getFederationGlobal.mockClear();
  });

  it.each([
    ['[name].[contenthash].js', ''],
    ['[name].[contenthash].[chunkhash].js', ''],
    ['nested/dir/[name].[fullhash:8].[chunkhash].js', '../../'],
  ])(
    'computes the depth for %s without resolving hashes (older webpack)',
    (template, expected) => {
      const { module, chunk } = createModule(template);
      module.generate();
      expect(generatedRootOutputDir()).toBe(expected);
      expect(chunk.contentHash).toEqual({});
    },
  );

  it('prefers runtimeTemplate.chunkRootOutputDir when webpack provides it', () => {
    const chunkRootOutputDir = rs.fn(() => '../');
    const { module, chunk, getPath } = createModule(
      '[name].[contenthash].[chunkhash].js',
      { chunkRootOutputDir },
    );
    module.generate();
    expect(chunkRootOutputDir).toHaveBeenCalledWith(chunk, false);
    expect(getPath).not.toHaveBeenCalled();
    expect(generatedRootOutputDir()).toBe('../');
  });
});
