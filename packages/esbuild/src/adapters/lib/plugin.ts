/**
 * @module-federation/esbuild - Module Federation Plugin for esbuild
 *
 * Full-featured Module Federation support for esbuild, with near-parity
 * to the enhanced webpack plugin. Features:
 *
 * 1. SHARED MODULES - loadShare() proxy with version negotiation, eager support,
 *    import:false, custom shareKey, per-module shareScope, packageName, subpath handling
 * 2. REMOTE MODULES - loadRemote() proxy, name@url parsing, per-remote shareScope
 * 3. CONTAINER ENTRY - get()/init() protocol, dynamic import of exposed modules
 * 4. RUNTIME INIT - top-level await, runtimePlugins injection, shareStrategy
 * 5. MANIFEST - mf-manifest.json with full asset/chunk metadata
 * 6. AUTO VERSION - reads package.json to detect shared dep versions
 *
 * Requirements: format:'esm', splitting:true, @module-federation/runtime
 */
import fs from 'fs';
import path from 'path';
import { init as initEsLexer, parse as parseEsModule } from 'es-module-lexer';
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
  NormalizedRemoteConfig,
} from '../../lib/config/federation-config';
import { writeRemoteManifest } from './manifest';

// =============================================================================
// Constants
// =============================================================================

const PLUGIN_NAME = 'module-federation';
const NS_CONTAINER = 'mf-container';
const NS_REMOTE = 'mf-remote';
const NS_SHARED = 'mf-shared';
const NS_RUNTIME_INIT = 'mf-runtime-init';
const RUNTIME_INIT_ID = '__mf_runtime_init__';
const FALLBACK_PREFIX = '__mf_fallback__/';
const MF_RUNTIME = '@module-federation/runtime';

// =============================================================================
// Utilities
// =============================================================================

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createPrefixFilter(names: string[]): RegExp | null {
  if (names.length === 0) return null;
  return new RegExp(`^(${names.map(escapeRegex).join('|')})(\/.*)?$`);
}

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

function isValidIdentifier(name: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
}

function getPackageName(importPath: string): string {
  const parts = importPath.split('/');
  if (importPath.startsWith('@') && parts.length >= 2) {
    return `${parts[0]}/${parts[1]}`;
  }
  return parts[0];
}

function parseRemoteEntry(entry: string): string {
  const match = entry.match(/^(.+?)@(https?:\/\/.+)$/);
  return match ? match[2] : entry;
}

function parseRemoteName(entry: string, fallbackAlias: string): string {
  const match = entry.match(/^(.+?)@(https?:\/\/.+)$/);
  return match ? match[1] : fallbackAlias;
}

/** esbuild's entryPoints can be string[], {in,out}[], or Record<string,string> */
type EntryPoints =
  | string[]
  | Array<{ in: string; out: string }>
  | Record<string, string>
  | undefined;

function getEntryPaths(entryPoints: EntryPoints): string[] {
  if (!entryPoints) return [];
  const result: string[] = [];
  if (Array.isArray(entryPoints)) {
    for (const ep of entryPoints) {
      if (typeof ep === 'string') result.push(path.resolve(ep));
      else if (ep && typeof ep === 'object' && 'in' in ep)
        result.push(path.resolve(ep.in));
    }
  } else if (typeof entryPoints === 'object') {
    for (const v of Object.values(entryPoints)) {
      if (typeof v === 'string') result.push(path.resolve(v));
    }
  }
  return result;
}

/** Safe variable name from package name */
function safeVarName(pkg: string): string {
  return `__mfEager_${pkg.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

/**
 * Try to auto-detect a package version by reading its package.json from node_modules.
 */
function detectPackageVersion(pkg: string): string | undefined {
  const lookupPkg = pkg
    .split('/')
    .slice(0, pkg.startsWith('@') ? 2 : 1)
    .join('/');
  const candidates = [
    path.join(process.cwd(), 'node_modules', lookupPkg, 'package.json'),
    path.join(process.cwd(), '..', 'node_modules', lookupPkg, 'package.json'),
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return JSON.parse(fs.readFileSync(candidate, 'utf-8')).version;
      }
    } catch {
      // continue
    }
  }
  return undefined;
}

/** Get the remote entry string from a remote config (string or object) */
function getRemoteEntryStr(remote: string | NormalizedRemoteConfig): string {
  if (typeof remote === 'string') return remote;
  return remote.entry;
}

/** Get the shareScope override for a remote, if any */
function getRemoteShareScope(
  remote: string | NormalizedRemoteConfig,
): string | undefined {
  if (typeof remote === 'string') return undefined;
  return remote.shareScope;
}

// =============================================================================
// Code Generation - Shared config builder (reused by init + container)
// =============================================================================

function buildSharedCodeEntries(
  shared: Record<string, NormalizedSharedConfig>,
  globalScope: string,
  eagerImports: string[],
): string {
  return Object.entries(shared)
    .map(([pkg, cfg]) => {
      // Skip import:false modules (no local fallback)
      const hasImport = cfg.import !== false;
      const shareKey = cfg.shareKey || pkg;
      const scope = cfg.shareScope || globalScope;

      // Auto-detect version if not provided
      let version =
        cfg.version || cfg.requiredVersion?.replace(/^[^0-9]*/, '') || '';
      if (!version) {
        const detected = detectPackageVersion(cfg.packageName || pkg);
        if (detected) version = detected;
      }
      if (!version) version = '0.0.0';

      let getFactory: string;
      if (!hasImport) {
        // No local fallback: get returns undefined, runtime must find it in scope
        getFactory = `function() { return Promise.resolve(function() { return undefined; }); }`;
      } else if (cfg.eager) {
        const varName = safeVarName(pkg);
        eagerImports.push(
          `import * as ${varName} from ${JSON.stringify(FALLBACK_PREFIX + pkg)};`,
        );
        getFactory = `function() { return Promise.resolve(function() { return ${varName}; }); }`;
      } else {
        getFactory = `function() { return import(${JSON.stringify(FALLBACK_PREFIX + pkg)}).then(function(m) { return function() { return m; }; }); }`;
      }

      return `    ${JSON.stringify(shareKey)}: {
      version: ${JSON.stringify(version)},
      scope: ${JSON.stringify(scope)},
      get: ${getFactory},
      shareConfig: {
        singleton: ${!!cfg.singleton},
        requiredVersion: ${JSON.stringify(cfg.requiredVersion || '*')},
        eager: ${!!cfg.eager},
        strictVersion: ${!!cfg.strictVersion}
      }
    }`;
    })
    .join(',\n');
}

// =============================================================================
// Code Generation - Runtime Initialization
// =============================================================================

function generateRuntimeInitCode(config: NormalizedFederationConfig): string {
  const { name, remotes = {}, shared = {} } = config;
  const strategy = config.shareStrategy || 'version-first';
  const globalScope = config.shareScope || 'default';

  // Build remote configs
  const remoteConfigs = Object.entries(remotes).map(([alias, remote]) => {
    const entryStr = getRemoteEntryStr(remote);
    const remoteShareScope = getRemoteShareScope(remote);
    return {
      name: parseRemoteName(entryStr, alias),
      alias,
      entry: parseRemoteEntry(entryStr),
      type: 'esm' as const,
      shareScope: remoteShareScope || globalScope,
    };
  });

  // Build shared entries
  const eagerImports: string[] = [];
  const sharedEntries = buildSharedCodeEntries(
    shared,
    globalScope,
    eagerImports,
  );

  const eagerSection =
    eagerImports.length > 0 ? eagerImports.join('\n') + '\n' : '';

  // Build runtime plugins injection
  const runtimePlugins = config.runtimePlugins || [];
  let runtimePluginsSection = '';
  if (runtimePlugins.length > 0) {
    const pluginImports = runtimePlugins
      .map((p, i) => `import __mfRuntimePlugin${i} from ${JSON.stringify(p)};`)
      .join('\n');
    const pluginArray = runtimePlugins
      .map(
        (_, i) =>
          `typeof __mfRuntimePlugin${i} === "function" ? __mfRuntimePlugin${i}() : __mfRuntimePlugin${i}`,
      )
      .join(', ');
    runtimePluginsSection = `${pluginImports}
var __mfPlugins = [${pluginArray}];
`;
  }

  const pluginsArg =
    runtimePlugins.length > 0 ? ',\n  plugins: __mfPlugins' : '';

  return `import { init as __mfInit } from ${JSON.stringify(MF_RUNTIME)};
${eagerSection}${runtimePluginsSection}
var __mfInstance = __mfInit({
  name: ${JSON.stringify(name)},
  remotes: ${JSON.stringify(remoteConfigs)},
  shared: {
${sharedEntries}
  }${pluginsArg}
});

try {
  var __mfSharePromises = __mfInstance.initializeSharing(${JSON.stringify(globalScope)}, {
    strategy: ${JSON.stringify(strategy)},
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

function generateContainerEntryCode(
  config: NormalizedFederationConfig,
): string {
  const { name, shared = {}, exposes = {} } = config;
  const strategy = config.shareStrategy || 'version-first';
  const globalScope = config.shareScope || 'default';

  const eagerImports: string[] = [];
  const sharedEntries = buildSharedCodeEntries(
    shared,
    globalScope,
    eagerImports,
  );

  const moduleMapEntries = Object.entries(exposes)
    .map(
      ([exposeName, exposePath]) =>
        `  ${JSON.stringify(exposeName)}: function() { return import(${JSON.stringify(exposePath)}); }`,
    )
    .join(',\n');

  const eagerSection =
    eagerImports.length > 0 ? eagerImports.join('\n') + '\n' : '';

  // Runtime plugins for container
  const runtimePlugins = config.runtimePlugins || [];
  let runtimePluginsSection = '';
  if (runtimePlugins.length > 0) {
    const pluginImports = runtimePlugins
      .map((p, i) => `import __mfRuntimePlugin${i} from ${JSON.stringify(p)};`)
      .join('\n');
    const pluginArray = runtimePlugins
      .map(
        (_, i) =>
          `typeof __mfRuntimePlugin${i} === "function" ? __mfRuntimePlugin${i}() : __mfRuntimePlugin${i}`,
      )
      .join(', ');
    runtimePluginsSection = `${pluginImports}
var __mfPlugins = [${pluginArray}];
`;
  }

  const pluginsArg =
    runtimePlugins.length > 0 ? ',\n  plugins: __mfPlugins' : '';

  return `import { init as __mfInit } from ${JSON.stringify(MF_RUNTIME)};
${eagerSection}${runtimePluginsSection}
var __mfInstance = __mfInit({
  name: ${JSON.stringify(name)},
  remotes: [],
  shared: {
${sharedEntries}
  }${pluginsArg}
});

var __mfModuleMap = {
${moduleMapEntries}
};

export function get(module, getScope) {
  if (!__mfModuleMap[module]) {
    throw new Error(
      'Module "' + module + '" does not exist in container "' + ${JSON.stringify(name)} + '"'
    );
  }
  return __mfModuleMap[module]().then(function(m) { return function() { return m; }; });
}

export function init(shareScope, initScope, remoteEntryInitOptions) {
  var opts = remoteEntryInitOptions || {};

  __mfInstance.initOptions({
    name: ${JSON.stringify(name)},
    remotes: [],
    ...opts
  });

  if (shareScope) {
    __mfInstance.initShareScopeMap(${JSON.stringify(globalScope)}, shareScope, {
      hostShareScopeMap: (opts && opts.shareScopeMap) || {}
    });
  }

  return __mfInstance.initializeSharing(${JSON.stringify(globalScope)}, {
    strategy: ${JSON.stringify(strategy)},
    from: "build",
    initScope: initScope
  });
}
`;
}

// =============================================================================
// Code Generation - Shared Module Proxy
// =============================================================================

async function generateSharedProxyCode(
  importPath: string,
  pkgName: string,
  cfg: NormalizedSharedConfig,
): Promise<string> {
  const isSubpath = importPath !== pkgName;
  const shareKey = cfg.shareKey || pkgName;

  let exportNames: string[];
  try {
    exportNames = await getExports(importPath);
  } catch {
    exportNames = ['default'];
  }

  const hasDefault = exportNames.includes('default');
  const namedExports = exportNames.filter(
    (e) => e !== 'default' && isValidIdentifier(e),
  );

  let code: string;

  if (isSubpath) {
    code = `import { loadShare } from ${JSON.stringify(MF_RUNTIME)};

var __mfFactory = null;
try {
  __mfFactory = await loadShare(${JSON.stringify(importPath)});
} catch(__mfErr) {
  // Subpath not registered in share scope, will use fallback
}

var __mfMod;
if (__mfFactory && typeof __mfFactory === "function") {
  __mfMod = __mfFactory();
} else {
  __mfMod = await import(${JSON.stringify(FALLBACK_PREFIX + importPath)});
}
`;
  } else if (cfg.import === false) {
    // No local fallback: module MUST come from the share scope
    code = `import { loadShare } from ${JSON.stringify(MF_RUNTIME)};

var __mfFactory = await loadShare(${JSON.stringify(shareKey)});
if (!__mfFactory || typeof __mfFactory !== "function") {
  throw new Error("[Module Federation] Shared module ${JSON.stringify(shareKey)} not available in share scope and import:false prevents local fallback.");
}
var __mfMod = __mfFactory();
`;
  } else {
    // loadShare uses the shareKey (for scope negotiation),
    // but the fallback import uses the actual package name (for disk resolution)
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
  __mfMod = await import(${JSON.stringify(FALLBACK_PREFIX + pkgName)});
}
`;
  }

  if (hasDefault) {
    code += `\nexport default (__mfMod && "default" in __mfMod) ? __mfMod["default"] : __mfMod;\n`;
  }

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

function generateRemoteProxyCode(
  _remoteName: string,
  importPath: string,
): string {
  return `import { loadRemote } from ${JSON.stringify(MF_RUNTIME)};

var __mfRemote = await loadRemote(${JSON.stringify(importPath)});
if (!__mfRemote) {
  throw new Error("[Module Federation] Failed to load remote module: " + ${JSON.stringify(importPath)});
}

export default (__mfRemote && typeof __mfRemote === "object" && "default" in __mfRemote)
  ? __mfRemote["default"]
  : __mfRemote;

export var __mfModule = __mfRemote;
`;
}

// =============================================================================
// Source File Transform - Rewrite named imports from remotes
// =============================================================================

/**
 * Transform named imports from remote modules so they work like webpack.
 *
 * ESM requires static export declarations, but remote module exports are
 * unknown at build time. This transform rewrites the importing file so that
 * named imports are converted to destructuring from the proxy's __mfModule:
 *
 *   import { App, utils as u } from 'mfe1/component';
 *   // becomes:
 *   import { __mfModule as __mfR0 } from 'mfe1/component';
 *   const { App, utils: u } = __mfR0;
 *
 *   import Default, { App } from 'mfe1/component';
 *   // becomes:
 *   import Default, { __mfModule as __mfR0 } from 'mfe1/component';
 *   const { App } = __mfR0;
 *
 *   import * as Mod from 'mfe1/component';
 *   // becomes:
 *   import { __mfModule as Mod } from 'mfe1/component';
 *
 * Default-only imports are left unchanged (already handled by the proxy).
 */
async function transformRemoteImports(
  code: string,
  remoteNames: string[],
): Promise<string> {
  // Quick check: does the code reference any remote?
  if (!remoteNames.some((name) => code.includes(name))) {
    return code;
  }

  await initEsLexer;
  let imports;
  try {
    [imports] = parseEsModule(code);
  } catch {
    return code; // Parse error - return unchanged
  }

  if (imports.length === 0) return code;

  // Collect replacements (will apply in reverse order to preserve positions)
  const replacements: Array<{
    start: number;
    end: number;
    text: string;
  }> = [];
  let counter = 0;

  for (const imp of imports) {
    // Skip dynamic imports
    if (imp.d >= 0) continue;

    // Check if this import is from a remote
    const moduleName = imp.n;
    if (!moduleName) continue;
    const isRemote = remoteNames.some(
      (name) => moduleName === name || moduleName.startsWith(name + '/'),
    );
    if (!isRemote) continue;

    // Extract the full import statement text
    const stmt = code.slice(imp.ss, imp.se);

    // Skip type-only imports (TypeScript)
    if (/^import\s+type[\s{]/.test(stmt)) continue;

    // --- Case 1: Named imports with optional default ---
    // import { App } from 'remote'
    // import Default, { App } from 'remote'
    const namedMatch = stmt.match(
      /^import\s+(?:([\w$]+)\s*,\s*)?\{([^}]*)\}\s*from\s/,
    );
    if (namedMatch) {
      const defaultName = namedMatch[1]; // may be undefined
      const namedRaw = namedMatch[2].trim();

      if (!namedRaw) continue; // empty braces, skip

      // Parse specifiers, filtering out TypeScript inline type imports
      const specifiers = namedRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((s) => !s.startsWith('type '));

      if (specifiers.length === 0) continue; // all type-only

      // Convert "X as Y" (ESM import) to "X: Y" (destructuring)
      const destructured = specifiers
        .map((spec) => {
          const m = spec.match(/^([\w$]+)\s+as\s+([\w$]+)$/);
          return m ? `${m[1]}: ${m[2]}` : spec;
        })
        .join(', ');

      const varName = `__mfR${counter++}`;
      const modStr = JSON.stringify(moduleName);
      let replacement: string;

      if (defaultName) {
        replacement =
          `import ${defaultName}, { __mfModule as ${varName} } from ${modStr};\n` +
          `const { ${destructured} } = ${varName};`;
      } else {
        replacement =
          `import { __mfModule as ${varName} } from ${modStr};\n` +
          `const { ${destructured} } = ${varName};`;
      }

      replacements.push({ start: imp.ss, end: imp.se, text: replacement });
      continue;
    }

    // --- Case 2: Namespace import ---
    // import * as Mod from 'remote'
    const nsMatch = stmt.match(/^import\s+\*\s+as\s+([\w$]+)\s+from\s/);
    if (nsMatch) {
      const nsName = nsMatch[1];
      const modStr = JSON.stringify(moduleName);
      replacements.push({
        start: imp.ss,
        end: imp.se,
        text: `import { __mfModule as ${nsName} } from ${modStr};`,
      });
      continue;
    }

    // Default-only and side-effect-only imports are left unchanged.
  }

  if (replacements.length === 0) return code;

  // Apply replacements in reverse order to preserve positions
  let result = code;
  for (const rep of replacements.sort((a, b) => b.start - a.start)) {
    result = result.slice(0, rep.start) + rep.text + result.slice(rep.end);
  }

  return result;
}

// =============================================================================
// Main Plugin
// =============================================================================

export const moduleFederationPlugin = (
  config: NormalizedFederationConfig,
): Plugin => ({
  name: PLUGIN_NAME,
  setup(build: PluginBuild) {
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

    // Ensure required build options
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
    build.initialOptions.metafile = true;

    // Track original entry points
    const originalEntryPaths = new Set(
      getEntryPaths(build.initialOptions.entryPoints),
    );

    // Add container entry
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

    // Build regex filters
    const sharedFilter = hasShared ? createPrefixFilter(sharedNames) : null;
    const remoteFilter = hasRemotes ? createPrefixFilter(remoteNames) : null;
    const containerBasename = path.basename(filename);
    const containerFilter = new RegExp(
      `(^|/)${escapeRegex(containerBasename)}$`,
    );

    // ==================================================================
    // RESOLVE HOOKS
    // ==================================================================

    // 1. Container entry
    if (hasExposes) {
      build.onResolve({ filter: containerFilter }, (args: OnResolveArgs) => {
        const basename = path.basename(args.path);
        if (basename !== containerBasename && !args.path.endsWith(filename))
          return undefined;
        return {
          path: args.path,
          namespace: NS_CONTAINER,
          pluginData: { resolveDir: args.resolveDir || process.cwd() },
        };
      });
    }

    // 2. Runtime init
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

    // 3. Share fallback
    if (hasShared) {
      build.onResolve(
        { filter: new RegExp(`^${escapeRegex(FALLBACK_PREFIX)}`) },
        async (args) => {
          const pkgName = args.path.slice(FALLBACK_PREFIX.length);
          const resolveDir =
            args.pluginData?.resolveDir || args.resolveDir || process.cwd();

          // Check if this shared dep has import:false (no fallback allowed)
          const topPkg = getPackageName(pkgName);
          if (shared[topPkg]?.import === false) {
            // Return an empty module - no fallback
            return {
              path: pkgName,
              namespace: 'mf-empty',
            };
          }

          try {
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

      // Empty module for import:false shared deps
      build.onLoad({ filter: /.*/, namespace: 'mf-empty' }, () => ({
        contents: 'export default undefined;',
        loader: 'js' as Loader,
      }));
    }

    // 4. Remote modules (before shared for priority)
    if (hasRemotes && remoteFilter) {
      build.onResolve({ filter: remoteFilter }, (args: OnResolveArgs) => {
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

    // 5. Shared modules
    if (hasShared && sharedFilter) {
      build.onResolve({ filter: sharedFilter }, (args: OnResolveArgs) => {
        if (args.pluginData?.__mfFallback) return undefined;
        if (args.namespace === NS_CONTAINER) return undefined;
        if (args.namespace === NS_RUNTIME_INIT) return undefined;
        if (args.namespace === NS_SHARED) return undefined;
        if (args.path.startsWith('@module-federation/')) return undefined;

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

    // ==================================================================
    // LOAD HOOKS
    // ==================================================================

    // 1. Container entry
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

    // 2. Runtime init
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

    // 3. Shared modules
    if (hasShared) {
      build.onLoad(
        { filter: /.*/, namespace: NS_SHARED },
        async (args: OnLoadArgs) => {
          const pkgName = args.pluginData?.pkgName || getPackageName(args.path);
          const sharedConfig = shared[pkgName];
          if (!sharedConfig) return undefined;

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

    // 4. Remote modules
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

    // 5. Source file transform: runtime init injection + remote import rewriting
    //    - Entry points: prepend `import '__mf_runtime_init__'`
    //    - Any file importing from remotes: rewrite named imports to
    //      destructured default imports so `import { App } from 'remote/mod'`
    //      works exactly like webpack MF.
    if (needsRuntimeInit || hasRemotes) {
      build.onLoad(
        { filter: /\.(tsx?|jsx?|mjs|mts|cjs|cts)$/, namespace: 'file' },
        async (args: OnLoadArgs) => {
          const isEntry = originalEntryPaths.has(args.path);
          const wantsInit = isEntry && needsRuntimeInit;

          // Quick read to check if transform is needed
          let contents: string;
          try {
            contents = await fs.promises.readFile(args.path, 'utf8');
          } catch {
            return undefined;
          }

          // Check if this file imports from any remote
          const wantsRemoteTransform =
            hasRemotes && remoteNames.some((name) => contents.includes(name));

          if (!wantsInit && !wantsRemoteTransform) return undefined;

          // Apply remote import transform (rewrite named imports)
          if (wantsRemoteTransform) {
            contents = await transformRemoteImports(contents, remoteNames);
          }

          // Inject runtime init at top of entry points
          if (wantsInit) {
            contents = `import ${JSON.stringify(RUNTIME_INIT_ID)};\n${contents}`;
          }

          return {
            contents,
            loader: getLoader(args.path),
            resolveDir: path.dirname(args.path),
          };
        },
      );
    }

    // ==================================================================
    // BUILD END
    // ==================================================================

    build.onEnd(async (result: BuildResult) => {
      if (!result.metafile) return;

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

export default moduleFederationPlugin;

export {
  generateRuntimeInitCode,
  generateContainerEntryCode,
  generateSharedProxyCode,
  generateRemoteProxyCode,
  transformRemoteImports,
};
