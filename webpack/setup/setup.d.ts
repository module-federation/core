export namespace effects {
    let spawn: typeof childProcess.spawn;
    let existsSync: typeof fs.existsSync;
    let lstatSync: typeof fs.lstatSync;
    let symlinkSync: typeof fs.symlinkSync;
}
/**
 * Whether a person is watching: both streams a terminal, and `CI` unset. Any
 * other environment, including one this predates, takes the safe path.
 * @returns {boolean} result
 */
export function isInteractive(): boolean;
/**
 * Returns the exit code rather than setting it, so a caller can observe the
 * outcome without reading global state.
 * @returns {Promise<number>} the exit code
 */
export function setup(): Promise<number>;
import childProcess = require("child_process");
import fs = require("fs");
