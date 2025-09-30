"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Base", {
    enumerable: true,
    get: function() {
        return Base;
    }
});
const _tagged_template_literal_loose = require("@swc/helpers/_/_tagged_template_literal_loose");
const _jsxruntime = require("react/jsx-runtime");
const _css = require("../../utils/css");
function _templateObject() {
    const data = _tagged_template_literal_loose._([
        "\n        :host {\n          /* \n           * Although the style applied to the shadow host is isolated,\n           * the element that attached the shadow host (i.e. \"nextjs-portal\")\n           * is still affected by the parent's style (e.g. \"body\"). This may\n           * occur style conflicts like \"display: flex\", with other children\n           * elements therefore give the shadow host an absolute position.\n           */\n          position: absolute;\n\n          --color-font: #757575;\n          --color-backdrop: rgba(250, 250, 250, 0.8);\n          --color-border-shadow: rgba(0, 0, 0, 0.145);\n\n          --color-title-color: #1f1f1f;\n          --color-stack-notes: #777;\n\n          --color-accents-1: #808080;\n          --color-accents-2: #222222;\n          --color-accents-3: #404040;\n\n          --font-stack-monospace: '__nextjs-Geist Mono', 'Geist Mono',\n            'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier,\n            monospace;\n          --font-stack-sans: '__nextjs-Geist', 'Geist', -apple-system,\n            'Source Sans Pro', sans-serif;\n\n          font-family: var(--font-stack-sans);\n          font-variant-ligatures: none;\n\n          /* TODO: Remove replaced ones. */\n          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);\n          --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1),\n            0 1px 2px -1px rgb(0 0 0 / 0.1);\n          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1),\n            0 2px 4px -2px rgb(0 0 0 / 0.1);\n          --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1),\n            0 4px 6px -4px rgb(0 0 0 / 0.1);\n          --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1),\n            0 8px 10px -6px rgb(0 0 0 / 0.1);\n          --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);\n          --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);\n          --shadow-none: 0 0 #0000;\n\n          --shadow-small: 0px 2px 2px rgba(0, 0, 0, 0.04);\n          --shadow-menu: 0px 1px 1px rgba(0, 0, 0, 0.02),\n            0px 4px 8px -4px rgba(0, 0, 0, 0.04),\n            0px 16px 24px -8px rgba(0, 0, 0, 0.06);\n\n          --focus-color: var(--color-blue-800);\n          --focus-ring: 2px solid var(--focus-color);\n\n          --timing-swift: cubic-bezier(0.23, 0.88, 0.26, 0.92);\n          --timing-overlay: cubic-bezier(0.175, 0.885, 0.32, 1.1);\n\n          --rounded-none: 0px;\n          --rounded-sm: 2px;\n          --rounded-md: 4px;\n          --rounded-md-2: 6px;\n          --rounded-lg: 8px;\n          --rounded-xl: 12px;\n          --rounded-2xl: 16px;\n          --rounded-3xl: 24px;\n          --rounded-4xl: 32px;\n          --rounded-full: 9999px;\n\n          /* \n            This value gets set from the Dev Tools preferences,\n            and we use the following --size-* variables to \n            scale the relevant elements.\n\n            The reason why we don't rely on rem values is because\n            if an app sets their root font size to something tiny, \n            it feels unexpected to have the app root size leak \n            into a Next.js surface.\n\n            https://github.com/vercel/next.js/discussions/76812\n          */\n          --nextjs-dev-tools-scale: ",
        ";\n          --size-1: calc(1px / var(--nextjs-dev-tools-scale));\n          --size-2: calc(2px / var(--nextjs-dev-tools-scale));\n          --size-3: calc(3px / var(--nextjs-dev-tools-scale));\n          --size-4: calc(4px / var(--nextjs-dev-tools-scale));\n          --size-5: calc(5px / var(--nextjs-dev-tools-scale));\n          --size-6: calc(6px / var(--nextjs-dev-tools-scale));\n          --size-7: calc(7px / var(--nextjs-dev-tools-scale));\n          --size-8: calc(8px / var(--nextjs-dev-tools-scale));\n          --size-9: calc(9px / var(--nextjs-dev-tools-scale));\n          --size-10: calc(10px / var(--nextjs-dev-tools-scale));\n          --size-11: calc(11px / var(--nextjs-dev-tools-scale));\n          --size-12: calc(12px / var(--nextjs-dev-tools-scale));\n          --size-13: calc(13px / var(--nextjs-dev-tools-scale));\n          --size-14: calc(14px / var(--nextjs-dev-tools-scale));\n          --size-15: calc(15px / var(--nextjs-dev-tools-scale));\n          --size-16: calc(16px / var(--nextjs-dev-tools-scale));\n          --size-17: calc(17px / var(--nextjs-dev-tools-scale));\n          --size-18: calc(18px / var(--nextjs-dev-tools-scale));\n          --size-20: calc(20px / var(--nextjs-dev-tools-scale));\n          --size-22: calc(22px / var(--nextjs-dev-tools-scale));\n          --size-24: calc(24px / var(--nextjs-dev-tools-scale));\n          --size-26: calc(26px / var(--nextjs-dev-tools-scale));\n          --size-28: calc(28px / var(--nextjs-dev-tools-scale));\n          --size-30: calc(30px / var(--nextjs-dev-tools-scale));\n          --size-32: calc(32px / var(--nextjs-dev-tools-scale));\n          --size-34: calc(34px / var(--nextjs-dev-tools-scale));\n          --size-36: calc(36px / var(--nextjs-dev-tools-scale));\n          --size-38: calc(38px / var(--nextjs-dev-tools-scale));\n          --size-40: calc(40px / var(--nextjs-dev-tools-scale));\n          --size-42: calc(42px / var(--nextjs-dev-tools-scale));\n          --size-44: calc(44px / var(--nextjs-dev-tools-scale));\n          --size-46: calc(46px / var(--nextjs-dev-tools-scale));\n          --size-48: calc(48px / var(--nextjs-dev-tools-scale));\n\n          @media print {\n            display: none;\n          }\n        }\n\n        h1,\n        h2,\n        h3,\n        h4,\n        h5,\n        h6 {\n          margin-bottom: 8px;\n          font-weight: 500;\n          line-height: 1.5;\n        }\n\n        a {\n          color: var(--color-blue-900);\n          &:hover {\n            color: var(--color-blue-900);\n          }\n          &:focus {\n            outline: var(--focus-ring);\n          }\n        }\n      "
    ]);
    _templateObject = function() {
        return data;
    };
    return data;
}
function Base(param) {
    let { scale = 1 } = param;
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("style", {
        children: (0, _css.css)(_templateObject(), String(scale))
    });
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=base.js.map