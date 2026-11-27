export = importOptionsCheck;
/** @import RuntimeTemplate from "../../template/RuntimeTemplate" */
/**
 * Wraps an import so its arguments evaluate in source order and the options are
 * checked, rejecting rather than throwing. The last parameter holds them.
 * @param {RuntimeTemplate} runtimeTemplate the runtime template
 * @param {string[]} parameters parameter names, the options one last
 * @param {string} content the import expression to return once the check passes
 * @returns {string} the wrapping function
 */
declare function importOptionsCheck(runtimeTemplate: RuntimeTemplate, parameters: string[], content: string): string;
import type RuntimeTemplate from "../../template/RuntimeTemplate";
