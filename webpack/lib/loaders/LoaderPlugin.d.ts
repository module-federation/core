export = LoaderPlugin;
declare class LoaderPlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace LoaderPlugin {
    export { ImportModuleCallback, ImportModuleOptions, LoadModuleCallback, ImportModuleMethod, LoaderPluginLoaderContext };
}
import type Compiler from "../Compiler";
/**
 * Defines the import module callback callback.
 */
type ImportModuleCallback = (err?: (Error | null) | undefined, exports?: ExecuteModuleExports | undefined) => void;
/**
 * Defines the import module options type used by this module.
 */
type ImportModuleOptions = {
    /**
     * the target layer
     */
    layer?: string | undefined;
    /**
     * the target public path
     */
    publicPath?: string | undefined;
    /**
     * target base uri
     */
    baseUri?: string | undefined;
};
type LoadModuleCallback = (err: Error | null, source?: (string | Buffer) | undefined, sourceMap?: (object | null) | undefined, module?: Module | undefined) => void;
/**
 * `importModule` takes a callback or, given none, answers with a promise, and
 * TypeScript reads an intersection of call signatures as an overload set
 */
type ImportModuleMethod = {
    (request: string, options: ImportModuleOptions | undefined, callback: ImportModuleCallback): void;
} & {
    (request: string, options?: ImportModuleOptions): Promise<ExecuteModuleExports>;
};
/**
 * These properties are added by the LoaderPlugin
 */
type LoaderPluginLoaderContext = {
    /**
     * Resolves the given request to a module, applies all configured loaders and calls
     * back with the generated source, the sourceMap and the module instance (usually an
     * instance of NormalModule). Use this function if you need to know the source code
     * of another module to generate the result.
     */
    loadModule: (request: string, callback: LoadModuleCallback) => void;
    importModule: ImportModuleMethod;
};
import type { ExecuteModuleExports } from "../Compilation";
import type Module from "../module/Module";
