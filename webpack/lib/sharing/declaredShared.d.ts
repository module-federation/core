export type SharedDeclaration = {
    /**
     * the config key, as the config spells it
     */
    name: string;
    /**
     * the key the modules created for it carry
     */
    shareKey: string;
    /**
     * whether it shares everything under the key
     */
    prefix: boolean;
};
/**
 * Records declarations, appending when a build applies the plugin more than
 * once, as `ModuleFederationPlugin` and `SharePlugin` do.
 * @param {Compilation} compilation the compilation
 * @param {SharedDeclaration[]} declarations what this application declared
 * @returns {void}
 */
export function addDeclaredShared(compilation: Compilation, declarations: SharedDeclaration[]): void;
/**
 * What this build declared as shared, one entry per config key, since several
 * may name one share key. `performance.unusedConfig` matches modules on the
 * share key and reports the config key.
 * @param {Compilation} compilation the compilation
 * @returns {SharedDeclaration[] | undefined} the declarations, when any were made
 */
export function getDeclaredShared(compilation: Compilation): SharedDeclaration[] | undefined;
import type Compilation from "../Compilation";
