import fs from 'fs';
import path from 'path';
import type { Compiler } from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';

const DEFAULT_CLIENT_MANIFEST_ASSET = 'react-client-manifest.json';
const DEFAULT_SSR_MANIFEST_ASSET = 'react-ssr-manifest.json';
const DEFAULT_SERVER_ACTIONS_MANIFEST_ASSET =
  'react-server-actions-manifest.json';

type ExposeTypes = Record<string, string>;

/**
 * Shared build-time plugin state for RSC manifest data.
 *
 * Uses module-scoped Maps instead of globalThis, inspired by Next.js's
 * `getProxiedPluginState` pattern. All plugins within the same process
 * share state by importing from this module directly.
 *
 * @see https://github.com/vercel/next.js/blob/canary/packages/next/src/build/build-context.ts
 */

type ClientManifestJson = Record<string, any>;
type ClientManifestWaiter = {
  promise: Promise<ClientManifestJson>;
  resolve: (value: ClientManifestJson) => void;
};

const clientManifestRegistry = new Map<string, ClientManifestJson>();
const clientManifestWaiters = new Map<string, ClientManifestWaiter>();

function makeKey(outputDir: string, fileName: string): string {
  return `${outputDir}::${fileName}`;
}

export function __cacheClientManifestJson(
  outputDir: string,
  fileName: string,
  manifestJson: ClientManifestJson,
) {
  if (typeof outputDir !== 'string' || outputDir.length === 0) return;
  if (typeof fileName !== 'string' || fileName.length === 0) return;
  if (!manifestJson || typeof manifestJson !== 'object') return;
  const key = makeKey(outputDir, fileName);
  clientManifestRegistry.set(key, manifestJson);
  const waiter = clientManifestWaiters.get(key);
  if (waiter) {
    waiter.resolve(manifestJson);
    clientManifestWaiters.delete(key);
  }
}

export function __getCachedClientManifestJson(
  outputDir: string,
  fileName: string,
): ClientManifestJson | null {
  if (typeof outputDir !== 'string' || outputDir.length === 0) return null;
  if (typeof fileName !== 'string' || fileName.length === 0) return null;
  return clientManifestRegistry.get(makeKey(outputDir, fileName)) || null;
}

export async function __waitForCachedClientManifestJson(
  outputDir: string,
  fileName: string,
  { timeoutMs, pollIntervalMs }: { timeoutMs: number; pollIntervalMs: number },
): Promise<ClientManifestJson | null> {
  void pollIntervalMs;
  const timeout =
    typeof timeoutMs === 'number' && timeoutMs > 0 ? timeoutMs : 0;
  const cached = __getCachedClientManifestJson(outputDir, fileName);
  if (cached) return cached;

  const key = makeKey(outputDir, fileName);
  const existing = clientManifestWaiters.get(key);
  let waiter: ClientManifestWaiter;
  if (existing) {
    waiter = existing;
  } else {
    let resolve!: (value: ClientManifestJson) => void;
    const promise = new Promise<ClientManifestJson>((res) => {
      resolve = res;
    });
    waiter = { promise, resolve };
    clientManifestWaiters.set(key, waiter);
  }
  if (!timeout) {
    return waiter.promise;
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      waiter.promise,
      new Promise<ClientManifestJson | null>((resolve) => {
        timeoutId = setTimeout(() => resolve(null), timeout);
        if (timeoutId && typeof timeoutId.unref === 'function') {
          timeoutId.unref();
        }
      }),
    ]);
    return result;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export function inferRscLayer(
  compiler: Pick<Compiler, 'options'>,
  conditionNames?: string[],
): string {
  const normalizedConditions = conditionNames || [];
  if (normalizedConditions.includes('react-server')) return 'rsc';

  const target = compiler.options.target;
  const targetString = Array.isArray(target)
    ? target.join(',')
    : String(target);
  if (targetString.includes('async-node')) return 'ssr';

  return 'client';
}

function readJsonAsset(
  compilation: any,
  assetName: string,
): Record<string, any> | null {
  try {
    const asset = compilation.getAsset?.(assetName);
    if (!asset) return null;

    const raw = asset.source?.source?.();
    const source = typeof raw === 'string' ? raw : raw?.toString?.();
    if (!source) return null;

    return JSON.parse(source);
  } catch (_e) {
    return null;
  }
}

function normalizeFileUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.replace(/^file:\/\//, '');
}

function isCompilationAssetName(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (value.length === 0) return false;
  // URLs are never compilation asset names.
  if (value.startsWith('file://')) return false;
  if (value.startsWith('http://') || value.startsWith('https://')) return false;
  // Reject absolute filesystem paths; allow asset subpaths like "assets/foo.json".
  return !path.isAbsolute(value);
}

export function __getClientManifestAssetName(
  rscOptions: moduleFederationPlugin.ManifestRscOptions | undefined,
): string {
  const candidate = (rscOptions as any)?.clientManifest;
  if (isCompilationAssetName(candidate)) return candidate;
  return DEFAULT_CLIENT_MANIFEST_ASSET;
}

function mergeUniqueStrings(
  left: unknown,
  right: unknown,
  fallback: string[] = [],
): string[] {
  const merged = new Set<string>();
  const values = [left, right, fallback];
  for (const value of values) {
    if (!Array.isArray(value)) continue;
    for (const item of value) {
      if (typeof item === 'string' && item.length > 0) {
        merged.add(item);
      }
    }
  }
  return Array.from(merged);
}

function upsertClientComponent(
  target: Record<string, any>,
  moduleId: string,
  next: Record<string, any>,
) {
  const existing = target[moduleId];
  if (!existing) {
    target[moduleId] = next;
    return;
  }
  target[moduleId] = {
    ...existing,
    ...next,
    request: existing.request || next.request,
    ssrRequest: existing.ssrRequest || next.ssrRequest,
    chunks: mergeUniqueStrings(existing.chunks, next.chunks),
    exports: mergeUniqueStrings(existing.exports, next.exports, ['default']),
    filePath: existing.filePath || next.filePath,
  };
}

export function buildClientComponentsFromClientManifest(
  clientManifest: Record<string, any>,
) {
  const clientComponents: Record<string, any> = {};

  for (const [fileUrl, entry] of Object.entries(clientManifest || {})) {
    if (!entry || typeof entry !== 'object') continue;
    const moduleId = (entry as any).id;
    if (typeof moduleId !== 'string') continue;

    const exportName =
      typeof (entry as any).name === 'string' && (entry as any).name.length > 0
        ? (entry as any).name
        : 'default';

    const withoutPrefix = moduleId.replace(/^\(client\)\//, '');
    const request = withoutPrefix.startsWith('.')
      ? withoutPrefix
      : `./${withoutPrefix}`;
    const ssrRequest = moduleId.replace(/^\(client\)/, '(ssr)');

    upsertClientComponent(clientComponents, moduleId, {
      moduleId,
      request,
      ssrRequest,
      chunks: Array.isArray((entry as any).chunks) ? (entry as any).chunks : [],
      exports: [exportName],
      filePath: normalizeFileUrl(fileUrl),
    });
  }

  return clientComponents;
}

export function buildClientComponentsFromSsrManifest(
  ssrManifest: Record<string, any>,
) {
  const clientComponents: Record<string, any> = {};
  const moduleMap = ssrManifest?.moduleMap || {};

  for (const [moduleId, exportsMap] of Object.entries(moduleMap)) {
    if (typeof moduleId !== 'string') continue;
    if (!exportsMap || typeof exportsMap !== 'object') continue;

    const ssrRequest = moduleId.replace(/^\(client\)/, '(ssr)');

    const exportKeys = Object.keys(exportsMap as Record<string, any>);
    const sampleExport =
      (exportsMap as any)['*'] || Object.values(exportsMap as any)[0] || null;

    upsertClientComponent(clientComponents, moduleId, {
      moduleId,
      request: ssrRequest,
      ssrRequest,
      chunks: [],
      exports: exportKeys,
      filePath: normalizeFileUrl(sampleExport?.specifier),
    });
  }

  return clientComponents;
}

function buildClientComponentsFromClientManifestForSSR(
  clientManifest: Record<string, any>,
) {
  const clientComponents: Record<string, any> = {};

  for (const [fileUrl, entry] of Object.entries(clientManifest || {})) {
    if (!entry || typeof entry !== 'object') continue;
    const moduleId = (entry as any).id;
    if (typeof moduleId !== 'string') continue;

    const exportName =
      typeof (entry as any).name === 'string' && (entry as any).name.length > 0
        ? (entry as any).name
        : 'default';

    const ssrRequest = moduleId.replace(/^\(client\)/, '(ssr)');

    upsertClientComponent(clientComponents, moduleId, {
      moduleId,
      request: ssrRequest,
      ssrRequest,
      chunks: [],
      exports: [exportName],
      filePath: normalizeFileUrl(fileUrl),
    });
  }

  return clientComponents;
}

function mergeRscClientComponents(
  existing: Record<string, any> | undefined,
  incoming: Record<string, any> | undefined,
) {
  if (!existing) return incoming || undefined;
  if (!incoming) return existing;

  const merged = { ...existing };
  for (const [moduleId, component] of Object.entries(incoming)) {
    if (!component || typeof component !== 'object') continue;
    upsertClientComponent(merged, moduleId, component as Record<string, any>);
  }
  return merged;
}

function normalizeExposes(
  exposes: moduleFederationPlugin.ModuleFederationPluginOptions['exposes'],
): Record<string, string[]> {
  if (!exposes) return {};

  if (Array.isArray(exposes)) {
    return exposes.reduce<Record<string, string[]>>((acc, item) => {
      if (!item) return acc;
      if (typeof item === 'string') {
        acc[item] = [item];
        return acc;
      }
      if (typeof (item as any).key === 'string') {
        const key = (item as any).key as string;
        const importValue = (item as any).import ?? (item as any).value;
        if (typeof importValue === 'string') acc[key] = [importValue];
        else if (Array.isArray(importValue))
          acc[key] = importValue.filter((v) => typeof v === 'string');
      }
      return acc;
    }, {});
  }

  if (typeof exposes === 'object') {
    return Object.entries(exposes as Record<string, any>).reduce<
      Record<string, string[]>
    >((acc, [exposeKey, exposeValue]) => {
      if (!exposeKey) return acc;

      if (typeof exposeValue === 'string') {
        acc[exposeKey] = [exposeValue];
        return acc;
      }

      if (Array.isArray(exposeValue)) {
        acc[exposeKey] = exposeValue.filter((v) => typeof v === 'string');
        return acc;
      }

      if (exposeValue && typeof exposeValue === 'object') {
        const importValue = (exposeValue as any).import;
        if (typeof importValue === 'string') {
          acc[exposeKey] = [importValue];
          return acc;
        }
        if (Array.isArray(importValue)) {
          acc[exposeKey] = importValue.filter((v) => typeof v === 'string');
          return acc;
        }
      }

      return acc;
    }, {});
  }

  return {};
}

function getModuleDirectiveIndex(compilation: any): Map<string, string | null> {
  const directiveByResource = new Map<string, string | null>();
  const modules = compilation?.modules;

  if (!modules || typeof (modules as any)[Symbol.iterator] !== 'function') {
    return directiveByResource;
  }

  const visited = new Set<any>();

  const addModule = (mod: any) => {
    if (!mod) return;

    const directive =
      typeof mod?.buildInfo?.rscDirective === 'string'
        ? (mod.buildInfo.rscDirective as string)
        : null;

    const resourceCandidate =
      typeof mod.resource === 'string'
        ? mod.resource
        : typeof mod.nameForCondition === 'function'
          ? mod.nameForCondition()
          : null;

    if (typeof resourceCandidate === 'string' && resourceCandidate.length > 0) {
      const resource = resourceCandidate.split('?')[0];
      directiveByResource.set(path.normalize(resource), directive);
    }
  };

  const walk = (mod: any) => {
    if (!mod || visited.has(mod)) return;
    visited.add(mod);

    addModule(mod);

    // Webpack may wrap modules (e.g. ConcatenatedModule). Capture underlying
    // NormalModules so we can still match on absolute resource paths.
    const nested = mod.modules;
    if (nested && typeof nested[Symbol.iterator] === 'function') {
      for (const child of nested) {
        walk(child);
      }
    }

    const root = mod.rootModule;
    if (root) walk(root);
  };

  for (const mod of modules as any) {
    walk(mod);
  }

  return directiveByResource;
}

function inferExposeType(
  layer: string,
  directive: string | null,
): string | undefined {
  if (directive === 'use client') return 'client-component';
  if (directive === 'use server') {
    return layer === 'client' ? 'server-action-stubs' : 'server-action';
  }
  if (layer === 'rsc') return 'server-component';
  return undefined;
}

function buildExposeTypesFromCompilation({
  compilation,
  compiler,
  layer,
  exposes,
}: {
  compilation: any;
  compiler: Pick<Compiler, 'options'>;
  layer: string;
  exposes: moduleFederationPlugin.ModuleFederationPluginOptions['exposes'];
}): ExposeTypes | undefined {
  const normalizedExposes = normalizeExposes(exposes);
  const exposeKeys = Object.keys(normalizedExposes);
  if (exposeKeys.length === 0) return undefined;

  const webpackContext =
    typeof (compiler.options as any)?.context === 'string' &&
    (compiler.options as any).context.length > 0
      ? ((compiler.options as any).context as string)
      : process.cwd();

  const directiveIndex = getModuleDirectiveIndex(compilation);
  const exposeTypes: ExposeTypes = {};

  for (const [exposeKey, imports] of Object.entries(normalizedExposes)) {
    const importCandidates = Array.isArray(imports) ? imports : [];
    let directive: string | null = null;

    for (const importRequest of importCandidates) {
      if (typeof importRequest !== 'string' || importRequest.length === 0) {
        continue;
      }
      const abs = path.isAbsolute(importRequest)
        ? importRequest
        : path.resolve(webpackContext, importRequest);
      const normalized = path.normalize(abs);
      if (directiveIndex.has(normalized)) {
        directive = directiveIndex.get(normalized) || null;
        break;
      }
    }

    const type = inferExposeType(layer, directive);
    if (type) exposeTypes[exposeKey] = type;
  }

  return Object.keys(exposeTypes).length > 0 ? exposeTypes : undefined;
}

export function applyRscManifestMetadata({
  stats,
  compiler,
  compilation,
  rscOptions,
  mfOptions,
}: {
  stats: any;
  compiler: Pick<Compiler, 'options'>;
  compilation: any;
  rscOptions: moduleFederationPlugin.ManifestRscOptions;
  mfOptions?: moduleFederationPlugin.ModuleFederationPluginOptions;
}) {
  if (!rscOptions || typeof rscOptions !== 'object') return stats;

  const existingRsc =
    stats?.additionalData?.rsc || stats?.rsc || ({} as Record<string, any>);

  const compilerConditionNames = Array.isArray(
    (compiler.options as any)?.resolve?.conditionNames,
  )
    ? ((compiler.options as any).resolve.conditionNames as string[])
    : undefined;

  const conditionNames = rscOptions.conditionNames || compilerConditionNames;
  const layer = rscOptions.layer || inferRscLayer(compiler, conditionNames);
  const isRSC =
    typeof rscOptions.isRSC === 'boolean'
      ? rscOptions.isRSC
      : layer === 'rsc' || conditionNames?.includes('react-server') || false;
  const shareScope =
    rscOptions.shareScope ||
    (layer === 'rsc'
      ? 'rsc'
      : layer === 'client' || layer === 'ssr'
        ? 'client'
        : 'default');

  const baseRsc = {
    ...existingRsc,
    ...rscOptions,
    layer,
    shareScope,
    isRSC,
    conditionNames,
  };

  // When present, publish well-known manifest asset names so runtimes can resolve
  // them relative to the federation manifest URL (no hard-coded hostnames).
  const shouldPublishServerActions =
    (rscOptions as any)?.serverActionsManifest !== false;

  if (
    !baseRsc.serverActionsManifest &&
    layer === 'rsc' &&
    shouldPublishServerActions
  ) {
    const serverActionsAsset = compilation.getAsset?.(
      DEFAULT_SERVER_ACTIONS_MANIFEST_ASSET,
    );
    if (serverActionsAsset) {
      baseRsc.serverActionsManifest = DEFAULT_SERVER_ACTIONS_MANIFEST_ASSET;
    } else {
      const outputPath = (compiler.options as any)?.output?.path;
      const outputDir =
        typeof outputPath === 'string' && outputPath.length > 0
          ? outputPath
          : null;
      if (outputDir) {
        const serverActionsPath = path.join(
          outputDir,
          DEFAULT_SERVER_ACTIONS_MANIFEST_ASSET,
        );
        if (fs.existsSync(serverActionsPath)) {
          baseRsc.serverActionsManifest = DEFAULT_SERVER_ACTIONS_MANIFEST_ASSET;
        }
      }
    }
    if (!baseRsc.serverActionsManifest) {
      baseRsc.serverActionsManifest = DEFAULT_SERVER_ACTIONS_MANIFEST_ASSET;
    }
  }

  if (!baseRsc.clientManifest) {
    const clientManifestAssetName = __getClientManifestAssetName(rscOptions);
    const clientManifestAsset = compilation.getAsset?.(clientManifestAssetName);
    const outputPath = (compiler.options as any)?.output?.path;
    const outputDir =
      typeof outputPath === 'string' && outputPath.length > 0
        ? outputPath
        : null;
    const clientManifestInMemory =
      outputDir &&
      __getCachedClientManifestJson(outputDir, clientManifestAssetName);
    if (clientManifestAsset || clientManifestInMemory) {
      baseRsc.clientManifest = clientManifestAssetName;
    }
  }

  const computedClientComponents =
    layer === 'rsc'
      ? undefined
      : rscOptions.clientComponents &&
          typeof rscOptions.clientComponents === 'object'
        ? (rscOptions.clientComponents as Record<string, any>)
        : (() => {
            const outputPath = (compiler.options as any)?.output?.path;
            const outputDir =
              typeof outputPath === 'string' && outputPath.length > 0
                ? outputPath
                : null;

            if (layer === 'client') {
              const clientManifestAssetName =
                __getClientManifestAssetName(rscOptions);
              const clientManifest = readJsonAsset(
                compilation,
                clientManifestAssetName,
              );
              if (clientManifest) {
                if (outputDir) {
                  __cacheClientManifestJson(
                    outputDir,
                    clientManifestAssetName,
                    clientManifest,
                  );
                }
                return buildClientComponentsFromClientManifest(clientManifest);
              }
              return undefined;
            }

            if (layer === 'ssr') {
              const ssrManifest = readJsonAsset(
                compilation,
                DEFAULT_SSR_MANIFEST_ASSET,
              );
              if (ssrManifest) {
                return buildClientComponentsFromSsrManifest(ssrManifest);
              }

              const clientManifest =
                (outputDir
                  ? __getCachedClientManifestJson(
                      outputDir,
                      __getClientManifestAssetName(rscOptions),
                    )
                  : null) ||
                readJsonAsset(
                  compilation,
                  __getClientManifestAssetName(rscOptions),
                );
              if (clientManifest) {
                return buildClientComponentsFromClientManifestForSSR(
                  clientManifest,
                );
              }
              return undefined;
            }

            return undefined;
          })();

  baseRsc.clientComponents = mergeRscClientComponents(
    existingRsc?.clientComponents,
    computedClientComponents,
  );

  const hasExposeTypes =
    baseRsc.exposeTypes && typeof baseRsc.exposeTypes === 'object'
      ? Object.keys(baseRsc.exposeTypes as Record<string, any>).length > 0
      : false;
  if (!hasExposeTypes && mfOptions?.exposes) {
    const exposeTypes = buildExposeTypesFromCompilation({
      compilation,
      compiler,
      layer,
      exposes: mfOptions.exposes,
    });
    if (exposeTypes) {
      baseRsc.exposeTypes = exposeTypes;
    }
  }

  stats.additionalData = stats.additionalData || {};
  stats.additionalData.rsc = baseRsc;
  stats.rsc = baseRsc;

  return stats;
}
