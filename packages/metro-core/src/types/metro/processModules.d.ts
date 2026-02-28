import type { Module } from 'metro/src/DeltaBundler/types';

declare module 'metro/src/DeltaBundler/Serializers/helpers/processModules' {
  interface Options {
    filter?: (module: Module) => boolean;
    createModuleId: (path: string) => number;
    dev: boolean;
    includeAsyncPaths: boolean;
    projectRoot: string;
    serverRoot: string;
    sourceUrl?: string;
  }

  export default function processModules(
    modules: readonly Module[],
    options: Options,
  ): readonly [Module, string][];
}
