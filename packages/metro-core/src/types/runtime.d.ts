import type runtimeCore from '@module-federation/runtime/core';

type RemoteEntryExports = runtimeCore.types.RemoteEntryExports;

declare module '@module-federation/runtime' {
  interface Federation {
    __NATIVE__: {
      [key: string]: {
        deps: {
          shared: Record<string, string[]>;
          remotes: Record<string, string[]>;
        };
        exports: RemoteEntryExports;
        init: Promise<void>;
        origin: string;
      };
    };
  }
}
