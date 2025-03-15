// Utility functions and constants for testing Module Federation container components

import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

/**
 * Create a mock compilation with all the necessary objects for testing Module Federation components
 */
export const createMockCompilation = () => {
  const mockRuntimeTemplate = {
    basicFunction: jest.fn(
      (args, body) =>
        `function(${args}) { ${Array.isArray(body) ? body.join('\n') : body} }`,
    ),
    syncModuleFactory: jest.fn(() => 'syncModuleFactory()'),
    asyncModuleFactory: jest.fn(() => 'asyncModuleFactory()'),
    returningFunction: jest.fn((value) => `function() { return ${value}; }`),
    supportsConst: jest.fn(() => true),
    supportsArrowFunction: jest.fn(() => true),
  };

  const mockChunkGraph = {
    getChunkModulesIterableBySourceType: jest.fn(),
    getOrderedChunkModulesIterableBySourceType: jest.fn(),
    getModuleId: jest.fn().mockReturnValue('mockModuleId'),
    getTreeRuntimeRequirements: jest.fn().mockReturnValue(new Set()),
  };

  const mockModuleGraph = {
    getModule: jest.fn(),
    getOutgoingConnections: jest.fn().mockReturnValue([]),
    getExportsInfo: jest.fn().mockReturnValue({
      isModuleUsed: jest.fn().mockReturnValue(true),
    }),
  };

  const mockCompilation = {
    runtimeTemplate: mockRuntimeTemplate,
    moduleGraph: mockModuleGraph,
    chunkGraph: mockChunkGraph,
    dependencyFactories: new Map(),
    dependencyTemplates: new Map(),
    addRuntimeModule: jest.fn(),
    contextDependencies: { addAll: jest.fn() },
    fileDependencies: { addAll: jest.fn() },
    missingDependencies: { addAll: jest.fn() },
    warnings: [],
    errors: [],
    hooks: {
      additionalTreeRuntimeRequirements: { tap: jest.fn() },
      runtimeRequirementInTree: { tap: jest.fn() },
    },
    resolverFactory: {
      get: jest.fn().mockReturnValue({
        resolve: jest.fn().mockResolvedValue({ path: '/resolved/path' }),
      }),
    },
    codeGenerationResults: {
      getSource: jest.fn().mockReturnValue({ source: () => 'mockSource' }),
      getData: jest.fn(),
    },
    inputFileSystem: {
      readFile: jest.fn(),
      stat: jest.fn(),
    },
    addInclude: jest.fn(),
    moduleMemento: { restore: jest.fn() },
  };

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
export const createMockCompiler = () => {
  const createTapableMock = (name: string) => {
    return {
      tap: jest.fn(),
      tapAsync: jest.fn(),
      tapPromise: jest.fn(),
      call: jest.fn(),
      callAsync: jest.fn(),
      promise: jest.fn(),
    };
  };

  return {
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
        apply = jest.fn();
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
          forEachRuntime: jest.fn((runtimeSpec, callback) => {
            if (typeof runtimeSpec === 'string') {
              callback(runtimeSpec);
            } else if (Array.isArray(runtimeSpec)) {
              runtimeSpec.forEach((runtime) => callback(runtime));
            }
          }),
        },
      },
    },
  };
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
    RawSource: jest.fn((content) => ({
      content,
      source: () => content,
    })),
    OriginalSource: jest.fn((content, name) => ({
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
    static getModulesIdent = jest.fn();
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
    static STAGE_NORMAL = 5;
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

    addDependency = jest.fn();
  };

  const Template = {
    asString: jest.fn((arr) => (Array.isArray(arr) ? arr.join('\n') : arr)),
    toIdentifier: jest.fn((str) => str.replace(/[^a-zA-Z0-9_]/g, '_')),
    toComment: jest.fn((str) => `/* ${str} */`),
    getFunctionContent: jest.fn((fn) => fn.toString()),
    indent: jest.fn((str) => {
      if (Array.isArray(str)) {
        return str.map((s) => `  ${s}`).join('\n');
      } else if (typeof str === 'string') {
        return `  ${str}`;
      } else {
        console.log('Template.indent received:', str);
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

  const makeSerializable = jest.fn((Constructor, name) => {
    // Just a mock implementation - returning the Constructor as-is
    return Constructor;
  });

  // Don't mock validation functions
  const ExternalsPlugin = class {
    type: string;
    externals: any;

    constructor(type, externals) {
      this.type = type;
      this.externals = externals;
    }

    apply = jest.fn();
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
      createHash: jest.fn(() => ({
        update: jest.fn(),
        digest: jest.fn(() => 'hash'),
      })),
      compileBooleanMatcher: jest.fn(() => () => true),
      extractUrlAndGlobal: jest.fn((value) => [value, value.split('@')[0]]),
    },
    optimize,
  };
}

/**
 * Create a mocked container exposed dependency - returns a jest mock function
 */
export const createMockContainerExposedDependency = () => {
  return jest.fn().mockImplementation((exposedName, request) => ({
    exposedName,
    userRequest: request,
    request,
  }));
};

/**
 * Create a mocked remote module - returns a jest mock function
 */
export const createMockRemoteModule = () => {
  return jest
    .fn()
    .mockImplementation(
      (request, externalRequests, internalRequest, shareScope) => ({
        request,
        externalRequests,
        internalRequest,
        shareScope,
        dependencies: [],
        getExportsArgument: jest.fn().mockReturnValue(internalRequest),
        getShareScope: jest.fn().mockReturnValue(shareScope || 'default'),
        build: jest.fn((context, _c, _r, _f, callback) => {
          if (callback) callback();
        }),
        codeGeneration: jest.fn(() => ({
          sources: new Map([['javascript', { source: () => 'mockSource' }]]),
          runtimeRequirements: new Set(),
        })),
        serialize: jest.fn(),
        deserialize: jest.fn(),
      }),
    );
};

/**
 * Create a mocked fallback dependency - returns a jest mock function
 */
export const createMockFallbackDependency = () => {
  return jest.fn().mockImplementation((requests) => ({
    requests,
  }));
};

/**
 * Create a mocked remote to external dependency - returns a jest mock function
 */
export const createMockRemoteToExternalDependency = () => {
  return jest.fn().mockImplementation((request) => ({
    request,
  }));
};
