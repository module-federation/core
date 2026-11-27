export = getModuleSize;
/** @import Module from "../module/Module" */
/**
 * Asks the module for its own source types rather than assuming javascript, so
 * a css or asset module counts too.
 * @param {Module} module a module
 * @returns {number} its size over every source type it reports
 */
declare function getModuleSize(module: Module): number;
import type Module from "../module/Module";
