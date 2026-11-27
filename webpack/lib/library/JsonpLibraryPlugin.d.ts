export = JsonpLibraryPlugin;
/** @import { Source } from "webpack-sources" */
/**
 * @import {
 * 	LibraryOptions,
 * 	LibraryType
 * } from "../../declarations/WebpackOptions"
 */
/** @import Chunk from "../graph/Chunk" */
/** @import { ChunkHashContext } from "../Compilation" */
/** @import { RenderContext } from "../javascript/JavascriptModulesPlugin" */
/** @import Hash from "../util/Hash" */
/**
 * Defines the shared type used by this module.
 * @template T
 * @typedef {import("./AbstractLibraryPlugin").LibraryContext<T>} LibraryContext<T>
 */
/**
 * Defines the jsonp library plugin options type used by this module.
 * @typedef {object} JsonpLibraryPluginOptions
 * @property {LibraryType} type
 */
/**
 * Defines the jsonp library plugin parsed type used by this module.
 * @typedef {object} JsonpLibraryPluginParsed
 * @property {string} name
 */
/**
 * Represents the jsonp library plugin runtime component.
 * @typedef {JsonpLibraryPluginParsed} T
 * @extends {AbstractLibraryPlugin<JsonpLibraryPluginParsed>}
 */
declare class JsonpLibraryPlugin extends AbstractLibraryPlugin<JsonpLibraryPluginParsed> {
    /**
     * Creates an instance of JsonpLibraryPlugin.
     * @param {JsonpLibraryPluginOptions} options the plugin options
     */
    constructor(options: JsonpLibraryPluginOptions);
}
declare namespace JsonpLibraryPlugin {
    export { LibraryContext, JsonpLibraryPluginOptions, JsonpLibraryPluginParsed, T };
}
import AbstractLibraryPlugin = require("./AbstractLibraryPlugin");
/**
 * <T>
 */
type LibraryContext<T> = import("./AbstractLibraryPlugin").LibraryContext<T>;
/**
 * Defines the jsonp library plugin options type used by this module.
 */
type JsonpLibraryPluginOptions = {
    type: LibraryType;
};
/**
 * Defines the jsonp library plugin parsed type used by this module.
 */
type JsonpLibraryPluginParsed = {
    name: string;
};
/**
 * Represents the jsonp library plugin runtime component.
 */
type T = JsonpLibraryPluginParsed;
import type { LibraryType } from "../../declarations/WebpackOptions";
