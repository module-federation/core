export = SSRManifestPlugin;
declare class SSRManifestPlugin {
    /**
     * Creates an instance of SSRManifestPlugin.
     * @param {SSRManifestPluginOptions=} options options
     */
    constructor(options?: SSRManifestPluginOptions | undefined);
    /** @type {SSRManifestPluginOptions} */
    options: SSRManifestPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace SSRManifestPlugin {
    export { NonEmptyRelativePath, AbsolutePath, SSRManifestContext, SSRManifestFilename, SSRManifestPluginOptions };
}
import type Compiler from "../Compiler";
type NonEmptyRelativePath = string;
type AbsolutePath = string;
/**
 * The base directory used to compute the source-module keys (defaults to the compiler context).
 */
type SSRManifestContext = AbsolutePath;
/**
 * Specifies the filename of the emitted manifest on disk. By default the plugin will emit `ssr-manifest.json` inside the 'output.path' directory.
 */
type SSRManifestFilename = NonEmptyRelativePath;
type SSRManifestPluginOptions = {
    context?: SSRManifestContext | undefined;
    filename?: SSRManifestFilename | undefined;
};
