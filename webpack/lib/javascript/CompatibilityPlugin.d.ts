export = CompatibilityPlugin;
/**
 * Adds parser-time compatibility rewrites for legacy runtime patterns that
 * webpack still needs to recognize in user and generated code.
 */
declare class CompatibilityPlugin {
    /**
     * Installs parser hooks that preserve compatibility with legacy patterns
     * such as nested `__webpack_require__` bindings and hashbang handling.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace CompatibilityPlugin {
    export { nestedWebpackIdentifierTag, CompatibilitySettingsDeclaration, CompatibilitySettings };
}
import type Compiler from "../Compiler";
/** @import { CallExpression } from "estree" */
/** @import Compiler from "../Compiler" */
/** @import { DependencyLocation } from "../graph/Dependency" */
/** @import ContextDependency from "../dependencies/context/ContextDependency" */
/** @import JavascriptParser, { Range } from "../javascript/JavascriptParser" */
/**
 * Captures the source range of a renamed compatibility binding so it can be
 * rewritten exactly once.
 * @typedef {object} CompatibilitySettingsDeclaration
 * @property {boolean} updated
 * @property {DependencyLocation} loc
 * @property {Range} range
 */
/**
 * Stores the replacement variable name and the declaration metadata tracked
 * for a compatibility rewrite.
 * @typedef {object} CompatibilitySettings
 * @property {string} name
 * @property {CompatibilitySettingsDeclaration} declaration
 */
declare const nestedWebpackIdentifierTag: unique symbol;
/**
 * Captures the source range of a renamed compatibility binding so it can be
 * rewritten exactly once.
 */
type CompatibilitySettingsDeclaration = {
    updated: boolean;
    loc: DependencyLocation;
    range: JavascriptParser.Range;
};
/**
 * Stores the replacement variable name and the declaration metadata tracked
 * for a compatibility rewrite.
 */
type CompatibilitySettings = {
    name: string;
    declaration: CompatibilitySettingsDeclaration;
};
import type { DependencyLocation } from "../graph/Dependency";
import type JavascriptParser from "../javascript/JavascriptParser";
