/**
 * Returns selected browsers.
 * @param {string | null | undefined} input input string
 * @param {string} context the context directory
 * @returns {string[] | undefined} selected browsers
 */
export function load(input: string | null | undefined, context: string): string[] | undefined;
/**
 * Returns target properties.
 * @param {string[]} browsers supported browsers list
 * @returns {EcmaTargetProperties & PlatformTargetProperties & ApiTargetProperties} target properties
 */
export function resolve(browsers: string[]): EcmaTargetProperties & PlatformTargetProperties & ApiTargetProperties;
import type { EcmaTargetProperties } from "./target";
import type { PlatformTargetProperties } from "./target";
import type { ApiTargetProperties } from "./target";
