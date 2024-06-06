import { createLink, createScript } from '@module-federation/sdk';
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
  // It is used to distinguish preload from load remote parallel loading
  useLinkPreload: boolean = true,
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

    if (useLinkPreload) {
      cssAssets.forEach((cssUrl) => {
        const { link: cssEl, needAttach } = createLink({
          url: cssUrl,
          cb: () => {},
          attrs: {
            rel: 'preload',
            as: 'style',
            crossorigin: 'anonymous',
          },
          createLinkHook: (url: string) => {
            const res = host.loaderHook.lifecycle.createLink.emit({
              url,
            });
            if (res instanceof HTMLLinkElement) {
              return res;
            }
            return;
          },
        });

        needAttach && document.head.appendChild(cssEl);
      });
    } else {
      cssAssets.forEach((cssUrl) => {
        const { link: cssEl, needAttach } = createLink({
          url: cssUrl,
          cb: () => {},
          attrs: {
            rel: 'stylesheet',
            type: 'text/css',
          },
          createLinkHook: (url: string) => {
            const res = host.loaderHook.lifecycle.createLink.emit({
              url,
            });
            if (res instanceof HTMLLinkElement) {
              return res;
            }
            return;
          },
          needDeleteLink: false,
        });

        needAttach && document.head.appendChild(cssEl);
      });
    }

    if (useLinkPreload) {
      jsAssetsWithoutEntry.forEach((jsUrl) => {
        const { link: linkEl, needAttach } = createLink({
          url: jsUrl,
          cb: () => {},
          attrs: {
            rel: 'preload',
            as: 'script',
            crossorigin: 'anonymous',
          },
          createLinkHook: (url: string) => {
            const res = host.loaderHook.lifecycle.createLink.emit({
              url,
            });
            if (res instanceof HTMLLinkElement) {
              return res;
            }
            return;
          },
        });
        needAttach && document.head.appendChild(linkEl);
      });
    } else {
      jsAssetsWithoutEntry.forEach((jsUrl) => {
        const { script: scriptEl, needAttach } = createScript({
          url: jsUrl,
          cb: () => {},
          attrs: {
            crossorigin: 'anonymous',
            fetchpriority: 'high',
          },
          createScriptHook: (url: string) => {
            const res = host.loaderHook.lifecycle.createScript.emit({
              url,
            });
            if (res instanceof HTMLScriptElement) {
              return res;
            }
            return;
          },
          needDeleteScript: true,
        });
        needAttach && document.head.appendChild(scriptEl);
      });
    }
  }
}
