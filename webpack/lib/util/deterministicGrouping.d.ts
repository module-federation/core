declare namespace _exports {
    export { Sizes, Types, Similarities, GroupedItems, Options };
}
declare function _exports<T>({ maxSize, minSize, items, getSize, getKey }: Options<T>): GroupedItems<T>[];
export = _exports;
type Sizes = Record<string, number>;
type Types = Set<string>;
type Similarities = number[];
/**
 * <T>
 */
type GroupedItems<T> = {
    key: string;
    items: T[];
    size: Sizes;
};
type Options<T> = {
    /**
     * maximum size of a group
     */
    maxSize: Sizes;
    /**
     * minimum size of a group (preferred over maximum size)
     */
    minSize: Sizes;
    /**
     * a list of items
     */
    items: Iterable<T>;
    /**
     * function to get size of an item
     */
    getSize: (item: T) => Sizes;
    /**
     * function to get the key of an item
     */
    getKey: (item: T) => string;
};
