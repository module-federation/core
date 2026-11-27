export = SelfModuleFactory;
/**
 * @import {
 * 	ModuleFactoryCallback,
 * 	ModuleFactoryCreateData
 * } from "./ModuleFactory"
 */
/** @import ModuleGraph from "../graph/ModuleGraph" */
declare class SelfModuleFactory {
    /**
     * Creates an instance of SelfModuleFactory.
     * @param {ModuleGraph} moduleGraph module graph
     */
    constructor(moduleGraph: ModuleGraph);
    /** @type {ModuleGraph} */
    moduleGraph: ModuleGraph;
    /**
     * Processes the provided data.
     * @param {ModuleFactoryCreateData} data data object
     * @param {ModuleFactoryCallback} callback callback
     * @returns {void}
     */
    create(data: ModuleFactoryCreateData, callback: ModuleFactoryCallback): void;
}
import type ModuleGraph from "../graph/ModuleGraph";
import type { ModuleFactoryCreateData } from "./ModuleFactory";
import type { ModuleFactoryCallback } from "./ModuleFactory";
