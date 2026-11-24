import type { ModuleFederation } from '@module-federation/runtime';

export type WebpackRequire = {
  (id: string): any;
  u: (chunkId: string) => string;
  p: string;
  m: { [key: string]: any };
  o: (obj: any, prop: string) => boolean;
  C?: (chunk: any) => void;
  l: (
    url: string,
    done: (res: any) => void,
    key: string,
    chunkId: string,
  ) => void;
  federation: {
    runtime: {
      loadScriptNode: (
        url: string,
        options: { attrs: { globalName: string } },
      ) => Promise<any>;
    };
    instance: ModuleFederation;
    chunkMatcher?: (chunkId: string) => boolean;
    rootOutputDir?: string;
    initOptions: {
      name: string;
      remotes: any;
    };
  };
  f?: {
    require?: (chunkId: string, promises: any[]) => void;
    readFileVm?: (chunkId: string, promises: any[]) => void;
  };
  O?: ((
    result?: any,
    chunkIds?: any[],
    fn?: () => any,
    priority?: number,
  ) => any) & {
    require?: (chunkId: string) => boolean;
    readFileVm?: (chunkId: string) => boolean;
  };
};

export type ChunkResolutionSource = 'public-path' | 'remote-entry-fallback';
export type ChunkLocationSource = 'filesystem' | 'remote-url';

export type ChunkUrlMetadata = {
  chunkName: string;
  publicPath?: string;
  remoteName?: string;
  rootOutputDir?: string;
  resolvedFrom: ChunkResolutionSource;
  remoteEntryUrl?: string;
};

export type ChunkTrackingOptions = {
  remoteChunkIds?: Set<string>;
  inflight?: Set<Promise<unknown>>;
  trackLoad?: <T>(run: () => Promise<T>) => Promise<T>;
};

export type NodeChunkState = {
  installedChunks: Record<string, any>;
  remoteChunkIds: Set<string>;
  inflight: Set<Promise<unknown>>;
  origin?: unknown;
  args?: any;
  handle?: (chunkId: string, promises: any[]) => void;
};

export const nodeChunkStateKey = Symbol.for(
  'module-federation.node.chunk-state',
);
