import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { useOnClickOutside } from '../../hooks/use-on-click-outside';
import { useMeasureHeight } from '../../hooks/use-measure-height';
const CSS_SELECTORS_TO_EXCLUDE_ON_CLICK_OUTSIDE = [
    '[data-next-mark]',
    '[data-issues-open]',
    '#nextjs-dev-tools-menu',
    '[data-nextjs-error-overlay-nav]',
    '[data-info-popover]'
];
const Dialog = function Dialog(param) {
    let { children, type, className, onClose, 'aria-labelledby': ariaLabelledBy, 'aria-describedby': ariaDescribedBy, dialogResizerRef, ...props } = param;
    const dialogRef = React.useRef(null);
    const [role, setRole] = React.useState(typeof document !== 'undefined' && document.hasFocus() ? 'dialog' : undefined);
    const ref = React.useRef(null);
    const [height, pristine] = useMeasureHeight(ref);
    useOnClickOutside(dialogRef.current, CSS_SELECTORS_TO_EXCLUDE_ON_CLICK_OUTSIDE, (e)=>{
        e.preventDefault();
        return onClose == null ? void 0 : onClose();
    });
    React.useEffect(()=>{
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
    React.useEffect(()=>{
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
    return /*#__PURE__*/ _jsx("div", {
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
        children: /*#__PURE__*/ _jsx("div", {
            ref: dialogResizerRef,
            "data-nextjs-dialog-sizer": true,
            // [x] Don't animate on initial load
            // [x] No duplicate elements
            // [x] Responds to content growth
            style: {
                height,
                transition: pristine ? undefined : 'height 250ms var(--timing-swift)'
            },
            children: /*#__PURE__*/ _jsx("div", {
                ref: ref,
                children: children
            })
        })
    });
};
export { Dialog };

//# sourceMappingURL=dialog.js.map