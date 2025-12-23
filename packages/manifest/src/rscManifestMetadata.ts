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
 * @internal
 *
 * In webpack multi-compiler builds, SSR compilation can run before the client
 * compiler has emitted `react-client-manifest.json` to disk. To avoid
 * filesystem-based bridging (and reduce flakiness), cache the client manifest
 * in-memory when the client compiler produces it, and let other compilers wait
 * on this registry instead of polling the filesystem.
 */
export const __RSC_CLIENT_MANIFEST_REGISTRY_KEY =
  '__MF_RSC_CLIENT_MANIFEST_REGISTRY__';

type ClientManifestJson = Record<string, any>;
type ClientManifestRegistry = Map<string, ClientManifestJson>;

function getClientManifestRegistry(): ClientManifestRegistry {
  const globalAny = globalThis as any;
  const existing = globalAny?.[__RSC_CLIENT_MANIFEST_REGISTRY_KEY];
  if (existing instanceof Map) {
    return existing as ClientManifestRegistry;
  }

  const created: ClientManifestRegistry = new Map();
  try {
    Object.defineProperty(globalAny, __RSC_CLIENT_MANIFEST_REGISTRY_KEY, {
      value: created,
      configurable: true,
    });
  } catch (_e) {
    globalAny[__RSC_CLIENT_MANIFEST_REGISTRY_KEY] = created;
  }

  return created;
}

function getClientManifestRegistryKey(outputDir: string, fileName: string) {
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
  getClientManifestRegistry().set(
    getClientManifestRegistryKey(outputDir, fileName),
    manifestJson,
  );
}

export function __getCachedClientManifestJson(
  outputDir: string,
  fileName: string,
): ClientManifestJson | null {
  if (typeof outputDir !== 'string' || outputDir.length === 0) return null;
  if (typeof fileName !== 'string' || fileName.length === 0) return null;
  return (
    getClientManifestRegistry().get(
      getClientManifestRegistryKey(outputDir, fileName),
    ) || null
  );
}

export async function __waitForCachedClientManifestJson(
  outputDir: string,
  fileName: string,
  { timeoutMs, pollIntervalMs }: { timeoutMs: number; pollIntervalMs: number },
): Promise<ClientManifestJson | null> {
  const timeout =
    typeof timeoutMs === 'number' && timeoutMs > 0 ? timeoutMs : 0;
  const interval =
    typeof pollIntervalMs === 'number' && pollIntervalMs > 0
      ? pollIntervalMs
      : 50;
  const start = Date.now();

  while (true) {
    const cached = __getCachedClientManifestJson(outputDir, fileName);
    if (cached) return cached;
    if (timeout > 0 && Date.now() - start > timeout) return null;
    await new Promise((resolve) => setTimeout(resolve, interval));
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

function readJsonFile(filePath: string): Record<string, any> | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const source = fs.readFileSync(filePath, 'utf8');
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

    clientComponents[moduleId] = {
      moduleId,
      request,
      ssrRequest,
      chunks: Array.isArray((entry as any).chunks) ? (entry as any).chunks : [],
      exports: [exportName],
      filePath: normalizeFileUrl(fileUrl),
    };
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

    clientComponents[moduleId] = {
      moduleId,
      request: ssrRequest,
      ssrRequest,
      chunks: [],
      exports: exportKeys,
      filePath: normalizeFileUrl(sampleExport?.specifier),
    };
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

    clientComponents[moduleId] = {
      moduleId,
      request: ssrRequest,
      ssrRequest,
      chunks: [],
      exports: [exportName],
      filePath: normalizeFileUrl(fileUrl),
    };
  }

  return clientComponents;
}

function mergeRscClientComponents(
  existing: Record<string, any> | undefined,
  incoming: Record<string, any> | undefined,
) {
  if (existing && incoming) return { ...existing, ...incoming };
  return incoming || existing || undefined;
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
  if (!baseRsc.serverActionsManifest && layer === 'rsc') {
    const serverActionsAsset = compilation.getAsset?.(
      DEFAULT_SERVER_ACTIONS_MANIFEST_ASSET,
    );
    if (serverActionsAsset) {
      baseRsc.serverActionsManifest = DEFAULT_SERVER_ACTIONS_MANIFEST_ASSET;
    }
  }

  if (!baseRsc.clientManifest) {
    const clientManifestAsset = compilation.getAsset?.(
      DEFAULT_CLIENT_MANIFEST_ASSET,
    );
    const outputPath = (compiler.options as any)?.output?.path;
    const outputDir =
      typeof outputPath === 'string' && outputPath.length > 0
        ? outputPath
        : null;
    const clientManifestInMemory =
      outputDir &&
      __getCachedClientManifestJson(outputDir, DEFAULT_CLIENT_MANIFEST_ASSET);
    const clientManifestOnDisk =
      outputDir &&
      fs.existsSync(path.join(outputDir, DEFAULT_CLIENT_MANIFEST_ASSET));
    if (clientManifestAsset || clientManifestInMemory || clientManifestOnDisk) {
      baseRsc.clientManifest = DEFAULT_CLIENT_MANIFEST_ASSET;
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
              const clientManifest = readJsonAsset(
                compilation,
                DEFAULT_CLIENT_MANIFEST_ASSET,
              );
              if (clientManifest) {
                if (outputDir) {
                  __cacheClientManifestJson(
                    outputDir,
                    DEFAULT_CLIENT_MANIFEST_ASSET,
                    clientManifest,
                  );
                }
                return buildClientComponentsFromClientManifest(clientManifest);
              }
              return undefined;
            }

            if (layer === 'ssr') {
              const ssrManifest =
                readJsonAsset(compilation, DEFAULT_SSR_MANIFEST_ASSET) ||
                (outputDir
                  ? readJsonFile(
                      path.join(outputDir, DEFAULT_SSR_MANIFEST_ASSET),
                    )
                  : null);
              if (ssrManifest) {
                return buildClientComponentsFromSsrManifest(ssrManifest);
              }

              const clientManifest =
                readJsonAsset(compilation, DEFAULT_CLIENT_MANIFEST_ASSET) ||
                (outputDir
                  ? readJsonFile(
                      path.join(outputDir, DEFAULT_CLIENT_MANIFEST_ASSET),
                    )
                  : null);
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
