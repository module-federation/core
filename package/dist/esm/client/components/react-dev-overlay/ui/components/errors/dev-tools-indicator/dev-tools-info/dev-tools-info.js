import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { MENU_DURATION_MS, useClickOutside, useFocusTrap } from '../utils';
import { useDelayedRender } from '../../../../hooks/use-delayed-render';
export function DevToolsInfo(param) {
    let { title, children, learnMoreLink, isOpen, triggerRef, close, ...props } = param;
    const ref = useRef(null);
    const closeButtonRef = useRef(null);
    const { mounted, rendered } = useDelayedRender(isOpen, {
        // Intentionally no fade in, makes the UI feel more immediate
        enterDelay: 0,
        // Graceful fade out to confirm that the UI did not break
        exitDelay: MENU_DURATION_MS
    });
    useFocusTrap(ref, triggerRef, isOpen, ()=>{
        var // Bring focus to close button, so the user can easily close the overlay
        _closeButtonRef_current;
        (_closeButtonRef_current = closeButtonRef.current) == null ? void 0 : _closeButtonRef_current.focus();
    });
    useClickOutside(ref, triggerRef, isOpen, close);
    if (!mounted) {
        return null;
    }
    return /*#__PURE__*/ _jsx("div", {
        tabIndex: -1,
        role: "dialog",
        ref: ref,
        "data-info-popover": true,
        ...props,
        "data-rendered": rendered,
        children: /*#__PURE__*/ _jsxs("div", {
            className: "dev-tools-info-container",
            children: [
                /*#__PURE__*/ _jsx("h1", {
                    className: "dev-tools-info-title",
                    children: title
                }),
                children,
                /*#__PURE__*/ _jsxs("div", {
                    className: "dev-tools-info-button-container",
                    children: [
                        /*#__PURE__*/ _jsx("button", {
                            ref: closeButtonRef,
                            className: "dev-tools-info-close-button",
                            onClick: close,
                            children: "Close"
                        }),
                        learnMoreLink && /*#__PURE__*/ _jsx("a", {
                            className: "dev-tools-info-learn-more-button",
                            href: learnMoreLink,
                            target: "_blank",
                            rel: "noreferrer noopener",
                            children: "Learn More"
                        })
                    ]
                })
            ]
        })
    });
}
export const DEV_TOOLS_INFO_STYLES = "\n  [data-info-popover] {\n    -webkit-font-smoothing: antialiased;\n    display: flex;\n    flex-direction: column;\n    align-items: flex-start;\n    background: var(--color-background-100);\n    border: 1px solid var(--color-gray-alpha-400);\n    background-clip: padding-box;\n    box-shadow: var(--shadow-menu);\n    border-radius: var(--rounded-xl);\n    position: absolute;\n    font-family: var(--font-stack-sans);\n    z-index: 1000;\n    overflow: hidden;\n    opacity: 0;\n    outline: 0;\n    min-width: 350px;\n    transition: opacity var(--animate-out-duration-ms)\n      var(--animate-out-timing-function);\n\n    &[data-rendered='true'] {\n      opacity: 1;\n      scale: 1;\n    }\n\n    button:focus-visible {\n      outline: var(--focus-ring);\n    }\n  }\n\n  .dev-tools-info-container {\n    padding: 12px;\n  }\n\n  .dev-tools-info-title {\n    padding: 8px 6px;\n    color: var(--color-gray-1000);\n    font-size: var(--size-16);\n    font-weight: 600;\n    line-height: var(--size-20);\n    margin: 0;\n  }\n\n  .dev-tools-info-article {\n    padding: 8px 6px;\n    color: var(--color-gray-1000);\n    font-size: var(--size-14);\n    line-height: var(--size-20);\n    margin: 0;\n  }\n  .dev-tools-info-paragraph {\n    &:last-child {\n      margin-bottom: 0;\n    }\n  }\n\n  .dev-tools-info-button-container {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 8px 6px;\n  }\n\n  .dev-tools-info-close-button {\n    padding: 0 8px;\n    height: var(--size-28);\n    font-size: var(--size-14);\n    font-weight: 500;\n    line-height: var(--size-20);\n    transition: background var(--duration-short) ease;\n    color: var(--color-gray-1000);\n    border-radius: var(--rounded-md-2);\n    border: 1px solid var(--color-gray-alpha-400);\n    background: var(--color-background-200);\n  }\n\n  .dev-tools-info-close-button:hover {\n    background: var(--color-gray-400);\n  }\n\n  .dev-tools-info-learn-more-button {\n    align-content: center;\n    padding: 0 8px;\n    height: var(--size-28);\n    font-size: var(--size-14);\n    font-weight: 500;\n    line-height: var(--size-20);\n    transition: background var(--duration-short) ease;\n    color: var(--color-background-100);\n    border-radius: var(--rounded-md-2);\n    background: var(--color-gray-1000);\n  }\n\n  .dev-tools-info-learn-more-button:hover {\n    text-decoration: none;\n    color: var(--color-background-100);\n    opacity: 0.9;\n  }\n";

//# sourceMappingURL=dev-tools-info.js.map