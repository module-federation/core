export = CssImportDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import { CssParserExportType } from "../../../declarations/WebpackOptions" */
/** @import Dependency, { DependencyKinds } from "../../graph/Dependency" */
/**
 * @import {
 * 	CssDependencyTemplateContext as DependencyTemplateContext
 * } from "../../template/DependencyTemplate"
 */
/** @import { Inheritance } from "../../css/CssModule" */
/** @import { Range } from "../../css/CssParser" */
/**
 * @import {
 * 	ObjectDeserializerContext,
 * 	ObjectSerializerContext
 * } from "../../serialization/ObjectMiddleware"
 */
declare class CssImportDependency extends ModuleDependency {
    /**
     * Example of dependency:
     * \@import url("landscape.css") layer(forms) screen and (orientation: landscape) screen and (orientation: landscape);
     * @param {string} request request
     * @param {Range} range range of the argument
     * @param {"local" | "global"=} mode mode of the parsed CSS
     * @param {string=} layer layer
     * @param {string=} supports list of supports conditions
     * @param {string=} media list of media conditions
     * @param {Inheritance=} inheritance layer/supports/media chain inherited from the importing module
     * @param {CssParserExportType=} exportType exportType inherited from the importing module
     */
    constructor(request: string, range: Range, mode?: ("local" | "global") | undefined, layer?: string | undefined, supports?: string | undefined, media?: string | undefined, inheritance?: Inheritance | undefined, exportType?: CssParserExportType | undefined);
    mode: "local" | "global";
    /** @type {string | undefined} */
    layer: string | undefined;
    /** @type {string | undefined} */
    supports: string | undefined;
    /** @type {string | undefined} */
    media: string | undefined;
    /** @type {Inheritance | undefined} */
    inheritance: Inheritance | undefined;
    /** @type {CssParserExportType | undefined} */
    exportType: CssParserExportType | undefined;
}
declare namespace CssImportDependency {
    export { CssImportDependencyTemplate as Template };
    export let KINDS: Set<keyof Dependency.DependencyKinds>;
}
import ModuleDependency = require("../core/ModuleDependency");
import type { Inheritance } from "../../css/CssModule";
import type { CssParserExportType } from "../../../declarations/WebpackOptions";
import type { Range } from "../../css/CssParser";
declare const CssImportDependencyTemplate_base: typeof import("../../template/DependencyTemplate");
declare class CssImportDependencyTemplate extends CssImportDependencyTemplate_base {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Dependency} dependency the dependency for which the template should be applied
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {DependencyTemplateContext} templateContext the context object
     * @returns {void}
     */
    apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
}
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { CssDependencyTemplateContext as DependencyTemplateContext } from "../../template/DependencyTemplate";
