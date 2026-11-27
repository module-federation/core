export = ESMCompatibilityDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency, { DependencyKinds } from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import Module, { BuildMeta } from "../../module/Module" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import ChunkGraph, { ModuleId } from "../../graph/ChunkGraph" */
/**
 * @import {
 * 	JavascriptModuleBuildInfo
 * } from "../../javascript/JavascriptModule"
 */
declare class ESMCompatibilityDependency extends NullDependency {
}
declare namespace ESMCompatibilityDependency {
    export { ESMExportDependencyTemplate as Template };
    export let KINDS: Set<keyof Dependency.DependencyKinds>;
}
import NullDependency = require("../core/NullDependency");
declare const ESMExportDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class ESMExportDependencyTemplate extends ESMExportDependencyTemplate_base {
}
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
