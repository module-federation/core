export type Scope = import("eslint-scope").Scope;
export type Reference = import("eslint-scope").Reference;
export type Variable = import("eslint-scope").Variable;
export type Node = import("estree").Node;
export type Range = import("../javascript/JavascriptParser").Range;
export type UsedNames = Set<string>;
export type ScopeSet = Set<Scope>;
export type ScopeInfo = {
    usedNames: UsedNames;
    alreadyCheckedScopes: ScopeSet;
};
/** @typedef {import("eslint-scope").Scope} Scope */
/** @typedef {import("eslint-scope").Reference} Reference */
/** @typedef {import("eslint-scope").Variable} Variable */
/** @typedef {import("estree").Node} Node */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {Set<string>} UsedNames */
export const DEFAULT_EXPORT: "__WEBPACK_DEFAULT_EXPORT__";
export const NAMESPACE_OBJECT_EXPORT: "__WEBPACK_NAMESPACE_OBJECT__";
export const RESERVED_NAMES: Set<string>;
/** @typedef {Set<Scope>} ScopeSet */
/**
 * @param {Scope | null} s scope
 * @param {UsedNames} nameSet name set
 * @param {ScopeSet} scopeSet1 scope set 1
 * @param {ScopeSet} scopeSet2 scope set 2
 */
export function addScopeSymbols(s: Scope | null, nameSet: UsedNames, scopeSet1: ScopeSet, scopeSet2: ScopeSet): void;
/**
 * @param {string} oldName old name
 * @param {UsedNames} usedNamed1 used named 1
 * @param {UsedNames} usedNamed2 used named 2
 * @param {string} extraInfo extra info
 * @returns {string} found new name
 */
export function findNewName(oldName: string, usedNamed1: UsedNames, usedNamed2: UsedNames, extraInfo: string): string;
/**
 * @param {Variable} variable variable
 * @returns {Reference[]} references
 */
export function getAllReferences(variable: Variable): Reference[];
/**
 * @param {Node | Node[]} ast ast
 * @param {Node} node node
 * @returns {undefined | Node[]} result
 */
export function getPathInAst(ast: Node | Node[], node: Node): undefined | Node[];
/** @typedef {{ usedNames: UsedNames, alreadyCheckedScopes: ScopeSet }} ScopeInfo */
/**
 * @param {Map<string, ScopeInfo>} usedNamesInScopeInfo used names in scope info
 * @param {string} module module identifier
 * @param {string} id export id
 * @returns {ScopeInfo} info
 */
export function getUsedNamesInScopeInfo(usedNamesInScopeInfo: Map<string, ScopeInfo>, module: string, id: string): ScopeInfo;
