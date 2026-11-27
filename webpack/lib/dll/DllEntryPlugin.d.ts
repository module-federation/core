export = DllEntryPlugin;
declare class DllEntryPlugin {
    /**
     * Creates an instance of DllEntryPlugin.
     * @param {string} context context
     * @param {Entries} entries entry names
     * @param {Options} options options
     */
    constructor(context: string, entries: Entries, options: Options);
    /** @type {string} */
    context: string;
    /** @type {Entries} */
    entries: Entries;
    /** @type {Options} */
    options: Options;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace DllEntryPlugin {
    export { Entries, Options };
}
import type Compiler from "../Compiler";
type Entries = string[];
type Options = EntryOptions & {
    name: string;
};
import type { EntryOptions } from "../graph/Entrypoint";
