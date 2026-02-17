export = DefinePlugin;
declare class DefinePlugin {
  /**
   * @param {function({ module: NormalModule, key: string, readonly version: string | undefined }): CodeValuePrimitive} fn generator function
   * @param {true | string[] | RuntimeValueOptions=} options options
   * @returns {RuntimeValue} runtime value
   */
  static runtimeValue(
    fn: (arg0: {
      module: NormalModule;
      key: string;
      readonly version: string | undefined;
    }) => CodeValuePrimitive,
    options?: (true | string[] | RuntimeValueOptions) | undefined,
  ): RuntimeValue;
  /**
   * Create a new define plugin
   * @param {Record<string, CodeValue>} definitions A map of global object definitions
   */
  constructor(definitions: Record<string, CodeValue>);
  definitions: Record<
    string,
    RecursiveArrayOrRecord<CodeValuePrimitive | RuntimeValue>
  >;
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
    NormalModule,
    RuntimeTemplate,
    JavascriptParser,
    Logger,
    CodeValuePrimitive,
    CodeValue,
    RuntimeValueOptions,
  };
}
type CodeValuePrimitive =
  | null
  | undefined
  | RegExp
  | Function
  | string
  | number
  | boolean
  | bigint
  | undefined;
/** @typedef {import("estree").Expression} Expression */
/** @typedef {import("./Compiler")} Compiler */
/** @typedef {import("./NormalModule")} NormalModule */
/** @typedef {import("./RuntimeTemplate")} RuntimeTemplate */
/** @typedef {import("./javascript/JavascriptParser")} JavascriptParser */
/** @typedef {import("./logging/Logger").Logger} Logger */
/** @typedef {null|undefined|RegExp|Function|string|number|boolean|bigint|undefined} CodeValuePrimitive */
/** @typedef {RecursiveArrayOrRecord<CodeValuePrimitive|RuntimeValue>} CodeValue */
/**
 * @typedef {Object} RuntimeValueOptions
 * @property {string[]=} fileDependencies
 * @property {string[]=} contextDependencies
 * @property {string[]=} missingDependencies
 * @property {string[]=} buildDependencies
 * @property {string|function(): string=} version
 */
declare class RuntimeValue {
  /**
   * @param {function({ module: NormalModule, key: string, readonly version: string | undefined }): CodeValuePrimitive} fn generator function
   * @param {true | string[] | RuntimeValueOptions=} options options
   */
  constructor(
    fn: (arg0: {
      module: NormalModule;
      key: string;
      readonly version: string | undefined;
    }) => CodeValuePrimitive,
    options?: (true | string[] | RuntimeValueOptions) | undefined,
  );
  fn: (arg0: {
    module: NormalModule;
    key: string;
    readonly version: string | undefined;
  }) => CodeValuePrimitive;
  options: true | RuntimeValueOptions;
  get fileDependencies(): true | string[];
  /**
   * @param {JavascriptParser} parser the parser
   * @param {Map<string, string | Set<string>>} valueCacheVersions valueCacheVersions
   * @param {string} key the defined key
   * @returns {CodeValuePrimitive} code
   */
  exec(
    parser: JavascriptParser,
    valueCacheVersions: Map<string, string | Set<string>>,
    key: string,
  ): CodeValuePrimitive;
  getCacheVersion(): string;
}
type Compiler = import('./Compiler');
declare namespace module {
  namespace exports {
    export {
      Expression,
      Compiler,
      NormalModule,
      RuntimeTemplate,
      JavascriptParser,
      Logger,
      CodeValuePrimitive,
      CodeValue,
      RuntimeValueOptions,
    };
  }
}
type NormalModule = import('./NormalModule');
type RuntimeValueOptions = {
  fileDependencies?: string[] | undefined;
  contextDependencies?: string[] | undefined;
  missingDependencies?: string[] | undefined;
  buildDependencies?: string[] | undefined;
  version?: (string | (() => string)) | undefined;
};
type CodeValue = RecursiveArrayOrRecord<CodeValuePrimitive | RuntimeValue>;
type Expression = import('estree').Expression;
type RuntimeTemplate = import('./RuntimeTemplate');
type JavascriptParser = import('./javascript/JavascriptParser');
type Logger = import('./logging/Logger').Logger;
