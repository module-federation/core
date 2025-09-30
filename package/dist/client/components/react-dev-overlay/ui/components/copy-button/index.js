"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    COPY_BUTTON_STYLES: null,
    CopyButton: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    COPY_BUTTON_STYLES: function() {
        return COPY_BUTTON_STYLES;
    },
    CopyButton: function() {
        return CopyButton;
    }
});
const _interop_require_wildcard = require("@swc/helpers/_/_interop_require_wildcard");
const _jsxruntime = require("react/jsx-runtime");
const _react = /*#__PURE__*/ _interop_require_wildcard._(require("react"));
const _cx = require("../../utils/cx");
function useCopyLegacy(content) {
    // This would be simpler with useActionState but we need to support React 18 here.
    // React 18 also doesn't have async transitions.
    const [copyState, dispatch] = _react.useReducer((state, action)=>{
        if (action.type === 'reset') {
            return {
                state: 'initial'
            };
        }
        if (action.type === 'copied') {
            return {
                state: 'success'
            };
        }
        if (action.type === 'copying') {
            return {
                state: 'pending'
            };
        }
        if (action.type === 'error') {
            return {
                state: 'error',
                error: action.error
            };
        }
        return state;
    }, {
        state: 'initial'
    });
    function copy() {
        if (isPending) {
            return;
        }
        if (!navigator.clipboard) {
            dispatch({
                type: 'error',
                error: Object.defineProperty(new Error('Copy to clipboard is not supported in this browser'), "__NEXT_ERROR_CODE", {
                    value: "E376",
                    enumerable: false,
                    configurable: true
                })
            });
        } else {
            dispatch({
                type: 'copying'
            });
            navigator.clipboard.writeText(content).then(()=>{
                dispatch({
                    type: 'copied'
                });
            }, (error)=>{
                dispatch({
                    type: 'error',
                    error
                });
            });
        }
    }
    const reset = _react.useCallback(()=>{
        dispatch({
            type: 'reset'
        });
    }, []);
    const isPending = copyState.state === 'pending';
    return [
        copyState,
        copy,
        reset,
        isPending
    ];
}
function useCopyModern(content) {
    const [copyState, dispatch, isPending] = _react.useActionState((state, action)=>{
        if (action === 'reset') {
            return {
                state: 'initial'
            };
        }
        if (action === 'copy') {
            if (!navigator.clipboard) {
                return {
                    state: 'error',
                    error: Object.defineProperty(new Error('Copy to clipboard is not supported in this browser'), "__NEXT_ERROR_CODE", {
                        value: "E376",
                        enumerable: false,
                        configurable: true
                    })
                };
            }
            return navigator.clipboard.writeText(content).then(()=>{
                return {
                    state: 'success'
                };
            }, (error)=>{
                return {
                    state: 'error',
                    error
                };
            });
        }
        return state;
    }, {
        state: 'initial'
    });
    function copy() {
        _react.startTransition(()=>{
            dispatch('copy');
        });
    }
    const reset = _react.useCallback(()=>{
        dispatch('reset');
    }, [
        // TODO: `dispatch` from `useActionState` is not reactive.
        // Remove from dependencies once https://github.com/facebook/react/pull/29665 is released.
        dispatch
    ]);
    return [
        copyState,
        copy,
        reset,
        isPending
    ];
}
const useCopy = typeof _react.useActionState === 'function' ? useCopyModern : useCopyLegacy;
function CopyButton(param) {
    let { actionLabel, successLabel, content, icon, disabled, ...props } = param;
    const [copyState, copy, reset, isPending] = useCopy(content);
    const error = copyState.state === 'error' ? copyState.error : null;
    _react.useEffect(()=>{
        if (error !== null) {
            // Additional console.error to get the stack.
            console.error(error);
        }
    }, [
        error
    ]);
    _react.useEffect(()=>{
        if (copyState.state === 'success') {
            const timeoutId = setTimeout(()=>{
                reset();
            }, 2000);
            return ()=>{
                clearTimeout(timeoutId);
            };
        }
    }, [
        isPending,
        copyState.state,
        reset
    ]);
    const isDisabled = isPending || disabled;
    const label = copyState.state === 'success' ? successLabel : actionLabel;
    // Assign default icon
    const renderedIcon = copyState.state === 'success' ? /*#__PURE__*/ (0, _jsxruntime.jsx)(CopySuccessIcon, {}) : icon || /*#__PURE__*/ (0, _jsxruntime.jsx)(CopyIcon, {
        width: 14,
        height: 14,
        className: "error-overlay-toolbar-button-icon"
    });
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
        ...props,
        type: "button",
        title: label,
        "aria-label": label,
        "aria-disabled": isDisabled,
        disabled: isDisabled,
        "data-nextjs-copy-button": true,
        className: (0, _cx.cx)(props.className, 'nextjs-data-copy-button', "nextjs-data-copy-button--" + copyState.state),
        onClick: ()=>{
            if (!isDisabled) {
                copy();
            }
        },
        children: [
            renderedIcon,
            copyState.state === 'error' ? " " + copyState.error : null
        ]
    });
}
function CopyIcon(props) {
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 14 14",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        ...props,
        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
            fillRule: "evenodd",
            clipRule: "evenodd",
            d: "M2.406.438c-.845 0-1.531.685-1.531 1.53v6.563c0 .846.686 1.531 1.531 1.531H3.937V8.75H2.406a.219.219 0 0 1-.219-.219V1.97c0-.121.098-.219.22-.219h4.812c.12 0 .218.098.218.219v.656H8.75v-.656c0-.846-.686-1.532-1.531-1.532H2.406zm4.375 3.5c-.845 0-1.531.685-1.531 1.53v6.563c0 .846.686 1.531 1.531 1.531h4.813c.845 0 1.531-.685 1.531-1.53V5.468c0-.846-.686-1.532-1.531-1.532H6.78zm-.218 1.53c0-.12.097-.218.218-.218h4.813c.12 0 .219.098.219.219v6.562c0 .121-.098.219-.22.219H6.782a.219.219 0 0 1-.218-.219V5.47z",
            fill: "currentColor"
        })
    });
}
function CopySuccessIcon() {
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("svg", {
        height: "16",
        xlinkTitle: "copied",
        viewBox: "0 0 16 16",
        width: "16",
        stroke: "currentColor",
        fill: "currentColor",
        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
            d: "M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"
        })
    });
}
const COPY_BUTTON_STYLES = "\n  .nextjs-data-copy-button {\n    color: inherit;\n\n    svg {\n      width: var(--size-16);\n      height: var(--size-16);\n    }\n  }\n  .nextjs-data-copy-button--initial:hover {\n    cursor: pointer;\n  }\n  .nextjs-data-copy-button--error,\n  .nextjs-data-copy-button--error:hover {\n    color: var(--color-ansi-red);\n  }\n  .nextjs-data-copy-button--success {\n    color: var(--color-ansi-green);\n  }\n";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=index.js.map