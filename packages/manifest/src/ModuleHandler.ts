import {
  StatsExpose,
  StatsRemote,
  StatsRemoteVal,
  StatsShared,
  composeKeyWithSeparator,
  moduleFederationPlugin,
} from '@module-federation/sdk';
import type { StatsModule } from 'webpack/lib/stats/DefaultStatsFactoryPlugin';
import path from 'path';
import {
  ContainerManager,
  RemoteManager,
  SharedManager,
} from '@module-federation/managers';
import type managerTypes from '@module-federation/managers';
import {
  getFileNameWithOutExt,
  splitSharedIdentifier,
  getSharedIdentity,
} from './utils';

export interface SharedProviderModule {
  name: string;
  version: string;
  request: string;
  module: StatsModule;
}

type ShareMap = { [sharedKey: string]: StatsShared };
type ExposeMap = { [exposeKey: string]: StatsExpose };
type RemotesConsumerMap = { [remoteKey: string]: StatsRemote };

type ContainerExposeEntry = [
  exposeKey: string,
  { import: string[]; name?: string | null; layer?: string },
];

const REMOTE_REFERENCE_PREFIX = /^(?:webpack|rspack)\/container\/reference\//;

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const isContainerExposeEntry = (
  value: unknown,
): value is ContainerExposeEntry => {
  if (!Array.isArray(value) || value.length !== 2) return false;
  const [exposeKey, file] = value as unknown[];
  if (typeof exposeKey !== 'string') return false;
  if (!file || typeof file !== 'object') return false;
  const { import: imports, name } = file as {
    import?: unknown;
    name?: unknown;
  };
  return (
    Array.isArray(imports) &&
    imports.length > 0 &&
    imports.every((item) => typeof item === 'string') &&
    (name == null || typeof name === 'string')
  );
};

/**
 * The container payload is `[[exposeKey, { import, name, layer? }], ...]`;
 * a layer lives inside its expose's options object, as in webpack.
 */
const decodeContainerExposePayload = (
  payload: unknown,
): ContainerExposeEntry[] | undefined => {
  if (!Array.isArray(payload) || !payload.every(isContainerExposeEntry)) {
    return undefined;
  }
  return payload as ContainerExposeEntry[];
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

const scanBalancedBrackets = (
  identifier: string,
  startIndex: number,
): string | undefined => {
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
        return identifier.slice(startIndex, cursor + 1);
      }
    }
  }

  return undefined;
};

/**
 * The payload is the last balanced `[...]` group that decodes to a known
 * expose representation. An ordered share scope is serialized before it as
 * `[m2:...]`, which is not JSON, so every `[` is a candidate start.
 */
const parseContainerExposeEntries = (
  identifier: string,
): ContainerExposeEntry[] | undefined => {
  for (
    let startIndex = identifier.indexOf('[');
    startIndex >= 0;
    startIndex = identifier.indexOf('[', startIndex + 1)
  ) {
    const serialized = scanBalancedBrackets(identifier, startIndex);
    if (serialized === undefined) {
      return undefined;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(serialized);
    } catch {
      continue;
    }

    const entries = decodeContainerExposePayload(payload);
    if (entries) {
      return entries;
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
  file: { import: string[]; layer?: string };
}): StatsExpose {
  const exposeModuleName = getExposeName(exposeKey);

  return {
    path: exposeKey,
    id: composeKeyWithSeparator(name, exposeModuleName),
    name: exposeModuleName,
    ...(file.layer !== undefined ? { layer: file.layer } : {}),
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
  private _moduleLayers = new Map<string, string | undefined>();
  private _exposedModuleLayers = new Map<string, Set<string | undefined>>();
  private _containerManager: ContainerManager;
  private _exposeImports = new Map<string, string[]>();
  private _remoteManager: RemoteManager = new RemoteManager();
  private _sharedManager: SharedManager = new SharedManager();

  constructor(
    options: moduleFederationPlugin.ModuleFederationPluginOptions,
    modules: StatsModule[],
    { bundler }: { bundler: 'webpack' | 'rspack' },
  ) {
    this._options = options;
    this._modules = modules;
    for (const module of modules) {
      if (module.identifier)
        this._moduleLayers.set(module.identifier, module.layer ?? undefined);
      for (const reason of module.reasons || []) {
        if (reason.type === 'container exposed' && reason.userRequest) {
          const layers =
            this._exposedModuleLayers.get(reason.userRequest) ||
            new Set<string | undefined>();
          layers.add(module.layer ?? undefined);
          this._exposedModuleLayers.set(reason.userRequest, layers);
        }
      }
    }
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
    sharedProviderModules: SharedProviderModule[],
  ) {
    const { identifier, moduleType } = mod;
    if (!identifier) {
      return;
    }

    const sharedManagerNormalizedOptions =
      this._sharedManager.normalizedOptions;

    const identity = getSharedIdentity(
      identifier,
      moduleType === 'provide-module' && !this.isRspack ? 2 : 3,
      mod.layer,
    );
    const layered =
      identity.layer !== undefined || Array.isArray(identity.shareScope);
    const sharedKey = (name: string) => (layered ? identity.key : name);
    const initShared = (pkgName: string, pkgVersion: string) => {
      const key = sharedKey(pkgName);
      if (sharedMap[key]) {
        return;
      }
      sharedMap[key] = getShareItem({
        pkgName,
        pkgVersion,
        normalizedShareOptions: sharedManagerNormalizedOptions[pkgName],
        hostName: this._options.name,
      });
      if (layered) {
        sharedMap[key].id = `${this._options.name}:shared:${identity.key}`;
        if (identity.layer !== undefined) sharedMap[key].layer = identity.layer;
        if (identity.shareScope !== 'default')
          sharedMap[key].shareScope = identity.shareScope;
      }
    };

    const collectRelationshipMap = (mod: StatsModule, pkgName: string) => {
      const { issuerName, reasons } = mod;

      const importers = [
        { name: issuerName, identifier: mod.issuer },
        ...(reasons || []).map(
          ({
            resolvedModule,
            moduleName,
            resolvedModuleIdentifier,
            moduleIdentifier,
          }) => ({
            name: this.isRspack ? moduleName : resolvedModule,
            identifier: this.isRspack
              ? moduleIdentifier
              : resolvedModuleIdentifier,
          }),
        ),
      ];
      for (const [exposeKey, expose] of Object.entries(exposesMap)) {
        const imports = this._exposeImports.get(exposeKey) || [];
        if (
          imports.some((file) =>
            importers.some(({ name, identifier }) => {
              if (!name) return false;
              if (
                identifier &&
                this._moduleLayers.has(identifier) &&
                this._moduleLayers.get(identifier) !==
                  (this._exposedModuleLayers.get(file)?.size === 1
                    ? this._exposedModuleLayers.get(file)!.values().next().value
                    : expose.layer)
              )
                return false;
              return (
                getFileNameWithOutExt(name) === getFileNameWithOutExt(file)
              );
            }),
          )
        ) {
          expose.requires.push(pkgName);
          // @ts-ignore use Set to deduplicate
          sharedMap[sharedKey(pkgName)].usedIn.add(expose.path);
        }
      }
    };

    const parseResolvedIdentifier = (nameAndVersion: string) => {
      if (identifier.includes(' [identity:') && identity.name) {
        const header = identifier
          .split(' = ')[0]
          .split(' (fallback:')[0]
          .split(' [identity:')[0];
        const start = header.lastIndexOf(`${identity.name}@`);
        if (start >= 0) {
          const version = header
            .slice(start + identity.name.length + 1)
            .split(' ')[0];
          return {
            name: identity.name,
            version: identity.name.startsWith('@')
              ? version
              : version.replace(/[\^~>|>=]/g, ''),
          };
        }
      }
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
      // identifier(rspack)  = provide shared module (default) react@18.2.0 = /temp/node_modules/react/index.js
      // identifier(webpack) = provide module (default) react@18.2.0 = /temp/node_modules/react/index.js
      // A layered share inserts ` (layer)` after the scope in both bundlers.
      const { tokens } = splitSharedIdentifier(
        identifier,
        this.isRspack ? 3 : 2,
      );
      const nameAndVersion = this.isRspack ? tokens[4] : tokens[3];

      const { name, version } = parseResolvedIdentifier(nameAndVersion);

      if (name && version) {
        initShared(name, version);
        collectRelationshipMap(mod, name);
        const separator = identifier.indexOf(' = ');
        if (separator !== -1) {
          const request = identifier
            .slice(separator + 3)
            .replace(/ \[identity:[\s\S]*\]$/, '');
          sharedProviderModules.push({
            name: sharedKey(name),
            version,
            request,
            module: mod,
          });
        }
      }
    }

    if (moduleType === 'consume-shared-module') {
      // identifier(rspack)  = consume shared module (default) lodash/get@^4.17.21 (strict) (fallback: /temp/node_modules/lodash/get.js)
      // identifier(webpack) = consume-shared-module|default|react-dom|!=1.8...2...0|false|/temp/node_modules/react-dom/index.js|true|false|<layer>
      // A layered rspack share inserts ` (layer)` after the scope.
      const data = this.isRspack
        ? splitSharedIdentifier(identifier, 3).tokens
        : identifier.split('|');

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
    // identifier = remote (default) [webpack|rspack]/container/reference/app2 ./Button
    const data = identifier.split(' ');

    if (data.length === 4) {
      const moduleName = data[3].replace('./', '');
      const remoteAlias = data[2].replace(REMOTE_REFERENCE_PREFIX, '');
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
      this._exposeImports.set(prefixedName, file.import);
      exposesMap[prefixedName] = getExposeItem({
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

      this._exposeImports.set(exposeKey, exposeOptions.import);
      if (!exposesMap[exposeKey]) {
        exposesMap[exposeKey] = getExposeItem({
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

    const exposesMap: ExposeMap = {};
    const sharedMap: { [sharedKey: string]: StatsShared } = {};
    const sharedProviderModules: SharedProviderModule[] = [];

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

    // Initialize exposes before collecting their shared dependencies, regardless
    // of the order in which stats lists the modules.
    for (const mod of this._modules) {
      if (mod.identifier && isContainerModule(mod.identifier)) {
        this._handleContainerModule(mod, exposesMap);
      }
    }

    this._modules.forEach((mod) => {
      const { identifier, reasons, nameForCondition, moduleType } = mod;
      if (!identifier) {
        return;
      }

      if (isSharedModule(moduleType)) {
        this._handleSharedModule(
          mod,
          sharedMap,
          exposesMap,
          sharedProviderModules,
        );
      }

      if (isRemoteModule(identifier)) {
        this._handleRemoteModule(mod, remotes, remotesConsumerMap);
      }
    });

    return {
      remotes,
      exposesMap,
      sharedMap,
      sharedProviderModules,
    };
  }
}

export { ModuleHandler };
