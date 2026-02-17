export = traverseDestructuringAssignmentProperties;
/** @typedef {import("../javascript/JavascriptParser").DestructuringAssignmentProperties} DestructuringAssignmentProperties */
/** @typedef {import("../javascript/JavascriptParser").DestructuringAssignmentProperty} DestructuringAssignmentProperty */
/**
 * Deep first traverse the properties of a destructuring assignment.
 * @param {DestructuringAssignmentProperties} properties destructuring assignment properties
 * @param {((stack: DestructuringAssignmentProperty[]) => void) | undefined=} onLeftNode on left node callback
 * @param {((stack: DestructuringAssignmentProperty[]) => void) | undefined=} enterNode enter node callback
 * @param {((stack: DestructuringAssignmentProperty[]) => void) | undefined=} exitNode exit node callback
 * @param {DestructuringAssignmentProperty[] | undefined=} stack stack of the walking nodes
 */
declare function traverseDestructuringAssignmentProperties(properties: DestructuringAssignmentProperties, onLeftNode?: (((stack: DestructuringAssignmentProperty[]) => void) | undefined) | undefined, enterNode?: (((stack: DestructuringAssignmentProperty[]) => void) | undefined) | undefined, exitNode?: (((stack: DestructuringAssignmentProperty[]) => void) | undefined) | undefined, stack?: (DestructuringAssignmentProperty[] | undefined) | undefined): void;
declare namespace traverseDestructuringAssignmentProperties {
    export { DestructuringAssignmentProperties, DestructuringAssignmentProperty };
}
type DestructuringAssignmentProperties = import("../javascript/JavascriptParser").DestructuringAssignmentProperties;
type DestructuringAssignmentProperty = import("../javascript/JavascriptParser").DestructuringAssignmentProperty;
