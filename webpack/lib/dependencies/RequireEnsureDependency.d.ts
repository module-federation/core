export = RequireEnsureDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../AsyncDependenciesBlock")} AsyncDependenciesBlock */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class RequireEnsureDependency extends NullDependency {
    /**
     * @param {Range} range range
     * @param {Range} contentRange content range
     * @param {Range | false} errorHandlerRange error handler range
     */
    constructor(range: Range, contentRange: Range, errorHandlerRange: Range | false);
    range: import("../javascript/JavascriptParser").Range;
    contentRange: import("../javascript/JavascriptParser").Range;
    errorHandlerRange: false | import("../javascript/JavascriptParser").Range;
}
declare namespace RequireEnsureDependency {
    export { RequireEnsureDependencyTemplate as Template, ReplaceSource, AsyncDependenciesBlock, Dependency, DependencyTemplateContext, Range, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("./NullDependency");
declare const RequireEnsureDependencyTemplate_base: {
    new (): {
        apply(dependency: import("../Dependency"), source: NullDependency.ReplaceSource, templateContext: NullDependency.DependencyTemplateContext): void;
    };
};
declare class RequireEnsureDependencyTemplate extends RequireEnsureDependencyTemplate_base {
}
type ReplaceSource = import("webpack-sources").ReplaceSource;
type AsyncDependenciesBlock = import("../AsyncDependenciesBlock");
type Dependency = import("../Dependency");
type DependencyTemplateContext = import("../DependencyTemplate").DependencyTemplateContext;
type Range = import("../javascript/JavascriptParser").Range;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
