export = HtmlParser;
/**
 * @extends {Parser<BuiltHtmlModule>}
 */
declare class HtmlParser extends Parser<BuiltHtmlModule> {
    /**
     * Creates an instance of HtmlParser.
     * @param {HtmlParserOptions} options parser options (from `module.parser.html`; always passed by the `createParser` hook)
     */
    constructor(options: HtmlParserOptions);
    magicCommentContext: import("node:vm").Context;
    /** @type {HtmlTemplateFunction | undefined} */
    template: HtmlTemplateFunction | undefined;
    /** @type {import("../../declarations/WebpackOptions").UrlHintRule[] | undefined} */
    _urlHints: import("../../declarations/WebpackOptions").UrlHintRule[] | undefined;
    /** @type {string | HtmlChunkNameFn | undefined} */
    _chunkName: string | HtmlChunkNameFn | undefined;
    /** @type {string | undefined} */
    fragmentContext: string | undefined;
    /** @type {SourceTable} */
    sourcesByTag: SourceTable;
    /**
     * Runs the `template` option over the source and returns the transformed
     * html. Called from HtmlModulesPlugin's `processResult`, where the return
     * value becomes the module's stored source so the parser (which records
     * dependency offsets against it) and the generator (which renders from
     * `module.originalSource()`) stay in agreement.
     * @param {string | Buffer} source the original source
     * @param {HtmlNormalModule} module the html module
     * @returns {string | Buffer} the transformed source
     */
    applyTemplate(source: string | Buffer, module: HtmlNormalModule): string | Buffer;
}
declare namespace HtmlParser {
    export { buildHeadTags, HtmlTemplateContext, HtmlTemplateFunction, HtmlChunkNameData, HtmlChunkNameFn, SourceType, EntrySourceType, SourceTypeOrResolver, SourceFilter, SourceEntry, SourceItem, SourceBucket, SourceTable, ContentSourceItem };
}
import type { BuiltHtmlModule } from "./HtmlModule";
import Parser = require("../module/Parser");
import type { HtmlNormalModule } from "./HtmlModule";
import type { HtmlParserOptions } from "../../declarations/WebpackOptions";
import { buildHeadTags } from "./syntax-parser";
type HtmlTemplateContext = {
    /**
     * the html module being transformed
     */
    module: Module;
    /**
     * absolute path of the module's resource
     */
    resource: string;
    /**
     * register a file (e.g. a template partial) as a build dependency so editing it triggers a rebuild
     */
    addDependency: (dependency: string) => void;
    /**
     * register a directory as a build dependency
     */
    addContextDependency: (dependency: string) => void;
    /**
     * register a not-yet-existing path as a build dependency so creating it triggers a rebuild
     */
    addMissingDependency: (dependency: string) => void;
    /**
     * register a build dependency (e.g. a template engine config) so changing it invalidates the cache
     */
    addBuildDependency: (dependency: string) => void;
    /**
     * report a non-fatal warning on the module
     */
    emitWarning: (warning: Error | string) => void;
    /**
     * report an error on the module
     */
    emitError: (error: Error | string) => void;
};
type HtmlTemplateFunction = (source: string, context: HtmlTemplateContext) => string;
type HtmlChunkNameData = {
    /**
     * the page's path, escaped for use in a name
     */
    page: string;
    /**
     * the tag's own basename, empty for an inline body
     */
    name: string;
    /**
     * the tag's position in the page, across all kinds
     */
    index: number;
    /**
     * what the tag is extracted as
     */
    type: "script" | "script-module" | "modulepreload" | "stylesheet" | "html" | "preload" | "prefetch";
};
type HtmlChunkNameFn = (data: HtmlChunkNameData) => string;
type SourceType = "src" | "srcset" | "css-url" | "msapplication-task" | "script" | "script-module" | "modulepreload" | "stylesheet" | "html" | "preload" | "prefetch" | "stylesheet-style" | "stylesheet-style-attribute" | "srcdoc";
type EntrySourceType = "script" | "script-module" | "modulepreload" | "stylesheet" | "html" | "preload" | "prefetch";
type SourceTypeOrResolver = SourceType | ((attrs: Map<string, string>, css: boolean) => SourceType);
type SourceFilter = (attributes: Map<string, string>, value: string) => boolean;
type SourceEntry = {
    tag?: string;
    attribute: string;
    type: SourceType;
    filter?: SourceFilter;
};
type SourceItem = {
    type: SourceTypeOrResolver;
    filter?: SourceFilter;
    namespace?: typeof Flag.svg | typeof Flag.mathml;
};
type SourceBucket = Record<string, SourceItem | undefined>;
type SourceTable = Record<string, SourceBucket>;
type ContentSourceItem = {
    type: SourceTypeOrResolver;
    filter?: (attributes: Map<string, string>) => boolean;
};
import type Module from "../module/Module";
import { Flag } from "./syntax-parser";
