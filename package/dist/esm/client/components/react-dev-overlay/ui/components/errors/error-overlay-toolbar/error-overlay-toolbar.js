import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NodejsInspectorButton } from './nodejs-inspector-button';
import { CopyStackTraceButton } from './copy-stack-trace-button';
import { DocsLinkButton } from './docs-link-button';
export function ErrorOverlayToolbar(param) {
    let { error, debugInfo } = param;
    return /*#__PURE__*/ _jsxs("span", {
        className: "error-overlay-toolbar",
        children: [
            /*#__PURE__*/ _jsx(CopyStackTraceButton, {
                error: error
            }),
            /*#__PURE__*/ _jsx(DocsLinkButton, {
                errorMessage: error.message
            }),
            /*#__PURE__*/ _jsx(NodejsInspectorButton, {
                devtoolsFrontendUrl: debugInfo == null ? void 0 : debugInfo.devtoolsFrontendUrl
            })
        ]
    });
}
export const styles = "\n  .error-overlay-toolbar {\n    display: flex;\n    gap: 6px;\n  }\n\n  .nodejs-inspector-button,\n  .copy-stack-trace-button,\n  .docs-link-button {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n\n    width: var(--size-28);\n    height: var(--size-28);\n    background: var(--color-background-100);\n    background-clip: padding-box;\n    border: 1px solid var(--color-gray-alpha-400);\n    box-shadow: var(--shadow-small);\n    border-radius: var(--rounded-full);\n\n    svg {\n      width: var(--size-14);\n      height: var(--size-14);\n    }\n\n    &:focus {\n      outline: var(--focus-ring);\n    }\n\n    &:not(:disabled):hover {\n      background: var(--color-gray-alpha-100);\n    }\n\n    &:not(:disabled):active {\n      background: var(--color-gray-alpha-200);\n    }\n\n    &:disabled {\n      background-color: var(--color-gray-100);\n      cursor: not-allowed;\n    }\n  }\n\n  .error-overlay-toolbar-button-icon {\n    color: var(--color-gray-900);\n  }\n";

//# sourceMappingURL=error-overlay-toolbar.js.map