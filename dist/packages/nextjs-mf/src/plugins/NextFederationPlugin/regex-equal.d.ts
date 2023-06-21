import { RuleSetConditionAbsolute } from "webpack";
/**
 * Compares two regular expressions to see if they are equal.
 *
 * @param x - The first regular expression to compare.
 * @param y - The second regular expression to compare.
 * @returns True if the regular expressions are equal, false otherwise.
 *
 * @remarks
 * This function compares two regular expressions to see if they are equal in terms of their source,
 * global, ignoreCase, and multiline properties. It is used to check if two regular expressions match
 * the same pattern.
 */
export declare const regexEqual: (x: string | RegExp | RuleSetConditionAbsolute[] | ((value: string) => boolean) | undefined, y: RegExp) => boolean;
