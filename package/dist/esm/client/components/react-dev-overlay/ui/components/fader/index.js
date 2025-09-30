import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
export const Fader = /*#__PURE__*/ forwardRef(function Fader(param, ref) {
    let { stop, blur, side, style, height } = param;
    return /*#__PURE__*/ _jsx("div", {
        ref: ref,
        "aria-hidden": true,
        "data-nextjs-scroll-fader": true,
        className: "nextjs-scroll-fader",
        "data-side": side,
        style: {
            '--stop': stop,
            '--blur': blur,
            '--height': "" + height + "px",
            ...style
        }
    });
});
export const FADER_STYLES = '\n  .nextjs-scroll-fader {\n    --blur: 1px;\n    --stop: 25%;\n    --height: 150px;\n    --color-bg: var(--color-background-100);\n    position: absolute;\n    pointer-events: none;\n    user-select: none;\n    width: 100%;\n    height: var(--height);\n    left: 0;\n    backdrop-filter: blur(var(--blur));\n\n    &[data-side="top"] {\n      top: 0;\n      background: linear-gradient(to top, transparent, var(--color-bg));\n      mask-image: linear-gradient(to bottom, var(--color-bg) var(--stop), transparent);\n    }\n  }\n\n';

//# sourceMappingURL=index.js.map