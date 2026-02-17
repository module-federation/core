export = CompatibilityPlugin;
declare class CompatibilityPlugin {
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace CompatibilityPlugin {
    export { nestedWebpackIdentifierTag, CallExpression, Compiler, DependencyLocation, ContextDependency, JavascriptParser, Range, CompatibilitySettingsDeclaration, CompatibilitySettings };
}
/** @typedef {import("estree").CallExpression} CallExpression */
/** @typedef {import("./Compiler")} Compiler */
/** @typedef {import("./Dependency").DependencyLocation} DependencyLocation */
/** @typedef {import("./dependencies/ContextDependency")} ContextDependency */
/** @typedef {import("./javascript/JavascriptParser")} JavascriptParser */
/** @typedef {import("./javascript/JavascriptParser").Range} Range */
/**
 * @typedef {object} CompatibilitySettingsDeclaration
 * @property {boolean} updated
 * @property {DependencyLocation} loc
 * @property {Range} range
 */
/**
 * @typedef {object} CompatibilitySettings
 * @property {string} name
 * @property {CompatibilitySettingsDeclaration} declaration
 */
declare const nestedWebpackIdentifierTag: unique symbol;
type CallExpression = import("estree").CallExpression;
type Compiler = import("./Compiler");
type DependencyLocation = import("./Dependency").DependencyLocation;
type ContextDependency = import("./dependencies/ContextDependency");
type JavascriptParser = import("./javascript/JavascriptParser");
type Range = import("./javascript/JavascriptParser").Range;
type CompatibilitySettingsDeclaration = {
    updated: boolean;
    loc: DependencyLocation;
    range: Range;
};
type CompatibilitySettings = {
    name: string;
    declaration: CompatibilitySettingsDeclaration;
};
