import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ServerConfigT } from 'metro-config';
import type { ModuleFederationConfigNormalized } from '../types';
import type { VirtualModuleManager } from '../utils';
import { Server } from '../utils/metro-compat';
import type { Server as MetroServer } from '../utils/metro-compat';
import { MANIFEST_FILENAME } from './constants';
import { getRemoteEntryModule, getRemoteModule } from './generators';
import { removeExtension, replaceExtension, toPosixPath } from './helpers';
import { getSharedVirtualModulePath } from './manifest';

type BundleOptions = Parameters<MetroServer['build']>[0];

type Middleware = (
  req: IncomingMessage & { url?: string },
  res: ServerResponse,
  next: (error?: Error | null) => void,
) => unknown;

type ManifestMiddlewareOptions = {
  federationConfig: ModuleFederationConfigNormalized;
  projectRoot: string;
  remoteEntryPath: string;
  tmpDirPath: string;
  vmManager: Pick<VirtualModuleManager, 'registerVirtualModule'>;
};

type ManifestWarmupOptions = {
  dev: boolean;
  excludeSource: boolean;
  minify: boolean;
  platform: string;
  sourcePaths?: string;
};

type BundleWarmupRequest = {
  bundlePath: string;
  entryFile: string;
  isContainer: boolean;
  virtualModule?: {
    filePath: string;
    getCode: () => string;
  };
};

export function createManifestMiddleware({
  federationConfig,
  projectRoot,
  remoteEntryPath,
  tmpDirPath,
  vmManager,
}: ManifestMiddlewareOptions): NonNullable<ServerConfigT['enhanceMiddleware']> {
  const warmups = new Map<string, Promise<void>>();

  return (middleware, metroServer) => {
    const nextMiddleware = middleware as Middleware;

    return async (req, res, next) => {
      try {
        const warmupOptions = getManifestWarmupOptions(req.url);

        if (warmupOptions) {
          const warmupKey = JSON.stringify(warmupOptions);
          let warmup = warmups.get(warmupKey);

          if (!warmup) {
            warmup = warmManifestBundles(
              metroServer as Pick<typeof Server.prototype, 'build'>,
              {
                federationConfig,
                host: req.headers.host,
                projectRoot,
                remoteEntryPath,
                tmpDirPath,
                vmManager,
                warmupOptions,
              },
            ).finally(() => {
              warmups.delete(warmupKey);
            });
            warmups.set(warmupKey, warmup);
          }

          await warmup;
        }

        return nextMiddleware(req, res, next);
      } catch (error) {
        next(error instanceof Error ? error : new Error(String(error)));
      }
    };
  };
}

function getManifestWarmupOptions(
  rawUrl: string | undefined,
): ManifestWarmupOptions | null {
  const parsedUrl = new URL(rawUrl ?? '/', 'http://localhost');
  if (parsedUrl.pathname !== `/${MANIFEST_FILENAME}`) {
    return null;
  }

  const platform = parsedUrl.searchParams.get('platform');
  if (!platform) {
    return null;
  }

  return {
    dev: getBoolean(parsedUrl.searchParams, 'dev', true),
    excludeSource: getBoolean(parsedUrl.searchParams, 'excludeSource', false),
    minify: getBoolean(parsedUrl.searchParams, 'minify', false),
    platform,
    sourcePaths: parsedUrl.searchParams.get('sourcePaths') ?? undefined,
  };
}

async function warmManifestBundles(
  metroServer: Pick<typeof Server.prototype, 'build'>,
  {
    federationConfig,
    host,
    projectRoot,
    remoteEntryPath,
    tmpDirPath,
    vmManager,
    warmupOptions,
  }: ManifestMiddlewareOptions & {
    host: string | undefined;
    warmupOptions: ManifestWarmupOptions;
  },
) {
  for (const request of getBundleWarmupRequests({
    federationConfig,
    projectRoot,
    remoteEntryPath,
    tmpDirPath,
    vmManager,
  })) {
    if (request.virtualModule) {
      await ensureVirtualModuleReady(request.virtualModule, vmManager);
    }
    await metroServer.build(getBundleOptions(request, host, warmupOptions));
  }
}

function getBundleWarmupRequests({
  federationConfig,
  projectRoot,
  remoteEntryPath,
  tmpDirPath,
}: ManifestMiddlewareOptions): BundleWarmupRequest[] {
  const relativeTmpDirPath = toPosixPath(
    path.relative(projectRoot, tmpDirPath),
  );
  const remoteEntryName = removeExtension(path.basename(remoteEntryPath));
  const relativeRemoteEntryPath = toPosixPath(
    path.relative(projectRoot, remoteEntryPath),
  );
  const requests: BundleWarmupRequest[] = [
    {
      bundlePath: `${relativeTmpDirPath}/${remoteEntryName}.bundle`,
      entryFile: `./${relativeRemoteEntryPath}`,
      isContainer: true,
      virtualModule: {
        filePath: remoteEntryPath,
        getCode: () =>
          getRemoteEntryModule(federationConfig, {
            projectDir: projectRoot,
            tmpDir: tmpDirPath,
          }),
      },
    },
  ];

  for (const exposePath of Object.values(federationConfig.exposes)) {
    const bundlePath = getBundlePathForSource(exposePath);
    requests.push({
      bundlePath,
      entryFile: normalizeEntryFile(exposePath),
      isContainer: false,
    });
  }

  for (const [sharedName, sharedConfig] of Object.entries(
    federationConfig.shared,
  )) {
    if (sharedConfig.eager || sharedConfig.import === false) {
      continue;
    }

    const sharedVirtualModulePath = getSharedVirtualModulePath(
      tmpDirPath,
      sharedName,
    );
    const relativeSharedVirtualModulePath = toPosixPath(
      path.relative(projectRoot, sharedVirtualModulePath),
    );
    const sharedImportName = getSharedImportName(sharedName, sharedConfig);

    requests.push({
      bundlePath: replaceExtension(relativeSharedVirtualModulePath, '.bundle'),
      entryFile: normalizeEntryFile(relativeSharedVirtualModulePath),
      isContainer: false,
      virtualModule: {
        filePath: sharedVirtualModulePath,
        getCode: () => getRemoteModule(sharedImportName),
      },
    });
  }

  return requests;
}

async function ensureVirtualModuleReady(
  virtualModule: NonNullable<BundleWarmupRequest['virtualModule']>,
  vmManager: Pick<VirtualModuleManager, 'registerVirtualModule'>,
) {
  const code = virtualModule.getCode();
  await fs.mkdir(path.dirname(virtualModule.filePath), { recursive: true });
  await fs.writeFile(virtualModule.filePath, code, 'utf-8');
  vmManager.registerVirtualModule(virtualModule.filePath, () => code);
}

function getBundleOptions(
  request: BundleWarmupRequest,
  host: string | undefined,
  warmupOptions: ManifestWarmupOptions,
): BundleOptions {
  const query = getBundleQuery(warmupOptions, request.isContainer);
  const sourceUrl = getSourceUrl(host, request.bundlePath, query);

  const bundleOptions: BundleOptions = {
    ...Server.DEFAULT_BUNDLE_OPTIONS,
    dev: warmupOptions.dev,
    entryFile: request.entryFile,
    excludeSource: warmupOptions.excludeSource,
    lazy: true,
    minify: warmupOptions.minify,
    modulesOnly: !request.isContainer,
    platform: warmupOptions.platform,
    runModule: request.isContainer,
    sourceMapUrl: sourceUrl.replace(/\.bundle(\?)/, '.map$1'),
    sourceUrl,
  };

  if (warmupOptions.sourcePaths) {
    (bundleOptions as BundleOptions & { sourcePaths: string }).sourcePaths =
      warmupOptions.sourcePaths;
  }

  return bundleOptions;
}

function getBundleQuery(
  warmupOptions: ManifestWarmupOptions,
  isContainer: boolean,
): URLSearchParams {
  const query = new URLSearchParams();
  query.set('platform', warmupOptions.platform);
  query.set('dev', String(warmupOptions.dev));
  query.set('lazy', 'true');
  query.set('minify', String(warmupOptions.minify));
  query.set('runModule', String(isContainer));
  query.set('modulesOnly', String(!isContainer));
  if (warmupOptions.excludeSource) {
    query.set('excludeSource', 'true');
  }
  if (warmupOptions.sourcePaths) {
    query.set('sourcePaths', warmupOptions.sourcePaths);
  }
  return query;
}

function getSourceUrl(
  host: string | undefined,
  bundlePath: string,
  query: URLSearchParams,
) {
  const normalizedBundlePath = bundlePath.startsWith('/')
    ? bundlePath
    : `/${bundlePath}`;
  return `http://${host ?? 'localhost'}${normalizedBundlePath}?${query.toString()}`;
}

function getBundlePathForSource(sourcePath: string) {
  const normalized = toPosixPath(path.normalize(sourcePath));
  const withoutPrefix = normalized.startsWith('./')
    ? normalized.slice(2)
    : normalized;
  return replaceExtension(withoutPrefix, '.bundle');
}

function normalizeEntryFile(sourcePath: string) {
  const normalized = toPosixPath(path.normalize(sourcePath));
  return normalized.startsWith('./') ? normalized : `./${normalized}`;
}

function getSharedImportName(
  sharedName: string,
  sharedConfig: ModuleFederationConfigNormalized['shared'][string],
) {
  return typeof sharedConfig.import === 'string'
    ? sharedConfig.import
    : sharedName;
}

function getBoolean(
  params: URLSearchParams,
  key: string,
  defaultValue: boolean,
) {
  const value = params.get(key);
  if (value == null) {
    return defaultValue;
  }
  return value === 'true' || value === '1';
}
