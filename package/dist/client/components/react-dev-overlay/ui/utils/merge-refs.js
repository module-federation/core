"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, /**
 * A function that merges React refs into one.
 * Supports both functions and ref objects created using createRef() and useRef().
 *
 * Usage:
 * ```tsx
 * <div ref={mergeRefs(ref1, ref2, ref3)} />
 * ```
 *
 * @param {(React.Ref<T> | undefined)[]} inputRefs Array of refs
 * @returns {React.Ref<T> | React.RefCallback<T>} Merged refs
 */ "default", {
    enumerable: true,
    get: function() {
        return mergeRefs;
    }
});
function mergeRefs() {
    for(var _len = arguments.length, inputRefs = new Array(_len), _key = 0; _key < _len; _key++){
        inputRefs[_key] = arguments[_key];
    }
    const filteredInputRefs = inputRefs.filter(Boolean);
    if (filteredInputRefs.length <= 1) {
        const firstRef = filteredInputRefs[0];
        return firstRef || null;
    }
    return function mergedRefs(ref) {
        for (const inputRef of filteredInputRefs){
            if (typeof inputRef === 'function') {
                inputRef(ref);
            } else if (inputRef) {
                ;
                inputRef.current = ref;
            }
        }
    };
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=merge-refs.js.map