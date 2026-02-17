export = RecordIdsPlugin;
declare class RecordIdsPlugin {
  /**
   * @param {RecordIdsPluginOptions=} options object
   */
  constructor(options?: RecordIdsPluginOptions | undefined);
  options: RecordIdsPluginOptions;
  /**
   * @param {Compiler} compiler the Compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace RecordIdsPlugin {
  export {
    Chunk,
    Compiler,
    Module,
    RecordsChunks,
    RecordsModules,
    Records,
    RecordIdsPluginOptions,
    UsedIds,
  };
}
type Chunk = import('./Chunk');
type Compiler = import('./Compiler');
type Module = import('./Module');
type RecordsChunks = {
  byName?: Record<string, number> | undefined;
  bySource?: Record<string, number> | undefined;
  usedIds?: number[] | undefined;
};
type RecordsModules = {
  byIdentifier?: Record<string, number> | undefined;
  usedIds?: number[] | undefined;
};
type Records = {
  chunks?: RecordsChunks | undefined;
  modules?: RecordsModules | undefined;
};
type RecordIdsPluginOptions = {
  /**
   * true, when ids need to be portable
   */
  portableIds?: boolean | undefined;
};
type UsedIds = Set<number>;
