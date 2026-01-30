// Utility functions and constants for testing Module Federation container components

import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { rstest, Mock } from '@rstest/core';
import type { Compiler, Compilation } from 'webpack';
import type { RuntimeGlobals } from 'webpack';
import type {
  ObjectSerializerContext,
  ObjectDeserializerContext,
} from 'webpack/lib/serialization/ObjectMiddleware';
import type RuntimeTemplate from 'webpack/lib/RuntimeTemplate';
import type ChunkGraph from 'webpack/lib/ChunkGraph';
import type Module from 'webpack/lib/Module';
import type Dependency from 'webpack/lib/Dependency';

/**
 * Create a mock compilation with all the necessary objects for testing Module Federation components
 */
export const createMockCompilation = () => {
  const mockRuntimeTemplate: Partial<RuntimeTemplate> = {
    basicFunction: rstest.fn(
      (args: string, body: string | string[]) =>
        `function(${args}) { ${Array.isArray(body) ? body.join('\n') : body} }`,
    ),
    syncModuleFactory: rstest.fn(() => 'syncModuleFactory()'),
    asyncModuleFactory: rstest.fn(() => 'asyncModuleFactory()'),
    returningFunction: rstest.fn(
      (value: string) => `function() { return ${value}; }`,
    ),
    supportsConst: rstest.fn(() => true),
    supportsArrowFunction: rstest.fn(() => true),
  };

  const mockChunkGraph: Partial<ChunkGraph> = {
    getChunkModulesIterableBySourceType: rstest.fn(),
    getOrderedChunkModulesIterableBySourceType: rstest.fn(),
    getModuleId: rstest.fn().mockReturnValue('mockModuleId'),
    getTreeRuntimeRequirements: rstest.fn().mockReturnValue(new Set()),
  };

  const mockModuleGraph = {
    getModule: rstest.fn(),
    getOutgoingConnections: rstest.fn().mockReturnValue([]),
    getExportsInfo: rstest.fn().mockReturnValue({
      isModuleUsed: rstest.fn().mockReturnValue(true),
    }),
  };

  // Create a mock compilation that extends the actual Compilation class
  const compilationPrototype = require(
    normalizeWebpackPath('webpack/lib/Compilation'),
  ).prototype;

  const mockCompilation = Object.create(compilationPrototype) as any;

  Object.assign(mockCompilation, {
    runtimeTemplate: mockRuntimeTemplate,
    moduleGraph: mockModuleGraph,
    chunkGraph: mockChunkGraph,
    dependencyFactories: new Map<string, Dependency>(),
    dependencyTemplates: new Map(),
    addRuntimeModule: rstest.fn(),
    contextDependencies: { addAll: rstest.fn() },
    fileDependencies: { addAll: rstest.fn() },
    missingDependencies: { addAll: rstest.fn() },
    warnings: [] as Error[],
    errors: [] as Error[],
    hooks: {
      additionalTreeRuntimeRequirements: { tap: rstest.fn() },
      runtimeRequirementInTree: { tap: rstest.fn() },
      processAssets: { tap: rstest.fn() },
    },
    resolverFactory: {
      get: rstest.fn().mockReturnValue({
        resolve: rstest.fn(),
      }),
    },
    codeGenerationResults: {
      getSource: rstest.fn().mockReturnValue({ source: () => 'mockSource' }),
      getData: rstest.fn(),
    },
    inputFileSystem: {
      readFile: rstest.fn(),
      stat: rstest.fn(),
    },
    addInclude: rstest.fn(),
    moduleMemento: { restore: rstest.fn() },
  });

  return {
    mockCompilation,
    mockRuntimeTemplate,
    mockChunkGraph,
    mockModuleGraph,
  };
};

/**
 * Create a mock compiler with hooks and plugins for testing webpack plugins
 */
export const createMockCompiler = (): any => {
  const createTapableMock = (name: string) => {
    return {
      tap: rstest.fn(),
      tapAsync: rstest.fn(),
      tapPromise: rstest.fn(),
      call: rstest.fn(),
      callAsync: rstest.fn(),
      promise: rstest.fn(),
    };
  };

  const compiler = {
    hooks: {
      thisCompilation: createTapableMock('thisCompilation'),
      compilation: createTapableMock('compilation'),
      finishMake: createTapableMock('finishMake'),
      make: createTapableMock('make'),
    },
    context: '/mock-context',
    options: {
      plugins: [],
      output: {
        path: '/mock-output-path',
        publicPath: 'auto',
      },
      optimization: {
        splitChunks: {
          cacheGroups: {},
        },
      },
    },
    webpack: {
      ExternalsPlugin: class ExternalsPlugin {
        type: string;
        externals: any;

        constructor(type: string, externals: any) {
          this.type = type;
          this.externals = externals;
        }
        apply = rstest.fn();
      },
      RuntimeGlobals: {
        ensureChunkHandlers: 'ensureChunkHandlers',
        module: 'module',
        moduleFactoriesAddOnly: 'moduleFactoriesAddOnly',
        hasOwnProperty: 'hasOwnProperty',
        initializeSharing: 'initializeSharing',
        shareScopeMap: 'shareScopeMap',
      },
      util: {
        runtime: {
          forEachRuntime: rstest.fn(
            (
              runtimeSpec: string | string[],
              callback: (runtime: string) => void,
            ) => {
              if (typeof runtimeSpec === 'string') {
                callback(runtimeSpec);
              } else if (Array.isArray(runtimeSpec)) {
                runtimeSpec.forEach((runtime: string) => callback(runtime));
              }
            },
          ),
        },
      },
    },
  } as any;

  return compiler;
};

/**
 * Mock dependency for container tests
 */
export class MockModuleDependency {
  request: string;
  userRequest: string;
  weak = false;
  optional = false;
  module: any = null;

  constructor(request: string) {
    this.request = request;
    this.userRequest = request;
  }

  get type() {
    return 'module-dependency';
  }

  getResourceIdentifier() {
    return null;
  }

  getModuleEvaluationSideEffectsState() {
    return true;
  }
}

// Mock class for Module
export class MockModule {
  type: string;
  dependencies: any[];
  blocks: any[];
  buildMeta: any;
  buildInfo: any;
  layer: string | undefined;
  _identifier: string;
  name: string;
  shareScope: string | string[];
  options: any;
  exposesMap: Map<string, any>;
  internalRequest: string;
  request: string;
  externalRequests: string[];

  constructor(type: string, name?: string, shareScope?: string, options?: any) {
    this.type = type;
    this.dependencies = [];
    this.blocks = [];
    this.buildMeta = {};
    this.buildInfo = {};
    this.name = name || '';
    this.shareScope = shareScope || 'default';
    this.options = options;
    this._identifier = name ? `container entry ${name}` : '';
    this.exposesMap = new Map();
    this.internalRequest = name || '';
    this.request = name || '';
    this.externalRequests = [];
  }

  identifier() {
    return (
      this._identifier ||
      `container entry (${this.name}) "${this.shareScope}" ${this.type} ${this.layer}`
    );
  }

  readableIdentifier() {
    return this._identifier || 'container entry';
  }

  libIdent() {
    const layerPrefix = this.layer ? `(${this.layer})/` : '';
    return `${layerPrefix}webpack/sharing/consume/default/${this.name}`;
  }

  getExportsType() {
    return 'default';
  }

  getExportsArgument() {
    return this.internalRequest || this.name || '';
  }

  getShareScope() {
    return this.shareScope || 'default';
  }

  setExposesMap(map: Map<string, any>) {
    this.exposesMap = map;
  }

  addDependency(dep: any) {
    this.dependencies.push(dep);
  }

  addBlock(block: any) {
    this.blocks.push(block);
  }

  clearDependenciesAndBlocks() {
    this.dependencies = [];
    this.blocks = [];
  }

  build(
    _context: any,
    _compilation: any,
    _resolver: any,
    _fs: any,
    callback: () => void,
  ) {
    if (callback) callback();
  }

  codeGeneration(sourceContext: any) {
    // Create a basic source that all tests can check for
    const sources = new Map();
    sources.set('javascript', {
      source: () => `__webpack_require__.d(exports, {})`,
    });

    // Add common runtime requirements
    const runtimeRequirements = new Set(['__webpack_require__.d']);

    return {
      sources,
      runtimeRequirements,
      data: new Map(),
    };
  }

  serialize(context: any) {
    const { write } = context;
    write(this.type);
    write(this.name);
    write(this.shareScope);
    write(this.options);
    write(this.layer);
    write(this.internalRequest);
    write(this.request);
    write(this.externalRequests);
  }

  deserialize(context: any) {
    const { read } = context;
    this.type = read();
    this.name = read();
    this.shareScope = read();
    this.options = read();
    this.layer = read();
    this.internalRequest = read();
    this.request = read();
    this.externalRequests = read();
    this._identifier = `container entry ${this.name}`;
  }
}

/**
 * Create webpack mock for common webpack classes and utilities
 */
export function createWebpackMock() {
  const webpackSources = {
    RawSource: rstest.fn((content: string) => ({
      content,
      source: () => content,
    })),
    OriginalSource: rstest.fn((content: string, name: string) => ({
      content,
      name,
      source: () => content,
    })),
  };

  class ContextModule {
    constructor() {
      // Empty constructor
    }
  }

  const Module = class {
    static getModulesIdent = rstest.fn();
    id: string | number;
    layer: string | null;
    dependencies: any[];
    blocks: any[];
    type: string;
    buildMeta: any;
    buildInfo: any;

    constructor(type: string) {
      this.id = '';
      this.layer = null;
      this.dependencies = [];
      this.blocks = [];
      this.type = type;
      this.buildMeta = {};
      this.buildInfo = {};
    }

    addDependency(dep: any) {
      this.dependencies.push(dep);
    }

    addBlock(block: any) {
      this.blocks.push(block);
    }

    clearDependenciesAndBlocks() {
      this.dependencies = [];
      this.blocks = [];
    }

    updateHash(hash: any, context: any) {
      // Mock implementation of updateHash that matches webpack's Module class
      hash.update(this.type);
      if (this.layer) hash.update(this.layer);

      // Simulate webpack's Module class behavior that uses moduleGraph
      if (context?.moduleGraph?.getModuleGraphHash) {
        const moduleHash = context.moduleGraph.getModuleGraphHash(
          context.runtime || 'webpack-runtime',
        );
        hash.update(moduleHash);
      }
    }

    serialize(context: any) {
      const { write } = context;
      write(this.type);
      write(this.layer);
    }

    deserialize(context: any) {
      const { read } = context;
      this.type = read();
      this.layer = read();
    }
  };

  const RuntimeModule = class extends Module {
    static STAGE_NORMAL = 0;
    static STAGE_BASIC = 10;
    static STAGE_ATTACH = 20;
    static STAGE_TRIGGER = 30;

    compilation: any;
    chunk: any;
    chunkGraph: any;
    name: string;
    stage: number;

    constructor(name: string, stage: number = RuntimeModule.STAGE_NORMAL) {
      super('runtime');
      this.name = name;
      this.stage = stage;
    }

    generate() {
      return 'console.log("runtime module")';
    }
  };

  const AsyncDependenciesBlock = class {
    constructor(options = {}) {
      Object.assign(this, options);
    }

    addDependency = rstest.fn();
  };

  const Template = {
    asString: rstest.fn((arr: string | string[]) =>
      Array.isArray(arr) ? arr.join('\n') : arr,
    ),
    toIdentifier: rstest.fn((str: string) =>
      str.replace(/[^a-zA-Z0-9_]/g, '_'),
    ),
    toComment: rstest.fn((str: string) => `/* ${str} */`),
    getFunctionContent: rstest.fn((fn: () => void) => fn.toString()),
    indent: rstest.fn((str: string | string[]) => {
      if (Array.isArray(str)) {
        return str.map((s: string) => `  ${s}`).join('\n');
      } else if (typeof str === 'string') {
        return `  ${str}`;
      } else {
        // Unexpected type for indentation, return as-is
        return str;
      }
    }),
  };

  const RuntimeGlobals = {
    require: '__webpack_require__',
    chunkName: '__webpack_require__.cn',
    module: 'module',
    moduleCache: '__webpack_require__.c',
    moduleFactories: '__webpack_require__.m',
    definePropertyGetters: '__webpack_require__.d',
    hasOwnProperty: '__webpack_require__.o',
    publicPath: '__webpack_require__.p',
    entryModuleId: '__webpack_require__.s',
    moduleId: '__webpack_module_id__',
    exports: 'exports',
    returnFunction: 'return',
    ensureChunkHandlers: '__webpack_require__.f',
    prefetchChunkHandlers: '__webpack_require__.F',
    loadScript: '__webpack_require__.l',
    wasmInstances: '__webpack_require__.w',
    instantiateWasm: '__webpack_require__.v',
    shareScopeMap: '__webpack_require__.S',
    initializeSharing: '__webpack_require__.I',
    currentChunkId: '__webpack_require__.h()',
    onChunksLoaded: '__webpack_require__.O',
  };

  const dependencies = {
    ModuleDependency: class ModuleDependency {
      weak: boolean;
      optional: boolean;
      request: string;

      constructor(request: string) {
        this.request = request;
        this.weak = false;
        this.optional = false;
      }
    },
    Dependency: class Dependency {
      weak: boolean;
      optional: boolean;

      constructor() {
        this.weak = false;
        this.optional = false;
      }

      getResourceIdentifier() {
        return null;
      }

      get type() {
        return 'dependency';
      }

      serialize(context: any) {
        // Base implementation
      }

      deserialize(context: any) {
        // Base implementation
      }
    },
    ContextElementDependency: class ContextElementDependency {
      request: string;
      userRequest: string;
      constructor(request: string, userRequest: string) {
        this.request = request;
        this.userRequest = userRequest;
      }
    },
  };

  const makeSerializable = rstest.fn(
    (Constructor: new (...args: unknown[]) => unknown, name: string) => {
      // Just a mock implementation - returning the Constructor as-is
      return Constructor;
    },
  );

  // Don't mock validation functions
  const ExternalsPlugin = class {
    type: string;
    externals: unknown;
    apply: any;

    constructor(type: string, externals: unknown) {
      this.type = type;
      this.externals = externals;
      this.apply = rstest.fn();
    }
  };

  // Keep optimize as an empty object instead of removing it completely
  const optimize = {};

  return {
    sources: webpackSources,
    Template,
    AsyncDependenciesBlock,
    RuntimeGlobals,
    RuntimeModule,
    Module,
    ContextModule,
    makeSerializable,
    ExternalsPlugin,
    dependencies,
    Dependency: dependencies.Dependency,
    WebpackError: class WebpackError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'WebpackError';
      }
    },
    util: {
      createHash: rstest.fn(() => ({
        update: rstest.fn(),
        digest: rstest.fn(() => 'hash'),
      })),
      compileBooleanMatcher: rstest.fn(() => () => true),
      extractUrlAndGlobal: rstest.fn((value: string) => [
        value,
        value.split('@')[0],
      ]),
    },
    optimize,
  };
}

export type MockCompiler = ReturnType<typeof createMockCompiler>;
export type MockCompilation = ReturnType<
  typeof createMockCompilation
>['mockCompilation'];

/**
 * Create a mocked container exposed dependency - returns a mock function
 */
export const createMockContainerExposedDependency = () => {
  return rstest
    .fn()
    .mockImplementation((exposedName: string, request: string) => ({
      exposedName,
      userRequest: request,
      request,
    }));
};

/**
 * Create a mocked remote module - returns a mock function
 */
export const createMockRemoteModule = () => {
  return rstest
    .fn()
    .mockImplementation(
      (
        request: string,
        externalRequests: string[],
        internalRequest: string,
        shareScope: string,
      ) => ({
        request,
        externalRequests,
        internalRequest,
        shareScope,
        dependencies: [],
        getExportsArgument: rstest.fn().mockReturnValue(internalRequest),
        getShareScope: rstest.fn().mockReturnValue(shareScope || 'default'),
        build: rstest.fn(
          (
            context: unknown,
            _c: unknown,
            _r: unknown,
            _f: unknown,
            callback: () => void,
          ) => {
            if (callback) callback();
          },
        ),
        codeGeneration: rstest.fn(() => ({
          sources: new Map([['javascript', { source: () => 'mockSource' }]]),
          runtimeRequirements: new Set(),
        })),
        serialize: rstest.fn(),
        deserialize: rstest.fn(),
      }),
    );
};

/**
 * Create a mocked fallback dependency - returns a mock function
 */
export const createMockFallbackDependency = () => {
  return rstest.fn().mockImplementation((requests: string[]) => ({
    requests,
  }));
};

/**
 * Create a mocked remote to external dependency - returns a mock function
 */
export const createMockRemoteToExternalDependency = () => {
  return rstest.fn().mockImplementation((request: string) => ({
    request,
  }));
};
