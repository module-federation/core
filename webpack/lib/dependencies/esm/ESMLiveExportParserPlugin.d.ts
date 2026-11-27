export = ESMLiveExportParserPlugin;
/**
 * Records, for each module-level binding an ESM module exports, every occurrence
 * renaming it takes, so a module library can move the binding to the chunk's scope,
 * and every write, where a module keeping its declaration mirrors it there instead.
 */
declare class ESMLiveExportParserPlugin {
    /**
     * Applies the plugin by registering its hooks on the parser.
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
declare namespace ESMLiveExportParserPlugin {
    export { LiveDeclaration, LiveExportGroup, LiveExportReferences };
}
import type JavascriptParser from "../../javascript/JavascriptParser";
/**
 * A module-level declaration an export may name: a `let` or `var` statement, or a
 * function or class, whose binding stays declared where it is.
 */
type LiveDeclaration = VariableDeclaration | FunctionDeclaration | ClassDeclaration | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration;
/**
 * The occurrences of the names one claimed declaration binds, gathered while the
 * module is walked.
 */
type LiveExportGroup = {
    /**
     * the claimed declaration
     */
    declaration: LiveDeclaration;
    /**
     * one entry per name it binds
     */
    names: LiveExportReferences[];
    /**
     * flat triples of the occurrences renaming takes, of all its names
     */
    occurrences: number[];
    /**
     * where each of those starts
     */
    starts: Set<number>;
    /**
     * flat triples of where the module mirrors a write instead, of all its names
     */
    mirrors: number[];
    /**
     * where each of those starts, with its name and kind
     */
    mirrorKeys: Set<string>;
    /**
     * whether anything but its declaration assigns a name, the only way its copy can go stale
     */
    written: boolean;
    /**
     * whether the walk saw each `let` or `const` declarator, which a mirroring module needs
     */
    declared: boolean;
    /**
     * where a `let` or class declaration starts, before which a use throws; -1 for others
     */
    lexicalStart: number;
    /**
     * whether the module uses a `let` or class above its declaration, where it must throw
     */
    earlyUse: boolean;
};
/**
 * The occurrences of one name of a claimed declaration.
 */
type LiveExportReferences = {
    /**
     * the declared name
     */
    name: string;
    /**
     * {@link ESMLiveExportDependency.KINDS_PER_NAME} times the name's index in its group
     */
    kindBase: number;
    /**
     * the group it belongs to
     */
    group: LiveExportGroup;
    /**
     * the `var` declarators of the name the walk saw
     */
    varDeclarators: number;
};
import type { VariableDeclaration } from "estree";
import type { FunctionDeclaration } from "estree";
import type { ClassDeclaration } from "estree";
import type { MaybeNamedFunctionDeclaration } from "estree";
import type { MaybeNamedClassDeclaration } from "estree";
