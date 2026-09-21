import type { GlobalModuleInfo, ModuleInfo } from '@module-federation/sdk';
import type { Module, ModuleOptions } from '../module';
import type { ModuleFederation } from '../core';
import type {
  CallFrom,
  Options,
  PreloadAssets,
  PreloadOptions,
  PreloadRemoteArgs,
  PreloadRemoteResult,
  Remote,
  RemoteEntryExports,
  RemoteInfo,
  ResourceLoadContext,
} from '../type';
import {
  AsyncHook,
  AsyncWaterfallHook,
  PluginSystem,
  SyncHook,
  SyncWaterfallHook,
} from '../utils/hooks';

export function createRemoteHandlerHooks() {
  return new PluginSystem({
    beforeRegisterRemote: new SyncWaterfallHook<{
      remote: Remote;
      origin: ModuleFederation;
    }>('beforeRegisterRemote'),
    registerRemote: new SyncWaterfallHook<{
      remote: Remote;
      origin: ModuleFederation;
    }>('registerRemote'),
    beforeRequest: new AsyncWaterfallHook<{
      id: string;
      options: Options;
      origin: ModuleFederation;
    }>('beforeRequest'),
    afterMatchRemote: new AsyncHook<
      [
        {
          id: string;
          options: Options;
          remote?: Remote;
          expose?: string;
          remoteInfo?: RemoteInfo;
          error?: unknown;
          origin: ModuleFederation;
        },
      ],
      void
    >('afterMatchRemote'),
    onLoad: new AsyncHook<
      [
        {
          id: string;
          expose: string;
          pkgNameOrAlias: string;
          remote: Remote;
          options: ModuleOptions;
          origin: ModuleFederation;
          exposeModule: any;
          exposeModuleFactory: any;
          moduleInstance: Module;
        },
      ],
      unknown
    >('onLoad'),
    afterLoadRemote: new AsyncHook<
      [
        {
          id: string;
          expose?: string;
          remote?: RemoteInfo;
          options?: {
            loadFactory?: boolean;
            from?: CallFrom;
          };
          error?: unknown;
          recovered?: boolean;
          origin: ModuleFederation;
        },
      ],
      void
    >('afterLoadRemote'),
    handlePreloadModule: new SyncHook<
      [
        {
          id: string;
          name: string;
          remote: Remote;
          remoteSnapshot: ModuleInfo;
          preloadConfig: PreloadRemoteArgs;
          origin: ModuleFederation;
        },
      ],
      void
    >('handlePreloadModule'),
    errorLoadRemote: new AsyncHook<
      [
        {
          id: string;
          error: unknown;
          options?: any;
          from: CallFrom;
          lifecycle:
            | 'beforeRequest'
            | 'beforeLoadShare'
            | 'afterResolve'
            | 'onLoad';
          remote?: RemoteInfo;
          expose?: string;
          origin: ModuleFederation;
        },
      ],
      void | unknown
    >('errorLoadRemote'),
    beforePreloadRemote: new AsyncHook<
      [
        {
          preloadOps: Array<PreloadRemoteArgs>;
          options: Options;
          origin: ModuleFederation;
        },
      ]
    >('beforePreloadRemote'),
    generatePreloadAssets: new AsyncHook<
      [
        {
          origin: ModuleFederation;
          preloadOptions: PreloadOptions[number];
          remote: Remote;
          remoteInfo: RemoteInfo;
          remoteSnapshot: ModuleInfo;
          globalSnapshot: GlobalModuleInfo;
        },
      ],
      Promise<PreloadAssets>
    >('generatePreloadAssets'),
    afterPreloadRemote: new AsyncHook<
      [
        {
          preloadOps: Array<PreloadRemoteArgs>;
          options: Options;
          origin: ModuleFederation;
          results: PreloadRemoteResult[];
          error?: unknown;
        },
      ]
    >('afterPreloadRemote'),
    loadEntry: new AsyncHook<
      [
        {
          origin: ModuleFederation;
          loaderHook: ModuleFederation['loaderHook'];
          remoteInfo: RemoteInfo;
          remoteEntryExports?: RemoteEntryExports;
          resourceContext?: ResourceLoadContext;
        },
      ],
      Promise<RemoteEntryExports | void> | RemoteEntryExports | void
    >(),
  });
}
