# Module Federation Manifest Specification

This document defines the complete JSON schema specifications for Module Federation manifest files, which are essential for cross-bundler compatibility and runtime optimization.

## Table of Contents
- [Overview](#overview)
- [Federation Manifest Schema](#federation-manifest-schema)
- [MF Manifest Schema](#mf-manifest-schema)
- [Shared Manifest Schema](#shared-manifest-schema)
- [Examples](#examples)
- [Validation](#validation)

## Overview

Module Federation uses several manifest files to coordinate runtime behavior:

1. **`federation-manifest.json`** - Complete application metadata with all remotes and modules
2. **`mf-manifest.json`** - Individual remote manifest with exposed modules
3. **`shared-manifest.json`** - Shared dependency information (optional)

These manifests enable:
- Runtime module discovery and loading
- Version negotiation for shared dependencies
- Performance optimization through preloading
- Cross-bundler interoperability

## Federation Manifest Schema

The main federation manifest (`federation-manifest.json`) provides a complete view of the federated application:

```typescript
interface FederationManifest {
  /** 
   * Unique identifier for this federated application
   * Used for runtime instance identification
   */
  id: string;
  
  /**
   * Human-readable name of the application
   */
  name: string;
  
  /**
   * Metadata about the build and environment
   */
  metaData: {
    /** Application version */
    version: string;
    /** Build identifier for cache busting */
    buildVersion: string;
    /** Public path for assets */
    publicPath: string;
    /** Production/development mode */
    mode: 'development' | 'production';
    /** Target environment */
    target: 'web' | 'node' | 'webworker';
    /** Build timestamp */
    timestamp?: number;
    /** Bundler information */
    bundler?: {
      name: string;
      version: string;
    };
  };
  
  /**
   * Remote applications this host can consume
   */
  remotes: RemoteManifest[];
  
  /**
   * Modules exposed by this application
   */
  exposes?: ExposeManifest[];
  
  /**
   * Shared dependencies configuration
   */
  shared?: SharedManifest[];
  
  /**
   * Runtime plugins to be loaded
   */
  runtimePlugins?: RuntimePluginManifest[];
  
  /**
   * Performance and optimization hints
   */
  snapshot?: SnapshotManifest;
}

interface RemoteManifest {
  /** Unique identifier for the remote */
  id: string;
  /** Human-readable name */
  name: string;
  /** Remote entry point URL */
  entry: string;
  /** Alternative entry points for different environments */
  entryGlobalName?: string;
  /** Type of remote ('module' | 'var' | 'assign' | 'this' | 'window' | 'self' | 'global' | 'commonjs' | 'commonjs2' | 'amd' | 'umd' | 'jsonp' | 'system') */
  type?: string;
  /** Version information */
  version: string;
  /** Build version for cache busting */
  buildVersion: string;
  /** Public path for this remote's assets */
  publicPath?: string;
  /** Available modules (populated at runtime or build time) */
  modules?: ModuleInfo[];
  /** Runtime availability status */
  status?: 'loading' | 'loaded' | 'failed';
}

interface ExposeManifest {
  /** Module key as exposed to other applications */
  key: string;
  /** Internal module path or identifier */
  module: string;
  /** Human-readable name */
  name?: string;
  /** Module type information */
  type?: 'component' | 'utility' | 'service' | 'constant';
  /** Dependencies required by this module */
  dependencies?: string[];
  /** Size information in bytes */
  size?: number;
}

interface SharedManifest {
  /** Package name */
  name: string;
  /** Required version range */
  version: string;
  /** Share scope name */
  scope?: string;
  /** Singleton requirement */
  singleton?: boolean;
  /** Strict version matching */
  strictVersion?: boolean;
  /** Load eagerly */
  eager?: boolean;
  /** Required at runtime */
  requiredVersion?: string;
  /** Package location */
  import?: string;
  /** Package identifier for bundler */
  packageName?: string;
}

interface RuntimePluginManifest {
  /** Plugin name */
  name: string;
  /** Plugin entry point URL */
  entry: string;
  /** Plugin version */
  version: string;
  /** Load priority */
  priority?: number;
  /** Environment constraints */
  environment?: ('development' | 'production')[];
}

interface SnapshotManifest {
  /** Global module information for optimization */
  moduleInfo: {
    [remoteName: string]: {
      version: string;
      buildVersion: string;
      modules: ModuleInfo[];
    };
  };
  /** Preload suggestions */
  preloadAssets?: PreloadAsset[];
}

interface ModuleInfo {
  /** Module identifier */
  id: string;
  /** Module key */
  key: string;
  /** File path or URL */
  path: string;
  /** Module size in bytes */
  size?: number;
  /** Chunk information */
  chunks?: string[];
  /** Assets required by this module */
  assets?: AssetInfo[];
}

interface PreloadAsset {
  /** Asset URL */
  url: string;
  /** Asset type */
  type: 'script' | 'style' | 'font' | 'image';
  /** Preload priority */
  priority: 'high' | 'low';
  /** Cross-origin setting */
  crossorigin?: 'anonymous' | 'use-credentials';
}

interface AssetInfo {
  /** Asset path */
  path: string;
  /** Asset type */
  type: 'js' | 'css' | 'wasm' | 'json';
  /** Asset size in bytes */
  size?: number;
}
```

## MF Manifest Schema

Individual remote manifests (`mf-manifest.json`) provide detailed information about a specific remote:

```typescript
interface MFManifest {
  /** Remote identifier */
  id: string;
  /** Remote name */
  name: string;
  /** Build metadata */
  metaData: {
    version: string;
    buildVersion: string;
    publicPath: string;
    mode: 'development' | 'production';
    target: 'web' | 'node' | 'webworker';
    timestamp?: number;
  };
  
  /** Exposed modules */
  exposes: {
    [key: string]: {
      /** Import path within the remote */
      import: string;
      /** Module name */
      name?: string;
      /** File assets for this module */
      assets?: {
        js?: {
          async?: string[];
          sync?: string[];
        };
        css?: {
          async?: string[];
          sync?: string[];
        };
      };
    };
  };
  
  /** Shared dependencies provided by this remote */
  shared?: {
    [packageName: string]: {
      version: string;
      scope?: string;
      singleton?: boolean;
      eager?: boolean;
      assets?: AssetInfo[];
    };
  };
  
  /** Remote-specific runtime plugins */
  runtimePlugins?: RuntimePluginManifest[];
}
```

## Shared Manifest Schema

Optional shared dependency manifest (`shared-manifest.json`):

```typescript
interface SharedManifest {
  /** Share scope name */
  scope: string;
  
  /** Available shared packages */
  shared: {
    [packageName: string]: {
      /** Available versions */
      versions: {
        [version: string]: {
          /** Package factory function location */
          get: string;
          /** Whether package is loaded */
          loaded?: boolean;
          /** Source remote name */
          from: string;
          /** Load eagerly */
          eager: boolean;
          /** Strict version requirement */
          strict?: boolean;
        };
      };
    };
  };
}
```

## Examples

### Complete Federation Manifest Example

```json
{
  "id": "host-app",
  "name": "Host Application",
  "metaData": {
    "version": "1.2.0",
    "buildVersion": "1.2.0-20240301.123456",
    "publicPath": "/",
    "mode": "production",
    "target": "web",
    "timestamp": 1709289296123,
    "bundler": {
      "name": "webpack",
      "version": "5.89.0"
    }
  },
  "remotes": [
    {
      "id": "shell",
      "name": "Shell Remote",
      "entry": "https://cdn.example.com/shell/remoteEntry.js",
      "entryGlobalName": "shell",
      "type": "var",
      "version": "2.1.0",
      "buildVersion": "2.1.0-20240301.098765",
      "publicPath": "https://cdn.example.com/shell/",
      "modules": [
        {
          "id": "./Header",
          "key": "./Header",
          "path": "src/components/Header.js",
          "size": 15420,
          "chunks": ["header_chunk"],
          "assets": [
            {
              "path": "header.css",
              "type": "css",
              "size": 2048
            }
          ]
        }
      ]
    }
  ],
  "exposes": [
    {
      "key": "./App",
      "module": "./src/App.tsx",
      "name": "Main Application",
      "type": "component",
      "dependencies": ["react", "react-dom"],
      "size": 45000
    }
  ],
  "shared": [
    {
      "name": "react",
      "version": "^18.0.0",
      "scope": "default",
      "singleton": true,
      "strictVersion": false,
      "eager": false,
      "requiredVersion": "18.2.0",
      "import": "react",
      "packageName": "react"
    }
  ],
  "runtimePlugins": [
    {
      "name": "error-boundary-plugin",
      "entry": "./plugins/errorBoundary.js",
      "version": "1.0.0",
      "priority": 10,
      "environment": ["development", "production"]
    }
  ],
  "snapshot": {
    "moduleInfo": {
      "shell": {
        "version": "2.1.0",
        "buildVersion": "2.1.0-20240301.098765",
        "modules": [
          {
            "id": "./Header",
            "key": "./Header",
            "path": "src/components/Header.js",
            "size": 15420
          }
        ]
      }
    },
    "preloadAssets": [
      {
        "url": "https://cdn.example.com/shell/remoteEntry.js",
        "type": "script",
        "priority": "high",
        "crossorigin": "anonymous"
      }
    ]
  }
}
```

### MF Manifest Example

```json
{
  "id": "shell",
  "name": "Shell Remote",
  "metaData": {
    "version": "2.1.0",
    "buildVersion": "2.1.0-20240301.098765",
    "publicPath": "https://cdn.example.com/shell/",
    "mode": "production",
    "target": "web",
    "timestamp": 1709289296456
  },
  "exposes": {
    "./Header": {
      "import": "./src/components/Header",
      "name": "Navigation Header",
      "assets": {
        "js": {
          "sync": ["header.js"],
          "async": ["header-lazy.js"]
        },
        "css": {
          "sync": ["header.css"]
        }
      }
    },
    "./Footer": {
      "import": "./src/components/Footer",
      "name": "Footer Component",
      "assets": {
        "js": {
          "sync": ["footer.js"]
        },
        "css": {
          "sync": ["footer.css"]
        }
      }
    }
  },
  "shared": {
    "react": {
      "version": "18.2.0",
      "scope": "default",
      "singleton": true,
      "eager": false,
      "assets": [
        {
          "path": "vendors/react.js",
          "type": "js",
          "size": 42000
        }
      ]
    }
  }
}
```

## Validation

### JSON Schema Validation

Bundler implementers should validate manifests using JSON Schema:

```javascript
// JSON Schema for federation-manifest.json validation
const federationManifestSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "metaData"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-zA-Z][a-zA-Z0-9_-]*$"
    },
    "name": {
      "type": "string",
      "minLength": 1
    },
    "metaData": {
      "type": "object",
      "required": ["version", "buildVersion", "publicPath", "mode", "target"],
      "properties": {
        "version": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+.*$"
        },
        "buildVersion": {
          "type": "string"
        },
        "publicPath": {
          "type": "string"
        },
        "mode": {
          "enum": ["development", "production"]
        },
        "target": {
          "enum": ["web", "node", "webworker"]
        },
        "timestamp": {
          "type": "number"
        }
      }
    },
    "remotes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "entry", "version", "buildVersion"],
        "properties": {
          "id": {
            "type": "string",
            "pattern": "^[a-zA-Z][a-zA-Z0-9_-]*$"
          },
          "entry": {
            "type": "string",
            "format": "uri"
          }
        }
      }
    }
  }
};
```

### Runtime Validation

```typescript
// Runtime manifest validation
export function validateFederationManifest(manifest: any): FederationManifest {
  // Type guards and validation logic
  if (!manifest.id || typeof manifest.id !== 'string') {
    throw new Error('Invalid manifest: missing or invalid id');
  }
  
  if (!manifest.metaData || !manifest.metaData.version) {
    throw new Error('Invalid manifest: missing metadata or version');
  }
  
  // Validate remotes
  if (manifest.remotes) {
    manifest.remotes.forEach((remote: any, index: number) => {
      if (!remote.id || !remote.entry) {
        throw new Error(`Invalid remote at index ${index}: missing id or entry`);
      }
      
      try {
        new URL(remote.entry);
      } catch {
        throw new Error(`Invalid remote entry URL: ${remote.entry}`);
      }
    });
  }
  
  return manifest as FederationManifest;
}
```

### Manifest Generation Guidelines

When generating manifests, bundlers should:

1. **Include Complete Metadata**: Always populate version, buildVersion, and publicPath
2. **Validate URLs**: Ensure all entry points and asset URLs are valid
3. **Calculate Sizes**: Include accurate size information for optimization
4. **Handle Assets**: List all associated CSS, JS, and other assets
5. **Version Consistency**: Ensure version information is consistent across manifests
6. **Security**: Validate and sanitize all user-provided configuration

### Best Practices

1. **Versioning**: Use semantic versioning with build identifiers
2. **Caching**: Include buildVersion for effective cache busting
3. **Asset Organization**: Group related assets logically
4. **Size Optimization**: Include size information for preloading decisions
5. **Error Handling**: Provide fallback mechanisms for missing manifests
6. **Development vs Production**: Include different optimization levels
7. **Cross-Origin**: Configure CORS headers for manifest files

This manifest specification ensures consistent metadata exchange between all Module Federation implementations, enabling seamless cross-bundler interoperability.

## Related Documentation

For implementation and usage context, see:
- [Architecture Overview](./architecture-overview.md) - System architecture and manifest role
- [Plugin Architecture](./plugin-architecture.md) - Build-time manifest generation
- [Runtime Architecture](./runtime-architecture.md) - Runtime manifest consumption
- [Implementation Guide](./implementation-guide.md) - Manifest generation in bundler implementations
- [SDK Reference](./sdk-reference.md) - Manifest-related types and utilities
- [Error Handling Specification](./error-handling-specification.md) - Manifest validation and error handling
- [Advanced Topics](./advanced-topics.md) - Production manifest optimization