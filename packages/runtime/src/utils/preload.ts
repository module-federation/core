import { createLink } from '@module-federation/sdk';
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
import { safeToString } from './tool';
import { FederationHost } from '../core';
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

export function preloadAssets(
  remoteInfo: RemoteInfo,
  host: FederationHost,
  assets: PreloadAssets,
): void {
  const { cssAssets, jsAssetsWithoutEntry, entryAssets } = assets;

  if (host.options.inBrowser) {
    entryAssets.forEach((asset) => {
      const { moduleInfo } = asset;
      const module = host.moduleCache.get(remoteInfo.name);
      if (module) {
        getRemoteEntry({
          remoteInfo: moduleInfo,
          remoteEntryExports: module.remoteEntryExports,
          createScriptHook: (url: string) => {
            const res = host.loaderHook.lifecycle.createScript.emit({
              url,
            });
            if (!res) return;

            if (typeof document === 'undefined') {
              //todo: needs real fix
              return res as HTMLScriptElement;
            }

            if (res instanceof HTMLScriptElement) {
              return res;
            }

            if ('script' in res || 'timeout' in res) {
              return res;
            }

            return;
          },
        });
      } else {
        getRemoteEntry({
          remoteInfo: moduleInfo,
          remoteEntryExports: undefined,
          createScriptHook: (url: string) => {
            const res = host.loaderHook.lifecycle.createScript.emit({
              url,
            });
            if (!res) return;

            if (typeof document === 'undefined') {
              //todo: needs real fix
              return res as HTMLScriptElement;
            }

            if (res instanceof HTMLScriptElement) {
              return res;
            }

            if ('script' in res || 'timeout' in res) {
              return res;
            }

            return;
          },
        });
      }
    });

    const fragment = document.createDocumentFragment();
    cssAssets.forEach((cssUrl) => {
      const { link: cssEl, needAttach } = createLink(
        cssUrl,
        () => {},
        {
          rel: 'preload',
          as: 'style',
        },
        (url: string) => {
          const res = host.loaderHook.lifecycle.createLink.emit({
            url,
          });
          if (res instanceof HTMLLinkElement) {
            return res;
          }
          return;
        },
      );

      needAttach && fragment.appendChild(cssEl);
    });

    jsAssetsWithoutEntry.forEach((jsUrl) => {
      const { link: linkEl, needAttach } = createLink(
        jsUrl,
        () => {
          // noop
        },
        {
          rel: 'preload',
          as: 'script',
        },
        (url: string) => {
          const res = host.loaderHook.lifecycle.createLink.emit({
            url,
          });
          if (res instanceof HTMLLinkElement) {
            return res;
          }
          return;
        },
      );
      needAttach && document.head.appendChild(linkEl);
    });

    document.head.appendChild(fragment);
  }
}
