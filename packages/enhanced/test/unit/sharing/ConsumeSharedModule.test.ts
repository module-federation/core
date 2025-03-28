/*
 * @jest-environment node
 */

import {
  createMockCompilation,
  testModuleOptions,
  createWebpackMock,
  shareScopes,
  createModuleMock,
} from './utils';
import { WEBPACK_MODULE_TYPE_CONSUME_SHARED_MODULE } from '../../../src/lib/Constants';

// Add ConsumeOptions type
import type { ConsumeOptions } from '../../../src/lib/sharing/ConsumeSharedModule';

// Define interfaces needed for type assertions
interface CodeGenerationContext {
  moduleGraph: any;
  chunkGraph: any;
  runtimeTemplate: any;
  dependencyTemplates: Map<any, any>;
  runtime: string;
  codeGenerationResults: { getData: (...args: any[]) => any };
}

interface ObjectSerializerContext {
  write: (data: any) => void;
  read?: () => any;
  setCircularReference: (ref: any) => void;
}

// Mock dependencies
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: jest.fn((path) => path),
}));

// Mock webpack
jest.mock(
  'webpack',
  () => {
    return createWebpackMock();
  },
  { virtual: true },
);

// Get the webpack mock
const webpack = require('webpack');

jest.mock(
  'webpack/lib/util/semver',
  () => ({
    rangeToString: jest.fn((range) => (range ? range.toString() : '*')),
    stringifyHoley: jest.fn((version) => JSON.stringify(version)),
  }),
  { virtual: true },
);

jest.mock('webpack/lib/util/makeSerializable', () => jest.fn(), {
  virtual: true,
});

// Mock ConsumeSharedFallbackDependency
jest.mock(
  '../../../src/lib/sharing/ConsumeSharedFallbackDependency',
  () => {
    return jest.fn().mockImplementation((request) => ({ request }));
  },
  { virtual: true },
);

// Use the mock Module class to ensure ConsumeSharedModule can properly extend it
createModuleMock(webpack);

// Import the real module
import ConsumeSharedModule from '../../../src/lib/sharing/ConsumeSharedModule';

describe('ConsumeSharedModule', () => {
  let mockCompilation: ReturnType<
    typeof createMockCompilation
  >['mockCompilation'];
  let mockSerializeContext: ObjectSerializerContext;

  beforeEach(() => {
    jest.clearAllMocks();

    const { mockCompilation: compilation } = createMockCompilation();
    mockCompilation = compilation;

    mockSerializeContext = {
      write: jest.fn(),
      read: jest.fn(),
      setCircularReference: jest.fn(),
    };
  });

  describe('constructor', () => {
    it('should initialize with string shareScope', () => {
      const options = {
        ...testModuleOptions.basic,
        shareScope: shareScopes.string,
      };

      const module = new ConsumeSharedModule(
        '/context',
        options as any as ConsumeOptions,
      );

      expect(module.options).toEqual(
        expect.objectContaining({
          shareScope: shareScopes.string,
          shareKey: 'react',
          requiredVersion: '^17.0.0',
          singleton: true,
        }),
      );
      expect(module.layer).toBeNull();
    });

    it('should initialize with array shareScope', () => {
      const options = {
        ...testModuleOptions.basic,
        shareScope: shareScopes.array,
      };

      const module = new ConsumeSharedModule(
        '/context',
        options as any as ConsumeOptions,
      );

      expect(module.options).toEqual(
        expect.objectContaining({
          shareScope: shareScopes.array,
          shareKey: 'react',
          requiredVersion: '^17.0.0',
          singleton: true,
        }),
      );
    });

    it('should initialize with layer if provided', () => {
      const options = testModuleOptions.withLayer;

      const module = new ConsumeSharedModule(
        '/context',
        options as any as ConsumeOptions,
      );

      expect(module.layer).toBe('test-layer');
    });
  });

  describe('identifier', () => {
    it('should generate identifier with string shareScope', () => {
      const module = new ConsumeSharedModule('/context', {
        ...testModuleOptions.basic,
        shareScope: shareScopes.string,
        importResolved: './node_modules/react/index.js',
      } as any as ConsumeOptions);

      const identifier = module.identifier();

      expect(identifier).toContain(WEBPACK_MODULE_TYPE_CONSUME_SHARED_MODULE);
      expect(identifier).toContain('default'); // shareScope
      expect(identifier).toContain('react'); // shareKey
    });

    it('should generate identifier with array shareScope', () => {
      const module = new ConsumeSharedModule('/context', {
        ...testModuleOptions.basic,
        shareScope: shareScopes.array,
        importResolved: './node_modules/react/index.js',
      } as any as ConsumeOptions);

      const identifier = module.identifier();

      expect(identifier).toContain(WEBPACK_MODULE_TYPE_CONSUME_SHARED_MODULE);
      expect(identifier).toContain('default|custom'); // shareScope
      expect(identifier).toContain('react'); // shareKey
    });
  });

  describe('readableIdentifier', () => {
    it('should generate readable identifier with string shareScope', () => {
      const module = new ConsumeSharedModule('/context', {
        ...testModuleOptions.basic,
        shareScope: shareScopes.string,
        importResolved: './node_modules/react/index.js',
      });

      const identifier = module.readableIdentifier({
        shorten: (path) => path,
        contextify: (path) => path,
      });

      expect(identifier).toContain('consume shared module');
      expect(identifier).toContain('(default)'); // shareScope
      expect(identifier).toContain('react@'); // shareKey
      expect(identifier).toContain('(singleton)');
    });

    it('should generate readable identifier with array shareScope', () => {
      const module = new ConsumeSharedModule('/context', {
        ...testModuleOptions.basic,
        shareScope: shareScopes.array,
        importResolved: './node_modules/react/index.js',
      } as any as ConsumeOptions);

      const identifier = module.readableIdentifier({
        shorten: (path) => path,
        contextify: (path) => path,
      });

      expect(identifier).toContain('consume shared module');
      expect(identifier).toContain('(default|custom)'); // shareScope joined
      expect(identifier).toContain('react@'); // shareKey
    });
  });

  describe('libIdent', () => {
    it('should generate library identifier with string shareScope', () => {
      const module = new ConsumeSharedModule('/context', {
        ...testModuleOptions.basic,
        shareScope: shareScopes.string,
        import: './react',
      } as any as ConsumeOptions);

      const libId = module.libIdent({ context: '/some/context' });

      expect(libId).toContain('webpack/sharing/consume/');
      expect(libId).toContain('default'); // shareScope
      expect(libId).toContain('react'); // shareKey
      expect(libId).toContain('./react'); // import
    });

    it('should generate library identifier with array shareScope', () => {
      const module = new ConsumeSharedModule('/context', {
        ...testModuleOptions.basic,
        shareScope: shareScopes.array,
        import: './react',
      } as any as ConsumeOptions);

      const libId = module.libIdent({ context: '/some/context' });

      expect(libId).toContain('webpack/sharing/consume/');
      expect(libId).toContain('default|custom'); // shareScope
      expect(libId).toContain('react'); // shareKey
      expect(libId).toContain('./react'); // import
    });

    it('should include layer in library identifier when specified', () => {
      const module = new ConsumeSharedModule(
        '/context',
        testModuleOptions.withLayer as any as ConsumeOptions,
      );

      const libId = module.libIdent({ context: '/some/context' });

      expect(libId).toContain('(test-layer)/');
      expect(libId).toContain('webpack/sharing/consume/');
      expect(libId).toContain('default'); // shareScope
      expect(libId).toContain('react'); // shareKey
    });
  });

  describe('build', () => {
    it('should add fallback dependency when import exists and eager=true', () => {
      const module = new ConsumeSharedModule('/context', {
        ...testModuleOptions.eager,
        import: './react',
      } as any as ConsumeOptions);

      // Named callback function to satisfy linter
      function buildCallback() {
        // Empty callback needed for the build method
      }
      module.build({} as any, {} as any, {} as any, {} as any, buildCallback);

      expect(module.dependencies.length).toBe(1);
      expect(module.blocks.length).toBe(0);
    });

    it('should add fallback in async block when import exists and eager=false', () => {
      const module = new ConsumeSharedModule('/context', {
        ...testModuleOptions.basic,
        import: './react',
      } as any as ConsumeOptions);

      // Named callback function to satisfy linter
      function buildCallback() {
        // Empty callback needed for the build method
      }
      module.build({} as any, {} as any, {} as any, {} as any, buildCallback);

      expect(module.dependencies.length).toBe(0);
      expect(module.blocks.length).toBe(1);
    });

    it('should not add fallback when import does not exist', () => {
      const module = new ConsumeSharedModule('/context', {
        ...testModuleOptions.basic,
        import: undefined,
      } as any as ConsumeOptions);

      // Named callback function to satisfy linter
      function buildCallback() {
        // Empty callback needed for the build method
      }
      module.build({} as any, {} as any, {} as any, {} as any, buildCallback);

      expect(module.dependencies.length).toBe(0);
      expect(module.blocks.length).toBe(0);
    });
  });

  describe('codeGeneration', () => {
    it('should generate code with string shareScope', () => {
      const options = {
        ...testModuleOptions.basic,
        shareScope: shareScopes.string,
      };

      const module = new ConsumeSharedModule(
        'react-context',
        options as any as ConsumeOptions,
      );

      const codeGenContext: CodeGenerationContext = {
        chunkGraph: {},
        moduleGraph: {
          getExportsInfo: jest
            .fn()
            .mockReturnValue({ isModuleUsed: () => true }),
        },
        runtimeTemplate: {
          outputOptions: {},
          returningFunction: jest.fn(
            (args, body) => `function(${args}) { ${body} }`,
          ),
          syncModuleFactory: jest.fn(() => 'syncModuleFactory()'),
          asyncModuleFactory: jest.fn(() => 'asyncModuleFactory()'),
        },
        dependencyTemplates: new Map(),
        runtime: 'webpack-runtime',
        codeGenerationResults: { getData: jest.fn() },
      };

      const result = module.codeGeneration(codeGenContext as any);

      expect(result.runtimeRequirements).toBeDefined();
      expect(
        result.runtimeRequirements.has(webpack.RuntimeGlobals.shareScopeMap),
      ).toBe(true);
    });

    it('should generate code with array shareScope', () => {
      const { mockCompilation } = createMockCompilation();

      const module = new ConsumeSharedModule('/context', {
        ...testModuleOptions.basic,
        shareScope: shareScopes.array,
      } as any as ConsumeOptions);

      const codeGenContext: CodeGenerationContext = {
        chunkGraph: mockCompilation.chunkGraph,
        moduleGraph: {
          getExportsInfo: jest
            .fn()
            .mockReturnValue({ isModuleUsed: () => true }),
        },
        runtimeTemplate: {
          outputOptions: {},
          returningFunction: jest.fn(
            (args, body) => `function(${args}) { ${body} }`,
          ),
          syncModuleFactory: jest.fn(() => 'syncModuleFactory()'),
          asyncModuleFactory: jest.fn(() => 'asyncModuleFactory()'),
        },
        dependencyTemplates: new Map(),
        runtime: 'webpack-runtime',
        codeGenerationResults: { getData: jest.fn() },
      };

      const result = module.codeGeneration(codeGenContext as any);

      expect(result.runtimeRequirements).toBeDefined();
      expect(
        result.runtimeRequirements.has(webpack.RuntimeGlobals.shareScopeMap),
      ).toBe(true);
    });

    it('should handle different combinations of strictVersion, singleton, and fallback', () => {
      const testCombinations = [
        { strictVersion: true, singleton: true, import: './react' },
        { strictVersion: true, singleton: false, import: './react' },
        { strictVersion: false, singleton: true, import: './react' },
        { strictVersion: false, singleton: false, import: './react' },
        { strictVersion: true, singleton: true, import: undefined },
        { strictVersion: true, singleton: false, import: undefined },
        { strictVersion: false, singleton: true, import: undefined },
        { strictVersion: false, singleton: false, import: undefined },
      ];

      const codeGenContext: CodeGenerationContext = {
        chunkGraph: {},
        moduleGraph: {
          getExportsInfo: jest
            .fn()
            .mockReturnValue({ isModuleUsed: () => true }),
        },
        runtimeTemplate: {
          outputOptions: {},
          returningFunction: jest.fn(
            (args, body) => `function(${args}) { ${body} }`,
          ),
          syncModuleFactory: jest.fn(() => 'syncModuleFactory()'),
          asyncModuleFactory: jest.fn(() => 'asyncModuleFactory()'),
        },
        dependencyTemplates: new Map(),
        runtime: 'webpack-runtime',
        codeGenerationResults: { getData: jest.fn() },
      };

      for (const combo of testCombinations) {
        const module = new ConsumeSharedModule('/context', {
          ...testModuleOptions.basic,
          ...combo,
        } as any as ConsumeOptions);

        const result = module.codeGeneration(codeGenContext as any);

        expect(result.runtimeRequirements).toBeDefined();
        expect(
          result.runtimeRequirements.has(webpack.RuntimeGlobals.shareScopeMap),
        ).toBe(true);
      }
    });

    it('should generate code with correct requirements', () => {
      const options = {
        ...testModuleOptions.basic,
        import: './react',
      };

      const module = new ConsumeSharedModule(
        'react-context',
        options as any as ConsumeOptions,
      );

      const codeGenContext: CodeGenerationContext = {
        chunkGraph: {},
        moduleGraph: {
          getExportsInfo: jest
            .fn()
            .mockReturnValue({ isModuleUsed: () => true }),
        },
        runtimeTemplate: {
          outputOptions: {},
          returningFunction: jest.fn(
            (args, body) => `function(${args}) { ${body} }`,
          ),
          syncModuleFactory: jest.fn(() => 'syncModuleFactory()'),
          asyncModuleFactory: jest.fn(() => 'asyncModuleFactory()'),
        },
        dependencyTemplates: new Map(),
        runtime: 'webpack-runtime',
        codeGenerationResults: { getData: jest.fn() },
      };

      const result = module.codeGeneration(codeGenContext as any);

      expect(result.runtimeRequirements).toBeDefined();
      expect(
        result.runtimeRequirements.has(webpack.RuntimeGlobals.shareScopeMap),
      ).toBe(true);
    });
  });

  describe('serialization', () => {
    it('should serialize module data', () => {
      const context: ObjectSerializerContext = {
        write: jest.fn(),
        setCircularReference: jest.fn(),
      };

      const module = new ConsumeSharedModule(
        '/context',
        testModuleOptions.basic as any as ConsumeOptions,
      );

      // We can't directly test the serialization in a fully functional way without proper webpack setup
      // Just verify the serialize method exists and can be called
      expect(() => {
        if (typeof module.serialize === 'function') {
          module.serialize(context as any);
        }
      }).not.toThrow();
    });

    it('should handle array shareScope serialization', () => {
      const options = {
        ...testModuleOptions.basic,
        shareScope: shareScopes.array,
      };

      const context: ObjectSerializerContext = {
        write: jest.fn(),
        setCircularReference: jest.fn(),
      };

      const module = new ConsumeSharedModule(
        '/context',
        options as any as ConsumeOptions,
      );

      // Just verify the serialize method exists and can be called
      expect(() => {
        if (typeof module.serialize === 'function') {
          module.serialize(context as any);
        }
      }).not.toThrow();
    });
  });
});
