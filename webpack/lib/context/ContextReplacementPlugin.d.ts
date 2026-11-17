export = ContextReplacementPlugin;
declare class ContextReplacementPlugin {
    /**
     * Creates an instance of ContextReplacementPlugin.
     * @param {RegExp} resourceRegExp A regular expression that determines which files will be selected
     * @param {(string | ((context: BeforeContextResolveData | AfterContextResolveData) => void) | RegExp | boolean)=} newContentResource A new resource to replace the match
     * @param {(boolean | NewContentCreateContextMap | RegExp)=} newContentRecursive If true, all subdirectories are searched for matches
     * @param {RegExp=} newContentRegExp A regular expression that determines which files will be selected
     */
    constructor(resourceRegExp: RegExp, newContentResource?: (string | ((context: BeforeContextResolveData | AfterContextResolveData) => void) | RegExp | boolean) | undefined, newContentRecursive?: (boolean | NewContentCreateContextMap | RegExp) | undefined, newContentRegExp?: RegExp | undefined);
    /** @type {RegExp} */
    resourceRegExp: RegExp;
    newContentCallback: (context: BeforeContextResolveData | AfterContextResolveData) => void;
    /** @type {string | undefined} */
    newContentResource: string | undefined;
    /**
     * Stores new content create context map.
     * @param {InputFileSystem} fs input file system
     * @param {(err: null | Error, newContentRecursive: NewContentCreateContextMap) => void} callback callback
     */
    newContentCreateContextMap: (fs: InputFileSystem, callback: (err: null | Error, newContentRecursive: NewContentCreateContextMap) => void) => void;
    /** @type {boolean | undefined} */
    newContentRecursive: boolean | undefined;
    /** @type {RegExp | undefined} */
    newContentRegExp: RegExp | undefined;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ContextReplacementPlugin {
    export { NewContentCreateContextMap };
}
import type { BeforeContextResolveData } from "./ContextModuleFactory";
import type { AfterContextResolveData } from "./ContextModuleFactory";
import type { InputFileSystem } from "../fs/fs";
import type Compiler from "../Compiler";
type NewContentCreateContextMap = Record<string, string>;
