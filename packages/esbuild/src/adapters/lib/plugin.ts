/**
 * @module-federation/esbuild - Module Federation Plugin for esbuild
 *
 * This plugin enables full Module Federation support in esbuild builds:
 *
 * 1. SHARED MODULES: Imports of shared dependencies (e.g., 'react') are replaced
 *    with virtual proxy modules that use loadShare() from the MF runtime for
 *    version negotiation. The actual packages are bundled as fallback chunks.
 *
 * 2. REMOTE MODULES: Imports matching remote names (e.g., 'mfe1/component') are
 *    replaced with virtual proxy modules that use loadRemote() to fetch modules
 *    from remote containers at runtime.
 *
 * 3. CONTAINER ENTRY: When exposes are configured, a virtual container entry
 *    (remoteEntry.js) is generated with standard get()/init() exports for the
 *    Module Federation protocol.
 *
 * 4. RUNTIME INIT: Entry points are augmented with runtime initialization code
 *    that sets up the MF instance with remote and shared configurations.
 *
 * 5. MANIFEST: An mf-manifest.json is generated for runtime discovery.
 *
 * Requirements:
 *   - format: 'esm' (for dynamic imports and top-level await)
 *   - splitting: true (for code splitting of shared/exposed chunks)
 *   - @module-federation/runtime must be resolvable
 */
import fs from 'fs';
import path from 'path';
import type {
  Plugin,
  PluginBuild,
  OnResolveArgs,
  OnLoadArgs,
  Loader,
  BuildResult,
} from 'esbuild';
import { getExports } from './collect-exports';
import type {
  NormalizedFederationConfig,
  NormalizedSharedConfig,
} from '../../lib/config/federation-config';
import { writeRemoteManifest } from './manifest';

// =============================================================================
// Constants
// =============================================================================

const PLUGIN_NAME = 'module-federation';

/** Virtual module namespaces for esbuild */
const NS_CONTAINER = 'mf-container';
const NS_REMOTE = 'mf-remote';
const NS_SHARED = 'mf-shared';
const NS_RUNTIME_INIT = 'mf-runtime-init';

/** Special import identifiers used in generated code */
const RUNTIME_INIT_ID = '__mf_runtime_init__';
const FALLBACK_PREFIX = '__mf_fallback__/';

/** The MF runtime package used in generated code */
const MF_RUNTIME = '@module-federation/runtime';

// =============================================================================
// Utilities
// =============================================================================

/** Escape special regex characters */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Create a regex that matches any of the given names exactly */
function createExactFilter(names: string[]): RegExp | null {
  if (names.length === 0) return null;
  return new RegExp(`^(${names.map(escapeRegex).join('|')})$`);
}

/** Create a regex that matches any of the given names as prefix (with / or end) */
function createPrefixFilter(names: string[]): RegExp | null {
  if (names.length === 0) return null;
  return new RegExp(`^(${names.map(escapeRegex).join('|')})(\/.*)?$`);
}

/** Determine the esbuild loader from file extension */
function getLoader(filePath: string): Loader {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, Loader> = {
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.js': 'js',
    '.jsx': 'jsx',
    '.mjs': 'js',
    '.mts': 'ts',
    '.cjs': 'js',
    '.cts': 'ts',
    '.css': 'css',
    '.json': 'json',
  };
  return map[ext] || 'js';
}

/** Check if a name is a valid JS identifier */
function isValidIdentifier(name: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
}

/** Extract package name from import path (handles scoped packages) */
function getPackageName(importPath: string): string {
  const parts = importPath.split('/');
  if (importPath.startsWith('@') && parts.length >= 2) {
    return `${parts[0]}/${parts[1]}`;
  }
  return parts[0];
}

/** Extract all entry point file paths from esbuild config */
function getEntryPaths(entryPoints: any): string[] {
  if (!entryPoints) return [];
  const result: string[] = [];
  if (Array.isArray(entryPoints)) {
    for (const ep of entryPoints) {
      if (typeof ep === 'string') result.push(path.resolve(ep));
      else if (ep && typeof ep === 'object' && ep.in)
        result.push(path.resolve(ep.in));
    }
  } else if (typeof entryPoints === 'object') {
    for (const v of Object.values(entryPoints)) {
      if (typeof v === 'string') result.push(path.resolve(v as string));
    }
  }
  return result;
}

// =============================================================================
// Code Generation - Runtime Initialization
// =============================================================================

/**
 * Generate the runtime initialization module.
 * This is imported at the top of entry points to ensure the MF runtime
 * is initialized (with remotes + shared config) before any app code runs.
 *
 * Uses top-level await to block module evaluation until initialization completes,
 * which ensures loadShare() and loadRemote() can be called safely.
 */
function generateRuntimeInitCode(config: NormalizedFederationConfig): string {
  const { name, remotes = {}, shared = {} } = config;

  // Build remote configuration array
  const remoteConfigs = Object.entries(remotes).map(([alias, entry]) => {
    let remoteName = alias;
    let remoteEntry =
      typeof entry === 'string' ? entry : (entry as any).entry || '';

    // Parse "name@url" format (e.g., "mfe1@http://localhost:3001/remoteEntry.js")
    if (typeof remoteEntry === 'string') {
      const atHttpIdx = remoteEntry.lastIndexOf('@http');
      if (atHttpIdx > 0) {
        remoteName = remoteEntry.substring(0, atHttpIdx);
        remoteEntry = remoteEntry.substring(atHttpIdx + 1);
      }
    }

    return {
      name: remoteName,
      alias,
      entry: remoteEntry,
      type: 'esm',
    };
  });

  // Build shared module configuration with fallback factories
  const sharedEntries = Object.entries(shared)
    .map(([pkg, cfg]) => {
      const version =
        cfg.version || cfg.requiredVersion?.replace(/^[^0-9]*/, '') || '0.0.0';
      return `    ${JSON.stringify(pkg)}: {
      version: ${JSON.stringify(version)},
      scope: "default",
      get: function() { return import(${JSON.stringify(FALLBACK_PREFIX + pkg)}).then(function(m) { return function() { return m; }; }); },
      shareConfig: {
        singleton: ${!!cfg.singleton},
        requiredVersion: ${JSON.stringify(cfg.requiredVersion || '*')},
        eager: ${!!cfg.eager},
        strictVersion: ${!!cfg.strictVersion}
      }
    }`;
    })
    .join(',\n');

  return `import { init as __mfInit } from ${JSON.stringify(MF_RUNTIME)};

var __mfInstance = __mfInit({
  name: ${JSON.stringify(name)},
  remotes: ${JSON.stringify(remoteConfigs)},
  shared: {
${sharedEntries}
  }
});

// Initialize sharing to negotiate shared modules across containers
try {
  var __mfSharePromises = __mfInstance.initializeSharing("default", {
    strategy: "version-first",
    from: "build"
  });
  if (__mfSharePromises && __mfSharePromises.length) {
    await Promise.all(__mfSharePromises);
  }
} catch(__mfErr) {
  console.warn("[Module Federation] Sharing initialization warning:", __mfErr);
}
`;
}

// =============================================================================
// Code Generation - Container Entry (remoteEntry.js)
// =============================================================================

/**
 * Generate the container entry module.
 * This is the remoteEntry.js file that exposes modules and handles sharing
 * via the standard Module Federation get()/init() protocol.
 *
 * When a host loads this container:
 * 1. It calls init(shareScope) to negotiate shared dependencies
 * 2. It calls get('./moduleName') to load exposed modules
 */
function generateContainerEntryCode(
  config: NormalizedFederationConfig,
): string {
  const { name, shared = {}, exposes = {} } = config;

  // Build shared module configuration with fallback factories
  const sharedEntries = Object.entries(shared)
    .map(([pkg, cfg]) => {
      const version =
        cfg.version || cfg.requiredVersion?.replace(/^[^0-9]*/, '') || '0.0.0';
      return `    ${JSON.stringify(pkg)}: {
      version: ${JSON.stringify(version)},
      scope: "default",
      get: function() { return import(${JSON.stringify(FALLBACK_PREFIX + pkg)}).then(function(m) { return function() { return m; }; }); },
      shareConfig: {
        singleton: ${!!cfg.singleton},
        requiredVersion: ${JSON.stringify(cfg.requiredVersion || '*')},
        eager: ${!!cfg.eager},
        strictVersion: ${!!cfg.strictVersion}
      }
    }`;
    })
    .join(',\n');

  // Build the module map from exposes config
  const moduleMapEntries = Object.entries(exposes)
    .map(([exposeName, exposePath]) => {
      return `  ${JSON.stringify(exposeName)}: function() { return import(${JSON.stringify(exposePath)}); }`;
    })
    .join(',\n');

  return `import { init as __mfInit } from ${JSON.stringify(MF_RUNTIME)};

// Initialize the MF runtime for this container
var __mfInstance = __mfInit({
  name: ${JSON.stringify(name)},
  remotes: [],
  shared: {
${sharedEntries}
  }
});

// Module map: exposed module name -> dynamic import factory
var __mfModuleMap = {
${moduleMapEntries}
};

/**
 * Get an exposed module from this container.
 * Returns a promise that resolves to a factory function: Promise<() => Module>
 * @param {string} module - The exposed module name (e.g., './component')
 * @param {Array} [getScope] - Internal scope for circular reference prevention
 */
export function get(module, getScope) {
  if (!__mfModuleMap[module]) {
    throw new Error(
      'Module "' + module + '" does not exist in container "' + ${JSON.stringify(name)} + '"'
    );
  }
  return __mfModuleMap[module]().then(function(m) { return function() { return m; }; });
}

/**
 * Initialize this container with a host's share scope.
 * Called by the host before get() to negotiate shared dependencies.
 * @param {Object} shareScope - The host's share scope map
 * @param {Array} [initScope] - Internal scope for circular reference prevention
 * @param {Object} [remoteEntryInitOptions] - Additional init options from the host
 */
export function init(shareScope, initScope, remoteEntryInitOptions) {
  var opts = remoteEntryInitOptions || {};

  __mfInstance.initOptions({
    name: ${JSON.stringify(name)},
    remotes: [],
    ...opts
  });

  if (shareScope) {
    __mfInstance.initShareScopeMap("default", shareScope, {
      hostShareScopeMap: (opts && opts.shareScopeMap) || {}
    });
  }

  return __mfInstance.initializeSharing("default", {
    strategy: "version-first",
    from: "build"
  });
}
`;
}

// =============================================================================
// Code Generation - Shared Module Proxy
// =============================================================================

/**
 * Generate a shared module proxy that loads via the MF runtime.
 *
 * The proxy uses loadShare() which:
 * 1. Checks the share scope for a compatible version from another container
 * 2. If found, returns that factory (shared module from remote)
 * 3. If not found, uses the local fallback factory (bundled version)
 *
 * This enables version negotiation: if two containers share 'react',
 * only one copy is loaded based on version compatibility.
 *
 * For subpath imports (e.g., 'react/jsx-runtime' when only 'react' is shared),
 * the proxy loads the top-level share and then resolves the subpath from it.
 * If the subpath is explicitly configured in the shared config, it uses loadShare
 * directly with the full subpath name.
 *
 * @param importPath - The full import path (e.g., 'react' or 'react/jsx-runtime')
 * @param pkgName - The top-level package name from shared config (e.g., 'react')
 * @param cfg - The shared configuration for this package
 */
async function generateSharedProxyCode(
  importPath: string,
  pkgName: string,
  _cfg: NormalizedSharedConfig,
): Promise<string> {
  // Determine if this is a subpath import
  const isSubpath = importPath !== pkgName;
  // The share key to use for loadShare()
  // If the full import path is directly in shared config, use it;
  // otherwise use the top-level package name
  const shareKey = pkgName;

  // Analyze the package's exports at build time
  let exportNames: string[];
  try {
    exportNames = await getExports(importPath);
  } catch {
    // If we can't determine exports, provide default export only
    exportNames = ['default'];
  }

  const hasDefault = exportNames.includes('default');
  const namedExports = exportNames.filter(
    (e) => e !== 'default' && isValidIdentifier(e),
  );

  let code: string;

  if (isSubpath) {
    // For subpath imports like 'react/jsx-runtime':
    // We can't easily extract the subpath from the top-level shared module,
    // so we try loadShare for the specific subpath first, then fallback to
    // importing the actual subpath module directly.
    code = `import { loadShare } from ${JSON.stringify(MF_RUNTIME)};

var __mfFactory;
try {
  // Try loading the specific subpath from share scope
  __mfFactory = await loadShare(${JSON.stringify(importPath)});
} catch(__mfErr) {
  // Subpath not in share scope, try the parent package
  try {
    __mfFactory = null;
  } catch(__mfErr2) {}
}

var __mfMod;
if (__mfFactory && typeof __mfFactory === "function") {
  __mfMod = __mfFactory();
} else {
  // Fallback: import the actual subpath module directly
  __mfMod = await import(${JSON.stringify(FALLBACK_PREFIX + importPath)});
}
`;
  } else {
    // For top-level package imports (e.g., 'react'):
    // Use loadShare() for share scope negotiation
    code = `import { loadShare } from ${JSON.stringify(MF_RUNTIME)};

var __mfFactory;
try {
  __mfFactory = await loadShare(${JSON.stringify(shareKey)});
} catch(__mfErr) {
  console.warn("[Module Federation] loadShare(" + ${JSON.stringify(shareKey)} + ") failed:", __mfErr);
}

var __mfMod;
if (__mfFactory && typeof __mfFactory === "function") {
  __mfMod = __mfFactory();
} else {
  __mfMod = await import(${JSON.stringify(FALLBACK_PREFIX + shareKey)});
}
`;
  }

  // Generate default export
  if (hasDefault) {
    code += `\nexport default (__mfMod && "default" in __mfMod) ? __mfMod["default"] : __mfMod;\n`;
  }

  // Generate named exports
  if (namedExports.length > 0) {
    for (const exp of namedExports) {
      code += `export var ${exp} = __mfMod[${JSON.stringify(exp)}];\n`;
    }
  }

  return code;
}

// =============================================================================
// Code Generation - Remote Module Proxy
// =============================================================================

/**
 * Generate a remote module proxy that loads via the MF runtime.
 *
 * Uses loadRemote() which:
 * 1. Loads the remote container entry (remoteEntry.js)
 * 2. Calls container.init(shareScope) for share negotiation
 * 3. Calls container.get(exposeName) to get the module
 * 4. Returns the module
 *
 * The import path format is 'remoteName/exposePath':
 *   'mfe1/component' -> remote 'mfe1', expose './component'
 *
 * IMPORTANT: Remote module exports are unknown at build time. Since ESM
 * requires static export declarations, the proxy exports:
 * - `default`: The module's default export or the entire module object
 * - `__mfModule`: The raw module object for programmatic access
 *
 * For default imports:
 *   import Component from 'remote/module' -> works directly
 *
 * For named imports, consumers should use the default import pattern:
 *   import Remote from 'remote/module';
 *   const { App, utils } = Remote;
 */
function generateRemoteProxyCode(
  _remoteName: string,
  importPath: string,
): string {
  return `import { loadRemote } from ${JSON.stringify(MF_RUNTIME)};

var __mfRemote = await loadRemote(${JSON.stringify(importPath)});
if (!__mfRemote) {
  throw new Error("[Module Federation] Failed to load remote module: " + ${JSON.stringify(importPath)});
}

// Default export: prefer module.default, fall back to the whole module
export default (__mfRemote && typeof __mfRemote === "object" && "default" in __mfRemote)
  ? __mfRemote["default"]
  : __mfRemote;

// Expose the full module for programmatic access
export var __mfModule = __mfRemote;
`;
}

// =============================================================================
// Main Plugin
// =============================================================================

/**
 * Creates the Module Federation esbuild plugin.
 *
 * @param config - Normalized federation configuration (from withFederation())
 * @returns An esbuild Plugin
 *
 * @example
 * ```js
 * const { moduleFederationPlugin } = require('@module-federation/esbuild/plugin');
 * const config = require('./federation.config.js');
 *
 * esbuild.build({
 *   entryPoints: ['./src/main.ts'],
 *   outdir: './dist',
 *   bundle: true,
 *   format: 'esm',
 *   splitting: true,
 *   plugins: [moduleFederationPlugin(config)],
 * });
 * ```
 */
export const moduleFederationPlugin = (
  config: NormalizedFederationConfig,
): Plugin => ({
  name: PLUGIN_NAME,
  setup(build: PluginBuild) {
    // ------------------------------------------------------------------
    // Configuration analysis
    // ------------------------------------------------------------------
    const shared = config.shared || {};
    const remotes = config.remotes || {};
    const exposes = config.exposes || {};
    const filename = config.filename || 'remoteEntry.js';

    const sharedNames = Object.keys(shared);
    const remoteNames = Object.keys(remotes);

    const hasShared = sharedNames.length > 0;
    const hasRemotes = remoteNames.length > 0;
    const hasExposes = Object.keys(exposes).length > 0;
    const needsRuntimeInit = hasRemotes || hasShared;

    // ------------------------------------------------------------------
    // Ensure required build options for Module Federation
    // ------------------------------------------------------------------
    if (build.initialOptions.format !== 'esm') {
      console.warn(
        `[${PLUGIN_NAME}] Setting format to "esm" (required for Module Federation)`,
      );
      build.initialOptions.format = 'esm';
    }
    if (!build.initialOptions.splitting) {
      console.warn(
        `[${PLUGIN_NAME}] Enabling code splitting (required for Module Federation)`,
      );
      build.initialOptions.splitting = true;
    }
    // Enable metafile for manifest generation
    build.initialOptions.metafile = true;

    // ------------------------------------------------------------------
    // Track original entry points (before adding container entry)
    // ------------------------------------------------------------------
    const originalEntryPaths = new Set(
      getEntryPaths(build.initialOptions.entryPoints),
    );

    // ------------------------------------------------------------------
    // Add container entry as additional entry point
    // ------------------------------------------------------------------
    if (hasExposes) {
      const entryPoints = build.initialOptions.entryPoints;
      if (Array.isArray(entryPoints)) {
        (entryPoints as string[]).push(filename);
      } else if (entryPoints && typeof entryPoints === 'object') {
        const basename = path.basename(filename, path.extname(filename));
        (entryPoints as Record<string, string>)[basename] = filename;
      } else {
        build.initialOptions.entryPoints = [filename];
      }
    }

    // ------------------------------------------------------------------
    // Build regex filters for module interception
    // ------------------------------------------------------------------
    const sharedFilter = hasShared ? createPrefixFilter(sharedNames) : null;
    const remoteFilter = hasRemotes ? createPrefixFilter(remoteNames) : null;
    const containerBasename = path.basename(filename);
    const containerFilter = new RegExp(
      `(^|/)${escapeRegex(containerBasename)}$`,
    );

    // ==================================================================
    // RESOLVE HOOKS - Intercept module resolution
    // ==================================================================

    // 1. Container entry: intercept the remoteEntry.js filename
    if (hasExposes) {
      build.onResolve({ filter: containerFilter }, (args: OnResolveArgs) => {
        const basename = path.basename(args.path);
        if (basename !== containerBasename && !args.path.endsWith(filename)) {
          return undefined;
        }
        return {
          path: args.path,
          namespace: NS_CONTAINER,
          pluginData: { resolveDir: args.resolveDir || process.cwd() },
        };
      });
    }

    // 2. Runtime init module: intercept the virtual init import
    if (needsRuntimeInit) {
      build.onResolve(
        { filter: new RegExp(`^${escapeRegex(RUNTIME_INIT_ID)}$`) },
        (args) => ({
          path: RUNTIME_INIT_ID,
          namespace: NS_RUNTIME_INIT,
          pluginData: { resolveDir: args.resolveDir || process.cwd() },
        }),
      );
    }

    // 3. Share fallback: resolve __mf_fallback__/pkg to the actual package
    //    This MUST be registered BEFORE the shared filter to prevent
    //    the shared filter from intercepting fallback resolutions.
    if (hasShared) {
      build.onResolve(
        { filter: new RegExp(`^${escapeRegex(FALLBACK_PREFIX)}`) },
        async (args) => {
          const pkgName = args.path.slice(FALLBACK_PREFIX.length);
          const resolveDir =
            args.pluginData?.resolveDir || args.resolveDir || process.cwd();

          try {
            // Resolve the actual package, bypassing our shared interceptor
            const result = await build.resolve(pkgName, {
              kind: args.kind,
              resolveDir,
              pluginData: { __mfFallback: true },
            });
            return result;
          } catch (e) {
            console.error(
              `[${PLUGIN_NAME}] Cannot resolve fallback for "${pkgName}":`,
              e,
            );
            return { path: pkgName, external: true };
          }
        },
      );
    }

    // 4. Shared modules: intercept imports of shared dependencies
    if (hasShared && sharedFilter) {
      build.onResolve({ filter: sharedFilter }, (args: OnResolveArgs) => {
        // Skip fallback resolution to prevent circular interception
        if (args.pluginData?.__mfFallback) return undefined;
        // Skip imports from internal MF namespaces
        if (args.namespace === NS_CONTAINER) return undefined;
        if (args.namespace === NS_RUNTIME_INIT) return undefined;
        if (args.namespace === NS_SHARED) return undefined;
        // Don't intercept @module-federation/* packages
        if (args.path.startsWith('@module-federation/')) return undefined;

        // Verify the package name matches a shared config entry
        const pkgName = getPackageName(args.path);
        if (!shared[pkgName]) return undefined;

        return {
          path: args.path,
          namespace: NS_SHARED,
          pluginData: {
            resolveDir: args.resolveDir || process.cwd(),
            pkgName,
          },
        };
      });
    }

    // 5. Remote modules: intercept imports matching remote names
    if (hasRemotes && remoteFilter) {
      build.onResolve({ filter: remoteFilter }, (args: OnResolveArgs) => {
        // Find which remote this import belongs to
        const remoteName = remoteNames.find(
          (name) => args.path === name || args.path.startsWith(name + '/'),
        );
        if (!remoteName) return undefined;

        return {
          path: args.path,
          namespace: NS_REMOTE,
          pluginData: {
            resolveDir: args.resolveDir || process.cwd(),
            remoteName,
          },
        };
      });
    }

    // ==================================================================
    // LOAD HOOKS - Provide virtual module contents
    // ==================================================================

    // 1. Container entry: generate remoteEntry.js with get()/init()
    if (hasExposes) {
      build.onLoad(
        { filter: /.*/, namespace: NS_CONTAINER },
        (_args: OnLoadArgs) => ({
          contents: generateContainerEntryCode(config),
          loader: 'js' as Loader,
          resolveDir: _args.pluginData?.resolveDir || process.cwd(),
        }),
      );
    }

    // 2. Runtime init: generate initialization code
    if (needsRuntimeInit) {
      build.onLoad(
        { filter: /.*/, namespace: NS_RUNTIME_INIT },
        (_args: OnLoadArgs) => ({
          contents: generateRuntimeInitCode(config),
          loader: 'js' as Loader,
          resolveDir: _args.pluginData?.resolveDir || process.cwd(),
        }),
      );
    }

    // 3. Shared modules: generate loadShare() proxy
    if (hasShared) {
      build.onLoad(
        { filter: /.*/, namespace: NS_SHARED },
        async (args: OnLoadArgs) => {
          const pkgName = args.pluginData?.pkgName || getPackageName(args.path);
          const sharedConfig = shared[pkgName];

          if (!sharedConfig) return undefined;

          // Pass the full import path (may include subpath like 'react/jsx-runtime')
          // and the top-level package name for share scope lookup
          const contents = await generateSharedProxyCode(
            args.path,
            pkgName,
            sharedConfig,
          );

          return {
            contents,
            loader: 'js' as Loader,
            resolveDir: args.pluginData?.resolveDir || process.cwd(),
          };
        },
      );
    }

    // 4. Remote modules: generate loadRemote() proxy
    if (hasRemotes) {
      build.onLoad(
        { filter: /.*/, namespace: NS_REMOTE },
        (args: OnLoadArgs) => ({
          contents: generateRemoteProxyCode(
            args.pluginData?.remoteName || '',
            args.path,
          ),
          loader: 'js' as Loader,
          resolveDir: args.pluginData?.resolveDir || process.cwd(),
        }),
      );
    }

    // 5. Entry point augmentation: inject runtime init import
    //    This prepends `import '__mf_runtime_init__'` to entry point files
    //    to ensure the MF runtime is initialized before any app code runs.
    //    Uses ESM evaluation order + top-level await to guarantee ordering.
    if (needsRuntimeInit) {
      build.onLoad(
        { filter: /\.(tsx?|jsx?|mjs|mts|cjs|cts)$/, namespace: 'file' },
        async (args: OnLoadArgs) => {
          // Only augment original app entry points, not the container entry
          if (!originalEntryPaths.has(args.path)) return undefined;

          try {
            const contents = await fs.promises.readFile(args.path, 'utf8');
            return {
              contents: `import ${JSON.stringify(RUNTIME_INIT_ID)};\n${contents}`,
              loader: getLoader(args.path),
              resolveDir: path.dirname(args.path),
            };
          } catch {
            return undefined;
          }
        },
      );
    }

    // ==================================================================
    // BUILD END HOOK - Post-processing and manifest generation
    // ==================================================================

    build.onEnd(async (result: BuildResult) => {
      if (!result.metafile) return;

      // Post-process container entry to inject module map
      if (hasExposes) {
        try {
          await postProcessContainerEntry(config, result);
        } catch (e) {
          console.error(`[${PLUGIN_NAME}] Container post-processing error:`, e);
        }
      }

      // Generate mf-manifest.json
      try {
        await writeRemoteManifest(config, result);
      } catch (e) {
        console.error(`[${PLUGIN_NAME}] Manifest generation error:`, e);
      }

      const errorCount = result.errors?.length || 0;
      console.log(
        `[${PLUGIN_NAME}] Build completed${errorCount > 0 ? ` with ${errorCount} errors` : ' successfully'}`,
      );
    });
  },
});

// =============================================================================
// Post-Processing
// =============================================================================

/**
 * Post-process the container entry output to inject build-time metadata.
 * This adds the actual output file paths for exposed modules into the
 * container entry code, which is needed for the manifest.
 */
async function postProcessContainerEntry(
  config: NormalizedFederationConfig,
  result: BuildResult,
): Promise<void> {
  if (!result.metafile?.outputs) return;

  const remoteFile = config.filename || 'remoteEntry.js';
  const exposedConfig = config.exposes || {};

  // Find the container entry output file
  for (const [outputPath, meta] of Object.entries(result.metafile.outputs)) {
    if (!meta.entryPoint) continue;
    if (
      !meta.entryPoint.startsWith(NS_CONTAINER + ':') &&
      !meta.entryPoint.endsWith(path.basename(remoteFile))
    ) {
      continue;
    }

    // Build exposed module metadata from the metafile
    const exposedEntries: Record<string, any> = {};
    const outputMapWithoutExt = Object.entries(result.metafile.outputs).reduce(
      (acc, [chunkKey, chunkValue]) => {
        const key = chunkValue.entryPoint || chunkKey;
        const trimKey = key.substring(0, key.lastIndexOf('.')) || key;
        acc[trimKey] = { ...chunkValue, chunk: chunkKey };
        return acc;
      },
      {} as Record<string, any>,
    );

    for (const [expose, value] of Object.entries(exposedConfig)) {
      const found =
        outputMapWithoutExt[value.replace('./', '')] ||
        outputMapWithoutExt[expose.replace('./', '')];
      if (found) {
        exposedEntries[expose] = {
          entryPoint: found.entryPoint,
          exports: found.exports,
        };
      }
    }

    // If there's data to inject, update the output file
    if (Object.keys(exposedEntries).length > 0) {
      try {
        const container = fs.readFileSync(outputPath, 'utf-8');
        const updated = container
          .replace('"__MODULE_MAP__"', JSON.stringify(exposedEntries))
          .replace("'__MODULE_MAP__'", JSON.stringify(exposedEntries));
        if (updated !== container) {
          fs.writeFileSync(outputPath, updated, 'utf-8');
        }
      } catch {
        // Output file might not exist yet in some edge cases
      }
    }
  }
}

export default moduleFederationPlugin;

// Also export code generation utilities for advanced use cases
export {
  generateRuntimeInitCode,
  generateContainerEntryCode,
  generateSharedProxyCode,
  generateRemoteProxyCode,
};
