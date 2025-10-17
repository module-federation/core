/*
 * @jest-environment node
 */

import { createMockCompilation, createWebpackMock } from './utils';

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

// Add mock to make Module.serialize work
webpack.Module.prototype.serialize = jest.fn();

// Mock dependencies
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: jest.fn((path) => path),
}));

// Import after mocks
import ContainerEntryModule from '../../../src/lib/container/ContainerEntryModule';
import ContainerEntryDependency from '../../../src/lib/container/ContainerEntryDependency';
import ContainerExposedDependency from '../../../src/lib/container/ContainerExposedDependency';

// Add these types at the top, after the imports
type ObjectSerializerContext = {
  write: (value: any) => number;
};

type ObjectDeserializerContext = {
  read: () => any;
  setCircularReference: (ref: any) => void;
};

describe('ContainerEntryModule', () => {
  let mockCompilation: ReturnType<
    typeof createMockCompilation
  >['mockCompilation'];
  let mockSerializeContext: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const { mockCompilation: compilation } = createMockCompilation();
    mockCompilation = compilation;

    mockSerializeContext = {
      write: jest.fn(),
      read: jest.fn(),
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

      const callback = jest.fn();

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
        write: jest.fn((value: any): number => {
          serializedData.push(value);
          return serializedData.length - 1;
        }),
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
      const deserializedData = [
        name, // _name
        exposesFormatted, // _exposes
        shareScope, // _shareScope
        injectRuntimeEntry, // _injectRuntimeEntry
        dataPrefetch, // _dataPrefetch
      ];

      let index = 0;
      const deserializeContext: ObjectDeserializerContext = {
        read: jest.fn(() => deserializedData[index++]),
        setCircularReference: jest.fn(),
      };

      // Use the static deserialize method instead of instance.deserialize
      // This matches how webpack serialization works
      const staticDeserialize = ContainerEntryModule.deserialize as unknown as (
        context: ObjectDeserializerContext,
      ) => ContainerEntryModule;

      const deserializedModule = staticDeserialize(deserializeContext);

      // Mock the super.deserialize call
      jest
        .spyOn(webpack.Module.prototype, 'deserialize')
        .mockImplementation(() => undefined);

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
        write: jest.fn((value: any): number => {
          serializedData.push(value);
          return serializedData.length - 1;
        }),
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
      const deserializedData = [
        name, // _name
        exposesFormatted, // _exposes
        shareScope, // _shareScope
        injectRuntimeEntry, // _injectRuntimeEntry
        dataPrefetch, // _dataPrefetch
      ];

      let index = 0;
      const deserializeContext: ObjectDeserializerContext = {
        read: jest.fn(() => deserializedData[index++]),
        setCircularReference: jest.fn(),
      };

      // Use the static deserialize method instead of instance.deserialize
      // This matches how webpack serialization works
      const staticDeserialize = ContainerEntryModule.deserialize as unknown as (
        context: ObjectDeserializerContext,
      ) => ContainerEntryModule;

      const deserializedModule = staticDeserialize(deserializeContext);

      // Mock the super.deserialize call
      jest
        .spyOn(webpack.Module.prototype, 'deserialize')
        .mockImplementation(() => undefined);

      // Verify deserialized module has correct properties
      expect(deserializedModule['_name']).toBe(name);
      expect(deserializedModule['_shareScope']).toEqual(shareScope);
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
          getExportsInfo: jest.fn().mockReturnValue({
            isModuleUsed: () => true,
          }),
          getModule: jest.fn().mockReturnValue({}),
        },
        runtimeTemplate: {
          returningFunction: jest.fn(
            (args, body) => `function(${args}) { ${body} }`,
          ),
          basicFunction: jest.fn(
            (args, body) => `function(${args}) { ${body} }`,
          ),
        },
        chunkGraph: {
          getModuleId: jest.fn().mockReturnValue('123'),
        },
      };

      const result = module.codeGeneration(codeGenContext as any);

      expect(result.sources).toBeDefined();
      // Check for the runtime requirement that's actually set in the module
      expect(result.runtimeRequirements).toBeDefined();
    });
  });
});
