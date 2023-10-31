export = HarmonyImportDependencyParserPlugin;
declare class HarmonyImportDependencyParserPlugin {
  /**
   * @param {JavascriptParserOptions} options options
   */
  constructor(options: JavascriptParserOptions);
  exportPresenceMode: 0 | 2 | 1 | 3;
  strictThisContextOnImports: boolean;
  /**
   * @param {JavascriptParser} parser the parser
   * @returns {void}
   */
  apply(parser: JavascriptParser): void;
}
declare namespace HarmonyImportDependencyParserPlugin {
  export {
    harmonySpecifierTag,
    getAssertions,
    HarmonySettings,
    ExportAllDeclaration,
    ExportNamedDeclaration,
    Identifier,
    ImportDeclaration,
    ImportExpression,
    MemberExpression,
    JavascriptParserOptions,
    DependencyLocation,
    BasicEvaluatedExpression,
    JavascriptParser,
    Range,
    InnerGraph,
    TopLevelSymbol,
    HarmonyImportDependency,
  };
}
type JavascriptParser = import('../javascript/JavascriptParser');
type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
/** @typedef {import("estree").ExportAllDeclaration} ExportAllDeclaration */
/** @typedef {import("estree").ExportNamedDeclaration} ExportNamedDeclaration */
/** @typedef {import("estree").Identifier} Identifier */
/** @typedef {import("estree").ImportDeclaration} ImportDeclaration */
/** @typedef {import("estree").ImportExpression} ImportExpression */
/** @typedef {import("estree").MemberExpression} MemberExpression */
/** @typedef {import("../../declarations/WebpackOptions").JavascriptParserOptions} JavascriptParserOptions */
/** @typedef {import("../Dependency").DependencyLocation} DependencyLocation */
/** @typedef {import("../javascript/BasicEvaluatedExpression")} BasicEvaluatedExpression */
/** @typedef {import("../javascript/JavascriptParser")} JavascriptParser */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../optimize/InnerGraph").InnerGraph} InnerGraph */
/** @typedef {import("../optimize/InnerGraph").TopLevelSymbol} TopLevelSymbol */
/** @typedef {import("./HarmonyImportDependency")} HarmonyImportDependency */
declare const harmonySpecifierTag: unique symbol;
/**
 * @typedef {Object} HarmonySettings
 * @property {string[]} ids
 * @property {string} source
 * @property {number} sourceOrder
 * @property {string} name
 * @property {boolean} await
 * @property {Record<string, any> | undefined} assertions
 */
/**
 * @param {ImportDeclaration | ExportNamedDeclaration | ExportAllDeclaration | ImportExpression} node node with assertions
 * @returns {Record<string, any> | undefined} assertions
 */
declare function getAssertions(
  node:
    | ImportDeclaration
    | ExportNamedDeclaration
    | ExportAllDeclaration
    | ImportExpression,
): Record<string, any> | undefined;
type HarmonySettings = {
  ids: string[];
  source: string;
  sourceOrder: number;
  name: string;
  await: boolean;
  assertions: Record<string, any> | undefined;
};
type ExportAllDeclaration = import('estree').ExportAllDeclaration;
type ExportNamedDeclaration = import('estree').ExportNamedDeclaration;
type Identifier = import('estree').Identifier;
type ImportDeclaration = import('estree').ImportDeclaration;
type ImportExpression = import('estree').ImportExpression;
type MemberExpression = import('estree').MemberExpression;
type DependencyLocation = import('../Dependency').DependencyLocation;
type BasicEvaluatedExpression =
  import('../javascript/BasicEvaluatedExpression');
type Range = import('../javascript/JavascriptParser').Range;
type InnerGraph = import('../optimize/InnerGraph').InnerGraph;
type TopLevelSymbol = import('../optimize/InnerGraph').TopLevelSymbol;
type HarmonyImportDependency = import('./HarmonyImportDependency');
