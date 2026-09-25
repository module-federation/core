import type { FederationKernel } from '../core';
import type { RemoteHandler } from '../remote';
import type { SharedHandler } from '../shared';
import type { SnapshotHandler } from '../plugins/snapshot/SnapshotHandler';
import type { RemoteEntryExports, RemoteInfo } from './config';
import type { ModuleFederationRuntimePlugin } from './plugin';
import type { ResourceLoadContext } from './preload';

export type RemoteHandlerContract = Pick<
  RemoteHandler,
  | 'hooks'
  | 'idToRemoteMap'
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

export type SnapshotHandlerContract = Pick<
  SnapshotHandler,
  'hooks' | 'manifestCache' | 'loadRemoteSnapshotInfo' | 'getGlobalRemoteInfo'
>;

export type ScriptInfo = { attrs?: Record<string, any> };

export type LoadEntryOptions = {
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports;
  loaderHook: FederationKernel['loaderHook'];
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
  create(host: FederationKernel): SharedHandlerContract;
}

export interface RemoteCapability {
  create(host: FederationKernel): {
    remote: RemoteHandlerContract;
    snapshot: SnapshotHandlerContract;
  };
}

export interface SnapshotCapability {
  plugins(): ModuleFederationRuntimePlugin[];
}

// A snapshot needs a remote handler, and a remote handler needs a platform to load entries.
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
