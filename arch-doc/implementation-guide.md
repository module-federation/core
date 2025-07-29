# Module Federation Implementation Guide

This guide provides step-by-step instructions for bundler teams to implement Module Federation in their build tools. It covers the essential components, integration points, and best practices.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Implementation Steps](#implementation-steps)
- [Core Components Implementation](#core-components-implementation)
- [Runtime Integration](#runtime-integration)
- [Testing and Validation](#testing-and-validation)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before implementing Module Federation, ensure your bundler supports:

### JSON Schema Validation

Module Federation uses JSON Schema validation instead of custom normalization functions. Set up validation using:

```typescript
// utils.ts - Schema Validation Setup
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const memoize = require(
  normalizeWebpackPath('webpack/lib/util/memoize')
) as typeof import('webpack/lib/util/memoize');

const getValidate = memoize(() => require('schema-utils').validate);

export const createSchemaValidation = (
  check: ((value: any) => boolean) | undefined,
  getSchema: () => any,
  options: any,
) => {
  getSchema = memoize(getSchema);
  return (value) => {
    if (check && !check(value)) {
      getValidate()(getSchema(), value, options);
    }
  };
};
```

### Required Bundler Capabilities

```mermaid
graph LR
    subgraph "Required Capabilities"
        Plugins[Plugin System]
        Hooks[Hook System]
        Async[Async Module Loading]
        External[External Modules]
        Runtime[Runtime Code Injection]
        ModuleTypes[Custom Module Types]
    end
    
    subgraph "Your Bundler"
        YourBundler[Bundler Core]
    end
    
    YourBundler --> Plugins
    YourBundler --> Hooks
    YourBundler --> Async
    YourBundler --> External
    YourBundler --> Runtime
    YourBundler --> ModuleTypes
    
    style YourBundler fill:#f9f,stroke:#333,stroke-width:2px
```

### Minimum Requirements Checklist

- [ ] **Plugin System**: Ability to add plugins that modify compilation
- [ ] **Compilation Hooks**: Access to module resolution and creation
- [ ] **Module Factory**: Ability to create custom module types
- [ ] **Runtime Generation**: Ability to inject runtime code
- [ ] **Async Loading**: Support for dynamic imports
- [ ] **External References**: Support for external module references

## Implementation Steps

### Step 1: Create the Main Plugin

```typescript
// module-federation-plugin.ts
import { 
  moduleFederationPlugin
} from '@module-federation/sdk';
import { createSchemaValidation } from './utils';

// Create schema validation using actual webpack pattern
const validate = createSchemaValidation(
  require('./schemas/container/ModuleFederationPlugin.check.js').validate,
  () => require('./schemas/container/ModuleFederationPlugin').default,
  {
    name: 'Module Federation Plugin',
    baseDataPath: 'options',
  },
);

export class ModuleFederationPlugin {
  private options: moduleFederationPlugin.ModuleFederationPluginOptions;
  
  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    // Validate options using JSON schema validation
    validate(options);
    this.options = options;
  }
  
  apply(compiler: YourBundlerCompiler) {
    // Step 1: Apply RemoteEntryPlugin first (must be before ModuleFederationPlugin)
    new RemoteEntryPlugin(this.options).apply(compiler);
    
    // Step 2: Apply FederationModulesPlugin to set up hooks
    new FederationModulesPlugin().apply(compiler);
    
    // Step 3: Apply FederationRuntimePlugin
    new FederationRuntimePlugin(this.options).apply(compiler);
    
    // Step 4: Apply feature plugins based on configuration after other plugins
    compiler.hooks.afterPlugins.tap('ModuleFederation', () => {
      if (this.options.exposes) {
        new ContainerPlugin(this.options).apply(compiler);
      }
      
      if (this.options.remotes) {
        new ContainerReferencePlugin(this.options).apply(compiler);
      }
      
      if (this.options.shared) {
        new SharePlugin(this.options).apply(compiler);
      }
    });
  }
}
```

### Step 2: Implement Container Plugin

Container Plugin with patchChunkSplit functionality:

```typescript
// container-plugin.ts
export class ContainerPlugin {
  // Static method for patching chunk splitting
  static patchChunkSplit(compiler: YourBundlerCompiler, containerName: string) {
    // Patches webpack's chunk splitting to work with federation
    // This is called automatically when useContainerPlugin is true
  }
  
  apply(compiler: YourBundlerCompiler) {
    compiler.hooks.make.tapAsync('ContainerPlugin', async (compilation) => {
      // Create container entry dependency
      const dep = new ContainerEntryDependency(
        this.options.name,
        this.options.exposes,
        this.options.shareScope
      );
      
      // Use addInclude instead of addEntry for proper dependency handling
      compilation.addInclude(
        compiler.context,
        dep,
        { name: this.options.name },
        (err, module) => {
          if (err) throw err;
          // Handle successful container creation
        }
      );
    });
    
    // Register module factories with proper dependency registration
    compiler.hooks.compilation.tap('ContainerPlugin', (compilation) => {
      compilation.dependencyFactories.set(
        ContainerEntryDependency,
        compilation.normalModuleFactory
      );
      compilation.dependencyTemplates.set(
        ContainerEntryDependency,
        new ContainerEntryDependency.Template()
      );
    });
  }
}
```

### Step 3: Implement Share Plugin

```mermaid
sequenceDiagram
    participant SharePlugin
    participant ProvideShared
    participant ConsumeShared
    participant Compilation
    participant ModuleFactory
    
    SharePlugin->>ProvideShared: Create & Apply
    SharePlugin->>ConsumeShared: Create & Apply
    
    Note over ConsumeShared: Intercepts BEFORE module creation
    ConsumeShared->>ModuleFactory: Hook factorize
    
    Note over ProvideShared: Intercepts AFTER module creation
    ProvideShared->>ModuleFactory: Hook module
```

```typescript
// share-plugin.ts
export class SharePlugin {
  apply(compiler: YourBundlerCompiler) {
    const providedModules = this.normalizeProvided(this.options.shared);
    const consumedModules = this.normalizeConsumed(this.options.shared);
    
    new ProvideSharedPlugin({
      provides: providedModules,
      shareScope: this.options.shareScope
    }).apply(compiler);
    
    new ConsumeSharedPlugin({
      consumes: consumedModules,
      shareScope: this.options.shareScope
    }).apply(compiler);
  }
}

// consume-shared-plugin.ts
export class ConsumeSharedPlugin {
  apply(compiler: YourBundlerCompiler) {
    compiler.hooks.compilation.tap('ConsumeSharedPlugin', 
      (compilation, { normalModuleFactory }) => {
        
        // CRITICAL: Hook BEFORE module creation
        normalModuleFactory.hooks.factorize.tapPromise(
          'ConsumeSharedPlugin', 
          async (resolveData) => {
            const request = resolveData.request;
            if (this.isSharedModule(request)) {
              // Return ConsumeSharedModule instead of normal module
              return new ConsumeSharedModule({
                shareKey: this.getShareKey(request),
                shareScope: this.options.shareScope,
                requiredVersion: this.getRequiredVersion(request),
                strictVersion: this.getStrictVersion(request),
                singleton: this.getSingleton(request),
                fallback: this.getFallback(request)
              });
            }
            return undefined; // Continue normal flow
          }
        );
      }
    );
  }
}
```

### Step 4: Implement Container Reference Plugin

```typescript
// container-reference-plugin.ts
export class ContainerReferencePlugin {
  apply(compiler: YourBundlerCompiler) {
    // Convert remotes to external references
    const externals = this.remoteToExternals(this.options.remotes);
    
    // Use your bundler's external plugin
    new YourExternalsPlugin({
      type: this.options.remoteType || 'script',
      externals
    }).apply(compiler);
    
    // Add remote loading runtime
    compiler.hooks.compilation.tap('ContainerReferencePlugin', 
      (compilation) => {
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.loadScript)
          .tap('ContainerReferencePlugin', (chunk) => {
            compilation.addRuntimeModule(chunk, new RemoteLoadingRuntime());
          });
      }
    );
  }
  
  private remoteToExternals(remotes: Record<string, RemoteConfig>) {
    const externals: Record<string, External> = {};
    
    for (const [name, config] of Object.entries(remotes)) {
      externals[name] = {
        [config.externalType]: config.external
      };
    }
    
    return externals;
  }
}
```

## All Module Federation Plugins

Module Federation uses these plugins (7 total):

1. **RemoteEntryPlugin** - Creates remote entry points for containers
2. **FederationModulesPlugin** - Sets up compilation hooks for federation
3. **FederationRuntimePlugin** - Injects federation runtime code  
4. **ContainerPlugin** - Creates container entries for exposed modules
5. **ContainerReferencePlugin** - Handles remote container references
6. **SharePlugin** - Manages shared dependencies (uses ProvideSharedPlugin + ConsumeSharedPlugin)
7. **Additional Plugins**:
   - **EmbedFederationRuntimePlugin** - Embeds runtime in compilation
   - **HoistContainerReferencesPlugin** - Optimizes container references
   - **StartupChunkDependenciesPlugin** - Handles async startup dependencies

### Missing Plugin Implementations

```typescript
// remote-entry-plugin.ts
export class RemoteEntryPlugin {
  apply(compiler: YourBundlerCompiler) {
    // Creates remote entry points and manages container loading
    // Must be applied BEFORE ModuleFederationPlugin
  }
}

// embed-federation-runtime-plugin.ts  
export class EmbedFederationRuntimePlugin {
  apply(compiler: YourBundlerCompiler) {
    // Embeds federation runtime directly in the bundle
  }
}

// hoist-container-references-plugin.ts
export class HoistContainerReferencesPlugin {
  apply(compiler: YourBundlerCompiler) {
    // Optimizes container reference loading
  }
}

// startup-chunk-dependencies-plugin.ts
export class StartupChunkDependenciesPlugin {
  apply(compiler: YourBundlerCompiler) {
    // Handles async startup for containers
    // Used when experiments.asyncStartup is enabled
  }
}
```

## Core Components Implementation

### Container Entry Module

```mermaid
flowchart TD
    subgraph "Container Entry Structure"
        Entry[Container Entry]
        Init[init method]
        Get[get method]
        ModuleMap[Module Map]
        ShareInit[Share Scope Init]
    end
    
    Entry --> Init
    Entry --> Get
    Entry --> ModuleMap
    Init --> ShareInit
    Get --> ModuleMap
    
    style Entry fill:#f9f,stroke:#333,stroke-width:2px
```

```typescript
// container-entry-module.ts
export class ContainerEntryModule extends Module {
  constructor(
    private name: string,
    private exposes: Record<string, ExposeConfig>,
    private shareScope: string
  ) {
    super('container-entry');
  }
  
  getSource() {
    const { RuntimeGlobals } = require(
      normalizeWebpackPath('webpack')
    ) as typeof import('webpack');
    
    return `
      var moduleMap = {
        ${Object.entries(this.exposes)
          .map(([key, config]) => `
            ${JSON.stringify(key)}: () => {
              return ${RuntimeGlobals.ensureChunk}(${JSON.stringify(config.chunkName)})
                .then(() => () => ${RuntimeGlobals.require}(${JSON.stringify(config.import)}));
            }
          `)
          .join(',\n')}
      };
      
      var get = (module, getScope) => {
        ${RuntimeGlobals.currentRemoteGetScope} = getScope;
        getScope = Object.prototype.hasOwnProperty.call(moduleMap, module)
          ? moduleMap[module]()
          : Promise.resolve().then(() => {
              throw new ContainerModuleNotFoundError(module);
            });
        ${RuntimeGlobals.currentRemoteGetScope} = undefined;
        return getScope;
      };
      
      var init = (shareScope, initScope) => {
        if (!${RuntimeGlobals.shareScopeMap}) return;
        var name = ${JSON.stringify(this.shareScope)};
        var oldScope = ${RuntimeGlobals.shareScopeMap}[name];
        if (oldScope && oldScope !== shareScope) 
          throw new ContainerInitializationError('Container initialization failed');
        ${RuntimeGlobals.shareScopeMap}[name] = shareScope;
        return ${RuntimeGlobals.initializeSharing}(name, initScope);
      };
      
      // Export container interface
      ${RuntimeGlobals.definePropertyGetters}(exports, {
        get: () => get,
        init: () => init
      });
    `;
  }
}
```

### Consume Shared Module

```typescript
// consume-shared-module.ts
const { ModuleDependency } = require(
  normalizeWebpackPath('webpack/lib/dependencies/ModuleDependency')
) as typeof import('webpack/lib/dependencies/ModuleDependency');

const { WebpackError } = require(
  normalizeWebpackPath('webpack')
) as typeof import('webpack');

export class ConsumeSharedModule extends Module {
  constructor(private options: ConsumeSharedOptions) {
    super('consume-shared', null);
    this.options = options;
  }
  
  identifier() {
    return `consume-shared|${this.options.shareKey}|${this.options.shareScope}`;
  }
  
  readableIdentifier() {
    return `consume shared module (${this.options.shareKey})`;
  }
  
  build(options, compilation, resolver, fs, callback) {
    this.buildMeta = {};
    this.buildInfo = {
      cacheable: true,
      strict: true,
      exportsType: 'dynamic'
    };
    callback();
  }
  
  codeGeneration({ runtimeTemplate, chunkGraph, moduleGraph }) {
    const sources = new Map();
    const runtimeRequirements = new Set();
    
    runtimeRequirements.add('__webpack_require__');
    runtimeRequirements.add('__webpack_require__.federation');
    
    const source = `
      module.exports = __webpack_require__.federation.bundlerRuntime.consumes({
        shareKey: ${JSON.stringify(this.options.shareKey)},
        shareScope: ${JSON.stringify(this.options.shareScope)},
        requiredVersion: ${JSON.stringify(this.options.requiredVersion)},
        singleton: ${this.options.singleton},
        strictVersion: ${this.options.strictVersion},
        fallback: ${this.options.fallback ? 
          `() => __webpack_require__(${JSON.stringify(this.options.fallback)})` : 
          'undefined'
        }
      });
    `;
    
    sources.set('javascript', new RawSource(source));
    
    return { sources, runtimeRequirements };
  }
}
```

### Provide Shared Module

```typescript
// provide-shared-module.ts
export class ProvideSharedModule extends Module {
  constructor(
    private request: string,
    private options: ProvideSharedOptions,
    private resolvedModule: string
  ) {
    super('provide-shared');
  }
  
  getSource() {
    return `
      const { RuntimeGlobals } = require(
        normalizeWebpackPath('webpack')
      ) as typeof import('webpack');
      
      var versionCheckCallback = (version, requiredVersion) => {
        return ${RuntimeGlobals.require}.federation.bundlerRuntime.satisfies(
          version, 
          requiredVersion
        );
      };
      
      var getModule = ${this.options.eager ? 
        `() => ${RuntimeGlobals.require}(${JSON.stringify(this.resolvedModule)})` :
        `() => ${RuntimeGlobals.ensureChunk}(${JSON.stringify(this.options.chunkName)})
          .then(() => () => ${RuntimeGlobals.require}(${JSON.stringify(this.resolvedModule)}))`
      };
      
      var moduleToShare = {
        get: getModule,
        version: ${JSON.stringify(this.options.version)},
        scope: [${JSON.stringify(this.options.shareScope)}],
        shareConfig: {
          eager: ${this.options.eager},
          requiredVersion: ${JSON.stringify(this.options.requiredVersion)},
          strictVersion: ${this.options.strictVersion},
          singleton: ${this.options.singleton},
          version: ${JSON.stringify(this.options.version)}
        }
      };
      
      ${RuntimeGlobals.shareScopeMap}[${JSON.stringify(this.options.shareScope)}][${JSON.stringify(this.options.shareKey)}] = moduleToShare;
    `;
  }
}
```

## Runtime Integration

### Federation Runtime Module

```mermaid
graph TB
    subgraph "Runtime Components"
        FedRuntime[Federation Runtime]
        BundlerBridge[Bundler Bridge]
        CoreRuntime[Core Runtime]
        Plugins[Runtime Plugins]
    end
    
    subgraph "Generated Code"
        InitCode[Initialization]
        FedObject[Federation Object]
        ShareScope[Share Scope]
        Methods[Runtime Methods]
    end
    
    FedRuntime --> InitCode
    FedRuntime --> FedObject
    BundlerBridge --> Methods
    CoreRuntime --> ShareScope
    Plugins --> CoreRuntime
    
    style FedRuntime fill:#bbf,stroke:#333,stroke-width:2px
```

```typescript
// federation-runtime-plugin.ts  
export class FederationRuntimePlugin {
  private entryFilePath: string = '';
  
  apply(compiler: YourBundlerCompiler) {
    // Set up runtime entry - can be virtual or file-based
    this.entryFilePath = this.getFilePath(compiler);
    
    // Support both virtual and file-based runtime entries
    if (!this.options?.virtualRuntimeEntry) {
      this.ensureFile(compiler);
    }
    
    // Register runtime dependency
    this.prependEntry(compiler);
    
    // Inject runtime module
    this.injectRuntime(compiler);
  }
  
  getFilePath(compiler: YourBundlerCompiler): string {
    if (this.options?.virtualRuntimeEntry) {
      // Use base64 encoded virtual entry
      return `data:text/javascript;charset=utf-8;base64,${btoa(
        this.getTemplate(compiler, this.options)
      )}`;
    } else {
      // Create physical file in temp directory
      const hash = createHash(this.getTemplate(compiler, this.options));
      return path.join(TEMP_DIR, `entry.${hash}.js`);
    }
  }
  
  prependEntry(compiler: YourBundlerCompiler) {
    compiler.hooks.thisCompilation.tap(
      'FederationRuntimePlugin',
      (compilation) => {
        // Register federation runtime dependency factory
        compilation.dependencyFactories.set(
          FederationRuntimeDependency,
          compilation.normalModuleFactory
        );
        
        compilation.dependencyTemplates.set(
          FederationRuntimeDependency,
          new ModuleDependency.Template()
        );
      }
    );
    
    compiler.hooks.make.tapAsync(
      'FederationRuntimePlugin',
      (compilation, callback) => {
        const dependency = new FederationRuntimeDependency(this.entryFilePath);
        
        // Use addInclude for proper dependency handling
        compilation.addInclude(
          compiler.context,
          dependency,
          { name: undefined },
          (err, module) => {
            if (err) return callback(err);
            callback();
          }
        );
      }
    );
  }
}

// federation-runtime-module.ts
const { RuntimeModule, RuntimeGlobals, Template } = require(
  normalizeWebpackPath('webpack')
) as typeof import('webpack');

export class FederationRuntimeModule extends RuntimeModule {
  constructor(
    runtimeRequirements: ReadonlySet<string>,
    containerName: string,
    initOptions: any
  ) {
    super('federation runtime', RuntimeModule.STAGE_NORMAL - 1);
    this.runtimeRequirements = runtimeRequirements;
    this.containerName = containerName;
    this.initOptions = initOptions;
  }
  
  generate() {
    const federationGlobal = getFederationGlobalScope(RuntimeGlobals);
    
    return Template.asString([
      `// Federation Runtime Module`,
      `var ${federationGlobal} = ${federationGlobal} || {};`,
      `${federationGlobal}.runtime = __bundler_require__("${RUNTIME_PATH}");`,
      `${federationGlobal}.initOptions = ${JSON.stringify(this.initOptions)};`,
      
      // Initialize federation runtime
      `if (!${federationGlobal}.instance) {`,
      Template.indent([
        `${federationGlobal}.instance = ${federationGlobal}.runtime.init(${federationGlobal}.initOptions);`
      ]),
      `}`,
      
      // Attach to webpack require
      `__bundler_require__.federation = ${federationGlobal};`,
      
      // Add share scope attachment
      `if (${federationGlobal}.attachShareScopeMap) {`,
      Template.indent([
        `${federationGlobal}.attachShareScopeMap(__bundler_require__);`
      ]),
      `}`,
    ]);
  }
}
```

### Bundler Runtime Bridge Implementation

```typescript
// bundler-runtime.ts - Based on actual webpack-bundler-runtime structure
const federation = {
  runtime, // Core runtime from @module-federation/runtime
  instance: undefined,
  initOptions: undefined,
  bundlerRuntime: {
    remotes,        // Remote loading utilities
    consumes,       // Shared consumption utilities  
    I: initializeSharing,  // Share scope initialization
    S: {},          // Share scopes object
    installInitialConsumes, // Install initial shared modules
    initContainerEntry,     // Container entry initialization
  },
  attachShareScopeMap,      // Attach share scope to webpack require
  bundlerRuntimeOptions: {},
};

// Individual bundler runtime functions
const remotes = async (options) => {
  // Implementation for loading remote modules
  // Handles container loading, initialization, and module retrieval
};

const consumes = async (options) => {
  // Implementation for consuming shared modules
  // Handles share scope lookup, version resolution, fallbacks
};

const initializeSharing = async (scopeName = 'default') => {
  // Implementation for share scope initialization
};

const installInitialConsumes = () => {
  // Install eager shared modules at startup
};

const initContainerEntry = (shareScope, initScope) => {
  // Initialize container entry points
};

const attachShareScopeMap = (webpackRequire) => {
  // Attach share scopes to webpack's require function
  webpackRequire.S = federation.bundlerRuntime.S;
  webpackRequire.I = federation.bundlerRuntime.I;
};

export default federation;
```

## Testing and Validation

### Test Suite Structure

```mermaid
graph TB
    subgraph "Test Categories"
        Unit[Unit Tests]
        Integration[Integration Tests]
        E2E[End-to-End Tests]
        Perf[Performance Tests]
    end
    
    subgraph "Test Scenarios"
        Basic[Basic Federation]
        Shared[Shared Modules]
        Version[Version Conflicts]
        Dynamic[Dynamic Loading]
        Errors[Error Handling]
    end
    
    Unit --> Basic
    Integration --> Shared
    Integration --> Version
    E2E --> Dynamic
    E2E --> Errors
    Perf --> Dynamic
```

### Basic Federation Test

```typescript
// __tests__/basic-federation.test.ts
describe('Basic Module Federation', () => {
  it('should expose modules correctly', async () => {
    const config = {
      name: 'testApp',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button.js'
      }
    };
    
    const result = await build(config);
    
    // Check container entry exists
    expect(result.assets).toContain('remoteEntry.js');
    
    // Check container has correct interface
    const container = await loadContainer(result.path, 'testApp');
    expect(container).toHaveProperty('init');
    expect(container).toHaveProperty('get');
    
    // Check exposed module can be loaded
    await container.init({});
    const moduleFactory = await container.get('./Button');
    const module = moduleFactory();
    expect(module).toBeDefined();
  });
  
  it('should consume remote modules', async () => {
    const hostConfig = {
      name: 'host',
      remotes: {
        remote: 'remote@http://localhost:3001/remoteEntry.js'
      }
    };
    
    // Mock remote loading
    mockRemote('remote', {
      './Button': () => ({ default: 'Button Component' })
    });
    
    const result = await build(hostConfig);
    const app = await runApp(result);
    
    // Test remote loading
    const Button = await app.import('remote/Button');
    expect(Button.default).toBe('Button Component');
  });
});
```

### Shared Module Test

```typescript
describe('Shared Modules', () => {
  it('should share singleton modules', async () => {
    const configs = [
      {
        name: 'app1',
        shared: {
          react: { singleton: true, version: '18.0.0' }
        }
      },
      {
        name: 'app2',
        shared: {
          react: { singleton: true, version: '18.0.0' }
        }
      }
    ];
    
    const [app1, app2] = await Promise.all(configs.map(build));
    
    // Load both apps
    const runtime1 = await loadApp(app1);
    const runtime2 = await loadApp(app2);
    
    // Get React from both
    const react1 = await runtime1.loadShared('react');
    const react2 = await runtime2.loadShared('react');
    
    // Should be the same instance
    expect(react1).toBe(react2);
  });
  
  it('should handle version conflicts', async () => {
    const shareScope = createShareScope();
    
    // Register different versions
    shareScope.register('react', '17.0.0', getReact17);
    shareScope.register('react', '18.0.0', getReact18);
    
    // Request compatible version
    const react17 = await shareScope.get('react', '^17.0.0');
    expect(react17.version).toBe('17.0.0');
    
    const react18 = await shareScope.get('react', '^18.0.0');
    expect(react18.version).toBe('18.0.0');
    
    // Request incompatible version
    await expect(
      shareScope.get('react', '^16.0.0')
    ).rejects.toThrow('No compatible version');
  });
});
```

### Validation Checklist

- [ ] **Container Entry**: Verify `get` and `init` methods work correctly
- [ ] **Remote Loading**: Test dynamic remote loading
- [ ] **Share Scope**: Validate version negotiation
- [ ] **Error Handling**: Test missing modules, version conflicts
- [ ] **Performance**: Measure loading times, bundle sizes
- [ ] **Hot Reload**: Ensure HMR works with federation

## Common Patterns

### Pattern 1: Bidirectional Hosts

```mermaid
graph LR
    subgraph "App A"
        ExposeA[Exposes: Header]
        ConsumeA[Consumes: Footer]
    end
    
    subgraph "App B"
        ExposeB[Exposes: Footer]
        ConsumeB[Consumes: Header]
    end
    
    ExposeA -->|remote| ConsumeB
    ExposeB -->|remote| ConsumeA
    
    style ExposeA fill:#9f9
    style ExposeB fill:#9f9
    style ConsumeA fill:#f99
    style ConsumeB fill:#f99
```

```typescript
// App A config
{
  name: 'appA',
  exposes: {
    './Header': './src/Header'
  },
  remotes: {
    appB: 'appB@http://localhost:3002/remoteEntry.js'
  }
}

// App B config
{
  name: 'appB',
  exposes: {
    './Footer': './src/Footer'
  },
  remotes: {
    appA: 'appA@http://localhost:3001/remoteEntry.js'
  }
}
```

### Pattern 2: Shared Libraries

```typescript
// Shared library configuration
{
  name: 'sharedLib',
  exposes: {
    './utils': './src/utils',
    './components': './src/components',
    './hooks': './src/hooks'
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true }
  }
}

// Consumer configuration
{
  name: 'consumer',
  remotes: {
    lib: 'sharedLib@http://cdn.example.com/remoteEntry.js'
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true }
  }
}
```

### Pattern 3: Dynamic Remote Loading

```typescript
// Dynamic remote loading utility
async function loadRemoteComponent(
  remoteName: string,
  remoteUrl: string,
  modulePath: string
) {
  // Register remote dynamically
  await __bundler_require__.federation.registerRemote({
    name: remoteName,
    entry: remoteUrl
  });
  
  // Load component
  const module = await __bundler_require__.federation.loadRemote(
    `${remoteName}/${modulePath}`
  );
  
  return module;
}

// Usage
const Button = await loadRemoteComponent(
  'dynamicRemote',
  'https://cdn.example.com/remoteEntry.js',
  './Button'
);
```

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Module Not Found

```mermaid
flowchart TD
    Issue[Module Not Found Error]
    Check1{Container Loaded?}
    Check2{Module Exposed?}
    Check3{Path Correct?}
    Solution1[Load Container First]
    Solution2[Check Exposes Config]
    Solution3[Fix Module Path]
    
    Issue --> Check1
    Check1 -->|No| Solution1
    Check1 -->|Yes| Check2
    Check2 -->|No| Solution2
    Check2 -->|Yes| Check3
    Check3 -->|No| Solution3
```

**Solution:**
```typescript
// Debug helper
function debugModuleFederation() {
  console.log('Available containers:', Object.keys(window));
  console.log('Share scopes:', __bundler_require__.S);
  
  // Check specific container
  const container = window['myApp'];
  if (container) {
    console.log('Container methods:', Object.keys(container));
  }
}
```

#### Issue 2: Version Conflicts

**Symptoms:**
- Singleton violation errors
- Incompatible version errors
- Multiple React instances

**Solution:**
```typescript
// Version debugging
function debugVersions() {
  const shareScope = __bundler_require__.S.default;
  
  Object.entries(shareScope).forEach(([pkg, versions]) => {
    console.log(`Package: ${pkg}`);
    Object.entries(versions).forEach(([version, info]) => {
      console.log(`  Version: ${version}, Loaded: ${info.loaded}`);
    });
  });
}

// Strict singleton configuration
{
  shared: {
    react: {
      singleton: true,
      strictVersion: true,
      requiredVersion: '18.0.0'
    }
  }
}
```

#### Issue 3: Runtime Errors

**Debug Steps:**
1. Check console for federation errors
2. Verify runtime is loaded
3. Check network tab for failed requests
4. Validate configuration

```typescript
// Runtime error handler with webpack error classes
const { WebpackError } = require(
  normalizeWebpackPath('webpack')
) as typeof import('webpack');

class FederationRuntimeError extends WebpackError {
  constructor(message: string, details?: any) {
    super(message);
    this.name = 'FederationRuntimeError';
    this.details = details;
  }
}

class SharedModuleNotFoundError extends WebpackError {
  constructor(shareKey: string, shareScope: string) {
    super(`Shared module '${shareKey}' not found in scope '${shareScope}'`);
    this.name = 'SharedModuleNotFoundError';
  }
}

class ContainerNotFoundError extends WebpackError {
  constructor(containerName: string) {
    super(`Container '${containerName}' not found or not initialized`);
    this.name = 'ContainerNotFoundError';
  }
}

// Runtime error handler
window.addEventListener('error', (event) => {
  if (event.error?.message?.includes('federation')) {
    console.error('Federation Error:', {
      message: event.error.message,
      stack: event.error.stack,
      federationState: {
        containers: Object.keys(window).filter(k => 
          window[k]?.get && window[k]?.init
        ),
        shareScopes: Object.keys(__webpack_require__.S || {})
      }
    });
  }
});
```

### Performance Optimization Tips

1. **Preload Critical Remotes**
```typescript
// Preload remote entries
const preloadRemotes = ['app1', 'app2'].map(name => 
  fetch(`http://localhost:${3000 + i}/remoteEntry.js`)
);
await Promise.all(preloadRemotes);
```

2. **Use Module Federation Manifest**
```typescript
// Load with manifest for better caching
const manifest = await fetch('/mf-manifest.json').then(r => r.json());
const remoteUrl = manifest.remotes[remoteName].entry;
```

3. **Implement Retry Logic**
```typescript
async function loadWithRetry(loader, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await loader();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

## Next Steps

- Review [Advanced Topics](./advanced-topics.md) for complex scenarios
- Check [Architecture Overview](./architecture-overview.md) for system understanding
- See [SDK Reference](./sdk-reference.md) for all available types and utilities