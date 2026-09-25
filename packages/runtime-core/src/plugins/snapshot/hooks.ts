import type {
  GlobalModuleInfo,
  Manifest,
  ModuleInfo,
} from '@module-federation/sdk/core';
import type { Options, Remote, ResourceLoadInitiator } from '../../type';
import type { getGlobalSnapshot } from '../../global';
import type { ModuleFederation } from '../../core';
import { PluginSystem, AsyncHook, AsyncWaterfallHook } from '../../utils/hooks';

export const createSnapshotHooks = () =>
  new PluginSystem({
    beforeLoadRemoteSnapshot: new AsyncHook<
      [
        {
          options: Options;
          moduleInfo: Remote;
          origin: ModuleFederation;
        },
      ],
      void
    >('beforeLoadRemoteSnapshot'),
    loadSnapshot: new AsyncWaterfallHook<{
      options: Options;
      moduleInfo: Remote;
      hostGlobalSnapshot: GlobalModuleInfo[string] | undefined;
      globalSnapshot: ReturnType<typeof getGlobalSnapshot>;
      remoteSnapshot?: GlobalModuleInfo[string] | undefined;
    }>('loadGlobalSnapshot'),
    loadRemoteSnapshot: new AsyncWaterfallHook<{
      options: Options;
      moduleInfo: Remote;
      manifestJson?: Manifest;
      manifestUrl?: string;
      remoteSnapshot: ModuleInfo;
      from: 'global' | 'manifest';
    }>('loadRemoteSnapshot'),
    afterLoadSnapshot: new AsyncWaterfallHook<{
      id?: string;
      host: ModuleFederation;
      options: Options;
      moduleInfo: Remote;
      remoteSnapshot: ModuleInfo;
    }>('afterLoadSnapshot'),
    beforeLoadManifest: new AsyncHook<
      [
        {
          manifestUrl: string;
          moduleInfo: Remote;
          resourceOptions?: {
            initiator: ResourceLoadInitiator;
            id: string;
          };
          origin: ModuleFederation;
        },
      ],
      void
    >('beforeLoadManifest'),
    afterLoadManifest: new AsyncHook<
      [
        {
          manifestUrl: string;
          moduleInfo: Remote;
          resourceOptions?: {
            initiator: ResourceLoadInitiator;
            id: string;
          };
          manifestJson?: Manifest;
          response?: Response;
          error?: unknown;
          cached?: boolean;
          recovered?: boolean;
          origin: ModuleFederation;
        },
      ],
      void
    >('afterLoadManifest'),
  });

export type SnapshotHooks = ReturnType<typeof createSnapshotHooks>;
