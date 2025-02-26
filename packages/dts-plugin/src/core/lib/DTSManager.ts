import path from 'path';
import { rm } from 'fs/promises';
import fs from 'fs';
import fse from 'fs-extra';
import {
  MANIFEST_EXT,
  Manifest,
  inferAutoPublicPath,
} from '@module-federation/sdk';
import { ThirdPartyExtractor } from '@module-federation/third-party-dts-extractor';

import { retrieveRemoteConfig } from '../configurations/remotePlugin';
import { createTypesArchive, downloadTypesArchive } from './archiveHandler';
import {
  compileTs,
  retrieveMfAPITypesPath,
  retrieveMfTypesPath,
} from './typeScriptCompiler';
import {
  retrieveHostConfig,
  retrieveRemoteInfo,
} from '../configurations/hostPlugin';
import { DTSManagerOptions } from '../interfaces/DTSManagerOptions';
import { HostOptions, RemoteInfo } from '../interfaces/HostOptions';
import {
  REMOTE_API_TYPES_FILE_NAME,
  REMOTE_ALIAS_IDENTIFIER,
  HOST_API_TYPES_FILE_NAME,
} from '../constant';
import { fileLog, logger } from '../../server';
import { axiosGet, cloneDeepOptions, isDebugMode } from './utils';
import { UpdateMode } from '../../server/constant';

export const MODULE_DTS_MANAGER_IDENTIFIER = 'MF DTS Manager';

interface UpdateTypesOptions {
  updateMode: UpdateMode;
  remoteName?: string;
  remoteTarPath?: string;
  remoteInfo?: RemoteInfo;
  once?: boolean;
}

class DTSManager {
  options: DTSManagerOptions;
  runtimePkgs: string[];
  remoteAliasMap: Record<string, Required<RemoteInfo>>;
  loadedRemoteAPIAlias: Set<string>;
  extraOptions: Record<string, any>;
  updatedRemoteInfos: Record<string, Required<RemoteInfo>>;

  constructor(options: DTSManagerOptions) {
    this.options = cloneDeepOptions(options);
    this.runtimePkgs = [
      '@module-federation/runtime',
      '@module-federation/enhanced/runtime',
      '@module-federation/runtime-tools',
    ];
    this.loadedRemoteAPIAlias = new Set();
    this.remoteAliasMap = {};
    this.extraOptions = options?.extraOptions || {};
    this.updatedRemoteInfos = {};
  }

  generateAPITypes(mapComponentsToExpose: Record<string, string>) {
    const exposePaths: Set<string> = new Set();
    const packageType = Object.keys(mapComponentsToExpose).reduce(
      (sum: string, exposeKey: string) => {
        const exposePath = path
          .join(REMOTE_ALIAS_IDENTIFIER, exposeKey)
          .split(path.sep) // Windows platform-specific file system path fix
          .join('/');
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

  async extractRemoteTypes(options: ReturnType<typeof retrieveRemoteConfig>) {
    const { remoteOptions, tsConfig } = options;

    if (!remoteOptions.extractRemoteTypes) {
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

    if (hasRemotes && this.options.host) {
      try {
        const { hostOptions } = retrieveHostConfig(this.options.host);
        const remoteTypesFolder = path.resolve(
          hostOptions.context,
          hostOptions.typesFolder,
        );

        const targetDir = path.join(mfTypesPath, 'node_modules');
        if (fs.existsSync(remoteTypesFolder)) {
          const targetFolder = path.resolve(remoteOptions.context, targetDir);
          await fse.ensureDir(targetFolder);
          await fse.copy(remoteTypesFolder, targetFolder, { overwrite: true });
        }
      } catch (err) {
        if (this.options.host?.abortOnError === false) {
          fileLog(
            `Unable to copy remote types, ${err}`,
            'extractRemoteTypes',
            'error',
          );
        } else {
          throw err;
        }
      }
    }
  }

  // it must execute after consumeTypes
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

      if (tsConfig.compilerOptions.tsBuildInfoFile) {
        try {
          const tsBuildInfoFile = path.resolve(
            remoteOptions.context,
            tsConfig.compilerOptions.tsBuildInfoFile,
          );
          const mfTypesPath = retrieveMfTypesPath(tsConfig, remoteOptions);
          if (!fs.existsSync(mfTypesPath)) {
            fs.rmSync(tsBuildInfoFile, { force: true });
          }
        } catch (e) {
          //noop
        }
      }

      await this.extractRemoteTypes({
        remoteOptions,
        tsConfig,
        mapComponentsToExpose,
      });

      await compileTs(mapComponentsToExpose, tsConfig, remoteOptions);

      await createTypesArchive(tsConfig, remoteOptions);

      let apiTypesPath = '';
      if (remoteOptions.generateAPITypes) {
        const apiTypes = this.generateAPITypes(mapComponentsToExpose);
        apiTypesPath = retrieveMfAPITypesPath(tsConfig, remoteOptions);
        fs.writeFileSync(apiTypesPath, apiTypes);
      }
      try {
        if (remoteOptions.deleteTypesFolder) {
          await rm(retrieveMfTypesPath(tsConfig, remoteOptions), {
            recursive: true,
            force: true,
          });
        }
      } catch (err) {
        if (isDebugMode()) {
          console.error(err);
        }
      }
      logger.success('Federated types created correctly');
    } catch (error) {
      if (this.options.remote?.abortOnError === false) {
        if (this.options.displayErrorInTerminal) {
          logger.error(`Unable to compile federated types ${error}`);
        }
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
      if (remoteInfo.zipUrl) {
        return remoteInfo as Required<RemoteInfo>;
      }
      const url = remoteInfo.url;
      const res = await axiosGet(url);
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

      let publicPath;

      if ('publicPath' in manifestJson.metaData) {
        publicPath = manifestJson.metaData.publicPath;
      } else {
        const getPublicPath = new Function(manifestJson.metaData.getPublicPath);

        if (manifestJson.metaData.getPublicPath.startsWith('function')) {
          publicPath = getPublicPath()();
        } else {
          publicPath = getPublicPath();
        }
      }

      if (publicPath === 'auto') {
        publicPath = inferAutoPublicPath(remoteInfo.url);
      }

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
      fileLog(
        `fetch manifest failed, ${_err}, ${remoteInfo.name} will be ignored`,
        'requestRemoteManifest',
        'error',
      );
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
      const url = apiTypeUrl;
      const res = await axiosGet(url);
      let apiTypeFile = res.data as string;
      apiTypeFile = apiTypeFile.replaceAll(
        REMOTE_ALIAS_IDENTIFIER,
        remoteInfo.alias,
      );
      const filePath = path.join(destinationPath, REMOTE_API_TYPES_FILE_NAME);
      fs.writeFileSync(filePath, apiTypeFile);
      const existed = this.loadedRemoteAPIAlias.has(remoteInfo.alias);
      this.loadedRemoteAPIAlias.add(remoteInfo.alias);
      fileLog(`success`, 'downloadAPITypes', 'info');
      return existed;
    } catch (err) {
      fileLog(
        `Unable to download "${remoteInfo.name}" api types, ${err}`,
        'downloadAPITypes',
        'error',
      );
    }
  }

  consumeAPITypes(hostOptions: Required<HostOptions>) {
    const apiTypeFileName = path.join(
      hostOptions.context,
      hostOptions.typesFolder,
      HOST_API_TYPES_FILE_NAME,
    );
    try {
      const existedFile = fs.readFileSync(apiTypeFileName, 'utf-8');
      const existedImports = new ThirdPartyExtractor('').collectTypeImports(
        existedFile,
      );
      existedImports.forEach((existedImport) => {
        const alias = existedImport
          .split('./')
          .slice(1)
          .join('./')
          .replace('/apis.d.ts', '');
        this.loadedRemoteAPIAlias.add(alias);
      });
    } catch (err) {
      //noop
    }
    if (!this.loadedRemoteAPIAlias.size) {
      return;
    }
    const packageTypes: string[] = [];
    const remoteKeys: string[] = [];

    const importTypeStr = [...this.loadedRemoteAPIAlias]
      .sort()
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

    const runtimePkgs: Set<string> = new Set();
    [...this.runtimePkgs, ...hostOptions.runtimePkgs].forEach((pkg) => {
      runtimePkgs.add(pkg);
    });

    const pkgsDeclareStr = [...runtimePkgs]
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
      if (hostOptions.consumeAPITypes) {
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
      }

      logger.success('Federated types extraction completed');
    } catch (err) {
      if (this.options.host?.abortOnError === false) {
        fileLog(
          `Unable to consume federated types, ${err}`,
          'consumeTypes',
          'error',
        );
      } else {
        throw err;
      }
    }
  }

  async updateTypes(options: UpdateTypesOptions): Promise<void> {
    try {
      const {
        remoteName,
        updateMode,
        remoteTarPath,
        remoteInfo: updatedRemoteInfo,
        once,
      } = options;
      const hostName = this.options?.host?.moduleFederationConfig?.name;
      fileLog(
        `options: ${JSON.stringify(options, null, 2)};\nhostName: ${hostName}`,
        'updateTypes',
        'info',
      );
      if (updateMode === UpdateMode.POSITIVE && remoteName === hostName) {
        if (!this.options.remote) {
          return;
        }
        await this.generateTypes();
      } else {
        const { remoteAliasMap } = this;
        if (!this.options.host) {
          return;
        }
        const { hostOptions, mapRemotesToDownload } = retrieveHostConfig(
          this.options.host,
        );

        const loadedRemoteInfo = Object.values(remoteAliasMap).find(
          (i) => i.name === remoteName,
        );

        const consumeTypes = async (
          requiredRemoteInfo: Required<RemoteInfo>,
        ) => {
          fileLog(`consumeTypes start`, 'updateTypes', 'info');
          if (!requiredRemoteInfo.zipUrl) {
            throw new Error(
              `Can not get ${requiredRemoteInfo.name}'s types archive url!`,
            );
          }
          const [_alias, destinationPath] = await this.consumeTargetRemotes(
            hostOptions,
            {
              ...requiredRemoteInfo,
              // use remoteTarPath first
              zipUrl: remoteTarPath || requiredRemoteInfo.zipUrl,
            },
          );
          const addNew = await this.downloadAPITypes(
            requiredRemoteInfo,
            destinationPath,
          );
          if (addNew) {
            this.consumeAPITypes(hostOptions);
          }
          fileLog(`consumeTypes end`, 'updateTypes', 'info');
        };
        fileLog(
          `loadedRemoteInfo: ${JSON.stringify(loadedRemoteInfo, null, 2)}`,
          'updateTypes',
          'info',
        );
        if (!loadedRemoteInfo) {
          const remoteInfo = Object.values(mapRemotesToDownload).find(
            (item) => {
              return item.name === remoteName;
            },
          );
          fileLog(
            `remoteInfo: ${JSON.stringify(remoteInfo, null, 2)}`,
            'updateTypes',
            'info',
          );
          if (remoteInfo) {
            if (!this.remoteAliasMap[remoteInfo.alias]) {
              const requiredRemoteInfo =
                await this.requestRemoteManifest(remoteInfo);
              this.remoteAliasMap[remoteInfo.alias] = requiredRemoteInfo;
            }
            await consumeTypes(this.remoteAliasMap[remoteInfo.alias]);
          } else if (updatedRemoteInfo) {
            const consumeDynamicRemoteTypes = async () => {
              await consumeTypes(
                this.updatedRemoteInfos[updatedRemoteInfo.name],
              );
            };
            if (!this.updatedRemoteInfos[updatedRemoteInfo.name]) {
              const parsedRemoteInfo = retrieveRemoteInfo({
                hostOptions: hostOptions,
                remoteAlias: updatedRemoteInfo.alias || updatedRemoteInfo.name,
                remote: updatedRemoteInfo.url,
              });
              fileLog(`start request manifest`, 'consumeTypes', 'info');
              this.updatedRemoteInfos[updatedRemoteInfo.name] =
                await this.requestRemoteManifest(parsedRemoteInfo);
              fileLog(
                `end request manifest, this.updatedRemoteInfos[updatedRemoteInfo.name]: ${JSON.stringify(
                  this.updatedRemoteInfos[updatedRemoteInfo.name],
                  null,
                  2,
                )}`,
                'updateTypes',
                'info',
              );
              await consumeDynamicRemoteTypes();
            }
            if (!once && this.updatedRemoteInfos[updatedRemoteInfo.name]) {
              await consumeDynamicRemoteTypes();
            }
          }
        } else {
          await consumeTypes(loadedRemoteInfo);
        }
      }
    } catch (err) {
      fileLog(`updateTypes fail, ${err}`, 'updateTypes', 'error');
    }
  }
}

export { DTSManager };
