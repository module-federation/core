export = IgnoreErrorModuleFactory;
/**
 * @import {
 * 	ModuleFactoryCallback,
 * 	ModuleFactoryCreateData
 * } from "../module/ModuleFactory"
 */
/** @import NormalModuleFactory from "../module/NormalModuleFactory" */
/**
 * Ignores error when module is unresolved
 */
declare class IgnoreErrorModuleFactory extends ModuleFactory {
    /**
     * Creates an instance of IgnoreErrorModuleFactory.
     * @param {NormalModuleFactory} normalModuleFactory normalModuleFactory instance
     */
    constructor(normalModuleFactory: NormalModuleFactory);
    /** @type {NormalModuleFactory} */
    normalModuleFactory: NormalModuleFactory;
}
import ModuleFactory = require("../module/ModuleFactory");
import type NormalModuleFactory from "../module/NormalModuleFactory";
