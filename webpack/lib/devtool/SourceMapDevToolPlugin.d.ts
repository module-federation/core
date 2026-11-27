export = SourceMapDevToolPlugin;
declare class SourceMapDevToolPlugin {
    /**
     * Creates an instance of SourceMapDevToolPlugin.
     * @param {SourceMapDevToolPluginOptions=} options options object
     * @throws {Error} throws error, if got more than 1 arguments
     */
    constructor(options?: SourceMapDevToolPluginOptions | undefined);
    /** @type {undefined | null | false | string} */
    sourceMapFilename: undefined | null | false | string;
    /** @type {false | SourceMappingURLComment} */
    sourceMappingURLComment: false | SourceMappingURLComment;
    /** @type {DevtoolModuleFilenameTemplate} */
    moduleFilenameTemplate: DevtoolModuleFilenameTemplate;
    /** @type {DevtoolFallbackModuleFilenameTemplate} */
    fallbackModuleFilenameTemplate: DevtoolFallbackModuleFilenameTemplate;
    /** @type {DevtoolNamespace} */
    namespace: DevtoolNamespace;
    /** @type {SourceMapDevToolPluginOptions} */
    options: SourceMapDevToolPluginOptions;
    /** @type {string} */
    _cacheSalt: string;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace SourceMapDevToolPlugin {
    export { NonEmptyRelativePath, NonEmptyString, RulesBranch1Item, SourceMapDevToolPluginOptionsAppendBranch1, SourceMapDevToolPluginOptionsFallbackModuleFilenameTemplateBranch2, SourceMapDevToolPluginOptionsFilenameBranch1, SourceMapDevToolPluginOptionsModuleFilenameTemplateBranch2, RuleGlobPattern, RuleGlobList, RuleGlob, Rule, Rules, SourceMapDevToolPluginOptionsScopes, SourceMapDevToolPluginOptions, SourceMapTask, CacheKeyOption, CacheKeyValues, CacheKeyValue };
}
import type { TemplatePath as SourceMappingURLComment } from "../template/TemplatedPathPlugin";
import type { DevtoolModuleFilenameTemplate } from "../../declarations/WebpackOptions";
import type { DevtoolFallbackModuleFilenameTemplate } from "../../declarations/WebpackOptions";
import type { DevtoolNamespace } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
type NonEmptyRelativePath = string;
type NonEmptyString = string;
/**
 * A rule condition.
 */
type RulesBranch1Item = Rule;
/**
 * Append no SourceMap comment to the bundle, but still generate SourceMaps.
 */
type SourceMapDevToolPluginOptionsAppendBranch1 = (false | null);
/**
 * Custom function generating the identifier.
 */
type SourceMapDevToolPluginOptionsFallbackModuleFilenameTemplateBranch2 = import("./ModuleFilenameHelpers").ModuleFilenameTemplateFunction;
/**
 * Disable separate SourceMap file and inline SourceMap as DataUrl.
 */
type SourceMapDevToolPluginOptionsFilenameBranch1 = (false | null);
/**
 * Custom function generating the identifier.
 */
type SourceMapDevToolPluginOptionsModuleFilenameTemplateBranch2 = import("./ModuleFilenameHelpers").ModuleFilenameTemplateFunction;
/**
 * A glob pattern.
 */
type RuleGlobPattern = string;
type RuleGlobList = RuleGlobPattern[];
/**
 * Glob patterns matched against the file name, `!` in front of a pattern excludes it, and a relative pattern matches at any depth.
 */
type RuleGlob = {
    /**
     * Glob patterns to match.
     */
    glob: RuleGlobList | NonEmptyString;
};
/**
 * Condition used to match resource (string, RegExp or Function).
 */
type Rule = RegExp | NonEmptyString | RuleGlob | import("./ModuleFilenameHelpers").MatcherFn;
/**
 * One or multiple conditions used to match resource.
 */
type Rules = RulesBranch1Item[] | Rule;
/**
 * Emit the 'scopes' field, which tells a debugger the generated expression each imported ESM binding reads, so it resolves under the name the source uses.
 */
type SourceMapDevToolPluginOptionsScopes = boolean;
type SourceMapDevToolPluginOptions = {
    /**
     * Appends the given value to the original asset. Usually the #sourceMappingURL comment. [url] is replaced with a URL to the source map file. false disables the appending.
     */
    append?: (SourceMapDevToolPluginOptionsAppendBranch1 | NonEmptyString | import("../template/TemplatedPathPlugin").TemplatePathFn) | undefined;
    /**
     * Indicates whether column mappings should be used (defaults to true).
     */
    columns?: boolean | undefined;
    /**
     * Emit debug IDs into source and SourceMap.
     */
    debugIds?: boolean | undefined;
    /**
     * Exclude modules that match the given value from source map generation.
     */
    exclude?: Rules | undefined;
    /**
     * Generator string or function to create identifiers of modules for the 'sources' array in the SourceMap used only if 'moduleFilenameTemplate' would result in a conflict.
     */
    fallbackModuleFilenameTemplate?: (NonEmptyString | SourceMapDevToolPluginOptionsFallbackModuleFilenameTemplateBranch2) | undefined;
    /**
     * Path prefix to which the [file] placeholder is relative to.
     */
    fileContext?: string | undefined;
    /**
     * Defines the output filename of the SourceMap (will be inlined if no value is provided).
     */
    filename?: (SourceMapDevToolPluginOptionsFilenameBranch1 | NonEmptyRelativePath) | undefined;
    /**
     * Decide whether to ignore source files that match the specified value in the SourceMap.
     */
    ignoreList?: Rules | undefined;
    /**
     * Include source maps for module paths that match the given value.
     */
    include?: Rules | undefined;
    /**
     * Indicates whether SourceMaps from loaders should be used (defaults to true).
     */
    module?: boolean | undefined;
    /**
     * Generator string or function to create identifiers of modules for the 'sources' array in the SourceMap.
     */
    moduleFilenameTemplate?: (NonEmptyString | SourceMapDevToolPluginOptionsModuleFilenameTemplateBranch2) | undefined;
    /**
     * Namespace prefix to allow multiple webpack roots in the devtools.
     */
    namespace?: string | undefined;
    /**
     * Omit the 'sourceContents' array from the SourceMap.
     */
    noSources?: boolean | undefined;
    /**
     * Provide a custom public path for the SourceMapping comment.
     */
    publicPath?: string | undefined;
    scopes?: SourceMapDevToolPluginOptionsScopes | undefined;
    /**
     * Provide a custom value for the 'sourceRoot' property in the SourceMap.
     */
    sourceRoot?: string | undefined;
    /**
     * Include source maps for modules based on their extension (defaults to .js and .css).
     */
    test?: Rules | undefined;
};
/**
 * Defines the source map task type used by this module.
 */
type SourceMapTask = {
    assetInfo: Compilation.AssetInfo;
    modules: (string | Module)[];
    source: string;
    file: string;
    sourceMap: RawSourceMap;
    /**
     * the Source instance whose `sourceAndMap` we called (the current asset or, when its map was already stripped, the pinned original from `originalSources`) — what `clearCache` should target
     */
    mapSource: Source;
    /**
     * cache item
     */
    cacheItem: InstanceType<{
        new (cache: import("../cache/Cache"), name: string, etag: import("../cache/Cache").Etag | null): {
            _cache: import("../cache/Cache");
            _name: string;
            _etag: import("../cache/Cache").Etag | null;
            get<T>(callback: CallbackCache<T>): void;
            getPromise<T>(): Promise<T>;
            store<T>(data: T, callback: CallbackCache<void>): void;
            storePromise<T>(data: T): Promise<void>;
            provide<T>(computer: (callback: import("../cache/CacheFacade").CallbackNormalErrorCache<T>) => void, callback: import("../cache/CacheFacade").CallbackNormalErrorCache<T>): void;
            providePromise<T>(computer: () => T | Promise<T>): Promise<T>;
        };
    }>;
};
type CacheKeyOption = SourceMapDevToolPluginOptions["filename"] | SourceMapDevToolPluginOptions["append"] | Rules | DevtoolModuleFilenameTemplate | DevtoolFallbackModuleFilenameTemplate | DevtoolNamespace;
type CacheKeyValues = CacheKeyValue[];
type CacheKeyValue = string | false | null | undefined | RuleGlob | CacheKeyValues;
import Compilation = require("../Compilation");
import type Module from "../module/Module";
import type { RawSourceMap } from "webpack-sources";
import type { Source } from "webpack-sources";
