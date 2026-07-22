import {
  GlobalModuleInfo,
  Manifest,
  ModuleInfo,
  generateSnapshotFromManifest,
  isManifestProvider,
  isBrowserEnvValue,
} from '@module-federation/sdk';
import {
  RUNTIME_003,
  RUNTIME_007,
  RUNTIME_013,
  runtimeDescMap,
} from '@module-federation/error-codes';
import { Options, Remote, ResourceLoadInitiator } from '../../type';
import {
  classifyResourceLoadError,
  emitCachedResourceLoad,
  isRemoteInfoWithEntry,
  error,
  optionsToMFContext,
  getRemoteInfo,
  startResourceLoad,
} from '../../utils';
import {
  getGlobalSnapshot,
  setGlobalSnapshotInfoByModuleInfo,
  Global,
  addGlobalSnapshot,
  getGlobalSnapshotInfoByModuleInfo,
  getInfoWithoutType,
} from '../../global';
import { PluginSystem, AsyncHook, AsyncWaterfallHook } from '../../utils/hooks';
import { ModuleFederation } from '../../core';

export function getGlobalRemoteInfo(
  moduleInfo: Remote,
  origin: ModuleFederation,
): {
  hostGlobalSnapshot: ModuleInfo | undefined;
  globalSnapshot: ReturnType<typeof getGlobalSnapshot>;
  remoteSnapshot: GlobalModuleInfo[string] | undefined;
} {
  const hostGlobalSnapshot = getGlobalSnapshotInfoByModuleInfo({
    name: origin.name,
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
  HostInstance: ModuleFederation;
  manifestCache: Map<string, Manifest> = new Map();
  hooks = new PluginSystem({
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
  });
  loaderHook: ModuleFederation['loaderHook'];
  manifestLoading: Record<string, Promise<ModuleInfo>> =
    Global.__FEDERATION__.__MANIFEST_LOADING__;

  constructor(HostInstance: ModuleFederation) {
    this.HostInstance = HostInstance;
    this.loaderHook = HostInstance.loaderHook;
  }

  // eslint-disable-next-line max-lines-per-function
  async loadRemoteSnapshotInfo({
    moduleInfo,
    id,
    initiator = 'loadRemote',
  }: {
    moduleInfo: Remote;
    id?: string;
    initiator?: ResourceLoadInitiator;
  }):
    | Promise<{
        remoteSnapshot: ModuleInfo;
        globalSnapshot: GlobalModuleInfo;
      }>
    | never {
    const { options } = this.HostInstance;

    await this.hooks.lifecycle.beforeLoadRemoteSnapshot.emit({
      options,
      moduleInfo,
      origin: this.HostInstance,
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
        const remoteEntry = isBrowserEnvValue
          ? globalRemoteSnapshot.remoteEntry
          : globalRemoteSnapshot.ssrRemoteEntry ||
            globalRemoteSnapshot.remoteEntry ||
            '';
        const moduleSnapshot = await this.loadManifestSnapshot(
          remoteEntry,
          moduleInfo,
          {},
          {
            initiator,
            id: id || moduleInfo.name,
          },
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
        const moduleSnapshot = await this.loadManifestSnapshot(
          moduleInfo.entry,
          moduleInfo,
          {},
          {
            initiator,
            id: id || moduleInfo.name,
          },
        );
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const globalSnapshotRes = setGlobalSnapshotInfoByModuleInfo(
          moduleInfo,
          moduleSnapshot,
        );
        mSnapshot = moduleSnapshot;
        gSnapshot = globalSnapshotRes;
      } else {
        error(
          RUNTIME_007,
          runtimeDescMap,
          {
            remoteName: moduleInfo.name,
            remoteVersion: moduleInfo.version,
            hostName: this.HostInstance.options.name,
            globalSnapshot: JSON.stringify(globalSnapshotRes),
          },
          undefined,
          optionsToMFContext(this.HostInstance.options),
        );
      }
    }

    await this.hooks.lifecycle.afterLoadSnapshot.emit({
      id,
      host: this.HostInstance,
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
    resourceOptions?: {
      initiator: ResourceLoadInitiator;
      id: string;
    },
  ): Promise<Manifest> {
    const getManifest = async (): Promise<Manifest> => {
      const remoteInfo = getRemoteInfo(moduleInfo);
      const resourceContext = {
        initiator: resourceOptions?.initiator || ('loadRemote' as const),
        id: resourceOptions?.id || moduleInfo.name,
        url: manifestUrl,
        resourceType: 'manifest' as const,
      };
      let manifestJson: Manifest | undefined =
        this.manifestCache.get(manifestUrl);
      if (manifestJson) {
        await emitCachedResourceLoad(this.HostInstance, {
          context: resourceContext,
          url: manifestUrl,
          remoteInfo,
          cacheSource: 'mf-memory',
        });
        return manifestJson;
      }

      const attempt = await startResourceLoad(this.HostInstance, {
        context: resourceContext,
        url: manifestUrl,
        remoteInfo,
      });
      let responseInfo:
        | {
            httpStatus?: number;
            mimeType?: string;
            redirected?: boolean;
          }
        | undefined;
      let originalError: unknown;
      let recovered = false;
      let httpError: Error | undefined;

      try {
        try {
          let res = await this.loaderHook.lifecycle.fetch.emit(
            manifestUrl,
            {},
            remoteInfo,
            resourceContext,
          );
          if (!res || !(res instanceof Response)) {
            res = await fetch(manifestUrl, {});
          }
          responseInfo = {
            httpStatus: res.status,
            mimeType: res.headers.get('content-type') || undefined,
            redirected: res.redirected,
          };
          if (!res.ok) {
            httpError = new Error(
              `Manifest request failed with HTTP status ${res.status}.`,
            );
          }
          manifestJson = (await res.json()) as Manifest;
        } catch (err) {
          originalError = err;
          manifestJson =
            (await this.HostInstance.remoteHandler.hooks.lifecycle.errorLoadRemote.emit(
              {
                id: manifestUrl,
                error: err,
                from: 'runtime',
                lifecycle: 'afterResolve',
                remote: remoteInfo,
                origin: this.HostInstance,
              },
            )) as Manifest | undefined;

          if (!manifestJson) {
            delete this.manifestLoading[manifestUrl];
            const errorType = classifyResourceLoadError(err, 'network');
            await attempt.finish(
              errorType === 'timeout' ? 'timeout' : 'error',
              {
                ...responseInfo,
                error: err,
                errorType,
              },
            );
            error(
              RUNTIME_003,
              runtimeDescMap,
              {
                manifestUrl,
                moduleName: moduleInfo.name,
                hostName: this.HostInstance.options.name,
              },
              `${err}`,
              optionsToMFContext(this.HostInstance.options),
            );
          }
          recovered = true;
        }

        const missingRequiredFields = [
          !manifestJson.metaData && 'metaData',
          !manifestJson.exposes && 'exposes',
          !manifestJson.shared && 'shared',
        ].filter(Boolean);
        if (missingRequiredFields.length > 0) {
          const contentError = new Error(
            `"${manifestUrl}" is not a valid federation manifest for remote "${moduleInfo.name}". Missing required fields: ${missingRequiredFields.join(', ')}.`,
          );
          await this.HostInstance.remoteHandler.hooks.lifecycle.errorLoadRemote.emit(
            {
              id: manifestUrl,
              error: contentError,
              from: 'runtime',
              lifecycle: 'afterResolve',
              remote: remoteInfo,
              origin: this.HostInstance,
            },
          );
          await attempt.finish('error', {
            ...responseInfo,
            error: contentError,
            errorType: 'content',
          });
        }

        if (missingRequiredFields.length > 0) {
          error(
            RUNTIME_013,
            runtimeDescMap,
            {
              manifestUrl,
              moduleName: moduleInfo.name,
              hostName: this.HostInstance.options.name,
              missingFields: missingRequiredFields.join(','),
            },
            undefined,
            optionsToMFContext(this.HostInstance.options),
          );
        }
        this.manifestCache.set(manifestUrl, manifestJson);
        if (httpError) {
          await attempt.finish('error', {
            ...responseInfo,
            error: httpError,
            errorType: 'http',
          });
        } else {
          await attempt.finish(recovered ? 'recovered' : 'success', {
            ...responseInfo,
            error: recovered ? originalError : undefined,
            errorType: recovered
              ? classifyResourceLoadError(originalError, 'network')
              : undefined,
          });
        }
        return manifestJson;
      } catch (manifestError) {
        delete this.manifestLoading[manifestUrl];
        const errorType = classifyResourceLoadError(manifestError, 'content');
        await attempt.finish(errorType === 'timeout' ? 'timeout' : 'error', {
          ...responseInfo,
          error: manifestError,
          errorType,
        });
        throw manifestError;
      }
    };

    return getManifest();
  }

  private async loadManifestSnapshot(
    manifestUrl: string,
    moduleInfo: Remote,
    extraOptions: Record<string, any>,
    resourceOptions?: {
      initiator: ResourceLoadInitiator;
      id: string;
    },
  ): Promise<ModuleInfo> {
    const asyncLoadProcess = async () => {
      const manifestJson = await this.getManifestJson(
        manifestUrl,
        moduleInfo,
        extraOptions,
        resourceOptions,
      );
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

    const existingLoading = this.manifestLoading[manifestUrl];
    if (existingLoading) {
      const remoteSnapshot = await existingLoading;
      await emitCachedResourceLoad(this.HostInstance, {
        context: {
          initiator: resourceOptions?.initiator || 'loadRemote',
          id: resourceOptions?.id || moduleInfo.name,
          resourceType: 'manifest',
          url: manifestUrl,
        },
        url: manifestUrl,
        remoteInfo: getRemoteInfo(moduleInfo),
        cacheSource: 'mf-memory',
      });
      return remoteSnapshot;
    }

    this.manifestLoading[manifestUrl] = asyncLoadProcess().then((res) => res);
    return this.manifestLoading[manifestUrl];
  }
}
