export = WorkerPlugin;
declare class WorkerPlugin {
  /**
   * @param {ChunkLoading} chunkLoading chunk loading
   * @param {WasmLoading} wasmLoading wasm loading
   * @param {OutputModule} module output module
   * @param {WorkerPublicPath} workerPublicPath worker public path
   */
  constructor(
    chunkLoading: ChunkLoading,
    wasmLoading: WasmLoading,
    module: OutputModule,
    workerPublicPath: WorkerPublicPath,
  );
  _chunkLoading: import('../../declarations/WebpackOptions').ChunkLoading;
  _wasmLoading: import('../../declarations/WebpackOptions').WasmLoading;
  _module: boolean;
  _workerPublicPath: string;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace WorkerPlugin {
  export {
    CallExpression,
    Expression,
    ObjectExpression,
    Pattern,
    Property,
    SpreadElement,
    ChunkLoading,
    JavascriptParserOptions,
    OutputModule,
    WasmLoading,
    WorkerPublicPath,
    Compiler,
    DependencyLocation,
    EntryOptions,
    NormalModule,
    ParserState,
    BasicEvaluatedExpression,
    JavascriptParser,
    Parser,
    Range,
    HarmonySettings,
  };
}
type Compiler = import('../Compiler');
type ChunkLoading = import('../../declarations/WebpackOptions').ChunkLoading;
type WasmLoading = import('../../declarations/WebpackOptions').WasmLoading;
type OutputModule = import('../../declarations/WebpackOptions').OutputModule;
type WorkerPublicPath =
  import('../../declarations/WebpackOptions').WorkerPublicPath;
type CallExpression = import('estree').CallExpression;
type Expression = import('estree').Expression;
type ObjectExpression = import('estree').ObjectExpression;
type Pattern = import('estree').Pattern;
type Property = import('estree').Property;
type SpreadElement = import('estree').SpreadElement;
type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
type DependencyLocation = import('../Dependency').DependencyLocation;
type EntryOptions = import('../Entrypoint').EntryOptions;
type NormalModule = import('../NormalModule');
type ParserState = import('../Parser').ParserState;
type BasicEvaluatedExpression =
  import('../javascript/BasicEvaluatedExpression');
type JavascriptParser = import('../javascript/JavascriptParser');
type Parser = import('../javascript/JavascriptParser');
type Range = import('../javascript/JavascriptParser').Range;
type HarmonySettings =
  import('./HarmonyImportDependencyParserPlugin').HarmonySettings;
