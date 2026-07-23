import type { RemoteEntryExports } from '@module-federation/runtime-core/types';

export const LYNX_BUNDLE_REGISTRY = Symbol.for(
  'module-federation:lynx:bundle-registry',
);

export const LYNX_REMOTE_ORIGIN_SUFFIX = ':remote-origin';

export type LynxRealm = 'background' | 'main-thread';

export interface LynxRuntimePluginOptions {
  /** Resolved DSL layer names injected by the build adapter. */
  realmLayers?: Record<LynxRealm, string>;
  timeout?: number;
}

export interface LynxRuntime {
  QueryComponent?(source: string, callback: (result: unknown) => void): void;
  fetchBundle?(bundleUrl: string): PromiseLike<unknown>;
  loadScript?(sectionPath: string, options: { bundleName: string }): unknown;
  loadLazyBundle?(
    bundleUrl: string,
    mode?: 'sync' | 'async',
    host?: string,
  ): PromiseLike<unknown>;
  getNativeApp?(): unknown;
  getNativeLynx?(): Pick<LynxRuntime, 'QueryComponent' | 'loadLazyBundle'>;
  requireModuleAsync?(
    moduleUrl: string,
    callback: (error: unknown, value: unknown) => void,
  ): void;
}

export interface LynxGlobal {
  __QueryComponent?(
    source: string,
    callback: (result: {
      code: number;
      data?: { evalResult?: unknown; url?: string };
    }) => void,
  ): { evalResult: unknown } | null | undefined;
  lynx?: LynxRuntime;
  lynxCoreInject?: {
    tt?: {
      getDynamicComponentExports?(schema: string): unknown;
    };
  };
  [LYNX_BUNDLE_REGISTRY]?: Map<string, string>;
  [name: string]: unknown;
}

declare const lynx: LynxRuntime | undefined;
declare const __MAIN_THREAD__: boolean | undefined;

export const getLynxRuntime = (
  globalObject: LynxGlobal,
): LynxRuntime | undefined =>
  globalObject.lynx ?? (typeof lynx === 'undefined' ? undefined : lynx);

export const MAIN_THREAD_EXPOSE_SUFFIX = '__main_thread';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isRemoteEntryExports = (value: unknown): value is RemoteEntryExports =>
  isRecord(value) &&
  typeof value.get === 'function' &&
  typeof value.init === 'function';

const getDefaultExport = (value: unknown): unknown =>
  isRecord(value) ? value.default : undefined;

const getRemoteEntryGlobalCandidates = (
  entryGlobalName: string,
  globalObject: LynxGlobal,
  alternateGlobalName?: string,
): unknown[] => {
  const globalValue = globalObject[entryGlobalName];
  const alternateGlobalValue = alternateGlobalName
    ? globalObject[alternateGlobalName]
    : undefined;

  return [
    globalValue,
    getDefaultExport(globalValue),
    alternateGlobalValue,
    getDefaultExport(alternateGlobalValue),
  ];
};

export const snapshotRemoteEntryGlobals = (
  entryGlobalName: string,
  globalObject: LynxGlobal,
  alternateGlobalName?: string,
): ReadonlySet<RemoteEntryExports> =>
  new Set(
    getRemoteEntryGlobalCandidates(
      entryGlobalName,
      globalObject,
      alternateGlobalName,
    ).filter(isRemoteEntryExports),
  );

export const findRemoteEntryExports = (
  value: unknown,
  entryGlobalName: string,
  globalObject: LynxGlobal,
  alternateGlobalName?: string,
  previousGlobalExports: ReadonlySet<RemoteEntryExports> = new Set(),
): RemoteEntryExports | undefined => {
  const loadedExports = [value, getDefaultExport(value)].find(
    isRemoteEntryExports,
  );
  if (loadedExports) {
    return loadedExports;
  }

  return getRemoteEntryGlobalCandidates(
    entryGlobalName,
    globalObject,
    alternateGlobalName,
  ).find(
    (candidate): candidate is RemoteEntryExports =>
      isRemoteEntryExports(candidate) && !previousGlobalExports.has(candidate),
  );
};

export const getLynxRealm = (lynx: LynxRuntime): LynxRealm =>
  typeof __MAIN_THREAD__ !== 'undefined'
    ? __MAIN_THREAD__
      ? 'main-thread'
      : 'background'
    : typeof lynx.requireModuleAsync === 'function' ||
        typeof lynx.getNativeApp === 'function'
      ? 'background'
      : 'main-thread';

export const getRegistryKey = (
  entryGlobalName: string,
  realm: LynxRealm,
): string =>
  realm === 'background' ? entryGlobalName : `${entryGlobalName}__main_thread`;

export const getRemoteOriginKey = (entryGlobalName: string): string =>
  `${entryGlobalName}${LYNX_REMOTE_ORIGIN_SUFFIX}`;

export const getBundleRegistry = (
  globalObject: LynxGlobal,
): Map<string, string> => {
  let registry = globalObject[LYNX_BUNDLE_REGISTRY];
  if (!registry) {
    registry = new Map();
    globalObject[LYNX_BUNDLE_REGISTRY] = registry;
  }
  return registry;
};

export const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);
