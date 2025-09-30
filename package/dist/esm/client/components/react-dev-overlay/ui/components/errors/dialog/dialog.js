import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog } from '../../dialog/dialog';
export function ErrorOverlayDialog(param) {
    let { children, onClose, footer, ...props } = param;
    return /*#__PURE__*/ _jsxs("div", {
        className: "error-overlay-dialog-container",
        children: [
            /*#__PURE__*/ _jsx(Dialog, {
                type: "error",
                "aria-labelledby": "nextjs__container_errors_label",
                "aria-describedby": "nextjs__container_errors_desc",
                className: "error-overlay-dialog-scroll",
                onClose: onClose,
                ...props,
                children: children
            }),
            footer
        ]
    });
}
export const DIALOG_STYLES = "\n  .error-overlay-dialog-container {\n    -webkit-font-smoothing: antialiased;\n    display: flex;\n    flex-direction: column;\n    background: var(--color-background-100);\n    background-clip: padding-box;\n    border: var(--next-dialog-border-width) solid var(--color-gray-400);\n    border-radius: 0 0 var(--next-dialog-radius) var(--next-dialog-radius);\n    box-shadow: var(--shadow-menu);\n    position: relative;\n    overflow: hidden;\n  }\n\n  .error-overlay-dialog-scroll {\n    overflow-y: auto;\n    height: 100%;\n  }\n";

//# sourceMappingURL=dialog.js.map