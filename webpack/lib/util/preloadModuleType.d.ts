export = preloadModuleType;
/** @import Generator from "../module/Generator" */
/** @import Module from "../module/Module" */
/** @import NormalModuleFactory from "../module/NormalModuleFactory" */
/** @import Parser from "../module/Parser" */
/** @typedef {import("./lazyModule").LazyModuleAccessor<new (...args: never[]) => Parser | Generator | Module>} AnyLazyModuleAccessor */
/**
 * Warms the modules a type's `createParser`/`createGenerator`/`createModuleClass`
 * taps read, at the factory's async boundary — those hooks are synchronous, so
 * they cannot await the load themselves.
 * @param {NormalModuleFactory} normalModuleFactory the normal module factory
 * @param {string} pluginName name of the tapping plugin
 * @param {Iterable<[string, AnyLazyModuleAccessor[]]>} table module type to the accessors its taps read
 * @returns {void}
 */
declare function preloadModuleType(normalModuleFactory: NormalModuleFactory, pluginName: string, table: Iterable<[string, AnyLazyModuleAccessor[]]>): void;
declare namespace preloadModuleType {
    export { AnyLazyModuleAccessor };
}
import type NormalModuleFactory from "../module/NormalModuleFactory";
type AnyLazyModuleAccessor = import("./lazyModule").LazyModuleAccessor<new (...args: never[]) => Parser | Generator | Module>;
import type Parser from "../module/Parser";
import type Generator from "../module/Generator";
import type Module from "../module/Module";
