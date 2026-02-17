export = UmdLibraryPlugin;
/**
 * @typedef {object} UmdLibraryPluginOptions
 * @property {LibraryType} type
 * @property {boolean=} optionalAmdExternalAsGlobal
 */
/**
 * @typedef {object} UmdLibraryPluginParsed
 * @property {string | string[] | undefined} name
 * @property {LibraryCustomUmdObject} names
 * @property {string | LibraryCustomUmdCommentObject | undefined} auxiliaryComment
 * @property {boolean | undefined} namedDefine
 */
/**
 * @typedef {UmdLibraryPluginParsed} T
 * @extends {AbstractLibraryPlugin<UmdLibraryPluginParsed>}
 */
declare class UmdLibraryPlugin extends AbstractLibraryPlugin<UmdLibraryPluginParsed> {
    /**
     * @param {UmdLibraryPluginOptions} options the plugin option
     */
    constructor(options: UmdLibraryPluginOptions);
    optionalAmdExternalAsGlobal: boolean;
}
declare namespace UmdLibraryPlugin {
    export { Source, LibraryCustomUmdCommentObject, LibraryCustomUmdObject, LibraryName, LibraryOptions, LibraryType, RenderContext, RequestRecord, LibraryContext, Accessor, UmdLibraryPluginOptions, UmdLibraryPluginParsed, T };
}
import AbstractLibraryPlugin = require("./AbstractLibraryPlugin");
type Source = import("webpack-sources").Source;
type LibraryCustomUmdCommentObject = import("../../declarations/WebpackOptions").LibraryCustomUmdCommentObject;
type LibraryCustomUmdObject = import("../../declarations/WebpackOptions").LibraryCustomUmdObject;
type LibraryName = import("../../declarations/WebpackOptions").LibraryName;
type LibraryOptions = import("../../declarations/WebpackOptions").LibraryOptions;
type LibraryType = import("../../declarations/WebpackOptions").LibraryType;
type RenderContext = import("../javascript/JavascriptModulesPlugin").RenderContext;
type RequestRecord = import("../ExternalModule").RequestRecord;
/**
 * <T>
 */
type LibraryContext<T> = import("./AbstractLibraryPlugin").LibraryContext<T>;
type Accessor = string | string[];
type UmdLibraryPluginOptions = {
    type: LibraryType;
    optionalAmdExternalAsGlobal?: boolean | undefined;
};
type UmdLibraryPluginParsed = {
    name: string | string[] | undefined;
    names: LibraryCustomUmdObject;
    auxiliaryComment: string | LibraryCustomUmdCommentObject | undefined;
    namedDefine: boolean | undefined;
};
type T = UmdLibraryPluginParsed;
