import {
  rpc,
  getDTSManagerConstructor,
  DTSManager,
  retrieveHostConfig,
  retrieveRemoteConfig,
  retrieveMfTypesPath,
  retrieveTypesZipPath,
  HostOptions,
} from '../core/index';
import { decodeName } from '@module-federation/sdk';
import {
  Remote,
  UpdateCallbackOptions,
  UpdateKind,
  ModuleFederationDevServer,
  createKoaServer,
  fileLog,
  getIPV4,
  DEFAULT_TAR_NAME,
  UpdateMode,
} from '../server';

import { DevWorkerOptions } from './DevWorker';
import { getIpFromEntry } from './utils';

interface Options extends DevWorkerOptions {
  name: string;
}

let typesManager: DTSManager,
  serverAddress: string,
  moduleServer: ModuleFederationDevServer,
  cacheOptions: Options;

function getLocalRemoteNames(
  options?: HostOptions,
  encodeNameIdentifier?: string,
): Remote[] {
  if (!options) {
    return [];
  }
  const { mapRemotesToDownload } = retrieveHostConfig(options);

  return Object.keys(mapRemotesToDownload).reduce<Remote[]>(
    (sum, remoteModuleName) => {
      const remoteInfo = mapRemotesToDownload[remoteModuleName];
      const name = encodeNameIdentifier
        ? decodeName(remoteInfo.name, encodeNameIdentifier)
        : remoteInfo.name;
      const ip = getIpFromEntry(remoteInfo.url, getIPV4());
      if (!ip) {
        return sum;
      }
      sum.push({
        name: name,
        entry: remoteInfo.url,
        ip,
      });
      return sum;
    },
    [],
  );
}

async function updateCallback({
  updateMode,
  name,
  remoteTypeTarPath,
  remoteInfo,
  once,
}: UpdateCallbackOptions): Promise<void> {
  const { disableHotTypesReload, disableLiveReload } = cacheOptions || {};
  fileLog(
    `sync remote module ${name}, types to ${cacheOptions?.name},typesManager.updateTypes run`,
    'forkDevWorker',
    'info',
  );
  if (!disableLiveReload && moduleServer) {
    moduleServer.update({
      updateKind: UpdateKind.RELOAD_PAGE,
      updateMode: UpdateMode.PASSIVE,
    });
  }

  if (!disableHotTypesReload && typesManager) {
    await typesManager.updateTypes({
      updateMode,
      remoteName: name,
      remoteTarPath: remoteTypeTarPath,
      remoteInfo,
      once,
    });
  }
}

export async function forkDevWorker(
  options: Options,
  action?: string,
): Promise<void> {
  if (!typesManager) {
    const { name, remote, host, extraOptions } = options;
    const DTSManagerConstructor = getDTSManagerConstructor(
      remote?.implementation,
    );
    typesManager = new DTSManagerConstructor({
      remote,
      host,
      extraOptions,
    });
    if (!options.disableHotTypesReload && remote) {
      const { remoteOptions, tsConfig } = retrieveRemoteConfig(remote);
      const mfTypesPath = retrieveMfTypesPath(tsConfig, remoteOptions);
      const mfTypesZipPath = retrieveTypesZipPath(mfTypesPath, remoteOptions);

      await Promise.all([
        createKoaServer({
          typeTarPath: mfTypesZipPath,
        }).then((res) => {
          serverAddress = res.serverAddress;
        }),
        typesManager.generateTypes(),
      ]).catch((err) => {
        fileLog(
          `${name} module generateTypes done, localServerAddress:  ${JSON.stringify(
            err,
          )}`,
          'forkDevWorker',
          'error',
        );
      });
      fileLog(
        `${name} module generateTypes done, localServerAddress:  ${serverAddress}`,
        'forkDevWorker',
        'info',
      );
    }

    moduleServer = new ModuleFederationDevServer({
      name: name,
      remotes: getLocalRemoteNames(
        host,
        extraOptions?.['encodeNameIdentifier'],
      ),
      updateCallback,
      remoteTypeTarPath: `${serverAddress}/${DEFAULT_TAR_NAME}`,
    });
    cacheOptions = options;
  }

  if (action === 'update' && cacheOptions) {
    fileLog(
      `remoteModule ${cacheOptions.name} receive devWorker update, start typesManager.updateTypes `,
      'forkDevWorker',
      'info',
    );
    if (!cacheOptions.disableLiveReload) {
      moduleServer?.update({
        updateKind: UpdateKind.RELOAD_PAGE,
        updateMode: UpdateMode.POSITIVE,
      });
    }

    if (!cacheOptions.disableHotTypesReload) {
      typesManager
        ?.updateTypes({
          updateMode: UpdateMode.POSITIVE,
          remoteName: cacheOptions.name,
        })
        .then(() => {
          moduleServer?.update({
            updateKind: UpdateKind.UPDATE_TYPE,
            updateMode: UpdateMode.POSITIVE,
          });
        });
    }
  }
}

process.on('message', (message: rpc.RpcMessage) => {
  fileLog(
    `ChildProcess(${process.pid}), message: ${JSON.stringify(message)} `,
    'forkDevWorker',
    'info',
  );
  if (message.type === rpc.RpcGMCallTypes.EXIT) {
    fileLog(
      `ChildProcess(${process.pid}) SIGTERM, Federation DevServer will exit...`,
      'forkDevWorker',
      'error',
    );
    moduleServer.exit();
    process.exit(0);
  }
});

rpc.exposeRpc(forkDevWorker);
