"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const error = new Proxy({}, {
    get (_target) {
        throw Object.defineProperty(new Error('Using client components is not allowed in this environment.'), "__NEXT_ERROR_CODE", {
            value: "E44",
            enumerable: false,
            configurable: true
        });
    }
});
const _default = new Proxy({}, {
    get: (_target, p)=>{
        if (p === '__esModule') return true;
        return error;
    }
});

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=use-client-disallowed.js.map