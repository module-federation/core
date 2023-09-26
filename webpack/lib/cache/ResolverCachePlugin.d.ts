export = ResolverCachePlugin;
declare class ResolverCachePlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ResolverCachePlugin {
  export { Resolver, ItemCacheFacade, Compiler, FileSystemInfo, Snapshot };
}
type Compiler = import('../Compiler');
type Resolver = any;
type ItemCacheFacade = import('../CacheFacade').ItemCacheFacade;
type FileSystemInfo = import('../FileSystemInfo');
type Snapshot = import('../FileSystemInfo').Snapshot;
