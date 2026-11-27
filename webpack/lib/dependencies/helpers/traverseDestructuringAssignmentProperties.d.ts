export = traverseDestructuringAssignmentProperties;
/**
 * @import {
 * 	DestructuringAssignmentProperties,
 * 	DestructuringAssignmentProperty
 * } from "../../javascript/JavascriptParser"
 */
/**
 * Deep first traverse the properties of a destructuring assignment.
 * @param {DestructuringAssignmentProperties} properties destructuring assignment properties
 * @param {((stack: DestructuringAssignmentProperty[]) => void) | undefined=} onLeftNode on left node callback
 * @param {((stack: DestructuringAssignmentProperty[]) => void) | undefined=} enterNode enter node callback
 * @param {((stack: DestructuringAssignmentProperty[]) => void) | undefined=} exitNode exit node callback
 * @param {DestructuringAssignmentProperty[] | undefined=} stack stack of the walking nodes
 */
declare function traverseDestructuringAssignmentProperties(properties: DestructuringAssignmentProperties, onLeftNode?: (((stack: DestructuringAssignmentProperty[]) => void) | undefined) | undefined, enterNode?: (((stack: DestructuringAssignmentProperty[]) => void) | undefined) | undefined, exitNode?: (((stack: DestructuringAssignmentProperty[]) => void) | undefined) | undefined, stack?: (DestructuringAssignmentProperty[] | undefined) | undefined): void;
import type { DestructuringAssignmentProperties } from "../../javascript/JavascriptParser";
import type { DestructuringAssignmentProperty } from "../../javascript/JavascriptParser";
