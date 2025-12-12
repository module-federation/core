import type { Module } from 'metro/src/DeltaBundler/types';

declare module 'metro/src/lib/getAppendScripts' {
  interface Options<T extends number | string> {
    asyncRequireModulePath: string;
    createModuleId: (path: string) => T;
    getRunModuleStatement: (moduleId: T) => string;
    inlineSourceMap?: boolean;
    runBeforeMainModule: readonly string[];
    runModule: boolean;
    shouldAddToIgnoreList: (module: Module) => boolean;
    sourceMapUrl?: string;
    sourceUrl?: string;
    getSourceUrl?: (module: Module) => string;
  }

  export default function getAppendScripts<T extends number | string>(
    entryPoint: string,
    modules: readonly Module[],
    options: Options<T>,
  ): readonly Module[];
}
