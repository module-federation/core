export = ModuleDependencyWarning;
/** @typedef {import("./Dependency").DependencyLocation} DependencyLocation */
/** @typedef {import("./Module")} Module */
/** @typedef {import("./ModuleDependencyError").ErrorWithHideStack} ErrorWithHideStack */
declare class ModuleDependencyWarning extends WebpackError {
  /**
   * @param {Module} module module tied to dependency
   * @param {ErrorWithHideStack} err error thrown
   * @param {DependencyLocation} loc location of dependency
   */
  constructor(module: Module, err: ErrorWithHideStack, loc: DependencyLocation);
  /** error is not (de)serialized, so it might be undefined after deserialization */
  error: import('./ModuleBuildError').ErrorWithHideStack;
  stack: string;
}
declare namespace ModuleDependencyWarning {
  export { DependencyLocation, Module, ErrorWithHideStack };
}
import WebpackError = require('./WebpackError');
type DependencyLocation = import('./Dependency').DependencyLocation;
type Module = import('./Module');
type ErrorWithHideStack = import('./ModuleDependencyError').ErrorWithHideStack;
