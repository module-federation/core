export = EntryOptionPlugin;
declare class EntryOptionPlugin {
    /**
     * @param {Compiler} compiler the compiler
     * @returns {EntryOptionPluginHooks} the hooks
     */
    static getHooks(compiler: Compiler): EntryOptionPluginHooks;
    /**
     * Apply entry option.
     * @param {Compiler} compiler the compiler
     * @param {string} context context directory
     * @param {Entry} entry request
     * @returns {void}
     */
    static applyEntryOption(compiler: Compiler, context: string, entry: Entry): void;
    /**
     * Entry description to options.
     * @param {Compiler} compiler the compiler
     * @param {string} name entry name
     * @param {EntryDescription} desc entry description
     * @returns {EntryOptions} options for the entry
     */
    static entryDescriptionToOptions(compiler: Compiler, name: string, desc: EntryDescription): EntryOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance one is tapping into
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace EntryOptionPlugin {
    export { EntryOptionPluginHooks };
}
import type Compiler from "../Compiler";
import type { EntryNormalized as Entry } from "../../declarations/WebpackOptions.d.ts";
import type { EntryDescriptionNormalized as EntryDescription } from "../../declarations/WebpackOptions.d.ts";
import type { EntryOptions } from "../graph/Entrypoint";
type EntryOptionPluginHooks = {
    /**
     * transform an entry into a different request (e.g. wrap a non-HTML entry in a synthetic HTML module); return `undefined` to keep the default behavior
     */
    entry: SyncBailHook<[string, string, EntryDescription], string | undefined>;
};
import { SyncBailHook } from "tapable";
