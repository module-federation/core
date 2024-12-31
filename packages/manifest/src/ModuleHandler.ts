import {
  StatsExpose,
  StatsRemote,
  StatsRemoteVal,
  StatsShared,
  moduleFederationPlugin,
} from '@module-federation/sdk';
import type { StatsModule } from 'webpack';
import path from 'path';
import { RemoteManager, SharedManager } from '@module-federation/managers';
import { getFileNameWithOutExt } from './utils';

type ShareMap = { [sharedKey: string]: StatsShared };
type ExposeMap = { [exposeImportValue: string]: StatsExpose };
type RemotesConsumerMap = { [remoteKey: string]: StatsRemote };

export function getExposeItem({
  exposeKey,
  name,
  file,
}: {
  exposeKey: string;
  name: string;
  file: { import: string[] };
}): StatsExpose {
  const exposeModuleName = exposeKey.replace('./', '');

  return {
    path: exposeKey,
    id: `${name}:${exposeModuleName}`,
    name: exposeModuleName,
    // @ts-ignore to deduplicate
    requires: new Set(),
    file: path.relative(process.cwd(), file.import[0]),
    assets: {
      js: {
        async: [],
        sync: [],
      },
      css: {
        async: [],
        sync: [],
      },
    },
  };
}

class ModuleHandler {
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions;
  private _bundler: 'webpack' | 'rspack' = 'webpack';
  private _modules: StatsModule[];
  private _remoteManager: RemoteManager = new RemoteManager();
  private _sharedManager: SharedManager = new SharedManager();

  constructor(
    options: moduleFederationPlugin.ModuleFederationPluginOptions,
    modules: StatsModule[],
    { bundler }: { bundler: 'webpack' | 'rspack' },
  ) {
    this._options = options;
    this._modules = modules;
    this._bundler = bundler;

    this._remoteManager = new RemoteManager();
    this._remoteManager.init(options);
    this._sharedManager = new SharedManager();
    this._sharedManager.init(options);
  }

  get isRspack(): boolean {
    return this._bundler === 'rspack';
  }

  private _handleSharedModule(
    mod: StatsModule,
    sharedMap: ShareMap,
    exposesMap: ExposeMap,
  ) {
    const { identifier, moduleType } = mod;
    if (!identifier) {
      return;
    }

    const sharedManagerNormalizedOptions =
      this._sharedManager.normalizedOptions;

    const initShared = (pkgName: string, pkgVersion: string) => {
      if (sharedMap[pkgName]) {
        return;
      }
      sharedMap[pkgName] = {
        ...sharedManagerNormalizedOptions[pkgName],
        id: `${this._options.name}:${pkgName}`,
        requiredVersion:
          sharedManagerNormalizedOptions[pkgName]?.requiredVersion ||
          `^${pkgVersion}`,
        name: pkgName,
        version: pkgVersion,
        assets: {
          js: {
            async: [],
            sync: [],
          },
          css: {
            async: [],
            sync: [],
          },
        },
        // @ts-ignore to deduplicate
        usedIn: new Set(),
      };
    };

    const collectRelationshipMap = (mod: StatsModule, pkgName: string) => {
      const { issuerName, reasons } = mod;

      if (issuerName) {
        if (exposesMap[getFileNameWithOutExt(issuerName)]) {
          const expose = exposesMap[getFileNameWithOutExt(issuerName)];
          // @ts-ignore use Set to deduplicate
          expose.requires.add(pkgName);
          // @ts-ignore use Set to deduplicate
          sharedMap[pkgName].usedIn.add(expose.path);
        }
      }
      if (reasons) {
        reasons.forEach(({ resolvedModule, moduleName }) => {
          let exposeModName = this.isRspack ? moduleName : resolvedModule;
          // filters out entrypoints
          if (exposeModName) {
            if (exposesMap[getFileNameWithOutExt(exposeModName)]) {
              const expose = exposesMap[getFileNameWithOutExt(exposeModName)];
              // @ts-ignore to deduplicate
              expose.requires.add(pkgName);
              // @ts-ignore to deduplicate
              sharedMap[pkgName].usedIn.add(expose.path);
            }
          }
        });
      }
    };

    const parseResolvedIdentifier = (nameAndVersion: string) => {
      let name = '';
      let version = '';

      if (nameAndVersion.startsWith('@')) {
        const splitInfo = nameAndVersion.split('@');
        splitInfo[0] = '@';
        name = splitInfo[0] + splitInfo[1];
        version = splitInfo[2];
      } else if (nameAndVersion.includes('@')) {
        [name, version] = nameAndVersion.split('@');
        version = version.replace(/[\^~>|>=]/g, '');
      }

      return {
        name,
        version,
      };
    };

    if (moduleType === 'provide-module') {
      // identifier(rspack) = provide shared module (default) react@18.2.0 = /temp/node_modules/.pnpm/react@18.2.0/node_modules/react/index.js
      // identifier(webpack) = provide module (default) react@18.2.0 = /temp/node_modules/.pnpm/react@18.2.0/node_modules/react/index.js
      const data = identifier.split(' ');
      const nameAndVersion = this.isRspack ? data[4] : data[3];

      const { name, version } = parseResolvedIdentifier(nameAndVersion);

      if (name && version) {
        initShared(name, version);
        collectRelationshipMap(mod, name);
      }
    }

    if (moduleType === 'consume-shared-module') {
      // identifier(rspack) = consume shared module (default) lodash/get@^4.17.21 (strict) (fallback: /temp/node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/get.js)
      // identifier(webpack) = consume-shared-module|default|react-dom|!=1.8...2...0|false|/temp/node_modules/.pnpm/react-dom@18.2.0_react@18.2.0/node_modules/react-dom/index.js|true|false
      const SEPARATOR = this.isRspack ? ' ' : '|';
      const data = identifier.split(SEPARATOR);

      let pkgName = '';
      let pkgVersion = '';

      if (this.isRspack) {
        const nameAndVersion = data[4];
        const res = parseResolvedIdentifier(nameAndVersion);
        pkgName = res.name;
        pkgVersion = res.version;
      } else {
        pkgName = data[2];
        const pkgVersionRange = data[3];
        pkgVersion = '';
        if (pkgVersionRange.startsWith('=')) {
          pkgVersion = data[3].replace('=', '');
        } else {
          if (sharedManagerNormalizedOptions[pkgName]) {
            pkgVersion = sharedManagerNormalizedOptions[pkgName].version;
          } else {
            const fullPkgName = pkgName.split('/').slice(0, -1).join('/');
            // pkgName: react-dom/
            if (sharedManagerNormalizedOptions[`${fullPkgName}/`]) {
              if (sharedManagerNormalizedOptions[fullPkgName]) {
                pkgVersion =
                  sharedManagerNormalizedOptions[fullPkgName].version;
              } else {
                pkgVersion =
                  sharedManagerNormalizedOptions[`${fullPkgName}/`].version;
              }
            }
          }
        }
      }

      if (pkgName && pkgVersion) {
        initShared(pkgName, pkgVersion);
        collectRelationshipMap(mod, pkgName);
      }
    }
  }

  private _handleRemoteModule(
    mod: StatsModule,
    remotes: StatsRemote[],
    remotesConsumerMap: RemotesConsumerMap,
  ) {
    const { identifier, reasons, nameForCondition } = mod;
    if (!identifier) {
      return;
    }
    const remoteManagerNormalizedOptions =
      this._remoteManager.normalizedOptions;
    // identifier = remote (default) webpack/container/reference/app2 ./Button
    const data = identifier.split(' ');

    if (data.length === 4) {
      const moduleName = data[3].replace('./', '');
      const remoteAlias = data[2].replace('webpack/container/reference/', '');
      const normalizedRemote = remoteManagerNormalizedOptions[remoteAlias];
      const basicRemote: StatsRemoteVal = {
        alias: normalizedRemote.alias,
        consumingFederationContainerName: this._options.name || '',
        federationContainerName:
          remoteManagerNormalizedOptions[remoteAlias].name,
        moduleName,
        // @ts-ignore to deduplicate
        usedIn: new Set(),
      };
      if (!nameForCondition) {
        return;
      }
      let remote: StatsRemote;
      if ('version' in normalizedRemote) {
        remote = {
          ...basicRemote,
          version: normalizedRemote.version,
        };
      } else {
        remote = {
          ...basicRemote,
          entry: normalizedRemote.entry,
        };
      }

      remotes.push(remote);
      remotesConsumerMap[nameForCondition] = remote;
    }
    if (reasons) {
      reasons.forEach(({ userRequest, resolvedModule, moduleName }) => {
        let exposeModName = this.isRspack ? moduleName : resolvedModule;

        if (userRequest && exposeModName && remotesConsumerMap[userRequest]) {
          // @ts-ignore to deduplicate
          remotesConsumerMap[userRequest].usedIn.add(
            exposeModName.replace('./', ''),
          );
        }
      });
    }
  }

  private _handleContainerModule(mod: StatsModule, exposesMap: ExposeMap) {
    const { identifier } = mod;
    if (!identifier) {
      return;
    }
    // identifier: container entry (default) [[".",{"import":["./src/routes/page.tsx"],"name":"__federation_expose_default_export"}]]'
    const data = identifier.split(' ');

    JSON.parse(data[3]).forEach(([prefixedName, file]) => {
      // TODO: support multiple import
      exposesMap[getFileNameWithOutExt(file.import[0])] = getExposeItem({
        exposeKey: prefixedName,
        name: this._options.name!,
        file,
      });
    });
  }

  collect() {
    const remotes: StatsRemote[] = [];
    const remotesConsumerMap: { [remoteKey: string]: StatsRemote } = {};

    const exposesMap: { [exposeImportValue: string]: StatsExpose } = {};
    const sharedMap: { [sharedKey: string]: StatsShared } = {};

    const isSharedModule = (moduleType?: string) => {
      return Boolean(
        moduleType &&
          ['provide-module', 'consume-shared-module'].includes(moduleType),
      );
    };
    const isContainerModule = (identifier: string) => {
      const data = identifier.split(' ');
      return Boolean(data[0] === 'container' && data[1] === 'entry');
    };
    const isRemoteModule = (identifier: string) => {
      const data = identifier.split(' ');
      return data[0] === 'remote';
    };

    // handle remote/expose
    this._modules.forEach((mod) => {
      const { identifier, reasons, nameForCondition, moduleType } = mod;
      if (!identifier) {
        return;
      }

      if (isSharedModule(moduleType)) {
        this._handleSharedModule(mod, sharedMap, exposesMap);
      }

      if (isRemoteModule(identifier)) {
        this._handleRemoteModule(mod, remotes, remotesConsumerMap);
      } else if (isContainerModule(identifier)) {
        this._handleContainerModule(mod, exposesMap);
      }
    });

    return {
      remotes,
      exposesMap,
      sharedMap,
    };
  }
}

export { ModuleHandler };
