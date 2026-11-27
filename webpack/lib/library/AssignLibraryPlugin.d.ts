export = AssignLibraryPlugin;
/** @typedef {string[] | "global"} LibraryPrefix */
/**
 * Defines the assign library plugin options type used by this module.
 * @typedef {object} AssignLibraryPluginOptions
 * @property {LibraryType} type
 * @property {LibraryPrefix} prefix name prefix
 * @property {string | false} declare declare name as variable
 * @property {"error" | "static" | "copy" | "assign"} unnamed behavior for unnamed library name
 * @property {"copy" | "assign"=} named behavior for named library name
 */
/** @typedef {string | string[]} LibraryName */
/**
 * Defines the assign library plugin parsed type used by this module.
 * @typedef {object} AssignLibraryPluginParsed
 * @property {LibraryName} name
 * @property {LibraryExport=} export
 */
/**
 * Represents the assign library plugin runtime component.
 * @typedef {AssignLibraryPluginParsed} T
 * @extends {AbstractLibraryPlugin<AssignLibraryPluginParsed>}
 */
declare class AssignLibraryPlugin extends AbstractLibraryPlugin<AssignLibraryPluginParsed> {
    /**
     * Creates an instance of AssignLibraryPlugin.
     * @param {AssignLibraryPluginOptions} options the plugin options
     */
    constructor(options: AssignLibraryPluginOptions);
    /** @type {AssignLibraryPluginOptions["prefix"]} */
    prefix: AssignLibraryPluginOptions["prefix"];
    /** @type {AssignLibraryPluginOptions["declare"]} */
    declare: AssignLibraryPluginOptions["declare"];
    /** @type {AssignLibraryPluginOptions["unnamed"]} */
    unnamed: AssignLibraryPluginOptions["unnamed"];
    /** @type {AssignLibraryPluginOptions["named"]} */
    named: AssignLibraryPluginOptions["named"];
    /**
     * Returns the prefix.
     * @param {Compilation} compilation the compilation
     * @returns {LibraryPrefix} the prefix
     */
    _getPrefix(compilation: Compilation): LibraryPrefix;
    /**
     * Get resolved full name.
     * @param {AssignLibraryPluginParsed} options the library options
     * @param {Chunk} chunk the chunk
     * @param {Compilation} compilation the compilation
     * @returns {string[]} the resolved full name
     */
    _getResolvedFullName(options: AssignLibraryPluginParsed, chunk: Chunk, compilation: Compilation): string[];
}
declare namespace AssignLibraryPlugin {
    export { LibraryContext, LibraryPrefix, AssignLibraryPluginOptions, LibraryName, AssignLibraryPluginParsed, T };
}
import AbstractLibraryPlugin = require("./AbstractLibraryPlugin");
import type Compilation from "../Compilation";
import type Chunk from "../graph/Chunk";
/**
 * <T>
 */
type LibraryContext<T> = import("./AbstractLibraryPlugin").LibraryContext<T>;
type LibraryPrefix = string[] | "global";
/**
 * Defines the assign library plugin options type used by this module.
 */
type AssignLibraryPluginOptions = {
    type: LibraryType;
    /**
     * name prefix
     */
    prefix: LibraryPrefix;
    /**
     * declare name as variable
     */
    declare: string | false;
    /**
     * behavior for unnamed library name
     */
    unnamed: "error" | "static" | "copy" | "assign";
    /**
     * behavior for named library name
     */
    named?: ("copy" | "assign") | undefined;
};
type LibraryName = string | string[];
/**
 * Defines the assign library plugin parsed type used by this module.
 */
type AssignLibraryPluginParsed = {
    name: LibraryName;
    export?: LibraryExport | undefined;
};
/**
 * Represents the assign library plugin runtime component.
 */
type T = AssignLibraryPluginParsed;
import type { LibraryType } from "../../declarations/WebpackOptions";
import type { LibraryExport } from "../../declarations/WebpackOptions";
