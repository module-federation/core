"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "NodejsInspectorButton", {
    enumerable: true,
    get: function() {
        return NodejsInspectorButton;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _copybutton = require("../../copy-button");
// Inline this helper to avoid widely used across the codebase,
// as for this feature the Chrome detector doesn't need to be super accurate.
function isChrome() {
    if (typeof window === 'undefined') return false;
    const isChromium = 'chrome' in window && window.chrome;
    const vendorName = window.navigator.vendor;
    return isChromium !== null && isChromium !== undefined && vendorName === 'Google Inc.';
}
const isChromeBrowser = isChrome();
function NodeJsIcon(props) {
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 14 14",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        ...props,
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("mask", {
                id: "nodejs_icon_mask_a",
                style: {
                    maskType: 'luminance'
                },
                maskUnits: "userSpaceOnUse",
                x: "0",
                y: "0",
                width: "14",
                height: "14",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                    d: "M6.67.089 1.205 3.256a.663.663 0 0 0-.33.573v6.339c0 .237.126.455.33.574l5.466 3.17a.66.66 0 0 0 .66 0l5.465-3.17a.664.664 0 0 0 .329-.574V3.829a.663.663 0 0 0-.33-.573L7.33.089a.663.663 0 0 0-.661 0",
                    fill: "#fff"
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("g", {
                mask: "url(#nodejs_icon_mask_a)",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                    d: "M18.648 2.717 3.248-4.86-4.648 11.31l15.4 7.58 7.896-16.174z",
                    fill: "url(#nodejs_icon_linear_gradient_b)"
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("mask", {
                id: "nodejs_icon_mask_c",
                style: {
                    maskType: 'luminance'
                },
                maskUnits: "userSpaceOnUse",
                x: "1",
                y: "0",
                width: "12",
                height: "14",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                    d: "M1.01 10.57a.663.663 0 0 0 .195.17l4.688 2.72.781.45a.66.66 0 0 0 .51.063l5.764-10.597a.653.653 0 0 0-.153-.122L9.216 1.18 7.325.087a.688.688 0 0 0-.171-.07L1.01 10.57z",
                    fill: "#fff"
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("g", {
                mask: "url(#nodejs_icon_mask_c)",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                    d: "M-5.647 4.958 5.226 19.734l14.38-10.667L8.734-5.71-5.647 4.958z",
                    fill: "url(#nodejs_icon_linear_gradient_d)"
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("g", {
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("mask", {
                        id: "nodejs_icon_mask_e",
                        style: {
                            maskType: 'luminance'
                        },
                        maskUnits: "userSpaceOnUse",
                        x: "1",
                        y: "0",
                        width: "13",
                        height: "14",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                            d: "M6.934.004A.665.665 0 0 0 6.67.09L1.22 3.247l5.877 10.746a.655.655 0 0 0 .235-.08l5.465-3.17a.665.665 0 0 0 .319-.453L7.126.015a.684.684 0 0 0-.189-.01",
                            fill: "#fff"
                        })
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("g", {
                        mask: "url(#nodejs_icon_mask_e)",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                            d: "M1.22.002v13.992h11.894V.002H1.22z",
                            fill: "url(#nodejs_icon_linear_gradient_f)"
                        })
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("defs", {
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("linearGradient", {
                        id: "nodejs_icon_linear_gradient_b",
                        x1: "10.943",
                        y1: "-1.084",
                        x2: "2.997",
                        y2: "15.062",
                        gradientUnits: "userSpaceOnUse",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".3",
                                stopColor: "#3E863D"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".5",
                                stopColor: "#55934F"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".8",
                                stopColor: "#5AAD45"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("linearGradient", {
                        id: "nodejs_icon_linear_gradient_d",
                        x1: "-.145",
                        y1: "12.431",
                        x2: "14.277",
                        y2: "1.818",
                        gradientUnits: "userSpaceOnUse",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".57",
                                stopColor: "#3E863D"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".72",
                                stopColor: "#619857"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: "1",
                                stopColor: "#76AC64"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("linearGradient", {
                        id: "nodejs_icon_linear_gradient_f",
                        x1: "1.225",
                        y1: "6.998",
                        x2: "13.116",
                        y2: "6.998",
                        gradientUnits: "userSpaceOnUse",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".16",
                                stopColor: "#6BBF47"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".38",
                                stopColor: "#79B461"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".47",
                                stopColor: "#75AC64"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".7",
                                stopColor: "#659E5A"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".9",
                                stopColor: "#3E863D"
                            })
                        ]
                    })
                ]
            })
        ]
    });
}
function NodeJsDisabledIcon(props) {
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 14 14",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        ...props,
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("mask", {
                id: "nodejs_icon_mask_a",
                style: {
                    maskType: 'luminance'
                },
                maskUnits: "userSpaceOnUse",
                x: "0",
                y: "0",
                width: "14",
                height: "14",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                    d: "M6.67.089 1.205 3.256a.663.663 0 0 0-.33.573v6.339c0 .237.126.455.33.574l5.466 3.17a.66.66 0 0 0 .66 0l5.465-3.17a.664.664 0 0 0 .329-.574V3.829a.663.663 0 0 0-.33-.573L7.33.089a.663.663 0 0 0-.661 0",
                    fill: "#fff"
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("g", {
                mask: "url(#nodejs_icon_mask_a)",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                    d: "M18.648 2.717 3.248-4.86-4.646 11.31l15.399 7.58 7.896-16.174z",
                    fill: "url(#nodejs_icon_linear_gradient_b)"
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("mask", {
                id: "nodejs_icon_mask_c",
                style: {
                    maskType: 'luminance'
                },
                maskUnits: "userSpaceOnUse",
                x: "1",
                y: "0",
                width: "12",
                height: "15",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                    d: "M1.01 10.571a.66.66 0 0 0 .195.172l4.688 2.718.781.451a.66.66 0 0 0 .51.063l5.764-10.597a.653.653 0 0 0-.153-.122L9.216 1.181 7.325.09a.688.688 0 0 0-.171-.07L1.01 10.572z",
                    fill: "#fff"
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("g", {
                mask: "url(#nodejs_icon_mask_c)",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                    d: "M-5.647 4.96 5.226 19.736 19.606 9.07 8.734-5.707-5.647 4.96z",
                    fill: "url(#nodejs_icon_linear_gradient_d)"
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("g", {
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("mask", {
                        id: "nodejs_icon_mask_e",
                        style: {
                            maskType: 'luminance'
                        },
                        maskUnits: "userSpaceOnUse",
                        x: "1",
                        y: "0",
                        width: "13",
                        height: "14",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                            d: "M6.935.003a.665.665 0 0 0-.264.085l-5.45 3.158 5.877 10.747a.653.653 0 0 0 .235-.082l5.465-3.17a.665.665 0 0 0 .319-.452L7.127.014a.684.684 0 0 0-.189-.01",
                            fill: "#fff"
                        })
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("g", {
                        mask: "url(#nodejs_icon_mask_e)",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                            d: "M1.222.001v13.992h11.893V0H1.222z",
                            fill: "url(#nodejs_icon_linear_gradient_f)"
                        })
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("defs", {
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("linearGradient", {
                        id: "nodejs_icon_linear_gradient_b",
                        x1: "10.944",
                        y1: "-1.084",
                        x2: "2.997",
                        y2: "15.062",
                        gradientUnits: "userSpaceOnUse",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".3",
                                stopColor: "#676767"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".5",
                                stopColor: "#858585"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".8",
                                stopColor: "#989A98"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("linearGradient", {
                        id: "nodejs_icon_linear_gradient_d",
                        x1: "-.145",
                        y1: "12.433",
                        x2: "14.277",
                        y2: "1.819",
                        gradientUnits: "userSpaceOnUse",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".57",
                                stopColor: "#747474"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".72",
                                stopColor: "#707070"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: "1",
                                stopColor: "#929292"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("linearGradient", {
                        id: "nodejs_icon_linear_gradient_f",
                        x1: "1.226",
                        y1: "6.997",
                        x2: "13.117",
                        y2: "6.997",
                        gradientUnits: "userSpaceOnUse",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".16",
                                stopColor: "#878787"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".38",
                                stopColor: "#A9A9A9"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".47",
                                stopColor: "#A5A5A5"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".7",
                                stopColor: "#8F8F8F"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: ".9",
                                stopColor: "#626262"
                            })
                        ]
                    })
                ]
            })
        ]
    });
}
const label = 'Learn more about enabling Node.js inspector for server code with Chrome DevTools';
function NodejsInspectorButton(param) {
    let { devtoolsFrontendUrl } = param;
    const content = devtoolsFrontendUrl || '';
    const disabled = !content || !isChromeBrowser;
    if (disabled) {
        return /*#__PURE__*/ (0, _jsxruntime.jsx)("a", {
            title: label,
            "aria-label": label,
            className: "nodejs-inspector-button",
            href: "https://nextjs.org/docs/app/building-your-application/configuring/debugging#server-side-code",
            target: "_blank",
            rel: "noopener noreferrer",
            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(NodeJsDisabledIcon, {
                className: "error-overlay-toolbar-button-icon",
                width: 14,
                height: 14
            })
        });
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_copybutton.CopyButton, {
        "data-nextjs-data-runtime-error-copy-devtools-url": true,
        className: "nodejs-inspector-button",
        actionLabel: 'Copy Chrome DevTools URL',
        successLabel: "Copied",
        content: content,
        icon: /*#__PURE__*/ (0, _jsxruntime.jsx)(NodeJsIcon, {
            className: "error-overlay-toolbar-button-icon",
            width: 14,
            height: 14
        })
    });
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=nodejs-inspector-button.js.map