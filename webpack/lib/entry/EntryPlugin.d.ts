export = EntryPlugin;
declare class EntryPlugin {
    /**
     * Creates a dependency.
     * @param {string} entry entry request
     * @param {EntryOptions | string} options entry options (passing string is deprecated)
     * @returns {EntryDependency} the dependency
     */
    static createDependency(entry: string, options: EntryOptions | string): EntryDependency;
    /**
     * An entry plugin which will handle creation of the EntryDependency
     * @param {string} context context path
     * @param {string} entry entry path
     * @param {EntryOptions | string=} options entry options (passing a string is deprecated)
     */
    constructor(context: string, entry: string, options?: (EntryOptions | string) | undefined);
    /** @type {string} */
    context: string;
    /** @type {string} */
    entry: string;
    options: string | EntryOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type { EntryOptions } from "../graph/Entrypoint";
import type Compiler from "../Compiler";
import EntryDependency = require("./EntryDependency");
