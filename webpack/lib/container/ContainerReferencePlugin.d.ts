export = ContainerReferencePlugin;
declare class ContainerReferencePlugin {
    /**
     * Creates an instance of ContainerReferencePlugin.
     * @param {ContainerReferencePluginOptions} options options
     */
    constructor(options: ContainerReferencePluginOptions);
    /** @type {ContainerReferencePluginOptions} */
    options: ContainerReferencePluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ContainerReferencePlugin {
    export { NonEmptyString, RemotesBranch1Item, RemotesObjectValue, ExternalsType, Remotes, RemotesConfig, RemotesItem, RemotesItems, RemotesObject, ContainerReferencePluginOptions };
}
import type Compiler from "../Compiler";
type NonEmptyString = string;
/**
 * Container locations and request scopes from which modules should be resolved and loaded at runtime.
 */
type RemotesBranch1Item = RemotesItem | RemotesObject;
/**
 * Container locations from which modules should be resolved and loaded at runtime.
 */
type RemotesObjectValue = RemotesConfig | RemotesItem | RemotesItems;
/**
 * Specifies the default type of externals ('amd*', 'umd*', 'system' and 'jsonp' depend on output.libraryTarget set to the same value).
 */
type ExternalsType = "var" | "module" | "assign" | "this" | "window" | "self" | "global" | "commonjs" | "commonjs2" | "commonjs-module" | "commonjs-static" | "amd" | "amd-require" | "amd-async" | "umd" | "umd2" | "jsonp" | "system" | "promise" | "import" | "module-import" | "script" | "node-commonjs" | "asset" | "asset-url" | "css-import" | "css-url";
/**
 * Container locations and request scopes from which modules should be resolved and loaded at runtime. When provided, property name is used as request scope, otherwise request scope is automatically inferred from container location.
 */
type Remotes = RemotesBranch1Item[] | RemotesObject;
/**
 * Advanced configuration for container locations from which modules should be resolved and loaded at runtime.
 */
type RemotesConfig = {
    /**
     * Container locations from which modules should be resolved and loaded at runtime.
     */
    external: RemotesItem | RemotesItems;
    /**
     * The name of the share scope shared with this remote.
     */
    shareScope?: NonEmptyString | undefined;
};
/**
 * Container location from which modules should be resolved and loaded at runtime.
 */
type RemotesItem = NonEmptyString;
/**
 * Container locations from which modules should be resolved and loaded at runtime.
 */
type RemotesItems = RemotesItem[];
/**
 * Container locations from which modules should be resolved and loaded at runtime. Property names are used as request scopes.
 */
type RemotesObject = {
    [key: string]: RemotesObjectValue;
};
type ContainerReferencePluginOptions = {
    /**
     * The external type of the remote containers.
     */
    remoteType: ExternalsType;
    remotes: Remotes;
    /**
     * The name of the share scope shared with all remotes (defaults to 'default').
     */
    shareScope?: NonEmptyString | undefined;
};
