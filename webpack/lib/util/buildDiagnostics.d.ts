/** @import Module, { BuildDiagnostics, BuildInfo } from "../module/Module" */
/** @import ModuleGraph from "../graph/ModuleGraph" */
/**
 * The diagnostics record of a build info, created on first use so a module nothing reports about carries none.
 * @param {BuildInfo} buildInfo the build info of the module
 * @returns {BuildDiagnostics} the record
 */
export function getBuildDiagnostics(buildInfo: Module.BuildInfo): Module.BuildDiagnostics;
/**
 * Records a bailout a parser plugin found, where a module restored from the cache still has it for the module graph to report.
 * @param {BuildInfo} buildInfo the build info of the module being parsed
 * @param {string} reason the bailout as reported
 * @returns {void}
 */
export function recordOptimizationBailout(buildInfo: Module.BuildInfo, reason: string): void;
/**
 * Replays the bailouts parser plugins recorded for a module into the module graph,
 * which a module reused from the cache never parses into.
 * @param {ModuleGraph} moduleGraph the module graph
 * @param {Module} module the built or still valid module
 * @returns {void}
 */
export function replayOptimizationBailouts(moduleGraph: ModuleGraph, module: Module): void;
import type Module from "../module/Module";
import type ModuleGraph from "../graph/ModuleGraph";
