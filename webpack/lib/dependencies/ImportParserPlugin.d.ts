export = ImportParserPlugin;
/** @typedef {import("../../declarations/WebpackOptions").JavascriptParserOptions} JavascriptParserOptions */
/** @typedef {import("../ChunkGroup").RawChunkGroupOptions} RawChunkGroupOptions */
/** @typedef {import("../ContextModule").ContextMode} ContextMode */
/** @typedef {import("../Dependency").DependencyLocation} DependencyLocation */
/** @typedef {import("../Module").BuildMeta} BuildMeta */
/** @typedef {import("../javascript/JavascriptParser")} JavascriptParser */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
declare class ImportParserPlugin {
  /**
   * @param {JavascriptParserOptions} options options
   */
  constructor(options: JavascriptParserOptions);
  options: import('../../declarations/WebpackOptions').JavascriptParserOptions;
  /**
   * @param {JavascriptParser} parser the parser
   * @returns {void}
   */
  apply(parser: JavascriptParser): void;
}
declare namespace ImportParserPlugin {
  export {
    JavascriptParserOptions,
    RawChunkGroupOptions,
    ContextMode,
    DependencyLocation,
    BuildMeta,
    JavascriptParser,
    Range,
  };
}
type JavascriptParser = import('../javascript/JavascriptParser');
type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
type RawChunkGroupOptions = import('../ChunkGroup').RawChunkGroupOptions;
type ContextMode = import('../ContextModule').ContextMode;
type DependencyLocation = import('../Dependency').DependencyLocation;
type BuildMeta = import('../Module').BuildMeta;
type Range = import('../javascript/JavascriptParser').Range;
