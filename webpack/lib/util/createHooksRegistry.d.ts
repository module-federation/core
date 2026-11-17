export = createHooksRegistry;
/**
 * @template T
 * @param {() => T} createHooks factory that returns a fresh hooks object
 * @returns {(compilation: import("../Compilation")) => T} getter that returns (or creates) hooks for the compilation
 */
declare function createHooksRegistry<T>(createHooks: () => T): (compilation: import("../Compilation")) => T;
