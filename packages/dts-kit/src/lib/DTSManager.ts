import ansiColors from 'ansi-colors';
import path from 'path';
import { rm } from 'fs/promises';
import fs from 'fs';
import { UpdateMode, fileLog } from '@module-federation/dev-server';
import { MANIFEST_EXT, Manifest } from '@module-federation/sdk';

import { retrieveRemoteConfig } from '../configurations/remotePlugin';
import { createTypesArchive, downloadTypesArchive } from './archiveHandler';
import {
  compileTs,
  retrieveMfAPITypesPath,
  retrieveMfTypesPath,
} from './typeScriptCompiler';
import { retrieveHostConfig } from '../configurations/hostPlugin';
import { DTSManagerOptions } from '../interfaces/DTSManagerOptions';
import { HostOptions, RemoteInfo } from '../interfaces/HostOptions';
import {
  REMOTE_API_TYPES_FILE_NAME,
  REMOTE_ALIAS_IDENTIFIER,
  HOST_API_TYPES_FILE_NAME,
} from '../constant';
import axios from 'axios';

export const MODULE_DTS_MANAGER_IDENTIFIER = 'MF DTS Manager';

interface UpdateTypesOptions {
  updateMode: UpdateMode;
  remoteName?: string;
  remoteTarPath?: string;
}

class DTSManager {
  options: DTSManagerOptions;
  runtimePkgs: string[];
  remoteAliasMap: Record<string, Required<RemoteInfo>>;
  loadedRemoteAPIAlias: string[];

  constructor(options: DTSManagerOptions) {
    this.options = {
      host: options.host ? { ...options.host } : undefined,
      remote: options.remote ? { ...options.remote } : undefined,
    };
    this.runtimePkgs = [
      '@module-federation/runtime',
      '@module-federation/runtime-tools',
    ];
    this.loadedRemoteAPIAlias = [];
    this.remoteAliasMap = {};
  }

  generateAPITypes(mapComponentsToExpose: Record<string, string>) {
    const exposePaths: Set<string> = new Set();
    const packageType = Object.keys(mapComponentsToExpose).reduce(
      (sum: string, exposeKey: string) => {
        const exposePath = path.join(REMOTE_ALIAS_IDENTIFIER, exposeKey);
        exposePaths.add(`'${exposePath}'`);
        const curType = `T extends '${exposePath}' ? typeof import('${exposePath}') :`;
        sum = curType + sum;
        return sum;
      },
      'any;',
    );
    const exposePathKeys = [...exposePaths].join(' | ');

    return `
    export type RemoteKeys = ${exposePathKeys};
    type PackageType<T> = ${packageType}`;
  }

  async generateTypes() {
    try {
      const { options } = this;
      if (!options.remote) {
        throw new Error(
          'options.remote is required if you want to generateTypes',
        );
      }

      const { remoteOptions, tsConfig, mapComponentsToExpose } =
        retrieveRemoteConfig(options.remote);
      if (!Object.keys(mapComponentsToExpose).length) {
        return;
      }

      let hasRemotes = false;
      const remotes = remoteOptions.moduleFederationConfig.remotes;
      if (remotes) {
        if (Array.isArray(remotes)) {
          hasRemotes = Boolean(remotes.length);
        } else if (typeof remotes === 'object') {
          hasRemotes = Boolean(Object.keys(remotes).length);
        }
      }

      const mfTypesPath = retrieveMfTypesPath(tsConfig, remoteOptions);

      fileLog(
        `hostName: ${
          remoteOptions.moduleFederationConfig.name
        } generateTypes run,
      mapComponentsToExpose: ${JSON.stringify(mapComponentsToExpose)}
      remoteOptions: ${JSON.stringify(remoteOptions)}
      tsConfig: ${JSON.stringify(tsConfig)}
      `,
        MODULE_DTS_MANAGER_IDENTIFIER,
        'info',
      );
      if (hasRemotes) {
        const tempHostOptions = {
          moduleFederationConfig: remoteOptions.moduleFederationConfig,
          typesFolder: path.join(mfTypesPath, 'node_modules'),
          remoteTypesFolder:
            remoteOptions?.hostRemoteTypesFolder || remoteOptions.typesFolder,
          deleteTypesFolder: true,
          context: remoteOptions.context,
          implementation: remoteOptions.implementation,
          abortOnError: false,
        };
        await this.consumeArchiveTypes(tempHostOptions);
      }

      compileTs(mapComponentsToExpose, tsConfig, remoteOptions);

      await createTypesArchive(tsConfig, remoteOptions);

      let apiTypesPath = '';
      if (remoteOptions.generateAPITypes) {
        const apiTypes = this.generateAPITypes(mapComponentsToExpose);
        apiTypesPath = retrieveMfAPITypesPath(tsConfig, remoteOptions);
        fs.writeFileSync(apiTypesPath, apiTypes);
      }

      if (remoteOptions.deleteTypesFolder) {
        await rm(retrieveMfTypesPath(tsConfig, remoteOptions), {
          recursive: true,
          force: true,
        });
      }
      console.log(ansiColors.green('Federated types created correctly'));
    } catch (error) {
      if (this.options.remote?.abortOnError === false) {
        console.error(
          ansiColors.red(`Unable to compile federated types, ${error}`),
        );
      } else {
        throw error;
      }
    }
  }

  async requestRemoteManifest(
    remoteInfo: RemoteInfo,
  ): Promise<Required<RemoteInfo>> {
    try {
      if (!remoteInfo.url.includes(MANIFEST_EXT)) {
        return remoteInfo as Required<RemoteInfo>;
      }
      const res = await axios({
        method: 'get',
        url: remoteInfo.url,
      });
      const manifestJson = res.data as unknown as Manifest;
      if (!manifestJson.metaData.types.zip) {
        throw new Error(`Can not get ${remoteInfo.name}'s types archive url!`);
      }
      const addProtocol = (u: string): string => {
        if (u.startsWith('//')) {
          return `https:${u}`;
        }
        return u;
      };
      const publicPath =
        'publicPath' in manifestJson.metaData
          ? manifestJson.metaData.publicPath
          : new Function(manifestJson.metaData.getPublicPath)();

      remoteInfo.zipUrl = new URL(
        path.join(addProtocol(publicPath), manifestJson.metaData.types.zip),
      ).href;
      if (!manifestJson.metaData.types.api) {
        console.warn(`Can not get ${remoteInfo.name}'s api types url!`);
        remoteInfo.apiTypeUrl = '';
        return remoteInfo as Required<RemoteInfo>;
      }
      remoteInfo.apiTypeUrl = new URL(
        path.join(addProtocol(publicPath), manifestJson.metaData.types.api),
      ).href;
      return remoteInfo as Required<RemoteInfo>;
    } catch (_err) {
      return remoteInfo as Required<RemoteInfo>;
    }
  }

  async consumeTargetRemotes(
    hostOptions: Required<HostOptions>,
    remoteInfo: Required<RemoteInfo>,
  ) {
    if (!remoteInfo.zipUrl) {
      throw new Error(`Can not get ${remoteInfo.name}'s types archive url!`);
    }
    const typesDownloader = downloadTypesArchive(hostOptions);
    return typesDownloader([remoteInfo.alias, remoteInfo.zipUrl]);
  }

  async downloadAPITypes(
    remoteInfo: Required<RemoteInfo>,
    destinationPath: string,
  ) {
    const { apiTypeUrl } = remoteInfo;
    if (!apiTypeUrl) {
      return;
    }
    try {
      const res = await axios({
        method: 'get',
        url: apiTypeUrl,
      });
      let apiTypeFile = res.data as string;
      apiTypeFile = apiTypeFile.replaceAll(
        REMOTE_ALIAS_IDENTIFIER,
        remoteInfo.alias,
      );
      const filePath = path.join(destinationPath, REMOTE_API_TYPES_FILE_NAME);
      fs.writeFileSync(filePath, apiTypeFile);
      this.loadedRemoteAPIAlias.push(remoteInfo.alias);
    } catch (err) {
      console.error(
        ansiColors.red(
          `Unable to download "${remoteInfo.name}" api types, ${err}`,
        ),
      );
    }
  }

  consumeAPITypes(hostOptions: Required<HostOptions>) {
    if (!this.loadedRemoteAPIAlias.length) {
      return;
    }
    const packageTypes: string[] = [];
    const remoteKeys: string[] = [];

    const importTypeStr = this.loadedRemoteAPIAlias
      .map((alias, index) => {
        const remoteKey = `RemoteKeys_${index}`;
        const packageType = `PackageType_${index}`;
        packageTypes.push(`T extends ${remoteKey} ? ${packageType}<T>`);
        remoteKeys.push(remoteKey);
        return `import type { PackageType as ${packageType},RemoteKeys as ${remoteKey} } from './${alias}/apis.d.ts';`;
      })
      .join('\n');
    const remoteKeysStr = `type RemoteKeys = ${remoteKeys.join(' | ')};`;
    const packageTypesStr = `type PackageType<T, Y=any> = ${[
      ...packageTypes,
      'Y',
    ].join(' :\n')} ;`;

    const pkgsDeclareStr = this.runtimePkgs
      .map((pkg) => {
        return `declare module "${pkg}" {
      ${remoteKeysStr}
      ${packageTypesStr}
      export function loadRemote<T extends RemoteKeys,Y>(packageName: T): Promise<PackageType<T, Y>>;
      export function loadRemote<T extends string,Y>(packageName: T): Promise<PackageType<T, Y>>;
    }`;
      })
      .join('\n');

    const fileStr = `${importTypeStr}
    ${pkgsDeclareStr}
    `;

    fs.writeFileSync(
      path.join(
        hostOptions.context,
        hostOptions.typesFolder,
        HOST_API_TYPES_FILE_NAME,
      ),
      fileStr,
    );
  }

  async consumeArchiveTypes(options: HostOptions) {
    const { hostOptions, mapRemotesToDownload } = retrieveHostConfig(options);
    if (hostOptions.deleteTypesFolder) {
      await rm(hostOptions.typesFolder, {
        recursive: true,
        force: true,
      }).catch((error) =>
        console.error(
          ansiColors.red(`Unable to remove types folder, ${error}`),
        ),
      );
    }

    const downloadPromises = Object.entries(mapRemotesToDownload).map(
      async (item) => {
        const remoteInfo = item[1];
        if (!this.remoteAliasMap[remoteInfo.alias]) {
          const requiredRemoteInfo =
            await this.requestRemoteManifest(remoteInfo);
          this.remoteAliasMap[remoteInfo.alias] = requiredRemoteInfo;
        }

        return this.consumeTargetRemotes(
          hostOptions,
          this.remoteAliasMap[remoteInfo.alias],
        );
      },
    );

    const downloadPromisesResult = await Promise.allSettled(downloadPromises);
    return {
      hostOptions,
      downloadPromisesResult,
    };
  }

  async consumeTypes() {
    try {
      const { options } = this;
      if (!options.host) {
        throw new Error('options.host is required if you want to consumeTypes');
      }
      const { mapRemotesToDownload } = retrieveHostConfig(options.host);
      if (!Object.keys(mapRemotesToDownload).length) {
        return;
      }
      const { downloadPromisesResult, hostOptions } =
        await this.consumeArchiveTypes(options.host);

      // download apiTypes
      await Promise.all(
        downloadPromisesResult.map(async (item) => {
          if (item.status === 'rejected' || !item.value) {
            return;
          }
          const [alias, destinationPath] = item.value;
          const remoteInfo = this.remoteAliasMap[alias];
          if (!remoteInfo) {
            return;
          }
          await this.downloadAPITypes(remoteInfo, destinationPath);
        }),
      );
      this.consumeAPITypes(hostOptions);

      console.log(ansiColors.green('Federated types extraction completed'));
    } catch (err) {
      if (this.options.host?.abortOnError === false) {
        console.error(
          ansiColors.red(`Unable to consume federated types, ${err}`),
        );
      } else {
        throw err;
      }
    }
  }

  async updateTypes(options: UpdateTypesOptions): Promise<void> {
    // can use remoteTarPath directly in the future
    const { remoteName, remoteTarPath, updateMode } = options;
    const hostName = this.options?.host?.moduleFederationConfig?.name;
    fileLog(
      // eslint-disable-next-line max-len
      `updateTypes run, remoteName: ${remoteName}, hostName: ${hostName}, remoteTarPath: ${remoteTarPath}, updateMode: ${updateMode} `,
      MODULE_DTS_MANAGER_IDENTIFIER,
      'info',
    );
    if (updateMode === UpdateMode.POSITIVE && remoteName === hostName) {
      this.generateTypes();
    } else {
      const { options, remoteAliasMap } = this;
      fileLog(
        // eslint-disable-next-line max-len
        `updateTypes run,update remote types, options.host: ${JSON.stringify(
          options.host,
        )}, remoteAliasMap: ${JSON.stringify(remoteAliasMap)}`,
        MODULE_DTS_MANAGER_IDENTIFIER,
        'info',
      );
      if (!options.host) {
        throw new Error('options.host is required if you want to consumeTypes');
      }
      const { hostOptions, mapRemotesToDownload } = retrieveHostConfig(
        options.host,
      );

      const loadedRemoteInfo = Object.values(remoteAliasMap).find(
        (i) => i.name === remoteName,
      );

      if (!loadedRemoteInfo) {
        const remoteInfo = Object.values(mapRemotesToDownload).find((item) => {
          return item.name === remoteName;
        });
        if (remoteInfo) {
          if (!this.remoteAliasMap[remoteInfo.alias]) {
            const requiredRemoteInfo =
              await this.requestRemoteManifest(remoteInfo);
            this.remoteAliasMap[remoteInfo.alias] = requiredRemoteInfo;
          }
          await this.consumeTargetRemotes(
            hostOptions,
            this.remoteAliasMap[remoteInfo.alias],
          );
        }
      } else {
        await this.consumeTargetRemotes(hostOptions, loadedRemoteInfo);
      }
    }
  }
}

export { DTSManager };
