export = DependencyTemplates;
/** @import { DependencyConstructor } from "../Compilation" */
/** @import DependencyTemplate from "./DependencyTemplate" */
/** @import { HashFunction } from "../util/Hash" */
declare class DependencyTemplates {
    /**
     * Creates an instance of DependencyTemplates.
     * @param {HashFunction} hashFunction the hash function to use
     */
    constructor(hashFunction?: HashFunction);
    /** @type {Map<DependencyConstructor, DependencyTemplate>} */
    _map: Map<DependencyConstructor, DependencyTemplate>;
    /** @type {string} */
    _hash: string;
    /** @type {HashFunction} */
    _hashFunction: HashFunction;
    /** @type {boolean} */
    importBindingScopes: boolean;
    /**
     * Returns template for this dependency.
     * @param {DependencyConstructor} dependency Constructor of Dependency
     * @returns {DependencyTemplate | undefined} template for this dependency
     */
    get(dependency: DependencyConstructor): DependencyTemplate | undefined;
    /**
     * Updates value using the provided dependency.
     * @param {DependencyConstructor} dependency Constructor of Dependency
     * @param {DependencyTemplate} dependencyTemplate template for this dependency
     * @returns {void}
     */
    set(dependency: DependencyConstructor, dependencyTemplate: DependencyTemplate): void;
    /**
     * Updates the hash with the data contributed by this instance.
     * @param {string} part additional hash contributor
     * @returns {void}
     */
    updateHash(part: string): void;
    getHash(): string;
    clone(): DependencyTemplates;
}
import type { DependencyConstructor } from "../Compilation";
import type DependencyTemplate from "./DependencyTemplate";
import type { HashFunction } from "../util/Hash";
