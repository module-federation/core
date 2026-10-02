# Module Federation Esbuild and Common Bundler Integration Examples

This document owns Esbuild implementation examples and common integration patterns. Use [implementation-guide.md](./implementation-guide.md) as the implementation index.

## Bundler-Specific Integration Examples

### esbuild Integration

esbuild's plugin system is more limited but highly performant, requiring creative solutions for complex transformations.

#### Plugin Architecture Integration

```typescript
// esbuild-module-federation-plugin.ts
import type { Plugin, BuildOptions } from 'esbuild';

export function esbuildFederationPlugin(
  options: ModuleFederationPluginOptions
): Plugin {
  return {
    name: 'esbuild-module-federation',
    setup(build) {
      const { onResolve, onLoad, initialOptions } = build;

      // Configure external handling for remotes
      this.configureExternals(build, options);

      // Handle remote module resolution
      onResolve({ filter: /^[^\/]+\/.*/ }, (args) => {
        if (this.isRemoteModule(args.path, options)) {
          return {
            path: args.path,
            namespace: 'federation-remote'
          };
        }
        return undefined;
      });

      // Handle shared module resolution
      onResolve({ filter: /.*/ }, (args) => {
        if (this.isSharedModule(args.path, options)) {
          return {
            path: args.path,
            namespace: 'federation-shared'
          };
        }
        return undefined;
      });

      // Load remote modules
      onLoad({ filter: /.*/, namespace: 'federation-remote' }, (args) => {
        return {
          contents: this.generateRemoteModule(args.path, options),
          loader: 'js'
        };
      });

      // Load shared modules
      onLoad({ filter: /.*/, namespace: 'federation-shared' }, (args) => {
        return {
          contents: this.generateSharedModule(args.path, options),
          loader: 'js'
        };
      });

      // Generate remote entry
      if (options.exposes) {
        this.setupRemoteEntryGeneration(build, options);
      }
    }
  };
}
```

#### Module Resolution Integration

```typescript
// esbuild-federation-resolver.ts
export class EsbuildFederationResolver {
  constructor(private options: ModuleFederationPluginOptions) {}

  generateRemoteModule(remotePath: string): string {
    const [remoteName, modulePath] = remotePath.split('/');
    const remoteConfig = this.options.remotes?.[remoteName];

    if (!remoteConfig) {
      throw new Error(`Remote "${remoteName}" not configured`);
    }

    return `
      // esbuild remote module: ${remotePath}
      const loadRemoteModule = async () => {
        // Dynamic import for remote container
        const containerUrl = "${remoteConfig.url || remoteConfig}";

        // Load remote container script
        if (!window["${remoteName}"]) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = containerUrl;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        const container = window["${remoteName}"];
        if (!container) {
          throw new Error(\`Remote container "\${remoteName}" failed to load\`);
        }

        // Initialize container
        await container.init(window.__FEDERATION_SHARED_SCOPE__ || {});

        // Get module
        const factory = await container.get("${modulePath}");
        return factory();
      };

      export default loadRemoteModule();
    `;
  }

  generateSharedModule(moduleId: string): string {
    const sharedConfig = this.options.shared?.[moduleId];

    if (!sharedConfig) {
      return `throw new Error('Shared module "${moduleId}" not configured');`;
    }

    return `
      // esbuild shared module: ${moduleId}
      const loadSharedModule = () => {
        const shareScope = window.__FEDERATION_SHARED_SCOPE__ || {};
        const sharedModule = shareScope["${moduleId}"];

        if (sharedModule && sharedModule.loaded) {
          return sharedModule.get();
        }

        // Load from share scope or fallback
        if (sharedModule) {
          return sharedModule.get();
        }

        // Local fallback
        ${sharedConfig.import ?
          `return import("${sharedConfig.import}");` :
          `throw new Error('Shared module "${moduleId}" not available');`
        }
      };

      export default loadSharedModule();
    `;
  }
}
```

#### Asset Handling Specifics

```typescript
// esbuild-federation-assets.ts
export class EsbuildFederationAssets {
  constructor(private options: ModuleFederationPluginOptions) {}

  setupRemoteEntryGeneration(build: PluginBuild) {
    // Add virtual remote entry to entry points
    build.onResolve({ filter: /^__federation_remote_entry__$/ }, () => {
      return {
        path: '__federation_remote_entry__',
        namespace: 'federation-entry'
      };
    });

    build.onLoad({ filter: /.*/, namespace: 'federation-entry' }, () => {
      return {
        contents: this.generateRemoteEntryContent(),
        loader: 'js'
      };
    });

    // Add remote entry to entry points
    const originalEntryPoints = build.initialOptions.entryPoints || {};
    build.initialOptions.entryPoints = {
      ...originalEntryPoints,
      remoteEntry: '__federation_remote_entry__'
    };
  }

  private generateRemoteEntryContent(): string {
    const exposedModules = this.options.exposes || {};

    return `
      // esbuild Remote Entry
      const moduleMap = {
        ${Object.entries(exposedModules).map(([key, path]) => `
          "${key}": () => import("${path}")
            .then(module => () => module)
        `).join(',\n        ')}
      };

      const get = async (module) => {
        const factory = moduleMap[module];
        if (!factory) {
          throw new Error(\`Module "\${module}" not exposed\`);
        }
        return factory();
      };

      const init = (shareScope) => {
        if (!window.__FEDERATION_SHARED_SCOPE__) {
          window.__FEDERATION_SHARED_SCOPE__ = {};
        }
        Object.assign(window.__FEDERATION_SHARED_SCOPE__, shareScope);
        return Promise.resolve();
      };

      // Register container globally
      window["${this.options.name}"] = { get, init };

      export { get, init };
    `;
  }

  configureExternals(build: PluginBuild) {
    // Mark remote modules as external
    const remotes = Object.keys(this.options.remotes || {});
    const remotePattern = new RegExp(`^(${remotes.join('|')})/`);

    build.onResolve({ filter: remotePattern }, (args) => {
      return {
        path: args.path,
        external: true
      };
    });
  }
}
```

#### Development Server Integration

```typescript
// esbuild-federation-dev-server.ts
export class EsbuildFederationDevServer {
  constructor(private options: ModuleFederationPluginOptions) {}

  setupDevServer(serveOptions: ServeOptions): ServeOptions {
    return {
      ...serveOptions,

      // Add custom handling for federation assets
      onRequest: (args) => {
        if (args.path === '/remoteEntry.js') {
          return this.serveRemoteEntry();
        }

        if (args.path.startsWith('/__federation/')) {
          const modulePath = args.path.slice(14);
          return this.serveExposedModule(modulePath);
        }

        return undefined;
      }
    };
  }

  private serveRemoteEntry(): ServeOnRequestArgs {
    const remoteEntryContent = this.generateDevRemoteEntry();

    return {
      contents: remoteEntryContent,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache'
      }
    };
  }

  private generateDevRemoteEntry(): string {
    const exposedModules = this.options.exposes || {};

    return `
      // esbuild Dev Remote Entry
      const moduleMap = {
        ${Object.entries(exposedModules).map(([key, path]) => `
          "${key}": () => fetch("/__federation${path}")
            .then(response => response.text())
            .then(code => {
              const module = eval(code);
              return () => module;
            })
        `).join(',\n        ')}
      };

      const get = async (module) => {
        const factory = moduleMap[module];
        if (!factory) {
          throw new Error(\`Module "\${module}" not exposed\`);
        }
        return factory();
      };

      const init = (shareScope) => {
        window.__FEDERATION_DEV_SHARED__ = {
          ...(window.__FEDERATION_DEV_SHARED__ || {}),
          ...shareScope
        };
        return Promise.resolve();
      };

      window["${this.options.name}"] = { get, init };
    `;
  }
}
```

#### Runtime Bridge Implementation

```typescript
// esbuild-federation-runtime.ts
export class EsbuildFederationRuntime {
  constructor(private options: ModuleFederationPluginOptions) {}

  generateRuntimeBridge(): string {
    return `
      // esbuild Federation Runtime Bridge
      (function() {
        if (typeof window === 'undefined') return;

        // Initialize federation runtime
        if (!window.__FEDERATION_RUNTIME__) {
          window.__FEDERATION_RUNTIME__ = {
            shareScope: {},
            containers: {},

            // Register remote container
            registerRemote(name, container) {
              this.containers[name] = container;
            },

            // Load remote module
            async loadRemote(remotePath) {
              const [remoteName, modulePath] = remotePath.split('/');
              const container = this.containers[remoteName];

              if (!container) {
                throw new Error(\`Remote "\${remoteName}" not registered\`);
              }

              if (!container._initialized) {
                await container.init(this.shareScope);
                container._initialized = true;
              }

              const factory = await container.get(modulePath);
              return factory();
            },

            // Register shared module
            registerShared(name, version, factory) {
              if (!this.shareScope[name]) {
                this.shareScope[name] = {};
              }

              this.shareScope[name][version] = {
                loaded: false,
                get: factory
              };
            },

            // Get shared module
            async getShared(name, requiredVersion) {
              const shared = this.shareScope[name];
              if (!shared) {
                throw new Error(\`Shared module "\${name}" not found\`);
              }

              // Simple version resolution (enhance as needed)
              const availableVersions = Object.keys(shared);
              const version = availableVersions.find(v =>
                this.satisfiesVersion(v, requiredVersion)
              ) || availableVersions[0];

              if (!version) {
                throw new Error(\`No compatible version of "\${name}" found\`);
              }

              return shared[version].get();
            },

            // Simple semver check
            satisfiesVersion(available, required) {
              // Implement proper semver logic here
              return available === required || required === '*';
            }
          };
        }

        // Expose runtime globally
        window.__federation__ = window.__FEDERATION_RUNTIME__;

        // Register this container if configured
        ${this.options.name ? `
          const containerName = "${this.options.name}";
          if (window[containerName]) {
            window.__FEDERATION_RUNTIME__.registerRemote(
              containerName,
              window[containerName]
            );
          }
        ` : ''}
      })();
    `;
  }

  injectRuntime(build: PluginBuild) {
    // Add runtime injection to all entry points
    build.onLoad({ filter: /.*/, namespace: 'file' }, async (args) => {
      if (this.isEntryPoint(args.path)) {
        const originalContents = await fs.readFile(args.path, 'utf8');
        const runtimeBridge = this.generateRuntimeBridge();

        return {
          contents: `${runtimeBridge}\n${originalContents}`,
          loader: 'js'
        };
      }

      return undefined;
    });
  }
}
```

### Common Integration Patterns

#### Universal Remote Loading

```typescript
// universal-remote-loader.ts
export class UniversalRemoteLoader {
  static async loadRemote(
    remoteName: string,
    modulePath: string,
    remoteEntry?: string
  ) {
    // Auto-detect bundler environment
    const bundlerEnv = this.detectBundlerEnvironment();

    switch (bundlerEnv) {
      case 'webpack':
        return this.loadWebpackRemote(remoteName, modulePath);

      case 'vite':
        return this.loadViteRemote(remoteName, modulePath, remoteEntry);

      case 'rollup':
        return this.loadRollupRemote(remoteName, modulePath, remoteEntry);

      case 'esbuild':
        return this.loadEsbuildRemote(remoteName, modulePath, remoteEntry);

      default:
        return this.loadGenericRemote(remoteName, modulePath, remoteEntry);
    }
  }

  private static detectBundlerEnvironment(): string {
    if (typeof __webpack_require__ !== 'undefined') {
      return 'webpack';
    }

    if (typeof import.meta?.hot !== 'undefined') {
      return 'vite';
    }

    if (typeof window !== 'undefined' && window.__ROLLUP_FEDERATION__) {
      return 'rollup';
    }

    if (typeof window !== 'undefined' && window.__ESBUILD_FEDERATION__) {
      return 'esbuild';
    }

    return 'generic';
  }

  private static async loadWebpackRemote(remoteName: string, modulePath: string) {
    const container = window[remoteName];
    if (!container) {
      throw new Error(`Remote "${remoteName}" not loaded`);
    }

    await container.init(__webpack_share_scopes__.default);
    const factory = await container.get(modulePath);
    return factory();
  }

  private static async loadViteRemote(
    remoteName: string,
    modulePath: string,
    remoteEntry?: string
  ) {
    if (!window[remoteName] && remoteEntry) {
      await this.loadScript(remoteEntry);
    }

    const container = window[remoteName];
    if (!container) {
      throw new Error(`Remote "${remoteName}" failed to load`);
    }

    await container.init(window.__VITE_FEDERATION_SHARE_SCOPE__ || {});
    const factory = await container.get(modulePath);
    return factory();
  }
}
```

#### Shared Module Synchronization

```typescript
// shared-sync.ts
export class SharedModuleSync {
  static syncSharedModules(bundlerType: string, shareScope: any) {
    switch (bundlerType) {
      case 'webpack':
        return this.syncWebpackShared(shareScope);

      case 'vite':
        return this.syncViteShared(shareScope);

      case 'rollup':
        return this.syncRollupShared(shareScope);

      case 'esbuild':
        return this.syncEsbuildShared(shareScope);
    }
  }

  private static syncWebpackShared(shareScope: any) {
    if (typeof __webpack_share_scopes__ !== 'undefined') {
      Object.assign(__webpack_share_scopes__.default, shareScope);
    }
  }

  private static syncViteShared(shareScope: any) {
    if (!window.__VITE_FEDERATION_SHARE_SCOPE__) {
      window.__VITE_FEDERATION_SHARE_SCOPE__ = {};
    }
    Object.assign(window.__VITE_FEDERATION_SHARE_SCOPE__, shareScope);
  }

  private static syncRollupShared(shareScope: any) {
    if (!window.__FEDERATION_SHARED__) {
      window.__FEDERATION_SHARED__ = {};
    }
    Object.assign(window.__FEDERATION_SHARED__, shareScope);
  }

  private static syncEsbuildShared(shareScope: any) {
    if (!window.__FEDERATION_SHARED_SCOPE__) {
      window.__FEDERATION_SHARED_SCOPE__ = {};
    }
    Object.assign(window.__FEDERATION_SHARED_SCOPE__, shareScope);
  }
}
```
