export = AssetGenerator;
/**
 * The module type the JSDoc inherited from `Generator` names.
 * @typedef {AssetNormalModule} TModule
 */
/**
 * @extends {Generator<TModule>}
 */
declare class AssetGenerator extends Generator<AssetNormalModule> {
    /**
     * Gets source file name.
     * @param {TModule} module module
     * @param {RuntimeTemplate} runtimeTemplate runtime template
     * @returns {string} source file name
     */
    static getSourceFileName(module: TModule, runtimeTemplate: RuntimeTemplate): string;
    /**
     * The resource this asset is named after, which something that re-encoded it
     * may have changed. Its emitted name and inlined media type both read this.
     * @param {TModule} module module
     * @returns {string} the resource
     */
    static getAssetResource(module: TModule): string;
    /**
     * Gets the source file name as seen by a filename template. With
     * `experiments.futureDefaults` (the next major release's default) `[path]` and `[file]` of a
     * module outside of `context` behave like `[containedpath]`/`[containedfile]`,
     * so they can't emit the asset outside of `output.path`.
     * @param {TModule} module module
     * @param {RuntimeTemplate} runtimeTemplate runtime template
     * @returns {string} source file name for the filename template
     */
    static getTemplateSourceFileName(module: TModule, runtimeTemplate: RuntimeTemplate): string;
    /**
     * Gets full content hash.
     * @param {TModule} module module
     * @param {RuntimeTemplate} runtimeTemplate runtime template
     * @returns {[string, string]} return full hash and non-numeric full hash
     */
    static getFullContentHash(module: TModule, runtimeTemplate: RuntimeTemplate): [string, string];
    /**
     * Gets filename with info.
     * @param {TModule} module module for which the code should be generated
     * @param {Pick<AssetResourceGeneratorOptions, "filename" | "outputPath">} generatorOptions generator options
     * @param {{ runtime: RuntimeSpec, runtimeTemplate: RuntimeTemplate, chunkGraph: ChunkGraph }} generateContext context for generate
     * @param {string} contentHash the content hash
     * @param {string=} fullContentHash untruncated content hash, so `[contenthash:<digest>]` re-encodes from full entropy
     * @returns {{ filename: string, originalFilename: string, assetInfo: AssetInfo }} info
     */
    static getFilenameWithInfo(module: TModule, generatorOptions: Pick<AssetResourceGeneratorOptions, "filename" | "outputPath">, { runtime, runtimeTemplate, chunkGraph }: {
        runtime: RuntimeSpec;
        runtimeTemplate: RuntimeTemplate;
        chunkGraph: ChunkGraph;
    }, contentHash: string, fullContentHash?: string | undefined): {
        filename: string;
        originalFilename: string;
        assetInfo: Compilation.AssetInfo;
    };
    /**
     * Gets asset path with info.
     * @param {TModule} module module for which the code should be generated
     * @param {Pick<AssetResourceGeneratorOptions, "publicPath">} generatorOptions generator options
     * @param {GenerateContext} generateContext context for generate
     * @param {string} filename the filename
     * @param {AssetInfo} assetInfo the asset info
     * @param {string} contentHash the content hash
     * @param {string=} fullContentHash untruncated content hash, so `[contenthash:<digest>]` re-encodes from full entropy
     * @returns {{ assetPath: string, assetInfo: AssetInfo }} asset path and info
     */
    static getAssetPathWithInfo(module: TModule, generatorOptions: Pick<AssetResourceGeneratorOptions, "publicPath">, { runtime, runtimeTemplate, type, chunkGraph, runtimeRequirements }: Generator.GenerateContext, filename: string, assetInfo: Compilation.AssetInfo, contentHash: string, fullContentHash?: string | undefined): {
        assetPath: string;
        assetInfo: Compilation.AssetInfo;
    };
    /**
     * Creates an instance of AssetGenerator.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {AssetGeneratorOptions["dataUrl"]=} dataUrlOptions the options for the data url
     * @param {AssetModuleFilename=} filename override for output.assetModuleFilename
     * @param {RawPublicPath=} publicPath override for output.assetModulePublicPath
     * @param {AssetModuleOutputPath=} outputPath the output path for the emitted file which is not included in the runtime import
     * @param {boolean=} emit generate output asset
     * @param {Compilation=} compilation the compilation (`getTypes` has no generate context, so the analyzable-output decision reads `output.module`/`output.publicPath` from here)
     */
    constructor(moduleGraph: ModuleGraph, dataUrlOptions?: AssetGeneratorOptions["dataUrl"] | undefined, filename?: AssetModuleFilename | undefined, publicPath?: RawPublicPath | undefined, outputPath?: AssetModuleOutputPath | undefined, emit?: boolean | undefined, compilation?: Compilation | undefined);
    /** @type {AssetGeneratorOptions["dataUrl"] | undefined} */
    dataUrlOptions: AssetGeneratorOptions["dataUrl"] | undefined;
    /** @type {AssetModuleFilename | undefined} */
    filename: AssetModuleFilename | undefined;
    /** @type {RawPublicPath | undefined} */
    publicPath: RawPublicPath | undefined;
    /** @type {AssetModuleOutputPath | undefined} */
    outputPath: AssetModuleOutputPath | undefined;
    /** @type {boolean | undefined} */
    emit: boolean | undefined;
    /** @type {Compilation | undefined} */
    _compilation: Compilation | undefined;
    /** @type {ModuleGraph} */
    _moduleGraph: ModuleGraph;
    /**
     * Returns mime type.
     * @param {TModule} module module
     * @returns {string} mime type
     */
    getMimeType(module: TModule): string;
    /**
     * Offer the payload to `renderEmbeddedSource` before it is encoded, so the
     * encoding covers what came back. Declines what names no language, and a
     * `dataUrl` function, which is handed the source itself.
     * @param {TModule} module the module holding the payload
     * @param {GenerateContext["runtimeTemplate"]} runtimeTemplate runtime template
     * @returns {Source | undefined} the rendered payload, when one came back
     */
    _renderEmbedded(module: TModule, runtimeTemplate: Generator.GenerateContext["runtimeTemplate"]): Source | undefined;
    /**
     * Generates data uri.
     * @param {TModule} module module for which the code should be generated
     * @param {Source=} renderedSource the payload to encode, when a hook rendered it
     * @returns {string} DataURI
     */
    generateDataUri(module: TModule, renderedSource?: Source | undefined): string;
    /**
     * Generates fallback output for the provided error condition.
     * @param {Error} error the error
     * @param {TModule} module module for which the code should be generated
     * @param {GenerateContext} generateContext context for generate
     * @returns {Source | null} generated code
     */
    generateError(error: Error, module: TModule, generateContext: Generator.GenerateContext): Source | null;
    /**
     * Returns whether the effective publicPath yields a chunk-independent absolute
     * url (scheme-relative, protocol-absolute, or root-absolute) with no hash tokens.
     * Only then is a `new URL` literal correct for every chunk the asset is shared by,
     * so the `module.exports` wrapper can be dropped in favor of the `asset-url` type.
     * @returns {boolean} true when the publicPath is a token-free absolute string
     */
    _hasAbsolutePublicPath(): boolean;
}
declare namespace AssetGenerator {
    export { DataUrlFunction, TModule };
}
import type { AssetNormalModule } from "./AssetModule";
import Generator = require("../module/Generator");
import type { AssetGeneratorOptions } from "../../declarations/WebpackOptions";
import type { AssetModuleFilename } from "../../declarations/WebpackOptions";
import type { RawPublicPath } from "../../declarations/WebpackOptions";
import type { AssetModuleOutputPath } from "../../declarations/WebpackOptions";
import type Compilation from "../Compilation";
import type ModuleGraph from "../graph/ModuleGraph";
import type { Source } from "webpack-sources";
import type RuntimeTemplate from "../template/RuntimeTemplate";
import type { AssetResourceGeneratorOptions } from "../../declarations/WebpackOptions";
import type { RuntimeSpec } from "../util/runtime";
import type ChunkGraph from "../graph/ChunkGraph";
type DataUrlFunction = (source: string | Buffer, context: {
    filename: string;
    module: Module;
}) => string;
/**
 * The module type the JSDoc inherited from `Generator` names.
 */
type TModule = AssetNormalModule;
import type Module from "../module/Module";
