import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { LeftArrow } from '../../../icons/left-arrow';
import { RightArrow } from '../../../icons/right-arrow';
export function ErrorOverlayPagination(param) {
    let { runtimeErrors, activeIdx, onActiveIndexChange } = param;
    const handlePrevious = useCallback(()=>startTransition(()=>{
            if (activeIdx > 0) {
                onActiveIndexChange(Math.max(0, activeIdx - 1));
            }
        }), [
        activeIdx,
        onActiveIndexChange
    ]);
    const handleNext = useCallback(()=>startTransition(()=>{
            if (activeIdx < runtimeErrors.length - 1) {
                onActiveIndexChange(Math.max(0, Math.min(runtimeErrors.length - 1, activeIdx + 1)));
            }
        }), [
        activeIdx,
        runtimeErrors.length,
        onActiveIndexChange
    ]);
    const buttonLeft = useRef(null);
    const buttonRight = useRef(null);
    const [nav, setNav] = useState(null);
    const onNav = useCallback((el)=>{
        setNav(el);
    }, []);
    useEffect(()=>{
        if (nav == null) {
            return;
        }
        const root = nav.getRootNode();
        const d = self.document;
        function handler(e) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                e.stopPropagation();
                handlePrevious && handlePrevious();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                e.stopPropagation();
                handleNext && handleNext();
            }
        }
        root.addEventListener('keydown', handler);
        if (root !== d) {
            d.addEventListener('keydown', handler);
        }
        return function() {
            root.removeEventListener('keydown', handler);
            if (root !== d) {
                d.removeEventListener('keydown', handler);
            }
        };
    }, [
        nav,
        handleNext,
        handlePrevious
    ]);
    // Unlock focus for browsers like Firefox, that break all user focus if the
    // currently focused item becomes disabled.
    useEffect(()=>{
        if (nav == null) {
            return;
        }
        const root = nav.getRootNode();
        // Always true, but we do this for TypeScript:
        if (root instanceof ShadowRoot) {
            const a = root.activeElement;
            if (activeIdx === 0) {
                if (buttonLeft.current && a === buttonLeft.current) {
                    buttonLeft.current.blur();
                }
            } else if (activeIdx === runtimeErrors.length - 1) {
                if (buttonRight.current && a === buttonRight.current) {
                    buttonRight.current.blur();
                }
            }
        }
    }, [
        nav,
        activeIdx,
        runtimeErrors.length
    ]);
    return /*#__PURE__*/ _jsxs("nav", {
        className: "error-overlay-pagination dialog-exclude-closing-from-outside-click",
        ref: onNav,
        children: [
            /*#__PURE__*/ _jsx("button", {
                ref: buttonLeft,
                type: "button",
                disabled: activeIdx === 0,
                "aria-disabled": activeIdx === 0,
                onClick: handlePrevious,
                "data-nextjs-dialog-error-previous": true,
                className: "error-overlay-pagination-button",
                children: /*#__PURE__*/ _jsx(LeftArrow, {
                    title: "previous",
                    className: "error-overlay-pagination-button-icon"
                })
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "error-overlay-pagination-count",
                children: [
                    /*#__PURE__*/ _jsxs("span", {
                        "data-nextjs-dialog-error-index": activeIdx,
                        children: [
                            activeIdx + 1,
                            "/"
                        ]
                    }),
                    /*#__PURE__*/ _jsx("span", {
                        "data-nextjs-dialog-header-total-count": true,
                        children: runtimeErrors.length || 1
                    })
                ]
            }),
            /*#__PURE__*/ _jsx("button", {
                ref: buttonRight,
                type: "button",
                // If no errors or the last error is active, disable the button.
                disabled: activeIdx >= runtimeErrors.length - 1,
                "aria-disabled": activeIdx >= runtimeErrors.length - 1,
                onClick: handleNext,
                "data-nextjs-dialog-error-next": true,
                className: "error-overlay-pagination-button",
                children: /*#__PURE__*/ _jsx(RightArrow, {
                    title: "next",
                    className: "error-overlay-pagination-button-icon"
                })
            })
        ]
    });
}
export const styles = "\n  .error-overlay-pagination {\n    -webkit-font-smoothing: antialiased;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    gap: 8px;\n    width: fit-content;\n  }\n\n  .error-overlay-pagination-count {\n    color: var(--color-gray-900);\n    text-align: center;\n    font-size: var(--size-14);\n    font-weight: 500;\n    line-height: var(--size-16);\n    font-variant-numeric: tabular-nums;\n  }\n\n  .error-overlay-pagination-button {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n\n    width: var(--size-24);\n    height: var(--size-24);\n    background: var(--color-gray-300);\n    flex-shrink: 0;\n\n    border: none;\n    border-radius: var(--rounded-full);\n\n    svg {\n      width: var(--size-16);\n      height: var(--size-16);\n    }\n\n    &:focus-visible {\n      outline: var(--focus-ring);\n    }\n\n    &:not(:disabled):active {\n      background: var(--color-gray-500);\n    }\n\n    &:disabled {\n      opacity: 0.5;\n      cursor: not-allowed;\n    }\n  }\n\n  .error-overlay-pagination-button-icon {\n    color: var(--color-gray-1000);\n  }\n";

//# sourceMappingURL=error-overlay-pagination.js.map