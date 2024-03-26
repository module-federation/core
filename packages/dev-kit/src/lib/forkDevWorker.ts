import {
  getDTSManagerConstructor,
  DTSManager,
  retrieveHostConfig,
  retrieveRemoteConfig,
  retrieveMfTypesPath,
  retrieveTypesZipPath,
  HostOptions,
} from '@module-federation/dts-kit';
import { decodeName } from '@module-federation/sdk';
import {
  Remote,
  UpdateCallbackOptions,
  UpdateKind,
  UpdateMode,
  ModuleFederationDevServer,
  createKoaServer,
  fileLog,
  getIPV4,
  DEFAULT_TAR_NAME,
} from '@module-federation/dev-server';

import { DevWorkerOptions } from './DevWorker';
import { RpcGMCallTypes, RpcMessage } from '../rpc/types';
import { DEFAULT_LOCAL_IPS } from '../constant';
import { exposeRpc } from '../rpc/expose-rpc';

interface Options extends DevWorkerOptions {
  name: string;
}

function getIpFromEntry(entry: string): string | undefined {
  let ip;
  entry.replace(/https?:\/\/([0-9|.]+|localhost):/, (str, matched) => {
    ip = matched;
    return str;
  });
  if (ip) {
    return DEFAULT_LOCAL_IPS.includes(ip) ? getIPV4() : ip;
  }
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

  return Object.keys(mapRemotesToDownload).reduce((sum, remoteModuleName) => {
    const remoteInfo = mapRemotesToDownload[remoteModuleName];
    const name = encodeNameIdentifier
      ? decodeName(remoteInfo.name, encodeNameIdentifier)
      : remoteInfo.name;
    const ip = getIpFromEntry(remoteInfo.url);
    if (!ip) {
      return sum;
    }
    sum.push({
      name: name,
      entry: remoteInfo.url,
      ip,
    });
    return sum;
  }, [] as Remote[]);
}

async function updateCallback(options: UpdateCallbackOptions): Promise<void> {
  const { updateMode, name, remoteTypeTarPath } = options;
  const { disableHotTypesReload, disableLiveReload } = cacheOptions || {};
  fileLog(
    `sync remote module ${name}, types to vmok ${cacheOptions?.name},typesManager.updateTypes run`,
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
      name: options.name,
      remotes: getLocalRemoteNames(host, extraOptions?.encodeNameIdentifier),
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
      moduleServer &&
        moduleServer.update({
          updateKind: UpdateKind.RELOAD_PAGE,
          updateMode: UpdateMode.POSITIVE,
        });
    }

    if (!cacheOptions.disableHotTypesReload) {
      typesManager &&
        typesManager
          .updateTypes({
            updateMode: UpdateMode.POSITIVE,
            remoteName: cacheOptions.name,
          })
          .then(() => {
            moduleServer &&
              moduleServer.update({
                updateKind: UpdateKind.UPDATE_TYPE,
                updateMode: UpdateMode.POSITIVE,
              });
          });
    }
  }
}

process.on('message', (message: RpcMessage) => {
  fileLog(
    `ChildProcess(${process.pid}), message: ${JSON.stringify(message)} `,
    'forkDevWorker',
    'info',
  );
  if (message.type === RpcGMCallTypes.EXIT) {
    fileLog(
      `ChildProcess(${process.pid}) SIGTERM, Federation DevServer will exit...`,
      'forkDevWorker',
      'error',
    );
    moduleServer.exit();
    process.exit(0);
  }
});

exposeRpc(forkDevWorker);
