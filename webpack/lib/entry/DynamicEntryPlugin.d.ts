export = DynamicEntryPlugin;
/** @typedef {() => EntryStatic | Promise<EntryStatic>} RawEntryDynamic */
/** @typedef {() => Promise<EntryStaticNormalized>} EntryDynamic */
declare class DynamicEntryPlugin {
    /**
     * Creates an instance of DynamicEntryPlugin.
     * @param {string} context the context path
     * @param {EntryDynamic} entry the entry value
     */
    constructor(context: string, entry: EntryDynamic);
    /** @type {string} */
    context: string;
    /** @type {EntryDynamic} */
    entry: EntryDynamic;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace DynamicEntryPlugin {
    export { RawEntryDynamic, EntryDynamic };
}
import type Compiler from "../Compiler";
type RawEntryDynamic = () => EntryStatic | Promise<EntryStatic>;
type EntryDynamic = () => Promise<EntryStaticNormalized>;
import type { EntryStatic } from "../../declarations/WebpackOptions.d.ts";
import type { EntryStaticNormalized } from "../../declarations/WebpackOptions.d.ts";
