export = LibraryTemplatePlugin;
/**
 * @import {
 * 	AuxiliaryComment,
 * 	LibraryExport,
 * 	LibraryName,
 * 	LibraryType,
 * 	UmdNamedDefine
 * } from "../../declarations/WebpackOptions"
 */
/** @import Compiler from "../Compiler" */
declare class LibraryTemplatePlugin {
    /**
     * Creates an instance of LibraryTemplatePlugin.
     * @param {LibraryName} name name of library
     * @param {LibraryType} target type of library
     * @param {UmdNamedDefine} umdNamedDefine setting this to true will name the UMD module
     * @param {AuxiliaryComment} auxiliaryComment comment in the UMD wrapper
     * @param {LibraryExport} exportProperty which export should be exposed as library
     */
    constructor(name: LibraryName, target: LibraryType, umdNamedDefine: UmdNamedDefine, auxiliaryComment: AuxiliaryComment, exportProperty: LibraryExport);
    library: {
        type: string;
        name: LibraryName;
        umdNamedDefine: boolean;
        auxiliaryComment: AuxiliaryComment;
        export: LibraryExport;
    };
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type { LibraryName } from "../../declarations/WebpackOptions";
import type { AuxiliaryComment } from "../../declarations/WebpackOptions";
import type { LibraryExport } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
import type { LibraryType } from "../../declarations/WebpackOptions";
import type { UmdNamedDefine } from "../../declarations/WebpackOptions";
