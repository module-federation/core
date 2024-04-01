export function getRequiredVersionFromDescriptionFile(
  data: any,
  packageName: any,
): string;
export type InputFileSystem = import('../util/fs').InputFileSystem;
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
/**
 *
 * @param {InputFileSystem} fs file system
 * @param {string} directory directory to start looking into
 * @param {string[]} descriptionFiles possible description filenames
 * @param {function((Error | null)=, {data: object, path: string}=): void} callback callback
 */
export function getDescriptionFile(
  fs: InputFileSystem,
  directory: string,
  descriptionFiles: string[],
  callback: (
    arg0: (Error | null) | undefined,
    arg1:
      | {
          data: object;
          path: string;
        }
      | undefined,
  ) => void,
): void;
