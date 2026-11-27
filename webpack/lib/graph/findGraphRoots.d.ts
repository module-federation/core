declare namespace _exports {
    export { Nodes, StackEntry };
}
declare function _exports<T>(items: Iterable<T>, getDependencies: (item: T) => Iterable<T>): Iterable<T>;
export = _exports;
/**
 * Defines the nodes type used by this module.
 */
type Nodes<T> = Set<GraphNode<T>>;
/**
 * Defines the stack entry type used by this module.
 */
type StackEntry<T> = {
    node: GraphNode<T>;
    openEdges: GraphNode<T>[];
};
/**
 * Defines the nodes type used by this module.
 * @template T
 * @typedef {Set<GraphNode<T>>} Nodes
 */
/**
 * Represents the node runtime component.
 * @template T
 */
declare class GraphNode<T> {
    /**
     * Creates an instance of GraphNode.
     * @param {T} item the value of the node
     */
    constructor(item: T);
    /** @type {T} */
    item: T;
    /** @type {Nodes<T>} */
    dependencies: Nodes<T>;
    /** @type {SCC<T>} */
    scc: SCC<T>;
    /** @type {number} */
    incoming: number;
}
/**
 * SCC (strongly connected component)
 * @template T
 */
declare class SCC<T> {
    /** @type {Nodes<T>} */
    nodes: Nodes<T>;
    /** @type {number} */
    marker: number;
}
