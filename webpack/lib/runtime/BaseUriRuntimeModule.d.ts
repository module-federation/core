export = BaseUriRuntimeModule;
/** @typedef {import("../../declarations/WebpackOptions").EntryDescriptionNormalized} EntryDescriptionNormalized */
/** @typedef {import("../Chunk")} Chunk */
declare class BaseUriRuntimeModule extends RuntimeModule {
  constructor();
}
declare namespace BaseUriRuntimeModule {
  export { EntryDescriptionNormalized, Chunk };
}
import RuntimeModule = require('../RuntimeModule');
type EntryDescriptionNormalized =
  import('../../declarations/WebpackOptions').EntryDescriptionNormalized;
type Chunk = import('../Chunk');
