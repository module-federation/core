export type GlobMatchOptions = {
    caseSensitive?: boolean;
    requireLiteralLeadingDot?: boolean;
};
export type GlobMatcher = (str: string) => boolean;
export type GlobCondition = import("../../declarations/WebpackOptions").GlobCondition;
export type ResolvedContextModuleGlobPattern = {
    absolutePattern: string;
    base: string;
    absoluteBase: string;
    negative: boolean;
};
/**
 * @param {ResolvedContextModuleGlobPattern[]} patterns patterns
 * @param {string} fallback fallback
 * @returns {string} common base directory
 */
export function commonGlobBaseDir(patterns: ResolvedContextModuleGlobPattern[], fallback: string): string;
/**
 * Compiles glob patterns into one matcher: patterns are OR-ed and a `!` prefix
 * subtracts, as in `module.rules[].glob`.
 * @param {string[]} globs glob patterns
 * @param {(pattern: string, index: number) => never} onInvalid throws for an un-compilable pattern
 * @returns {GlobMatcher} matcher
 */
export function compileGlobList(globs: string[], onInvalid: (pattern: string, index: number) => never): GlobMatcher;
/**
 * Compiles each relative path of a path option as a glob, leaving absolute paths and RegExps as they are.
 * @template T, R
 * @param {(T | string)[]} paths option value
 * @param {(pattern: string) => R} compile glob compiler
 * @returns {(T | R | string)[]} paths with relative globs compiled
 */
export function compileRelativeGlobPaths<T, R>(paths: (T | string)[], compile: (pattern: string) => R): (T | R | string)[];
/**
 * Compiles a glob into a matcher over OS-independent paths: `\` is a path
 * separator in both the pattern and the tested path (never an escape, so a
 * pattern built with `path.resolve` works everywhere; use `[*]` to match a
 * literal `*`), and a relative pattern matches at any depth. Matching follows
 * `path.matchesGlob`, except where its minimatch shows through — see the
 * divergences listed above the corpus in `test/unitCases/globUtils.unittest.js`.
 * @param {string} pattern glob pattern
 * @param {GlobMatchOptions=} options options
 * @returns {((str: string) => boolean) | null} matcher, null for un-compilable patterns
 */
export function createPathGlobMatcher(pattern: string, options?: GlobMatchOptions | undefined): ((str: string) => boolean) | null;
/**
 * Compiles a relative glob into a RegExp whose first group is the outermost
 * directory it matches at the start of a path, trailing separator included — the
 * shape `snapshot.managedPaths` and its siblings read. Like `module.rules[].glob`
 * it matches at any depth, unless a leading `./` or `../` anchors it to `context`.
 * @param {string} pattern relative glob pattern
 * @param {string} context directory a `./` or `../` pattern is relative to
 * @returns {RegExp} prefix regexp
 */
export function createPathGlobPrefixRegExp(pattern: string, context: string): RegExp;
/**
 * Compiles a glob into a RegExp matching what `createPathGlobMatcher` matches,
 * for an option handed to code that only calls `.test()` on a native path.
 * @param {string} pattern glob pattern
 * @returns {RegExp} regexp
 */
export function createPathGlobRegExp(pattern: string): RegExp;
/** @typedef {{ caseSensitive?: boolean, requireLiteralLeadingDot?: boolean }} GlobMatchOptions */
/** @typedef {(str: string) => boolean} GlobMatcher */
/** @typedef {import("../../declarations/WebpackOptions").GlobCondition} GlobCondition */
/** @import Module from "../module/Module" */
/**
 * @param {string} s string
 * @returns {string} escaped glob pattern
 */
export function escapeGlobPattern(s: string): string;
/**
 * @param {string} pattern pattern
 * @returns {string} base directory
 */
export function extractGlobBaseDir(pattern: string): string;
export const getGlobToRegExpSource: memoize.FunctionReturning<typeof import("watchpack/types/util/globToRegExp")>;
/**
 * @param {string} normalizedPattern pattern
 * @param {string} normalizedPath path
 * @param {string} normalizedBaseDir base directory
 * @param {GlobMatchOptions=} options options
 * @returns {boolean} matches
 */
export function globMatchNormalizedWithExplicitDot(normalizedPattern: string, normalizedPath: string, normalizedBaseDir: string, options?: GlobMatchOptions | undefined): boolean;
/**
 * @param {string} pattern pattern
 * @param {string} path path
 * @param {string} baseDir base directory
 * @param {GlobMatchOptions=} options options
 * @returns {boolean} matches
 */
export function globMatchWithExplicitDot(pattern: string, path: string, baseDir: string, options?: GlobMatchOptions | undefined): boolean;
/**
 * @param {string} pattern pattern
 * @param {string} str path
 * @param {GlobMatchOptions=} options options
 * @returns {boolean} matches
 */
export function globMatchWithOptions(pattern: string, str: string, options?: GlobMatchOptions | undefined): boolean;
/**
 * A dot/node_modules directory is still traversed in non-exhaustive mode when
 * it lies within the literal base of some positive pattern — the user named it
 * explicitly — so combined patterns behave like that pattern used alone.
 * @param {ResolvedContextModuleGlobPattern[]} patterns patterns
 * @param {string} dirPath absolute directory path
 * @returns {boolean} directory is within a positive pattern's literal base
 */
export function globPatternBaseReachesDir(patterns: ResolvedContextModuleGlobPattern[], dirPath: string): boolean;
/**
 * @param {ResolvedContextModuleGlobPattern[]} patterns patterns
 * @param {string} commonBaseDir common base
 * @returns {boolean} recursive
 */
export function globPatternsAreRecursive(patterns: ResolvedContextModuleGlobPattern[], commonBaseDir: string): boolean;
/**
 * @param {ResolvedContextModuleGlobPattern[]} patterns patterns
 * @param {string} filePath path
 * @param {boolean} exhaustive exhaustive
 * @param {boolean=} caseSensitive case sensitive (default true)
 * @returns {string | undefined} user request
 */
export function globUserRequest(patterns: ResolvedContextModuleGlobPattern[], filePath: string, exhaustive: boolean, caseSensitive?: boolean | undefined): string | undefined;
/**
 * @param {string} context context
 * @param {string} compilerContext compiler context
 * @param {string} globPath path
 * @returns {[string, string]} base and path parts
 */
export function importMetaGlobPathParts(context: string, compilerContext: string, globPath: string): [string, string];
/**
 * @param {string} commonBase common base
 * @param {string} patternBase pattern base
 * @returns {string} inferred root context
 */
export function inferGlobRootContext(commonBase: string, patternBase: string): string;
/**
 * @param {string} dirname directory name
 * @returns {boolean} skipped in non-exhaustive mode
 */
export function isNonExhaustiveImportMetaGlobSkippedDir(dirname: string): boolean;
/**
 * @param {string} base base path
 * @param {string} subPath sub path
 * @returns {string} joined filesystem path
 */
export function joinImportMetaGlobFsPath(base: string, subPath: string): string;
/**
 * @param {string} base base path
 * @param {string} subPath sub path
 * @returns {string} joined path
 */
export function joinImportMetaGlobPath(base: string, subPath: string): string;
/**
 * Tests a path against `{ glob }`, compiled once per condition object.
 * @param {GlobCondition} condition glob condition
 * @param {string} str path
 * @returns {boolean} true, when the path matches
 */
export function matchGlobCondition(condition: GlobCondition, str: string): boolean;
/**
 * Tests a module's `nameForCondition()` against `{ glob }`; a module without one never matches.
 * @param {GlobCondition} condition glob condition
 * @param {Module} module module
 * @returns {boolean} true, when the module matches
 */
export function matchModuleGlobCondition(condition: GlobCondition, module: Module): boolean;
/**
 * @param {string} s string
 * @returns {string} normalized path separators for glob patterns
 */
export function normalizePathSeparators(s: string): string;
/**
 * @param {string} s string
 * @returns {string} normalized path separators for filesystem paths
 */
export function normalizePathSeparatorsForPath(s: string): string;
/**
 * @param {string} pattern pattern
 * @param {string} baseDir base directory
 * @param {string} path path
 * @param {GlobMatchOptions} options options
 * @returns {boolean} has explicit dot
 */
export function patternHasExplicitDotFor(pattern: string, baseDir: string, path: string, options: GlobMatchOptions): boolean;
/**
 * @typedef {object} ResolvedContextModuleGlobPattern
 * @property {string} absolutePattern
 * @property {string} base
 * @property {string} absoluteBase
 * @property {boolean} negative
 */
/**
 * @param {string} pattern pattern
 * @param {string} context context
 * @param {string} commonBase common base
 * @returns {ResolvedContextModuleGlobPattern} resolved pattern
 */
export function resolveContextModuleGlobPattern(pattern: string, context: string, commonBase: string): ResolvedContextModuleGlobPattern;
/**
 * @param {string} s string
 * @returns {string} unescaped glob path
 */
export function unescapeGlobPath(s: string): string;
import memoize = require("./memoize");
import type Module from "../module/Module";
