"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    DEV_TOOLS_INFO_TURBOPACK_INFO_STYLES: null,
    TurbopackInfo: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DEV_TOOLS_INFO_TURBOPACK_INFO_STYLES: function() {
        return DEV_TOOLS_INFO_TURBOPACK_INFO_STYLES;
    },
    TurbopackInfo: function() {
        return TurbopackInfo;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _devtoolsinfo = require("./dev-tools-info");
const _copybutton = require("../../../copy-button");
function TurbopackInfo(props) {
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_devtoolsinfo.DevToolsInfo, {
        title: "Turbopack",
        learnMoreLink: "https://nextjs.org/docs/app/api-reference/turbopack",
        ...props,
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("article", {
                className: "dev-tools-info-article",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("p", {
                        className: "dev-tools-info-paragraph",
                        children: [
                            "Turbopack is an incremental bundler optimized for JavaScript and TypeScript, written in Rust, and built into Next.js. Turbopack can be used in Next.js in both the",
                            ' ',
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("code", {
                                className: "dev-tools-info-code",
                                children: "pages"
                            }),
                            " and",
                            ' ',
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("code", {
                                className: "dev-tools-info-code",
                                children: "app"
                            }),
                            " directories for faster local development."
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("p", {
                        className: "dev-tools-info-paragraph",
                        children: [
                            "To enable Turbopack, use the",
                            ' ',
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("code", {
                                className: "dev-tools-info-code",
                                children: "--turbopack"
                            }),
                            " flag when running the Next.js development server."
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "dev-tools-info-code-block-container",
                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "dev-tools-info-code-block",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)(_copybutton.CopyButton, {
                            actionLabel: "Copy Next.js Turbopack Command",
                            successLabel: "Next.js Turbopack Command Copied",
                            content: '--turbopack',
                            className: "dev-tools-info-copy-button"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("pre", {
                            className: "dev-tools-info-code-block-pre",
                            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("code", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "dev-tools-info-code-block-line",
                                        children: '  '
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "dev-tools-info-code-block-line",
                                        children: '{'
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "dev-tools-info-code-block-line",
                                        children: [
                                            '  ',
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "dev-tools-info-code-block-json-key",
                                                children: '"scripts"'
                                            }),
                                            ": ",
                                            '{'
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "dev-tools-info-code-block-line dev-tools-info-highlight",
                                        children: [
                                            '    ',
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "dev-tools-info-code-block-json-key",
                                                children: '"dev"'
                                            }),
                                            ":",
                                            ' ',
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "dev-tools-info-code-block-json-value",
                                                children: '"next dev --turbopack"'
                                            }),
                                            ","
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "dev-tools-info-code-block-line",
                                        children: [
                                            '    ',
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "dev-tools-info-code-block-json-key",
                                                children: '"build"'
                                            }),
                                            ":",
                                            ' ',
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "dev-tools-info-code-block-json-value",
                                                children: '"next build"'
                                            }),
                                            ","
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "dev-tools-info-code-block-line",
                                        children: [
                                            '    ',
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "dev-tools-info-code-block-json-key",
                                                children: '"start"'
                                            }),
                                            ":",
                                            ' ',
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "dev-tools-info-code-block-json-value",
                                                children: '"next start"'
                                            }),
                                            ","
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "dev-tools-info-code-block-line",
                                        children: [
                                            '    ',
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "dev-tools-info-code-block-json-key",
                                                children: '"lint"'
                                            }),
                                            ":",
                                            ' ',
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "dev-tools-info-code-block-json-value",
                                                children: '"next lint"'
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "dev-tools-info-code-block-line",
                                        children: '  }'
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "dev-tools-info-code-block-line",
                                        children: '}'
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "dev-tools-info-code-block-line",
                                        children: '  '
                                    })
                                ]
                            })
                        })
                    ]
                })
            })
        ]
    });
}
const DEV_TOOLS_INFO_TURBOPACK_INFO_STYLES = "\n  .dev-tools-info-code {\n    background: var(--color-gray-400);\n    color: var(--color-gray-1000);\n    font-family: var(--font-stack-monospace);\n    padding: 2px 4px;\n    margin: 0;\n    font-size: var(--size-13);\n    white-space: break-spaces;\n    border-radius: var(--rounded-md-2);\n  }\n\n  .dev-tools-info-code-block-container {\n    padding: 6px;\n  }\n\n  .dev-tools-info-code-block {\n    position: relative;\n    background: var(--color-background-200);\n    border: 1px solid var(--color-gray-alpha-400);\n    border-radius: var(--rounded-md-2);\n    min-width: 326px;\n  }\n\n  .dev-tools-info-code-block-pre {\n    margin: 0;\n    font-family: var(--font-stack-monospace);\n    font-size: var(--size-12);\n  }\n\n  .dev-tools-info-copy-button {\n    position: absolute;\n\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    right: 8px;\n    top: 8px;\n    padding: 4px;\n    height: var(--size-24);\n    width: var(--size-24);\n    border-radius: var(--rounded-md-2);\n    border: 1px solid var(--color-gray-alpha-400);\n    background: var(--color-background-100);\n  }\n\n  .dev-tools-info-code-block-line {\n    display: block;\n    line-height: 1.5;\n    padding: 0 16px;\n  }\n\n  .dev-tools-info-code-block-line.dev-tools-info-highlight {\n    border-left: 2px solid var(--color-blue-900);\n    background: var(--color-blue-400);\n  }\n\n  .dev-tools-info-code-block-json-key {\n    color: var(--color-syntax-keyword);\n  }\n\n  .dev-tools-info-code-block-json-value {\n    color: var(--color-syntax-link);\n  }\n";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=turbopack-info.js.map