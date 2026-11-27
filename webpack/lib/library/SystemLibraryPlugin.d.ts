export = SystemLibraryPlugin;
/** @import ExternalModule from "../externals/ExternalModule" */
/** @import { Source } from "webpack-sources" */
/**
 * @import {
 * 	LibraryOptions,
 * 	LibraryType
 * } from "../../declarations/WebpackOptions"
 */
/** @import Chunk from "../graph/Chunk" */
/** @import { ChunkHashContext } from "../Compilation" */
/** @import { ExportInfoName } from "../graph/Dependency" */
/** @import { RenderContext } from "../javascript/JavascriptModulesPlugin" */
/** @import Hash from "../util/Hash" */
/**
 * Defines the shared type used by this module.
 * @template T
 * @typedef {import("./AbstractLibraryPlugin").LibraryContext<T>} LibraryContext<T>
 */
/**
 * Defines the system library plugin options type used by this module.
 * @typedef {object} SystemLibraryPluginOptions
 * @property {LibraryType} type
 */
/**
 * Defines the system library plugin parsed type used by this module.
 * @typedef {object} SystemLibraryPluginParsed
 * @property {string} name
 */
/**
 * Represents the system library plugin runtime component.
 * @typedef {SystemLibraryPluginParsed} T
 * @extends {AbstractLibraryPlugin<SystemLibraryPluginParsed>}
 */
declare class SystemLibraryPlugin extends AbstractLibraryPlugin<SystemLibraryPluginParsed> {
    /**
     * Creates an instance of SystemLibraryPlugin.
     * @param {SystemLibraryPluginOptions} options the plugin options
     */
    constructor(options: SystemLibraryPluginOptions);
}
declare namespace SystemLibraryPlugin {
    export { LibraryContext, SystemLibraryPluginOptions, SystemLibraryPluginParsed, T };
}
import AbstractLibraryPlugin = require("./AbstractLibraryPlugin");
/**
 * <T>
 */
type LibraryContext<T> = import("./AbstractLibraryPlugin").LibraryContext<T>;
/**
 * Defines the system library plugin options type used by this module.
 */
type SystemLibraryPluginOptions = {
    type: LibraryType;
};
/**
 * Defines the system library plugin parsed type used by this module.
 */
type SystemLibraryPluginParsed = {
    name: string;
};
/**
 * Represents the system library plugin runtime component.
 */
type T = SystemLibraryPluginParsed;
import type { LibraryType } from "../../declarations/WebpackOptions";
