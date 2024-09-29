import type { Compiler } from 'webpack';
import type { ChunkLoadingType } from '../../declarations/WebpackOptions';

interface Options {
  asyncChunkLoading?: boolean;
}

declare class StartupChunkDependenciesPlugin {
  constructor(options: Options);
  apply(compiler: Compiler): void;
}

export = StartupChunkDependenciesPlugin;
