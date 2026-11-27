export = ImportWeakDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency, { RawReferencedExports } from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import Module, { BuildMeta } from "../../module/Module" */
/** @import { ImportAttributes, Range } from "../../javascript/JavascriptParser" */
/** @import { ImportPhaseType } from "../core/ImportPhase" */
declare class ImportWeakDependency extends ImportDependency {
}
declare namespace ImportWeakDependency {
    export { ImportDependencyTemplate as Template };
}
import ImportDependency = require("./ImportDependency");
declare const ImportDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, { runtimeTemplate, module, moduleGraph, chunkGraph, runtimeRequirements, runtime }: DependencyTemplateContext): void;
    };
};
declare class ImportDependencyTemplate extends ImportDependencyTemplate_base {
}
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
