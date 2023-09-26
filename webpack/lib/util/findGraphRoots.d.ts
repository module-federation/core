declare function _exports<T>(
  items: Iterable<T>,
  getDependencies: (arg0: T) => Iterable<T>,
): Iterable<T>;
export = _exports;
export type StackEntry<T> = {
  node: Node<T>;
  openEdges: Node<T>[];
};
/**
 * @template T
 */
declare class Node<T> {
  /**
   * @param {T} item the value of the node
   */
  constructor(item: T);
  item: T;
  /** @type {Set<Node<T>>} */
  dependencies: Set<Node<T>>;
  marker: number;
  /** @type {Cycle<T> | undefined} */
  cycle: Cycle<T> | undefined;
  incoming: number;
}
/**
 * @template T
 */
declare class Cycle<T> {
  /** @type {Set<Node<T>>} */
  nodes: Set<Node<T>>;
}
