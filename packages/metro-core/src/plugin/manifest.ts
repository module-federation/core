import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Manifest, StatsAssets } from '@module-federation/sdk';
import type { ModuleFederationConfigNormalized } from '../types';
import { MANIFEST_FILENAME, TMP_DIR_NAME } from './constants';
import { removeExtension, toPosixPath } from './helpers';

export type BundleHashMap = Map<string, string>;

export type ManifestGenerationOptions = {
  projectRoot?: string;
  target?: 'development' | 'build';
  tmpDirPath?: string;
};

export function createManifest(
  options: ModuleFederationConfigNormalized,
  mfMetroPath: string,
  hashesOrOptions?: BundleHashMap | ManifestGenerationOptions,
  manifestOptions?: ManifestGenerationOptions,
) {
  const { hashes, options: generationOptions } = normalizeManifestArgs(
    hashesOrOptions,
    manifestOptions,
  );
  const manifestPath = path.join(mfMetroPath, MANIFEST_FILENAME);
  const manifest = generateManifest(options, hashes, generationOptions);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, undefined, 2));
  return manifestPath;
}

export function updateManifest(
  manifestPath: string,
  options: ModuleFederationConfigNormalized,
  hashesOrOptions?: BundleHashMap | ManifestGenerationOptions,
  manifestOptions?: ManifestGenerationOptions,
): string {
  const { hashes, options: generationOptions } = normalizeManifestArgs(
    hashesOrOptions,
    manifestOptions,
  );
  const manifest = generateManifest(options, hashes, generationOptions);
  const existingManifest = readManifest(manifestPath);

  if (existingManifest?.metaData?.types) {
    manifest.metaData.types = {
      ...manifest.metaData.types,
      ...existingManifest.metaData.types,
    };
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, undefined, 2));
  return manifestPath;
}

/**
 * Compute SHA-256 of bundle code and store the hash for the matching
 * manifest entry (container, exposed, or shared).
 */
export function recordBundleHash(
  hashes: BundleHashMap,
  code: string,
  entryPoint: string,
  projectRoot: string,
  config: ModuleFederationConfigNormalized,
): void {
  const hash = crypto.createHash('sha256').update(code).digest('hex');
  const key = resolveBundleKey(entryPoint, projectRoot, config);
  if (key) hashes.set(key, hash);
}

// --- Manifest generation ---

function generateManifest(
  config: ModuleFederationConfigNormalized,
  hashes?: BundleHashMap,
  manifestOptions: ManifestGenerationOptions = {},
): Manifest {
  return {
    id: config.name,
    name: config.name,
    metaData: generateMetaData(config, hashes),
    exposes: generateExposes(config, hashes),
    remotes: generateRemotes(config),
    shared: generateShared(config, hashes, manifestOptions),
  };
}

function generateMetaData(
  config: ModuleFederationConfigNormalized,
  hashes?: BundleHashMap,
): Manifest['metaData'] {
  return {
    name: config.name,
    type: 'app',
    buildInfo: {
      buildVersion: '1.0.0',
      buildName: config.name,
      hash: hashes?.get(`container:${config.name}`) ?? '',
    },
    remoteEntry: {
      name: config.filename,
      path: '',
      type: 'global',
    },
    types: {
      path: '',
      name: '',
      api: '',
      zip: '',
    },
    globalName: config.name,
    pluginVersion: '',
    publicPath: 'auto',
  };
}

function generateExposes(
  config: ModuleFederationConfigNormalized,
  hashes?: BundleHashMap,
): Manifest['exposes'] {
  return Object.keys(config.exposes).map((expose) => {
    const formatKey = expose.replace('./', '');
    const assets = getEmptyAssets();

    assets.js.sync.push(config.exposes[expose]);

    return {
      id: `${config.name}:${formatKey}`,
      name: formatKey,
      path: expose,
      assets,
      hash: hashes?.get(`expose:${formatKey}`) ?? '',
    };
  });
}

function generateRemotes(
  config: ModuleFederationConfigNormalized,
): Manifest['remotes'] {
  return Object.keys(config.remotes).map((remote) => ({
    federationContainerName: config.remotes[remote],
    moduleName: remote,
    alias: remote,
    entry: '*',
  }));
}

function generateShared(
  config: ModuleFederationConfigNormalized,
  hashes?: BundleHashMap,
  manifestOptions: ManifestGenerationOptions = {},
): Manifest['shared'] {
  return Object.keys(config.shared).map((sharedName) => {
    const assets = getEmptyAssets();

    if (config.shared[sharedName].eager) {
      assets.js.sync.push(config.filename);
    } else if (config.shared[sharedName].import !== false) {
      assets.js.sync.push(getSharedAssetPath(sharedName, manifestOptions));
    }

    return {
      id: sharedName,
      name: sharedName,
      version: getManifestVersion(config.shared[sharedName].version),
      requiredVersion: getManifestRequiredVersion(
        config.shared[sharedName].requiredVersion,
      ),
      singleton: config.shared[sharedName].singleton,
      hash: hashes?.get(`shared:${sharedName}`) ?? '',
      assets,
    };
  });
}

// --- Bundle key resolution ---

/**
 * Identify which manifest entry an entryPoint corresponds to.
 * Returns a namespaced key (container:X, expose:X, shared:X) or null.
 */
function resolveBundleKey(
  entryPoint: string,
  projectRoot: string,
  config: ModuleFederationConfigNormalized,
): string | null {
  // Exposed module — match entry point against expose config paths
  const relPath = toPosixPath(path.relative(projectRoot, entryPoint));
  const normalizedRel = relPath.startsWith('./') ? relPath.slice(2) : relPath;
  const normalizedRelNoExt = removeExtension(normalizedRel);

  for (const [exposeKey, exposePath] of Object.entries(config.exposes)) {
    const normalizedExpose = toPosixPath(
      (exposePath as string).startsWith('./')
        ? (exposePath as string).slice(2)
        : (exposePath as string),
    );
    if (
      normalizedRel === normalizedExpose ||
      normalizedRelNoExt === removeExtension(normalizedExpose)
    ) {
      return `expose:${exposeKey.replace('./', '')}`;
    }
  }

  // Container entry — filename matches config.filename (ignoring extension)
  if (
    removeExtension(path.basename(entryPoint)) ===
    removeExtension(path.basename(config.filename))
  ) {
    return `container:${config.name}`;
  }

  const virtualSharedKey = resolveDevVirtualSharedKey(
    entryPoint,
    projectRoot,
    config,
  );
  if (virtualSharedKey) {
    return virtualSharedKey;
  }

  // Shared module — extract package name from the last node_modules/ segment.
  // Works for both plain and pnpm virtual store layouts.
  const absPath = toPosixPath(path.resolve(entryPoint));
  const nmMatch = absPath.match(/.*node_modules\/(.+)/);
  if (nmMatch) {
    const modulePath = removeExtension(nmMatch[1]);
    const sharedKey = findSharedKeyForModulePath(modulePath, config);
    if (sharedKey) {
      return `shared:${sharedKey}`;
    }
  }

  return null;
}

// --- Helpers ---

function normalizeManifestArgs(
  hashesOrOptions?: BundleHashMap | ManifestGenerationOptions,
  manifestOptions?: ManifestGenerationOptions,
): {
  hashes: BundleHashMap | undefined;
  options: ManifestGenerationOptions;
} {
  if (hashesOrOptions instanceof Map) {
    return { hashes: hashesOrOptions, options: manifestOptions ?? {} };
  }
  return { hashes: undefined, options: hashesOrOptions ?? {} };
}

function readManifest(manifestPath: string): Manifest | undefined {
  if (!fs.existsSync(manifestPath)) {
    return;
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as Manifest;
}

export function getSharedVirtualModuleName(sharedName: string): string {
  return sharedName.replaceAll('/', '_');
}

export function getSharedVirtualModulePath(
  tmpDirPath: string,
  sharedName: string,
): string {
  return path.join(
    tmpDirPath,
    'shared',
    `${getSharedVirtualModuleName(sharedName)}.js`,
  );
}

function getSharedAssetPath(
  sharedName: string,
  manifestOptions: ManifestGenerationOptions,
): string {
  if (
    manifestOptions.target === 'development' &&
    manifestOptions.projectRoot &&
    manifestOptions.tmpDirPath
  ) {
    return toPosixPath(
      path.relative(
        manifestOptions.projectRoot,
        getSharedVirtualModulePath(manifestOptions.tmpDirPath, sharedName),
      ),
    );
  }
  return `shared/${sharedName}.bundle`;
}

function resolveDevVirtualSharedKey(
  entryPoint: string,
  projectRoot: string,
  config: ModuleFederationConfigNormalized,
): string | null {
  const relativePath = toPosixPath(path.relative(projectRoot, entryPoint));
  const virtualSharedPrefix = `node_modules/${TMP_DIR_NAME}/shared/`;
  if (!relativePath.startsWith(virtualSharedPrefix)) {
    return null;
  }

  const virtualModuleName = removeExtension(
    relativePath.slice(virtualSharedPrefix.length),
  );
  const sharedKey = Object.keys(config.shared).find(
    (sharedName) =>
      getSharedVirtualModuleName(sharedName) === virtualModuleName,
  );
  return sharedKey ? `shared:${sharedKey}` : null;
}

function findSharedKeyForModulePath(
  modulePath: string,
  config: ModuleFederationConfigNormalized,
): string | null {
  const sharedEntries = Object.entries(config.shared)
    .map(([sharedName, sharedConfig]) => {
      const importName =
        typeof sharedConfig.import === 'string'
          ? sharedConfig.import
          : sharedName;
      return { importName, sharedName };
    })
    .sort((a, b) => b.importName.length - a.importName.length);

  const normalizedModulePath = toPosixPath(modulePath);
  for (const { importName, sharedName } of sharedEntries) {
    if (
      normalizedModulePath === importName ||
      normalizedModulePath.startsWith(`${importName}/`)
    ) {
      return sharedName;
    }
  }

  return null;
}

function getManifestVersion(version: unknown): string {
  return typeof version === 'string' ? version : '';
}

function getManifestRequiredVersion(requiredVersion: unknown): string {
  return typeof requiredVersion === 'string' ? requiredVersion : '*';
}

function getEmptyAssets(): StatsAssets {
  return {
    js: {
      sync: [],
      async: [],
    },
    css: {
      sync: [],
      async: [],
    },
  };
}
