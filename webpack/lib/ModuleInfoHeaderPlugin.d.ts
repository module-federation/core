export = ModuleInfoHeaderPlugin;
declare class ModuleInfoHeaderPlugin {
    /**
     * @param {boolean=} verbose add more information like exports, runtime requirements and bailouts
     */
    constructor(verbose?: boolean | undefined);
    _verbose: boolean;
    /**
     * @param {Compiler} compiler the compiler
     * @returns {void}
     */
    apply(compiler: Compiler): void;
    /**
     * @param {Module} module the module
     * @param {RequestShortener} requestShortener request shortener
     * @returns {RawSource} the header
     */
    generateHeader(module: Module, requestShortener: RequestShortener): RawSource;
}
declare namespace ModuleInfoHeaderPlugin {
    export { Source, Compiler, ExportsInfo, ExportInfo, Module, BuildMeta, ModuleGraph, RequestShortener };
}
import { RawSource } from "webpack-sources";
type Source = import("webpack-sources").Source;
type Compiler = import("./Compiler");
type ExportsInfo = import("./ExportsInfo");
type ExportInfo = import("./ExportsInfo").ExportInfo;
type Module = import("./Module");
type BuildMeta = import("./Module").BuildMeta;
type ModuleGraph = import("./ModuleGraph");
type RequestShortener = import("./RequestShortener");
