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
import RemoteModule from '../../../src/lib/container/RemoteModule';

describe('RemoteModule', () => {
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
    it('should initialize with basic properties', () => {
      const request = 'remote-request';
      const externalRequests = ['external-request'];
      const internalRequest = 'internal-request';
      const defaultShareScope = 'default';

      const module = new RemoteModule(
        request,
        externalRequests,
        internalRequest,
        defaultShareScope,
      );

      expect(module.request).toBe(request);
      expect(module.externalRequests).toEqual(externalRequests);
      expect(module.internalRequest).toBe(internalRequest);
      expect(module.shareScope).toBe(defaultShareScope);
    });

    it('should initialize with shareScope', () => {
      const request = 'remote-request';
      const externalRequests = ['external-request'];
      const internalRequest = 'internal-request';
      const shareScope = 'custom-scope';

      const module = new RemoteModule(
        request,
        externalRequests,
        internalRequest,
        shareScope,
      );

      expect(module.request).toBe(request);
      expect(module.externalRequests).toEqual(externalRequests);
      expect(module.internalRequest).toBe(internalRequest);
      expect(module.shareScope).toBe(shareScope);
    });
  });

  describe('identifier', () => {
    it('should generate correct identifier', () => {
      const module = new RemoteModule(
        'remote-request',
        ['external-request'],
        'internal-request',
        'default',
      );

      const identifier = module.identifier();
      expect(identifier).toContain('remote');
      expect(identifier).toContain('external-request');
      expect(identifier).toContain('internal-request');
    });
  });

  describe('readableIdentifier', () => {
    it('should generate readable identifier', () => {
      const module = new RemoteModule(
        'remote-request',
        ['external-request'],
        'internal-request',
        'default',
      );

      const readableId = module.readableIdentifier({
        shorten: (p: string) => p,
      } as any);

      expect(readableId).toContain('remote');
      expect(readableId).toContain('remote-request');
    });
  });

  describe('libIdent', () => {
    it('should generate lib identifier', () => {
      const module = new RemoteModule(
        'remote-request',
        ['external-request'],
        'internal-request',
        'default',
      );

      const libId = module.libIdent({
        context: '/some/context',
      } as any);

      expect(libId).toContain('webpack/container/remote/remote-request');
    });
  });

  describe('build', () => {
    it('should set buildInfo and buildMeta', () => {
      const module = new RemoteModule(
        'remote-request',
        ['external-request'],
        'internal-request',
        'default',
      );

      const callback = jest.fn();
      // Create a more complete mock for WebpackOptionsNormalized
      const mockOptions = {
        cache: true,
        entry: {},
        experiments: {},
        externals: [],
        mode: 'development',
        module: {},
        optimization: {},
        output: {},
        plugins: [],
        resolve: {},
        target: 'web',
      } as any; // Cast to any to avoid type errors

      module.build(mockOptions, mockCompilation as any, {}, {}, callback);

      expect(module.buildInfo).toBeDefined();
      expect(module.buildMeta).toBeDefined();
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const request = 'remote-request';
      const externalRequests = ['external-request'];
      const internalRequest = 'internal-request';
      const shareScope = 'custom-scope';

      const module = new RemoteModule(
        request,
        externalRequests,
        internalRequest,
        shareScope,
      );

      const serializedData: any[] = [];
      const serializeContext: any = {
        write: jest.fn((value: any): number => {
          serializedData.push(value);
          return serializedData.length - 1;
        }),
      };

      module.serialize(serializeContext);

      expect(serializeContext.write).toHaveBeenCalledWith(request);
      expect(serializeContext.write).toHaveBeenCalledWith(externalRequests);
      expect(serializeContext.write).toHaveBeenCalledWith(internalRequest);
      expect(serializeContext.write).toHaveBeenCalledWith(shareScope);
      expect(webpack.Module.prototype.serialize).toHaveBeenCalledWith(
        serializeContext,
      );

      const deserializedData = [
        request,
        externalRequests,
        internalRequest,
        shareScope,
      ];

      let index = 0;
      const deserializeContext: any = {
        read: jest.fn(() => deserializedData[index++]),
        setCircularReference: jest.fn(),
      };

      const staticDeserialize = RemoteModule.deserialize as unknown as (
        context: any,
      ) => RemoteModule;

      const deserializedModule = staticDeserialize(deserializeContext);

      jest
        .spyOn(webpack.Module.prototype, 'deserialize')
        .mockImplementation(() => undefined);

      expect(deserializedModule.request).toBe(request);
      expect(deserializedModule.externalRequests).toEqual(externalRequests);
      expect(deserializedModule.internalRequest).toBe(internalRequest);
      expect(deserializedModule.shareScope).toBe(shareScope);
    });
  });

  describe('codeGeneration', () => {
    it('should generate code with correct requirements', () => {
      const module = new RemoteModule(
        'remote-request',
        ['external-request'],
        'internal-request',
        'default',
      );

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
        },
        chunkGraph: {
          getModuleId: jest.fn().mockReturnValue('123'),
        },
      };

      const result = module.codeGeneration(codeGenContext as any);

      expect(result.sources).toBeDefined();
      const runtimeRequirements = Array.from(result.runtimeRequirements);
      expect(runtimeRequirements.length).toBeGreaterThan(0);
    });
  });
});
