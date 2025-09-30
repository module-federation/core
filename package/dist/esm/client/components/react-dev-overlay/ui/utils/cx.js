/**
 * Merge multiple args to a single string with spaces. Useful for merging class names.
 * @example
 * cx('foo', 'bar') // 'foo bar'
 * cx('foo', null, 'bar', undefined, 'baz', false) // 'foo bar baz'
 */ export function cx() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    return args.filter(Boolean).join(' ');
}

//# sourceMappingURL=cx.js.map