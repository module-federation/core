### The Complete Guide to Module Federation: Internals and Data Flow

This document provides a comprehensive, chronological breakdown of the Module Federation plugin system, combining high-level concepts with a granular analysis of the specific Webpack hooks, data passed, and the precise order of operations during a build and at runtime.

## Table of Contents

1. [Core Architecture Overview](#core-architecture-overview)
2. [Plugin Configuration Deep Dive](#plugin-configuration-deep-dive)
3. [Build-Time Processing](#build-time-processing)
4. [Module Resolution & Interception](#module-resolution--interception)
5. [Runtime Federation System](#runtime-federation-system)
6. [Advanced Patterns & Use Cases](#advanced-patterns--use-cases)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting & Debugging](#troubleshooting--debugging)

```mermaid
flowchart TD
    %% Enhanced Styling for Maximum Visual Impact
    classDef startClass fill:#4caf50,stroke:#2e7d32,stroke-width:4px,color:#fff,font-weight:bold,font-size:16px
    classDef pluginClass fill:#2196f3,stroke:#1565c0,stroke-width:3px,color:#fff,font-weight:bold,font-size:14px
    classDef hookClass fill:#ff9800,stroke:#ef6c00,stroke-width:3px,color:#fff,font-weight:bold,font-size:14px
    classDef dependencyClass fill:#e91e63,stroke:#ad1457,stroke-width:3px,color:#fff,font-weight:bold,font-size:14px
    classDef moduleClass fill:#9c27b0,stroke:#6a1b9a,stroke-width:3px,color:#fff,font-weight:bold,font-size:14px
    classDef runtimeClass fill:#607d8b,stroke:#37474f,stroke-width:3px,color:#fff,font-weight:bold,font-size:14px
    classDef decisionClass fill:#795548,stroke:#3e2723,stroke-width:3px,color:#fff,font-weight:bold,font-size:14px
    classDef codegenClass fill:#673ab7,stroke:#311b92,stroke-width:3px,color:#fff,font-weight:bold,font-size:14px

    A["🚀 webpack.config.js Entry Point<br/>📋 Federation Configuration<br/>```js<br/>new ModuleFederationPlugin({<br/>  name: 'host-app',<br/>  exposes: {<br/>    './Button': './src/Button.jsx',<br/>    './Header': './src/Header.jsx'<br/>  },<br/>  remotes: {<br/>    mf2: 'mf2@http://localhost:3001/entry.js',<br/>    shell: 'shell@http://cdn.example.com/shell.js'<br/>  },<br/>  shared: {<br/>    react: { singleton: true, version: '^18.0.0' },<br/>    lodash: { requiredVersion: '^4.17.0' }<br/>  }<br/>})<br/>```<br/>🎯 Triggers complete federation orchestration"]:::startClass

    subgraph "⚙️ Phase 1: Plugin Initialization & Hook Registration System"
        direction TB
        
        subgraph "🎯 Core Plugin Orchestration Sequence (Synchronous)"
            B["🎼 ModuleFederationPlugin.apply(compiler)<br/>📋 Master Federation Orchestrator<br/>• Schema validation & normalization<br/>• Core plugin instantiation<br/>• Hook registration coordination<br/>• Configuration preprocessing<br/>🔧 FIRST: RemoteEntryPlugin<br/>🔧 SECOND: FederationModulesPlugin<br/>🔧 THIRD: FederationRuntimePlugin<br/>🔧 FOURTH: afterPlugins hook setup"]:::pluginClass
            
            B1["🏠 RemoteEntryPlugin.apply(compiler)<br/>🔧 Container Entry & Public Path Setup<br/>• Public path function configuration<br/>• Container entry point creation<br/>• Dynamic path resolution setup<br/>• Entry plugin coordination<br/>• Build identifier injection"]:::pluginClass
            
            B2["📦 FederationModulesPlugin.apply(compiler)<br/>🔧 Module Registry & Hook Infrastructure<br/>• Compilation hooks creation<br/>• addContainerEntryModule hook<br/>• addFederationRuntimeModule hook<br/>• Plugin communication channels<br/>• Module tracking system"]:::pluginClass
            
            B3["⚡ FederationRuntimePlugin.apply(compiler)<br/>🔧 Runtime Injection & Bootstrapping<br/>• Federation runtime embedding<br/>• Runtime alias configuration<br/>• Entry dependency injection<br/>• Runtime module setup<br/>• Bundle runtime coordination"]:::pluginClass
        end
        
        subgraph "🔌 Conditional Plugin Application (afterPlugins Hook)"
            D["🤝 SharePlugin.apply(compiler)<br/>📊 Universal Sharing Orchestrator<br/>• ALWAYS applied when shared exists<br/>• Bidirectional sharing enablement<br/>• Configuration normalization<br/>• Provider & Consumer instantiation<br/>• Share scope coordination"]:::pluginClass
            
            E["📤 ProvideSharedPlugin.apply(compiler)<br/>🔧 Module Provider System<br/>• normalModuleFactory.module hook<br/>• Module wrapping & enhancement<br/>• Version registration & validation<br/>• Include/exclude pattern filtering<br/>• nodeModulesReconstructedLookup<br/>• Share scope population"]:::pluginClass
            
            F["📥 ConsumeSharedPlugin.apply(compiler)<br/>🔧 Module Consumer System<br/>• normalModuleFactory.factorize hook<br/>• Module request interception<br/>• Version satisfaction algorithms<br/>• Fallback mechanism configuration<br/>• Singleton enforcement logic<br/>• Share scope resolution"]:::pluginClass
            
            G["🏗️ ContainerPlugin.apply(compiler)<br/>📦 Container & Expose Manager<br/>• compiler.make hook registration<br/>• Container entry creation<br/>• Module map generation<br/>• Library type configuration<br/>• Chunk splitting optimization<br/>• Entry dependency management"]:::pluginClass
            
            H["🔗 ContainerReferencePlugin.apply(compiler)<br/>🌐 Remote Module Loader<br/>• normalModuleFactory.factorize hook<br/>• ExternalsPlugin coordination<br/>• Remote pattern matching<br/>• Script injection preparation<br/>• External dependency creation<br/>• Runtime loading setup"]:::pluginClass
        end
    end

    subgraph "🏗️ Phase 2: Dependency Graph Construction & Module Interception"
        direction TB
        
        subgraph "📊 Webpack Hook Integration Timeline"
            C["⚡ Compiler Hook Execution Sequence<br/>🔧 Webpack Integration Points<br/>• afterPlugins: Plugin registration complete<br/>• make: Entry creation & processing<br/>• thisCompilation: Factory setup<br/>• finishMake: Additional entry handling<br/>• compilation: Module processing"]:::hookClass
            
            P["🎯 normalModuleFactory.hooks.factorize<br/>📋 PRE-CREATION Interception (Critical Timing)<br/>Data: resolveData { context, request, dependencies, contextInfo }<br/>🔍 Module Request Interception Point<br/>⚡ ConsumeSharedPlugin intercepts HERE<br/>⚡ ContainerReferencePlugin intercepts HERE<br/>🎯 BEFORE any module instantiation"]:::hookClass
            
            V["🎯 normalModuleFactory.hooks.module<br/>📋 POST-CREATION Enhancement (Module Wrapping)<br/>Data: module, resourceResolveData, resolveData<br/>🔄 Module Enhancement & Wrapping Point<br/>⚡ ProvideSharedPlugin wraps HERE<br/>🎯 AFTER module has been created & resolved"]:::hookClass
        end
        
        subgraph "📦 Container System Architecture"
            I["🏗️ ContainerEntryDependency<br/>📋 Container Entry Point Creation<br/>• compilation.addEntry() integration<br/>• Entry chunk creation & optimization<br/>• Module map preparation & setup<br/>• Exposed module registration<br/>• Runtime integration coordination<br/>• Chunk splitting configuration"]:::dependencyClass
            
            J["⚡ Webpack Dependency Graph Integration<br/>📊 Core Webpack Integration Point<br/>• compilation.addEntry() for containers<br/>• compilation.addInclude() for runtime<br/>• Chunk generation & optimization<br/>• Dependency resolution & tracking<br/>• Module graph construction"]:::hookClass
            
            K["🏭 ContainerEntryModuleFactory<br/>🔧 Container Module Creator<br/>• Factory for container entry modules<br/>• Module instantiation coordination<br/>• Exposed module mapping<br/>• Runtime factory integration<br/>• Module lifecycle management"]:::moduleClass
            
            L["📦 ContainerEntryModule<br/>🎯 Container Implementation Core<br/>• Module map object generation<br/>• get() function implementation<br/>• init() function for sharing<br/>• Exposed module resolution<br/>• Runtime coordination logic<br/>• Error handling & fallbacks"]:::moduleClass
            
            M["🔗 ContainerExposedDependency<br/>📋 Individual Expose Handler<br/>• Per-exposed module processing<br/>• Module path resolution & validation<br/>• Export mapping configuration<br/>• Dependency tracking & optimization<br/>• Runtime integration setup"]:::dependencyClass
        end
        
        subgraph "🌐 Remote System Architecture"
            N["🔧 ExternalsPlugin (Webpack Built-in)<br/>📋 External Reference System<br/>• Remote-to-external mapping<br/>• Bundle exclusion logic<br/>• Runtime resolution delegation<br/>• Script loading preparation<br/>• External dependency tracking<br/>• URL/variable configuration"]:::pluginClass
            
            O["🌍 External Module References<br/>📋 Webpack External Treatment<br/>• Bundle exclusion enforcement<br/>• Runtime resolution markers<br/>• Dynamic loading preparation<br/>• URL/variable mapping<br/>• External dependency optimization<br/>• Script injection coordination"]:::moduleClass
        end
        
        subgraph "🔄 Module Resolution Flow & Decision Logic"
            Q["🔗 ContainerReferencePlugin Decision Logic<br/>🎯 Remote Request Pattern Handler<br/>• Pattern matching: remoteA/moduleName<br/>• URL/variable resolution & validation<br/>• Script loading configuration<br/>• External dependency creation<br/>• Remote module instantiation<br/>• Error handling & fallbacks"]:::pluginClass
            
            R["🌐 RemoteModule Creation<br/>📦 Remote Module Wrapper Implementation<br/>• Dynamic loading setup & config<br/>• Error handling & recovery logic<br/>• Fallback mechanism implementation<br/>• Container initialization coordination<br/>• Runtime loading optimization<br/>• Script injection management"]:::moduleClass
            
            S["🔗 RemoteToExternalDependency<br/>📋 External Reference Link<br/>• Script injection preparation<br/>• Container initialization setup<br/>• Runtime loading configuration<br/>• External dependency tracking<br/>• Load order optimization<br/>• Error recovery mechanisms"]:::dependencyClass
            
            T["📥 ConsumeSharedPlugin.factorize Logic<br/>🎯 Shared Module Interceptor<br/>• Pre-creation module interception<br/>• Version requirement validation<br/>• Share scope lookup & validation<br/>• Fallback configuration setup<br/>• Singleton enforcement logic<br/>• Layer compatibility checking"]:::pluginClass
            
            T1{"🔍 Shared Module Match Decision<br/>📋 Configuration Lookup Logic<br/>• Package name pattern matching<br/>• Share scope validation & lookup<br/>• Layer compatibility verification<br/>• Request pattern analysis<br/>• Configuration priority resolution<br/>• Include/exclude filtering"}:::decisionClass
            
            T2["📥 ConsumeSharedModule Creation<br/>📦 Shared Consumer Implementation<br/>• Version satisfaction algorithms<br/>• Fallback handling & configuration<br/>• Singleton enforcement logic<br/>• Runtime resolution preparation<br/>• Share scope integration<br/>• Error handling & recovery"]:::moduleClass
            
            X["🔄 ConsumeSharedFallbackDependency<br/>📋 Fallback Strategy Implementation<br/>• Local module fallback logic<br/>• Error recovery mechanisms<br/>• Version mismatch handling<br/>• Performance optimization<br/>• Dependency tracking<br/>• Runtime coordination"]:::dependencyClass
            
            U["⚙️ Normal Webpack Module<br/>📦 Standard Processing Path<br/>• File resolution via loaders<br/>• Standard module creation<br/>• AST parsing & analysis<br/>• Dependency extraction<br/>• Module optimization<br/>• Standard webpack flow"]:::moduleClass
            
            W["📤 ProvideSharedPlugin.module Logic<br/>🎯 Shared Module Wrapper<br/>• Post-creation module wrapping<br/>• Share registration coordination<br/>• Version management & validation<br/>• Include/exclude pattern filtering<br/>• nodeModulesReconstructedLookup<br/>• Share scope population"]:::pluginClass
            
            W1{"📤 Should Provide Shared Decision<br/>📋 Configuration Check Logic<br/>• Resource path pattern matching<br/>• Share scope validation<br/>• Include/exclude filtering logic<br/>• nodeModulesReconstructedLookup<br/>• Version compatibility checking<br/>• Layer compatibility verification"}:::decisionClass
            
            W2["📤 ProvideSharedModule Wrapping<br/>🏭 Shared Provider Factory<br/>• Module wrapping & enhancement<br/>• Version registration in scope<br/>• Share scope population logic<br/>• Runtime factory creation<br/>• Module lifecycle management<br/>• Performance optimization"]:::moduleClass
            
            Y["📋 ProvideForSharedDependency<br/>🔗 Share Registration Link<br/>• Runtime registration setup<br/>• Version management coordination<br/>• Share scope integration<br/>• Dependency tracking<br/>• Module factory preparation<br/>• Runtime optimization"]:::dependencyClass
        end
    end

    subgraph "⚡ Phase 3: Code Generation & Runtime Module Injection"
        direction TB
        Z["⚡ compilation.hooks.additionalTreeRuntimeRequirements<br/>📋 Runtime Injection Trigger Point<br/>• Runtime module registration coordination<br/>• Dependency analysis completion<br/>• Runtime requirement calculation<br/>• Module injection orchestration<br/>• Performance optimization setup<br/>• Runtime code preparation"]:::hookClass
        
        subgraph "🔧 Runtime Module Generation System"
            AA["📥 ConsumeSharedRuntimeModule<br/>⚡ Consumer Runtime Logic Engine<br/>• Version satisfaction algorithms<br/>• Fallback mechanism implementation<br/>• Singleton management logic<br/>• Share scope resolution<br/>• Error handling & recovery<br/>• Performance optimization"]:::runtimeClass
            
            BB["🤝 ShareRuntimeModule<br/>⚡ Share Scope Manager<br/>• Share scope initialization<br/>• Module registration system<br/>• Version negotiation algorithms<br/>• Scope merging logic<br/>• Conflict resolution<br/>• Performance optimization"]:::runtimeClass
            
            CC["🌐 RemoteRuntimeModule<br/>⚡ Remote Loader System<br/>• Script injection logic<br/>• Container initialization<br/>• Error handling & recovery<br/>• Dynamic loading coordination<br/>• Performance optimization<br/>• Load order management"]:::runtimeClass
        end
        
        subgraph "📜 Generated Code Examples & Runtime Output"
            DD["🔧 Runtime Code Injection<br/>📋 Core Federation Runtime Setup<br/>```js<br/>// Federation Runtime Globals<br/>__webpack_require__.S = {}; // Share scopes<br/>__webpack_require__.I = {}; // Init sharing functions<br/>__webpack_require__.federation = {}; // Runtime core<br/>__webpack_require__.f.remotes = {}; // Remote loading<br/>__webpack_require__.e = {}; // Chunk loading<br/>```<br/>🎯 Foundation for all federation operations"]:::codegenClass
            
            EE["📦 Container Code Generation<br/>📋 Module Map & Export Logic<br/>```js<br/>// Container Module Map<br/>var moduleMap = {<br/>  './Button': () => import('./src/Button.jsx'),<br/>  './Header': () => import('./src/Header.jsx'),<br/>  './utils': () => import('./src/utils/index.js')<br/>};<br/>// Container Functions<br/>var get = (module, getScope) => {<br/>  return moduleMap[module]?.();<br/>};<br/>var init = (shareScope, initScope) => {<br/>  return __webpack_require__.I(shareScope, initScope);<br/>};<br/>```"]:::codegenClass
            
            FF["🌐 Remote Loading Code<br/>📋 Dynamic Import & Script Logic<br/>```js<br/>// Remote Module Loading<br/>__webpack_require__.e('webpack_container_remote_mf2')<br/>  .then(() => __webpack_require__('webpack/container/reference/mf2'))<br/>  .then(container => {<br/>    return container.init(__webpack_require__.S.default)<br/>      .then(() => container.get('./Component'))<br/>      .then(factory => factory());<br/>  })<br/>  .catch(err => /* fallback logic */);<br/>```"]:::codegenClass
            
            GG["📤 Provide Shared Code<br/>📋 Share Registration Logic<br/>```js<br/>// Share Scope Population<br/>__webpack_require__.S.default = {<br/>  'react': {<br/>    '18.2.0': {<br/>      get: () => import('react'),<br/>      loaded: 1, // eager<br/>      scope: ['default']<br/>    }<br/>  },<br/>  'lodash': {<br/>    '4.17.21': {<br/>      get: () => import('lodash'),<br/>      loaded: 0, // lazy<br/>      scope: ['default']<br/>    }<br/>  }<br/>};<br/>```"]:::codegenClass
            
            HH["📥 Consume Shared Code<br/>📋 Version Resolution Logic<br/>```js<br/>// Shared Module Resolution<br/>const getSharedModule = async (scope, key, version) => {<br/>  const satisfy = (version, range) => /* semver logic */;<br/>  const available = __webpack_require__.S[scope][key];<br/>  const compatible = Object.keys(available)<br/>    .find(v => satisfy(v, version));<br/>  if (compatible) {<br/>    const factory = await available[compatible].get();<br/>    return factory();<br/>  }<br/>  throw new Error(`No compatible version found`);<br/>};<br/>```"]:::codegenClass
        end
    end

    subgraph "🌐 Phase 4: Runtime Execution & Federation Bootstrap"
        direction TB
        II["🚀 Consumer App Bootstrap<br/>📋 Application Initialization Sequence<br/>• Bundle loading & parsing<br/>• Federation runtime initialization<br/>• Share scope setup & population<br/>• Remote discovery & preparation<br/>• Module graph preparation<br/>• Performance optimization"]:::runtimeClass
        
        subgraph "📡 Remote Module Loading System"
            JJ["🎯 RemoteModule Logic Execution<br/>⚡ Dynamic Import Trigger<br/>• import('host/Component') invocation<br/>• URL resolution & validation<br/>• Script injection preparation<br/>• Container loading initiation<br/>• Error handling setup<br/>• Performance monitoring"]:::runtimeClass
            
            KK["📜 Script Loading & Execution<br/>🌐 Network Request & Processing<br/>• <script> tag injection & management<br/>• Container download & parsing<br/>• Module execution & registration<br/>• Global container availability<br/>• Error handling & recovery<br/>• Performance optimization"]:::runtimeClass
            
            LL["🏠 Host Container Ready<br/>📦 Global Registration Complete<br/>• window.hostApp = container assignment<br/>• get/init functions availability<br/>• Module map accessibility<br/>• Share scope population<br/>• Runtime coordination setup<br/>• Error handling preparation"]:::runtimeClass
        end
        
        subgraph "🤝 Federation Runtime Handshake"
            MM["⚡ Federation Handshake Process<br/>🔧 Initialization & Negotiation<br/>• Share scope merging & validation<br/>• Version negotiation & resolution<br/>• Module registration & coordination<br/>• Singleton validation & enforcement<br/>• Conflict resolution<br/>• Performance optimization"]:::runtimeClass
            
            NN["📊 Share Scope Registry<br/>🗃️ Global Module Coordination Hub<br/>```js<br/>__webpack_require__.S.default = {<br/>  'react': {<br/>    '18.2.0': {get: factory, loaded: 1, scope: ['default']},<br/>    '17.0.2': {get: factory, loaded: 0, scope: ['default']}<br/>  },<br/>  'lodash': {<br/>    '4.17.21': {get: factory, loaded: 0, scope: ['default']}<br/>  }<br/>}<br/>```<br/>🎯 Central coordination for all shared modules"]:::runtimeClass
            
            OO["📤 Provider Registration<br/>🔧 Module Population Process<br/>• Version registration & validation<br/>• Module factory storage & optimization<br/>• Scope validation & merging<br/>• Eager/lazy loading configuration<br/>• Singleton enforcement setup<br/>• Performance monitoring"]:::runtimeClass
        end
        
        subgraph "🔄 Module Resolution & Execution Flow"
            PP["📥 Consumer Logic Execution<br/>🎯 Dependency Resolution Process<br/>• Share scope lookup & navigation<br/>• Version compatibility checking<br/>• Module factory retrieval<br/>• Singleton enforcement logic<br/>• Fallback decision making<br/>• Performance optimization"]:::runtimeClass
            
            QQ{"✅ Version Compatible Decision<br/>📋 Satisfaction Check Logic<br/>• semver.satisfies() validation<br/>• Singleton constraint verification<br/>• Strict version mode handling<br/>• Fallback decision logic<br/>• Performance consideration<br/>• Error handling preparation"}:::decisionClass
            
            RR["✅ Use Host's Module<br/>📦 Shared Dependency Success Path<br/>• Factory execution & optimization<br/>• Module instantiation & caching<br/>• Singleton enforcement & validation<br/>• Cache management & optimization<br/>• Performance monitoring<br/>• Error handling setup"]:::runtimeClass
            
            SS["⚠️ Use Fallback Module<br/>🔄 Local Resolution Path<br/>• Local bundle lookup & resolution<br/>• Fallback execution & optimization<br/>• Error handling & recovery<br/>• Performance impact mitigation<br/>• Dependency tracking<br/>• Alternative resolution"]:::runtimeClass
            
            TT["🎯 Dependencies Resolved<br/>✅ Module Graph Complete<br/>• All dependencies satisfied<br/>• Module tree ready & optimized<br/>• Execution preparation complete<br/>• Performance optimization applied<br/>• Error handling prepared<br/>• Runtime coordination ready"]:::runtimeClass
            
            UU["🎊 Execute Component<br/>⚡ Runtime Execution Success<br/>• Component instantiation & rendering<br/>• UI rendering & hydration<br/>• Event handling setup & optimization<br/>• User interaction readiness<br/>• Performance monitoring<br/>• Error boundary activation"]:::runtimeClass
        end
    end

    %% Enhanced Flow Connections with Logical Grouping
    A --> B
    B --> B1
    B --> B2
    B --> B3
    B --> C
    C --> D
    D --> E
    D --> F
    C --> G
    C --> H
    
    %% Container System Flow
    G --> I
    I --> J
    J --> K
    K --> L
    L --> M
    
    %% Remote System Flow
    H --> N
    N --> O
    
    %% Module Resolution Decision Flow
    C --> P
    P --> Q
    Q --> R
    R --> S
    P --> T
    T --> T1
    T1 -->|"✅ Match Found"| T2
    T1 -->|"❌ No Match"| U
    T2 --> X
    U --> V
    V --> W
    W --> W1
    W1 -->|"✅ Should Provide"| W2
    W1 -->|"❌ Skip"| Z
    W2 --> Y
    
    %% Code Generation Flow
    P --> Z
    Z --> AA
    Z --> BB
    Z --> CC
    Z --> DD
    L --> EE
    R --> FF
    W2 --> GG
    T2 --> HH
    
    %% Runtime Execution Flow
    DD --> II
    II --> JJ
    JJ --> KK
    KK --> LL
    LL --> MM
    MM --> NN
    NN --> OO
    MM --> PP
    PP --> NN
    PP --> QQ
    QQ -->|"✅ Compatible"| RR
    QQ -->|"❌ Incompatible"| SS
    RR --> TT
    SS --> TT
    TT --> UU
```

---

## Core Architecture Overview

Module Federation operates through a sophisticated plugin ecosystem that intercepts Webpack's module resolution at multiple critical points. Understanding the precise timing and data flow is essential for advanced usage.

### Plugin Hierarchy and Responsibilities

```typescript
interface ModuleFederationPluginOptions {
  name: string;                          // Unique container name
  filename?: string;                     // Container entry filename (default: "remoteEntry.js")
  exposes?: Record<string, string>;      // Modules to expose to other applications
  remotes?: Record<string, string | RemoteOptions>; // Remote containers to consume
  shared?: SharedConfig;                 // Shared module configuration
  library?: LibraryOptions;              // Library configuration for container
  runtimePlugins?: string[];             // Runtime plugins for enhanced functionality
  shareScope?: string;                   // Default share scope name (default: "default")
  experiments?: {
    federationRuntime?: boolean;         // Enable new federation runtime
  };
}

interface RemoteOptions {
  external: string;                      // URL or variable name for remote
  shareScope?: string;                   // Override default share scope
}

interface SharedConfig {
  [packageName: string]: string | SharedOptions;
}

interface SharedOptions {
  eager?: boolean;                       // Load shared module synchronously
  import?: false | string;               // Fallback module path if sharing fails
  packageName?: string;                  // Package name for version detection
  requiredVersion?: string | false;      // Version requirement (semver supported)
  shareKey?: string;                     // Key in share scope (defaults to package name)
  shareScope?: string;                   // Share scope name
  singleton?: boolean;                   // Only one instance allowed across federation
  strictVersion?: boolean;               // Strict version matching (no semver flexibility)
  version?: string | false;              // Version to provide (auto-detected from package.json)
  nodeModulesReconstructedLookup?: boolean; // Enable node_modules path reconstruction
}
```

## Plugin Configuration Deep Dive

### 1. Basic Federation Setup

```typescript
// Host Application (exposes modules)
const hostConfig = {
  name: 'host-app',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/components/Button',
    './Header': './src/components/Header',
    './utils': './src/utils/index'
  },
  shared: {
    'react': {
      singleton: true,
      requiredVersion: '^18.0.0'
    },
    'react-dom': {
      singleton: true,
      requiredVersion: '^18.0.0'
    }
  }
};

// Remote Consumer Application
const remoteConfig = {
  name: 'consumer-app',
  remotes: {
    'host': 'host@http://localhost:3001/remoteEntry.js'
  },
  shared: {
    'react': {
      singleton: true,
      requiredVersion: '^18.0.0'
    },
    'react-dom': {
      singleton: true,
      requiredVersion: '^18.0.0'
    }
  }
};
```

### 2. Advanced Sharing Configurations

#### Per-Module Sharing Strategies

```typescript
const advancedSharing = {
  // Critical singleton - strict version enforcement
  'react': {
    singleton: true,
    strictVersion: true,
    requiredVersion: '18.2.0',
    eager: false
  },
  
  // Design system - eager loading for immediate availability
  '@company/design-system': {
    singleton: true,
    eager: true,
    shareScope: 'design-system',
    version: '2.1.0'
  },
  
  // Utility library - flexible versioning
  'lodash': {
    singleton: false,
    requiredVersion: false,  // Accept any version
    shareScope: 'utilities'
  },
  
  // Complex package with fallback
  'moment': {
    singleton: true,
    requiredVersion: '^2.29.0',
    import: './src/fallbacks/date-utils', // Fallback implementation
    shareScope: 'datetime'
  },
  
  // Node modules reconstruction for complex paths
  '@babel/runtime': {
    nodeModulesReconstructedLookup: true,
    shareKey: '@babel/runtime',
    shareScope: 'babel-runtime'
  }
};
```

#### Multi-Scope Federation

```typescript
const multiScopeConfig = {
  name: 'multi-scope-app',
  exposes: {
    './VendorComponent': './src/components/VendorComponent',
    './InternalTool': './src/tools/InternalTool'
  },
  shared: {
    // Vendor scope for third-party libraries
    'react': { shareScope: 'vendor', singleton: true },
    'lodash': { shareScope: 'vendor', singleton: false },
    
    // Internal scope for company libraries
    '@company/utils': { shareScope: 'internal', singleton: true },
    '@company/components': { shareScope: 'internal', eager: true },
    
    // Framework scope for framework-specific modules
    '@angular/core': { shareScope: 'angular', singleton: true },
    '@vue/runtime-core': { shareScope: 'vue', singleton: true }
  }
};
```

### 3. Environment-Specific Configuration

```typescript
const createFederationConfig = (env: 'development' | 'production') => ({
  name: 'app',
  filename: 'remoteEntry.js',
  
  // Environment-specific remote URLs
  remotes: env === 'development' 
    ? {
        'shared-components': 'sharedComponents@http://localhost:3001/remoteEntry.js',
        'user-service': 'userService@http://localhost:3002/remoteEntry.js'
      }
    : {
        'shared-components': 'sharedComponents@https://cdn.company.com/shared-components/v1.2.3/remoteEntry.js',
        'user-service': 'userService@https://cdn.company.com/user-service/v2.1.0/remoteEntry.js'
      },
  
  shared: {
    'react': {
      singleton: true,
      // Stricter version checking in production
      strictVersion: env === 'production',
      requiredVersion: env === 'development' ? false : '^18.0.0'
    }
  },
  
  // Development-only features
  ...(env === 'development' && {
    experiments: {
      federationRuntime: true  // Enable enhanced debugging
    }
  })
});
```

### 4. Library Configuration Options

```typescript
interface LibraryOptions {
  type: 'var' | 'assign' | 'this' | 'window' | 'self' | 'global' | 'commonjs' | 'commonjs2' | 'amd' | 'umd' | 'system' | 'jsonp' | 'module';
  name?: string;
  export?: string | string[];
  auxiliaryComment?: string | { root?: string; commonjs?: string; commonjs2?: string; amd?: string; };
  umdNamedDefine?: boolean;
}

// Different library configurations for different deployment scenarios
const libraryConfigurations = {
  // Browser global variable
  browserGlobal: {
    type: 'var',
    name: 'MyFederatedApp'
  },
  
  // CommonJS for Node.js
  nodeCommonJs: {
    type: 'commonjs2'
  },
  
  // UMD for universal usage
  universal: {
    type: 'umd',
    name: 'MyFederatedApp',
    umdNamedDefine: true
  },
  
  // ES modules
  esModule: {
    type: 'module'
  }
};
```

---

### Core Concepts Clarified

*   **Universal Plugin Application**: The `SharePlugin` is applied to **every** federated application. This means any federated build can simultaneously be a host and a remote, providing some shared modules while consuming others. The distinction between "host" and "remote" is not absolute but rather a description of roles an application plays in relation to other applications.
*   **The Federation Runtime**: Module Federation relies on a dedicated runtime, separate from Webpack's own runtime. This Federation Runtime (provided by `@module-federation/runtime-tools` and injected by `FederationRuntimePlugin`) is responsible for managing the shared scope, negotiating versions, and handling singleton checks. Webpack's runtime delegates these specific tasks to the Federation Runtime.
*   **Container Entry**: The entry point for a federated application is often called `remoteEntry.js` by convention, but this is customizable via the `filename` option in the `ModuleFederationPlugin` configuration.
*   **Version Negotiation**: The version checking logic is powered by the `satisfy` function (from `@module-federation/runtime-tools`, which uses `semver`). When a consuming application requires a dependency (e.g., `react: "^17.0.0"`) and a host provides its version (e.g., `17.0.2`), the runtime effectively runs `satisfy('17.0.2', '^17.0.0')`. If this returns `true`, the dependency is considered compatible.

---

### Phase 1: Build-Time Initialization (The `apply` sequence)

The moment you run Webpack, the `.apply()` method of each plugin is called on the `compiler` object. This is where they attach themselves to various hooks.

1.  **`ModuleFederationPlugin.apply(compiler)`**: The master orchestrator.
    *   **Data In**: The `compiler` object and the `options` from your `webpack.config.js`.
    *   **Action**: It reads `options.shared`, `options.exposes`, and `options.remotes` and conditionally creates and applies the other core plugins. The sequence is:
        - `RemoteEntryPlugin` (applied first)
        - `FederationModulesPlugin` 
        - `FederationRuntimePlugin`
        - Then in `compiler.hooks.afterPlugins`: conditionally applies `ContainerPlugin`, `ContainerReferencePlugin`, and `SharePlugin`

2.  **`SharePlugin.apply(compiler)`**: The sharing orchestrator.
    *   **Action**: It immediately instantiates and calls `.apply()` on **both** `ProvideSharedPlugin` and `ConsumeSharedPlugin`, passing them the parsed and normalized `shared` configuration. This ensures every build is capable of both providing and consuming.

3.  **`ContainerPlugin.apply(compiler)`** (When `exposes` is used):
    *   **Action**: Taps into `compiler.hooks.make`.
        *   **Hook**: `compiler.hooks.make.tapAsync('ContainerPlugin', ...)`
        *   **Internal Action**: Creates a `new ContainerEntryDependency(...)` and adds it to the dependency graph via `compilation.addEntry()`. This instructs Webpack to create a new entrypoint chunk (the container entry, e.g., `remoteEntry.js`).

4.  **`ContainerReferencePlugin.apply(compiler)`** (When `remotes` is used):
    *   **Action**: Uses Webpack's built-in `ExternalsPlugin` to map remote containers to external references, preventing them from being bundled.

---

### Phase 2: Module Factorization & Hook Timing (Critical Distinction)

As Webpack finds `import` statements, it triggers a sequence of hooks for each module request. **The timing and order of these hooks is crucial to understanding Module Federation's interception strategy.**

#### Hook Sequence for Shared Modules:

1. **`normalModuleFactory.hooks.factorize.tapPromise(...)`** - **BEFORE** module creation
   * **ConsumeSharedPlugin** taps this hook to intercept module requests **before** Webpack creates any module
   * **Key Data Object**: `resolveData` (contains `context`, `request`, etc.)
   * **Critical Timing**: This happens **before** any actual module is instantiated

2. **Normal Webpack Module Creation** (if factorize doesn't return a module)
   * Webpack proceeds with its normal module creation process
   * Resolves the request to an actual file and creates a standard webpack module

3. **`normalModuleFactory.hooks.module.tap(...)`** - **AFTER** module creation
   * **ProvideSharedPlugin** taps this hook to inspect modules **after** they've been created
   * **Key Data**: `module`, `resourceResolveData`, `resolveData`
   * **Critical Timing**: This happens **after** the module exists and has been resolved to a file

#### Interception Flow for a Shared Module like `react`:

**Step 1: ConsumeSharedPlugin Factorize Hook**
```typescript
normalModuleFactory.hooks.factorize.tapPromise(PLUGIN_NAME, async (resolveData) => {
  const { request } = resolveData;
  // Check if 'react' is in consumes config
  if (consumesConfig.has(request)) {
    // Return ConsumeSharedModule - this PREVENTS normal webpack module creation
    return new ConsumeSharedModule(context, consumeConfig);
  }
  // Return undefined - let webpack continue normal processing
  return undefined;
});
```

**Step 2: Normal Module Creation** (if ConsumeSharedPlugin didn't intercept)
```typescript
// Webpack creates normal module for 'react' from node_modules
const normalModule = new NormalModule(/* ... */);
```

**Step 3: ProvideSharedPlugin Module Hook**
```typescript
normalModuleFactory.hooks.module.tap(PLUGIN_NAME, (module, { resource }, resolveData) => {
  const { request } = resolveData;
  // Check if 'react' should be provided as shared
  if (providesConfig.has(request) && resource) {
    // Create ProvideSharedModule via factory, but module already exists
    this.provideSharedModule(compilation, resolvedProvideMap, request, config, resource);
    resolveData.cacheable = false;
  }
  return module; // Always return the module (possibly modified)
});
```

---

### Detailed Compile-Time Plugin Flow

```mermaid
flowchart TD
    %% Styling
    classDef startNode fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
    classDef pluginNode fill:#2196f3,stroke:#1565c0,stroke-width:2px,color:#fff
    classDef hookNode fill:#ff9800,stroke:#ef6c00,stroke-width:2px,color:#fff
    classDef decisionNode fill:#9c27b0,stroke:#6a1b9a,stroke-width:2px,color:#fff
    classDef moduleNode fill:#f44336,stroke:#c62828,stroke-width:2px,color:#fff
    classDef endNode fill:#607d8b,stroke:#37474f,stroke-width:2px,color:#fff
    classDef configNode fill:#8bc34a,stroke:#558b2f,stroke-width:2px,color:#fff
    classDef errorNode fill:#ff5722,stroke:#d84315,stroke-width:3px,color:#fff

    %% Start
    START["🚀 Webpack Compilation Start<br/>📋 webpack.config.js loaded<br/>• ModuleFederationPlugin options parsed<br/>• Compiler instance created"]:::startNode

    %% Plugin Registration Phase
    APPLY["🔌 ModuleFederationPlugin.apply(compiler)<br/>📋 Master Plugin Orchestration<br/>• Validate configuration<br/>• Normalize options<br/>• Register sub-plugins"]:::pluginNode

    %% Core Plugin Applications
    CORE_PLUGINS["⚡ Core Plugin Registration<br/>📋 Always Applied Plugins<br/>• RemoteEntryPlugin<br/>• FederationModulesPlugin<br/>• FederationRuntimePlugin"]:::pluginNode

    %% afterPlugins Hook
    AFTER_PLUGINS["🎯 compiler.hooks.afterPlugins<br/>📋 Conditional Plugin Application<br/>• Check configuration options<br/>• Apply conditional plugins"]:::hookNode

    %% Configuration Checks
    CHECK_EXPOSES{"🔍 Has exposes config?<br/>📋 options.exposes defined?<br/>• Check for modules to expose<br/>• Validate expose paths"}:::decisionNode

    CHECK_REMOTES{"🔍 Has remotes config?<br/>📋 options.remotes defined?<br/>• Check for remote containers<br/>• Validate remote URLs"}:::decisionNode

    CHECK_SHARED{"🔍 Has shared config?<br/>📋 options.shared defined?<br/>• Check for shared modules<br/>• Parse sharing configuration"}:::decisionNode

    %% Conditional Plugin Applications
    CONTAINER_PLUGIN["🏗️ ContainerPlugin.apply(compiler)<br/>📋 Expose Module Management<br/>• Register make hook<br/>• Create container entry dependency<br/>• Set up module map generation"]:::pluginNode

    CONTAINER_REF_PLUGIN["🔗 ContainerReferencePlugin.apply(compiler)<br/>📋 Remote Module Consumption<br/>• Apply ExternalsPlugin<br/>• Map remotes to externals<br/>• Configure remote loading"]:::pluginNode

    SHARE_PLUGIN["🤝 SharePlugin.apply(compiler)<br/>📋 Universal Sharing Setup<br/>• ALWAYS applied regardless of config<br/>• Apply ProvideSharedPlugin<br/>• Apply ConsumeSharedPlugin"]:::pluginNode

    %% Share Plugin Sub-Applications
    PROVIDE_SHARED["📤 ProvideSharedPlugin.apply(compiler)<br/>📋 Module Provider Setup<br/>• Register normalModuleFactory hooks<br/>• Set up module wrapping logic<br/>• Configure share scope population"]:::pluginNode

    CONSUME_SHARED["📥 ConsumeSharedPlugin.apply(compiler)<br/>📋 Module Consumer Setup<br/>• Register factorize hook<br/>• Set up version checking<br/>• Configure fallback handling"]:::pluginNode

    %% Compilation Phase Start
    COMPILATION_START["⚡ compiler.hooks.make.tapAsync<br/>📋 Compilation Phase Begins<br/>• Dependency graph construction<br/>• Entry point processing<br/>• Module resolution starts"]:::hookNode

    %% Container Entry Creation (if exposes)
    CONTAINER_ENTRY{"🏗️ Container Entry Creation<br/>📋 ContainerPlugin make hook<br/>• Create ContainerEntryDependency<br/>• Add to compilation.entries"}:::moduleNode

    CONTAINER_MODULE["📦 ContainerEntryModule Creation<br/>📋 Container Implementation<br/>• Generate module map<br/>• Create get() function<br/>• Create init() function<br/>• Handle exposed modules"]:::moduleNode

    %% Module Factorization Phase
    MODULE_FACTORIZE["🎯 normalModuleFactory.hooks.factorize<br/>📋 Module Request Processing<br/>• For each import/require<br/>• Before module creation<br/>• Plugin interception point"]:::hookNode

    %% Module Request Analysis
    ANALYZE_REQUEST{"🔍 Analyze Module Request<br/>📋 Request Classification<br/>• Check if remote module<br/>• Check if shared module<br/>• Determine resolution strategy"}:::decisionNode

    %% Remote Module Handling
    REMOTE_CHECK{"🌐 Remote Module Check<br/>📋 ContainerReferencePlugin Logic<br/>• Does request match remote pattern?<br/>• remoteA/moduleName format?<br/>• External mapping exists?"}:::decisionNode

    CREATE_REMOTE["🌐 Create RemoteModule<br/>📋 Remote Module Wrapper<br/>• Map to external reference<br/>• Set up dynamic loading<br/>• Configure error handling<br/>• Add RemoteToExternalDependency"]:::moduleNode

    %% Shared Module Consumption
    SHARED_CONSUME_CHECK{"📥 Shared Consumption Check<br/>📋 ConsumeSharedPlugin Logic<br/>• Match against consumes config<br/>• Check package name/shareKey<br/>• Validate share scope"}:::decisionNode

    CREATE_CONSUME_SHARED["📥 Create ConsumeSharedModule<br/>📋 Shared Consumer Implementation<br/>• Version requirement checking<br/>• Singleton enforcement<br/>• Fallback configuration<br/>• Add ConsumeSharedFallbackDependency"]:::moduleNode

    %% Normal Module Creation
    NORMAL_MODULE["⚙️ Normal Module Creation<br/>📋 Standard Webpack Processing<br/>• File resolution<br/>• Loader application<br/>• AST parsing<br/>• Dependency extraction"]:::moduleNode

    %% Module Hook (after creation)
    MODULE_HOOK["🎯 normalModuleFactory.hooks.module<br/>📋 Post-Creation Processing<br/>• Module wrapping opportunity<br/>• Plugin modification point<br/>• After module instantiation"]:::hookNode

    %% Shared Module Provision
    SHARED_PROVIDE_CHECK{"📤 Shared Provision Check<br/>📋 ProvideSharedPlugin Logic<br/>• Match against provides config<br/>• Check resource path<br/>• Validate share configuration"}:::decisionNode

    WRAP_PROVIDE_SHARED["📤 Wrap with ProvideSharedModule<br/>📋 Shared Provider Implementation<br/>• Wrap existing module<br/>• Register in share scope<br/>• Version management<br/>• Add ProvideForSharedDependency"]:::moduleNode

    %% Module Build Phase
    MODULE_BUILD["🏗️ Module Build Phase<br/>📋 Module Compilation<br/>• Source code processing<br/>• Dependency resolution<br/>• Code transformation<br/>• Chunk assignment"]:::moduleNode

    %% Runtime Requirements Analysis
    RUNTIME_REQUIREMENTS["⚡ compilation.hooks.additionalTreeRuntimeRequirements<br/>📋 Runtime Module Registration<br/>• Analyze module dependencies<br/>• Register required runtime modules<br/>• Set up runtime code injection"]:::hookNode

    %% Runtime Module Creation
    CONSUME_RUNTIME{"📥 ConsumeSharedRuntimeModule<br/>📋 Consumer Runtime Logic<br/>• Version satisfaction functions<br/>• Fallback mechanisms<br/>• Singleton management<br/>• loadSingleton, loadVersionCheck"}:::moduleNode

    SHARE_RUNTIME{"🤝 ShareRuntimeModule<br/>📋 Share Scope Management<br/>• Share scope initialization<br/>• Module registration logic<br/>• Version negotiation<br/>• __webpack_require__.S setup"}:::moduleNode

    REMOTE_RUNTIME{"🌐 RemoteRuntimeModule<br/>📋 Remote Loading Logic<br/>• Script injection functions<br/>• Container initialization<br/>• Error handling<br/>• Dynamic import support"}:::moduleNode

    %% Code Generation Phase
    CODE_GEN["🏭 Code Generation Phase<br/>📋 Source Code Output<br/>• Generate module source<br/>• Inject runtime code<br/>• Create chunks<br/>• Optimize bundles"]:::hookNode

    %% Different Code Generation Paths
    CONTAINER_CODE_GEN["📦 Container Code Generation<br/>📋 Container Entry Output<br/>```js<br/>var moduleMap = {<br/>  './Button': () => import('./src/Button'),<br/>  './Header': () => import('./src/Header')<br/>};<br/>var get = (module, getScope) => {...};<br/>var init = (shareScope, initScope) => {...};<br/>```"]:::moduleNode

    REMOTE_CODE_GEN["🌐 Remote Code Generation<br/>📋 Remote Module Output<br/>```js<br/>const remote = await loadScript(url);<br/>await remote.init(__webpack_require__.S['default']);<br/>const factory = await remote.get('ComponentName');<br/>return factory();<br/>```"]:::moduleNode

    SHARED_PROVIDE_CODE_GEN["📤 Shared Provider Code Generation<br/>📋 Share Registration Output<br/>```js<br/>__webpack_require__.S['default']['react'] = {<br/>  '18.2.0': {<br/>    get: () => Promise.resolve(() => __webpack_require__(123)),<br/>    loaded: 1, scope: ['default']<br/>  }<br/>};<br/>```"]:::moduleNode

    SHARED_CONSUME_CODE_GEN["📥 Shared Consumer Code Generation<br/>📋 Dynamic Resolution Output<br/>```js<br/>const satisfy = (version, range) => semver.satisfies(version, range);<br/>const loadSingleton = async (scope, key) => {...};<br/>const loadVersionCheck = async () => {...};<br/>```"]:::moduleNode

    %% Error Handling
    CONFIG_ERROR["❌ Configuration Error<br/>📋 Invalid Plugin Options<br/>• Missing required fields<br/>• Invalid URLs/paths<br/>• Conflicting settings"]:::errorNode

    RESOLUTION_ERROR["❌ Module Resolution Error<br/>📋 Failed Module Loading<br/>• Remote not accessible<br/>• Shared module not found<br/>• Version incompatibility"]:::errorNode

    %% Compilation Complete
    COMPILATION_COMPLETE["✅ Compilation Complete<br/>📋 Bundle Generation Finished<br/>• All modules processed<br/>• Chunks optimized<br/>• Assets generated<br/>• Federation ready"]:::endNode

    %% Main Flow
    START --> APPLY
    APPLY --> CORE_PLUGINS
    CORE_PLUGINS --> AFTER_PLUGINS

    %% Configuration Branching
    AFTER_PLUGINS --> CHECK_EXPOSES
    AFTER_PLUGINS --> CHECK_REMOTES
    AFTER_PLUGINS --> CHECK_SHARED

    %% Conditional Plugin Applications
    CHECK_EXPOSES -->|Yes| CONTAINER_PLUGIN
    CHECK_EXPOSES -->|No| COMPILATION_START
    CHECK_REMOTES -->|Yes| CONTAINER_REF_PLUGIN
    CHECK_REMOTES -->|No| COMPILATION_START
    CHECK_SHARED -->|Always| SHARE_PLUGIN

    %% Share Plugin Sub-Applications
    SHARE_PLUGIN --> PROVIDE_SHARED
    SHARE_PLUGIN --> CONSUME_SHARED

    %% Plugin Applications Flow to Compilation
    CONTAINER_PLUGIN --> COMPILATION_START
    CONTAINER_REF_PLUGIN --> COMPILATION_START
    PROVIDE_SHARED --> COMPILATION_START
    CONSUME_SHARED --> COMPILATION_START

    %% Container Entry Creation
    COMPILATION_START --> CONTAINER_ENTRY
    CONTAINER_ENTRY --> CONTAINER_MODULE

    %% Module Factorization Flow
    COMPILATION_START --> MODULE_FACTORIZE
    CONTAINER_MODULE --> MODULE_FACTORIZE

    %% Module Request Analysis
    MODULE_FACTORIZE --> ANALYZE_REQUEST

    %% Remote Module Path
    ANALYZE_REQUEST --> REMOTE_CHECK
    REMOTE_CHECK -->|Yes| CREATE_REMOTE
    REMOTE_CHECK -->|No| SHARED_CONSUME_CHECK

    %% Shared Consumption Path
    SHARED_CONSUME_CHECK -->|Yes| CREATE_CONSUME_SHARED
    SHARED_CONSUME_CHECK -->|No| NORMAL_MODULE

    %% Module Creation to Module Hook
    CREATE_REMOTE --> MODULE_BUILD
    CREATE_CONSUME_SHARED --> MODULE_BUILD
    NORMAL_MODULE --> MODULE_HOOK

    %% Shared Provision Path
    MODULE_HOOK --> SHARED_PROVIDE_CHECK
    SHARED_PROVIDE_CHECK -->|Yes| WRAP_PROVIDE_SHARED
    SHARED_PROVIDE_CHECK -->|No| MODULE_BUILD

    %% Module Build to Runtime Requirements
    WRAP_PROVIDE_SHARED --> MODULE_BUILD
    MODULE_BUILD --> RUNTIME_REQUIREMENTS

    %% Runtime Module Registration
    RUNTIME_REQUIREMENTS --> CONSUME_RUNTIME
    RUNTIME_REQUIREMENTS --> SHARE_RUNTIME
    RUNTIME_REQUIREMENTS --> REMOTE_RUNTIME

    %% Code Generation Phase
    CONSUME_RUNTIME --> CODE_GEN
    SHARE_RUNTIME --> CODE_GEN
    REMOTE_RUNTIME --> CODE_GEN

    %% Different Code Generation Outputs
    CODE_GEN --> CONTAINER_CODE_GEN
    CODE_GEN --> REMOTE_CODE_GEN
    CODE_GEN --> SHARED_PROVIDE_CODE_GEN
    CODE_GEN --> SHARED_CONSUME_CODE_GEN

    %% Final Compilation
    CONTAINER_CODE_GEN --> COMPILATION_COMPLETE
    REMOTE_CODE_GEN --> COMPILATION_COMPLETE
    SHARED_PROVIDE_CODE_GEN --> COMPILATION_COMPLETE
    SHARED_CONSUME_CODE_GEN --> COMPILATION_COMPLETE

    %% Error Paths
    APPLY -.-> CONFIG_ERROR
    MODULE_FACTORIZE -.-> RESOLUTION_ERROR
    CONFIG_ERROR -.-> COMPILATION_COMPLETE
    RESOLUTION_ERROR -.-> COMPILATION_COMPLETE

    %% Loops for Multiple Modules
    MODULE_FACTORIZE -.->|For each module request| ANALYZE_REQUEST
    ANALYZE_REQUEST -.->|Process next request| MODULE_FACTORIZE
```

---

## Runtime Federation System

### Share Scope Architecture

The share scope is the heart of Module Federation's runtime system. It's a global registry where all shared modules are registered and resolved.

```typescript
// Global share scope structure
interface ShareScope {
  [moduleKey: string]: {
    [version: string]: SharedModuleInfo;
  };
}

interface SharedModuleInfo {
  get(): Promise<ModuleFactory>;  // Function to get the module
  loaded: 0 | 1;                 // 0 = lazy, 1 = eager
  scope: string[];                // Share scopes this module belongs to
  shareConfig?: ConsumeSharedOptions;
}

// Runtime globals
declare global {
  interface Window {
    __webpack_share_scopes__: {
      [scopeName: string]: ShareScope;
    };
  }
}
```

### Federation Runtime Bootstrap Sequence

```mermaid
sequenceDiagram
    participant User as 👤 User Browser<br/>🌐 Web Client
    participant HostApp as 🏠 Host Application<br/>📍 localhost:3000<br/>🎯 Main Consumer App
    participant HostBundle as 📦 Host Bundle<br/>📄 main.js + remoteEntry.js<br/>⚡ Federation-enabled
    participant FedRuntime as ⚡ Federation Runtime<br/>🔧 __webpack_require__.S<br/>🗃️ Share Scope Manager
    participant ShareScope as 🗃️ Share Scope Registry<br/>📊 Global Module Hub<br/>🔄 Version Coordinator
    participant RemoteScript as 📡 Remote Script Loader<br/>🌐 CDN/localhost:3001<br/>📜 Dynamic Script Injection
    participant RemoteContainer as 🌐 Remote Container<br/>📦 Federated Module Provider<br/>🏗️ Module Factory
    participant SharedModules as 🤝 Shared Module System<br/>📚 react, lodash, @company/ui<br/>🔄 Dependency Resolution
    participant ErrorBoundary as ⚠️ Error Boundary<br/>🛡️ Fallback System<br/>🔄 Recovery Mechanisms
    
    Note over User,ErrorBoundary: 🚀 Phase 1: Application Bootstrap & Federation Infrastructure Initialization
    
    User->>+HostApp: 🌐 Navigate to federated application<br/>📍 GET https://localhost:3000
    Note over User,HostApp: 🎯 Initial page load triggers<br/>complete federation setup
    
    HostApp->>+HostBundle: 📥 Load main application bundle<br/>⚡ Federation runtime included
    Note over HostBundle: 📦 Bundle contains:<br/>• Main app code<br/>• Federation runtime<br/>• Share configurations<br/>• Remote entry points
    
    HostBundle->>+FedRuntime: ⚡ Initialize federation runtime system<br/>🔧 Setup global federation infrastructure
    Note over FedRuntime: 🏗️ Runtime initialization:<br/>• __webpack_require__.S = {}<br/>• __webpack_require__.I = {}<br/>• __webpack_require__.federation = {}
    
    FedRuntime->>+ShareScope: 🗃️ Create default share scope registry<br/>📊 Initialize global module coordination
    Note over ShareScope: 📊 Share scope structure:<br/>__webpack_require__.S.default = {}<br/>🎯 Ready for module registration
    ShareScope-->>FedRuntime: ✅ Share scope infrastructure ready
    
    FedRuntime->>+SharedModules: 📤 Register host's provided modules<br/>🔧 Populate initial share scope
    Note over SharedModules: 📋 Host module registration:<br/>• react@18.2.0: { get: factory, loaded: 1, eager: true }<br/>• lodash@4.17.21: { get: factory, loaded: 0, lazy: true }<br/>• @company/design-system@3.1.0: { get: factory, loaded: 1 }
    
    SharedModules->>ShareScope: 📊 Modules registered in share scope<br/>🔄 Available for consumption
    Note over ShareScope: 📊 Updated registry:<br/>default: {<br/>  react: { '18.2.0': {get, loaded: 1} },<br/>  lodash: { '4.17.21': {get, loaded: 0} }<br/>}
    
    ShareScope-->>FedRuntime: ✅ Host modules successfully registered
    FedRuntime-->>HostBundle: ✅ Federation runtime fully initialized
    HostBundle-->>HostApp: ✅ Application ready with federation support
    HostApp-->>-User: 🎊 Initial application loaded & ready
    
    Note over User,ErrorBoundary: 📡 Phase 2: Dynamic Remote Loading & Container Initialization
    
    User->>+HostApp: 🖱️ Trigger remote component interaction<br/>🎯 Click button, navigate route, lazy load
    Note over User,HostApp: 🎯 User action triggers:<br/>import('remote/Component')<br/>Dynamic federation loading
    
    HostApp->>FedRuntime: 🎯 Dynamic import request<br/>📡 import('remote/Component')
    Note over FedRuntime: 🔍 Remote resolution:<br/>• Parse remote identifier<br/>• Resolve container URL<br/>• Initiate script loading
    
    FedRuntime->>+RemoteScript: 📡 Load remote container script<br/>🌐 Dynamic script injection
    Note over RemoteScript: 🌐 Script injection:<br/><script src="http://localhost:3001/remoteEntry.js"><br/>🔄 Async loading with error handling
    
    RemoteScript->>+RemoteContainer: 📦 Download, parse & execute container<br/>🏗️ Remote module factory creation
    Note over RemoteContainer: 🏗️ Container initialization:<br/>• Parse module map<br/>• Setup get() function<br/>• Setup init() function<br/>• Register at window.remoteApp
    
    RemoteScript-->>FedRuntime: ✅ Remote script loaded successfully<br/>📦 Container available globally
    deactivate RemoteScript
    
    FedRuntime->>RemoteContainer: 🤝 container.init(shareScope)<br/>🔧 Initialize remote with host's share scope
    Note over RemoteContainer: 🔧 Initialization process:<br/>• Receive host's share scope<br/>• Merge configurations<br/>• Validate compatibility<br/>• Setup bidirectional sharing
    
    RemoteContainer->>ShareScope: 🔍 Inspect current share scope state<br/>📊 Analyze available modules
    Note over ShareScope: 📊 Current share scope state:<br/>react@18.2.0 (from host, eager)<br/>lodash@4.17.21 (from host, lazy)<br/>@company/design-system@3.1.0 (from host)
    
    RemoteContainer->>SharedModules: 📤 Register remote's provided modules<br/>🔄 Expand shared module ecosystem
    Note over SharedModules: 📋 Remote module registration:<br/>• @company/ui@2.1.0: { get: factory, loaded: 0 }<br/>• moment@2.29.4: { get: factory, loaded: 1 }<br/>• @company/icons@1.5.0: { get: factory, loaded: 0 }
    
    SharedModules->>ShareScope: 🔄 Merge module registrations<br/>📊 Update global registry
    Note over ShareScope: 📊 Merged share scope:<br/>react@18.2.0 (host)<br/>lodash@4.17.21 (host)<br/>@company/ui@2.1.0 (remote)<br/>moment@2.29.4 (remote)<br/>@company/icons@1.5.0 (remote)
    
    ShareScope-->>RemoteContainer: ✅ Share scope successfully merged<br/>🤝 Bidirectional sharing established
    RemoteContainer-->>FedRuntime: ✅ Remote container fully initialized<br/>📦 Ready for module requests
    
    Note over User,ErrorBoundary: 🔄 Phase 3: Module Resolution & Dependency Satisfaction
    
    FedRuntime->>RemoteContainer: 📥 container.get('./Component')<br/>🎯 Request specific component
    Note over RemoteContainer: 🎯 Component factory lookup:<br/>• Find in module map<br/>• Prepare factory function<br/>• Analyze dependencies
    
    RemoteContainer->>ShareScope: 🔍 Resolve component dependencies<br/>📊 Dependency analysis & version checking
    Note over ShareScope: 🎯 Component dependency requirements:<br/>• react (^18.0.0) - REQUIRED<br/>• @company/ui (^2.0.0) - REQUIRED<br/>• moment (^2.29.0) - OPTIONAL<br/>• @company/icons (^1.0.0) - REQUIRED
    
    loop 🔄 For each dependency requirement
        ShareScope->>ShareScope: ✅ Version satisfaction analysis<br/>📋 semver.satisfies(available, required)
        Note over ShareScope: 🔍 Version checking process:<br/>• Parse semver ranges<br/>• Find compatible versions<br/>• Apply singleton constraints<br/>• Resolve conflicts
        
        alt ✅ Compatible version found in scope
            ShareScope->>SharedModules: 📦 Retrieve module factory<br/>🏭 Get cached or create new factory
            Note over SharedModules: 🏭 Factory resolution:<br/>• Check if already loaded<br/>• Execute factory if needed<br/>• Apply singleton logic<br/>• Cache result
            SharedModules-->>ShareScope: 🏭 Module factory ready<br/>✅ Dependency satisfied
        else ❌ No compatible version available
            ShareScope->>+ErrorBoundary: ⚠️ Version conflict detected<br/>🔄 Initiate fallback strategy
            Note over ErrorBoundary: 🛡️ Fallback strategies:<br/>• Use local bundle version<br/>• Show degraded UI<br/>• Display error message<br/>• Retry with different version
            ErrorBoundary->>RemoteContainer: 🔄 Apply fallback resolution<br/>⚠️ Graceful degradation
            deactivate ErrorBoundary
        end
    end
    
    ShareScope-->>RemoteContainer: ✅ All dependencies resolved<br/>📦 Module graph complete
    
    RemoteContainer->>SharedModules: 🏭 Execute resolved module factories<br/>⚡ Instantiate dependencies
    Note over SharedModules: ⚡ Module instantiation process:<br/>• Execute react factory → React instance<br/>• Execute @company/ui factory → UI components<br/>• Execute moment factory → Date utilities<br/>• Execute @company/icons factory → Icon library
    
    SharedModules-->>RemoteContainer: 📦 Module instances ready<br/>✅ All dependencies instantiated
    
    RemoteContainer-->>FedRuntime: 🎯 Component factory function<br/>📦 Ready-to-execute component
    Note over FedRuntime: 📦 Component factory contains:<br/>• Resolved dependencies<br/>• Component implementation<br/>• Props interface<br/>• Error boundaries
    
    FedRuntime-->>HostApp: 📦 Federated component ready<br/>🎨 Ready for rendering
    
    Note over User,ErrorBoundary: 🎊 Phase 4: Component Execution & UI Rendering
    
    HostApp->>HostApp: 🎨 Render federated component<br/>⚡ Execute with resolved dependencies
    Note over HostApp: ⚡ Component execution process:<br/>• Props validation & passing<br/>• State management initialization<br/>• Event handlers binding<br/>• Lifecycle methods execution<br/>• Context providers setup<br/>• Error boundary activation
    
    HostApp-->>-User: 🎊 Federated UI successfully rendered<br/>✨ Seamless user experience
    Note over User,HostApp: 🎊 User sees:<br/>• Integrated UI components<br/>• Shared design system<br/>• Consistent interactions<br/>• No loading indicators
    
    Note over User,ErrorBoundary: 🔄 Phase 5: Ongoing Operations & Optimizations
    
    opt 🔥 Hot Module Replacement (Development Mode)
        Note over User,ErrorBoundary: 🔥 Development-time optimizations
        RemoteScript->>RemoteContainer: 🔄 HMR update received<br/>📡 New module version available
        Note over RemoteContainer: 🔄 HMR process:<br/>• Invalidate old modules<br/>• Load new versions<br/>• Preserve component state<br/>• Update registrations
        RemoteContainer->>ShareScope: 🔄 Update module registrations<br/>📊 Refresh share scope
        ShareScope->>HostApp: ⚡ Trigger component re-render<br/>🔄 Apply changes without page reload
        HostApp-->>User: 🔄 UI updated instantly<br/>✨ Development experience enhanced
    end
    
    Note over User,ErrorBoundary: ⚠️ Phase 6: Error Handling & Recovery Scenarios
    
    opt ❌ Remote Loading Failure Scenarios
        Note over User,ErrorBoundary: ❌ Network/infrastructure failures
        FedRuntime->>RemoteScript: 📡 Attempt remote container load
        RemoteScript-->>FedRuntime: ❌ Network error / 404 / timeout<br/>🚨 Loading failed
        Note over FedRuntime: ❌ Failure scenarios:<br/>• Network connectivity issues<br/>• Remote server down<br/>• Invalid container URL<br/>• CORS policy violations
        FedRuntime->>+ErrorBoundary: ⚠️ Activate error boundary<br/>🛡️ Fallback to safe UI
        ErrorBoundary->>HostApp: 🔄 Render fallback component<br/>⚠️ Graceful degradation
        HostApp-->>User: 🚨 Error UI displayed<br/>💡 User informed of issue
        deactivate ErrorBoundary
    end
    
    opt ❌ Version Conflict Resolution
        Note over User,ErrorBoundary: ❌ Dependency version conflicts
        ShareScope->>ShareScope: ❌ Version incompatibility detected<br/>🔍 Conflict analysis
        Note over ShareScope: ❌ Conflict scenarios:<br/>• Singleton violations<br/>• Breaking version changes<br/>• Missing dependencies<br/>• Circular dependencies
        ShareScope->>+ErrorBoundary: ⚠️ Version conflict detected<br/>🔄 Initiate resolution strategy
        
        alt 🔧 Singleton enforcement mode
            ErrorBoundary->>HostApp: ⚠️ Display version warning<br/>💡 Inform about potential issues
            Note over HostApp: ⚠️ Singleton warning:<br/>"Multiple versions of React detected.<br/>Using host version 18.2.0"
        else 🔄 Fallback resolution mode
            ErrorBoundary->>SharedModules: 🔄 Use local fallback module<br/>📦 Load from local bundle
            Note over SharedModules: 🔄 Fallback strategies:<br/>• Use bundled version<br/>• Load compatible alternative<br/>• Show degraded functionality
        else 🚨 Critical failure mode
            ErrorBoundary->>HostApp: 🚨 Show error boundary UI<br/>⚠️ Component failed to load
            Note over HostApp: 🚨 Error boundary displays:<br/>"Component temporarily unavailable.<br/>Please try again later."
        end
        deactivate ErrorBoundary
    end
    
    opt 🔄 Performance Monitoring & Optimization
        Note over User,ErrorBoundary: 📊 Runtime performance tracking
        ShareScope->>ShareScope: 📊 Monitor performance metrics<br/>⏱️ Track loading times
        Note over ShareScope: 📊 Metrics collected:<br/>• Module resolution time<br/>• Script loading duration<br/>• Component render time<br/>• Memory usage<br/>• Cache hit rates
        ShareScope->>HostApp: 📊 Performance insights<br/>💡 Optimization opportunities
        Note over HostApp: 💡 Optimizations applied:<br/>• Preload critical remotes<br/>• Cache frequently used modules<br/>• Lazy load non-critical components<br/>• Bundle splitting optimization
    end
    
    deactivate SharedModules
    deactivate RemoteContainer
    deactivate ShareScope
    deactivate FedRuntime
    deactivate HostBundle
```

### Version Satisfaction Logic

```typescript
class VersionResolver {
  static satisfy(
    availableVersion: string,
    requiredVersion: string | false,
    strictVersion: boolean = false
  ): boolean {
    // No version requirement - always satisfied
    if (requiredVersion === false) return true;
    
    // Strict version matching
    if (strictVersion) {
      return availableVersion === requiredVersion;
    }
    
    // Semver satisfaction check
    try {
      return semver.satisfies(availableVersion, requiredVersion);
    } catch (error) {
      console.warn(`Invalid semver comparison: ${availableVersion} vs ${requiredVersion}`);
      return false;
    }
  }
  
  static findBestMatch(
    availableVersions: Map<string, SharedModuleInfo>,
    requiredVersion: string | false,
    singleton: boolean = false
  ): SharedModuleInfo | null {
    const compatible = Array.from(availableVersions.entries())
      .filter(([version, info]) => this.satisfy(version, requiredVersion))
      .sort(([a], [b]) => semver.rcompare(a, b)); // Highest version first
    
    if (compatible.length === 0) return null;
    
    if (singleton && compatible.length > 1) {
      console.warn(`Multiple compatible versions found for singleton module`);
    }
    
    return compatible[0][1];
  }
}
```

### Dynamic Remote Loading

```typescript
class FederationRuntime {
  private remoteCache = new Map<string, Promise<RemoteContainer>>();
  private shareScopes = new Map<string, ShareScope>();
  
  async loadRemoteModule<T = any>(
    remoteName: string,
    moduleName: string,
    options: LoadRemoteOptions = {}
  ): Promise<T> {
    const remote = await this.getOrLoadRemote(remoteName, options);
    const moduleFactory = await remote.get(moduleName);
    return moduleFactory();
  }
  
  private async getOrLoadRemote(
    remoteName: string,
    options: LoadRemoteOptions
  ): Promise<RemoteContainer> {
    const cacheKey = `${remoteName}:${options.shareScope || 'default'}`;
    
    if (!this.remoteCache.has(cacheKey)) {
      this.remoteCache.set(cacheKey, this.loadRemoteContainer(remoteName, options));
    }
    
    return this.remoteCache.get(cacheKey)!;
  }
  
  private async loadRemoteContainer(
    remoteName: string,
    options: LoadRemoteOptions
  ): Promise<RemoteContainer> {
    const remoteUrl = this.resolveRemoteUrl(remoteName);
    
    // Load remote script
    const remote = await this.loadScript(remoteUrl);
    
    // Initialize with share scope
    const shareScope = this.getShareScope(options.shareScope || 'default');
    await remote.init(shareScope);
    
    return remote;
  }
  
  private async loadScript(url: string): Promise<RemoteContainer> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      
      script.onload = () => {
        // Extract container from global scope
        const containerName = this.extractContainerName(url);
        const container = (window as any)[containerName];
        
        if (!container) {
          reject(new Error(`Container ${containerName} not found`));
          return;
        }
        
        resolve(container);
      };
      
      script.onerror = () => {
        reject(new Error(`Failed to load remote: ${url}`));
      };
      
      document.head.appendChild(script);
    });
  }
}
```

---

## Advanced Patterns & Use Cases

### 1. Micro-Frontend Architecture

```typescript
// Shell application setup
const shellConfig = {
  name: 'shell',
  exposes: {
    './ErrorBoundary': './src/components/ErrorBoundary',
    './Router': './src/components/Router',
    './ThemeProvider': './src/components/ThemeProvider',
    './AuthContext': './src/context/AuthContext'
  },
  remotes: {
    'header': 'headerMF@http://localhost:3001/remoteEntry.js',
    'sidebar': 'sidebarMF@http://localhost:3002/remoteEntry.js',
    'dashboard': 'dashboardMF@http://localhost:3003/remoteEntry.js',
    'settings': 'settingsMF@http://localhost:3004/remoteEntry.js'
  },
  shared: {
    'react': { singleton: true, eager: true },
    'react-dom': { singleton: true, eager: true },
    'react-router-dom': { singleton: true },
    '@company/design-system': { 
      singleton: true, 
      eager: true,
      version: '2.1.0' 
    }
  }
};

// Micro-frontend implementation
const microfrontendConfig = {
  name: 'dashboard',
  filename: 'remoteEntry.js',
  exposes: {
    './Dashboard': './src/Dashboard',
    './DashboardRoutes': './src/routes'
  },
  remotes: {
    'shell': 'shellMF@http://localhost:3000/remoteEntry.js'
  },
  shared: {
    'react': { singleton: true },
    'react-dom': { singleton: true },
    'react-router-dom': { singleton: true },
    '@company/design-system': { singleton: true }
  }
};
```

### 2. Cross-Framework Federation

```typescript
// React + Vue federation
const crossFrameworkConfig = {
  name: 'multi-framework-shell',
  remotes: {
    'react-components': 'reactMF@http://localhost:3001/remoteEntry.js',
    'vue-components': 'vueMF@http://localhost:3002/remoteEntry.js',
    'angular-components': 'angularMF@http://localhost:3003/remoteEntry.js'
  },
  shared: {
    // Framework-specific scopes
    'react': { shareScope: 'react', singleton: true },
    'vue': { shareScope: 'vue', singleton: true },
    '@angular/core': { shareScope: 'angular', singleton: true },
    
    // Common utilities
    'lodash': { shareScope: 'utils', singleton: false },
    'axios': { shareScope: 'utils', singleton: true },
    
    // Design tokens
    '@company/design-tokens': { 
      shareScope: 'design', 
      singleton: true, 
      eager: true 
    }
  }
};

// Framework adapters for cross-framework communication
class FrameworkAdapter {
  static wrapReactComponent(Component: React.ComponentType) {
    return {
      mount: (element: HTMLElement, props: any) => {
        const root = ReactDOM.createRoot(element);
        root.render(React.createElement(Component, props));
        return () => root.unmount();
      }
    };
  }
  
  static wrapVueComponent(Component: any) {
    return {
      mount: (element: HTMLElement, props: any) => {
        const app = Vue.createApp(Component, props);
        app.mount(element);
        return () => app.unmount();
      }
    };
  }
}
```

### 3. Server-Side Federation (Node.js)

```typescript
// Node.js federation configuration
const nodeConfig = {
  name: 'node-federation',
  target: 'node',
  mode: 'development',
  experiments: {
    outputModule: true
  },
  exposes: {
    './userService': './src/services/userService',
    './authMiddleware': './src/middleware/auth',
    './database': './src/database/connection'
  },
  shared: {
    'express': { singleton: true },
    'mongoose': { singleton: true },
    'jsonwebtoken': { singleton: false }
  }
};

// Server-side module loading
class ServerFederation {
  private moduleCache = new Map<string, any>();
  
  async loadServerModule(
    remoteName: string,
    moduleName: string
  ): Promise<any> {
    const cacheKey = `${remoteName}/${moduleName}`;
    
    if (this.moduleCache.has(cacheKey)) {
      return this.moduleCache.get(cacheKey);
    }
    
    try {
      // Dynamic import for server-side federation
      const remoteModule = await import(`${remoteName}/${moduleName}`);
      this.moduleCache.set(cacheKey, remoteModule);
      return remoteModule;
    } catch (error) {
      console.error(`Failed to load server module ${cacheKey}:`, error);
      throw error;
    }
  }
}
```

### 4. Development vs Production Strategies

```typescript
class FederationEnvironmentManager {
  static createConfig(env: 'development' | 'staging' | 'production') {
    const baseConfig = {
      name: 'app',
      shared: {
        'react': { singleton: true },
        'react-dom': { singleton: true }
      }
    };
    
    switch (env) {
      case 'development':
        return {
          ...baseConfig,
          remotes: {
            'components': 'components@http://localhost:3001/remoteEntry.js',
            'services': 'services@http://localhost:3002/remoteEntry.js'
          },
          shared: {
            ...baseConfig.shared,
            // Relaxed version checking for development
            'react': { 
              ...baseConfig.shared.react, 
              strictVersion: false,
              requiredVersion: false 
            }
          },
          experiments: {
            federationRuntime: true  // Enhanced debugging
          }
        };
        
      case 'staging':
        return {
          ...baseConfig,
          remotes: {
            'components': 'components@https://staging.cdn.company.com/components/latest/remoteEntry.js',
            'services': 'services@https://staging.cdn.company.com/services/latest/remoteEntry.js'
          },
          shared: {
            ...baseConfig.shared,
            // Moderate version checking
            'react': { 
              ...baseConfig.shared.react, 
              strictVersion: false,
              requiredVersion: '^18.0.0' 
            }
          }
        };
        
      case 'production':
        return {
          ...baseConfig,
          remotes: {
            'components': 'components@https://cdn.company.com/components/v2.1.3/remoteEntry.js',
            'services': 'services@https://cdn.company.com/services/v1.4.2/remoteEntry.js'
          },
          shared: {
            ...baseConfig.shared,
            // Strict version checking for production
            'react': { 
              ...baseConfig.shared.react, 
              strictVersion: true,
              requiredVersion: '18.2.0' 
            }
          }
        };
    }
  }
}
```

---

## Performance Optimization

### 1. Chunk Splitting Strategies

```typescript
// Optimized webpack configuration for federation
const federationOptimizedConfig = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Separate vendor chunks for better sharing
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
          enforce: true
        },
        
        // Shared modules chunk
        shared: {
          test: (module: any) => {
            return module.resource && 
                   this.isSharedModule(module.resource);
          },
          name: 'shared',
          chunks: 'all',
          priority: 20,
          enforce: true
        },
        
        // Federation runtime
        federation: {
          test: /[\\/]@module-federation[\\/]/,
          name: 'federation-runtime',
          chunks: 'all',
          priority: 30,
          enforce: true
        }
      }
    },
    
    // Minimize runtime overhead
    runtimeChunk: {
      name: 'runtime'
    }
  }
};
```

### 2. Preloading and Prefetching

```typescript
class FederationPreloader {
  private preloadedRemotes = new Set<string>();
  
  async preloadCriticalRemotes(remotes: string[]): Promise<void> {
    const preloadPromises = remotes.map(remoteName => {
      if (this.preloadedRemotes.has(remoteName)) {
        return Promise.resolve();
      }
      
      return this.preloadRemote(remoteName);
    });
    
    await Promise.allSettled(preloadPromises);
  }
  
  private async preloadRemote(remoteName: string): Promise<void> {
    try {
      // Preload the script
      const remoteUrl = this.getRemoteUrl(remoteName);
      await this.preloadScript(remoteUrl);
      
      // Mark as preloaded
      this.preloadedRemotes.add(remoteName);
    } catch (error) {
      console.warn(`Failed to preload remote ${remoteName}:`, error);
    }
  }
  
  private preloadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload ${url}`));
      document.head.appendChild(link);
    });
  }
  
  setupIntelligentPrefetch(): void {
    // Intersection observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const remoteName = entry.target.getAttribute('data-remote');
          if (remoteName && !this.preloadedRemotes.has(remoteName)) {
            this.preloadRemote(remoteName);
          }
        }
      });
    }, { threshold: 0.1 });
    
    // Observe elements that might trigger remote loading
    document.querySelectorAll('[data-remote]').forEach(el => {
      observer.observe(el);
    });
  }
}
```

### 3. Bundle Analysis and Monitoring

```typescript
class FederationAnalyzer {
  static analyzeBundle(stats: webpack.Stats): FederationAnalysis {
    const chunks = Array.from(stats.compilation.chunks);
    const federationChunks = chunks.filter(chunk => 
      this.isFederationChunk(chunk)
    );
    
    return {
      totalSize: this.calculateTotalSize(federationChunks),
      sharedModulesSize: this.calculateSharedSize(federationChunks),
      remoteOverhead: this.calculateRemoteOverhead(federationChunks),
      duplicateModules: this.findDuplicates(federationChunks),
      optimizationSuggestions: this.generateSuggestions(federationChunks)
    };
  }
  
  static generateSuggestions(chunks: webpack.Chunk[]): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Check for shared module opportunities
    const duplicatedModules = this.findDuplicatedModules(chunks);
    if (duplicatedModules.length > 0) {
      suggestions.push({
        type: 'sharing-opportunity',
        impact: 'high',
        message: `Consider sharing these duplicated modules: ${duplicatedModules.join(', ')}`,
        estimatedSavings: this.calculatePotentialSavings(duplicatedModules)
      });
    }
    
    // Check for oversized chunks
    const oversizedChunks = chunks.filter(chunk => chunk.size > 500 * 1024);
    if (oversizedChunks.length > 0) {
      suggestions.push({
        type: 'code-splitting',
        impact: 'medium',
        message: `Large chunks detected, consider further code splitting`,
        affectedChunks: oversizedChunks.map(c => c.name)
      });
    }
    
    return suggestions;
  }
}
```

---

## Troubleshooting & Debugging

### 1. Common Issues and Solutions

#### Version Conflicts
```typescript
class VersionConflictResolver {
  static diagnoseVersionConflict(
    moduleKey: string,
    shareScope: ShareScope
  ): ConflictDiagnosis {
    const versions = shareScope[moduleKey];
    if (!versions || Object.keys(versions).length <= 1) {
      return { hasConflict: false };
    }
    
    const versionList = Object.keys(versions);
    const conflicts = versionList.map(version => ({
      version,
      providers: this.findProviders(moduleKey, version),
      consumers: this.findConsumers(moduleKey, version)
    }));
    
    return {
      hasConflict: true,
      moduleKey,
      conflicts,
      recommendation: this.generateResolutionStrategy(conflicts)
    };
  }
  
  static generateResolutionStrategy(
    conflicts: VersionConflict[]
  ): ResolutionStrategy {
    // Strategy 1: Use highest compatible version
    const sorted = conflicts.sort((a, b) => 
      semver.rcompare(a.version, b.version)
    );
    
    return {
      strategy: 'highest-compatible',
      recommendedVersion: sorted[0].version,
      actions: [
        'Update all consumers to use compatible version range',
        'Consider using singleton: true if appropriate',
        'Test thoroughly after version alignment'
      ]
    };
  }
}
```

#### Remote Loading Failures
```typescript
class RemoteFailureHandler {
  private retryCount = new Map<string, number>();
  private maxRetries = 3;
  
  async loadWithRetry(
    remoteName: string,
    moduleName: string,
    fallback?: any
  ): Promise<any> {
    const key = `${remoteName}/${moduleName}`;
    const attempts = this.retryCount.get(key) || 0;
    
    try {
      const result = await this.loadRemoteModule(remoteName, moduleName);
      this.retryCount.delete(key); // Reset on success
      return result;
    } catch (error) {
      if (attempts < this.maxRetries) {
        this.retryCount.set(key, attempts + 1);
        
        // Exponential backoff
        const delay = Math.pow(2, attempts) * 1000;
        await this.delay(delay);
        
        return this.loadWithRetry(remoteName, moduleName, fallback);
      }
      
      // Max retries reached
      if (fallback) {
        console.warn(`Using fallback for ${key} after ${this.maxRetries} attempts`);
        return fallback;
      }
      
      throw new Error(`Failed to load ${key} after ${this.maxRetries} attempts: ${error.message}`);
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 2. Debug Utilities

```typescript
class FederationDebugger {
  static enableDebugMode(): void {
    (window as any).__FEDERATION_DEBUG__ = true;
    this.patchFederationRuntime();
    this.createDebugPanel();
  }
  
  static inspectShareScope(scopeName: string = 'default'): ShareScopeInfo {
    const scope = window.__webpack_share_scopes__?.[scopeName];
    
    if (!scope) {
      return { exists: false, scopeName };
    }
    
    const modules = Object.keys(scope);
    const versions = Object.entries(scope).reduce((acc, [key, versions]) => {
      acc[key] = Object.keys(versions);
      return acc;
    }, {} as Record<string, string[]>);
    
    return {
      exists: true,
      scopeName,
      modules,
      versions,
      moduleCount: modules.length,
      conflicts: this.findVersionConflicts(scope)
    };
  }
  
  static generateDiagnosticReport(): DiagnosticReport {
    const shareScopes = this.getAllShareScopes();
    const remoteStatus = this.getRemoteStatus();
    const performanceMetrics = this.getPerformanceMetrics();
    
    return {
      timestamp: new Date().toISOString(),
      shareScopes,
      remoteStatus,
      performanceMetrics,
      issues: this.detectIssues(shareScopes, remoteStatus)
    };
  }
  
  private static detectIssues(
    shareScopes: any,
    remoteStatus: any
  ): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = [];
    
    // Check for version conflicts
    Object.entries(shareScopes).forEach(([scopeName, scope]) => {
      Object.entries(scope as ShareScope).forEach(([moduleKey, versions]) => {
        if (Object.keys(versions).length > 1) {
          issues.push({
            type: 'version-conflict',
            severity: 'warning',
            message: `Multiple versions of ${moduleKey} in scope ${scopeName}`,
            moduleKey,
            scopeName,
            versions: Object.keys(versions)
          });
        }
      });
    });
    
    // Check for failed remotes
    Object.entries(remoteStatus).forEach(([remoteName, status]) => {
      if ((status as any).failed) {
        issues.push({
          type: 'remote-failure',
          severity: 'error',
          message: `Remote ${remoteName} failed to load`,
          remoteName,
          error: (status as any).error
        });
      }
    });
    
    return issues;
  }
}
```

### 3. Performance Monitoring

```typescript
class FederationPerformanceMonitor {
  private metrics = new Map<string, PerformanceMetric[]>();
  
  measureRemoteLoad(remoteName: string): PerformanceMeasure {
    const startTime = performance.now();
    
    return {
      end: () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordMetric('remote-load', {
          remoteName,
          duration,
          timestamp: startTime
        });
        
        return duration;
      }
    };
  }
  
  getPerformanceReport(): PerformanceReport {
    const remoteLoadTimes = this.getMetrics('remote-load');
    const moduleResolutionTimes = this.getMetrics('module-resolution');
    
    return {
      averageRemoteLoadTime: this.calculateAverage(remoteLoadTimes, 'duration'),
      slowestRemote: this.findSlowest(remoteLoadTimes),
      totalFederationOverhead: this.calculateTotalOverhead(),
      recommendations: this.generatePerformanceRecommendations()
    };
  }
  
  private generatePerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const avgLoadTime = this.calculateAverage(this.getMetrics('remote-load'), 'duration');
    
    if (avgLoadTime > 2000) {
      recommendations.push('Consider preloading critical remotes');
      recommendations.push('Implement resource hints (preload, prefetch)');
    }
    
    if (this.hasLargeSharedModules()) {
      recommendations.push('Review shared module bundle sizes');
      recommendations.push('Consider code splitting for large shared modules');
    }
    
    return recommendations;
  }
}
```

This comprehensive guide now covers all aspects of Module Federation from basic configuration to advanced runtime patterns and debugging techniques.

#### Why This Timing Matters:

- **ConsumeSharedPlugin** can completely **replace** the module creation process
- **ProvideSharedPlugin** **augments** already-created modules by registering them for sharing
- This allows the same `import 'react'` to be both consumed (from shared scope) and provided (to shared scope) depending on context

---

### Phase 3: Runtime Execution in the Browser

1.  **Loading the Container**: A consuming application's logic encounters `import('host/ExposedModule')`. The `RemoteModule` logic (created during the build) injects a `<script>` tag to load the host's container entry file (e.g., `remoteEntry.js`).

2.  **The Handshake**: The container entry executes and calls its `init()` function. This is the crucial handshake where the **Federation Runtime** comes into play. The `init` function populates the designated share scope (e.g., `__webpack_require__.S.default`) with all the module factories the host has offered to share via `ProvideSharedPlugin`.

3.  **Dependency Resolution with Dynamic Runtime Functions**: The consumer calls the host's `get('./ExposedModule')` function, which returns a module factory. Before executing it, the consumer's runtime must resolve the module's own dependencies (e.g., `import 'react'`).
    *   This triggers the `ConsumeSharedModule` logic which generates **dynamic function names** based on configuration:

#### Runtime Function Generation:

```typescript
// From ConsumeSharedModule.ts codeGeneration method
let fn = 'load';
const args = [JSON.stringify(shareScope), JSON.stringify(shareKey)];

if (requiredVersion) {
  if (strictVersion) fn += 'Strict';
  if (singleton) fn += 'Singleton'; 
  args.push(stringifyHoley(requiredVersion));
  fn += 'VersionCheck';
} else {
  if (singleton) fn += 'Singleton';
}

if (fallbackCode) {
  fn += 'Fallback';
  args.push(fallbackCode);
}

// Results in function names like:
// - load(shareScope, shareKey)
// - loadSingleton(shareScope, shareKey) 
// - loadVersionCheck(shareScope, shareKey, requiredVersion)
// - loadStrictSingletonVersionCheckFallback(shareScope, shareKey, requiredVersion, fallbackCode)
```

4.  **Version Satisfaction Logic**: The **Federation Runtime** performs the actual version checking:
    * It uses the `satisfy` function from `@module-federation/runtime-tools/runtime-core`
    * **If compatible**: It uses the host's module factory from the shared scope
    * **If incompatible or not found**: It falls back to the consumer's own bundled version

5.  **Execution**: Once all shared dependencies are resolved, the `ExposedModule`'s factory is finally executed, rendering the component in the consuming application using shared, single-instance dependencies where possible.

---

### Advanced Implementation Details

#### Share Scope Structure:
```typescript
// Runtime share scope structure
__webpack_require__.S.default = {
  'react': {
    '17.0.2': {
      get: () => moduleFactory,
      loaded: 1,
      eager: false
    }
  }
};
```

#### Container Entry Code Generation:
The `ContainerEntryModule` generates three key functions:
- **`get(moduleRequest)`**: Returns a module factory for the requested exposed module
- **`init(shareScope)`**: Initializes shared scope with provided modules  
- **`moduleMap`**: Static mapping of exposed module names to their implementations

#### Federation Runtime Integration:
The `FederationRuntimePlugin` ensures that:
- Runtime tools are available at `@module-federation/runtime-tools`
- The federation runtime is initialized before any module federation logic executes
- Proper error handling and fallback mechanisms are in place
