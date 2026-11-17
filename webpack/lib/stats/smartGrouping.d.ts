export = smartGrouping;
/**
 * Defines the group options type used by this module.
 * @typedef {object} GroupOptions
 * @property {boolean=} groupChildren
 * @property {boolean=} force
 * @property {number=} targetGroupCount
 */
/**
 * Defines the group config type used by this module.
 * @template I
 * @template G
 * @typedef {object} GroupConfig
 * @property {(item: I) => string[] | undefined} getKeys
 * @property {(name: string, items: I[]) => GroupOptions=} getOptions
 * @property {(key: string, children: I[], items: I[]) => G} createGroup
 */
/**
 * Defines the group type used by this module.
 * @template I
 * @template G
 * @typedef {{ config: GroupConfig<I, G>, name: string, alreadyGrouped: boolean, items: Items<I, G> | undefined }} Group
 */
/**
 * Defines the groups type used by this module.
 * @template I, G
 * @typedef {Set<Group<I, G>>} Groups
 */
/**
 * Defines the item with groups type used by this module.
 * @template I
 * @template G
 * @typedef {object} ItemWithGroups
 * @property {I} item
 * @property {Groups<I, G>} groups
 */
/**
 * Defines the items type used by this module.
 * @template T, G
 * @typedef {Set<ItemWithGroups<T, G>>} Items
 */
/**
 * Returns grouped items.
 * @template I
 * @template G
 * @template R
 * @param {I[]} items the list of items
 * @param {GroupConfig<I, G>[]} groupConfigs configuration
 * @returns {(I | G)[]} grouped items
 */
declare function smartGrouping<I, G, R>(items: I[], groupConfigs: GroupConfig<I, G>[]): (I | G)[];
declare namespace smartGrouping {
    export { GroupOptions, GroupConfig, Group, Groups, ItemWithGroups, Items };
}
/**
 * Defines the group options type used by this module.
 */
type GroupOptions = {
    groupChildren?: boolean | undefined;
    force?: boolean | undefined;
    targetGroupCount?: number | undefined;
};
/**
 * Defines the group config type used by this module.
 */
type GroupConfig<I, G> = {
    getKeys: (item: I) => string[] | undefined;
    getOptions?: ((name: string, items: I[]) => GroupOptions) | undefined;
    createGroup: (key: string, children: I[], items: I[]) => G;
};
/**
 * Defines the group type used by this module.
 */
type Group<I, G> = {
    config: GroupConfig<I, G>;
    name: string;
    alreadyGrouped: boolean;
    items: Items<I, G> | undefined;
};
/**
 * Defines the groups type used by this module.
 */
type Groups<I, G> = Set<Group<I, G>>;
/**
 * Defines the item with groups type used by this module.
 */
type ItemWithGroups<I, G> = {
    item: I;
    groups: Groups<I, G>;
};
/**
 * Defines the items type used by this module.
 */
type Items<T, G> = Set<ItemWithGroups<T, G>>;
