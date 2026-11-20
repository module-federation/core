declare namespace _exports {
    export { ModuleId, HotData, DisposeHandler, AcceptCallback, AcceptErrorHandler, StatusHandler, ApplyOptions, ApplyFn, EnsureChunk, AnalyzableChunkImport, WebpackRequire, ApplyResult, ApplyHandler, InvalidateModuleHandler, CssUpdateManifest, DownloadUpdateHandler, HMRManifest, HotModule, Hot, InterceptOptions };
}
declare function _exports(): void;
export = _exports;
type ModuleId = string | number;
type HotData = object;
type DisposeHandler = (data: HotData) => void;
type AcceptCallback = (outdatedDependencies: ModuleId[]) => void;
type AcceptErrorHandler = (err: Error, context: {
    moduleId: ModuleId;
    dependencyId?: ModuleId;
    module?: HotModule;
}) => void;
type StatusHandler = (status: string) => (Promise<void> | void);
type ApplyOptions = import("./JavascriptHotModuleReplacement.runtime").ApplyOptions;
type ApplyFn = (reportError: (err: Error) => void) => Promise<ModuleId[]>;
type EnsureChunk = (chunkId: ModuleId, fetchPriority?: string) => Promise<void[] | void>;
type AnalyzableChunkImport = <T>(chunkId: ModuleId, importFn: () => Promise<T>) => Promise<T>;
type WebpackRequire = {
    (id: ModuleId): unknown;
    e?: EnsureChunk;
    ei?: AnalyzableChunkImport;
    [name: string]: unknown;
};
type ApplyResult = {
    /**
     * fatal error that aborts the update
     */
    error?: Error | undefined;
    /**
     * dispose phase of the update
     */
    dispose?: (() => void) | undefined;
    /**
     * apply phase of the update
     */
    apply?: ApplyFn | undefined;
};
type ApplyHandler = (options: ApplyOptions) => ApplyResult;
type InvalidateModuleHandler = (moduleId: ModuleId, applyHandlers: ApplyHandler[]) => void;
type CssUpdateManifest = {
    /**
     * updated chunk ids that no longer have a stylesheet
     */
    r: ModuleId[];
    /**
     * the stylesheet name of each updated chunk whose name moved with its content
     */
    n?: Record<string, string> | undefined;
};
type DownloadUpdateHandler = (chunkIds: ModuleId[], removedChunks: ModuleId[], removedModules: ModuleId[], promises: (Promise<void> | undefined)[], applyHandlers: ApplyHandler[], updatedModulesList: ModuleId[], css: CssUpdateManifest | undefined, forceLoadChunks: ModuleId[] | undefined) => void;
type HMRManifest = {
    /**
     * updated chunk ids
     */
    c: ModuleId[];
    /**
     * removed chunk ids
     */
    r: ModuleId[];
    /**
     * removed module ids
     */
    m: ModuleId[];
    /**
     * what the stylesheet loader needs to know about the update
     */
    css?: CssUpdateManifest | undefined;
    /**
     * chunk ids to force-load
     */
    f?: ModuleId[] | undefined;
};
type HotModule = {
    /**
     * module id
     */
    id: ModuleId;
    /**
     * hot API of the module
     */
    hot: Hot;
    /**
     * ids of modules requiring this module
     */
    parents: ModuleId[];
    /**
     * ids of modules required by this module
     */
    children: ModuleId[];
};
type Hot = {
    /**
     * accept callbacks by dependency id
     */
    _acceptedDependencies: Record<ModuleId, AcceptCallback>;
    /**
     * error handlers by dependency id
     */
    _acceptedErrorHandlers: Record<ModuleId, AcceptErrorHandler | undefined>;
    /**
     * declined dependency ids
     */
    _declinedDependencies: Record<ModuleId, boolean>;
    /**
     * true or the self-accept error handler
     */
    _selfAccepted: boolean | AcceptErrorHandler;
    /**
     * module declined itself
     */
    _selfDeclined: boolean;
    /**
     * module invalidated itself
     */
    _selfInvalidated: boolean;
    /**
     * registered dispose handlers
     */
    _disposeHandlers: DisposeHandler[];
    /**
     * module is the entry of the update
     */
    _main: boolean;
    /**
     * re-require the module on apply
     */
    _requireSelf: () => void;
    /**
     * module is not disposed
     */
    active: boolean;
    /**
     * accept updates
     */
    accept: (dep?: ModuleId | ModuleId[] | AcceptErrorHandler, callback?: AcceptCallback, errorHandler?: AcceptErrorHandler) => void;
    /**
     * decline updates
     */
    decline: (dep?: ModuleId | ModuleId[]) => void;
    /**
     * add a dispose handler
     */
    dispose: (callback: DisposeHandler) => void;
    /**
     * add a dispose handler
     */
    addDisposeHandler: (callback: DisposeHandler) => void;
    /**
     * remove a dispose handler
     */
    removeDisposeHandler: (callback: DisposeHandler) => void;
    /**
     * invalidate the module
     */
    invalidate: () => void;
    /**
     * check for an update
     */
    check: (applyOnUpdate?: boolean | ApplyOptions) => Promise<ModuleId[] | null>;
    /**
     * apply a checked update
     */
    apply: (options?: ApplyOptions) => Promise<ModuleId[]>;
    /**
     * get status or add a status handler
     */
    status: (l?: StatusHandler) => string | void;
    /**
     * add a status handler
     */
    addStatusHandler: (l: StatusHandler) => void;
    /**
     * remove a status handler
     */
    removeStatusHandler: (l: StatusHandler) => void;
    /**
     * data left from the previous dispose
     */
    data: HotData;
};
type InterceptOptions = {
    module: HotModule;
    require: WebpackRequire;
    id: ModuleId;
};
