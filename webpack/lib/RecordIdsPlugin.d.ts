export = RecordIdsPlugin;
/** @typedef {import("./Chunk")} Chunk */
/** @typedef {import("./Compiler")} Compiler */
/** @typedef {import("./Module")} Module */
/**
 * @typedef {Object} RecordsChunks
 * @property {Record<string, number>=} byName
 * @property {Record<string, number>=} bySource
 * @property {number[]=} usedIds
 */
/**
 * @typedef {Object} RecordsModules
 * @property {Record<string, number>=} byIdentifier
 * @property {Record<string, number>=} bySource
 * @property {number[]=} usedIds
 */
/**
 * @typedef {Object} Records
 * @property {RecordsChunks=} chunks
 * @property {RecordsModules=} modules
 */
declare class RecordIdsPlugin {
  /**
   * @param {Object} options Options object
   * @param {boolean=} options.portableIds true, when ids need to be portable
   */
  constructor(options: { portableIds?: boolean | undefined });
  options: {
    portableIds?: boolean | undefined;
  };
  /**
   * @param {Compiler} compiler the Compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace RecordIdsPlugin {
  export { Chunk, Compiler, Module, RecordsChunks, RecordsModules, Records };
}
type Compiler = import('./Compiler');
type Chunk = import('./Chunk');
type Module = import('./Module');
type RecordsChunks = {
  byName?: Record<string, number> | undefined;
  bySource?: Record<string, number> | undefined;
  usedIds?: number[] | undefined;
};
type RecordsModules = {
  byIdentifier?: Record<string, number> | undefined;
  bySource?: Record<string, number> | undefined;
  usedIds?: number[] | undefined;
};
type Records = {
  chunks?: RecordsChunks | undefined;
  modules?: RecordsModules | undefined;
};
