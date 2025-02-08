import {
  GlobalModuleInfo,
  Manifest,
  ModuleInfo,
  generateSnapshotFromManifest,
  isManifestProvider,
  isBrowserEnv,
} from '@module-federation/sdk';
import {
  getShortErrorMsg,
  RUNTIME_003,
  RUNTIME_007,
  runtimeDescMap,
} from '@module-federation/error-codes';
import { Options, Remote } from '../../type';
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

export function getGlobalRemoteInfo(
  moduleInfo: Remote,
  origin: FederationHost,
): {
  hostGlobalSnapshot: ModuleInfo | undefined;
  globalSnapshot: ReturnType<typeof getGlobalSnapshot>;
  remoteSnapshot: GlobalModuleInfo[string] | undefined;
} {
  const hostGlobalSnapshot = getGlobalSnapshotInfoByModuleInfo({
    name: origin.options.name,
    version: origin.options.version,
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
    afterLoadSnapshot: new AsyncWaterfallHook<{
      options: Options;
      moduleInfo: Remote;
      remoteSnapshot: ModuleInfo;
    }>('afterLoadSnapshot'),
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

    let mSnapshot;
    let gSnapshot;
    // global snapshot includes manifest or module info includes manifest
    if (globalRemoteSnapshot) {
      if (isManifestProvider(globalRemoteSnapshot)) {
        const remoteEntry = isBrowserEnv()
          ? globalRemoteSnapshot.remoteEntry
          : globalRemoteSnapshot.ssrRemoteEntry ||
            globalRemoteSnapshot.remoteEntry ||
            '';
        const moduleSnapshot = await this.getManifestJson(
          remoteEntry,
          moduleInfo,
          {},
        );
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const globalSnapshotRes = setGlobalSnapshotInfoByModuleInfo(
          {
            ...moduleInfo,
            // The global remote may be overridden
            // Therefore, set the snapshot key to the global address of the actual request
            entry: remoteEntry,
          },
          moduleSnapshot,
        );
        mSnapshot = moduleSnapshot;
        gSnapshot = globalSnapshotRes;
      } else {
        const { remoteSnapshot: remoteSnapshotRes } =
          await this.hooks.lifecycle.loadRemoteSnapshot.emit({
            options: this.HostInstance.options,
            moduleInfo,
            remoteSnapshot: globalRemoteSnapshot,
            from: 'global',
          });
        mSnapshot = remoteSnapshotRes;
        gSnapshot = globalSnapshotRes;
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

        mSnapshot = remoteSnapshotRes;
        gSnapshot = globalSnapshotRes;
      } else {
        error(
          getShortErrorMsg(RUNTIME_007, runtimeDescMap, {
            hostName: moduleInfo.name,
            hostVersion: moduleInfo.version,
            globalSnapshot: JSON.stringify(globalSnapshotRes),
          }),
        );
      }
    }

    await this.hooks.lifecycle.afterLoadSnapshot.emit({
      options,
      moduleInfo,
      remoteSnapshot: mSnapshot,
    });

    return {
      remoteSnapshot: mSnapshot,
      globalSnapshot: gSnapshot,
    };
  }

  getGlobalRemoteInfo(moduleInfo: Remote): {
    hostGlobalSnapshot: ModuleInfo | undefined;
    globalSnapshot: ReturnType<typeof getGlobalSnapshot>;
    remoteSnapshot: GlobalModuleInfo[string] | undefined;
  } {
    return getGlobalRemoteInfo(moduleInfo, this.HostInstance);
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
      } catch (err) {
        manifestJson =
          (await this.HostInstance.remoteHandler.hooks.lifecycle.errorLoadRemote.emit(
            {
              id: manifestUrl,
              error,
              from: 'runtime',
              lifecycle: 'afterResolve',
              origin: this.HostInstance,
            },
          )) as Manifest | undefined;

        if (!manifestJson) {
          delete this.manifestLoading[manifestUrl];
          error(
            getShortErrorMsg(
              RUNTIME_003,
              runtimeDescMap,
              {
                manifestUrl,
                moduleName: moduleInfo.name,
              },
              `${err}`,
            ),
          );
        }
      }

      assert(
        manifestJson.metaData && manifestJson.exposes && manifestJson.shared,
        `${manifestUrl} is not a federation manifest`,
      );
      this.manifestCache.set(manifestUrl, manifestJson);
      return manifestJson;
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
