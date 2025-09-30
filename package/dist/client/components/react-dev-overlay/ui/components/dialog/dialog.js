"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Dialog", {
    enumerable: true,
    get: function() {
        return Dialog;
    }
});
const _interop_require_wildcard = require("@swc/helpers/_/_interop_require_wildcard");
const _jsxruntime = require("react/jsx-runtime");
const _react = /*#__PURE__*/ _interop_require_wildcard._(require("react"));
const _useonclickoutside = require("../../hooks/use-on-click-outside");
const _usemeasureheight = require("../../hooks/use-measure-height");
const CSS_SELECTORS_TO_EXCLUDE_ON_CLICK_OUTSIDE = [
    '[data-next-mark]',
    '[data-issues-open]',
    '#nextjs-dev-tools-menu',
    '[data-nextjs-error-overlay-nav]',
    '[data-info-popover]'
];
const Dialog = function Dialog(param) {
    let { children, type, className, onClose, 'aria-labelledby': ariaLabelledBy, 'aria-describedby': ariaDescribedBy, dialogResizerRef, ...props } = param;
    const dialogRef = _react.useRef(null);
    const [role, setRole] = _react.useState(typeof document !== 'undefined' && document.hasFocus() ? 'dialog' : undefined);
    const ref = _react.useRef(null);
    const [height, pristine] = (0, _usemeasureheight.useMeasureHeight)(ref);
    (0, _useonclickoutside.useOnClickOutside)(dialogRef.current, CSS_SELECTORS_TO_EXCLUDE_ON_CLICK_OUTSIDE, (e)=>{
        e.preventDefault();
        return onClose == null ? void 0 : onClose();
    });
    _react.useEffect(()=>{
        if (dialogRef.current == null) {
            return;
        }
        function handleFocus() {
            // safari will force itself as the active application when a background page triggers any sort of autofocus
            // this is a workaround to only set the dialog role if the document has focus
            setRole(document.hasFocus() ? 'dialog' : undefined);
        }
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleFocus);
        return ()=>{
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleFocus);
        };
    }, []);
    _react.useEffect(()=>{
        const dialog = dialogRef.current;
        const root = dialog == null ? void 0 : dialog.getRootNode();
        const initialActiveElement = root instanceof ShadowRoot ? root == null ? void 0 : root.activeElement : null;
        // Trap focus within the dialog
        dialog == null ? void 0 : dialog.focus();
        return ()=>{
            // Blur first to avoid getting stuck, in case `activeElement` is missing
            dialog == null ? void 0 : dialog.blur();
            // Restore focus to the previously active element
            initialActiveElement == null ? void 0 : initialActiveElement.focus();
        };
    }, []);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        ref: dialogRef,
        tabIndex: -1,
        "data-nextjs-dialog": true,
        role: role,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        "aria-modal": "true",
        className: className,
        onKeyDown: (e)=>{
            if (e.key === 'Escape') {
                onClose == null ? void 0 : onClose();
            }
        },
        ...props,
        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
            ref: dialogResizerRef,
            "data-nextjs-dialog-sizer": true,
            // [x] Don't animate on initial load
            // [x] No duplicate elements
            // [x] Responds to content growth
            style: {
                height,
                transition: pristine ? undefined : 'height 250ms var(--timing-swift)'
            },
            children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                ref: ref,
                children: children
            })
        })
    });
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=dialog.js.map