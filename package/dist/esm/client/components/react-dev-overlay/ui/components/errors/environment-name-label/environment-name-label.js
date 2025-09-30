import { jsx as _jsx } from "react/jsx-runtime";
export function EnvironmentNameLabel(param) {
    let { environmentName } = param;
    return /*#__PURE__*/ _jsx("span", {
        "data-nextjs-environment-name-label": true,
        children: environmentName
    });
}
export const ENVIRONMENT_NAME_LABEL_STYLES = "\n  [data-nextjs-environment-name-label] {\n    padding: 2px 6px;\n    margin: 0;\n    border-radius: var(--rounded-md-2);\n    background: var(--color-gray-100);\n    font-weight: 600;\n    font-size: var(--size-12);\n    color: var(--color-gray-900);\n    font-family: var(--font-stack-monospace);\n    line-height: var(--size-20);\n  }\n";

//# sourceMappingURL=environment-name-label.js.map