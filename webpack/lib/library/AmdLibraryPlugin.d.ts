export = AmdLibraryPlugin;
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
/** @import { RenderContext } from "../javascript/JavascriptModulesPlugin" */
/** @import Hash from "../util/Hash" */
/**
 * Defines the shared type used by this module.
 * @template T
 * @typedef {import("./AbstractLibraryPlugin").LibraryContext<T>} LibraryContext<T>
 */
/**
 * Defines the amd library plugin options type used by this module.
 * @typedef {object} AmdLibraryPluginOptions
 * @property {LibraryType} type
 * @property {boolean=} requireAsWrapper
 */
/**
 * Defines the amd library plugin parsed type used by this module.
 * @typedef {object} AmdLibraryPluginParsed
 * @property {string} name
 * @property {string} amdContainer
 */
/**
 * Represents the amd library plugin runtime component.
 * @typedef {AmdLibraryPluginParsed} T
 * @extends {AbstractLibraryPlugin<AmdLibraryPluginParsed>}
 */
declare class AmdLibraryPlugin extends AbstractLibraryPlugin<AmdLibraryPluginParsed> {
    /**
     * Creates an instance of AmdLibraryPlugin.
     * @param {AmdLibraryPluginOptions} options the plugin options
     */
    constructor(options: AmdLibraryPluginOptions);
    /** @type {AmdLibraryPluginOptions["requireAsWrapper"]} */
    requireAsWrapper: AmdLibraryPluginOptions["requireAsWrapper"];
}
declare namespace AmdLibraryPlugin {
    export { LibraryContext, AmdLibraryPluginOptions, AmdLibraryPluginParsed, T };
}
import AbstractLibraryPlugin = require("./AbstractLibraryPlugin");
/**
 * <T>
 */
type LibraryContext<T> = import("./AbstractLibraryPlugin").LibraryContext<T>;
/**
 * Defines the amd library plugin options type used by this module.
 */
type AmdLibraryPluginOptions = {
    type: LibraryType;
    requireAsWrapper?: boolean | undefined;
};
/**
 * Defines the amd library plugin parsed type used by this module.
 */
type AmdLibraryPluginParsed = {
    name: string;
    amdContainer: string;
};
/**
 * Represents the amd library plugin runtime component.
 */
type T = AmdLibraryPluginParsed;
import type { LibraryType } from "../../declarations/WebpackOptions";
