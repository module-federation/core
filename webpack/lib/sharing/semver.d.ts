export function parseRange(str: string): SemVerRange;
export function stringifyHoley(json: SemVerRange | string | number | false | undefined): string;
export function parseVersionRuntimeCode(runtimeTemplate: RuntimeTemplate): string;
export function versionLtRuntimeCode(runtimeTemplate: RuntimeTemplate): string;
export function rangeToStringRuntimeCode(runtimeTemplate: RuntimeTemplate): string;
export function satisfyRuntimeCode(runtimeTemplate: RuntimeTemplate): string;
export type VersionValue = string | number;
export type SemVerRangeItem = VersionValue | undefined;
export type SemVerRange = (SemVerRangeItem | SemVerRangeItem[])[];
/** @import RuntimeTemplate from "../template/RuntimeTemplate" */
/** @typedef {string | number} VersionValue */
/** @typedef {VersionValue | undefined} SemVerRangeItem */
/** @typedef {(SemVerRangeItem | SemVerRangeItem[])[]} SemVerRange */
/**
 * Returns parsed version.
 * @param {string} str version string
 * @returns {SemVerRange} parsed version
 */
export function parseVersion(str: string): SemVerRange;
/**
 * Returns true, iff a < b.
 * @param {string} a version
 * @param {string} b version
 * @returns {boolean} true, iff a < b
 */
export function versionLt(a: string, b: string): boolean;
/**
 * Returns the string.
 * @param {SemVerRange} range
 * @returns {string}
 */
export function rangeToString(range: SemVerRange): string;
/**
 * Returns if version satisfy the range.
 * @param {SemVerRange} range version range
 * @param {string} version the version
 * @returns {boolean} if version satisfy the range
 */
export function satisfy(range: SemVerRange, version: string): boolean;
import type RuntimeTemplate from "../template/RuntimeTemplate";
