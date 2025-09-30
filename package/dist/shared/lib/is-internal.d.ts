/** React that's compiled with `next`. Used by App Router. */
export declare const reactVendoredRe: RegExp;
/** React the user installed. Used by Pages Router, or user imports in App Router. */
export declare const reactNodeModulesRe: RegExp;
export declare const nextInternalsRe: RegExp;
export default function isInternal(file: string | null): boolean;
