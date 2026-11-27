export = ConstPlugin;
declare class ConstPlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
    /**
     * Eliminate an unused statement.
     * @param {JavascriptParser} parser the parser
     * @param {Statement} statement the statement to remove
     * @param {boolean} alwaysInBlock whether to always generate curly brackets
     * @returns {void}
     */
    eliminateUnusedStatement(parser: JavascriptParser, statement: Statement, alwaysInBlock: boolean): void;
}
declare namespace ConstPlugin {
    export { Declarations };
}
import type Compiler from "../Compiler";
import type JavascriptParser from "../javascript/JavascriptParser";
import type { Statement } from "estree";
type Declarations = Set<string>;
