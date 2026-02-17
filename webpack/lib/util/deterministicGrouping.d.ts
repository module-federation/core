declare function _exports<T>({
  maxSize,
  minSize,
  items,
  getSize,
  getKey,
}: Options<T>): GroupedItems<T>[];
export = _exports;
/**
 * <T>
 */
export type GroupedItems<T> = {
  key: string;
  items: T[];
  size: Record<string, number>;
};
export type Options<T> = {
  /**
   * maximum size of a group
   */
  maxSize: Record<string, number>;
  /**
   * minimum size of a group (preferred over maximum size)
   */
  minSize: Record<string, number>;
  /**
   * a list of items
   */
  items: Iterable<T>;
  /**
   * function to get size of an item
   */
  getSize: (arg0: T) => Record<string, number>;
  /**
   * function to get the key of an item
   */
  getKey: (arg0: T) => string;
};
