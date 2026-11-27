/**
 * Returns stack trace without the loader execution flag and message included.
 * @param {string} stack stack trace
 * @param {string} message error message
 * @returns {string} stack trace without the loader execution flag and message included
 */
export function cleanUp(stack: string, message: string): string;
/**
 * Clean up webpack options.
 * @param {string} stack stack trace
 * @param {string} message error message
 * @returns {string} stack trace without the webpack options flag and message included
 */
export function cleanUpWebpackOptions(stack: string, message: string): string;
/**
 * Returns the message with every stack frame naming its file relative to the
 * context, and a position only where {@link isReproduciblePosition} allows one.
 * @param {string} message error message
 * @param {RequestShortener} requestShortener request shortener
 * @returns {string} message whose frames a second build writes the same way
 */
export function contextifyStackFrames(message: string, requestShortener: RequestShortener): string;
/**
 * Returns stack trace without the specified flag included.
 * @param {string} stack stack trace
 * @param {string} flag flag to cut off
 * @returns {string} stack trace without the specified flag included
 */
export function cutOffByFlag(stack: string, flag: string): string;
/**
 * Cut off loader execution.
 * @param {string} stack stack trace
 * @returns {string} stack trace without the loader execution flag included
 */
export function cutOffLoaderExecution(stack: string): string;
/**
 * Returns stack trace without the message included.
 * @param {string} stack stack trace
 * @param {string} message error message
 * @returns {string} stack trace without the message included
 */
export function cutOffMessage(stack: string, message: string): string;
/**
 * Cut off multiline message.
 * @param {string} stack stack trace
 * @param {string} message error message
 * @returns {string} stack trace without the message included
 */
export function cutOffMultilineMessage(stack: string, message: string): string;
/**
 * Cut off webpack options.
 * @param {string} stack stack trace
 * @returns {string} stack trace without the webpack options flag included
 */
export function cutOffWebpackOptions(stack: string): string;
/**
 * Returns the value as an error, naming whatever a tap, a loader or a plugin
 * failed with when that is not one. Everything reading a failure expects one.
 * @template T
 * @param {T} value value something failed with
 * @returns {Error} the value, or an error naming it
 */
export function toError<T>(value: T): Error;
import type RequestShortener from "../util/RequestShortener";
