/*
 * @rstest-environment node
 */

import {
  createMockCompilation,
  createWebpackMock,
  shareScopes,
  testModuleOptions,
} from '../utils';
import { WEBPACK_MODULE_TYPE_CONSUME_SHARED_MODULE } from '../../../../src/lib/Constants';
import type { ConsumeOptions } from '../../../../src/declarations/plugins/sharing/ConsumeSharedModule';

// Use rs.hoisted() to create mock functions that are hoisted along with rs.mock()
const mocks = rs.hoisted(() => {
  // Create a mock class for ConsumeSharedFallbackDependency
  class MockConsumeSharedFallbackDependency {
    request: string;
    layer: string | undefined;
    constructor(request: string, layer?: string) {
      this.request = request;
      this.layer = layer;
    }
  }

  return {
    mockNormalizeWebpackPath: rs.fn((path: string) => path),
    mockRangeToString: rs.fn((range: unknown) => (range ? String(range) : '*')),
    mockStringifyHoley: rs.fn((version: unknown) => JSON.stringify(version)),
    mockMakeSerializable: rs.fn(),
    MockConsumeSharedFallbackDependency,
  };
});

// Provide minimal webpack surface for the module under test
rs.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: mocks.mockNormalizeWebpackPath,
}));

rs.mock('webpack', () => createWebpackMock());

rs.mock('webpack/lib/util/semver', () => ({
  rangeToString: mocks.mockRangeToString,
  stringifyHoley: mocks.mockStringifyHoley,
}));

rs.mock('webpack/lib/util/makeSerializable', () => mocks.mockMakeSerializable);

rs.mock('../../../../src/lib/sharing/ConsumeSharedFallbackDependency', () => ({
  default: mocks.MockConsumeSharedFallbackDependency,
}));

// Import after mocks
import ConsumeSharedModule from '../../../../src/lib/sharing/ConsumeSharedModule';

interface CodeGenerationContext {
  chunkGraph: any;
  moduleGraph: { getExportsInfo: () => { isModuleUsed: () => boolean } };
  runtimeTemplate: {
    outputOptions: Record<string, unknown>;
    returningFunction: (args: string, body: string) => string;
    syncModuleFactory: () => string;
    asyncModuleFactory: () => string;
  };
  dependencyTemplates: Map<any, any>;
  runtime: string;
  codeGenerationResults: { getData: (...args: any[]) => any };
}

interface ObjectSerializerContext {
  write: (data: any) => void;
  read?: () => any;
  setCircularReference: (ref: any) => void;
}

describe('ConsumeSharedModule (integration)', () => {
  beforeEach(() => {
    rs.clearAllMocks();
  });

  it('constructs with expected options for string share scope', () => {
    const module = new ConsumeSharedModule('/context', {
      ...testModuleOptions.basic,
      shareScope: shareScopes.string,
    } as unknown as ConsumeOptions);

    expect(module.options.shareScope).toBe(shareScopes.string);
    expect(module.options.shareKey).toBe('react');
    expect(module.options.requiredVersion).toBe('^17.0.0');
    expect(module.layer).toBeNull();
  });

  it('produces identifiers that encode scope and key information', () => {
    const module = new ConsumeSharedModule('/context', {
      ...testModuleOptions.basic,
      shareScope: shareScopes.array,
      importResolved: './node_modules/react/index.js',
    } as unknown as ConsumeOptions);

    const identifier = module.identifier();
    expect(identifier).toContain(WEBPACK_MODULE_TYPE_CONSUME_SHARED_MODULE);
    expect(identifier).toContain('default|custom');
    expect(identifier).toContain('react');
  });

  it('generates readable identifiers that reflect share scope combinations', () => {
    const module = new ConsumeSharedModule('/context', {
      ...testModuleOptions.basic,
      shareScope: shareScopes.array,
      importResolved: './node_modules/react/index.js',
    } as unknown as ConsumeOptions);

    const readable = module.readableIdentifier({
      shorten: (value: string) => value,
      contextify: (value: string) => value,
    });

    expect(readable).toContain('consume shared module');
    expect(readable).toContain('(default|custom)');
    expect(readable).toContain('react@');
  });

  it('includes layer metadata in lib identifiers when provided', () => {
    const module = new ConsumeSharedModule(
      '/context',
      testModuleOptions.withLayer as unknown as ConsumeOptions,
    );

    const libIdent = module.libIdent({ context: '/workspace' });

    expect(libIdent).toContain('(test-layer)/');
    expect(libIdent).toContain('default');
    expect(libIdent).toContain('react');
  });

  it('creates eager fallback dependencies during build when import is eager', () => {
    const module = new ConsumeSharedModule('/context', {
      ...testModuleOptions.eager,
      import: './react',
    } as unknown as ConsumeOptions);

    module.build({} as any, {} as any, {} as any, {} as any, () => undefined);

    expect(module.dependencies).toHaveLength(1);
    expect(module.blocks).toHaveLength(0);
  });

  it('creates async fallback blocks during build when import is lazy', () => {
    const module = new ConsumeSharedModule('/context', {
      ...testModuleOptions.basic,
      import: './react',
    } as unknown as ConsumeOptions);

    module.build({} as any, {} as any, {} as any, {} as any, () => undefined);

    expect(module.dependencies).toHaveLength(0);
    expect(module.blocks).toHaveLength(1);
  });

  it('emits runtime requirements for share scope access during code generation', () => {
    const module = new ConsumeSharedModule('/context', {
      ...testModuleOptions.basic,
      shareScope: shareScopes.string,
    } as unknown as ConsumeOptions);

    const codeGenContext: CodeGenerationContext = {
      chunkGraph: {},
      moduleGraph: {
        getExportsInfo: () => ({ isModuleUsed: () => true }),
      },
      runtimeTemplate: {
        outputOptions: {},
        returningFunction: (args, body) => `function(${args}) { ${body} }`,
        syncModuleFactory: () => 'syncModuleFactory()',
        asyncModuleFactory: () => 'asyncModuleFactory()',
      },
      dependencyTemplates: new Map(),
      runtime: 'webpack-runtime',
      codeGenerationResults: { getData: () => undefined },
    };

    const result = module.codeGeneration(codeGenContext as any);

    expect(result.runtimeRequirements).not.toBeNull();
    const runtimeRequirements = result.runtimeRequirements!;

    // Check for shareScopeMap using the constant value directly
    // (webpack.RuntimeGlobals.shareScopeMap = '__webpack_require__.S')
    expect(runtimeRequirements.has('__webpack_require__.S')).toBe(true);
  });

  it('serializes without throwing for array share scopes', () => {
    const module = new ConsumeSharedModule('/context', {
      ...testModuleOptions.basic,
      shareScope: shareScopes.array,
    } as unknown as ConsumeOptions);

    const context: ObjectSerializerContext = {
      write: rs.fn(),
      setCircularReference: rs.fn(),
    };

    expect(() => module.serialize(context as any)).not.toThrow();
  });
});
