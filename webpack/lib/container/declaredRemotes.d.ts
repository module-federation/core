/**
 * Records declared names, adding to any a previous application made.
 * @param {Compilation} compilation the compilation
 * @param {Iterable<string>} names what this application declared
 * @returns {void}
 */
export function addDeclaredRemotes(compilation: Compilation, names: Iterable<string>): void;
/**
 * The remote names this build declared, in declaration order, which is the
 * order `factorize` resolves a request against them in.
 * @param {Compilation} compilation the compilation
 * @returns {Set<string> | undefined} the declared names, when any were declared
 */
export function getDeclaredRemotes(compilation: Compilation): Set<string> | undefined;
import type Compilation from "../Compilation";
