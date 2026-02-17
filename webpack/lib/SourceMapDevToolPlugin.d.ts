export = SourceMapDevToolPlugin;
declare class SourceMapDevToolPlugin {
    /**
     * @param {SourceMapDevToolPluginOptions=} options options object
     * @throws {Error} throws error, if got more than 1 arguments
     */
    constructor(options?: SourceMapDevToolPluginOptions | undefined);
    sourceMapFilename: string | false;
    /** @type {false | TemplatePath}} */
    sourceMappingURLComment: false | TemplatePath;
    moduleFilenameTemplate: string | ModuleFilenameHelpers.ModuleFilenameTemplateFunction;
    fallbackModuleFilenameTemplate: string | ModuleFilenameHelpers.ModuleFilenameTemplateFunction;
    namespace: string;
    options: import("../declarations/plugins/SourceMapDevToolPlugin").SourceMapDevToolPluginOptions;
    /**
     * Apply the plugin
     * @param {Compiler} compiler compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace SourceMapDevToolPlugin {
    export { MapOptions, Source, SourceMapDevToolPluginOptions, Rules, ItemCacheFacade, Chunk, Asset, AssetInfo, Compiler, Module, RawSourceMap, TemplatePath, OutputFileSystem, SourceMapTask };
}
import ModuleFilenameHelpers = require("./ModuleFilenameHelpers");
type MapOptions = import("webpack-sources").MapOptions;
type Source = import("webpack-sources").Source;
type SourceMapDevToolPluginOptions = import("../declarations/plugins/SourceMapDevToolPlugin").SourceMapDevToolPluginOptions;
type Rules = import("../declarations/plugins/SourceMapDevToolPlugin").Rules;
type ItemCacheFacade = import("./CacheFacade").ItemCacheFacade;
type Chunk = import("./Chunk");
type Asset = import("./Compilation").Asset;
type AssetInfo = import("./Compilation").AssetInfo;
type Compiler = import("./Compiler");
type Module = import("./Module");
type RawSourceMap = import("./NormalModule").RawSourceMap;
type TemplatePath = import("./TemplatedPathPlugin").TemplatePath;
type OutputFileSystem = import("./util/fs").OutputFileSystem;
type SourceMapTask = {
    asset: Source;
    assetInfo: AssetInfo;
    modules: (string | Module)[];
    source: string;
    file: string;
    sourceMap: RawSourceMap;
    /**
     * cache item
     */
    cacheItem: ItemCacheFacade;
};
