export = BaseUriRuntimeModule;
/** @typedef {import("../../declarations/WebpackOptions").EntryDescriptionNormalized} EntryDescription */
/** @typedef {import("../Chunk")} Chunk */
declare class BaseUriRuntimeModule extends RuntimeModule {
  constructor();
}
declare namespace BaseUriRuntimeModule {
  export { EntryDescription, Chunk };
}
import RuntimeModule = require('../RuntimeModule');
type EntryDescription =
  import('../../declarations/WebpackOptions').EntryDescriptionNormalized;
type Chunk = import('../Chunk');
