export = WebAssemblyGenerator;
/**
 * @typedef {object} WebAssemblyGeneratorOptions
 * @property {boolean=} mangleImports mangle imports
 */
declare class WebAssemblyGenerator extends Generator {
    /**
     * @param {WebAssemblyGeneratorOptions} options options
     */
    constructor(options: WebAssemblyGeneratorOptions);
    options: WebAssemblyGeneratorOptions;
    /**
     * @param {Error} error the error
     * @param {NormalModule} module module for which the code should be generated
     * @param {GenerateContext} generateContext context for generate
     * @returns {Source | null} generated code
     */
    generateError(error: Error, module: NormalModule, generateContext: GenerateContext): Source | null;
}
declare namespace WebAssemblyGenerator {
    export { Source, GenerateContext, Module, SourceType, SourceTypes, ModuleGraph, NormalModule, RuntimeSpec, UsedWasmDependency, Instruction, ModuleImport, ModuleExport, Global, AST, GlobalType, NodePath, ArrayBufferTransform, Mapping, WebAssemblyGeneratorOptions };
}
import Generator = require("../Generator");
type Source = import("webpack-sources").Source;
type GenerateContext = import("../Generator").GenerateContext;
type Module = import("../Module");
type SourceType = import("../Module").SourceType;
type SourceTypes = import("../Module").SourceTypes;
type ModuleGraph = import("../ModuleGraph");
type NormalModule = import("../NormalModule");
type RuntimeSpec = import("../util/runtime").RuntimeSpec;
type UsedWasmDependency = import("./WebAssemblyUtils").UsedWasmDependency;
type Instruction = any;
type ModuleImport = any;
type ModuleExport = any;
type Global = any;
type AST = any;
type GlobalType = any;
type NodePath<T> = any;
type ArrayBufferTransform = (buf: ArrayBuffer) => ArrayBuffer;
type Mapping = Map<string, UsedWasmDependency>;
type WebAssemblyGeneratorOptions = {
    /**
     * mangle imports
     */
    mangleImports?: boolean | undefined;
};
