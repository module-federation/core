export type ManifestExport = {
  id: string;
  name: string;
  chunks?: Array<string | number>;
  async?: boolean;
};

export type ManifestNode = Record<string, ManifestExport>;

export type RscClientReferenceResolution =
  | {
      kind: 'local';
    }
  | {
      kind: 'shared';
      shareKey: string;
      shareScope?: string[];
    }
  | {
      kind: 'remote';
      remoteAlias: string;
      request: string;
      shareScope?: string[];
    };

export type RscClientReference = {
  exportName: string;
  moduleId: string;
  chunks?: Array<string | number>;
  async?: boolean;
  resolution: RscClientReferenceResolution;
};

export type RscActionReference = {
  localActionId: string;
  exportName?: string;
  moduleResource?: string;
};

export type RscServerModuleReference = {
  localModuleId?: string;
  ssrExpose?: string;
  expose?: string;
};

export type ManifestLike = {
  version?: number;
  serverManifest?: Record<string, ManifestExport>;
  clientManifest?: Record<string, ManifestExport>;
  serverConsumerModuleMap?: Record<string, ManifestNode>;
  moduleLoading?: unknown;
  entryCssFiles?: Record<string, unknown> | Array<unknown>;
  entryJsFiles?: Array<unknown> | Record<string, unknown>;
  remoteManifests?: Record<
    string,
    {
      moduleLoading?: unknown;
      entryCssFiles?: unknown;
      entryJsFiles?: unknown;
    }
  >;
  clientExposes?: Record<string, string>;
  clientReferences?: Record<string, RscClientReference>;
  actions?: Record<string, RscActionReference>;
  serverModules?: Record<string, RscServerModuleReference>;
};

export type RscBridgeModuleV1 = {
  getManifest?: () => ManifestLike | Promise<ManifestLike>;
  executeAction?: (actionId: string, args: unknown[]) => Promise<unknown>;
  preloadSSRModule?: (
    moduleId: string,
    exposeHint?: string,
  ) => Promise<unknown>;
  getSSRModule?: (moduleId: string) => unknown;
};

export const getClientManifestKeyWithoutHash = (
  rawClientManifestKey: string,
) => {
  const hashIndex = rawClientManifestKey.indexOf('#');
  return hashIndex >= 0
    ? rawClientManifestKey.slice(0, hashIndex)
    : rawClientManifestKey;
};

export const resolveClientReferenceEntry = (
  manifest: ManifestLike | undefined,
  rawClientManifestKey: string,
) => {
  const clientReferences = manifest?.clientReferences;
  if (!clientReferences) {
    return undefined;
  }
  if (
    Object.prototype.hasOwnProperty.call(clientReferences, rawClientManifestKey)
  ) {
    return clientReferences[rawClientManifestKey];
  }
  const keyWithoutHash = getClientManifestKeyWithoutHash(rawClientManifestKey);
  if (
    keyWithoutHash !== rawClientManifestKey &&
    Object.prototype.hasOwnProperty.call(clientReferences, keyWithoutHash)
  ) {
    return clientReferences[keyWithoutHash];
  }
  return undefined;
};

export const resolveActionReference = (
  manifest: ManifestLike | undefined,
  actionId: string,
) => {
  const actions = manifest?.actions;
  if (!actions) {
    return undefined;
  }
  return actions[actionId];
};

export const resolveServerModuleReference = (
  manifest: ManifestLike | undefined,
  moduleId: string,
) => {
  const serverModules = manifest?.serverModules;
  if (!serverModules) {
    return undefined;
  }
  return serverModules[moduleId];
};
