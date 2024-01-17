declare global {
  namespace NodeJS {
    interface Global {
      usedChunks: Set<string>;
      flushChunks: () => Promise<Array<string>>;
      __remote_scope__: {
        _config: Record<string, any>;
        _medusa?: Record<string, any>;
        [K: string]: {
          fake?: boolean;
        };
      };
      webpackChunkLoad: () => any;

      __FEDERATION__: {
        __INSTANCES__: Array<{
          moduleCache?: Map<string, Module>;
        }>;
      };
    }
  }

  var __FEDERATION__: {
    __INSTANCES__: Array<{
      moduleCache?: Map<string, Module>;
    }>;
  };
}
