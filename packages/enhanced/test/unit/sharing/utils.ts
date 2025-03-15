// Utility functions and constants for testing Module Federation sharing components
import {
  createWebpackMock as createContainerWebpackMock,
  MockModule,
} from '../container/utils';

/**
 * Create a mock Module class that can be used to replace webpack's Module class
 * This helps with testing modules that extend webpack's Module class
 */
export const createModuleMock = (webpackMock: any) => {
  // Create a mock Module class that simulates webpack's Module class
  class MockModuleClass {
    type: string;
    context: string;
    layer: string | null;
    dependencies: any[];
    blocks: any[];
    buildInfo: any;
    buildMeta: any;

    constructor(type: string, context: string, layer: string | null) {
      this.type = type;
      this.context = context;
      this.layer = layer;
      this.dependencies = [];
      this.blocks = [];
      this.buildInfo = {};
      this.buildMeta = {};
    }

    addDependency(dep: any): void {
      this.dependencies.push(dep);
    }

    addBlock(block: any): void {
      this.blocks.push(block);
    }

    // Add updateHash method required by tests
    updateHash(hash: any, context: any): void {
      // Simple implementation that just calls hash.update with some values
      hash.update(this.type);
      if (this.layer) hash.update(this.layer);
    }

    // These stubs are needed for modules that extend webpack's Module class
    static deserialize(): void {
      /* empty implementation to satisfy interface */
    }
    static buildId(): void {
      /* empty implementation to satisfy interface */
    }
    static updateCacheModule(): void {
      /* empty implementation to satisfy interface */
    }

    // Helper method to add any additional methods needed by tests
    static extendWith(
      methods: Record<string, (...args: any[]) => any>,
    ): typeof MockModuleClass {
      Object.entries(methods).forEach(([key, method]) => {
        (MockModuleClass.prototype as any)[key] = method;
      });
      return MockModuleClass;
    }
  }

  // Assign the mock Module class to webpack.Module
  webpackMock.Module = MockModuleClass;

  return MockModuleClass;
};

/**
 * Create mock classes for ConsumeShared dependencies
 * These can be used to mock the actual dependencies for tests
 */
export const createMockConsumeSharedDependencies = () => {
  class MockConsumeSharedDependency {
    constructor(
      public request: string,
      public shareScope: string | string[],
      public requiredVersion: string,
    ) {}

    // Add additional methods that might be needed by tests
    getResourceIdentifier(): string {
      return `consume-shared:${this.request}:${this.requiredVersion}`;
    }
  }

  class MockConsumeSharedFallbackDependency {
    constructor(
      public fallbackRequest: string,
      public shareScope: string | string[],
      public requiredVersion: string,
    ) {}

    // Add additional methods that might be needed by tests
    getResourceIdentifier(): string {
      return `consume-shared-fallback:${this.fallbackRequest}:${this.requiredVersion}`;
    }
  }

  return {
    MockConsumeSharedDependency,
    MockConsumeSharedFallbackDependency,
  };
};

/**
 * Create a mock ConsumeSharedModule with the necessary properties and methods
 */
export const createMockConsumeSharedModule = () => {
  const mockConsumeSharedModule = jest.fn().mockImplementation((options) => {
    return {
      shareScope: options.shareScope,
      name: options.name || 'default-name',
      request: options.request || 'default-request',
      eager: options.eager || false,
      strictVersion: options.strictVersion || false,
      singleton: options.singleton || false,
      requiredVersion: options.requiredVersion || '1.0.0',
      getVersion: jest.fn().mockReturnValue(options.requiredVersion || '1.0.0'),
      options,
      // Add necessary methods expected by the plugin
      build: jest.fn().mockImplementation((context, _c, _r, _f, callback) => {
        callback && callback();
      }),
    };
  });

  return mockConsumeSharedModule;
};

/**
 * Create a mock runtime modules for sharing
 */
export const createMockRuntimeModules = () => {
  const mockConsumeSharedRuntimeModule = jest.fn().mockImplementation(() => ({
    constructor: jest.fn(),
    name: 'consume-shared',
  }));

  const mockShareRuntimeModule = jest.fn().mockImplementation(() => ({
    constructor: jest.fn(),
    name: 'share',
  }));

  return {
    mockConsumeSharedRuntimeModule,
    mockShareRuntimeModule,
  };
};

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
  };

  // Cast to any to allow flexible property addition
  const mockCompilation: any = {
    runtimeTemplate: mockRuntimeTemplate,
    moduleGraph: mockModuleGraph,
    chunkGraph: mockChunkGraph,
    dependencyFactories: new Map(),
    addRuntimeModule: jest.fn(),
    contextDependencies: { addAll: jest.fn() },
    fileDependencies: { addAll: jest.fn() },
    missingDependencies: { addAll: jest.fn() },
    warnings: [],
    errors: [],
    hooks: {
      additionalTreeRuntimeRequirements: { tap: jest.fn() },
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
  };

  return {
    mockCompilation,
    mockRuntimeTemplate,
    mockChunkGraph,
    mockModuleGraph,
  };
};

/**
 * Create a tapable hook mock with callback storage
 */
export const createTapableHook = (name: string) => {
  const hook = {
    name,
    tap: jest.fn().mockImplementation((pluginName, callback) => {
      hook.callback = callback;
    }),
    tapPromise: jest.fn(),
    call: jest.fn(),
    promise: jest.fn(),
    callback: null,
  };
  return hook;
};

/**
 * Create a mock compiler with hooks and plugins for testing webpack plugins
 */
export const createMockCompiler = () => {
  // Define the compiler with a more flexible type to allow property addition
  const compiler: any = {
    hooks: {
      thisCompilation: createTapableHook('thisCompilation'),
      compilation: createTapableHook('compilation'),
      finishMake: createTapableHook('finishMake'),
    },
    context: '/mock-context',
  };

  return compiler;
};

/**
 * Create a specialized mock compiler for testing sharing plugins
 */
export const createMockSharingCompiler = () => {
  const compiler = createMockCompiler();

  // Add webpack property with runtime globals needed by sharing plugins
  compiler.webpack = {
    RuntimeGlobals: {
      ensureChunkHandlers: 'ensureChunkHandlers',
      module: 'module',
      moduleFactoriesAddOnly: 'moduleFactoriesAddOnly',
      hasOwnProperty: 'hasOwnProperty',
      initializeSharing: 'initializeSharing',
      shareScopeMap: 'shareScopeMap',
      __webpack_share_scopes__: '__webpack_share_scopes__',
    },
    runtime: {
      getRuntime: jest.fn().mockReturnValue('webpack'),
    },
  };

  return compiler;
};

/**
 * Create extended mock compiler with webpack features needed for federation plugins
 */
export const createMockFederationCompiler = () => {
  const compiler: any = createMockCompiler();

  // Add options required by federation plugins
  compiler.options = {
    plugins: [],
    context: '/mock-context',
    output: {
      uniqueName: 'test-unique-name',
    },
  };

  // Create NormalModuleReplacementPlugin mock
  class MockNormalModuleReplacementPlugin {
    apply = jest.fn();
    constructor() {
      // Empty constructor to avoid linter warnings
    }
  }

  // Add webpack property with required plugins and globals
  compiler.webpack = {
    NormalModuleReplacementPlugin: MockNormalModuleReplacementPlugin,
    RuntimeGlobals: {
      ensureChunkHandlers: 'ensureChunkHandlers',
      module: 'module',
      moduleFactoriesAddOnly: 'moduleFactoriesAddOnly',
      hasOwnProperty: 'hasOwnProperty',
      initializeSharing: 'initializeSharing',
      shareScopeMap: 'shareScopeMap',
      __webpack_share_scopes__: '__webpack_share_scopes__',
    },
    runtime: {
      getRuntime: jest.fn().mockReturnValue('webpack'),
    },
    Dependency: class MockDependency {},
    javascript: {
      JavascriptModulesPlugin: class {
        constructor() {
          // Empty constructor to avoid linter warnings
        }
        getCompilationHooks() {
          return {
            renderRequire: {
              tap: jest.fn(),
            },
          };
        }
      },
    },
  };

  return compiler;
};

/**
 * Helper function to set up a standard test environment for sharing plugins
 */
export const createSharingTestEnvironment = () => {
  // Create a compiler with the necessary hooks
  const compiler = createMockSharingCompiler();

  // Add required compiler properties
  compiler.context = '/mock-context';
  compiler.options = {
    context: '/mock-context',
    output: {
      path: '/mock-output-path',
      publicPath: 'auto',
      uniqueName: 'test-app',
    },
  };

  // Create a compilation with needed functionality
  const { mockCompilation } = createMockCompilation();

  // Add compilation properties
  mockCompilation.compiler = compiler;
  mockCompilation.options = compiler.options;
  mockCompilation.context = compiler.context;
  mockCompilation.resolverFactory = {
    get: jest.fn().mockReturnValue({
      resolve: jest.fn().mockImplementation((context, request, callback) => {
        // Mock successful resolution
        callback(null, '/resolved/' + request);
      }),
    }),
  };

  // Set up additionalTreeRuntimeRequirements hook with callback storage
  let runtimeRequirementsCallback: any = null;
  mockCompilation.hooks.additionalTreeRuntimeRequirements = {
    tap: jest.fn().mockImplementation((name, callback) => {
      runtimeRequirementsCallback = callback;
    }),
  };

  // Create a normal module factory with all required hooks
  const normalModuleFactory = {
    hooks: {
      factorize: {
        tapPromise: jest.fn(),
      },
      createModule: {
        tapPromise: jest.fn(),
      },
    },
  };

  // Set up the compilation hook callback to invoke with our mocks
  compiler.hooks.compilation.tap.mockImplementation((name, callback) => {
    compiler.hooks.compilation.callback = callback;
  });

  compiler.hooks.thisCompilation.tap.mockImplementation((name, callback) => {
    compiler.hooks.thisCompilation.callback = callback;
  });

  // Function to simulate the compilation phase
  const simulateCompilation = () => {
    if (compiler.hooks.thisCompilation.callback) {
      compiler.hooks.thisCompilation.callback(mockCompilation, {
        normalModuleFactory,
      });
    }

    if (compiler.hooks.compilation.callback) {
      compiler.hooks.compilation.callback(mockCompilation, {
        normalModuleFactory,
      });
    }
  };

  // Function to simulate runtime requirements callback
  const simulateRuntimeRequirements = (chunk = { id: 'test-chunk' }) => {
    // Create runtime requirements Set
    const runtimeRequirements = new Set();

    if (runtimeRequirementsCallback) {
      // Call the callback with chunk and requirements
      runtimeRequirementsCallback(chunk, runtimeRequirements);

      // Add the share scopes requirement if not already added
      // This is needed for testing because ConsumeSharedPlugin checks for this constant
      if (!runtimeRequirements.has('__webpack_share_scopes__')) {
        runtimeRequirements.add('__webpack_share_scopes__');
      }
    }

    return runtimeRequirements;
  };

  return {
    compiler,
    mockCompilation,
    normalModuleFactory,
    runtimeRequirementsCallback,
    simulateCompilation,
    simulateRuntimeRequirements,
  };
};

/**
 * Mock classes for federation runtime plugins
 */
export const createMockFederationRuntime = () => {
  // Mock FederationRuntimePlugin
  const MockFederationRuntimePlugin = jest.fn().mockImplementation(() => ({
    apply: jest.fn(),
  }));

  return {
    MockFederationRuntimePlugin,
  };
};

/**
 * Different share scope configurations for testing
 */
export const shareScopes = {
  string: 'default',
  array: ['default', 'custom'],
  empty: '',
  arrayWithMultiple: ['default', 'custom', 'extra'],
};

/**
 * Various test module options configurations
 */
export const testModuleOptions = {
  basic: {
    shareScope: 'default',
    shareKey: 'react',
    version: '17.0.2',
    requiredVersion: '^17.0.0',
    singleton: true,
    eager: false,
    strictVersion: false,
    packageName: 'react',
  },
  withArrayShareScope: {
    shareScope: ['default', 'custom'],
    shareKey: 'react',
    version: '17.0.2',
    requiredVersion: '^17.0.0',
    singleton: true,
    eager: false,
    strictVersion: false,
    packageName: 'react',
  },
  withLayer: {
    shareScope: 'default',
    shareKey: 'react',
    version: '17.0.2',
    layer: 'test-layer',
    singleton: true,
    eager: false,
    requiredVersion: '^17.0.0',
    strictVersion: false,
    packageName: 'react',
  },
  eager: {
    shareScope: 'default',
    shareKey: 'react',
    version: '17.0.2',
    singleton: false,
    eager: true,
    strictVersion: true,
    requiredVersion: '^17.0.0',
    packageName: 'react',
  },
};

// Export the createWebpackMock function from container utils to ensure consistency
export const createWebpackMock = createContainerWebpackMock;
