import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ErrorFeedback } from './error-feedback/error-feedback';
import { styles as feedbackStyles } from './error-feedback/error-feedback';
export function ErrorOverlayFooter(param) {
    let { errorCode, footerMessage } = param;
    return /*#__PURE__*/ _jsxs("footer", {
        className: "error-overlay-footer",
        children: [
            footerMessage ? /*#__PURE__*/ _jsx("p", {
                className: "error-overlay-footer-message",
                children: footerMessage
            }) : null,
            errorCode ? /*#__PURE__*/ _jsx(ErrorFeedback, {
                className: "error-feedback",
                errorCode: errorCode
            }) : null
        ]
    });
}
export const styles = "\n  .error-overlay-footer {\n    display: flex;\n    flex-direction: row;\n    justify-content: space-between;\n\n    gap: 8px;\n    padding: 12px;\n    background: var(--color-background-200);\n    border-top: 1px solid var(--color-gray-400);\n  }\n\n  .error-feedback {\n    margin-left: auto;\n\n    p {\n      font-size: var(--size-14);\n      font-weight: 500;\n      margin: 0;\n    }\n  }\n\n  .error-overlay-footer-message {\n    color: var(--color-gray-900);\n    margin: 0;\n    font-size: var(--size-14);\n    font-weight: 400;\n    line-height: var(--size-20);\n  }\n\n  " + feedbackStyles + "\n";

//# sourceMappingURL=error-overlay-footer.js.map