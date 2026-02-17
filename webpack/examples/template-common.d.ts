/**
 * @param {string} template template
 * @param {string} prefix prefix
 * @returns {boolean} true when need results, otherwise false
 */
export function needResults(template: string, prefix: string): boolean;
/**
 * @param {string} template template
 * @returns {string} template with base replacements
 */
export function replaceBase(template: string): string;
/**
 * @param {string} template template
 * @param {string} baseDir base dir
 * @param {string} stdout stdout
 * @param {string} prefix prefix
 * @returns {string} template with replacements
 */
export function replaceResults(
  template: string,
  baseDir: string,
  stdout: string,
  prefix: string,
): string;
