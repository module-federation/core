export = ContextReplacementPlugin;
declare class ContextReplacementPlugin {
    /**
     * @param {RegExp} resourceRegExp A regular expression that determines which files will be selected
     * @param {(string | ((context: BeforeContextResolveData | AfterContextResolveData) => void) | RegExp | boolean)=} newContentResource A new resource to replace the match
     * @param {(boolean | NewContentCreateContextMap | RegExp)=} newContentRecursive If true, all subdirectories are searched for matches
     * @param {RegExp=} newContentRegExp A regular expression that determines which files will be selected
     */
    constructor(resourceRegExp: RegExp, newContentResource?: (string | ((context: BeforeContextResolveData | AfterContextResolveData) => void) | RegExp | boolean) | undefined, newContentRecursive?: (boolean | NewContentCreateContextMap | RegExp) | undefined, newContentRegExp?: RegExp | undefined);
    resourceRegExp: RegExp;
    newContentCallback: (context: BeforeContextResolveData | AfterContextResolveData) => void;
    newContentResource: string;
    /**
     * @param {InputFileSystem} fs input file system
     * @param {(err: null | Error, newContentRecursive: NewContentCreateContextMap) => void} callback callback
     */
    newContentCreateContextMap: (fs: InputFileSystem, callback: (err: null | Error, newContentRecursive: NewContentCreateContextMap) => void) => void;
    newContentRecursive: boolean;
    newContentRegExp: RegExp;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ContextReplacementPlugin {
    export { Compiler, ContextModuleOptions, BeforeContextResolveData, AfterContextResolveData, InputFileSystem, NewContentCreateContextMap };
}
type Compiler = import("./Compiler");
type ContextModuleOptions = import("./ContextModule").ContextModuleOptions;
type BeforeContextResolveData = import("./ContextModuleFactory").BeforeContextResolveData;
type AfterContextResolveData = import("./ContextModuleFactory").AfterContextResolveData;
type InputFileSystem = import("./util/fs").InputFileSystem;
type NewContentCreateContextMap = Record<string, string>;
