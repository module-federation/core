export = CssImportDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").CssDependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../css/CssParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
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
     */
    constructor(request: string, range: Range, mode?: ("local" | "global") | undefined, layer?: string | undefined, supports?: string | undefined, media?: string | undefined);
    mode: "global" | "local";
    layer: string;
    supports: string;
    media: string;
}
declare namespace CssImportDependency {
    export { CssImportDependencyTemplate as Template, ReplaceSource, Dependency, DependencyTemplateContext, Range, ObjectDeserializerContext, ObjectSerializerContext };
}
import ModuleDependency = require("./ModuleDependency");
declare const CssImportDependencyTemplate_base: typeof import("../DependencyTemplate");
declare class CssImportDependencyTemplate extends CssImportDependencyTemplate_base {
    /**
     * @param {Dependency} dependency the dependency for which the template should be applied
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {DependencyTemplateContext} templateContext the context object
     * @returns {void}
     */
    apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
}
type ReplaceSource = import("webpack-sources").ReplaceSource;
type Dependency = import("../Dependency");
type DependencyTemplateContext = import("../DependencyTemplate").CssDependencyTemplateContext;
type Range = import("../css/CssParser").Range;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
