export = UmdLibraryPlugin;
/**
 * Defines the umd library plugin options type used by this module.
 * @typedef {object} UmdLibraryPluginOptions
 * @property {LibraryType} type
 * @property {boolean=} optionalAmdExternalAsGlobal
 */
/**
 * Defines the umd library plugin parsed type used by this module.
 * @typedef {object} UmdLibraryPluginParsed
 * @property {string | string[] | undefined} name
 * @property {LibraryCustomUmdObject} names
 * @property {string | LibraryCustomUmdCommentObject | undefined} auxiliaryComment
 * @property {boolean | undefined} namedDefine
 * @property {string | undefined} amdContainer
 */
/**
 * Represents the umd library plugin runtime component.
 * @typedef {UmdLibraryPluginParsed} T
 * @extends {AbstractLibraryPlugin<UmdLibraryPluginParsed>}
 */
declare class UmdLibraryPlugin extends AbstractLibraryPlugin<UmdLibraryPluginParsed> {
    /**
     * Creates an instance of UmdLibraryPlugin.
     * @param {UmdLibraryPluginOptions} options the plugin option
     */
    constructor(options: UmdLibraryPluginOptions);
    /** @type {UmdLibraryPluginOptions["optionalAmdExternalAsGlobal"]} */
    optionalAmdExternalAsGlobal: UmdLibraryPluginOptions["optionalAmdExternalAsGlobal"];
}
declare namespace UmdLibraryPlugin {
    export { LibraryContext, Accessor, UmdLibraryPluginOptions, UmdLibraryPluginParsed, T };
}
import AbstractLibraryPlugin = require("./AbstractLibraryPlugin");
/**
 * <T>
 */
type LibraryContext<T> = import("./AbstractLibraryPlugin").LibraryContext<T>;
type Accessor = string | string[];
/**
 * Defines the umd library plugin options type used by this module.
 */
type UmdLibraryPluginOptions = {
    type: LibraryType;
    optionalAmdExternalAsGlobal?: boolean | undefined;
};
/**
 * Defines the umd library plugin parsed type used by this module.
 */
type UmdLibraryPluginParsed = {
    name: string | string[] | undefined;
    names: LibraryCustomUmdObject;
    auxiliaryComment: string | LibraryCustomUmdCommentObject | undefined;
    namedDefine: boolean | undefined;
    amdContainer: string | undefined;
};
/**
 * Represents the umd library plugin runtime component.
 */
type T = UmdLibraryPluginParsed;
import type { LibraryType } from "../../declarations/WebpackOptions";
import type { LibraryCustomUmdObject } from "../../declarations/WebpackOptions";
import type { LibraryCustomUmdCommentObject } from "../../declarations/WebpackOptions";
