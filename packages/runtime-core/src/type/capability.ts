import type { ModuleFederation } from '../index';
import type { RemoteHandler } from '../remote';
import type { SharedHandler } from '../shared';
import type { SnapshotHandler } from '../plugins/snapshot/SnapshotHandler';
import type { RemoteEntryExports, RemoteInfo } from './config';
import type { ModuleFederationRuntimePlugin } from './plugin';
import type { ResourceLoadContext } from './preload';

export type RemoteHandlerContract = Pick<
  RemoteHandler,
  | 'hooks'
  | 'formatAndRegisterRemote'
  | 'loadRemote'
  | 'preloadRemote'
  | 'registerRemotes'
  | 'initRawContainer'
  | 'getRemoteModuleAndOptions'
>;

export type SharedHandlerContract = Pick<
  SharedHandler,
  | 'hooks'
  | 'shareScopeMap'
  | 'formatShareInfos'
  | 'registerShared'
  | 'loadShare'
  | 'loadShareSync'
  | 'initializeSharing'
  | 'initShareScopeMap'
>;

export type SnapshotHandlerContract = Pick<SnapshotHandler, 'hooks'>;

export type ScriptInfo = { attrs?: Record<string, any> };

export type LoadEntryOptions = {
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports;
  loaderHook: ModuleFederation['loaderHook'];
  getEntryUrl?: (url: string) => string;
  resourceContext?: ResourceLoadContext;
};

export interface Platform {
  isBrowser(): boolean;
  loadScript(url: string, info: ScriptInfo): Promise<void>;
  loadEntry(options: LoadEntryOptions): Promise<RemoteEntryExports | void>;
}

export interface NodePlatform extends Platform {
  loadScriptNode(
    url: string,
    info: ScriptInfo & {
      loaderHook?: {
        createScriptHook?: (
          url: string,
          attrs?: Record<string, any>,
        ) => { url: string } | void;
      };
    },
  ): Promise<void>;
}

export interface SharedCapability {
  create(host: ModuleFederation): SharedHandlerContract;
}

export interface RemoteCapability {
  create(host: ModuleFederation): {
    remote: RemoteHandlerContract;
    snapshot: SnapshotHandlerContract;
  };
}

export interface SnapshotCapability {
  plugins(): ModuleFederationRuntimePlugin[];
}

export type ResolvedCapabilities = {
  shared: SharedCapability;
  remote: RemoteCapability;
  snapshot?: SnapshotCapability;
  platform: Platform;
};

export type Capabilities =
  | {
      shared?: SharedCapability;
      remote?: never;
      snapshot?: never;
      platform?: Platform;
    }
  | {
      shared?: SharedCapability;
      remote: RemoteCapability;
      snapshot?: SnapshotCapability;
      platform: Platform;
    };
