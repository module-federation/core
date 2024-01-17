import {
  GlobalModuleInfo,
  Manifest,
  ModuleInfo,
  generateSnapshotFromManifest,
  isManifestProvider,
} from '@module-federation/sdk';
import { Optional, Options, Remote } from '../../type';
import { isRemoteInfoWithEntry, error } from '../../utils';
import {
  getGlobalSnapshot,
  setGlobalSnapshotInfoByModuleInfo,
  Global,
  addGlobalSnapshot,
  getGlobalSnapshotInfoByModuleInfo,
  getInfoWithoutType,
} from '../../global';
import { PluginSystem, AsyncHook, AsyncWaterfallHook } from '../../utils/hooks';
import { FederationHost } from '../../core';
import { assert } from '../../utils/logger';

export class SnapshotHandler {
  loadingHostSnapshot: Promise<GlobalModuleInfo | void> | null = null;
  HostInstance: FederationHost;
  manifestCache: Map<string, Manifest> = new Map();
  hooks = new PluginSystem({
    beforeLoadRemoteSnapshot: new AsyncHook<
      [
        {
          options: Options;
          moduleInfo: Remote;
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
  });
  loaderHook: FederationHost['loaderHook'];
  manifestLoading: Record<string, Promise<ModuleInfo>> =
    Global.__FEDERATION__.__MANIFEST_LOADING__;

  constructor(HostInstance: FederationHost) {
    this.HostInstance = HostInstance;
    this.loaderHook = HostInstance.loaderHook;
  }

  async loadSnapshot(moduleInfo: Remote): Promise<{
    remoteSnapshot: GlobalModuleInfo[string] | undefined;
    globalSnapshot: ReturnType<typeof getGlobalSnapshot>;
  }> {
    const { options } = this.HostInstance;
    const { hostGlobalSnapshot, remoteSnapshot, globalSnapshot } =
      this.getGlobalRemoteInfo(moduleInfo);

    const {
      remoteSnapshot: globalRemoteSnapshot,
      globalSnapshot: globalSnapshotRes,
    } = await this.hooks.lifecycle.loadSnapshot.emit({
      options,
      moduleInfo,
      hostGlobalSnapshot,
      remoteSnapshot,
      globalSnapshot,
    });
    return {
      remoteSnapshot: globalRemoteSnapshot,
      globalSnapshot: globalSnapshotRes,
    };
  }

  // eslint-disable-next-line max-lines-per-function
  async loadRemoteSnapshotInfo(moduleInfo: Remote):
    | Promise<{
        remoteSnapshot: ModuleInfo;
        globalSnapshot: GlobalModuleInfo;
      }>
    | never {
    const { options } = this.HostInstance;

    await this.hooks.lifecycle.beforeLoadRemoteSnapshot.emit({
      options,
      moduleInfo,
    });

    let hostSnapshot = getGlobalSnapshotInfoByModuleInfo({
      name: this.HostInstance.options.name,
      version: this.HostInstance.options.version,
    });

    if (!hostSnapshot) {
      hostSnapshot = {
        version: this.HostInstance.options.version || '',
        remoteEntry: '',
        remotesInfo: {},
      };
      addGlobalSnapshot({
        [this.HostInstance.options.name]: hostSnapshot,
      });
    }

    // In dynamic loadRemote scenarios, incomplete remotesInfo delivery may occur. In such cases, the remotesInfo in the host needs to be completed in the snapshot at runtime.
    // This ensures the snapshot's integrity and helps the chrome plugin correctly identify all producer modules, ensuring that proxyable producer modules will not be missing.
    if (
      hostSnapshot &&
      'remotesInfo' in hostSnapshot &&
      !getInfoWithoutType(hostSnapshot.remotesInfo, moduleInfo.name).value
    ) {
      if ('version' in moduleInfo || 'entry' in moduleInfo) {
        hostSnapshot.remotesInfo = {
          ...hostSnapshot?.remotesInfo,
          [moduleInfo.name]: {
            matchedVersion:
              'version' in moduleInfo ? moduleInfo.version : moduleInfo.entry,
          },
        };
      }
    }

    const { hostGlobalSnapshot, remoteSnapshot, globalSnapshot } =
      this.getGlobalRemoteInfo(moduleInfo);
    const {
      remoteSnapshot: globalRemoteSnapshot,
      globalSnapshot: globalSnapshotRes,
    } = await this.hooks.lifecycle.loadSnapshot.emit({
      options,
      moduleInfo,
      hostGlobalSnapshot,
      remoteSnapshot,
      globalSnapshot,
    });

    // global snapshot includes manifest or module info includes manifest
    if (globalRemoteSnapshot) {
      if (isManifestProvider(globalRemoteSnapshot)) {
        const moduleSnapshot = await this.getManifestJson(
          globalRemoteSnapshot.remoteEntry,
          moduleInfo,
          {},
        );
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const globalSnapshotRes = setGlobalSnapshotInfoByModuleInfo(
          {
            ...moduleInfo,
          },
          moduleSnapshot,
        );
        return {
          remoteSnapshot: moduleSnapshot,
          globalSnapshot: globalSnapshotRes,
        };
      } else {
        const { remoteSnapshot: remoteSnapshotRes } =
          await this.hooks.lifecycle.loadRemoteSnapshot.emit({
            options: this.HostInstance.options,
            moduleInfo,
            remoteSnapshot: globalRemoteSnapshot,
            from: 'global',
          });
        return {
          remoteSnapshot: remoteSnapshotRes,
          globalSnapshot: globalSnapshotRes,
        };
      }
    } else {
      if (isRemoteInfoWithEntry(moduleInfo)) {
        // get from manifest.json and merge remote info from remote server
        const moduleSnapshot = await this.getManifestJson(
          moduleInfo.entry,
          moduleInfo,
          {},
        );
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const globalSnapshotRes = setGlobalSnapshotInfoByModuleInfo(
          moduleInfo,
          moduleSnapshot,
        );
        const { remoteSnapshot: remoteSnapshotRes } =
          await this.hooks.lifecycle.loadRemoteSnapshot.emit({
            options: this.HostInstance.options,
            moduleInfo,
            remoteSnapshot: moduleSnapshot,
            from: 'global',
          });
        return {
          remoteSnapshot: remoteSnapshotRes,
          globalSnapshot: globalSnapshotRes,
        };
      } else {
        error(`
          Cannot get remoteSnapshot with the name: '${
            moduleInfo.name
          }', version: '${
            moduleInfo.version
          }' from __FEDERATION__.moduleInfo. The following reasons may be causing the problem:\n
          1. The Deploy platform did not deliver the correct data. You can use __FEDERATION__.moduleInfo to check the remoteInfo.\n
          2. The remote '${moduleInfo.name}' version '${
            moduleInfo.version
          }' is not released.\n
          The transformed module info: ${JSON.stringify(globalSnapshotRes)}
        `);
      }
    }
  }

  private getGlobalRemoteInfo(moduleInfo: Remote): {
    hostGlobalSnapshot: ModuleInfo | undefined;
    globalSnapshot: ReturnType<typeof getGlobalSnapshot>;
    remoteSnapshot: GlobalModuleInfo[string] | undefined;
  } {
    const hostGlobalSnapshot = getGlobalSnapshotInfoByModuleInfo({
      name: this.HostInstance.options.name,
      version: this.HostInstance.options.version,
    });

    // get remote detail info from global
    const globalRemoteInfo =
      hostGlobalSnapshot &&
      'remotesInfo' in hostGlobalSnapshot &&
      hostGlobalSnapshot.remotesInfo &&
      getInfoWithoutType(hostGlobalSnapshot.remotesInfo, moduleInfo.name).value;

    if (globalRemoteInfo && globalRemoteInfo.matchedVersion) {
      return {
        hostGlobalSnapshot,
        globalSnapshot: getGlobalSnapshot(),
        remoteSnapshot: getGlobalSnapshotInfoByModuleInfo({
          name: moduleInfo.name,
          version: globalRemoteInfo.matchedVersion,
        }),
      };
    }

    return {
      hostGlobalSnapshot: undefined,
      globalSnapshot: getGlobalSnapshot(),
      remoteSnapshot: getGlobalSnapshotInfoByModuleInfo({
        name: moduleInfo.name,
        version: 'version' in moduleInfo ? moduleInfo.version : undefined,
      }),
    };
  }

  private async getManifestJson(
    manifestUrl: string,
    moduleInfo: Remote,
    extraOptions: Record<string, any>,
  ): Promise<ModuleInfo> {
    const getManifest = async (): Promise<Manifest> => {
      let manifestJson: Manifest | undefined =
        this.manifestCache.get(manifestUrl);
      if (manifestJson) {
        return manifestJson;
      }
      try {
        let res = await this.loaderHook.lifecycle.fetch.emit(manifestUrl, {});
        if (!res || !(res instanceof Response)) {
          res = await fetch(manifestUrl, {});
        }
        manifestJson = (await res.json()) as Manifest;
        assert(
          manifestJson.metaData && manifestJson.exposes && manifestJson.shared,
          `${manifestUrl} is not a federation manifest`,
        );
        this.manifestCache.set(manifestUrl, manifestJson);
        return manifestJson;
      } catch (err) {
        error(
          `Failed to get manifestJson for ${moduleInfo.name}. The manifest URL is ${manifestUrl}. Please ensure that the manifestUrl is accessible.
          \n Error message:
          \n ${err}`,
        );
      }
    };

    const asyncLoadProcess = async () => {
      const manifestJson = await getManifest();
      const remoteSnapshot = generateSnapshotFromManifest(manifestJson, {
        version: manifestUrl,
      });

      const { remoteSnapshot: remoteSnapshotRes } =
        await this.hooks.lifecycle.loadRemoteSnapshot.emit({
          options: this.HostInstance.options,
          moduleInfo,
          manifestJson,
          remoteSnapshot,
          manifestUrl,
          from: 'manifest',
        });
      return remoteSnapshotRes;
    };

    if (!this.manifestLoading[manifestUrl]) {
      this.manifestLoading[manifestUrl] = asyncLoadProcess().then((res) => res);
    }
    return this.manifestLoading[manifestUrl];
  }
}
