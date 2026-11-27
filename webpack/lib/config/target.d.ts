/**
 * Defines the platform target properties type used by this module.
 */
export type PlatformTargetProperties = {
    /**
     * web platform, importing of http(s) and std: is available
     */
    web?: (boolean | null) | undefined;
    /**
     * browser platform, running in a normal web browser
     */
    browser?: (boolean | null) | undefined;
    /**
     * (Web)Worker platform, running in a web/shared/service worker
     */
    webworker?: (boolean | null) | undefined;
    /**
     * node platform, require of node built-in modules is available
     */
    node?: (boolean | null) | undefined;
    /**
     * deno platform, node built-in modules (via the `node:` specifier) and web APIs are available
     */
    deno?: (boolean | null) | undefined;
    /**
     * bun platform, bun and node built-in modules are available
     */
    bun?: (boolean | null) | undefined;
    /**
     * nwjs platform, require of legacy nw.gui is available
     */
    nwjs?: (boolean | null) | undefined;
    /**
     * electron platform, require of some electron built-in modules is available
     */
    electron?: (boolean | null) | undefined;
    /**
     * universal ESM target spanning both web and node (target `"universal"` or `["web", "node"]`)
     */
    universal?: (boolean | null) | undefined;
};
/**
 * Defines the electron context target properties type used by this module.
 */
export type ElectronContextTargetProperties = {
    /**
     * in main context
     */
    electronMain: boolean | null;
    /**
     * in preload context
     */
    electronPreload: boolean | null;
    /**
     * in renderer context with node integration
     */
    electronRenderer: boolean | null;
};
/**
 * Defines the api target properties type used by this module.
 */
export type ApiTargetProperties = {
    /**
     * has require function available
     */
    require: boolean | null;
    /**
     * has node.js built-in modules available
     */
    nodeBuiltins: boolean | null;
    /**
     * node.js allows to use `node:` prefix for core modules
     */
    nodePrefixForCoreModules: boolean | null;
    /**
     * node.js exposes `process.getBuiltinModule()` to synchronously load core modules
     */
    nodeBuiltinModuleGetter: boolean | null;
    /**
     * node.js allows to use `import.meta.dirname` and `import.meta.filename`
     */
    importMetaDirnameAndFilename: boolean | null;
    /**
     * has document available (allows script tags)
     */
    document: boolean | null;
    /**
     * supports `<link rel="modulepreload">` (optional; absent means "assume supported")
     */
    modulePreload?: (boolean | null) | undefined;
    /**
     * has importScripts available
     */
    importScripts: boolean | null;
    /**
     * has importScripts available when creating a worker
     */
    importScriptsInWorker: boolean | null;
    /**
     * has fetch function available for WebAssembly
     */
    fetchWasm: boolean | null;
    /**
     * has global variable available
     */
    global: boolean | null;
};
/**
 * Defines the ecma target properties type used by this module.
 */
export type EcmaTargetProperties = {
    /**
     * has globalThis variable available
     */
    globalThis: boolean | null;
    /**
     * `Symbol` is available
     */
    symbol: boolean | null;
    /**
     * `Object.hasOwn` is available
     */
    hasOwn: boolean | null;
    /**
     * big int literal syntax is available
     */
    bigIntLiteral: boolean | null;
    /**
     * const variable declarations are available
     */
    const: boolean | null;
    /**
     * let variable declarations are available
     */
    let: boolean | null;
    /**
     * logical assignment operators (`||=`, `&&=`, `??=`) are available
     */
    logicalAssignment: boolean | null;
    /**
     * object method shorthand is available
     */
    methodShorthand: boolean | null;
    /**
     * arrow functions are available
     */
    arrowFunction: boolean | null;
    /**
     * for of iteration is available
     */
    forOf: boolean | null;
    /**
     * destructuring is available
     */
    destructuring: boolean | null;
    /**
     * async import() is available
     */
    dynamicImport: boolean | null;
    /**
     * async import() is available when creating a worker
     */
    dynamicImportInWorker: boolean | null;
    /**
     * ESM syntax is available (when in module)
     */
    module: boolean | null;
    /**
     * optional chaining is available
     */
    optionalChaining: boolean | null;
    /**
     * spread and rest in array/object literals and calls is available
     */
    spread: boolean | null;
    /**
     * template literal is available
     */
    templateLiteral: boolean | null;
    /**
     * async functions and await are available
     */
    asyncFunction: boolean | null;
    /**
     * generator functions and yield are available
     */
    generator: boolean | null;
    /**
     * top-level await is available
     */
    topLevelAwait: boolean | null;
    /**
     * deferred evaluation (`import defer`, `import.defer()`) is available (optional; absent means "assume unavailable")
     */
    deferImport?: (boolean | null) | undefined;
    /**
     * source phase imports (`import source`, `import.source()`) are available (optional; absent means "assume unavailable")
     */
    sourceImport?: (boolean | null) | undefined;
};
/**
 * <T>
 */
export type Never<T> = { [P in keyof T]?: never; };
/**
 * <A, B>
 */
export type Mix<A, B> = (A & Never<B>) | (Never<A> & B) | (A & B);
export type TargetProperties = Mix<Mix<PlatformTargetProperties, ElectronContextTargetProperties>, Mix<ApiTargetProperties, EcmaTargetProperties>>;
/**
 * Gets default target.
 * @param {string} context the context directory
 * @returns {string} default target
 */
export function getDefaultTarget(context: string): string;
/**
 * Gets target properties.
 * @param {string} target the target
 * @param {string} context the context directory
 * @returns {TargetProperties} target properties
 */
export function getTargetProperties(target: string, context: string): TargetProperties;
/**
 * The raw browserslist selection behind the targets (`["chrome 100", …]`), merged
 * across every `browserslist` target and deduplicated — undefined when none is
 * one, and prefixing stays off with no browser list to prefix for.
 * @param {string[]} targets the targets
 * @param {string} context the context directory
 * @returns {string[] | undefined} the selected browsers, or undefined
 */
export function getTargetsBrowsers(targets: string[], context: string): string[] | undefined;
/**
 * Gets targets properties.
 * @param {string[]} targets the targets
 * @param {string} context the context directory
 * @returns {TargetProperties} target properties
 */
export function getTargetsProperties(targets: string[], context: string): TargetProperties;
