export = NullDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import { TRANSITIVE } from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @typedef {string[]} RawRuntimeRequirements */
declare class NullDependency extends Dependency {
}
declare namespace NullDependency {
    export { NullDependencyTemplate as Template, RawRuntimeRequirements };
}
import Dependency = require("../../graph/Dependency");
declare class NullDependencyTemplate extends DependencyTemplate {
}
type RawRuntimeRequirements = string[];
import DependencyTemplate = require("../../template/DependencyTemplate");
