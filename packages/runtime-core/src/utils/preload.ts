import { createLink, createScript, safeToString } from '@module-federation/sdk';
import {
  PreloadAssets,
  PreloadAssetResult,
  PreloadConfig,
  PreloadOptions,
  PreloadRemoteArgs,
  Remote,
  RemoteInfo,
  ResourceLoadContext,
  ResourceLoadOutcome,
  ResourceLoadResult,
  ResourceLoadType,
  depsPreloadArg,
} from '../type';
import { matchRemote } from './manifest';
import { assert } from './logger';
import { ModuleFederation } from '../core';
import { getRemoteEntry, isEsmRemoteType } from './load';
import { emitCachedResourceLoad, startResourceLoad } from './resource';

export function defaultPreloadArgs(
  preloadConfig: PreloadRemoteArgs | depsPreloadArg,
): PreloadConfig {
  return {
    resourceCategory: 'sync',
    share: true,
    depsRemote: true,
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
  resourceResult?: ResourceLoadResult,
): PreloadAssetResult {
  return {
    url,
    status,
    resourceType: context.resourceType,
    initiator: context.initiator,
    id: context.id,
    cacheSource: resourceResult?.cacheSource,
    error: resourceResult?.error || error,
  };
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
    const resourceResult = await emitCachedResourceLoad(host, {
      context: {
        ...context,
        url,
      },
      url,
      remoteInfo: entryRemoteInfo,
      cacheSource: 'mf-memory',
    });
    return createAssetResult(context, url, 'cached', undefined, resourceResult);
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
  return startResourceLoad(host, {
    context: {
      ...context,
      url,
    },
    url,
    remoteInfo,
  }).then(
    (attempt) =>
      new Promise((resolve) => {
        let needAttach = true;
        const settle = (outcome: ResourceLoadOutcome, error?: unknown) => {
          void attempt
            .finish(outcome, {
              cacheSource: outcome === 'cached' ? 'browser' : undefined,
              error,
            })
            .then((resourceResult) => {
              resolve(
                createAssetResult(
                  context,
                  url,
                  resourceResult.outcome,
                  resourceResult.error,
                  resourceResult,
                ),
              );
            });
        };
        const createdLink = createLink({
          url,
          cb: () => {
            settle(needAttach ? 'success' : 'cached');
          },
          onErrorCallback: (error) => {
            settle(isTimeoutError(error) ? 'timeout' : 'error', error);
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
        const { link } = createdLink;
        needAttach = createdLink.needAttach;

        needAttach && document.head.appendChild(link);
      }),
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
  return startResourceLoad(host, {
    context: {
      ...context,
      url,
    },
    url,
    remoteInfo,
  }).then(
    (attempt) =>
      new Promise((resolve) => {
        let needAttach = true;
        const settle = (outcome: ResourceLoadOutcome, error?: unknown) => {
          void attempt
            .finish(outcome, {
              cacheSource: outcome === 'cached' ? 'browser' : undefined,
              error,
            })
            .then((resourceResult) => {
              resolve(
                createAssetResult(
                  context,
                  url,
                  resourceResult.outcome,
                  resourceResult.error,
                  resourceResult,
                ),
              );
            });
        };
        const createdScript = createScript({
          url,
          cb: () => {
            settle(needAttach ? 'success' : 'cached');
          },
          onErrorCallback: (error) => {
            settle(isTimeoutError(error) ? 'timeout' : 'error', error);
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
        const { script } = createdScript;
        needAttach = createdScript.needAttach;

        needAttach && document.head.appendChild(script);
        if (!needAttach) {
          queueMicrotask(() => settle('cached'));
        }
      }),
  );
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

    if (useLinkPreload) {
      const defaultAttrs = {
        rel: 'preload',
        as: 'style',
      };
      cssAssets.forEach((cssUrl) => {
        results.push(
          waitForLinkPreload({
            host,
            remoteInfo,
            url: cssUrl,
            attrs: defaultAttrs,
            context: createResourceContext(baseContext, 'css'),
          }),
        );
      });
    } else {
      const defaultAttrs = {
        rel: 'stylesheet',
        type: 'text/css',
      };
      cssAssets.forEach((cssUrl) => {
        results.push(
          waitForLinkPreload({
            host,
            remoteInfo,
            url: cssUrl,
            attrs: defaultAttrs,
            needDeleteLink: false,
            context: createResourceContext(baseContext, 'css'),
          }),
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
      results.push(
        preloadJsAsset({
          host,
          remoteInfo,
          url: jsUrl,
          attrs: defaultAttrs,
          context: createResourceContext(baseContext, 'js'),
        }),
      );
    });
  }

  return Promise.all(results);
}
