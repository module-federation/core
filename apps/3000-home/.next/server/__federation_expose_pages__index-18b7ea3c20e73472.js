"use strict";
exports.id = "__federation_expose_pages__index";
exports.ids = ["__federation_expose_pages__index"];
exports.modules = {

/***/ "./pages/index.tsx":
/*!*************************!*\
  !*** ./pages/index.tsx ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getServerSideProps: () => (/* binding */ getServerSideProps)
/* harmony export */ });
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ "webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime");
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/head */ "webpack/sharing/consume/default/next/head/next/head?1388");
/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var checkout_CheckoutTitle__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! checkout/CheckoutTitle */ "webpack/container/remote/checkout/CheckoutTitle");
/* harmony import */ var checkout_CheckoutTitle__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(checkout_CheckoutTitle__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var checkout_ButtonOldAnt__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! checkout/ButtonOldAnt */ "webpack/container/remote/checkout/ButtonOldAnt");
/* harmony import */ var checkout_ButtonOldAnt__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(checkout_ButtonOldAnt__WEBPACK_IMPORTED_MODULE_4__);





// const CheckoutTitle = lazy(() => import('checkout/CheckoutTitle'));
// const ButtonOldAnt = lazy(() => import('checkout/ButtonOldAnt'));
const WebpackSvgRemote = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.lazy)(()=>__webpack_require__.e(/*! import() */ "webpack_container_remote_shop_WebpackSvg").then(__webpack_require__.t.bind(__webpack_require__, /*! shop/WebpackSvg */ "webpack/container/remote/shop/WebpackSvg", 23)).then((m)=>{
        return m;
    }));
const WebpackPngRemote = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.lazy)(()=>__webpack_require__.e(/*! import() */ "webpack_container_remote_shop_WebpackPng").then(__webpack_require__.t.bind(__webpack_require__, /*! shop/WebpackPng */ "webpack/container/remote/shop/WebpackPng", 23)));
// Server-side render counter (resets on each server restart/HMR)
let serverRenderCount = 0;
const Home = ({ renderCount, renderTime })=>{
    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: [
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_head__WEBPACK_IMPORTED_MODULE_2___default()), {
                children: [
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("title", {
                        children: "Home"
                    }, void 0, false, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, undefined),
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("link", {
                        rel: "icon",
                        href: "/favicon.ico"
                    }, void 0, false, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, undefined)
                ]
            }, void 0, true, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, undefined),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("div", {
                style: {
                    padding: "15px",
                    marginBottom: "20px",
                    backgroundColor: "#f0f8ff",
                    border: "2px solid #1890ff",
                    borderRadius: "8px",
                    fontFamily: "monospace",
                    textAlign: "center"
                },
                children: [
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("div", {
                        style: {
                            fontSize: "24px",
                            fontWeight: "bold",
                            color: "#1890ff",
                            marginBottom: "12px"
                        },
                        children: "\uD83D\uDD25 Server Render Counter"
                    }, void 0, false, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, undefined),
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("div", {
                        style: {
                            fontSize: "36px",
                            fontWeight: "bold",
                            color: "#52c41a",
                            marginBottom: "8px"
                        },
                        "data-testid": "render-counter",
                        children: renderCount || 0
                    }, void 0, false, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, undefined),
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("div", {
                        style: {
                            fontSize: "14px",
                            color: "#666",
                            marginBottom: "8px"
                        },
                        children: [
                            "Route: ",
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("span", {
                                style: {
                                    color: "#fa8c16",
                                    fontWeight: "bold"
                                },
                                children: "/"
                            }, void 0, false, {
                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                lineNumber: 41,
                                columnNumber: 18
                            }, undefined)
                        ]
                    }, void 0, true, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, undefined),
                    renderTime && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("div", {
                        style: {
                            fontSize: "12px",
                            color: "#666",
                            marginBottom: "8px"
                        },
                        children: [
                            "Last render: ",
                            new Date(renderTime).toLocaleTimeString()
                        ]
                    }, void 0, true, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                        lineNumber: 44,
                        columnNumber: 11
                    }, undefined),
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("div", {
                        style: {
                            fontSize: "12px",
                            color: "#999",
                            fontStyle: "italic"
                        },
                        children: "\uD83D\uDCA1 After HMR (?hotReloadAll=true), count should reset to 1 on next page reload"
                    }, void 0, false, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, undefined)
                ]
            }, void 0, true, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, undefined),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("h1", {
                style: {
                    fontSize: "2em"
                },
                children: "This is SPA combined from 3 different nextjs applications."
            }, void 0, false, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, undefined),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("p", {
                className: "description",
                children: "They utilize omnidirectional routing and pages or components are able to be federated between applications."
            }, void 0, false, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, undefined),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("p", {
                children: "You may open any application by clicking on the links below:"
            }, void 0, false, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, undefined),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("ul", {
                children: [
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("li", {
                        children: [
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("a", {
                                href: "#reloadPage",
                                onClick: ()=>window.location.href = "http://localhost:3000",
                                children: "localhost:3000"
                            }, void 0, false, {
                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                lineNumber: 63,
                                columnNumber: 11
                            }, undefined),
                            " – ",
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("b", {
                                children: "home"
                            }, void 0, false, {
                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, undefined)
                        ]
                    }, void 0, true, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                        lineNumber: 62,
                        columnNumber: 9
                    }, undefined),
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("li", {
                        children: [
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("a", {
                                href: "#reloadPage",
                                onClick: ()=>window.location.href = "http://localhost:3001",
                                children: "localhost:3001"
                            }, void 0, false, {
                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                lineNumber: 73,
                                columnNumber: 11
                            }, undefined),
                            " – ",
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("b", {
                                children: "shop"
                            }, void 0, false, {
                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                lineNumber: 80,
                                columnNumber: 11
                            }, undefined)
                        ]
                    }, void 0, true, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, undefined),
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("li", {
                        children: [
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("a", {
                                href: "#reloadPage",
                                onClick: ()=>window.location.href = "http://localhost:3002",
                                children: "localhost:3002"
                            }, void 0, false, {
                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                lineNumber: 83,
                                columnNumber: 11
                            }, undefined),
                            " – ",
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("b", {
                                children: "checkout"
                            }, void 0, false, {
                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                lineNumber: 90,
                                columnNumber: 11
                            }, undefined)
                        ]
                    }, void 0, true, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, undefined)
                ]
            }, void 0, true, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, undefined),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("h2", {
                style: {
                    marginTop: "30px"
                },
                children: "Federation test cases"
            }, void 0, false, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, undefined),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("table", {
                border: 1,
                cellPadding: 5,
                children: [
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("thead", {
                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("tr", {
                            children: [
                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {}, void 0, false, {
                                    fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                    lineNumber: 97,
                                    columnNumber: 13
                                }, undefined),
                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                    children: "Test case"
                                }, void 0, false, {
                                    fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                    lineNumber: 98,
                                    columnNumber: 13
                                }, undefined),
                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                    children: "Expected"
                                }, void 0, false, {
                                    fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                    lineNumber: 99,
                                    columnNumber: 13
                                }, undefined),
                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                    children: "Actual"
                                }, void 0, false, {
                                    fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                    lineNumber: 100,
                                    columnNumber: 13
                                }, undefined)
                            ]
                        }, void 0, true, {
                            fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                            lineNumber: 96,
                            columnNumber: 11
                        }, undefined)
                    }, void 0, false, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                        lineNumber: 95,
                        columnNumber: 9
                    }, undefined),
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("tbody", {
                        children: [
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("tr", {
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                        children: "✅"
                                    }, void 0, false, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                        lineNumber: 105,
                                        columnNumber: 13
                                    }, undefined),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                        children: [
                                            "Loading remote component (CheckoutTitle) from localhost:3002",
                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("br", {}, void 0, false, {
                                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                                lineNumber: 108,
                                                columnNumber: 15
                                            }, undefined),
                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("blockquote", {
                                                children: "lazy(()=>import('checkout/CheckoutTitle'))"
                                            }, void 0, false, {
                                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                                lineNumber: 109,
                                                columnNumber: 15
                                            }, undefined)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                        lineNumber: 106,
                                        columnNumber: 13
                                    }, undefined),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("h3", {
                                            children: "This title came from checkout with hooks data!!!"
                                        }, void 0, false, {
                                            fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                            lineNumber: 114,
                                            columnNumber: 15
                                        }, undefined)
                                    }, void 0, false, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                        lineNumber: 113,
                                        columnNumber: 13
                                    }, undefined),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react__WEBPACK_IMPORTED_MODULE_1__.Suspense, {
                                            fallback: "loading CheckoutTitle",
                                            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((checkout_CheckoutTitle__WEBPACK_IMPORTED_MODULE_3___default()), {}, void 0, false, {
                                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                                lineNumber: 118,
                                                columnNumber: 17
                                            }, undefined)
                                        }, void 0, false, {
                                            fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                            lineNumber: 117,
                                            columnNumber: 15
                                        }, undefined)
                                    }, void 0, false, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                        lineNumber: 116,
                                        columnNumber: 13
                                    }, undefined)
                                ]
                            }, void 0, true, {
                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                lineNumber: 104,
                                columnNumber: 11
                            }, undefined),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("tr", {
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                        children: "✅"
                                    }, void 0, false, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                        lineNumber: 123,
                                        columnNumber: 13
                                    }, undefined),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                        children: "Load federated component from checkout with old antd version"
                                    }, void 0, false, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                        lineNumber: 124,
                                        columnNumber: 13
                                    }, undefined),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                        children: "[Button from antd@5.18.3]"
                                    }, void 0, false, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                        lineNumber: 127,
                                        columnNumber: 13
                                    }, undefined),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react__WEBPACK_IMPORTED_MODULE_1__.Suspense, {
                                            fallback: "loading ButtonOldAnt",
                                            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((checkout_ButtonOldAnt__WEBPACK_IMPORTED_MODULE_4___default()), {}, void 0, false, {
                                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                                lineNumber: 130,
                                                columnNumber: 17
                                            }, undefined)
                                        }, void 0, false, {
                                            fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                            lineNumber: 129,
                                            columnNumber: 15
                                        }, undefined)
                                    }, void 0, false, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                        lineNumber: 128,
                                        columnNumber: 13
                                    }, undefined)
                                ]
                            }, void 0, true, {
                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                lineNumber: 122,
                                columnNumber: 11
                            }, undefined),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("tr", {
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                        children: "✅"
                                    }, void 0, false, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                        lineNumber: 135,
                                        columnNumber: 13
                                    }, undefined),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                        children: [
                                            "Loading remote component with PNG image from localhost:3001",
                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("br", {}, void 0, false, {
                                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                                lineNumber: 138,
                                                columnNumber: 15
                                            }, undefined),
                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("blockquote", {
                                                children: "(check publicPath fix in image-loader)"
                                            }, void 0, false, {
                                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                                lineNumber: 139,
                                                columnNumber: 15
                                            }, undefined)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                        lineNumber: 136,
                                        columnNumber: 13
                                    }, undefined),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("img", {
                                            className: "home-webpack-png",
                                            src: "./webpack.png"
                                        }, void 0, false, {
                                            fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                            lineNumber: 142,
                                            columnNumber: 15
                                        }, undefined)
                                    }, void 0, false, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                        lineNumber: 141,
                                        columnNumber: 13
                                    }, undefined),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react__WEBPACK_IMPORTED_MODULE_1__.Suspense, {
                                            fallback: "loading WebpackPngRemote",
                                            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(WebpackPngRemote, {}, void 0, false, {
                                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                                lineNumber: 146,
                                                columnNumber: 17
                                            }, undefined)
                                        }, void 0, false, {
                                            fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                            lineNumber: 145,
                                            columnNumber: 15
                                        }, undefined)
                                    }, void 0, false, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                        lineNumber: 144,
                                        columnNumber: 13
                                    }, undefined)
                                ]
                            }, void 0, true, {
                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                lineNumber: 134,
                                columnNumber: 11
                            }, undefined),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("tr", {
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                        children: "✅"
                                    }, void 0, false, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                        lineNumber: 151,
                                        columnNumber: 13
                                    }, undefined),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                        children: [
                                            "Loading remote component with SVG from localhost:3001",
                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("br", {}, void 0, false, {
                                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                                lineNumber: 154,
                                                columnNumber: 15
                                            }, undefined),
                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("blockquote", {
                                                children: "(check publicPath fix in url-loader)"
                                            }, void 0, false, {
                                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                                lineNumber: 155,
                                                columnNumber: 15
                                            }, undefined)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                        lineNumber: 152,
                                        columnNumber: 13
                                    }, undefined),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("img", {
                                            src: "./webpack.svg"
                                        }, void 0, false, {
                                            fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                            lineNumber: 158,
                                            columnNumber: 15
                                        }, undefined)
                                    }, void 0, false, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                        lineNumber: 157,
                                        columnNumber: 13
                                    }, undefined),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("td", {
                                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react__WEBPACK_IMPORTED_MODULE_1__.Suspense, {
                                            fallback: "loading WebpackSvgRemote",
                                            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(WebpackSvgRemote, {}, void 0, false, {
                                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                                lineNumber: 162,
                                                columnNumber: 17
                                            }, undefined)
                                        }, void 0, false, {
                                            fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                            lineNumber: 161,
                                            columnNumber: 15
                                        }, undefined)
                                    }, void 0, false, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                        lineNumber: 160,
                                        columnNumber: 13
                                    }, undefined)
                                ]
                            }, void 0, true, {
                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                                lineNumber: 150,
                                columnNumber: 11
                            }, undefined)
                        ]
                    }, void 0, true, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, undefined)
                ]
            }, void 0, true, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, undefined),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("h2", {
                style: {
                    marginTop: "30px"
                },
                children: "Other problems to fix:"
            }, void 0, false, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                lineNumber: 169,
                columnNumber: 7
            }, undefined),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("ul", {
                children: [
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("li", {
                        children: "\uD83D\uDC1E Incorrectly exposed modules in next.config.js (e.g. typo in path) do not throw an error in console"
                    }, void 0, false, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                        lineNumber: 171,
                        columnNumber: 9
                    }, undefined),
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("li", {
                        children: "\uD83D\uDCDD Try to introduce a remote entry loading according to prefix path. It will be nice runtime improvement if you have eg 20 apps and load just one remoteEntry instead of all of them."
                    }, void 0, false, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                        lineNumber: 175,
                        columnNumber: 9
                    }, undefined),
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("li", {
                        children: "\uD83D\uDCDD It will be nice to regenerate remoteEntry if new page was added in remote app."
                    }, void 0, false, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                        lineNumber: 180,
                        columnNumber: 9
                    }, undefined),
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("li", {
                        children: "\uD83D\uDCDD Remote components do not regenerate chunks if they were changed."
                    }, void 0, false, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                        lineNumber: 184,
                        columnNumber: 9
                    }, undefined)
                ]
            }, void 0, true, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/index.tsx",
                lineNumber: 170,
                columnNumber: 7
            }, undefined)
        ]
    }, void 0, true);
};
async function getServerSideProps() {
    // Increment server render count
    serverRenderCount++;
    console.log("[HMR Home] Server getServerSideProps called, count:", serverRenderCount);
    return {
        props: {
            renderCount: serverRenderCount,
            renderTime: new Date().toISOString()
        }
    };
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Home);


/***/ })

};
;