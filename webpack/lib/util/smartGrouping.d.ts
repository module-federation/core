export = smartGrouping;
/**
 * @typedef {Object} GroupOptions
 * @property {boolean=} groupChildren
 * @property {boolean=} force
 * @property {number=} targetGroupCount
 */
/**
 * @template T
 * @template R
 * @typedef {Object} GroupConfig
 * @property {function(T): string[]} getKeys
 * @property {function(string, (R | T)[], T[]): R} createGroup
 * @property {function(string, T[]): GroupOptions=} getOptions
 */
/**
 * @template T
 * @template R
 * @typedef {Object} ItemWithGroups
 * @property {T} item
 * @property {Set<Group<T, R>>} groups
 */
/**
 * @template T
 * @template R
 * @typedef {{ config: GroupConfig<T, R>, name: string, alreadyGrouped: boolean, items: Set<ItemWithGroups<T, R>> | undefined }} Group
 */
/**
 * @template T
 * @template R
 * @param {T[]} items the list of items
 * @param {GroupConfig<T, R>[]} groupConfigs configuration
 * @returns {(R | T)[]} grouped items
 */
declare function smartGrouping<T, R>(
  items: T[],
  groupConfigs: GroupConfig<T, R>[],
): (T | R)[];
declare namespace smartGrouping {
  export { GroupOptions, GroupConfig, ItemWithGroups, Group };
}
type GroupConfig<T, R> = {
  getKeys: (arg0: T) => string[];
  createGroup: (arg0: string, arg1: (R | T)[], arg2: T[]) => R;
  getOptions?: ((arg0: string, arg1: T[]) => GroupOptions) | undefined;
};
type GroupOptions = {
  groupChildren?: boolean | undefined;
  force?: boolean | undefined;
  targetGroupCount?: number | undefined;
};
type ItemWithGroups<T, R> = {
  item: T;
  groups: Set<Group<T, R>>;
};
type Group<T, R> = {
  config: GroupConfig<T, R>;
  name: string;
  alreadyGrouped: boolean;
  items: Set<ItemWithGroups<T, R>> | undefined;
};
