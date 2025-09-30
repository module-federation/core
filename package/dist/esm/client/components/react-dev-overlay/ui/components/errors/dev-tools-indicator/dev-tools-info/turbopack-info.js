import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DevToolsInfo } from './dev-tools-info';
import { CopyButton } from '../../../copy-button';
export function TurbopackInfo(props) {
    return /*#__PURE__*/ _jsxs(DevToolsInfo, {
        title: "Turbopack",
        learnMoreLink: "https://nextjs.org/docs/app/api-reference/turbopack",
        ...props,
        children: [
            /*#__PURE__*/ _jsxs("article", {
                className: "dev-tools-info-article",
                children: [
                    /*#__PURE__*/ _jsxs("p", {
                        className: "dev-tools-info-paragraph",
                        children: [
                            "Turbopack is an incremental bundler optimized for JavaScript and TypeScript, written in Rust, and built into Next.js. Turbopack can be used in Next.js in both the",
                            ' ',
                            /*#__PURE__*/ _jsx("code", {
                                className: "dev-tools-info-code",
                                children: "pages"
                            }),
                            " and",
                            ' ',
                            /*#__PURE__*/ _jsx("code", {
                                className: "dev-tools-info-code",
                                children: "app"
                            }),
                            " directories for faster local development."
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("p", {
                        className: "dev-tools-info-paragraph",
                        children: [
                            "To enable Turbopack, use the",
                            ' ',
                            /*#__PURE__*/ _jsx("code", {
                                className: "dev-tools-info-code",
                                children: "--turbopack"
                            }),
                            " flag when running the Next.js development server."
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ _jsx("div", {
                className: "dev-tools-info-code-block-container",
                children: /*#__PURE__*/ _jsxs("div", {
                    className: "dev-tools-info-code-block",
                    children: [
                        /*#__PURE__*/ _jsx(CopyButton, {
                            actionLabel: "Copy Next.js Turbopack Command",
                            successLabel: "Next.js Turbopack Command Copied",
                            content: '--turbopack',
                            className: "dev-tools-info-copy-button"
                        }),
                        /*#__PURE__*/ _jsx("pre", {
                            className: "dev-tools-info-code-block-pre",
                            children: /*#__PURE__*/ _jsxs("code", {
                                children: [
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "dev-tools-info-code-block-line",
                                        children: '  '
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "dev-tools-info-code-block-line",
                                        children: '{'
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "dev-tools-info-code-block-line",
                                        children: [
                                            '  ',
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "dev-tools-info-code-block-json-key",
                                                children: '"scripts"'
                                            }),
                                            ": ",
                                            '{'
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "dev-tools-info-code-block-line dev-tools-info-highlight",
                                        children: [
                                            '    ',
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "dev-tools-info-code-block-json-key",
                                                children: '"dev"'
                                            }),
                                            ":",
                                            ' ',
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "dev-tools-info-code-block-json-value",
                                                children: '"next dev --turbopack"'
                                            }),
                                            ","
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "dev-tools-info-code-block-line",
                                        children: [
                                            '    ',
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "dev-tools-info-code-block-json-key",
                                                children: '"build"'
                                            }),
                                            ":",
                                            ' ',
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "dev-tools-info-code-block-json-value",
                                                children: '"next build"'
                                            }),
                                            ","
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "dev-tools-info-code-block-line",
                                        children: [
                                            '    ',
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "dev-tools-info-code-block-json-key",
                                                children: '"start"'
                                            }),
                                            ":",
                                            ' ',
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "dev-tools-info-code-block-json-value",
                                                children: '"next start"'
                                            }),
                                            ","
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "dev-tools-info-code-block-line",
                                        children: [
                                            '    ',
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "dev-tools-info-code-block-json-key",
                                                children: '"lint"'
                                            }),
                                            ":",
                                            ' ',
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "dev-tools-info-code-block-json-value",
                                                children: '"next lint"'
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "dev-tools-info-code-block-line",
                                        children: '  }'
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "dev-tools-info-code-block-line",
                                        children: '}'
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
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
export const DEV_TOOLS_INFO_TURBOPACK_INFO_STYLES = "\n  .dev-tools-info-code {\n    background: var(--color-gray-400);\n    color: var(--color-gray-1000);\n    font-family: var(--font-stack-monospace);\n    padding: 2px 4px;\n    margin: 0;\n    font-size: var(--size-13);\n    white-space: break-spaces;\n    border-radius: var(--rounded-md-2);\n  }\n\n  .dev-tools-info-code-block-container {\n    padding: 6px;\n  }\n\n  .dev-tools-info-code-block {\n    position: relative;\n    background: var(--color-background-200);\n    border: 1px solid var(--color-gray-alpha-400);\n    border-radius: var(--rounded-md-2);\n    min-width: 326px;\n  }\n\n  .dev-tools-info-code-block-pre {\n    margin: 0;\n    font-family: var(--font-stack-monospace);\n    font-size: var(--size-12);\n  }\n\n  .dev-tools-info-copy-button {\n    position: absolute;\n\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    right: 8px;\n    top: 8px;\n    padding: 4px;\n    height: var(--size-24);\n    width: var(--size-24);\n    border-radius: var(--rounded-md-2);\n    border: 1px solid var(--color-gray-alpha-400);\n    background: var(--color-background-100);\n  }\n\n  .dev-tools-info-code-block-line {\n    display: block;\n    line-height: 1.5;\n    padding: 0 16px;\n  }\n\n  .dev-tools-info-code-block-line.dev-tools-info-highlight {\n    border-left: 2px solid var(--color-blue-900);\n    background: var(--color-blue-400);\n  }\n\n  .dev-tools-info-code-block-json-key {\n    color: var(--color-syntax-keyword);\n  }\n\n  .dev-tools-info-code-block-json-value {\n    color: var(--color-syntax-link);\n  }\n";

//# sourceMappingURL=turbopack-info.js.map