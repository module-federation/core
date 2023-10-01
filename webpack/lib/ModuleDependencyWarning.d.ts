export = ModuleDependencyWarning;
/** @typedef {import("./Dependency").DependencyLocation} DependencyLocation */
/** @typedef {import("./Module")} Module */
declare class ModuleDependencyWarning extends WebpackError {
  /**
   * @param {Module} module module tied to dependency
   * @param {Error} err error thrown
   * @param {DependencyLocation} loc location of dependency
   */
  constructor(module: Module, err: Error, loc: DependencyLocation);
  /** error is not (de)serialized, so it might be undefined after deserialization */
  error: Error;
}
declare namespace ModuleDependencyWarning {
  export { DependencyLocation, Module };
}
import WebpackError = require('./WebpackError');
type Module = import('./Module');
type DependencyLocation = import('./Dependency').DependencyLocation;
