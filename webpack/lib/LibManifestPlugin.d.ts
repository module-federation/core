export = LibManifestPlugin;
/** @typedef {import("./Compiler")} Compiler */
/** @typedef {import("./Module").BuildMeta} BuildMeta */
/**
 * @typedef {Object} ManifestModuleData
 * @property {string | number} id
 * @property {BuildMeta} buildMeta
 * @property {boolean | string[] | undefined} exports
 */
/**
 * @typedef {Object} LibManifestPluginOptions
 * @property {string=} context Context of requests in the manifest file (defaults to the webpack context).
 * @property {boolean=} entryOnly If true, only entry points will be exposed (default: true).
 * @property {boolean=} format If true, manifest json file (output) will be formatted.
 * @property {string=} name Name of the exposed dll function (external name, use value of 'output.library').
 * @property {string} path Absolute path to the manifest json file (output).
 * @property {string=} type Type of the dll bundle (external type, use value of 'output.libraryTarget').
 */
declare class LibManifestPlugin {
  /**
   * @param {LibManifestPluginOptions} options the options
   */
  constructor(options: LibManifestPluginOptions);
  options: LibManifestPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace LibManifestPlugin {
  export { Compiler, BuildMeta, ManifestModuleData, LibManifestPluginOptions };
}
type LibManifestPluginOptions = {
  /**
   * Context of requests in the manifest file (defaults to the webpack context).
   */
  context?: string | undefined;
  /**
   * If true, only entry points will be exposed (default: true).
   */
  entryOnly?: boolean | undefined;
  /**
   * If true, manifest json file (output) will be formatted.
   */
  format?: boolean | undefined;
  /**
   * Name of the exposed dll function (external name, use value of 'output.library').
   */
  name?: string | undefined;
  /**
   * Absolute path to the manifest json file (output).
   */
  path: string;
  /**
   * Type of the dll bundle (external type, use value of 'output.libraryTarget').
   */
  type?: string | undefined;
};
type Compiler = import('./Compiler');
type BuildMeta = import('./Module').BuildMeta;
type ManifestModuleData = {
  id: string | number;
  buildMeta: BuildMeta;
  exports: boolean | string[] | undefined;
};
