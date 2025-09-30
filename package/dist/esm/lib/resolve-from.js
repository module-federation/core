// source: https://github.com/sindresorhus/resolve-from
import path from 'path';
import isError from './is-error';
import { realpathSync } from './realpath';
const Module = require('module');
export const resolveFrom = (fromDirectory, moduleId, silent)=>{
    if (typeof fromDirectory !== 'string') {
        throw Object.defineProperty(new TypeError(`Expected \`fromDir\` to be of type \`string\`, got \`${typeof fromDirectory}\``), "__NEXT_ERROR_CODE", {
            value: "E537",
            enumerable: false,
            configurable: true
        });
    }
    if (typeof moduleId !== 'string') {
        throw Object.defineProperty(new TypeError(`Expected \`moduleId\` to be of type \`string\`, got \`${typeof moduleId}\``), "__NEXT_ERROR_CODE", {
            value: "E565",
            enumerable: false,
            configurable: true
        });
    }
    try {
        fromDirectory = realpathSync(fromDirectory);
    } catch (error) {
        if (isError(error) && error.code === 'ENOENT') {
            fromDirectory = path.resolve(fromDirectory);
        } else if (silent) {
            return;
        } else {
            throw error;
        }
    }
    const fromFile = path.join(fromDirectory, 'noop.js');
    const resolveFileName = ()=>Module._resolveFilename(moduleId, {
            id: fromFile,
            filename: fromFile,
            paths: Module._nodeModulePaths(fromDirectory)
        });
    if (silent) {
        try {
            return resolveFileName();
        } catch (error) {
            return;
        }
    }
    return resolveFileName();
};

//# sourceMappingURL=resolve-from.js.map