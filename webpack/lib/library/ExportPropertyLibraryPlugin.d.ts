export = ExportPropertyLibraryPlugin;
/** @import { Source } from "webpack-sources" */
/**
 * @import {
 * 	LibraryOptions,
 * 	LibraryType,
 * 	LibraryExport
 * } from "../../declarations/WebpackOptions"
 */
/** @import Chunk from "../graph/Chunk" */
/** @import Module, { RuntimeRequirements } from "../module/Module" */
/**
 * @import {
 * 	StartupRenderContext
 * } from "../javascript/JavascriptModulesPlugin"
 */
/**
 * Defines the shared type used by this module.
 * @template T
 * @typedef {import("./AbstractLibraryPlugin").LibraryContext<T>} LibraryContext<T>
 */
/**
 * Defines the export property library plugin parsed type used by this module.
 * @typedef {object} ExportPropertyLibraryPluginParsed
 * @property {LibraryExport=} export
 */
/**
 * Defines the export property library plugin options type used by this module.
 * @typedef {object} ExportPropertyLibraryPluginOptions
 * @property {LibraryType} type
 */
/**
 * Represents the export property library plugin runtime component.
 * @typedef {ExportPropertyLibraryPluginParsed} T
 * @extends {AbstractLibraryPlugin<ExportPropertyLibraryPluginParsed>}
 */
declare class ExportPropertyLibraryPlugin extends AbstractLibraryPlugin<ExportPropertyLibraryPluginParsed> {
    /**
     * Creates an instance of ExportPropertyLibraryPlugin.
     * @param {ExportPropertyLibraryPluginOptions} options options
     */
    constructor({ type }: ExportPropertyLibraryPluginOptions);
}
declare namespace ExportPropertyLibraryPlugin {
    export { LibraryContext, ExportPropertyLibraryPluginParsed, ExportPropertyLibraryPluginOptions, T };
}
import AbstractLibraryPlugin = require("./AbstractLibraryPlugin");
/**
 * <T>
 */
type LibraryContext<T> = import("./AbstractLibraryPlugin").LibraryContext<T>;
/**
 * Defines the export property library plugin parsed type used by this module.
 */
type ExportPropertyLibraryPluginParsed = {
    export?: LibraryExport | undefined;
};
/**
 * Defines the export property library plugin options type used by this module.
 */
type ExportPropertyLibraryPluginOptions = {
    type: LibraryType;
};
/**
 * Represents the export property library plugin runtime component.
 */
type T = ExportPropertyLibraryPluginParsed;
import type { LibraryExport } from "../../declarations/WebpackOptions";
import type { LibraryType } from "../../declarations/WebpackOptions";
