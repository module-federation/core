export = DefinePlugin;
declare class DefinePlugin {
  /**
   * @param {Compilation} compilation the compilation
   * @returns {DefinePluginHooks} the attached hooks
   */
  static getCompilationHooks(compilation: Compilation): DefinePluginHooks;
  /**
   * @param {GeneratorFn} fn generator function
   * @param {true | string[] | RuntimeValueOptions=} options options
   * @returns {RuntimeValue} runtime value
   */
  static runtimeValue(
    fn: GeneratorFn,
    options?: (true | string[] | RuntimeValueOptions) | undefined,
  ): RuntimeValue;
  /**
   * Create a new define plugin
   * @param {Record<string, CodeValue>} definitions A map of global object definitions
   */
  constructor(definitions: Record<string, CodeValue>);
  definitions: Record<string, RecursiveArrayOrRecord<any>>;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace DefinePlugin {
  export {
    Expression,
    Compiler,
    BuildInfo,
    ValueCacheVersion,
    ValueCacheVersions,
    NormalModule,
    RuntimeTemplate,
    JavascriptParser,
    DestructuringAssignmentProperties,
    Range,
    Logger,
    Compilation,
    CodeValuePrimitive,
    CodeValue,
    RuntimeValueOptions,
    GeneratorFn,
    ObjKeys,
    AsiSafe,
    DefinePluginHooks,
  };
}
/** @typedef {import("estree").Expression} Expression */
/** @typedef {import("./Compiler")} Compiler */
/** @typedef {import("./Module").BuildInfo} BuildInfo */
/** @typedef {import("./Module").ValueCacheVersion} ValueCacheVersion */
/** @typedef {import("./Module").ValueCacheVersions} ValueCacheVersions */
/** @typedef {import("./NormalModule")} NormalModule */
/** @typedef {import("./RuntimeTemplate")} RuntimeTemplate */
/** @typedef {import("./javascript/JavascriptParser")} JavascriptParser */
/** @typedef {import("./javascript/JavascriptParser").DestructuringAssignmentProperties} DestructuringAssignmentProperties */
/** @typedef {import("./javascript/JavascriptParser").Range} Range */
/** @typedef {import("./logging/Logger").Logger} Logger */
/** @typedef {import("./Compilation")} Compilation */
/** @typedef {null | undefined | RegExp | EXPECTED_FUNCTION | string | number | boolean | bigint | undefined} CodeValuePrimitive */
/** @typedef {RecursiveArrayOrRecord<CodeValuePrimitive | RuntimeValue>} CodeValue */
/**
 * @typedef {object} RuntimeValueOptions
 * @property {string[]=} fileDependencies
 * @property {string[]=} contextDependencies
 * @property {string[]=} missingDependencies
 * @property {string[]=} buildDependencies
 * @property {string | (() => string)=} version
 */
/** @typedef {(value: { module: NormalModule, key: string, readonly version: ValueCacheVersion }) => CodeValuePrimitive} GeneratorFn */
declare class RuntimeValue {
  /**
   * @param {GeneratorFn} fn generator function
   * @param {true | string[] | RuntimeValueOptions=} options options
   */
  constructor(
    fn: GeneratorFn,
    options?: (true | string[] | RuntimeValueOptions) | undefined,
  );
  fn: GeneratorFn;
  options: true | RuntimeValueOptions;
  get fileDependencies(): true | string[];
  /**
   * @param {JavascriptParser} parser the parser
   * @param {ValueCacheVersions} valueCacheVersions valueCacheVersions
   * @param {string} key the defined key
   * @returns {CodeValuePrimitive} code
   */
  exec(
    parser: JavascriptParser,
    valueCacheVersions: ValueCacheVersions,
    key: string,
  ): CodeValuePrimitive;
  getCacheVersion(): string;
}
type Expression = import('estree').Expression;
type Compiler = import('./Compiler');
type BuildInfo = import('./Module').BuildInfo;
type ValueCacheVersion = import('./Module').ValueCacheVersion;
type ValueCacheVersions = import('./Module').ValueCacheVersions;
type NormalModule = import('./NormalModule');
type RuntimeTemplate = import('./RuntimeTemplate');
type JavascriptParser = import('./javascript/JavascriptParser');
type DestructuringAssignmentProperties =
  import('./javascript/JavascriptParser').DestructuringAssignmentProperties;
type Range = import('./javascript/JavascriptParser').Range;
type Logger = import('./logging/Logger').Logger;
type Compilation = import('./Compilation');
type CodeValuePrimitive =
  | null
  | undefined
  | RegExp
  | EXPECTED_FUNCTION
  | string
  | number
  | boolean
  | bigint
  | undefined;
type CodeValue = RecursiveArrayOrRecord<CodeValuePrimitive | RuntimeValue>;
type RuntimeValueOptions = {
  fileDependencies?: string[] | undefined;
  contextDependencies?: string[] | undefined;
  missingDependencies?: string[] | undefined;
  buildDependencies?: string[] | undefined;
  version?: (string | (() => string)) | undefined;
};
type GeneratorFn = (value: {
  module: NormalModule;
  key: string;
  readonly version: ValueCacheVersion;
}) => CodeValuePrimitive;
type ObjKeys = Set<string> | null;
type AsiSafe = boolean | undefined | null;
type DefinePluginHooks = {
  definitions: SyncWaterfallHook<[Record<string, CodeValue>]>;
};
import { SyncWaterfallHook } from 'tapable';
