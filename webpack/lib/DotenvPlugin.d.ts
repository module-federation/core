export = DotenvPlugin;
declare class DotenvPlugin {
    /**
     * @param {DotenvPluginOptions=} options options object
     */
    constructor(options?: DotenvPluginOptions | undefined);
    options: {
        dir?: false | string;
        prefix?: string[] | string;
        template?: string[];
    };
    /**
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
    /**
     * Get list of env files to load based on mode and template
     * Similar to Vite's getEnvFilesForMode
     * @private
     * @param {InputFileSystem} inputFileSystem the input file system
     * @param {string | false} dir the directory containing .env files
     * @param {string | undefined} mode the mode (e.g., 'production', 'development')
     * @returns {string[]} array of file paths to load
     */
    private _getEnvFilesForMode;
    /**
     * Get parsed env variables from `.env` files
     * @private
     * @param {InputFileSystem} fs input file system
     * @param {string} dir dir to load `.env` files
     * @param {string} mode mode
     * @returns {Promise<{parsed: Env, fileDependencies: string[], missingDependencies: string[]}>} parsed env variables and dependencies
     */
    private _getParsed;
    /**
     * @private
     * @param {Compiler} compiler compiler
     * @param {ItemCacheFacade} itemCache item cache facade
     * @param {string} dir directory to read
     * @returns {Promise<{ parsed: Env, snapshot: Snapshot }>} parsed result and snapshot
     */
    private _loadEnv;
    /**
     * Generate env variables
     * @private
     * @param {Prefix} prefixes expose only environment variables that start with these prefixes
     * @param {Env} parsed parsed env variables
     * @returns {Env} env variables
     */
    private _getEnv;
    /**
     * Load a file with proper path resolution
     * @private
     * @param {InputFileSystem} fs the input file system
     * @param {string} file the file to load
     * @returns {Promise<string>} the content of the file
     */
    private _loadFile;
}
declare namespace DotenvPlugin {
    export { DotenvPluginOptions, Compiler, ItemCacheFacade, InputFileSystem, Snapshot, Prefix, Env };
}
type DotenvPluginOptions = import("../declarations/WebpackOptions").DotenvPluginOptions;
type Compiler = import("./Compiler");
type ItemCacheFacade = import("./CacheFacade").ItemCacheFacade;
type InputFileSystem = import("./util/fs").InputFileSystem;
type Snapshot = import("./FileSystemInfo").Snapshot;
type Prefix = Exclude<DotenvPluginOptions["prefix"], string | undefined>;
type Env = Record<string, string>;
