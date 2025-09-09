import {
  StatsExpose,
  StatsRemote,
  StatsRemoteVal,
  StatsShared,
  composeKeyWithSeparator,
  moduleFederationPlugin,
} from '@module-federation/sdk';
import type { StatsModule } from 'webpack';
import path from 'path';
import {
  ContainerManager,
  RemoteManager,
  SharedManager,
} from '@module-federation/managers';
import type managerTypes from '@module-federation/managers';
import { getFileNameWithOutExt } from './utils';

type ShareMap = { [sharedKey: string]: StatsShared };
type ExposeMap = { [exposeImportValue: string]: StatsExpose };
type RemotesConsumerMap = { [remoteKey: string]: StatsRemote };

type ContainerExposeEntry = [
  exposeKey: string,
  { import: string[]; name?: string },
];

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const normalizeExposeValue = (
  exposeValue: unknown,
): { import: string[]; name?: string } | undefined => {
  if (!exposeValue) {
    return undefined;
  }

  const toImportArray = (value: unknown): string[] | undefined => {
    if (isNonEmptyString(value)) {
      return [value];
    }

    if (Array.isArray(value)) {
      const normalized = value.filter(isNonEmptyString);

      return normalized.length ? normalized : undefined;
    }

    return undefined;
  };

  if (typeof exposeValue === 'object') {
    if ('import' in exposeValue) {
      const { import: rawImport, name } = exposeValue as {
        import: unknown;
        name?: string;
      };
      const normalizedImport = toImportArray(rawImport);

      if (!normalizedImport?.length) {
        return undefined;
      }

      return {
        import: normalizedImport,
        ...(isNonEmptyString(name) ? { name } : {}),
      };
    }

    return undefined;
  }

  const normalizedImport = toImportArray(exposeValue);

  if (!normalizedImport?.length) {
    return undefined;
  }

  return { import: normalizedImport };
};

const parseContainerExposeEntries = (
  identifier: string,
): ContainerExposeEntry[] | undefined => {
  const startIndex = identifier.indexOf('[');

  if (startIndex < 0) {
    return undefined;
  }

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let cursor = startIndex; cursor < identifier.length; cursor++) {
    const char = identifier[cursor];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (char === '\\') {
      isEscaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === '[') {
      depth++;
    } else if (char === ']') {
      depth--;

      if (depth === 0) {
        const serialized = identifier.slice(startIndex, cursor + 1);

        try {
          return JSON.parse(serialized) as ContainerExposeEntry[];
        } catch {
          return undefined;
        }
      }
    }
  }

  return undefined;
};

export const getExposeName = (exposeKey: string) => {
  return exposeKey.replace('./', '');
};
export function getExposeItem({
  exposeKey,
  name,
  file,
}: {
  exposeKey: string;
  name: string;
  file: { import: string[] };
}): StatsExpose {
  const exposeModuleName = getExposeName(exposeKey);

  return {
    path: exposeKey,
    id: composeKeyWithSeparator(name, exposeModuleName),
    name: exposeModuleName,
    // @ts-ignore to deduplicate
    requires: [],
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

export const getShareItem = ({
  pkgName,
  normalizedShareOptions,
  pkgVersion,
  hostName,
}: {
  pkgName: string;
  hostName?: string;
  normalizedShareOptions: managerTypes.types.NormalizedSharedOptions[string];
  pkgVersion: string;
}): StatsShared => {
  return {
    ...normalizedShareOptions,
    id: `${hostName}:${pkgName}`,
    requiredVersion:
      normalizedShareOptions?.requiredVersion || `^${pkgVersion}`,
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
    usedExports: [],
    fallback: '',
  };
};

class ModuleHandler {
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions;
  private _bundler: 'webpack' | 'rspack' = 'webpack';
  private _modules: StatsModule[];
  private _containerManager: ContainerManager;
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

    this._containerManager = new ContainerManager();
    this._containerManager.init(options);
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
      sharedMap[pkgName] = getShareItem({
        pkgName,
        pkgVersion,
        normalizedShareOptions: sharedManagerNormalizedOptions[pkgName],
        hostName: this._options.name,
      });
    };

    const collectRelationshipMap = (mod: StatsModule, pkgName: string) => {
      const { issuerName, reasons } = mod;

      if (issuerName) {
        if (exposesMap[getFileNameWithOutExt(issuerName)]) {
          const expose = exposesMap[getFileNameWithOutExt(issuerName)];
          // @ts-ignore use Set to deduplicate
          expose.requires.push(pkgName);
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
              expose.requires.push(pkgName);
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
    const entries =
      parseContainerExposeEntries(identifier) ??
      this._getContainerExposeEntriesFromOptions();

    if (!entries) {
      return;
    }

    entries.forEach(([prefixedName, file]) => {
      // TODO: support multiple import
      exposesMap[getFileNameWithOutExt(file.import[0])] = getExposeItem({
        exposeKey: prefixedName,
        name: this._options.name!,
        file,
      });
    });
  }

  private _getContainerExposeEntriesFromOptions():
    | ContainerExposeEntry[]
    | undefined {
    const exposes = this._containerManager.containerPluginExposesOptions;

    const normalizedEntries = Object.entries(exposes).reduce<
      ContainerExposeEntry[]
    >((acc, [exposeKey, exposeOptions]) => {
      const normalizedExpose = normalizeExposeValue(exposeOptions);

      if (!normalizedExpose?.import.length) {
        return acc;
      }

      acc.push([exposeKey, normalizedExpose]);

      return acc;
    }, []);

    if (normalizedEntries.length) {
      return normalizedEntries;
    }

    const rawExposes = this._options.exposes;

    if (!rawExposes || Array.isArray(rawExposes)) {
      return undefined;
    }

    const normalizedFromOptions = Object.entries(rawExposes).reduce<
      ContainerExposeEntry[]
    >((acc, [exposeKey, exposeOptions]) => {
      const normalizedExpose = normalizeExposeValue(exposeOptions);

      if (!normalizedExpose?.import.length) {
        return acc;
      }

      acc.push([exposeKey, normalizedExpose]);

      return acc;
    }, []);

    return normalizedFromOptions.length ? normalizedFromOptions : undefined;
  }

  private _initializeExposesFromOptions(exposesMap: ExposeMap) {
    if (!this._options.name || !this._containerManager.enable) {
      return;
    }

    const exposes = this._containerManager.containerPluginExposesOptions;

    Object.entries(exposes).forEach(([exposeKey, exposeOptions]) => {
      if (!exposeOptions.import?.length) {
        return;
      }

      const [exposeImport] = exposeOptions.import;

      if (!exposeImport) {
        return;
      }

      const exposeMapKey = getFileNameWithOutExt(exposeImport);

      if (!exposesMap[exposeMapKey]) {
        exposesMap[exposeMapKey] = getExposeItem({
          exposeKey,
          name: this._options.name!,
          file: exposeOptions,
        });
      }
    });
  }

  collect() {
    const remotes: StatsRemote[] = [];
    const remotesConsumerMap: { [remoteKey: string]: StatsRemote } = {};

    const exposesMap: { [exposeImportValue: string]: StatsExpose } = {};
    const sharedMap: { [sharedKey: string]: StatsShared } = {};

    this._initializeExposesFromOptions(exposesMap);

    const isSharedModule = (moduleType?: string) => {
      return Boolean(
        moduleType &&
        ['provide-module', 'consume-shared-module'].includes(moduleType),
      );
    };
    const isContainerModule = (identifier: string) => {
      return identifier.startsWith('container entry');
    };
    const isRemoteModule = (identifier: string) => {
      return identifier.startsWith('remote ');
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
      } else if (
        !this._containerManager.enable &&
        isContainerModule(identifier)
      ) {
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
