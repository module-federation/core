export = ManifestPlugin;
declare class ManifestPlugin {
  /**
   * @param {ManifestPluginOptions} options options
   */
  constructor(options: ManifestPluginOptions);
  /** @type {ManifestPluginOptions & Required<Omit<ManifestPluginOptions, "filter" | "generate">>} */
  options: ManifestPluginOptions &
    Required<Omit<ManifestPluginOptions, 'filter' | 'generate'>>;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ManifestPlugin {
  export {
    Compiler,
    Chunk,
    ChunkName,
    ChunkId,
    Asset,
    AssetInfo,
    ManifestPluginOptions,
    ManifestObject,
    ManifestEntrypoint,
    ManifestItem,
  };
}
type Compiler = import('./Compiler');
type Chunk = import('./Chunk');
type ChunkName = import('./Chunk').ChunkName;
type ChunkId = import('./Chunk').ChunkId;
type Asset = import('./Compilation').Asset;
type AssetInfo = import('./Compilation').AssetInfo;
type ManifestPluginOptions =
  import('../declarations/plugins/ManifestPlugin').ManifestPluginOptions;
type ManifestObject =
  import('../declarations/plugins/ManifestPlugin').ManifestObject;
type ManifestEntrypoint =
  import('../declarations/plugins/ManifestPlugin').ManifestEntrypoint;
type ManifestItem =
  import('../declarations/plugins/ManifestPlugin').ManifestItem;
