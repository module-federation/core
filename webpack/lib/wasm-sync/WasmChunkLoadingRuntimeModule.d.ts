export = WasmChunkLoadingRuntimeModule;
/**
 * @typedef {object} WasmChunkLoadingRuntimeModuleOptions
 * @property {(path: string) => string} generateLoadBinaryCode
 * @property {boolean=} supportsStreaming
 * @property {boolean=} mangleImports
 * @property {ReadOnlyRuntimeRequirements} runtimeRequirements
 */
declare class WasmChunkLoadingRuntimeModule extends RuntimeModule {
  /**
   * @param {WasmChunkLoadingRuntimeModuleOptions} options options
   */
  constructor({
    generateLoadBinaryCode,
    supportsStreaming,
    mangleImports,
    runtimeRequirements,
  }: WasmChunkLoadingRuntimeModuleOptions);
  generateLoadBinaryCode: (path: string) => string;
  supportsStreaming: boolean;
  mangleImports: boolean;
  _runtimeRequirements: import('../Module').ReadOnlyRuntimeRequirements;
}
declare namespace WasmChunkLoadingRuntimeModule {
  export {
    Signature,
    Chunk,
    ChunkGraph,
    ModuleId,
    Compilation,
    Module,
    ReadOnlyRuntimeRequirements,
    ModuleGraph,
    RuntimeSpec,
    Declarations,
    WasmChunkLoadingRuntimeModuleOptions,
  };
}
import RuntimeModule = require('../RuntimeModule');
type Signature = any;
type Chunk = import('../Chunk');
type ChunkGraph = import('../ChunkGraph');
type ModuleId = import('../ChunkGraph').ModuleId;
type Compilation = import('../Compilation');
type Module = import('../Module');
type ReadOnlyRuntimeRequirements =
  import('../Module').ReadOnlyRuntimeRequirements;
type ModuleGraph = import('../ModuleGraph');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
type Declarations = string[];
type WasmChunkLoadingRuntimeModuleOptions = {
  generateLoadBinaryCode: (path: string) => string;
  supportsStreaming?: boolean | undefined;
  mangleImports?: boolean | undefined;
  runtimeRequirements: ReadOnlyRuntimeRequirements;
};
