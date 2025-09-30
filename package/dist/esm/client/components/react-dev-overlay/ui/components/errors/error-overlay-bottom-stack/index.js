import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ErrorOverlayBottomStack(param) {
    let { errorCount, activeIdx } = param;
    // If there are more than 2 errors to navigate, the stack count should remain at 2.
    const stackCount = Math.min(errorCount - activeIdx - 1, 2);
    return /*#__PURE__*/ _jsx("div", {
        "aria-hidden": true,
        className: "error-overlay-bottom-stack",
        children: /*#__PURE__*/ _jsxs("div", {
            className: "error-overlay-bottom-stack-stack",
            "data-stack-count": stackCount,
            children: [
                /*#__PURE__*/ _jsx("div", {
                    className: "error-overlay-bottom-stack-layer error-overlay-bottom-stack-layer-1",
                    children: "1"
                }),
                /*#__PURE__*/ _jsx("div", {
                    className: "error-overlay-bottom-stack-layer error-overlay-bottom-stack-layer-2",
                    children: "2"
                })
            ]
        })
    });
}
export const styles = "\n  .error-overlay-bottom-stack-layer {\n    width: 100%;\n    height: var(--stack-layer-height);\n    position: relative;\n    border: 1px solid var(--color-gray-400);\n    border-radius: var(--rounded-xl);\n    background: var(--color-background-200);\n    transition:\n      translate 350ms var(--timing-swift),\n      box-shadow 350ms var(--timing-swift);\n  }\n\n  .error-overlay-bottom-stack-layer-1 {\n    width: calc(100% - var(--size-24));\n  }\n\n  .error-overlay-bottom-stack-layer-2 {\n    width: calc(100% - var(--size-48));\n    z-index: -1;\n  }\n\n  .error-overlay-bottom-stack {\n    width: 100%;\n    position: absolute;\n    bottom: -1px;\n    height: 0;\n    overflow: visible;\n  }\n\n  .error-overlay-bottom-stack-stack {\n    --stack-layer-height: 44px;\n    --stack-layer-height-half: calc(var(--stack-layer-height) / 2);\n    --stack-layer-trim: 13px;\n    --shadow: 0px 0.925px 0.925px 0px rgba(0, 0, 0, 0.02),\n      0px 3.7px 7.4px -3.7px rgba(0, 0, 0, 0.04),\n      0px 14.8px 22.2px -7.4px rgba(0, 0, 0, 0.06);\n\n    display: grid;\n    place-items: center center;\n    width: 100%;\n    position: fixed;\n    overflow: hidden;\n    z-index: -1;\n    max-width: var(--next-dialog-max-width);\n\n    .error-overlay-bottom-stack-layer {\n      grid-area: 1 / 1;\n      /* Hide */\n      translate: 0 calc(var(--stack-layer-height) * -1);\n    }\n\n    &[data-stack-count='1'],\n    &[data-stack-count='2'] {\n      .error-overlay-bottom-stack-layer-1 {\n        translate: 0\n          calc(var(--stack-layer-height-half) * -1 - var(--stack-layer-trim));\n      }\n    }\n\n    &[data-stack-count='2'] {\n      .error-overlay-bottom-stack-layer-2 {\n        translate: 0 calc(var(--stack-layer-trim) * -1 * 2);\n      }\n    }\n\n    /* Only the bottom stack should have the shadow */\n    &[data-stack-count='1'] .error-overlay-bottom-stack-layer-1 {\n      box-shadow: var(--shadow);\n    }\n\n    &[data-stack-count='2'] {\n      .error-overlay-bottom-stack-layer-2 {\n        box-shadow: var(--shadow);\n      }\n    }\n  }\n";

//# sourceMappingURL=index.js.map