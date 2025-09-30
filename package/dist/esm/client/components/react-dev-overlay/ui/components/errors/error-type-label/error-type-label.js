import { jsx as _jsx } from "react/jsx-runtime";
export function ErrorTypeLabel(param) {
    let { errorType } = param;
    return /*#__PURE__*/ _jsx("span", {
        id: "nextjs__container_errors_label",
        className: "nextjs__container_errors_label",
        children: errorType
    });
}
export const styles = "\n  .nextjs__container_errors_label {\n    padding: 2px 6px;\n    margin: 0;\n    border-radius: var(--rounded-md-2);\n    background: var(--color-red-100);\n    font-weight: 600;\n    font-size: var(--size-12);\n    color: var(--color-red-900);\n    font-family: var(--font-stack-monospace);\n    line-height: var(--size-20);\n  }\n";

//# sourceMappingURL=error-type-label.js.map