export = TemplatedPathPlugin;
declare class TemplatedPathPlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace TemplatedPathPlugin {
    export { getPresentKinds, interpolate, reEncodeDigest, toContainedPath, toTemplateSourceFileName, usesFullHashDigest, ReplacerFunction, Base, Replacer, TemplatePathFn, TemplatePath };
}
import type Compiler from "../Compiler";
/**
 * Returns the placeholder kinds (`[kind]` / `[kind:arg]`) a template references,
 * matching the replace pass below so guarding replacer construction by it stays
 * output-identical.
 * @param {string} path template string (already known to contain `[`)
 * @returns {Set<string>} placeholder kinds present
 */
declare function getPresentKinds(path: string): Set<string>;
/**
 * Callback used to compute a path from contextual data. The type parameter
 * narrows the `pathData` shape when the caller knows it operates in a chunk
 * (`PathDataChunk`) or module (`PathDataModule`) context — defaults to the
 * fully-optional `PathData` for backward compatibility.
 * @template {PathData} [T=PathData]
 * @typedef {(pathData: T, assetInfo?: AssetInfo) => string} TemplatePathFn
 */
/**
 * Either a raw template string (e.g. `"[name].[contenthash].js"`) or a
 * generic `TemplatePathFn`. Method signatures that need to thread a narrowed
 * `PathData` shape spell the function side out as `TemplatePathFn<T>`
 * directly — `TemplatePath` itself stays a plain alias so local JSDoc
 * re-imports keep a single shared identity.
 * @typedef {string | TemplatePathFn} TemplatePath
 */
/**
 * Returns the interpolated path.
 * @template {PathData} [T=PathData]
 * @param {string | TemplatePathFn<T>} path the raw path
 * @param {T} data context data
 * @param {AssetInfo=} assetInfo extra info about the asset (will be written to)
 * @returns {string} the interpolated path
 */
declare function interpolate<T extends Compilation.PathData = Compilation.PathData>(path: string | TemplatePathFn<T>, data: T, assetInfo?: Compilation.AssetInfo | undefined): string;
/**
 * Re-encodes a digested hash into another digest (e.g. `[contenthash:base64]`).
 * The source is already truncated to `output.hashDigestLength`, so the result is
 * derived from those bytes, not the full content. Throws on an unknown digest so
 * a typo fails loudly rather than silently keeping the original encoding.
 * @param {string} value digested hash
 * @param {string} fromDigest digest the value is encoded in
 * @param {string} toDigest requested digest
 * @returns {string} re-encoded hash
 */
declare function reEncodeDigest(value: string, fromDigest: string, toDigest: string): string;
/**
 * Maps a `[path]`/`[file]` value into the output directory: an absolute root or
 * a leading `..` becomes `_` (as `file-loader` did), so a module resolved
 * outside of `context` can't emit its asset outside of `output.path`.
 * @param {string} path relative path of the source file
 * @returns {string} path that stays inside the output directory
 */
declare function toContainedPath(path: string): string;
/**
 * Source file name a filename template sees. `[path]`/`[file]` of a module
 * resolved outside of `context` start with `..` and would emit the asset
 * outside of `output.path`, so they are contained like
 * `[containedpath]`/`[containedfile]` with `experiments.futureDefaults`.
 * @param {string} sourceFilename context-relative path of the source file
 * @param {Compilation} compilation compilation
 * @returns {string} source file name for the filename template
 */
declare function toTemplateSourceFileName(sourceFilename: string, compilation: Compilation): string;
/**
 * @param {string} template path template
 * @returns {boolean} true when it references `[fullhash:<digest>]`/`[hash:<digest>]`
 */
declare function usesFullHashDigest(template: string): boolean;
/**
 * Defines the replacer function callback.
 */
type ReplacerFunction = (match: string, arg: string | undefined, input: string) => any;
type Base = "26" | "32" | "36" | "49" | "52" | "58" | "62";
type Replacer = (match: string, arg: string | undefined, input: string, digest?: string) => string;
/**
 * Callback used to compute a path from contextual data. The type parameter
 * narrows the `pathData` shape when the caller knows it operates in a chunk
 * (`PathDataChunk`) or module (`PathDataModule`) context — defaults to the
 * fully-optional `PathData` for backward compatibility.
 */
type TemplatePathFn<T extends Compilation.PathData = Compilation.PathData> = (pathData: T, assetInfo?: Compilation.AssetInfo) => string;
/**
 * Either a raw template string (e.g. `"[name].[contenthash].js"`) or a
 * generic `TemplatePathFn`. Method signatures that need to thread a narrowed
 * `PathData` shape spell the function side out as `TemplatePathFn<T>`
 * directly — `TemplatePath` itself stays a plain alias so local JSDoc
 * re-imports keep a single shared identity.
 */
type TemplatePath = string | TemplatePathFn;
import type Compilation from "../Compilation";
