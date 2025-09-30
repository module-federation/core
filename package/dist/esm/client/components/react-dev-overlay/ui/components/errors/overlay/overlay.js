import { jsx as _jsx } from "react/jsx-runtime";
import { Overlay } from '../../overlay/overlay';
export function ErrorOverlayOverlay(param) {
    let { children, ...props } = param;
    return /*#__PURE__*/ _jsx(Overlay, {
        ...props,
        children: children
    });
}
export const OVERLAY_STYLES = "\n  [data-nextjs-dialog-overlay] {\n    padding: initial;\n    top: 10vh;\n  }\n";

//# sourceMappingURL=overlay.js.map