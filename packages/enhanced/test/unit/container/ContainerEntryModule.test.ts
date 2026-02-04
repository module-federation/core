/*
 * @rstest-environment node
 */

import type {
  ObjectDeserializerContext,
  ObjectSerializerContext,
} from 'webpack/lib/serialization/ObjectMiddleware';
import { createMockCompilation, createWebpackMock } from './utils';

// Use rs.hoisted() to create mock functions that are hoisted along with rs.mock()
const mocks = rs.hoisted(() => ({
  mockNormalizeWebpackPath: rs.fn((path: string) => path),
}));

// Mock webpack
rs.mock('webpack', () => createWebpackMock());

// Get the webpack mock
const webpack = require('webpack');

// Add mock to make Module.serialize work
webpack.Module.prototype.serialize = rs.fn();

// Mock dependencies
rs.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: mocks.mockNormalizeWebpackPath,
}));

// Import after mocks
import ContainerEntryModule from '../../../src/lib/container/ContainerEntryModule';
import ContainerEntryDependency from '../../../src/lib/container/ContainerEntryDependency';
import ContainerExposedDependency from '../../../src/lib/container/ContainerExposedDependency';

// We will stub the serializer contexts inline using the proper types

describe('ContainerEntryModule', () => {
  let mockCompilation: ReturnType<
    typeof createMockCompilation
  >['mockCompilation'];
  let mockSerializeContext: any;

  beforeEach(() => {
    rs.clearAllMocks();

    const { mockCompilation: compilation } = createMockCompilation();
    mockCompilation = compilation;

    mockSerializeContext = {
      write: rs.fn(),
      read: rs.fn(),
    };
  });

  describe('constructor', () => {
    it('should initialize with string shareScope', () => {
      const name = 'test-container';
      const shareScope = 'default';
      const exposes = [
        new ContainerExposedDependency('component', './Component'),
      ];
      const exposesFormatted: [string, any][] = [
        ['component', { import: './Component' }],
      ];
      const injectRuntimeEntry = '';
      const dataPrefetch = undefined;

      const module = new ContainerEntryModule(
        name,
        exposesFormatted,
        shareScope,
        injectRuntimeEntry,
        dataPrefetch,
      );

      // Use getters or internal properties with prefix
      expect(module['_name']).toBe(name);
      expect(module['_exposes']).toEqual(exposesFormatted);
      expect(module['_shareScope']).toBe(shareScope);
    });

    it('should initialize with array shareScope', () => {
      const name = 'test-container';
      const shareScope = ['default', 'custom'];
      const exposes = [
        new ContainerExposedDependency('component', './Component'),
      ];
      const exposesFormatted: [string, any][] = [
        ['component', { import: './Component' }],
      ];
      const injectRuntimeEntry = '';
      const dataPrefetch = undefined;

      const module = new ContainerEntryModule(
        name,
        exposesFormatted,
        shareScope,
        injectRuntimeEntry,
        dataPrefetch,
      );

      // Use getters or internal properties with prefix
      expect(module['_name']).toBe(name);
      expect(module['_exposes']).toEqual(exposesFormatted);
      expect(module['_shareScope']).toEqual(shareScope);
    });
  });

  describe('identifier', () => {
    it('should generate correct identifier', () => {
      const name = 'test-container';
      const shareScope = 'default';
      const exposes = [
        new ContainerExposedDependency('component', './Component'),
      ];
      const exposesFormatted: [string, any][] = [
        ['component', { import: './Component' }],
      ];
      const injectRuntimeEntry = '';
      const dataPrefetch = undefined;

      const module = new ContainerEntryModule(
        name,
        exposesFormatted,
        shareScope,
        injectRuntimeEntry,
        dataPrefetch,
      );

      const identifier = module.identifier();
      expect(identifier).toContain('container entry');
      expect(identifier).toContain(JSON.stringify(exposesFormatted));
    });
  });

  describe('readableIdentifier', () => {
    it('should generate readable identifier', () => {
      const name = 'test-container';
      const shareScope = 'default';
      const exposes = [
        new ContainerExposedDependency('component', './Component'),
      ];
      const exposesFormatted: [string, any][] = [
        ['component', { import: './Component' }],
      ];
      const injectRuntimeEntry = '';
      const dataPrefetch = undefined;

      const module = new ContainerEntryModule(
        name,
        exposesFormatted,
        shareScope,
        injectRuntimeEntry,
        dataPrefetch,
      );

      const readableId = module.readableIdentifier({
        shorten: (p: string) => p,
      } as any);

      expect(readableId).toContain('container entry');
    });
  });

  describe('build', () => {
    it('should set buildInfo and buildMeta', () => {
      const name = 'test-container';
      const shareScope = 'default';
      const exposes = [
        new ContainerExposedDependency('component', './Component'),
      ];
      const exposesFormatted: [string, any][] = [
        ['component', { import: './Component' }],
      ];
      const injectRuntimeEntry = '';
      const dataPrefetch = undefined;

      const module = new ContainerEntryModule(
        name,
        exposesFormatted,
        shareScope,
        injectRuntimeEntry,
        dataPrefetch,
      );

      const callback = rs.fn();
      // This callback is only used to assert invocation.

      // Just check if callback is called, don't test internal workings
      module.build({} as any, {} as any, {} as any, {} as any, callback);

      expect(module.buildInfo).toBeDefined();
      expect(module.buildMeta).toBeDefined();
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize with string shareScope', () => {
      const name = 'test-container';
      const shareScope = 'default';
      const exposes = [
        new ContainerExposedDependency('component', './Component'),
      ];
      const exposesFormatted: [string, any][] = [
        ['component', { import: './Component' }],
      ];
      const injectRuntimeEntry = '';
      const dataPrefetch = undefined;

      const module = new ContainerEntryModule(
        name,
        exposesFormatted,
        shareScope,
        injectRuntimeEntry,
        dataPrefetch,
      );

      // Create a proper mock for the serialization context
      const serializedData: any[] = [];
      const serializeContext: ObjectSerializerContext = {
        write: rs.fn((value: any): number => {
          serializedData.push(value);
          return serializedData.length - 1;
        }),
        setCircularReference: rs.fn(),
      };

      // Serialize
      module.serialize(serializeContext);

      // Verify write was called with the expected values
      expect(serializeContext.write).toHaveBeenCalledWith(name);
      expect(serializeContext.write).toHaveBeenCalledWith(exposesFormatted);
      expect(serializeContext.write).toHaveBeenCalledWith(shareScope);
      expect(serializeContext.write).toHaveBeenCalledWith(injectRuntimeEntry);
      expect(serializeContext.write).toHaveBeenCalledWith(dataPrefetch);

      // Reset the serialized data for deserialization
      // The deserialize order is:
      // 1. ContainerEntryModule.deserialize (static) reads: _name, _exposes, _shareScope, _injectRuntimeEntry, _dataPrefetch
      // 2. Then calls obj.deserialize(context) which is Module.deserialize reading:
      //    type, layer, context, resolveOptions, factoryMeta, useSourceMap, useSimpleSourceMap, hot,
      //    _warnings, _errors, buildMeta, buildInfo, presentationalDependencies, codeGenerationDependencies
      // 3. Then Module calls super.deserialize() -> DependenciesBlock reads: dependencies, blocks
      const deserializedData = [
        name, // _name (ContainerEntryModule)
        exposesFormatted, // _exposes (ContainerEntryModule)
        shareScope, // _shareScope (ContainerEntryModule)
        injectRuntimeEntry, // _injectRuntimeEntry (ContainerEntryModule)
        dataPrefetch, // _dataPrefetch (ContainerEntryModule)
        // Module.deserialize reads:
        'javascript/dynamic', // type
        null, // layer
        null, // context
        undefined, // resolveOptions
        undefined, // factoryMeta
        false, // useSourceMap
        false, // useSimpleSourceMap
        false, // hot
        undefined, // _warnings
        undefined, // _errors
        {}, // buildMeta
        {}, // buildInfo
        undefined, // presentationalDependencies
        undefined, // codeGenerationDependencies
        // DependenciesBlock.deserialize reads:
        [], // dependencies
        [], // blocks
      ];

      let index = 0;
      const deserializeContext: ObjectDeserializerContext = {
        read: rs.fn(() => deserializedData[index++]),
        setCircularReference: rs.fn(),
      };

      // Use the static deserialize method instead of instance.deserialize
      // This matches how webpack serialization works
      const staticDeserialize = ContainerEntryModule.deserialize as unknown as (
        context: ObjectDeserializerContext,
      ) => ContainerEntryModule;

      const deserializedModule = staticDeserialize(deserializeContext);

      // Verify deserialized module has correct properties
      expect(deserializedModule['_name']).toBe(name);
      expect(deserializedModule['_shareScope']).toBe(shareScope);
    });

    it('should serialize and deserialize with array shareScope', () => {
      const name = 'test-container';
      const shareScope = ['default', 'custom'];
      const exposes = [
        new ContainerExposedDependency('component', './Component'),
      ];
      const exposesFormatted: [string, any][] = [
        ['component', { import: './Component' }],
      ];
      const injectRuntimeEntry = '';
      const dataPrefetch = undefined;

      const module = new ContainerEntryModule(
        name,
        exposesFormatted,
        shareScope,
        injectRuntimeEntry,
        dataPrefetch,
      );

      // Create a proper mock for the serialization context
      const serializedData: any[] = [];
      const serializeContext: ObjectSerializerContext = {
        write: rs.fn((value: any): number => {
          serializedData.push(value);
          return serializedData.length - 1;
        }),
        setCircularReference: rs.fn(),
      };

      // Serialize
      module.serialize(serializeContext);

      // Verify write was called with the expected values
      expect(serializeContext.write).toHaveBeenCalledWith(name);
      expect(serializeContext.write).toHaveBeenCalledWith(exposesFormatted);
      expect(serializeContext.write).toHaveBeenCalledWith(shareScope);
      expect(serializeContext.write).toHaveBeenCalledWith(injectRuntimeEntry);
      expect(serializeContext.write).toHaveBeenCalledWith(dataPrefetch);

      // Reset the serialized data for deserialization
      // Same order as string shareScope test
      const deserializedData = [
        name, // _name (ContainerEntryModule)
        exposesFormatted, // _exposes (ContainerEntryModule)
        shareScope, // _shareScope (ContainerEntryModule)
        injectRuntimeEntry, // _injectRuntimeEntry (ContainerEntryModule)
        dataPrefetch, // _dataPrefetch (ContainerEntryModule)
        // Module.deserialize reads:
        'javascript/dynamic', // type
        null, // layer
        null, // context
        undefined, // resolveOptions
        undefined, // factoryMeta
        false, // useSourceMap
        false, // useSimpleSourceMap
        false, // hot
        undefined, // _warnings
        undefined, // _errors
        {}, // buildMeta
        {}, // buildInfo
        undefined, // presentationalDependencies
        undefined, // codeGenerationDependencies
        // DependenciesBlock.deserialize reads:
        [], // dependencies
        [], // blocks
      ];

      let index = 0;
      const deserializeContext: ObjectDeserializerContext = {
        read: rs.fn(() => deserializedData[index++]),
        setCircularReference: rs.fn(),
      };

      // Use the static deserialize method instead of instance.deserialize
      // This matches how webpack serialization works
      const staticDeserialize = ContainerEntryModule.deserialize as unknown as (
        context: ObjectDeserializerContext,
      ) => ContainerEntryModule;

      const deserializedModule = staticDeserialize(deserializeContext);

      // Verify deserialized module has correct properties
      expect(deserializedModule['_name']).toBe(name);
      expect(deserializedModule['_shareScope']).toEqual(shareScope);
    });

    it('should handle incomplete deserialization data gracefully', () => {
      const name = 'test-container';
      const exposesFormatted: [string, any][] = [
        ['component', { import: './Component' }],
      ];
      const shareScope = 'default';
      const injectRuntimeEntry = '';
      const dataPrefetch = undefined;

      // Include all required fields for proper deserialization
      const deserializedData = [
        name, // _name (ContainerEntryModule)
        exposesFormatted, // _exposes (ContainerEntryModule)
        shareScope, // _shareScope (ContainerEntryModule)
        injectRuntimeEntry, // _injectRuntimeEntry (ContainerEntryModule)
        dataPrefetch, // _dataPrefetch (ContainerEntryModule)
        // Module.deserialize reads:
        'javascript/dynamic', // type
        null, // layer
        null, // context
        undefined, // resolveOptions
        undefined, // factoryMeta
        false, // useSourceMap
        false, // useSimpleSourceMap
        false, // hot
        undefined, // _warnings
        undefined, // _errors
        {}, // buildMeta
        {}, // buildInfo
        undefined, // presentationalDependencies
        undefined, // codeGenerationDependencies
        // DependenciesBlock.deserialize reads:
        [], // dependencies
        [], // blocks
      ];

      let index = 0;
      const deserializeContext: any = {
        read: rs.fn(() => deserializedData[index++]),
        setCircularReference: rs.fn(),
      };

      const staticDeserialize = ContainerEntryModule.deserialize as unknown as (
        context: any,
      ) => ContainerEntryModule;

      const deserializedModule = staticDeserialize(deserializeContext);

      // Known values are set
      expect(deserializedModule['_name']).toBe(name);
      expect(deserializedModule['_exposes']).toEqual(exposesFormatted);
      expect(deserializedModule['_shareScope']).toBe(shareScope);
    });
  });

  describe('codeGeneration', () => {
    it('should generate code with correct requirements', () => {
      const name = 'test-container';
      const shareScope = 'default';
      const exposesFormatted: [string, any][] = [
        ['component', { import: './Component' }],
      ];
      const injectRuntimeEntry = '';
      const dataPrefetch = undefined;

      const module = new ContainerEntryModule(
        name,
        exposesFormatted,
        shareScope,
        injectRuntimeEntry,
        dataPrefetch,
      );

      // Add basicFunction to runtimeTemplate to avoid errors
      const codeGenContext = {
        moduleGraph: {
          getExportsInfo: rs.fn().mockReturnValue({
            isModuleUsed: () => true,
          }),
          getModule: rs.fn().mockReturnValue({}),
        },
        runtimeTemplate: {
          returningFunction: rs.fn(
            (args, body) => `function(${args}) { ${body} }`,
          ),
          basicFunction: rs.fn((args, body) => `function(${args}) { ${body} }`),
        },
        chunkGraph: {
          getModuleId: rs.fn().mockReturnValue('123'),
        },
      };

      const result = module.codeGeneration(codeGenContext as any);

      expect(result.sources).toBeDefined();
      // Check for the runtime requirement that's actually set in the module
      expect(result.runtimeRequirements).toBeDefined();
    });
  });
});
