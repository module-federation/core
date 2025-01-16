import {
  FederationHost,
  getRemoteEntry,
  getRemoteInfo,
} from '@module-federation/runtime';
import {
  loadScript,
  ModuleInfo,
  ProviderModuleInfo,
} from '@module-federation/sdk';
import { Remote } from '@module-federation/runtime/types';
import type { Federation } from '@module-federation/runtime';
import { getPrefetchId, compatGetPrefetchId } from './common/runtime-utils';

// Define an interface that extends Federation to include __PREFETCH__
interface FederationWithPrefetch extends Federation {
  __PREFETCH__: {
    entryLoading: Record<string, undefined | Promise<void>>;
    instance: Map<string, MFDataPrefetch>;
    __PREFETCH_EXPORTS__: Record<string, () => Promise<Record<string, any>>>;
  };
}

type PrefetchExports = Record<string, any>;

export interface DataPrefetchOptions {
  name: string;
  remote?: Remote;
  origin?: FederationHost;
  remoteSnapshot?: ModuleInfo;
}

export interface prefetchOptions {
  id: string;
  functionId?: string;
  cacheStrategy?: () => boolean;
  refetchParams?: any;
}

// @ts-ignore init global variable for test
globalThis.__FEDERATION__ ??= {};
(
  globalThis.__FEDERATION__ as unknown as FederationWithPrefetch
).__PREFETCH__ ??= {
  entryLoading: {},
  instance: new Map(),
  __PREFETCH_EXPORTS__: {},
} as FederationWithPrefetch['__PREFETCH__'];
export class MFDataPrefetch {
  public prefetchMemory: Map<string, Promise<any>>;
  public recordOutdate: Record<string, Record<string, boolean>>;
  private _exports: Record<string, any>;
  private _options: DataPrefetchOptions;

  constructor(options: DataPrefetchOptions) {
    this.prefetchMemory = new Map();
    this.recordOutdate = {};
    this._exports = {};
    this._options = options;
    this.global.instance.set(options.name, this);
  }

  get global(): FederationWithPrefetch['__PREFETCH__'] {
    return (globalThis.__FEDERATION__ as unknown as FederationWithPrefetch)
      .__PREFETCH__;
  }

  static getInstance(id: string): MFDataPrefetch | undefined {
    return (
      globalThis.__FEDERATION__ as unknown as FederationWithPrefetch
    ).__PREFETCH__.instance.get(id);
  }

  async loadEntry(entry: string | undefined): Promise<any> {
    const { name, remoteSnapshot, remote, origin } = this._options;

    if (entry) {
      const { buildVersion, globalName } = remoteSnapshot as ProviderModuleInfo;
      const uniqueKey = globalName || `${name}:${buildVersion}`;

      if (!this.global.entryLoading[uniqueKey]) {
        this.global.entryLoading[uniqueKey] = loadScript(entry, {});
      }
      return this.global.entryLoading[uniqueKey];
    } else {
      const remoteInfo = getRemoteInfo(remote as Remote);
      const module = origin!.moduleCache.get(remoteInfo.name);
      return getRemoteEntry({
        origin: origin!,
        remoteInfo,
        remoteEntryExports: module ? module.remoteEntryExports : undefined,
      });
    }
  }

  getProjectExports() {
    if (Object.keys(this._exports).length > 0) {
      return this._exports;
    }
    const { name } = this._options;
    const exportsPromiseFn = (
      globalThis.__FEDERATION__ as unknown as FederationWithPrefetch
    ).__PREFETCH__.__PREFETCH_EXPORTS__?.[name];
    const exportsPromise =
      typeof exportsPromiseFn === 'function'
        ? exportsPromiseFn()
        : exportsPromiseFn;
    const resolve = exportsPromise.then(
      (exports: Record<string, Record<string, any>> = {}) => {
        // Match prefetch based on the function name suffix so that other capabilities can be expanded later.
        // Not all functions should be directly identified as prefetch functions
        const memory: Record<string, Record<string, any>> = {};
        Object.keys(exports).forEach((key) => {
          memory[key] = {};
          const exportVal = exports[key];
          Object.keys(exportVal).reduce(
            (memo: Record<string, any>, current: string) => {
              if (
                current.toLocaleLowerCase().endsWith('prefetch') ||
                current.toLocaleLowerCase() === 'default'
              ) {
                memo[current] = exportVal[current];
              }
              return memo;
            },
            memory[key],
          );
        });
        this.memorizeExports(memory);
      },
    );
    return resolve;
  }

  memorizeExports(exports: Record<string, any>): void {
    this._exports = exports;
  }

  getExposeExports(id: string): PrefetchExports {
    const prefetchId = getPrefetchId(id);
    const compatId = compatGetPrefetchId(id);
    const prefetchExports =
      this._exports[prefetchId] || (this._exports[compatId] as PrefetchExports);
    return prefetchExports || {};
  }

  prefetch(prefetchOptions: prefetchOptions): any {
    const { id, functionId = 'default', refetchParams } = prefetchOptions;
    let prefetchResult;
    const prefetchId = getPrefetchId(id);
    const compatId = compatGetPrefetchId(id);
    const memorizeId = id + functionId;
    const memory = this.prefetchMemory.get(memorizeId);
    if (!this.checkOutdate(prefetchOptions) && memory) {
      return memory;
    }

    const prefetchExports =
      this._exports[prefetchId] || (this._exports[compatId] as PrefetchExports);
    if (!prefetchExports) {
      return;
    }
    const executePrefetch = prefetchExports[functionId];
    if (typeof executePrefetch === 'function') {
      if (refetchParams) {
        prefetchResult = executePrefetch(refetchParams);
      } else {
        prefetchResult = executePrefetch();
      }
    } else {
      throw new Error(
        `[Module Federation Data Prefetch]: No prefetch function called ${functionId} export in prefetch file`,
      );
    }
    this.memorize(memorizeId, prefetchResult);
    return prefetchResult;
  }

  memorize(id: string, value: any): void {
    this.prefetchMemory.set(id, value);
  }

  markOutdate(
    markOptions: Omit<prefetchOptions, 'cacheStrategy'>,
    isOutdate: boolean,
  ): void {
    const { id, functionId = 'default' } = markOptions;
    if (!this.recordOutdate[id]) {
      this.recordOutdate[id] = {};
    }
    this.recordOutdate[id][functionId] = isOutdate;
  }

  checkOutdate(outdateOptions: prefetchOptions): boolean {
    const { id, functionId = 'default', cacheStrategy } = outdateOptions;
    if (typeof cacheStrategy === 'function') {
      return cacheStrategy();
    }

    if (!this.recordOutdate[id]) {
      this.recordOutdate[id] = {};
    }
    if (this.recordOutdate[id][functionId]) {
      this.markOutdate(
        {
          id,
          functionId,
        },
        false,
      );
      return true;
    } else {
      return false;
    }
  }
}
