import fs from 'fs';
import path from 'path';
import type { Compiler } from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';

const DEFAULT_CLIENT_MANIFEST_ASSET = 'react-client-manifest.json';
const DEFAULT_SSR_MANIFEST_ASSET = 'react-ssr-manifest.json';

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

export function applyRscManifestMetadata({
  stats,
  compiler,
  compilation,
  rscOptions,
}: {
  stats: any;
  compiler: Pick<Compiler, 'options'>;
  compilation: any;
  rscOptions: moduleFederationPlugin.ManifestRscOptions;
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

  stats.additionalData = stats.additionalData || {};
  stats.additionalData.rsc = baseRsc;
  stats.rsc = baseRsc;

  return stats;
}
