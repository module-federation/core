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
  createHttpServer,
  fileLog,
  getIPV4,
  DEFAULT_TAR_NAME,
  UpdateMode,
} from '../server';

import { DevWorkerOptions } from './DevWorker';
import { getIpFromEntry } from './utils';
import { handleDevWorkerMessage } from './handleWorkerMessage';
import { BuildConnection } from '../server/BuildConnection';
import { DEV_BUILD_CHANNEL } from '../server/buildProtocol';

interface Options extends DevWorkerOptions {
  name: string;
}

let typesManager: DTSManager,
  serverAddress: string,
  moduleServer: ModuleFederationDevServer,
  cacheOptions: Options;
let buildConnection: BuildConnection | undefined;
let buildSequence = 0;
const buildAcknowledgements = new Map<
  number,
  { resolve(): void; reject(error: Error): void }
>();

function getLocalRemoteNames(
  options?: HostOptions,
  encodeNameIdentifier?: string,
): Remote[] {
  if (!options) {
    return [];
  }
  let hostConfig;
  try {
    hostConfig = retrieveHostConfig(options);
  } catch (e) {
    fileLog(
      `getLocalRemoteNames: retrieveHostConfig failed: ${(e as Error).message}`,
      'forkDevWorker',
      'warn',
    );
    return [];
  }
  const { mapRemotesToDownload } = hostConfig;

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
  if (options?.build) {
    buildConnection = new BuildConnection(options.build, {
      status(remote, status) {
        process.send?.({
          type: DEV_BUILD_CHANNEL,
          kind: 'status',
          remote,
          status,
        });
      },
      update(update) {
        const id = ++buildSequence;
        return new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => {
            buildAcknowledgements.delete(id);
            reject(new Error('Development build acknowledgement timed out'));
          }, 30_000);
          buildAcknowledgements.set(id, {
            resolve() {
              clearTimeout(timer);
              resolve();
            },
            reject(error) {
              clearTimeout(timer);
              reject(error);
            },
          });
          process.send?.({
            type: DEV_BUILD_CHANNEL,
            kind: 'update',
            id,
            update,
          });
        });
      },
    });
    return;
  }
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
        createHttpServer({
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

process.on('message', (message: any) => {
  if (message?.type === DEV_BUILD_CHANNEL) {
    if (message.kind === 'publish')
      buildConnection?.publish(message.publication);
    else if (message.kind === 'invalidate') buildConnection?.invalidate();
    else if (message.kind === 'ack') {
      const pending = buildAcknowledgements.get(message.id);
      buildAcknowledgements.delete(message.id);
      if (message.error) pending?.reject(new Error(message.error));
      else pending?.resolve();
    }
    return;
  }
  if (message.type === rpc.RpcGMCallTypes.EXIT) buildConnection?.close();
  handleDevWorkerMessage(message, { moduleServer, log: fileLog });
});

process.on('disconnect', () => {
  buildConnection?.close();
  process.exit(0);
});

rpc.exposeRpc(forkDevWorker);
