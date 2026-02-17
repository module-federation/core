export function parseRange(str: string): SemVerRange;
export function stringifyHoley(json: any): string;
export function parseVersionRuntimeCode(runtimeTemplate: any): string;
export function versionLtRuntimeCode(runtimeTemplate: any): string;
export function rangeToStringRuntimeCode(runtimeTemplate: any): string;
export function satisfyRuntimeCode(runtimeTemplate: any): string;
export type RuntimeTemplate = import('../RuntimeTemplate');
export type SemVerRange = (string | number | undefined | [])[];
/** @typedef {import("../RuntimeTemplate")} RuntimeTemplate */
/** @typedef {(string|number|undefined|[])[]} SemVerRange */
/**
 * @param {string} str version string
 * @returns {(string|number|undefined|[])[]} parsed version
 */
export function parseVersion(str: string): (string | number | undefined | [])[];
/**
 * @param {string} a version
 * @param {string} b version
 * @returns {boolean} true, iff a < b
 */
export function versionLt(a: string, b: string): boolean;
export function rangeToString(range: any): any;
/**
 * @param {SemVerRange} range version range
 * @param {string} version the version
 * @returns {boolean} if version satisfy the range
 */
export function satisfy(range: SemVerRange, version: string): boolean;
