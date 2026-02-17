export = RuntimeRequirementsDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("./NullDependency").RawRuntimeRequirements} RawRuntimeRequirements */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/Hash")} Hash */
declare class RuntimeRequirementsDependency extends NullDependency {
    /**
     * @param {RawRuntimeRequirements} runtimeRequirements runtime requirements
     */
    constructor(runtimeRequirements: RawRuntimeRequirements);
    runtimeRequirements: Set<string>;
    _hashUpdate: string;
}
declare namespace RuntimeRequirementsDependency {
    export { RuntimeRequirementsDependencyTemplate as Template, ReplaceSource, RawRuntimeRequirements, Dependency, UpdateHashContext, DependencyTemplateContext, ObjectDeserializerContext, ObjectSerializerContext, Hash };
}
import NullDependency = require("./NullDependency");
declare const RuntimeRequirementsDependencyTemplate_base: {
    new (): {
        apply(dependency: import("../Dependency"), source: NullDependency.ReplaceSource, templateContext: NullDependency.DependencyTemplateContext): void;
    };
};
declare class RuntimeRequirementsDependencyTemplate extends RuntimeRequirementsDependencyTemplate_base {
}
type ReplaceSource = import("webpack-sources").ReplaceSource;
type RawRuntimeRequirements = import("./NullDependency").RawRuntimeRequirements;
type Dependency = import("../Dependency");
type UpdateHashContext = import("../Dependency").UpdateHashContext;
type DependencyTemplateContext = import("../DependencyTemplate").DependencyTemplateContext;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type Hash = import("../util/Hash");
