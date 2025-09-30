import { jsx as _jsx } from "react/jsx-runtime";
import { CopyButton } from '../../copy-button';
export function CopyStackTraceButton(param) {
    let { error } = param;
    return /*#__PURE__*/ _jsx(CopyButton, {
        "data-nextjs-data-runtime-error-copy-stack": true,
        className: "copy-stack-trace-button",
        actionLabel: "Copy Stack Trace",
        successLabel: "Stack Trace Copied",
        content: error.stack || '',
        disabled: !error.stack
    });
}

//# sourceMappingURL=copy-stack-trace-button.js.map