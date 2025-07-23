"use strict";
exports.id = "__federation_expose_SharedNav";
exports.ids = ["__federation_expose_SharedNav"];
exports.modules = {

/***/ "./components/SharedNav.tsx":
/*!**********************************!*\
  !*** ./components/SharedNav.tsx ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ "webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime");
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var styled_jsx_style__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! styled-jsx/style */ "styled-jsx/style");
/* harmony import */ var styled_jsx_style__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(styled_jsx_style__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _barrel_optimize_names_Layout_Menu_antd__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! __barrel_optimize__?names=Layout,Menu!=!antd */ "__barrel_optimize__?names=Layout,Menu!=!../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/index.js");
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/router */ "webpack/sharing/consume/default/next/router/next/router");
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _menu__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./menu */ "./components/menu.tsx");






const SharedNav = ()=>{
    const { asPath, push } = (0,next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter)();
    let activeMenu;
    if (asPath === "/" || asPath.startsWith("/home")) {
        activeMenu = "/";
    } else if (asPath.startsWith("/shop")) {
        activeMenu = "/shop";
    } else if (asPath.startsWith("/checkout")) {
        activeMenu = "/checkout";
    }
    const menuItems = [
        {
            className: "home-menu-link",
            label: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
                children: [
                    "Home ",
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("sup", {
                        children: "3000"
                    }, void 0, false, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/components/SharedNav.tsx",
                        lineNumber: 23,
                        columnNumber: 16
                    }, undefined)
                ]
            }, void 0, true),
            key: "/"
        },
        {
            className: "shop-menu-link",
            label: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
                children: [
                    "Shop ",
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("sup", {
                        children: "3001"
                    }, void 0, false, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/components/SharedNav.tsx",
                        lineNumber: 32,
                        columnNumber: 16
                    }, undefined)
                ]
            }, void 0, true),
            key: "/shop"
        },
        {
            className: "checkout-menu-link",
            label: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
                children: [
                    "Checkout ",
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("sup", {
                        children: "3002"
                    }, void 0, false, {
                        fileName: "/Users/bytedance/dev/universe/apps/3000-home/components/SharedNav.tsx",
                        lineNumber: 41,
                        columnNumber: 20
                    }, undefined)
                ]
            }, void 0, true),
            key: "/checkout"
        }
    ];
    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Layout_Menu_antd__WEBPACK_IMPORTED_MODULE_5__.Layout.Header, {
        children: [
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("div", {
                className: "jsx-a6af1a4577f74e53" + " " + "header-logo",
                children: "nextjs-mf"
            }, void 0, false, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/components/SharedNav.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, undefined),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Layout_Menu_antd__WEBPACK_IMPORTED_MODULE_5__.Menu, {
                theme: "dark",
                mode: "horizontal",
                selectedKeys: activeMenu ? [
                    activeMenu
                ] : undefined,
                onClick: ({ key })=>{
                    push(key);
                },
                items: menuItems
            }, void 0, false, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/components/SharedNav.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, undefined),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((styled_jsx_style__WEBPACK_IMPORTED_MODULE_1___default()), {
                id: "a6af1a4577f74e53",
                children: ".header-logo.jsx-a6af1a4577f74e53{float:left;width:200px;height:31px;margin-right:24px;color:white;font-size:2rem}"
            }, void 0, false, void 0, undefined)
        ]
    }, void 0, true, {
        fileName: "/Users/bytedance/dev/universe/apps/3000-home/components/SharedNav.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, undefined);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SharedNav);


/***/ }),

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

/***/ "__barrel_optimize__?names=Layout,Menu!=!../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/index.js":
/*!************************************************************************************************************************************************!*\
  !*** __barrel_optimize__?names=Layout,Menu!=!../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/index.js ***!
  \************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Layout: () => (/* reexport safe */ _layout__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   Menu: () => (/* reexport safe */ _menu__WEBPACK_IMPORTED_MODULE_1__["default"])
/* harmony export */ });
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./layout */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/index.js");
/* harmony import */ var _menu__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./menu */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/index.js");
/* __next_internal_client_entry_do_not_use__ Layout,Menu auto */ 



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


/***/ })

};
;