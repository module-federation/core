export const compareChunks: ParameterizedComparator<ChunkGraph, Chunk>;
export function compareChunksById(a: Chunk, b: Chunk): -1 | 0 | 1;
export const compareModulesByFullName: ParameterizedComparator<Compiler, Module>;
export const compareModulesById: ParameterizedComparator<ChunkGraph, Module>;
export const compareModulesByIdOrIdentifier: ParameterizedComparator<ChunkGraph, Module>;
export function compareModulesByIdentifier(a: Module, b: Module): -1 | 0 | 1;
export const compareModulesByPostOrderIndexOrIdentifier: ParameterizedComparator<ModuleGraph, Module>;
export const compareModulesByPreOrderIndexOrIdentifier: ParameterizedComparator<ModuleGraph, Module>;
/**
 * Defines the dependency source order type used by this module.
 */
export type DependencySourceOrder = {
    /**
     * the main source order
     */
    main: number;
    /**
     * the sub source order
     */
    sub: number;
};
/**
 * Defines the comparator type used by this module.
 */
export type Comparator<T> = (a: T, b: T) => -1 | 0 | 1;
/**
 * Defines the raw parameterized comparator type used by this module.
 */
export type RawParameterizedComparator<TArg extends unknown, T> = (tArg: TArg, a: T, b: T) => -1 | 0 | 1;
/**
 * Defines the parameterized comparator type used by this module.
 */
export type ParameterizedComparator<TArg extends unknown, T> = (tArg: TArg) => Comparator<T>;
/**
 * Defines the selector type used by this module.
 */
export type Selector<A, B> = (input: A) => B | undefined | null;
/**
 * Compares chunk groups by index.
 * @param {ChunkGroup} a first chunk group
 * @param {ChunkGroup} b second chunk group
 * @returns {-1 | 0 | 1} compare result
 */
export function compareChunkGroupsByIndex(a: ChunkGroup, b: ChunkGroup): -1 | 0 | 1;
import type ChunkGraph from "../graph/ChunkGraph";
import type Chunk from "../graph/Chunk";
/**
 * Compares chunks natural.
 * @param {ChunkGraph} chunkGraph the chunk graph
 * @returns {Comparator<Chunk>} comparator
 */
export function compareChunksNatural(chunkGraph: ChunkGraph): Comparator<Chunk>;
export const compareErrors: Comparator<Error>;
/**
 * Compares the provided values and returns their ordering.
 * @param {string | number} a first id
 * @param {string | number} b second id
 * @returns {-1 | 0 | 1} compare result
 */
export function compareIds(a: string | number, b: string | number): -1 | 0 | 1;
/**
 * Compares iterables.
 * @template T
 * @param {Comparator<T>} elementComparator comparator for elements
 * @returns {Comparator<Iterable<T>>} comparator for iterables of elements
 */
export function compareIterables<T>(elementComparator: Comparator<T>): Comparator<Iterable<T>>;
/**
 * Compare two locations
 * @param {DependencyLocation} a A location node
 * @param {DependencyLocation} b A location node
 * @returns {-1 | 0 | 1} sorting comparator value
 */
export function compareLocations(a: Dependency.DependencyLocation, b: Dependency.DependencyLocation): -1 | 0 | 1;
import type Compiler from "../Compiler";
import type Module from "../module/Module";
import type ModuleGraph from "../graph/ModuleGraph";
/**
 * Compares the provided values and returns their ordering.
 * @param {number} a number
 * @param {number} b number
 * @returns {-1 | 0 | 1} compare result
 */
export function compareNumbers(a: number, b: number): -1 | 0 | 1;
/**
 * Compares the provided values and returns their ordering.
 * @template T
 * @template R
 * @param {Selector<T, R>} getter getter for value
 * @param {Comparator<R>} comparator comparator
 * @returns {Comparator<T>} comparator
 */
export function compareSelect<T, R>(getter: Selector<T, R>, comparator: Comparator<R>): Comparator<T>;
/**
 * Compares the provided values and returns their ordering.
 * @param {string} a first string
 * @param {string} b second string
 * @returns {-1 | 0 | 1} compare result
 */
export function compareStrings(a: string, b: string): -1 | 0 | 1;
/**
 * Compares strings numeric.
 * @param {string} a string
 * @param {string} b string
 * @returns {-1 | 0 | 1} compare result
 */
export function compareStringsNumeric(a: string, b: string): -1 | 0 | 1;
/**
 * Concat comparators.
 * @template T
 * @param {Comparator<T>} c1 comparator
 * @param {Comparator<T>} c2 comparator
 * @param {Comparator<T>[]} cRest comparators
 * @returns {Comparator<T>} comparator
 */
export function concatComparators<T>(c1: Comparator<T>, c2: Comparator<T>, ...cRest: Comparator<T>[]): Comparator<T>;
/**
 * Keep original order.
 * @template T
 * @param {Iterable<T>} iterable original ordered list
 * @returns {Comparator<T>} comparator
 */
export function keepOriginalOrder<T>(iterable: Iterable<T>): Comparator<T>;
/**
 * For ESMImportSideEffectDependency and ESMImportSpecifierDependency, we should prioritize import order to match the behavior of running modules directly in a JS engine without a bundler.
 * For other types like ConstDependency, we can instead prioritize usage order.
 * https://github.com/webpack/webpack/pull/19686
 * @param {Dependency[]} dependencies dependencies
 * @param {WeakMap<Dependency, DependencySourceOrder>} dependencySourceOrderMap dependency source order map
 * @param {((dep: Dependency, index: number) => void)=} onDependencyReSort optional callback to set index for each dependency
 * @returns {void}
 */
export function sortWithSourceOrder(dependencies: Dependency[], dependencySourceOrderMap: WeakMap<Dependency, DependencySourceOrder>, onDependencyReSort?: ((dep: Dependency, index: number) => void) | undefined): void;
import type ChunkGroup from "../graph/ChunkGroup";
import type Dependency from "../graph/Dependency";
