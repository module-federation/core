/**
 * Merge multiple args to a single string with spaces. Useful for merging class names.
 * @example
 * cx('foo', 'bar') // 'foo bar'
 * cx('foo', null, 'bar', undefined, 'baz', false) // 'foo bar baz'
 */
export declare function cx(...args: (string | undefined | null | false)[]): string;
