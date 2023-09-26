export = AsyncDependencyToInitialChunkError;
/** @typedef {import("./Dependency").DependencyLocation} DependencyLocation */
/** @typedef {import("./Module")} Module */
declare class AsyncDependencyToInitialChunkError extends WebpackError {
  /**
   * Creates an instance of AsyncDependencyToInitialChunkError.
   * @param {string} chunkName Name of Chunk
   * @param {Module} module module tied to dependency
   * @param {DependencyLocation} loc location of dependency
   */
  constructor(chunkName: string, module: Module, loc: DependencyLocation);
}
declare namespace AsyncDependencyToInitialChunkError {
  export { DependencyLocation, Module };
}
import WebpackError = require('./WebpackError');
type Module = import('./Module');
type DependencyLocation = import('./Dependency').DependencyLocation;
