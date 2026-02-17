/**
 * @param {string} stack stack trace
 * @param {string} flag flag to cut off
 * @returns {string} stack trace without the specified flag included
 */
export function cutOffByFlag(stack: string, flag: string): string;
/**
 * @param {string} stack stack trace
 * @returns {string} stack trace without the loader execution flag included
 */
export function cutOffLoaderExecution(stack: string): string;
/**
 * @param {string} stack stack trace
 * @returns {string} stack trace without the webpack options flag included
 */
export function cutOffWebpackOptions(stack: string): string;
/**
 * @param {string} stack stack trace
 * @param {string} message error message
 * @returns {string} stack trace without the message included
 */
export function cutOffMultilineMessage(stack: string, message: string): string;
/**
 * @param {string} stack stack trace
 * @param {string} message error message
 * @returns {string} stack trace without the message included
 */
export function cutOffMessage(stack: string, message: string): string;
/**
 * @param {string} stack stack trace
 * @param {string} message error message
 * @returns {string} stack trace without the loader execution flag and message included
 */
export function cleanUp(stack: string, message: string): string;
/**
 * @param {string} stack stack trace
 * @param {string} message error message
 * @returns {string} stack trace without the webpack options flag and message included
 */
export function cleanUpWebpackOptions(stack: string, message: string): string;
