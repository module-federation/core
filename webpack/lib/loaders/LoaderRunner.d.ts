export function getContext(resource: string): string;
export function markNotCacheable<OptionsType>(loaderContext: LoaderRunnerLoaderContext<OptionsType>, reasons: string[]): void;
export function runLoaders<C = LoaderContext>(options: RunLoaderOptions<C>, callback: (err: Error | null, result: RunLoaderResult) => void): void;
export type LoaderItemInput = string | {
    loader: string;
    options?: LoaderItem["options"];
    ident?: string | null;
    type?: string | null;
    fragment?: string;
};
/**
 * What a loader hands on: content (`null` for a resource without a path),
 * source map and additional data.
 */
export type LoaderResultArgs = [(string | Buffer | null)?, (string | RawSourceMap | null)?, AdditionalData?];
export type ProcessResource<C> = (loaderContext: C, resource: string, callback: (err: Error | null, ...args: LoaderResultArgs) => void) => void;
export type ProcessOptions = {
    /**
     * the resource as read, a string when a `readResource` tap answered one
     */
    resourceBuffer: string | Buffer | null | undefined;
    /**
     * read and process the resource
     */
    processResource: ProcessResource<LoaderContext>;
};
export type RunLoaderOptions<C> = {
    /**
     * the resource (with query and fragment)
     */
    resource?: string | undefined;
    /**
     * the loaders to run
     */
    loaders?: LoaderItemInput[] | undefined;
    /**
     * the loader context to augment and pass to loaders
     */
    context?: C | undefined;
    /**
     * custom resource reader/processor
     */
    processResource?: ProcessResource<C> | undefined;
    /**
     * custom file reader
     */
    readResource?: ((path: string, callback: (err: Error | null, result?: Buffer) => void) => void) | undefined;
};
export type RunLoaderResult = {
    /**
     * the loader pipeline result
     */
    result?: LoaderResultArgs | undefined;
    /**
     * the resource as read, a string when a `readResource` tap answered one
     */
    resourceBuffer?: (string | Buffer | null) | undefined;
    /**
     * whether the request is cacheable
     */
    cacheable: boolean;
    /**
     * reasons why the request is not cacheable (e.g. paths of loaders that marked it)
     */
    notCacheableReasons: string[];
    /**
     * file dependencies
     */
    fileDependencies: string[];
    /**
     * context (directory) dependencies
     */
    contextDependencies: string[];
    /**
     * missing dependencies
     */
    missingDependencies: string[];
};
export type LoaderCallback = (err?: Error | null, ...args: LoaderResultArgs) => void;
export type LoaderThenable = {
    then: (onFulfilled: (content: string | Buffer) => void, onRejected: LoaderCallback) => void;
};
export type AdditionalDataKnown = {
    /**
     * the AST webpack should parse instead of the source
     */
    webpackAST?: PreparsedAst | undefined;
};
export type AdditionalData = AdditionalDataKnown & Record<string, EXPECTED_ANY>;
export type WebpackLoaderContextCallback = (err: undefined | null | Error, content?: (string | Buffer) | undefined, sourceMap?: (null | string | RawSourceMap) | undefined, additionalData?: AdditionalData | undefined) => void;
/**
 * What a loader keeps between its pitch and normal phase. Open by default: a
 * loader stores whatever it likes, and reads it back without narrowing.
 */
export type LoaderData = {
    [key: string]: EXPECTED_ANY;
};
export type LoaderEntry<OptionsType = Record<string, EXPECTED_ANY>, DataType = LoaderData> = {
    request: string;
    path: string;
    query: string;
    fragment: string;
    options: string | null | undefined | OptionsType;
    ident: string;
    normal: LoaderDefinitionFunction<OptionsType> | RawLoaderDefinitionFunction<OptionsType> | undefined;
    pitch: PitchLoaderDefinitionFunction<OptionsType> | undefined;
    raw: boolean | undefined;
    data: DataType | undefined;
    pitchExecuted: boolean;
    normalExecuted: boolean;
    type?: ("commonjs" | "module") | undefined;
};
/**
 * The members the runner never lets a loader assign. They carry no
 * documentation, so a type literal loses nothing and keeps `readonly`
 */
export type LoaderRunnerReadonlyContext<OptionsType, DataType = LoaderData> = {
    readonly currentRequest: string;
    readonly data: DataType;
    readonly previousRequest: string;
    readonly query: string | OptionsType;
    readonly remainingRequest: string;
    readonly request: string;
};
export type LoaderRunnerMutableContext<OptionsType> = {
    /**
     * Add a directory as dependency of the loader result.
     */
    addContextDependency: (context: string) => void;
    /**
     * Adds a file as dependency of the loader result in order to make them watchable.
     * For example, html-loader uses this technique as it finds src and src-set attributes.
     * Then, it sets the url's for those attributes as dependencies of the html file that is parsed.
     */
    addDependency: (file: string) => void;
    addMissingDependency: (context: string) => void;
    /**
     * Make this loader async.
     */
    async: () => WebpackLoaderContextCallback;
    /**
     * Make this loader result cacheable. By default it's cacheable.
     * A cacheable loader must have a deterministic result, when inputs and dependencies haven't changed.
     * This means the loader shouldn't have other dependencies than specified with this.addDependency.
     * Most loaders are deterministic and cacheable.
     */
    cacheable: (flag?: boolean) => void;
    callback: WebpackLoaderContextCallback;
    /**
     * Remove all dependencies of the loader result. Even initial dependencies and these of other loaders.
     */
    clearDependencies: () => void;
    /**
     * The directory of the module. Can be used as context for resolving other stuff.
     * eg '/workspaces/ts-loader/examples/vanilla/src'
     */
    context: string;
    /**
     * alias of addDependency
     * Adds a file as dependency of the loader result in order to make them watchable.
     * For example, html-loader uses this technique as it finds src and src-set attributes.
     * Then, it sets the url's for those attributes as dependencies of the html file that is parsed.
     */
    dependency: (file: string) => void;
    getContextDependencies: () => string[];
    getDependencies: () => string[];
    getMissingDependencies: () => string[];
    /**
     * The index in the loaders array of the current loader.
     * In the example: in loader1: 0, in loader2: 1
     */
    loaderIndex: number;
    /**
     * An array of all the loaders. It is writeable in the pitch phase.
     * loaders = [{request: string, path: string, query: string, module: function}]
     */
    loaders: LoaderEntry[];
    /**
     * The resource path.
     * In the example: "/abc/resource.js"
     */
    resourcePath: string;
    /**
     * The resource query string.
     * Example: "?query"
     */
    resourceQuery: string;
    /**
     * The resource fragment.
     * Example: "#frag"
     */
    resourceFragment: string;
    /**
     * The resource inclusive query and fragment.
     * Example: "/abc/resource.js?query#frag"
     */
    resource: string;
    /**
     * Target of compilation.
     * Example: "web"
     */
    target: string;
    /**
     * Tell what kind of ES-features may be used in the generated runtime-code.
     * Example: { arrowFunction: true }
     */
    environment: Environment;
};
/**
 * The properties are added by https://github.com/webpack/loader-runner
 */
export type LoaderRunnerLoaderContext<OptionsType, DataType = LoaderData> = LoaderRunnerMutableContext<OptionsType> & LoaderRunnerReadonlyContext<OptionsType, DataType>;
export type PitchLoaderDefinitionFunction<OptionsType = {}, ContextAdditions = {}> = (this: import("../module/NormalModule").LoaderContext<OptionsType> & ContextAdditions, remainingRequest: string, previousRequest: string, data: LoaderData) => string | Buffer | Promise<string | Buffer> | void;
export type LoaderDefinitionFunction<OptionsType = {}, ContextAdditions = {}> = (this: import("../module/NormalModule").LoaderContext<OptionsType> & ContextAdditions, content: string, sourceMap?: string | RawSourceMap, additionalData?: AdditionalData) => string | Buffer | Promise<string | Buffer> | void;
export type RawLoaderDefinitionFunction<OptionsType = {}, ContextAdditions = {}> = (this: import("../module/NormalModule").LoaderContext<OptionsType> & ContextAdditions, content: Buffer, sourceMap?: string | RawSourceMap, additionalData?: AdditionalData) => string | Buffer | Promise<string | Buffer> | void;
export type LoaderDefinition<OptionsType = {}, ContextAdditions = {}> = LoaderDefinitionFunction<OptionsType, ContextAdditions> & {
    raw?: false;
    pitch?: PitchLoaderDefinitionFunction<OptionsType, ContextAdditions>;
};
export type RawLoaderDefinition<OptionsType = {}, ContextAdditions = {}> = RawLoaderDefinitionFunction<OptionsType, ContextAdditions> & {
    raw: true;
    pitch?: PitchLoaderDefinitionFunction<OptionsType, ContextAdditions>;
};
export type LoaderModule<OptionsType = {}, ContextAdditions = {}> = {
    default?: (RawLoaderDefinitionFunction<OptionsType, ContextAdditions> | LoaderDefinitionFunction<OptionsType, ContextAdditions>) | undefined;
    raw?: false | undefined;
    pitch?: PitchLoaderDefinitionFunction<OptionsType, ContextAdditions> | undefined;
};
/**
 * The loader context as the runner sees and mutates it: the canonical
 * `LoaderRunnerLoaderContext` shape (not re-declared here), with only the fields
 * the runner assigns internally before a loader runs widened to their mutable
 * form (nullable `context`/`callback`/`async`, `LoaderObject` loaders).
 */
export type LoaderContext = Omit<LoaderRunnerLoaderContext<LoaderOptions>, "context" | "callback" | "async" | "loaders"> & {
    context: string | null;
    callback: LoaderCallback | null;
    async: (() => LoaderCallback | undefined) | null;
    loaders: LoaderObject[];
};
export type LoaderOptions = NonNullable<Exclude<LoaderItem["options"], string>>;
export type PitchArgs = [string, string, NonNullable<LoaderObject["data"]>];
export type LoaderState = {
    /**
     * whether the request is cacheable
     */
    cacheable: boolean;
    /**
     * reasons why the request is not cacheable (e.g. paths of loaders that marked it)
     */
    notCacheableReasons: string[];
    /**
     * collected file dependencies
     */
    fileDependencies: string[];
    /**
     * collected context dependencies
     */
    contextDependencies: string[];
    /**
     * collected missing dependencies
     */
    missingDependencies: string[];
};
/** @import { RawSourceMap } from "webpack-sources" */
/** @import { Environment } from "../../declarations/WebpackOptions" */
/** @import { PreparsedAst } from "../module/Parser" */
/** @import { LoaderItem } from "../module/NormalModule" */
export const LOADER_TIMING: unique symbol;
/**
 * A single loader in the pipeline. `request` is an accessor: reading it
 * serializes path/query/fragment; assigning a string or descriptor parses it.
 */
export class LoaderObject {
    /**
     * @param {LoaderItemInput} loader loader request or descriptor
     */
    constructor(loader: LoaderItemInput);
    /** @type {string} */
    path: string;
    /** @type {string} */
    query: string;
    /** @type {string} */
    fragment: string;
    /** @type {LoaderItem["options"]} */
    options: LoaderItem["options"];
    /** @type {string | null=} */
    ident: (string | null) | undefined;
    /** @type {(string | null)=} */
    type: (string | null) | undefined;
    /** @type {LoaderDefinitionFunction<LoaderOptions> | RawLoaderDefinitionFunction<LoaderOptions> | null=} */
    normal: (LoaderDefinitionFunction<LoaderOptions> | RawLoaderDefinitionFunction<LoaderOptions> | null) | undefined;
    /** @type {PitchLoaderDefinitionFunction<LoaderOptions> | null=} */
    pitch: (PitchLoaderDefinitionFunction<LoaderOptions> | null) | undefined;
    /** @type {boolean | null=} */
    raw: (boolean | null) | undefined;
    /** @type {LoaderData | null=} */
    data: (LoaderData | null) | undefined;
    pitchExecuted: boolean;
    normalExecuted: boolean;
    /**
     * @param {LoaderItemInput} value loader request or descriptor
     */
    set request(value: LoaderItemInput);
    /**
     * @returns {string} the loader request (path + query + fragment)
     */
    get request(): string;
}
/**
 * Phase 1 of loader-context construction (the single place the context shape is
 * defined): augments `base` in place with fresh result state and the dependency
 * methods. Phase 2 lives in `runLoaders`, which sets the resource-derived fields
 * and the `request` accessors once host hooks have populated the context, then
 * freezes it — the accessors are added last so V8 keeps the context in
 * fast-properties mode. Returned unfrozen.
 * @template T
 * @param {T=} base object to augment (the caller's context), if any
 * @returns {LoaderContext} the loader context
 */
export function createLoaderContext<T>(base?: T | undefined): LoaderContext;
import type { LoaderItem } from "../module/NormalModule";
import type { RawSourceMap } from "webpack-sources";
import type { PreparsedAst } from "../module/Parser";
import type { Environment } from "../../declarations/WebpackOptions";
