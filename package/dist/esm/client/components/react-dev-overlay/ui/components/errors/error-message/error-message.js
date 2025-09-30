import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useLayoutEffect } from 'react';
export function ErrorMessage(param) {
    let { errorMessage } = param;
    const [isExpanded, setIsExpanded] = useState(false);
    const [shouldTruncate, setShouldTruncate] = useState(false);
    const messageRef = useRef(null);
    useLayoutEffect(()=>{
        if (messageRef.current) {
            setShouldTruncate(messageRef.current.scrollHeight > 200);
        }
    }, [
        errorMessage
    ]);
    return /*#__PURE__*/ _jsxs("div", {
        className: "nextjs__container_errors_wrapper",
        children: [
            /*#__PURE__*/ _jsx("p", {
                ref: messageRef,
                id: "nextjs__container_errors_desc",
                className: "nextjs__container_errors_desc " + (shouldTruncate && !isExpanded ? 'truncated' : ''),
                children: errorMessage
            }),
            shouldTruncate && !isExpanded && /*#__PURE__*/ _jsxs(_Fragment, {
                children: [
                    /*#__PURE__*/ _jsx("div", {
                        className: "nextjs__container_errors_gradient_overlay"
                    }),
                    /*#__PURE__*/ _jsx("button", {
                        onClick: ()=>setIsExpanded(true),
                        className: "nextjs__container_errors_expand_button",
                        "aria-expanded": isExpanded,
                        "aria-controls": "nextjs__container_errors_desc",
                        children: "Show More"
                    })
                ]
            })
        ]
    });
}
export const styles = "\n  .nextjs__container_errors_wrapper {\n    position: relative;\n  }\n\n  .nextjs__container_errors_desc {\n    margin: 0;\n    margin-left: 4px;\n    color: var(--color-red-900);\n    font-weight: 500;\n    font-size: var(--size-16);\n    letter-spacing: -0.32px;\n    line-height: var(--size-24);\n    overflow-wrap: break-word;\n    white-space: pre-wrap;\n  }\n\n  .nextjs__container_errors_desc.truncated {\n    max-height: 200px;\n    overflow: hidden;\n  }\n\n  .nextjs__container_errors_gradient_overlay {\n    position: absolute;\n    bottom: 0;\n    left: 0;\n    right: 0;\n    height: 85px;\n    background: linear-gradient(\n      180deg,\n      rgba(250, 250, 250, 0) 0%,\n      var(--color-background-100) 100%\n    );\n  }\n\n  .nextjs__container_errors_expand_button {\n    position: absolute;\n    bottom: 10px;\n    left: 50%;\n    transform: translateX(-50%);\n    display: flex;\n    align-items: center;\n    padding: 6px 8px;\n    background: var(--color-background-100);\n    border: 1px solid var(--color-gray-alpha-400);\n    border-radius: 999px;\n    box-shadow:\n      0px 2px 2px var(--color-gray-alpha-100),\n      0px 8px 8px -8px var(--color-gray-alpha-100);\n    font-size: var(--size-13);\n    cursor: pointer;\n    color: var(--color-gray-900);\n    font-weight: 500;\n    transition: background-color 0.2s ease;\n  }\n\n  .nextjs__container_errors_expand_button:hover {\n    background: var(--color-gray-100);\n  }\n";

//# sourceMappingURL=error-message.js.map