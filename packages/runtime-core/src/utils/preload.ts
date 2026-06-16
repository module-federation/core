import {
  createLink,
  createScript,
  loadCssWithFetch,
  safeToString,
} from '@module-federation/sdk';
import {
  PreloadAssets,
  PreloadAssetResult,
  PreloadConfig,
  PreloadOptions,
  PreloadRemoteArgs,
  Remote,
  RemoteInfo,
  ResourceLoadContext,
  ResourceLoadType,
  depsPreloadArg,
} from '../type';
import { matchRemote } from './manifest';
import { assert } from './logger';
import { ModuleFederation } from '../core';
import { getRemoteEntry, isEsmRemoteType } from './load';
import { getPreloadedAsset, setPreloadedAsset } from '../global';

export function defaultPreloadArgs(
  preloadConfig: PreloadRemoteArgs | depsPreloadArg,
): PreloadConfig {
  return {
    resourceCategory: 'sync',
    share: true,
    depsRemote: true,
    recordPreloadedAssets: true,
    ...preloadConfig,
  } as PreloadConfig;
}

export function formatPreloadArgs(
  remotes: Array<Remote>,
  preloadArgs: Array<PreloadRemoteArgs>,
): PreloadOptions {
  return preloadArgs.map((args) => {
    const remoteInfo = matchRemote(remotes, args.nameOrAlias);
    assert(
      remoteInfo,
      `Unable to preload ${args.nameOrAlias} as it is not included in ${
        !remoteInfo &&
        safeToString({
          remoteInfo,
          remotes,
        })
      }`,
    );
    return {
      remote: remoteInfo,
      preloadConfig: defaultPreloadArgs(args),
    };
  });
}

export function normalizePreloadExposes(exposes?: string[]): string[] {
  if (!exposes) {
    return [];
  }

  return exposes.map((expose) => {
    if (expose === '.') {
      return expose;
    }
    if (expose.startsWith('./')) {
      return expose.replace('./', '');
    }
    return expose;
  });
}

function isTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.message.includes('timed out') || error.name.includes('Timeout');
}

function createAssetResult(
  context: ResourceLoadContext,
  url: string,
  status: PreloadAssetResult['status'],
  error?: unknown,
): PreloadAssetResult {
  return {
    url,
    status,
    resourceType: context.resourceType,
    initiator: context.initiator,
    id: context.id,
    error,
  };
}

function preloadAssetOnce(
  context: ResourceLoadContext,
  url: string,
  recordPreloadedAssets: boolean,
  preload: () => Promise<PreloadAssetResult>,
): Promise<PreloadAssetResult> {
  if (!recordPreloadedAssets) {
    return preload();
  }

  if (getPreloadedAsset(url)) {
    return Promise.resolve(createAssetResult(context, url, 'cached'));
  }

  setPreloadedAsset(url);
  return preload();
}

async function waitForRemoteEntryPreload(
  host: ModuleFederation,
  remoteInfo: RemoteInfo,
  entryRemoteInfo: RemoteInfo,
  context: ResourceLoadContext,
): Promise<PreloadAssetResult> {
  const cachedRemote = host.moduleCache.get(entryRemoteInfo.name);
  const url = entryRemoteInfo.entry;
  if (cachedRemote?.remoteEntryExports) {
    return createAssetResult(context, url, 'cached');
  }

  try {
    const remoteEntryExports = await getRemoteEntry({
      origin: host,
      remoteInfo: entryRemoteInfo,
      remoteEntryExports: cachedRemote?.remoteEntryExports,
      resourceContext: {
        ...context,
        url,
      },
    });
    if (!remoteEntryExports) {
      throw new Error(`Failed to load remoteEntry "${url}".`);
    }
    return createAssetResult(context, url, 'success');
  } catch (error) {
    return createAssetResult(
      context,
      url,
      isTimeoutError(error) ? 'timeout' : 'error',
      error,
    );
  }
}

function waitForLinkPreload({
  host,
  remoteInfo,
  url,
  attrs,
  context,
  needDeleteLink,
}: {
  host: ModuleFederation;
  remoteInfo: RemoteInfo;
  url: string;
  attrs: Record<string, string>;
  context: ResourceLoadContext;
  needDeleteLink?: boolean;
}): Promise<PreloadAssetResult> {
  return new Promise((resolve) => {
    const { link, needAttach } = createLink({
      url,
      cb: () => {
        resolve(
          createAssetResult(context, url, needAttach ? 'success' : 'cached'),
        );
      },
      onErrorCallback: (error) => {
        resolve(
          createAssetResult(
            context,
            url,
            isTimeoutError(error) ? 'timeout' : 'error',
            error,
          ),
        );
      },
      attrs,
      createLinkHook: (hookUrl, hookAttrs) => {
        const res = host.loaderHook.lifecycle.createLink.emit({
          url: hookUrl,
          attrs: hookAttrs,
          remoteInfo,
          resourceContext: {
            ...context,
            url: hookUrl,
          },
        });
        if (res instanceof HTMLLinkElement) {
          return res;
        }
        return res;
      },
      needDeleteLink,
    });

    needAttach && document.head.appendChild(link);
  });
}

// When the remote carries fetchOptions, CSS must be fetched WITH headers and
// injected as a blob <link> — a native <link href> cannot carry headers, and a
// rel=preload hint would 401. Mirrors loadCss in the loader PoC.
function waitForCssFetch({
  host,
  remoteInfo,
  url,
  context,
}: {
  host: ModuleFederation;
  remoteInfo: RemoteInfo;
  url: string;
  context: ResourceLoadContext;
}): Promise<PreloadAssetResult> {
  return loadCssWithFetch({
    href: url,
    fetchOptions: remoteInfo.fetchOptions,
    customFetch: async (u, init) =>
      host.loaderHook.lifecycle.fetch.emit(u, init, remoteInfo),
  })
    .then(() => createAssetResult(context, url, 'success'))
    .catch((error) =>
      createAssetResult(
        context,
        url,
        isTimeoutError(error) ? 'timeout' : 'error',
        error,
      ),
    );
}

function waitForScriptPreload({
  host,
  remoteInfo,
  url,
  attrs,
  context,
}: {
  host: ModuleFederation;
  remoteInfo: RemoteInfo;
  url: string;
  attrs: Record<string, string>;
  context: ResourceLoadContext;
}): Promise<PreloadAssetResult> {
  return new Promise((resolve) => {
    const { script, needAttach } = createScript({
      url,
      cb: () => {
        resolve(
          createAssetResult(context, url, needAttach ? 'success' : 'cached'),
        );
      },
      onErrorCallback: (error) => {
        resolve(
          createAssetResult(
            context,
            url,
            isTimeoutError(error) ? 'timeout' : 'error',
            error,
          ),
        );
      },
      attrs,
      createScriptHook: (hookUrl: string, hookAttrs: any) => {
        const res = host.loaderHook.lifecycle.createScript.emit({
          url: hookUrl,
          attrs: hookAttrs,
          remoteInfo,
          resourceContext: {
            ...context,
            url: hookUrl,
          },
        });
        if (res instanceof HTMLScriptElement) {
          return res;
        }
        return res;
      },
      needDeleteScript: true,
    });

    needAttach && document.head.appendChild(script);
  });
}

function createResourceContext(
  baseContext: Omit<ResourceLoadContext, 'resourceType'>,
  resourceType: ResourceLoadType,
): ResourceLoadContext {
  return {
    ...baseContext,
    resourceType,
  };
}

export function preloadAssets(
  remoteInfo: RemoteInfo,
  host: ModuleFederation,
  assets: PreloadAssets,
  // It is used to distinguish preload from load remote parallel loading
  useLinkPreload = true,
  baseContext: Omit<ResourceLoadContext, 'resourceType'> = {
    initiator: 'preloadRemote',
    id: remoteInfo.name,
  },
  recordPreloadedAssets = true,
): Promise<PreloadAssetResult[]> {
  const { cssAssets, jsAssetsWithoutEntry, entryAssets } = assets;
  const results: Array<Promise<PreloadAssetResult>> = [];

  if (host.options.inBrowser) {
    entryAssets.forEach((asset) => {
      const { moduleInfo: entryRemoteInfo } = asset;
      results.push(
        waitForRemoteEntryPreload(
          host,
          remoteInfo,
          entryRemoteInfo,
          createResourceContext(baseContext, 'remoteEntry'),
        ),
      );
    });

    if (remoteInfo.fetchOptions) {
      cssAssets.forEach((cssUrl) => {
        results.push(
          waitForCssFetch({
            host,
            remoteInfo,
            url: cssUrl,
            context: createResourceContext(baseContext, 'css'),
          }),
        );
      });
    } else if (useLinkPreload) {
      const defaultAttrs = {
        rel: 'preload',
        as: 'style',
      };
      cssAssets.forEach((cssUrl) => {
        const context = createResourceContext(baseContext, 'css');
        results.push(
          preloadAssetOnce(context, cssUrl, recordPreloadedAssets, () =>
            waitForLinkPreload({
              host,
              remoteInfo,
              url: cssUrl,
              attrs: defaultAttrs,
              context,
            }),
          ),
        );
      });
    } else {
      const defaultAttrs = {
        rel: 'stylesheet',
        type: 'text/css',
      };
      cssAssets.forEach((cssUrl) => {
        const context = createResourceContext(baseContext, 'css');
        results.push(
          preloadAssetOnce(context, cssUrl, recordPreloadedAssets, () =>
            waitForLinkPreload({
              host,
              remoteInfo,
              url: cssUrl,
              attrs: defaultAttrs,
              needDeleteLink: false,
              context,
            }),
          ),
        );
      });
    }

    let preloadJsAsset = waitForScriptPreload;
    let defaultAttrs: Record<string, string> = {
      fetchpriority: 'high',
      type: 'text/javascript',
    };

    if (useLinkPreload) {
      preloadJsAsset = waitForLinkPreload;
      defaultAttrs = {
        rel: 'preload',
        as: 'script',
      };
    } else if (isEsmRemoteType(remoteInfo.type)) {
      preloadJsAsset = waitForLinkPreload;
      defaultAttrs = {
        rel: 'modulepreload',
        fetchpriority: 'high',
      };
    }

    jsAssetsWithoutEntry.forEach((jsUrl) => {
      const context = createResourceContext(baseContext, 'js');
      results.push(
        preloadAssetOnce(context, jsUrl, recordPreloadedAssets, () =>
          preloadJsAsset({
            host,
            remoteInfo,
            url: jsUrl,
            attrs: defaultAttrs,
            context,
          }),
        ),
      );
    });
  }

  return Promise.all(results);
}
