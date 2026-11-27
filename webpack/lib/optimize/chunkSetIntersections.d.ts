export type SetIndex = number;
/**
 * An intersection of at least two of the input sets.
 */
export type Intersection = {
    /**
     * the members it holds
     */
    members: number[];
    /**
     * the input sets holding all of them
     */
    support: number[];
};
/**
 * Options of a discovery run.
 */
export type DiscoveryOptions = {
    /**
     * number of input sets
     */
    setCount: number;
    /**
     * number of distinct members
     */
    memberCount: number;
    /**
     * start of each set in `members`, plus its end
     */
    offsets: Int32Array;
    /**
     * members of every set, ordered by set
     */
    members: Int32Array;
    /**
     * rounds of discovery, `1` intersects the input sets
     */
    depth: number;
    /**
     * smallest intersection worth discovering
     */
    minMembers: number;
    /**
     * size of each input set, when a size bound applies
     */
    sizes: Float64Array | undefined;
    /**
     * size an intersection's support must reach
     */
    minSize: number;
    /**
     * most intersections a run may discover
     */
    maxIntersections: number;
    /**
     * most words a run may intersect, one per word of every pair it reaches
     */
    maxWork: number;
};
/**
 * What a discovery run found, and whether a limit cut it short.
 */
export type DiscoveryResult = {
    /**
     * the intersections, largest first
     */
    intersections: Intersection[];
    /**
     * true when `maxIntersections` or `maxWork` stopped the run
     */
    capped: boolean;
};
/**
 * Discovers intersections of the input sets that are not input sets themselves.
 *
 * Each round freezes its inputs: the first intersects the input sets, and every
 * later one also intersects what the round before it found, so `depth` bounds
 * how deep the discovery goes. Only proper intersections of at least
 * `minMembers` members are kept, and an intersection is reported only with the
 * input sets that hold all of its members. When `sizes` is given, the last round
 * skips a pair sharing a member no set reaches `minSize` through, and an
 * intersection whose support cannot reach `minSize` is not reported at all.
 * @param {DiscoveryOptions} options what to discover
 * @returns {DiscoveryResult} the intersections, largest first
 */
export function discoverIntersections({ setCount, memberCount, offsets, members, depth, minMembers, sizes, minSize, maxIntersections, maxWork }: DiscoveryOptions): DiscoveryResult;
