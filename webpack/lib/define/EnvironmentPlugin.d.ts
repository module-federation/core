export = EnvironmentPlugin;
declare class EnvironmentPlugin {
    /**
     * Creates an instance of EnvironmentPlugin.
     * @param {(string | string[] | JsonObject)[]} keys keys
     */
    constructor(...keys: (string | string[] | JsonObject)[]);
    /** @type {string[]} */
    keys: string[];
    /** @type {JsonObject} */
    defaultValues: JsonObject;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type { JsonObject } from "../fs/fs";
import type Compiler from "../Compiler";
