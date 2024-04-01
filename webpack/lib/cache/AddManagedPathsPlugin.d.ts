export = AddManagedPathsPlugin;
/** @typedef {import("../Compiler")} Compiler */
declare class AddManagedPathsPlugin {
  /**
   * @param {Iterable<string | RegExp>} managedPaths list of managed paths
   * @param {Iterable<string | RegExp>} immutablePaths list of immutable paths
   */
  constructor(
    managedPaths: Iterable<string | RegExp>,
    immutablePaths: Iterable<string | RegExp>,
  );
  managedPaths: Set<string | RegExp>;
  immutablePaths: Set<string | RegExp>;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace AddManagedPathsPlugin {
  export { Compiler };
}
type Compiler = import('../Compiler');
