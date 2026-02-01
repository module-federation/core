import {
  GlobalModuleInfo,
  Manifest,
  ModuleInfo,
  generateSnapshotFromManifest,
  isManifestProvider,
  isBrowserEnv,
} from '@module-federation/sdk';
import { RUNTIME_003, RUNTIME_007 } from '@module-federation/error-codes';
import { Options, Remote } from '../../type';
import {
  isRemoteInfoWithEntry,
  error,
  singleFlight,
  runtimeError,
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
import { assert } from '../../utils/logger';
import { Effect } from '@module-federation/micro-effect';

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

// --- Effect programs ---

const getManifestJsonEffect = (
  handler: SnapshotHandler,
  manifestUrl: string,
  moduleInfo: Remote,
): Effect.Effect<ModuleInfo> =>
  Effect.gen(function* () {
    const getManifest = async (): Promise<Manifest> => {
      let manifestJson: Manifest | undefined =
        handler.manifestCache.get(manifestUrl);
      if (manifestJson) {
        return manifestJson;
      }
      try {
        let res = await handler.loaderHook.lifecycle.fetch.emit(
          manifestUrl,
          {},
        );
        if (!res || !(res instanceof Response)) {
          res = await fetch(manifestUrl, {});
        }
        manifestJson = (await res.json()) as Manifest;
      } catch (err) {
        manifestJson =
          (await handler.HostInstance.remoteHandler.hooks.lifecycle.errorLoadRemote.emit(
            {
              id: manifestUrl,
              error: err,
              from: 'runtime',
              lifecycle: 'afterResolve',
              origin: handler.HostInstance,
            },
          )) as Manifest | undefined;

        if (!manifestJson) {
          delete handler.manifestLoading[manifestUrl];
          error(
            runtimeError(
              RUNTIME_003,
              {
                manifestUrl,
                moduleName: moduleInfo.name,
                hostName: handler.HostInstance.options.name,
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
      handler.manifestCache.set(manifestUrl, manifestJson);
      return manifestJson;
    };

    const asyncLoadProcess = async () => {
      const manifestJson = await getManifest();
      const remoteSnapshot = generateSnapshotFromManifest(manifestJson, {
        version: manifestUrl,
      });

      const { remoteSnapshot: remoteSnapshotRes } =
        await handler.hooks.lifecycle.loadRemoteSnapshot.emit({
          options: handler.HostInstance.options,
          moduleInfo,
          manifestJson,
          remoteSnapshot,
          manifestUrl,
          from: 'manifest',
        });
      return remoteSnapshotRes;
    };

    return yield* Effect.promise(() =>
      singleFlight(handler.manifestLoading, manifestUrl, asyncLoadProcess, {
        clearOnReject: true,
      }),
    );
  });

// eslint-disable-next-line max-lines-per-function
const loadRemoteSnapshotInfoEffect = (
  handler: SnapshotHandler,
  params: {
    moduleInfo: Remote;
    id?: string;
    expose?: string;
  },
): Effect.Effect<{
  remoteSnapshot: ModuleInfo;
  globalSnapshot: GlobalModuleInfo;
}> =>
  Effect.gen(function* () {
    const { moduleInfo, id } = params;
    const { options } = handler.HostInstance;

    yield* Effect.promise(() =>
      handler.hooks.lifecycle.beforeLoadRemoteSnapshot.emit({
        options,
        moduleInfo,
      }),
    );

    let hostSnapshot = getGlobalSnapshotInfoByModuleInfo({
      name: handler.HostInstance.options.name,
      version: handler.HostInstance.options.version,
    });

    if (!hostSnapshot) {
      hostSnapshot = {
        version: handler.HostInstance.options.version || '',
        remoteEntry: '',
        remotesInfo: {},
      };
      addGlobalSnapshot({
        [handler.HostInstance.options.name]: hostSnapshot,
      });
    }

    // In dynamic loadRemote scenarios, incomplete remotesInfo delivery may occur.
    // Therefore, we need to fill in the remotesInfo here.
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
      handler.getGlobalRemoteInfo(moduleInfo);
    const {
      remoteSnapshot: globalRemoteSnapshot,
      globalSnapshot: globalSnapshotRes,
    } = yield* Effect.promise(() =>
      handler.hooks.lifecycle.loadSnapshot.emit({
        options,
        moduleInfo,
        hostGlobalSnapshot,
        remoteSnapshot,
        globalSnapshot,
      }),
    );

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
        // get from manifest.json and merge remote info from remote server
        const moduleSnapshot = yield* getManifestJsonEffect(
          handler,
          remoteEntry,
          moduleInfo,
        );
        // The global remote may be overridden
        // Therefore, set the snapshot key to the global address of the actual request
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const globalSnapshotRes = setGlobalSnapshotInfoByModuleInfo(
          {
            ...moduleInfo,
            entry: remoteEntry,
          },
          moduleSnapshot,
        );
        mSnapshot = moduleSnapshot;
        gSnapshot = globalSnapshotRes;
      } else {
        const { remoteSnapshot: remoteSnapshotRes } = yield* Effect.promise(
          () =>
            handler.hooks.lifecycle.loadRemoteSnapshot.emit({
              options: handler.HostInstance.options,
              moduleInfo,
              remoteSnapshot: globalRemoteSnapshot,
              from: 'global',
            }),
        );
        mSnapshot = remoteSnapshotRes;
        gSnapshot = globalSnapshotRes;
      }
    } else {
      if (isRemoteInfoWithEntry(moduleInfo)) {
        const moduleSnapshot = yield* getManifestJsonEffect(
          handler,
          moduleInfo.entry,
          moduleInfo,
        );
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const globalSnapshotRes = setGlobalSnapshotInfoByModuleInfo(
          moduleInfo,
          moduleSnapshot,
        );
        const { remoteSnapshot: remoteSnapshotRes } = yield* Effect.promise(
          () =>
            handler.hooks.lifecycle.loadRemoteSnapshot.emit({
              options: handler.HostInstance.options,
              moduleInfo,
              remoteSnapshot: moduleSnapshot,
              from: 'global',
            }),
        );

        mSnapshot = remoteSnapshotRes;
        gSnapshot = globalSnapshotRes;
      } else {
        error(
          runtimeError(RUNTIME_007, {
            hostName: moduleInfo.name,
            hostVersion: moduleInfo.version,
            globalSnapshot: JSON.stringify(globalSnapshotRes),
          }),
        );
      }
    }

    yield* Effect.promise(() =>
      handler.hooks.lifecycle.afterLoadSnapshot.emit({
        id,
        host: handler.HostInstance,
        options,
        moduleInfo,
        remoteSnapshot: mSnapshot,
      }),
    );

    return {
      remoteSnapshot: mSnapshot,
      globalSnapshot: gSnapshot,
    };
  });

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
    expose,
  }: {
    moduleInfo: Remote;
    id?: string;
    expose?: string;
  }):
    | Promise<{
        remoteSnapshot: ModuleInfo;
        globalSnapshot: GlobalModuleInfo;
      }>
    | never {
    return Effect.runPromise(
      loadRemoteSnapshotInfoEffect(this, { moduleInfo, id, expose }),
    );
  }

  getGlobalRemoteInfo(moduleInfo: Remote): {
    hostGlobalSnapshot: ModuleInfo | undefined;
    globalSnapshot: ReturnType<typeof getGlobalSnapshot>;
    remoteSnapshot: GlobalModuleInfo[string] | undefined;
  } {
    return getGlobalRemoteInfo(moduleInfo, this.HostInstance);
  }
}
