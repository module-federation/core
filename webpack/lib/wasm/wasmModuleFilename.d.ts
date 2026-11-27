/**
 * The compilation-hash half of the `getPath` data for interpolating
 * `output.webassemblyModuleFilename` into runtime code.
 * @param {Compilation} compilation the compilation
 * @returns {{ hash: string, hashWithLength: (length: number) => string, hashWithDigest: (digest: string, length?: number) => string }} the fields
 */
export function fullHashPathData(compilation: Compilation): {
    hash: string;
    hashWithLength: (length: number) => string;
    hashWithDigest: (digest: string, length?: number) => string;
};
/** @import Compilation from "../Compilation" */
/**
 * Whether the runtime needs `getFullHash` to build a binary's name. A `[hash]` next to
 * a module resolves to that module's hash, not the compilation's, so only the explicit
 * `[fullhash]` spelling asks for it — and a digest is inlined rather than read.
 * @param {string} filename `output.webassemblyModuleFilename`
 * @returns {boolean} true when the runtime reads the compilation hash
 */
export function needsRuntimeFullHash(filename: string): boolean;
import type Compilation from "../Compilation";
