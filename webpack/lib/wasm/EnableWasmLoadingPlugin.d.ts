export = EnableWasmLoadingPlugin;
/**
 * Validates and enables named wasm loading backends by applying the plugin
 * implementations that provide their runtime support.
 */
declare class EnableWasmLoadingPlugin {
    /**
     * Marks a custom or built-in wasm loading type as enabled for the compiler
     * without applying additional built-in behavior.
     * @param {Compiler} compiler the compiler instance
     * @param {WasmLoadingType} type type of library
     * @returns {void}
     */
    static setEnabled(compiler: Compiler, type: WasmLoadingType): void;
    /**
     * Verifies that a wasm loading type has been enabled before code generation
     * attempts to use it.
     * @param {Compiler} compiler the compiler instance
     * @param {WasmLoadingType} type type of library
     * @returns {void}
     */
    static checkEnabled(compiler: Compiler, type: WasmLoadingType): void;
    /**
     * Stores the wasm loading backend name that should be enabled for the
     * compiler.
     * @param {WasmLoadingType} type library type that should be available
     */
    constructor(type: WasmLoadingType);
    /** @type {WasmLoadingType} */
    type: WasmLoadingType;
    /**
     * Enables the requested wasm loading backend once and applies the
     * environment-specific plugins that provide its parser, generator, and
     * runtime support.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace EnableWasmLoadingPlugin {
    export { WasmLoadingTypes };
}
import type { WasmLoadingType } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
type WasmLoadingTypes = Set<WasmLoadingType>;
