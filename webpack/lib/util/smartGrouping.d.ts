export = smartGrouping;
/**
 * @typedef {object} GroupOptions
 * @property {boolean=} groupChildren
 * @property {boolean=} force
 * @property {number=} targetGroupCount
 */
/**
 * @template I
 * @template G
 * @typedef {object} GroupConfig
 * @property {(item: I) => string[] | undefined} getKeys
 * @property {(name: string, items: I[]) => GroupOptions=} getOptions
 * @property {(key: string, children: I[], items: I[]) => G} createGroup
 */
/**
 * @template I
 * @template G
 * @typedef {{ config: GroupConfig<I, G>, name: string, alreadyGrouped: boolean, items: Items<I, G> | undefined }} Group
 */
/**
 * @template I, G
 * @typedef {Set<Group<I, G>>} Groups
 */
/**
 * @template I
 * @template G
 * @typedef {object} ItemWithGroups
 * @property {I} item
 * @property {Groups<I, G>} groups
 */
/**
 * @template T, G
 * @typedef {Set<ItemWithGroups<T, G>>} Items
 */
/**
 * @template I
 * @template G
 * @template R
 * @param {I[]} items the list of items
 * @param {GroupConfig<I, G>[]} groupConfigs configuration
 * @returns {(I | G)[]} grouped items
 */
declare function smartGrouping<I, G, R>(
  items: I[],
  groupConfigs: GroupConfig<I, G>[],
): (I | G)[];
declare namespace smartGrouping {
  export { GroupOptions, GroupConfig, Group, Groups, ItemWithGroups, Items };
}
type GroupOptions = {
  groupChildren?: boolean | undefined;
  force?: boolean | undefined;
  targetGroupCount?: number | undefined;
};
type GroupConfig<I, G> = {
  getKeys: (item: I) => string[] | undefined;
  getOptions?: ((name: string, items: I[]) => GroupOptions) | undefined;
  createGroup: (key: string, children: I[], items: I[]) => G;
};
type Group<I, G> = {
  config: GroupConfig<I, G>;
  name: string;
  alreadyGrouped: boolean;
  items: Items<I, G> | undefined;
};
type Groups<I, G> = Set<Group<I, G>>;
type ItemWithGroups<I, G> = {
  item: I;
  groups: Groups<I, G>;
};
type Items<T, G> = Set<ItemWithGroups<T, G>>;
