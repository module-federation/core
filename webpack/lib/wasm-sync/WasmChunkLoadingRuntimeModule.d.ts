export = WasmChunkLoadingRuntimeModule;
/**
 * @typedef {Object} WasmChunkLoadingRuntimeModuleOptions
 * @property {(path: string) => string} generateLoadBinaryCode
 * @property {boolean} [supportsStreaming]
 * @property {boolean} [mangleImports]
 * @property {Set<string>} runtimeRequirements
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
  _runtimeRequirements: Set<string>;
}
declare namespace WasmChunkLoadingRuntimeModule {
  export {
    Signature,
    Chunk,
    ChunkGraph,
    Compilation,
    Module,
    ModuleGraph,
    RuntimeSpec,
    WasmChunkLoadingRuntimeModuleOptions,
  };
}
import RuntimeModule = require('../RuntimeModule');
type WasmChunkLoadingRuntimeModuleOptions = {
  generateLoadBinaryCode: (path: string) => string;
  supportsStreaming?: boolean;
  mangleImports?: boolean;
  runtimeRequirements: Set<string>;
};
type Signature = any;
type Chunk = import('../Chunk');
type ChunkGraph = import('../ChunkGraph');
type Compilation = import('../Compilation');
type Module = import('../Module');
type ModuleGraph = import('../ModuleGraph');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
