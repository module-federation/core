export = ImportEagerDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency, { RawReferencedExports } from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import Module, { BuildMeta } from "../../module/Module" */
/** @import { ImportAttributes, Range } from "../../javascript/JavascriptParser" */
/** @import { ImportPhaseType } from "../core/ImportPhase" */
declare class ImportEagerDependency extends ImportDependency {
}
declare namespace ImportEagerDependency {
    export { ImportEagerDependencyTemplate as Template };
}
import ImportDependency = require("./ImportDependency");
declare const ImportEagerDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, { runtimeTemplate, module, moduleGraph, chunkGraph, runtimeRequirements, runtime }: DependencyTemplateContext): void;
    };
};
declare class ImportEagerDependencyTemplate extends ImportEagerDependencyTemplate_base {
}
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
