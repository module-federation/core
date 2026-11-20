export type DescriptionFile = {
    data: JsonObject;
    path: string;
};
/** @typedef {{ data: JsonObject, path: string }} DescriptionFile */
/**
 * Gets description file.
 * @param {InputFileSystem} fs file system
 * @param {string} directory directory to start looking into
 * @param {string[]} descriptionFiles possible description filenames
 * @param {(err?: Error | null, descriptionFile?: DescriptionFile, paths?: string[]) => void} callback callback
 * @param {(descriptionFile?: DescriptionFile) => boolean} satisfiesDescriptionFileData file data compliance check
 * @param {Set<string>} checkedFilePaths set of file paths that have been checked
 */
export function getDescriptionFile(fs: InputFileSystem, directory: string, descriptionFiles: string[], callback: (err?: Error | null, descriptionFile?: DescriptionFile, paths?: string[]) => void, satisfiesDescriptionFileData: (descriptionFile?: DescriptionFile) => boolean, checkedFilePaths?: Set<string>): void;
/**
 * Gets required version from description file.
 * @param {JsonObject} data description file data i.e.: package.json
 * @param {string} packageName name of the dependency
 * @returns {string | undefined} normalized version
 */
export function getRequiredVersionFromDescriptionFile(data: JsonObject, packageName: string): string | undefined;
/**
 * Checks whether this object is required version.
 * @param {string} str maybe required version
 * @returns {boolean} true, if it looks like a version
 */
export function isRequiredVersion(str: string): boolean;
/**
 * Normalizes version.
 * @see https://docs.npmjs.com/cli/v7/configuring-npm/package-json#urls-as-dependencies
 * @param {string} versionDesc version to be normalized
 * @returns {string} normalized version
 */
export function normalizeVersion(versionDesc: string): string;
/**
 * Tests the request remainder under a prefix key against `include`/`exclude` request filters.
 * @param {string} remainder request after the prefix
 * @param {SharedModuleFilter=} include only share matching requests
 * @param {SharedModuleFilter=} exclude don't share matching requests
 * @returns {boolean} true, when the request should be shared
 */
export function matchesRequestFilters(remainder: string, include?: SharedModuleFilter | undefined, exclude?: SharedModuleFilter | undefined): boolean;
/**
 * Tests a module version against `include`/`exclude` version filters; an unknown version fails `include`.
 * @param {string | false | undefined} version version of the module
 * @param {SharedModuleFilter=} include only share matching versions
 * @param {SharedModuleFilter=} exclude don't share matching versions
 * @returns {boolean} true, when the version should be shared
 */
export function matchesVersionFilters(version: string | false | undefined, include?: SharedModuleFilter | undefined, exclude?: SharedModuleFilter | undefined): boolean;
import type { JsonObject } from "../fs/fs";
import type { InputFileSystem } from "../fs/fs";
import type { SharedModuleFilter } from "./SharePlugin";
