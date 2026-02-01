import { createLink, createScript, safeToString } from '@module-federation/sdk';
import {
  PreloadAssets,
  PreloadConfig,
  PreloadOptions,
  PreloadRemoteArgs,
  Remote,
  RemoteInfo,
  depsPreloadArg,
} from '../type';
import { matchRemote } from './manifest';
import { assert } from './logger';
import { ModuleFederation } from '../core';
import { getRemoteEntry } from './load';

export function defaultPreloadArgs(
  preloadConfig: PreloadRemoteArgs | depsPreloadArg,
): PreloadConfig {
  return {
    resourceCategory: 'sync',
    share: true,
    depsRemote: true,
    prefetchInterface: false,
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

function attachElements(
  type: 'link' | 'script',
  urls: string[],
  host: ModuleFederation,
  attrs: Record<string, string>,
  extraOpts?: { needDeleteLink?: boolean; needDeleteScript?: boolean },
): void {
  urls.forEach((url) => {
    if (type === 'link') {
      const { link, needAttach } = createLink({
        url,
        cb: () => {},
        attrs,
        createLinkHook: (u, a) => {
          const res = host.loaderHook.lifecycle.createLink.emit({
            url: u,
            attrs: a,
          });
          return res instanceof HTMLLinkElement ? res : undefined;
        },
        ...extraOpts,
      });
      needAttach && document.head.appendChild(link);
    } else {
      const { script, needAttach } = createScript({
        url,
        cb: () => {},
        attrs,
        createScriptHook: (u: string, a: any) => {
          const res = host.loaderHook.lifecycle.createScript.emit({
            url: u,
            attrs: a,
          });
          return res instanceof HTMLScriptElement ? res : undefined;
        },
        ...extraOpts,
      });
      needAttach && document.head.appendChild(script);
    }
  });
}

export function preloadAssets(
  remoteInfo: RemoteInfo,
  host: ModuleFederation,
  assets: PreloadAssets,
  useLinkPreload = true,
): void {
  const { cssAssets, jsAssetsWithoutEntry, entryAssets } = assets;

  if (host.options.inBrowser) {
    entryAssets.forEach((asset) => {
      const { moduleInfo } = asset;
      const module = host.moduleCache.get(remoteInfo.name);
      getRemoteEntry({
        origin: host,
        remoteInfo: moduleInfo,
        remoteEntryExports: module ? module.remoteEntryExports : undefined,
      });
    });

    if (useLinkPreload) {
      attachElements('link', cssAssets, host, { rel: 'preload', as: 'style' });
      attachElements('link', jsAssetsWithoutEntry, host, {
        rel: 'preload',
        as: 'script',
      });
    } else {
      attachElements(
        'link',
        cssAssets,
        host,
        { rel: 'stylesheet', type: 'text/css' },
        { needDeleteLink: false },
      );
      attachElements(
        'script',
        jsAssetsWithoutEntry,
        host,
        {
          fetchpriority: 'high',
          type: remoteInfo?.type === 'module' ? 'module' : 'text/javascript',
        },
        { needDeleteScript: true },
      );
    }
  }
}
