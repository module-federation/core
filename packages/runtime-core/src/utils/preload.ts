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
import { FederationHost } from '../core';
import { getRemoteEntry } from './load';
import { normalizePreloadExposes, formatPreloadArgs } from './tool';

// Shared function for creating and appending LINK elements
function createAndAppendLink(
  url: string,
  attrs: Record<string, string>,
  host: FederationHost,
  needDeleteLink = true,
): void {
  const { link: linkEl, needAttach } = createLink({
    url: url,
    cb: () => {
      // noop
    },
    attrs: attrs,
    createLinkHook: (hookUrl, hookAttrs) => {
      const res = host.loaderHook.lifecycle.createLink.emit({
        url: hookUrl,
        attrs: hookAttrs,
      });
      if (res instanceof HTMLLinkElement) {
        return res;
      }
      return;
    },
    needDeleteLink: needDeleteLink,
  });

  needAttach && document.head.appendChild(linkEl);
}

// Shared function for creating and appending SCRIPT elements
function createAndAppendScript(
  url: string,
  attrs: Record<string, any>,
  host: FederationHost,
  needDeleteScript = true,
): void {
  const { script: scriptEl, needAttach } = createScript({
    url: url,
    cb: () => {
      // noop
    },
    attrs: attrs,
    createScriptHook: (hookUrl: string, hookAttrs: any) => {
      const res = host.loaderHook.lifecycle.createScript.emit({
        url: hookUrl,
        attrs: hookAttrs,
      });
      if (res instanceof HTMLScriptElement) {
        return res;
      }
      return;
    },
    needDeleteScript: needDeleteScript,
  });
  needAttach && document.head.appendChild(scriptEl);
}

export function preloadAssets(
  remoteInfo: RemoteInfo,
  host: FederationHost,
  assets: PreloadAssets,
  // It is used to distinguish preload from load remote parallel loading
  useLinkPreload = true,
): void {
  const { cssAssets, jsAssetsWithoutEntry, entryAssets } = assets;

  if (host.options.inBrowser) {
    entryAssets.forEach((asset) => {
      const { moduleInfo } = asset;
      const module = host.moduleCache.get(remoteInfo.name);
      if (module) {
        getRemoteEntry({
          origin: host,
          remoteInfo: moduleInfo,
          remoteEntryExports: module.remoteEntryExports,
        });
      } else {
        getRemoteEntry({
          origin: host,
          remoteInfo: moduleInfo,
          remoteEntryExports: undefined,
        });
      }
    });

    if (useLinkPreload) {
      const defaultAttrs = {
        rel: 'preload',
        as: 'style',
      };
      cssAssets.forEach((cssUrl) => {
        createAndAppendLink(cssUrl, defaultAttrs, host);
      });
    } else {
      const defaultAttrs = {
        rel: 'stylesheet',
        type: 'text/css',
      };
      cssAssets.forEach((cssUrl) => {
        createAndAppendLink(cssUrl, defaultAttrs, host, false);
      });
    }

    if (useLinkPreload) {
      const defaultAttrs = {
        rel: 'preload',
        as: 'script',
      };
      jsAssetsWithoutEntry.forEach((jsUrl) => {
        createAndAppendLink(jsUrl, defaultAttrs, host);
      });
    } else {
      const defaultAttrs = {
        fetchpriority: 'high',
        type: remoteInfo?.type === 'module' ? 'module' : 'text/javascript',
      };
      jsAssetsWithoutEntry.forEach((jsUrl) => {
        createAndAppendScript(jsUrl, defaultAttrs, host, true);
      });
    }
  }
}
