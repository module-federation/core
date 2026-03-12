export type InputFileSystem = import('../util/fs').InputFileSystem;
export type JsonObject = import('../util/fs').JsonObject;
export type JsonPrimitive = import('../util/fs').JsonPrimitive;
export type DescriptionFile = {
  data: JsonObject;
  path: string;
};
/** @typedef {{ data: JsonObject, path: string }} DescriptionFile */
/**
 * @param {InputFileSystem} fs file system
 * @param {string} directory directory to start looking into
 * @param {string[]} descriptionFiles possible description filenames
 * @param {(err?: Error | null, descriptionFile?: DescriptionFile, paths?: string[]) => void} callback callback
 * @param {(descriptionFile?: DescriptionFile) => boolean} satisfiesDescriptionFileData file data compliance check
 * @param {Set<string>} checkedFilePaths set of file paths that have been checked
 */
export function getDescriptionFile(
  fs: InputFileSystem,
  directory: string,
  descriptionFiles: string[],
  callback: (
    err?: Error | null,
    descriptionFile?: DescriptionFile,
    paths?: string[],
  ) => void,
  satisfiesDescriptionFileData: (descriptionFile?: DescriptionFile) => boolean,
  checkedFilePaths?: Set<string>,
): void;
/**
 * @param {JsonObject} data description file data i.e.: package.json
 * @param {string} packageName name of the dependency
 * @returns {string | undefined} normalized version
 */
export function getRequiredVersionFromDescriptionFile(
  data: JsonObject,
  packageName: string,
): string | undefined;
/**
 * @param {string} str maybe required version
 * @returns {boolean} true, if it looks like a version
 */
export function isRequiredVersion(str: string): boolean;
/**
 * @see https://docs.npmjs.com/cli/v7/configuring-npm/package-json#urls-as-dependencies
 * @param {string} versionDesc version to be normalized
 * @returns {string} normalized version
 */
export function normalizeVersion(versionDesc: string): string;
