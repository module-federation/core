declare namespace _exports {
  export { Nodes, Cycles, StackEntry };
}
declare function _exports<T>(
  items: Iterable<T>,
  getDependencies: (item: T) => Iterable<T>,
): Iterable<T>;
export = _exports;
type Nodes<T> = Set<Node<T>>;
type Cycles<T> = Set<Cycle<T>>;
type StackEntry<T> = {
  node: Node<T>;
  openEdges: Node<T>[];
};
/**
 * @template T
 * @typedef {Set<Node<T>>} Nodes
 */
/**
 * @template T
 * @typedef {Set<Cycle<T>>} Cycles
 */
/**
 * @template T
 */
declare class Node<T> {
  /**
   * @param {T} item the value of the node
   */
  constructor(item: T);
  item: T;
  /** @type {Nodes<T>} */
  dependencies: Nodes<T>;
  marker: number;
  /** @type {Cycle<T> | undefined} */
  cycle: Cycle<T> | undefined;
  incoming: number;
}
/**
 * @template T
 */
declare class Cycle<T> {
  /** @type {Nodes<T>} */
  nodes: Nodes<T>;
}
