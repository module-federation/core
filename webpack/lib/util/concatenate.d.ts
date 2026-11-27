export type UsedNames = Set<string>;
export type ScopeSet = Set<Scope>;
export type ScopeInfo = {
    usedNames: UsedNames;
    alreadyCheckedScopes: ScopeSet;
};
export type UsedNamesInScopeInfo = Map<string, Map<string, ScopeInfo>>;
export const CHUNK_RUNTIME_DECLARATIONS: Set<string>;
/** @import { Identifier } from "estree" */
/** @import { Optimization } from "../../declarations/WebpackOptions" */
/**
 * @import {
 * 	Scope,
 * 	Reference,
 * 	Variable
 * } from "../javascript/JavascriptModulesPlugin"
 */
/** @typedef {Set<string>} UsedNames */
export const DEFAULT_EXPORT: "__WEBPACK_DEFAULT_EXPORT__";
export const NAMESPACE_OBJECT_EXPORT: "__WEBPACK_NAMESPACE_OBJECT__";
export const RESERVED_NAMES: Set<string>;
/** @typedef {Set<Scope>} ScopeSet */
/**
 * Adds scope symbols.
 * @param {Scope | null} s scope
 * @param {UsedNames} nameSet name set
 * @param {ScopeSet} scopeSet1 scope set 1
 * @param {ScopeSet} scopeSet2 scope set 2
 */
export function addScopeSymbols(s: Scope | null, nameSet: UsedNames, scopeSet1: ScopeSet, scopeSet2: ScopeSet): void;
/**
 * Returns found new name.
 * @param {string} oldName old name
 * @param {UsedNames} usedNamed1 used named 1
 * @param {UsedNames} usedNamed2 used named 2
 * @param {string} extraInfo extra info
 * @returns {string} found new name
 */
export function findNewName(oldName: string, usedNamed1: UsedNames, usedNamed2: UsedNames, extraInfo: string): string;
/**
 * Gets all references.
 * @param {Variable} variable variable
 * @returns {Reference[]} references
 */
export function getAllReferences(variable: Variable): Reference[];
/** @typedef {{ usedNames: UsedNames, alreadyCheckedScopes: ScopeSet }} ScopeInfo */
/** @typedef {Map<string, Map<string, ScopeInfo>>} UsedNamesInScopeInfo */
/**
 * Gets used names in scope info.
 * @param {UsedNamesInScopeInfo} usedNamesInScopeInfo used names in scope info
 * @param {string} module module identifier
 * @param {string} id export id
 * @returns {ScopeInfo} info
 */
export function getUsedNamesInScopeInfo(usedNamesInScopeInfo: UsedNamesInScopeInfo, module: string, id: string): ScopeInfo;
/**
 * Whether CommonJS modules and require edges take part in concatenation.
 * @param {Optimization["concatenateModules"]} concatenateModules the optimization.concatenateModules option
 * @returns {boolean} true when CommonJS concatenation is enabled
 */
export function isCommonJsConcatenationEnabled(concatenateModules: Optimization["concatenateModules"]): boolean;
/**
 * Renames every identifier of a printed expression that the map names, keeping
 * property names and string contents as they are.
 * @param {string} expression the expression as printed
 * @param {Map<string, string>} renames original to new name
 * @returns {string} the expression over the new names
 * @example
 * const renames = new Map([["store", "entry_store"], ["x", "entry_x"]]);
 * renameIdentifiers("store.x", renames) === "entry_store.x"
 * renameIdentifiers('store["a-b"]', renames) === 'entry_store["a-b"]'
 * renameIdentifiers("store/* .x *\/.c", renames) === "entry_store/* .x *\/.c"
 * renameIdentifiers("(store_default())", renames) === "(store_default())"
 * renameIdentifiers("/* reads x *\/ x", renames) === "/* reads entry_x *\/ entry_x"
 */
export function renameIdentifiers(expression: string, renames: Map<string, string>): string;
import type { Scope } from "../javascript/JavascriptModulesPlugin";
import type { Variable } from "../javascript/JavascriptModulesPlugin";
import type { Reference } from "../javascript/JavascriptModulesPlugin";
import type { Optimization } from "../../declarations/WebpackOptions";
