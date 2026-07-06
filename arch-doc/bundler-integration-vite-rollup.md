# Module Federation Vite and Rollup Integration Examples

This document owns Vite and Rollup implementation examples. Use [implementation-guide.md](./implementation-guide.md) as the implementation index.

## Bundler-Specific Integration Examples

### Vite Integration

Vite's plugin architecture is built around Rollup plugins with additional hooks for development server integration.

#### Plugin Architecture Integration

```typescript
// vite-module-federation-plugin.ts
import type { Plugin, ResolvedConfig } from 'vite';
import { ModuleFederationPlugin } from './base-plugin';

export function viteFederationPlugin(
  options: ModuleFederationPluginOptions
): Plugin {
  let config: ResolvedConfig;
  const federationPlugin = new ModuleFederationPlugin(options);

  return {
    name: 'vite-module-federation',
    enforce: 'pre', // Run before other plugins

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    buildStart(opts) {
      // Initialize federation during build start
      return federationPlugin.buildStart.call(this, opts);
    },

    resolveId(id, importer) {
      // Handle federation module resolution
      if (federationPlugin.shouldInterceptResolve(id)) {
        return federationPlugin.resolveId(id, importer);
      }
      return null;
    },

    load(id) {
      // Load federation modules
      if (federationPlugin.isFederationModule(id)) {
        return federationPlugin.load(id);
      }
      return null;
    },

    generateBundle(opts, bundle) {
      // Generate federation assets
      return federationPlugin.generateBundle(opts, bundle);
    },

    // Vite-specific: Handle HMR for federation modules
    handleHotUpdate(ctx) {
      if (federationPlugin.shouldHandleHMR(ctx.file)) {
        return federationPlugin.handleHotUpdate(ctx);
      }
    },

    // Vite-specific: Configure development server
    configureServer(server) {
      // Add middleware for serving remote entries
      server.middlewares.use('/remoteEntry.js', (req, res, next) => {
        if (req.method === 'GET') {
          const remoteEntry = federationPlugin.generateRemoteEntry();
          res.setHeader('Content-Type', 'application/javascript');
          res.end(remoteEntry);
        } else {
          next();
        }
      });

      // Handle federation module requests
      server.middlewares.use('/__federation', (req, res, next) => {
        const modulePath = req.url?.slice(13); // Remove /__federation
        if (modulePath) {
          const moduleContent = federationPlugin.getExposedModule(modulePath);
          if (moduleContent) {
            res.setHeader('Content-Type', 'application/javascript');
            res.end(moduleContent);
            return;
          }
        }
        next();
      });
    }
  };
}
```

#### Module Resolution Integration

```typescript
// vite-federation-resolver.ts
export class ViteFederationResolver {
  constructor(private options: ModuleFederationPluginOptions) {}

  resolveId(id: string, importer?: string) {
    // Handle remote module resolution
    if (this.isRemoteModule(id)) {
      return this.resolveRemoteModule(id);
    }

    // Handle shared module resolution
    if (this.isSharedModule(id)) {
      return this.resolveSharedModule(id);
    }

    return null;
  }

  private isRemoteModule(id: string): boolean {
    const remotes = this.options.remotes || {};
    return Object.keys(remotes).some(remote =>
      id.startsWith(`${remote}/`)
    );
  }

  private resolveRemoteModule(id: string) {
    const [remoteName, modulePath] = id.split('/');
    const remoteConfig = this.options.remotes?.[remoteName];

    if (!remoteConfig) {
      throw new Error(`Remote "${remoteName}" not found in configuration`);
    }

    // Return virtual module ID for remote
    return {
      id: `virtual:federation-remote:${id}`,
      external: false
    };
  }

  private resolveSharedModule(id: string) {
    const sharedConfig = this.options.shared?.[id];

    if (!sharedConfig) {
      return null;
    }

    // Return virtual module ID for shared
    return {
      id: `virtual:federation-shared:${id}`,
      external: false
    };
  }
}
```

#### Asset Handling Specifics

```typescript
// vite-federation-assets.ts
export class ViteFederationAssets {
  constructor(private config: ResolvedConfig) {}

  generateRemoteEntry(): string {
    const { base, build } = this.config;

    return `
      // Vite-specific remote entry
      const moduleMap = {
        ${Object.entries(this.options.exposes || {})
          .map(([key, path]) => {
            const chunkName = this.getChunkName(path);
            const assetPath = `${base}${build.assetsDir}/${chunkName}`;

            return `"${key}": () => import("${assetPath}")`;
          })
          .join(',\n        ')}
      };

      const get = (module) => {
        return moduleMap[module] ? moduleMap[module]() :
          Promise.reject(new Error(\`Module "\${module}" not found\`));
      };

      const init = (shareScope) => {
        // Vite-specific share scope initialization
        if (!window.__VITE_FEDERATION_SHARE_SCOPE__) {
          window.__VITE_FEDERATION_SHARE_SCOPE__ = {};
        }
        Object.assign(window.__VITE_FEDERATION_SHARE_SCOPE__, shareScope);
        return Promise.resolve();
      };

      export { get, init };
    `;
  }

  handleAssetGeneration(bundle: OutputBundle) {
    // Process each exposed module
    Object.entries(this.options.exposes || {}).forEach(([key, path]) => {
      const chunk = this.findChunkForModule(bundle, path);
      if (chunk && chunk.type === 'chunk') {
        // Add federation metadata to chunk
        chunk.viteMetadata = {
          ...chunk.viteMetadata,
          federation: {
            exposed: true,
            key,
            path
          }
        };
      }
    });
  }
}
```

#### Development Server Integration

```typescript
// vite-federation-dev-server.ts
export class ViteFederationDevServer {
  constructor(
    private server: ViteDevServer,
    private options: ModuleFederationPluginOptions
  ) {}

  setupMiddleware() {
    // Serve remote entry during development
    this.server.middlewares.use('/remoteEntry.js', async (req, res) => {
      const remoteEntry = await this.generateDevRemoteEntry();
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-cache');
      res.end(remoteEntry);
    });

    // Handle exposed module requests
    this.server.middlewares.use('/__vite_federation', async (req, res) => {
      const modulePath = req.url?.slice(18); // Remove /__vite_federation
      if (modulePath && this.isExposedModule(modulePath)) {
        const moduleContent = await this.generateExposedModule(modulePath);
        res.setHeader('Content-Type', 'application/javascript');
        res.end(moduleContent);
      } else {
        res.statusCode = 404;
        res.end('Module not found');
      }
    });
  }

  private async generateDevRemoteEntry(): Promise<string> {
    const exposedModules = Object.entries(this.options.exposes || {});

    return `
      // Development remote entry for Vite
      const moduleMap = {
        ${exposedModules.map(([key, path]) => `
          "${key}": () => import("/__vite_federation${path}")
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
        if (!window.__VITE_DEV_FEDERATION__) {
          window.__VITE_DEV_FEDERATION__ = { shareScope: {} };
        }
        Object.assign(window.__VITE_DEV_FEDERATION__.shareScope, shareScope);
        return Promise.resolve();
      };

      window["${this.options.name}"] = { get, init };
    `;
  }
}
```

### Rollup Integration

Rollup's plugin system is more straightforward, focusing on the build process with hooks for different compilation phases.

#### Plugin Architecture Integration

```typescript
// rollup-module-federation-plugin.ts
import type { Plugin, OutputBundle, RenderedChunk } from 'rollup';

export function rollupFederationPlugin(
  options: ModuleFederationPluginOptions
): Plugin {
  const federationModules = new Map<string, string>();
  const remoteModules = new Set<string>();

  return {
    name: 'rollup-module-federation',

    buildStart(opts) {
      // Validate options and initialize federation state
      this.validateOptions(options);
      this.initializeFederationState();
    },

    resolveId(id, importer) {
      // Handle federation module resolution
      if (this.isRemoteModule(id)) {
        const remoteId = `federation-remote:${id}`;
        remoteModules.add(id);
        return remoteId;
      }

      if (this.isSharedModule(id)) {
        const sharedId = `federation-shared:${id}`;
        return sharedId;
      }

      return null;
    },

    load(id) {
      // Generate virtual modules for federation
      if (id.startsWith('federation-remote:')) {
        const originalId = id.slice(18); // Remove prefix
        return this.generateRemoteModule(originalId);
      }

      if (id.startsWith('federation-shared:')) {
        const originalId = id.slice(18); // Remove prefix
        return this.generateSharedModule(originalId);
      }

      return null;
    },

    generateBundle(opts, bundle) {
      // Generate remote entry if this is a container
      if (options.exposes) {
        this.generateRemoteEntryChunk(bundle);
      }

      // Add federation runtime
      this.addFederationRuntime(bundle);

      // Process exposed modules
      this.processExposedModules(bundle);
    },

    writeBundle(opts, bundle) {
      // Post-process federation assets
      this.postProcessFederationAssets(opts, bundle);
    }
  };
}
```

#### Module Resolution Integration

```typescript
// rollup-federation-resolver.ts
export class RollupFederationResolver {
  constructor(private options: ModuleFederationPluginOptions) {}

  generateRemoteModule(remoteId: string): string {
    const [remoteName, modulePath] = remoteId.split('/');
    const remoteConfig = this.options.remotes?.[remoteName];

    if (!remoteConfig) {
      throw new Error(`Remote "${remoteName}" not configured`);
    }

    return `
      // Rollup remote module: ${remoteId}
      const loadRemote = async () => {
        // Load remote container
        if (!window["${remoteName}"]) {
          await this.loadRemoteContainer("${remoteName}", "${remoteConfig.url}");
        }

        const container = window["${remoteName}"];
        if (!container) {
          throw new Error('Remote container failed to load');
        }

        // Initialize if needed
        if (!container._initialized) {
          await container.init(window.__FEDERATION_SHARED__ || {});
          container._initialized = true;
        }

        // Get module
        const factory = await container.get("${modulePath}");
        return factory();
      };

      export default loadRemote;
      export const __federation_remote = true;
    `;
  }

  generateSharedModule(moduleId: string): string {
    const sharedConfig = this.options.shared?.[moduleId];

    if (!sharedConfig) {
      throw new Error(`Shared module "${moduleId}" not configured`);
    }

    return `
      // Rollup shared module: ${moduleId}
      const getSharedModule = () => {
        const shareScope = window.__FEDERATION_SHARED__ || {};
        const shared = shareScope["${moduleId}"];

        if (shared) {
          return shared.get();
        }

        // Fallback to local version
        ${sharedConfig.import ?
          `return import("${sharedConfig.import}");` :
          `throw new Error('Shared module "${moduleId}" not available');`
        }
      };

      export default getSharedModule;
      export const __federation_shared = true;
    `;
  }
}
```

#### Asset Handling Specifics

```typescript
// rollup-federation-assets.ts
export class RollupFederationAssets {
  generateRemoteEntryChunk(bundle: OutputBundle) {
    const exposedModules = this.options.exposes || {};
    const remoteEntryCode = this.generateRemoteEntryCode(exposedModules, bundle);

    // Add remote entry chunk to bundle
    bundle['remoteEntry.js'] = {
      type: 'chunk',
      isEntry: true,
      name: 'remoteEntry',
      fileName: 'remoteEntry.js',
      code: remoteEntryCode,
      map: null,
      sourcemapFileName: null,
      preliminaryFileName: 'remoteEntry.js',
      facadeModuleId: null,
      isDynamicEntry: false,
      isImplicitEntry: false,
      implicitlyLoadedBefore: [],
      importedBindings: {},
      imports: [],
      exports: ['get', 'init'],
      modules: {},
      referencedFiles: []
    };
  }

  private generateRemoteEntryCode(
    exposedModules: Record<string, string>,
    bundle: OutputBundle
  ): string {
    const moduleEntries = Object.entries(exposedModules).map(([key, path]) => {
      const chunk = this.findChunkForModule(bundle, path);
      const chunkFileName = chunk?.fileName || `${key}.js`;

      return `
        "${key}": () => import("./${chunkFileName}")
          .then(module => () => module)
      `;
    });

    return `
      // Rollup Remote Entry
      const moduleMap = {
        ${moduleEntries.join(',\n        ')}
      };

      const get = async (module) => {
        const factory = moduleMap[module];
        if (!factory) {
          throw new Error(\`Module "\${module}" not exposed\`);
        }
        return factory();
      };

      const init = (shareScope) => {
        if (!window.__FEDERATION_SHARED__) {
          window.__FEDERATION_SHARED__ = {};
        }
        Object.assign(window.__FEDERATION_SHARED__, shareScope);
        return Promise.resolve();
      };

      export { get, init };
    `;
  }

  processExposedModules(bundle: OutputBundle) {
    // Mark exposed modules in bundle metadata
    Object.entries(this.options.exposes || {}).forEach(([key, path]) => {
      const chunk = this.findChunkForModule(bundle, path);
      if (chunk && chunk.type === 'chunk') {
        // Add federation metadata
        (chunk as any).federationMeta = {
          exposed: true,
          key,
          originalPath: path
        };
      }
    });
  }
}
```

#### Build Output Requirements

```typescript
// rollup-federation-output.ts
export class RollupFederationOutput {
  constructor(private options: ModuleFederationPluginOptions) {}

  configureOutput(outputOptions: OutputOptions): OutputOptions {
    return {
      ...outputOptions,

      // Ensure proper format for federation
      format: 'system', // or 'amd', 'umd' for broader compatibility

      // Configure external handling
      external: (id) => {
        if (this.isRemoteModule(id)) {
          return true; // Mark remotes as external
        }
        return false;
      },

      // Configure globals for externals
      globals: (id) => {
        if (this.isRemoteModule(id)) {
          const [remoteName] = id.split('/');
          return `window["${remoteName}"]`;
        }
        return id;
      },

      // Ensure proper chunk naming
      chunkFileNames: (chunkInfo) => {
        // Use federation-friendly names
        if (chunkInfo.name && this.isExposedModule(chunkInfo.name)) {
          return `federation-[name]-[hash].js`;
        }
        return '[name]-[hash].js';
      },

      // Configure entry point naming
      entryFileNames: (chunkInfo) => {
        if (chunkInfo.name === 'remoteEntry') {
          return 'remoteEntry.js';
        }
        return '[name].js';
      }
    };
  }

  generateManifest(bundle: OutputBundle): FederationManifest {
    const manifest: FederationManifest = {
      name: this.options.name || 'unknown',
      remoteEntry: 'remoteEntry.js',
      shared: {},
      exposes: {},
      remotes: this.options.remotes || {}
    };

    // Add exposed modules to manifest
    Object.entries(this.options.exposes || {}).forEach(([key, path]) => {
      const chunk = this.findChunkForModule(bundle, path);
      if (chunk) {
        manifest.exposes[key] = {
          file: chunk.fileName,
          requires: chunk.imports || []
        };
      }
    });

    // Add shared modules to manifest
    Object.entries(this.options.shared || {}).forEach(([key, config]) => {
      manifest.shared[key] = {
        version: config.version || '0.0.0',
        singleton: config.singleton || false,
        eager: config.eager || false
      };
    });

    return manifest;
  }
}
```
