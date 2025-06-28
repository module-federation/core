"use strict";
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./components/menu.tsx":
/*!*****************************!*\
  !*** ./components/menu.tsx ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AppMenu)
/* harmony export */ });
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ "webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime");
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/router */ "webpack/sharing/consume/default/next/router/next/router");
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _barrel_optimize_names_Menu_antd__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! __barrel_optimize__?names=Menu!=!antd */ "__barrel_optimize__?names=Menu!=!../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/index.js");



const menuItems = [
    {
        label: "Main home",
        key: "/"
    },
    {
        label: "Test hook from remote",
        key: "/home/test-remote-hook"
    },
    {
        label: "Test broken remotes",
        key: "/home/test-broken-remotes"
    },
    {
        label: "Exposed pages",
        key: "/home/exposed-pages"
    },
    {
        label: "Exposed components",
        type: "group",
        children: [
            {
                label: "home/SharedNav",
                key: "/home/test-shared-nav"
            }
        ]
    }
];
function AppMenu() {
    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_1__.useRouter)();
    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: [
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("div", {
                style: {
                    padding: "10px",
                    fontWeight: 600,
                    backgroundColor: "#fff"
                },
                children: "Home App Menu"
            }, void 0, false, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/components/menu.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Menu_antd__WEBPACK_IMPORTED_MODULE_2__.Menu, {
                mode: "inline",
                selectedKeys: [
                    router.asPath
                ],
                style: {
                    height: "100%"
                },
                onClick: ({ key })=>router.push(key),
                items: menuItems
            }, void 0, false, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/components/menu.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}


/***/ }),

/***/ "./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ "webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime");
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _module_federation_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @module-federation/runtime */ "../../packages/runtime/dist/index.esm.js");
/* harmony import */ var _barrel_optimize_names_ConfigProvider_Layout_version_antd__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! __barrel_optimize__?names=ConfigProvider,Layout,version!=!antd */ "__barrel_optimize__?names=ConfigProvider,Layout,version!=!../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/index.js");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next/router */ "webpack/sharing/consume/default/next/router/next/router");
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _components_menu__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../components/menu */ "./components/menu.tsx");




console.log("logging init", typeof _module_federation_runtime__WEBPACK_IMPORTED_MODULE_2__.init);



const SharedNav = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1__.lazy(()=>__webpack_require__.e(/*! import() */ "components_SharedNav_tsx").then(__webpack_require__.bind(__webpack_require__, /*! ../components/SharedNav */ "./components/SharedNav.tsx")));

function MyApp(props) {
    const { Component, pageProps } = props;
    const { asPath } = (0,next_router__WEBPACK_IMPORTED_MODULE_4__.useRouter)();
    const [MenuComponent, setMenuComponent] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(()=>_components_menu__WEBPACK_IMPORTED_MODULE_5__["default"]);
    // Add HMR support for federation modules
    react__WEBPACK_IMPORTED_MODULE_1__.useEffect(()=>{
        if (false) {}
    }, []);
    const handleRouteChange = async (url)=>{
        try {
            if (url.startsWith("/shop")) {
                // Check if we need to force refresh the federation module
                const forceRefresh =  false && 0;
                const cacheKey = forceRefresh ? `shop/menu?t=${Date.now()}` : "shop/menu";
                console.log("[HMR] Loading shop menu", {
                    forceRefresh,
                    cacheKey
                });
                // @ts-ignore
                const RemoteAppMenu = (await __webpack_require__.e(/*! import() */ "webpack_container_remote_shop_menu").then(__webpack_require__.t.bind(__webpack_require__, /*! shop/menu */ "webpack/container/remote/shop/menu", 23))).default;
                setMenuComponent(()=>RemoteAppMenu);
            } else if (url.startsWith("/checkout")) {
                // Check if we need to force refresh the federation module
                const forceRefresh =  false && 0;
                const cacheKey = forceRefresh ? `checkout/menu?t=${Date.now()}` : "checkout/menu";
                console.log("[HMR] Loading checkout menu", {
                    forceRefresh,
                    cacheKey
                });
                // @ts-ignore
                const RemoteAppMenu = (await __webpack_require__.e(/*! import() */ "webpack_container_remote_checkout_menu").then(__webpack_require__.t.bind(__webpack_require__, /*! checkout/menu */ "webpack/container/remote/checkout/menu", 23))).default;
                setMenuComponent(()=>RemoteAppMenu);
            } else {
                setMenuComponent(()=>_components_menu__WEBPACK_IMPORTED_MODULE_5__["default"]);
            }
        } catch (error) {
            console.error("[HMR] Error loading federation module:", error);
            // Fallback to host menu on error
            setMenuComponent(()=>_components_menu__WEBPACK_IMPORTED_MODULE_5__["default"]);
        }
    };
    // handle first route hit.
    react__WEBPACK_IMPORTED_MODULE_1__.useEffect(()=>{
        handleRouteChange(asPath);
    }, [
        asPath
    ]);
    //handle route change
    react__WEBPACK_IMPORTED_MODULE_1__.useEffect(()=>{
        // Step 3: Subscribe on events
        next_router__WEBPACK_IMPORTED_MODULE_4___default().events.on("routeChangeStart", handleRouteChange);
        return ()=>{
            next_router__WEBPACK_IMPORTED_MODULE_4___default().events.off("routeChangeStart", handleRouteChange);
        };
    }, []);
    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_3__.StyleProvider, {
        layer: true,
        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_ConfigProvider_Layout_version_antd__WEBPACK_IMPORTED_MODULE_6__.ConfigProvider, {
            theme: {
                hashed: false
            },
            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_ConfigProvider_Layout_version_antd__WEBPACK_IMPORTED_MODULE_6__.Layout, {
                style: {
                    minHeight: "100vh"
                },
                prefixCls: "dd",
                children: [
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react__WEBPACK_IMPORTED_MODULE_1__.Suspense, {
                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(SharedNav, {}, void 0, false, {
                            fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/_app.tsx",
                            lineNumber: 84,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/_app.tsx",
                        lineNumber: 83,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_ConfigProvider_Layout_version_antd__WEBPACK_IMPORTED_MODULE_6__.Layout, {
                        children: [
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_ConfigProvider_Layout_version_antd__WEBPACK_IMPORTED_MODULE_6__.Layout.Sider, {
                                width: 200,
                                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(MenuComponent, {}, void 0, false, {
                                    fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/_app.tsx",
                                    lineNumber: 88,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/_app.tsx",
                                lineNumber: 87,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_ConfigProvider_Layout_version_antd__WEBPACK_IMPORTED_MODULE_6__.Layout, {
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_ConfigProvider_Layout_version_antd__WEBPACK_IMPORTED_MODULE_6__.Layout.Content, {
                                        style: {
                                            background: "#fff",
                                            padding: 20
                                        },
                                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {
                                            ...pageProps
                                        }, void 0, false, {
                                            fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/_app.tsx",
                                            lineNumber: 92,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/_app.tsx",
                                        lineNumber: 91,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_ConfigProvider_Layout_version_antd__WEBPACK_IMPORTED_MODULE_6__.Layout.Footer, {
                                        style: {
                                            background: "#fff",
                                            color: "#999",
                                            textAlign: "center"
                                        },
                                        children: [
                                            "antd@",
                                            _barrel_optimize_names_ConfigProvider_Layout_version_antd__WEBPACK_IMPORTED_MODULE_6__.version
                                        ]
                                    }, void 0, true, {
                                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/_app.tsx",
                                        lineNumber: 94,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/_app.tsx",
                                lineNumber: 90,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/_app.tsx",
                        lineNumber: 86,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/_app.tsx",
                lineNumber: 82,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/_app.tsx",
            lineNumber: 81,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/_app.tsx",
        lineNumber: 80,
        columnNumber: 5
    }, this);
}
// Use getServerSideProps pattern for pages to get server render count
// This will be picked up by individual pages that use getServerSideProps
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);


/***/ }),

/***/ "__barrel_optimize__?names=ConfigProvider,Layout,version!=!../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/index.js":
/*!******************************************************************************************************************************************************************!*\
  !*** __barrel_optimize__?names=ConfigProvider,Layout,version!=!../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/index.js ***!
  \******************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConfigProvider: () => (/* reexport safe */ _config_provider__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   Layout: () => (/* reexport safe */ _layout__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   version: () => (/* reexport safe */ _version__WEBPACK_IMPORTED_MODULE_2__["default"])
/* harmony export */ });
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config-provider */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/index.js");
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./layout */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/index.js");
/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./version */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/version/index.js");
/* __next_internal_client_entry_do_not_use__ ConfigProvider,Layout,version auto */ 




/***/ }),

/***/ "__barrel_optimize__?names=Menu!=!../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/index.js":
/*!*****************************************************************************************************************************************!*\
  !*** __barrel_optimize__?names=Menu!=!../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/index.js ***!
  \*****************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Menu: () => (/* reexport safe */ _menu__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _menu__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./menu */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/index.js");
/* __next_internal_client_entry_do_not_use__ Menu auto */ 


/***/ }),

/***/ "data:text/javascript;base64,CiAgICBpZih0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykgewogICAgZ2xvYmFsVGhpcy5lbnRyeUNodW5rQ2FjaGUgPSBnbG9iYWxUaGlzLmVudHJ5Q2h1bmtDYWNoZSB8fCBuZXcgU2V0KCk7CiAgICBtb2R1bGUuZmlsZW5hbWUgJiYgZ2xvYmFsVGhpcy5lbnRyeUNodW5rQ2FjaGUuYWRkKG1vZHVsZS5maWxlbmFtZSk7CiAgICBpZihtb2R1bGUuY2hpbGRyZW4pIHsKICAgIG1vZHVsZS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGMpIHsKICAgICAgYy5maWxlbmFtZSAmJiBnbG9iYWxUaGlzLmVudHJ5Q2h1bmtDYWNoZS5hZGQoYy5maWxlbmFtZSk7CiAgICB9KQp9CiAgfQogICAg":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** data:text/javascript;base64,CiAgICBpZih0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykgewogICAgZ2xvYmFsVGhpcy5lbnRyeUNodW5rQ2FjaGUgPSBnbG9iYWxUaGlzLmVudHJ5Q2h1bmtDYWNoZSB8fCBuZXcgU2V0KCk7CiAgICBtb2R1bGUuZmlsZW5hbWUgJiYgZ2xvYmFsVGhpcy5lbnRyeUNodW5rQ2FjaGUuYWRkKG1vZHVsZS5maWxlbmFtZSk7CiAgICBpZihtb2R1bGUuY2hpbGRyZW4pIHsKICAgIG1vZHVsZS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGMpIHsKICAgICAgYy5maWxlbmFtZSAmJiBnbG9iYWxUaGlzLmVudHJ5Q2h1bmtDYWNoZS5hZGQoYy5maWxlbmFtZSk7CiAgICB9KQp9CiAgfQogICAg ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

    if(typeof module !== 'undefined') {
    globalThis.entryChunkCache = globalThis.entryChunkCache || new Set();
    module.filename && globalThis.entryChunkCache.add(module.filename);
    if(module.children) {
    module.children.forEach(function(c) {
      c.filename && globalThis.entryChunkCache.add(c.filename);
    })
}
  }
    

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))



var promises = [];
__webpack_require__.x();
var __webpack_exports__ = Promise.all([
	__webpack_require__.f.consumes || function(chunkId, promises) {},
	__webpack_require__.f.remotes || function(chunkId, promises) {},
].reduce((p, handler) => (handler('pages/_app', p), p), promises)
).then(() => (__webpack_require__.X(0, ["vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1","vendor-chunks/@babel+runtime@7.26.0","vendor-chunks/classnames@2.5.1","vendor-chunks/@ctrl+tinycolor@3.6.1","vendor-chunks/antd@5.19.1_react-dom@18.3.1_react@18.3.1","vendor-chunks/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1","vendor-chunks/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1","vendor-chunks/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1","vendor-chunks/@rc-component+async-validator@5.0.4","vendor-chunks/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1","vendor-chunks/resize-observer-polyfill@1.5.1","vendor-chunks/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1","vendor-chunks/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1","vendor-chunks/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1","vendor-chunks/rc-tooltip@6.2.1_react-dom@18.3.1_react@18.3.1","vendor-chunks/react-is@18.3.1","vendor-chunks/@babel+runtime@7.25.6","vendor-chunks/rc-picker@4.6.15_dayjs@1.11.13_react-dom@18.3.1_react@18.3.1","vendor-chunks/rc-pagination@4.2.0_react-dom@18.3.1_react@18.3.1"], () => (__webpack_exec__("data:text/javascript;base64,CiAgICBpZih0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykgewogICAgZ2xvYmFsVGhpcy5lbnRyeUNodW5rQ2FjaGUgPSBnbG9iYWxUaGlzLmVudHJ5Q2h1bmtDYWNoZSB8fCBuZXcgU2V0KCk7CiAgICBtb2R1bGUuZmlsZW5hbWUgJiYgZ2xvYmFsVGhpcy5lbnRyeUNodW5rQ2FjaGUuYWRkKG1vZHVsZS5maWxlbmFtZSk7CiAgICBpZihtb2R1bGUuY2hpbGRyZW4pIHsKICAgIG1vZHVsZS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGMpIHsKICAgICAgYy5maWxlbmFtZSAmJiBnbG9iYWxUaGlzLmVudHJ5Q2h1bmtDYWNoZS5hZGQoYy5maWxlbmFtZSk7CiAgICB9KQp9CiAgfQogICAg"), __webpack_exec__("./pages/_app.tsx")))));
module.exports = __webpack_exports__;

})();