export = HarmonyImportDependencyParserPlugin;
declare class HarmonyImportDependencyParserPlugin {
    /**
     * @param {JavascriptParserOptions} options options
     */
    constructor(options: JavascriptParserOptions);
    options: import("../../declarations/WebpackOptions").JavascriptParserOptions;
    exportPresenceMode: import("./HarmonyImportDependency").ExportPresenceMode;
    strictThisContextOnImports: boolean;
    /**
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
declare namespace HarmonyImportDependencyParserPlugin {
    export { harmonySpecifierTag, Expression, Identifier, MemberExpression, JavascriptParserOptions, DependencyLocation, JavascriptParser, ExportAllDeclaration, ExportNamedDeclaration, ImportAttributes, ImportDeclaration, Range, Members, MembersOptionals, Ids, ImportPhaseType, HarmonySettings };
}
/** @typedef {import("estree").Expression} Expression */
/** @typedef {import("estree").Identifier} Identifier */
/** @typedef {import("estree").MemberExpression} MemberExpression */
/** @typedef {import("../../declarations/WebpackOptions").JavascriptParserOptions} JavascriptParserOptions */
/** @typedef {import("../Dependency").DependencyLocation} DependencyLocation */
/** @typedef {import("../javascript/JavascriptParser")} JavascriptParser */
/** @typedef {import("../javascript/JavascriptParser").ExportAllDeclaration} ExportAllDeclaration */
/** @typedef {import("../javascript/JavascriptParser").ExportNamedDeclaration} ExportNamedDeclaration */
/** @typedef {import("../javascript/JavascriptParser").ImportAttributes} ImportAttributes */
/** @typedef {import("../javascript/JavascriptParser").ImportDeclaration} ImportDeclaration */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../javascript/JavascriptParser").Members} Members */
/** @typedef {import("../javascript/JavascriptParser").MembersOptionals} MembersOptionals */
/** @typedef {import("./HarmonyImportDependency").Ids} Ids */
/** @typedef {import("./ImportPhase").ImportPhaseType} ImportPhaseType */
declare const harmonySpecifierTag: unique symbol;
type Expression = import("estree").Expression;
type Identifier = import("estree").Identifier;
type MemberExpression = import("estree").MemberExpression;
type JavascriptParserOptions = import("../../declarations/WebpackOptions").JavascriptParserOptions;
type DependencyLocation = import("../Dependency").DependencyLocation;
type JavascriptParser = import("../javascript/JavascriptParser");
type ExportAllDeclaration = import("../javascript/JavascriptParser").ExportAllDeclaration;
type ExportNamedDeclaration = import("../javascript/JavascriptParser").ExportNamedDeclaration;
type ImportAttributes = import("../javascript/JavascriptParser").ImportAttributes;
type ImportDeclaration = import("../javascript/JavascriptParser").ImportDeclaration;
type Range = import("../javascript/JavascriptParser").Range;
type Members = import("../javascript/JavascriptParser").Members;
type MembersOptionals = import("../javascript/JavascriptParser").MembersOptionals;
type Ids = import("./HarmonyImportDependency").Ids;
type ImportPhaseType = import("./ImportPhase").ImportPhaseType;
type HarmonySettings = {
    ids: Ids;
    source: string;
    sourceOrder: number;
    name: string;
    await: boolean;
    attributes?: ImportAttributes | undefined;
    phase: ImportPhaseType;
};
