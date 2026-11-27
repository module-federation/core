export = PureAnnotationsPlugin;
declare class PureAnnotationsPlugin {
    /**
     * Creates an instance of PureAnnotationsPlugin.
     * @param {PerformanceOptions} options the plugin options
     */
    constructor(options: PerformanceOptions);
    /** @type {PerformanceOptions["hints"]} */
    hints: PerformanceOptions["hints"];
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace PureAnnotationsPlugin {
    export { AstFields, AstArray, AstValue };
}
import type { PerformanceOptions } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
type AstFields = { [Key in string]?: AstValue; };
type AstArray = AstValue[];
/**
 * A value found while walking an estree AST structurally: a node, a field of
 * one, or a literal's value.
 */
type AstValue = string | number | boolean | bigint | RegExp | null | undefined | AstArray | AstFields;
