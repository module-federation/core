export = BannerPlugin;
/**
 * Prepends or appends banner text to emitted assets that match the configured
 * file filters.
 */
declare class BannerPlugin {
    /**
     * Normalizes banner options and compiles the configured banner source into a
     * function that can render per-asset banner text.
     * @param {BannerPluginArgument} options options object
     */
    constructor(options: BannerPluginArgument);
    /** @type {BannerPluginOptions} */
    options: BannerPluginOptions;
    /** @type {BannerFunction} */
    banner: BannerFunction;
    /**
     * Validates the configured options and injects rendered banner comments into
     * matching compilation assets at the configured process-assets stage.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace BannerPlugin {
    export { BannerFunction, NonEmptyString, RuleGlobPattern, RuleGlobList, RuleGlob, Rule, RuleCondition, Rules, BannerPluginOptions, BannerString, BannerPluginArgument };
}
import type Compiler from "../Compiler";
/**
 * The banner as function, it will be wrapped in a comment.
 */
type BannerFunction = (data: {
    hash?: string;
    chunk: Chunk;
    filename: string;
}) => string;
type NonEmptyString = string;
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
 * Filtering rule as regex or string.
 */
type Rule = RegExp | NonEmptyString | RuleGlob | import("../devtool/ModuleFilenameHelpers").MatcherFn;
/**
 * A rule condition.
 */
type RuleCondition = Rule;
/**
 * Filtering rules.
 */
type Rules = RuleCondition[] | Rule;
type BannerPluginOptions = {
    /**
     * Specifies the banner.
     */
    banner: string | BannerFunction;
    /**
     * If true, the banner will only be added to the entry chunks.
     */
    entryOnly?: boolean | undefined;
    /**
     * Exclude all modules matching any of these conditions.
     */
    exclude?: Rules | undefined;
    /**
     * If true, banner will be placed at the end of the output.
     */
    footer?: boolean | undefined;
    /**
     * Include all modules matching any of these conditions.
     */
    include?: Rules | undefined;
    /**
     * If true, banner will not be wrapped in a comment.
     */
    raw?: boolean | undefined;
    /**
     * Specifies the stage when add a banner.
     */
    stage?: number | undefined;
    /**
     * Include all modules that pass test assertion.
     */
    test?: Rules | undefined;
};
/**
 * The banner as string, it will be wrapped in a comment.
 */
type BannerString = NonEmptyString;
type BannerPluginArgument = BannerString | BannerPluginOptions | BannerFunction;
import type Chunk from "../graph/Chunk";
