import type { Federation as GlobalDeclare } from '@module-federation/runtime';
import {
  loadScript,
  getPrefetchId,
  ModuleInfo,
  ProviderModuleInfo,
  error,
} from '@module-federation/sdk';

import { nativeGlobal } from './utils';

declare module '@module-federation/runtime' {
  export interface Federation {
    __PREFETCH__: {
      entryLoading: Record<string, undefined | Promise<void>>;
      instance: Map<string, FederationPrefetch>;
      __PREFETCH_EXPORTS__: Record<string, Promise<Record<string, any>>>;
    };
  }

  export interface __VMOK__ {
    __PREFETCH__: {
      entryLoading: Record<string, undefined | Promise<void>>;
      instance: Map<string, FederationPrefetch>;
      __PREFETCH_EXPORTS__: Record<string, Promise<Record<string, any>>>;
    };
  }
}

type PrefetchExports = Record<string, any>;

export interface FederationPrefetchOptions {
  name: string;
  remoteSnapshot?: ModuleInfo;
}

export interface prefetchOptions {
  id: string;
  functionId: string;
  cacheStrategy?: () => boolean;
  refetchParams?: any;
}

nativeGlobal.__FEDERATION__.__PREFETCH__ ??= {
  entryLoading: {},
  instance: new Map(),
  __PREFETCH_EXPORTS__: {},
};
export class FederationPrefetch {
  public prefetchMemory: Map<string, Promise<any>>;
  public recordOutdate: Record<string, Record<string, boolean>>;
  private _exports: Record<string, any>;
  private _options: FederationPrefetchOptions;

  constructor(options: FederationPrefetchOptions) {
    this.prefetchMemory = new Map();
    this.recordOutdate = {};
    this._exports = {};
    this._options = options;
    this.global.instance.set(options.name, this);
  }

  get global(): Record<string, any> {
    return globalThis.__FEDERATION__.__PREFETCH__;
  }

  static getInstance(id: string): FederationPrefetch | undefined {
    return globalThis.__FEDERATION__.__PREFETCH__.instance.get(id);
  }

  async loadEntry(url: string): Promise<void> {
    const { name, remoteSnapshot } = this._options;

    const { buildVersion, globalName } = remoteSnapshot as ProviderModuleInfo;

    const uniqueKey = globalName || `${name}:${buildVersion}`;

    if (!this.global.entryLoading[uniqueKey]) {
      this.global.entryLoading[uniqueKey] = loadScript(url, {});
    }
    return this.global.entryLoading[uniqueKey];
  }

  getProjectExports() {
    if (Object.keys(this._exports).length > 0) {
      return this._exports;
    }
    const { name } = this._options;
    const exportsP = window.__FEDERATION__.__PREFETCH__.__PREFETCH_EXPORTS__?.[name];
    const resolve = exportsP.then((exports: Record<string, any>) => {
      // TODO 需要根据函数名后缀匹配 prefetch，以便后续拓展其他能力，不应直接将所有函数都识别为 prefetch 函数
      this.memorizeExports(exports);
    });
    return resolve;
  }

  memorizeExports(exports: Record<string, any>): void {
    this._exports = exports;
  }

  getExposeExports(id: string): PrefetchExports {
    const prefetchId = getPrefetchId(id);
    const prefetchExports = this._exports[prefetchId] as PrefetchExports;
    return prefetchExports || {};
  }

  prefetch(prefetchOptions: prefetchOptions): any {
    const { id, functionId, refetchParams } = prefetchOptions;
    let prefetchResult;
    const prefetchId = getPrefetchId(id);
    const memorizeId = id + functionId;
    const memory = this.prefetchMemory.get(memorizeId);
    if (!this.checkOutdate(prefetchOptions) && memory) {
      return memory;
    }

    const prefetchExports = this._exports[prefetchId] as PrefetchExports;
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
      error(`No prefetch function called ${functionId} export in prefetch file`)
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
    const { id, functionId } = markOptions;
    if (!this.recordOutdate[id]) {
      this.recordOutdate[id] = {};
    }
    this.recordOutdate[id][functionId] = isOutdate;
  }

  checkOutdate(outdateOptions: prefetchOptions): boolean {
    const { id, functionId, cacheStrategy } = outdateOptions;
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
