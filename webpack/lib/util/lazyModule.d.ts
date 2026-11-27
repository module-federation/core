export = lazyModule;
/**
 * Declares a module that loads on first use, in the shape a dynamic `import()`
 * has: the accessor resolves to the module and the caller awaits it. The thunk
 * is a `require` until `lib/` moves to ecma modules, which changes that keyword
 * and nothing else — `Promise.resolve` already passes an `import()` promise
 * through. It is never called outside the promise, so nothing here needs a
 * synchronous load.
 *
 * `loaded` reads the module back for a consumer with nowhere to await — a
 * synchronous hook, a dependency template, a generator. It throws until an
 * awaited call has resolved, so every such consumer must sit behind one
 * (`NormalModuleFactory`'s `prepareModuleType`, `Compilation`'s pending runtime
 * modules). A module with no such boundary is required at the top of its file
 * instead of being declared here.
 * @template T
 * @param {() => T | Promise<T>} load loads the module
 * @returns {LazyModuleAccessor<T>} resolves the module, loading it once
 */
declare function lazyModule<T>(load: () => T | Promise<T>): LazyModuleAccessor<T>;
declare namespace lazyModule {
    export { LazyModuleAccessor };
}
type LazyModuleAccessor<T> = (() => Promise<T>) & {
    loaded: () => T;
};
