import fs from 'fs';
import path from 'path';
import type { BuildResult } from 'esbuild';
import type { NormalizedFederationConfig } from '../../lib/config/federation-config';

interface OutputFile {
  entryPoint?: string;
  imports?: { path: string; kind?: string }[];
  exports?: string[];
  kind?: string;
  chunk: string;
}

interface Assets {
  js: { async: string[]; sync: string[] };
  css: { async: string[]; sync: string[] };
}

interface SharedConfig {
  id: string;
  name: string;
  version: string;
  singleton: boolean;
  requiredVersion: string;
  assets: Assets;
}

interface RemoteConfig {
  federationContainerName: string;
  moduleName: string;
  alias: string;
  entry: string;
}

interface ExposeConfig {
  id: string;
  name: string;
  assets: Assets;
  path: string;
}

interface TypesConfig {
  path: string;
  name: string;
  zip: string;
  api: string;
}

interface Manifest {
  id: string;
  name: string;
  metaData: {
    name: string;
    type: string;
    buildInfo: {
      buildVersion: string;
      buildName: string;
    };
    remoteEntry: {
      name: string;
      path: string;
      type: string;
    };
    types: TypesConfig;
    globalName: string;
    pluginVersion: string;
    publicPath: string;
  };
  shared: SharedConfig[];
  remotes: RemoteConfig[];
  exposes: ExposeConfig[];
}

/**
 * Collect assets (JS and CSS chunks) for a given output entry.
 */
function getChunks(
  meta: OutputFile | undefined,
  outputMap: Record<string, OutputFile>,
): Assets {
  const assets: Assets = {
    js: { async: [], sync: [] },
    css: { async: [], sync: [] },
  };

  if (!meta?.imports) return assets;

  for (const imp of meta.imports) {
    const importMeta = outputMap[imp.path];
    if (importMeta && imp.kind !== 'dynamic-import') {
      const childAssets = getChunks(importMeta, outputMap);
      assets.js.async.push(...childAssets.js.async);
      assets.js.sync.push(...childAssets.js.sync);
      assets.css.async.push(...childAssets.css.async);
      assets.css.sync.push(...childAssets.css.sync);
    }
  }

  if (meta.chunk) {
    const assetType = meta.chunk.endsWith('.css') ? 'css' : 'js';
    const syncOrAsync = meta.kind === 'dynamic-import' ? 'async' : 'sync';
    assets[assetType][syncOrAsync].push(meta.chunk);
  }

  return assets;
}

/**
 * Read the package version. Uses a safe approach that works in both
 * CJS and ESM contexts.
 */
function getPluginVersion(): string {
  try {
    const pkgPath = path.resolve(__dirname, '../../package.json');
    if (fs.existsSync(pkgPath)) {
      return JSON.parse(fs.readFileSync(pkgPath, 'utf-8')).version || '0.0.0';
    }
  } catch {
    // ignore
  }
  try {
    // Try relative to the dist directory
    const pkgPath = path.resolve(__dirname, '../package.json');
    if (fs.existsSync(pkgPath)) {
      return JSON.parse(fs.readFileSync(pkgPath, 'utf-8')).version || '0.0.0';
    }
  } catch {
    // ignore
  }
  return '0.0.0';
}

/**
 * Write the mf-manifest.json file for runtime module discovery.
 *
 * The manifest contains metadata about:
 * - Remote entry point location
 * - Shared dependencies with versions
 * - Remote configurations
 * - Exposed modules and their assets
 */
export async function writeRemoteManifest(
  config: NormalizedFederationConfig,
  result: BuildResult,
): Promise<void> {
  if (result.errors && result.errors.length > 0) {
    console.warn(
      '[module-federation] Build errors detected, skipping manifest generation.',
    );
    return;
  }

  if (!result.metafile?.outputs) return;

  const pluginVersion = getPluginVersion();
  const publicPath = config.publicPath || 'auto';

  // Build output map indexed by entry point or chunk key
  let containerName = '';
  const outputMap: Record<string, OutputFile> = {};

  for (const [chunkKey, chunkValue] of Object.entries(
    result.metafile.outputs,
  )) {
    const key = chunkValue.entryPoint || chunkKey;
    if (
      key.startsWith('mf-container:') ||
      (key.endsWith(config.filename || 'remoteEntry.js') &&
        key.includes('container'))
    ) {
      containerName = key;
    }
    // Also match direct filename
    if (
      !containerName &&
      path.basename(chunkKey) ===
        path.basename(config.filename || 'remoteEntry.js')
    ) {
      containerName = key;
    }
    outputMap[key] = { ...chunkValue, chunk: chunkKey };
  }

  // If no container entry found, try to find by filename
  if (!containerName) {
    for (const [chunkKey, chunkValue] of Object.entries(
      result.metafile.outputs,
    )) {
      if (
        chunkKey.endsWith(path.basename(config.filename || 'remoteEntry.js'))
      ) {
        containerName = chunkValue.entryPoint || chunkKey;
        break;
      }
    }
  }

  // If still no container, skip manifest for host-only builds
  if (!containerName || !outputMap[containerName]) {
    return;
  }

  // Build output map without extensions (for flexible matching)
  const outputMapNoExt: Record<string, OutputFile> = {};
  for (const [chunkKey, chunkValue] of Object.entries(
    result.metafile.outputs,
  )) {
    const key = chunkValue.entryPoint || chunkKey;
    const trimKey = key.substring(0, key.lastIndexOf('.')) || key;
    outputMapNoExt[trimKey] = { ...chunkValue, chunk: chunkKey };
  }

  // Build shared module metadata
  const sharedEntries: SharedConfig[] = config.shared
    ? await Promise.all(
        Object.entries(config.shared).map(async ([pkg, sharedCfg]) => {
          const meta = outputMap['mf-shared:' + pkg];
          const chunks = getChunks(meta, outputMap);
          let version = sharedCfg.version || '';

          if (!version) {
            try {
              // Try to read version from node_modules
              const pkgJsonPath = path.join(
                process.cwd(),
                'node_modules',
                pkg,
                'package.json',
              );
              if (fs.existsSync(pkgJsonPath)) {
                version = JSON.parse(
                  fs.readFileSync(pkgJsonPath, 'utf-8'),
                ).version;
              }
            } catch {
              // Version unknown
            }
          }

          return {
            id: `${config.name}:${pkg}`,
            name: pkg,
            version: version || sharedCfg.requiredVersion || '0.0.0',
            singleton: sharedCfg.singleton || false,
            requiredVersion: sharedCfg.requiredVersion || '*',
            assets: chunks,
          };
        }),
      )
    : [];

  // Build remote metadata
  // Remotes can be strings ("http://...") or objects ({ entry: "http://...", shareScope: "..." })
  const remoteEntries: RemoteConfig[] = config.remotes
    ? Object.entries(config.remotes).map(([alias, remote]) => {
        let federationContainerName = alias;
        let entry: string;

        if (typeof remote === 'string') {
          entry = remote;
        } else if (remote && typeof remote === 'object' && 'entry' in remote) {
          entry = (remote as { entry: string }).entry;
        } else {
          entry = '';
        }

        // Parse name@url format
        const match = entry.match(/^(.+?)@(https?:\/\/.+)$/);
        if (match) {
          federationContainerName = match[1];
          entry = match[2];
        }

        return {
          federationContainerName,
          moduleName: '',
          alias,
          entry,
        };
      })
    : [];

  // Build expose metadata
  const exposeEntries: ExposeConfig[] = config.exposes
    ? await Promise.all(
        Object.entries(config.exposes).map(async ([expose, value]) => {
          const found =
            outputMapNoExt[value.replace('./', '')] ||
            outputMapNoExt[expose.replace('./', '')];
          const chunks = getChunks(found, outputMap);

          return {
            id: `${config.name}:${expose.replace(/^\.\//, '')}`,
            name: expose.replace(/^\.\//, ''),
            assets: chunks,
            path: expose,
          };
        }),
      )
    : [];

  // Build the manifest
  const containerOutput = outputMap[containerName];
  const manifest: Manifest = {
    id: config.name,
    name: config.name,
    metaData: {
      name: config.name,
      type: 'app',
      buildInfo: {
        buildVersion:
          process.env['NODE_ENV'] === 'development'
            ? 'local'
            : (process.env['NODE_ENV'] ?? ''),
        buildName: config.name.replace(/[^a-zA-Z0-9]/g, '_'),
      },
      remoteEntry: {
        name: config.filename || 'remoteEntry.js',
        path: containerOutput ? path.dirname(containerOutput.chunk) : '',
        type: 'esm',
      },
      types: {
        path: '',
        name: '',
        zip: '@mf-types.zip',
        api: '@mf-types.d.ts',
      },
      globalName: config.name,
      pluginVersion,
      publicPath,
    },
    shared: sharedEntries,
    remotes: remoteEntries,
    exposes: exposeEntries,
  };

  // Write manifest to disk
  const manifestDir = containerOutput
    ? path.dirname(containerOutput.chunk)
    : 'dist';
  const manifestPath = path.join(manifestDir, 'mf-manifest.json');

  try {
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[module-federation] Failed to write manifest:', e);
  }
}
