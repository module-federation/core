export type VisitorFn<T> = import("./SourceProcessor").VisitorFn<T>;
export type CompiledVisitorBucket<T> = import("./SourceProcessor").CompiledVisitorBucket<T>;
/**
 * @template T
 * @typedef {import("./SourceProcessor").VisitorFn<T>} VisitorFn
 */
/**
 * @template T
 * @typedef {import("./SourceProcessor").CompiledVisitorBucket<T>} CompiledVisitorBucket
 */
/**
 * Empty every bucket of a compiled visitor map in place, so a dispatch loop
 * running over one ends after the visitor that asked and none fires again.
 * @template TPath
 * @param {CompiledVisitorBucket<TPath>[]} map the map a walk dispatches from
 * @returns {VisitorFn<TPath>[][]} each emptied list followed by its visitors, for {@link resumeVisitors}
 */
export function haltVisitors<TPath>(map: CompiledVisitorBucket<TPath>[]): VisitorFn<TPath>[][];
/**
 * Put back what {@link haltVisitors} emptied, so the next walk fires them all.
 * @template TPath
 * @param {VisitorFn<TPath>[][]} halted what `haltVisitors` returned
 */
export function resumeVisitors<TPath>(halted: VisitorFn<TPath>[][]): void;
