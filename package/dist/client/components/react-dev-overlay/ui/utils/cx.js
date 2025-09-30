/**
 * Merge multiple args to a single string with spaces. Useful for merging class names.
 * @example
 * cx('foo', 'bar') // 'foo bar'
 * cx('foo', null, 'bar', undefined, 'baz', false) // 'foo bar baz'
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "cx", {
    enumerable: true,
    get: function() {
        return cx;
    }
});
function cx() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    return args.filter(Boolean).join(' ');
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=cx.js.map