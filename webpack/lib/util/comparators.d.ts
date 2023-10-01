export function compareChunksById(a: Chunk, b: Chunk): -1 | 0 | 1;
export function compareModulesByIdentifier(a: Module, b: Module): -1 | 0 | 1;
export const compareModulesById: ParameterizedComparator<ChunkGraph, Module>;
export const compareModulesByPostOrderIndexOrIdentifier: ParameterizedComparator<
  ModuleGraph,
  Module
>;
export const compareModulesByPreOrderIndexOrIdentifier: ParameterizedComparator<
  ModuleGraph,
  Module
>;
export const compareModulesByIdOrIdentifier: ParameterizedComparator<
  ChunkGraph,
  Module
>;
export const compareChunks: ParameterizedComparator<ChunkGraph, Chunk>;
export function keepOriginalOrder<T>(iterable: Iterable<T>): Comparator<T>;
export function compareChunksNatural(chunkGraph: ChunkGraph): Comparator<Chunk>;
export function compareLocations(
  a: DependencyLocation,
  b: DependencyLocation,
): -1 | 0 | 1;
export type Chunk = import('../Chunk');
export type ChunkGraph = import('../ChunkGraph');
export type ChunkGroup = import('../ChunkGroup');
export type DependencyLocation = import('../Dependency').DependencyLocation;
export type Module = import('../Module');
export type ModuleGraph = import('../ModuleGraph');
export type Comparator<T> = (arg0: T, arg1: T) => -1 | 0 | 1;
export type RawParameterizedComparator<TArg, T> = (
  arg0: TArg,
  arg1: T,
  arg2: T,
) => -1 | 0 | 1;
export type ParameterizedComparator<TArg, T> = (arg0: TArg) => Comparator<T>;
export type Selector<A, B> = (input: A) => B;
/**
 * @param {number} a number
 * @param {number} b number
 * @returns {-1|0|1} compare result
 */
export function compareNumbers(a: number, b: number): -1 | 0 | 1;
/**
 * @param {string} a string
 * @param {string} b string
 * @returns {-1|0|1} compare result
 */
export function compareStringsNumeric(a: string, b: string): -1 | 0 | 1;
/**
 * @param {string|number} a first id
 * @param {string|number} b second id
 * @returns {-1|0|1} compare result
 */
export function compareIds(a: string | number, b: string | number): -1 | 0 | 1;
/**
 * @param {string} a first string
 * @param {string} b second string
 * @returns {-1|0|1} compare result
 */
export function compareStrings(a: string, b: string): -1 | 0 | 1;
/**
 * @param {ChunkGroup} a first chunk group
 * @param {ChunkGroup} b second chunk group
 * @returns {-1|0|1} compare result
 */
export function compareChunkGroupsByIndex(
  a: ChunkGroup,
  b: ChunkGroup,
): -1 | 0 | 1;
/**
 * @template T
 * @param {Comparator<T>} c1 comparator
 * @param {Comparator<T>} c2 comparator
 * @param {Comparator<T>[]} cRest comparators
 * @returns {Comparator<T>} comparator
 */
export function concatComparators<T>(
  c1: Comparator<T>,
  c2: Comparator<T>,
  ...cRest: Comparator<T>[]
): Comparator<T>;
/**
 * @template T
 * @template R
 * @param {Selector<T, R>} getter getter for value
 * @param {Comparator<R>} comparator comparator
 * @returns {Comparator<T>} comparator
 */
export function compareSelect<T, R>(
  getter: Selector<T, R>,
  comparator: Comparator<R>,
): Comparator<T>;
/**
 * @template T
 * @param {Comparator<T>} elementComparator comparator for elements
 * @returns {Comparator<Iterable<T>>} comparator for iterables of elements
 */
export function compareIterables<T>(
  elementComparator: Comparator<T>,
): Comparator<Iterable<T>>;
