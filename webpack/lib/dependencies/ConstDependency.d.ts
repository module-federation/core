export = ConstDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("./NullDependency").RawRuntimeRequirements} RawRuntimeRequirements */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../ModuleGraphConnection").ConnectionState} ConnectionState */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/Hash")} Hash */
declare class ConstDependency extends NullDependency {
    /**
     * @param {string} expression the expression
     * @param {number | Range} range the source range
     * @param {RawRuntimeRequirements | null=} runtimeRequirements runtime requirements
     */
    constructor(expression: string, range: number | Range, runtimeRequirements?: (RawRuntimeRequirements | null) | undefined);
    expression: string;
    range: number | import("../javascript/JavascriptParser").Range;
    runtimeRequirements: Set<string>;
    _hashUpdate: string;
}
declare namespace ConstDependency {
    export { ConstDependencyTemplate as Template, ReplaceSource, RawRuntimeRequirements, Dependency, UpdateHashContext, DependencyTemplateContext, ModuleGraph, ConnectionState, Range, ObjectDeserializerContext, ObjectSerializerContext, Hash };
}
import NullDependency = require("./NullDependency");
declare const ConstDependencyTemplate_base: {
    new (): {
        apply(dependency: import("../Dependency"), source: NullDependency.ReplaceSource, templateContext: NullDependency.DependencyTemplateContext): void;
    };
};
declare class ConstDependencyTemplate extends ConstDependencyTemplate_base {
}
type ReplaceSource = import("webpack-sources").ReplaceSource;
type RawRuntimeRequirements = import("./NullDependency").RawRuntimeRequirements;
type Dependency = import("../Dependency");
type UpdateHashContext = import("../Dependency").UpdateHashContext;
type DependencyTemplateContext = import("../DependencyTemplate").DependencyTemplateContext;
type ModuleGraph = import("../ModuleGraph");
type ConnectionState = import("../ModuleGraphConnection").ConnectionState;
type Range = import("../javascript/JavascriptParser").Range;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type Hash = import("../util/Hash");
