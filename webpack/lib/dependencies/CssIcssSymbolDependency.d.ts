export = CssIcssSymbolDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").ExportsSpec} ExportsSpec */
/** @typedef {import("../Dependency").ReferencedExports} ReferencedExports */
/** @typedef {import("../Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("../DependencyTemplate").CssDependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../css/CssParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/Hash")} Hash */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
declare class CssIcssSymbolDependency extends NullDependency {
    /**
     * @param {string} name name
     * @param {string} symbol symbol
     * @param {Range} range range
     * @param {boolean=} isReference true when is reference, otherwise false
     */
    constructor(name: string, symbol: string, range: Range, isReference?: boolean | undefined);
    name: string;
    symbol: string;
    range: import("../css/CssParser").Range;
    isReference: boolean;
    _hashUpdate: string;
    value: EXPECTED_ANY;
}
declare namespace CssIcssSymbolDependency {
    export { CssIcssSymbolDependencyTemplate as Template, ReplaceSource, Dependency, ExportsSpec, ReferencedExports, UpdateHashContext, DependencyTemplateContext, ModuleGraph, Range, ObjectDeserializerContext, ObjectSerializerContext, Hash, RuntimeSpec };
}
import NullDependency = require("./NullDependency");
declare const CssIcssSymbolDependencyTemplate_base: {
    new (): {
        apply(dependency: import("../Dependency"), source: NullDependency.ReplaceSource, templateContext: NullDependency.DependencyTemplateContext): void;
    };
};
declare class CssIcssSymbolDependencyTemplate extends CssIcssSymbolDependencyTemplate_base {
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
type ExportsSpec = import("../Dependency").ExportsSpec;
type ReferencedExports = import("../Dependency").ReferencedExports;
type UpdateHashContext = import("../Dependency").UpdateHashContext;
type DependencyTemplateContext = import("../DependencyTemplate").CssDependencyTemplateContext;
type ModuleGraph = import("../ModuleGraph");
type Range = import("../css/CssParser").Range;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type Hash = import("../util/Hash");
type RuntimeSpec = import("../util/runtime").RuntimeSpec;
