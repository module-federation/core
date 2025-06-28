"use strict";
(self["webpackChunkhome_app"] = self["webpackChunkhome_app"] || []).push([["components_SharedNav_tsx"],{

/***/ "./components/SharedNav.tsx":
/*!**********************************!*\
  !*** ./components/SharedNav.tsx ***!
  \**********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ "webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime");
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var styled_jsx_style__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! styled-jsx/style */ "webpack/sharing/consume/default/styled-jsx/style/styled-jsx/style");
/* harmony import */ var styled_jsx_style__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(styled_jsx_style__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _barrel_optimize_names_Layout_Menu_antd__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! __barrel_optimize__?names=Layout,Menu!=!antd */ "__barrel_optimize__?names=Layout,Menu!=!../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/index.js");
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/router */ "webpack/sharing/consume/default/next/router/next/router");
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _menu__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./menu */ "./components/menu.tsx");

var _s = $RefreshSig$();





var SharedNav = ()=>{
    _s();
    var { asPath, push } = (0,next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter)();
    var activeMenu;
    if (asPath === "/" || asPath.startsWith("/home")) {
        activeMenu = "/";
    } else if (asPath.startsWith("/shop")) {
        activeMenu = "/shop";
    } else if (asPath.startsWith("/checkout")) {
        activeMenu = "/checkout";
    }
    var menuItems = [
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
                onClick: (param)=>{
                    var { key } = param;
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
_s(SharedNav, "1F6ozFrdG4bGBrz0bb92GuP+6gU=", false, function() {
    return [
        next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter
    ];
});
_c = SharedNav;
/* harmony default export */ __webpack_exports__["default"] = (SharedNav);
var _c;
$RefreshReg$(_c, "SharedNav");


/***/ }),

/***/ "__barrel_optimize__?names=Layout,Menu!=!../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/index.js":
/*!************************************************************************************************************************************************!*\
  !*** __barrel_optimize__?names=Layout,Menu!=!../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/index.js ***!
  \************************************************************************************************************************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Layout: function() { return /* reexport safe */ _layout__WEBPACK_IMPORTED_MODULE_0__["default"]; },
/* harmony export */   Menu: function() { return /* reexport safe */ _menu__WEBPACK_IMPORTED_MODULE_1__["default"]; }
/* harmony export */ });
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./layout */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/index.js");
/* harmony import */ var _menu__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./menu */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/index.js");
/* __next_internal_client_entry_do_not_use__ Layout,Menu auto */ 



;
    // Wrapped in an IIFE to avoid polluting the global scope
    ;
    (function () {
        var _a, _b;
        // Legacy CSS implementations will `eval` browser code in a Node.js context
        // to extract CSS. For backwards compatibility, we need to check we're in a
        // browser context before continuing.
        if (typeof self !== 'undefined' &&
            // AMP / No-JS mode does not inject these helpers:
            '$RefreshHelpers$' in self) {
            // @ts-ignore __webpack_module__ is global
            var currentExports = module.exports;
            // @ts-ignore __webpack_module__ is global
            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;
            // This cannot happen in MainTemplate because the exports mismatch between
            // templating and execution.
            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);
            // A module can be accepted automatically based on its exports, e.g. when
            // it is a Refresh Boundary.
            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {
                // Save the previous exports signature on update so we can compare the boundary
                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)
                module.hot.dispose(function (data) {
                    data.prevSignature =
                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);
                });
                // Unconditionally accept an update to this module, we'll check if it's
                // still a Refresh Boundary later.
                // @ts-ignore importMeta is replaced in the loader
                module.hot.accept();
                // This field is set when the previous version of this module was a
                // Refresh Boundary, letting us know we need to check for invalidation or
                // enqueue an update.
                if (prevSignature !== null) {
                    // A boundary can become ineligible if its exports are incompatible
                    // with the previous exports.
                    //
                    // For example, if you add/remove/change exports, we'll want to
                    // re-execute the importing modules, and force those components to
                    // re-render. Similarly, if you convert a class component to a
                    // function, we want to invalidate the boundary.
                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {
                        module.hot.invalidate();
                    }
                    else {
                        self.$RefreshHelpers$.scheduleUpdate();
                    }
                }
            }
            else {
                // Since we just executed the code for the module, it's possible that the
                // new exports made it ineligible for being a boundary.
                // We only care about the case when we were _previously_ a boundary,
                // because we already accepted this update (accidental side effect).
                var isNoLongerABoundary = prevSignature !== null;
                if (isNoLongerABoundary) {
                    module.hot.invalidate();
                }
            }
        }
    })();


/***/ })

}]);