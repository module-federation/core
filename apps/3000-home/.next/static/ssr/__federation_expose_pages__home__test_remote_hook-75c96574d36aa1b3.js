"use strict";
exports.id = "__federation_expose_pages__home__test_remote_hook";
exports.ids = ["__federation_expose_pages__home__test_remote_hook"];
exports.modules = {

/***/ "./pages/home/test-remote-hook.tsx":
/*!*****************************************!*\
  !*** ./pages/home/test-remote-hook.tsx ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ "webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime");
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var shop_useCustomRemoteHook__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! shop/useCustomRemoteHook */ "webpack/container/remote/shop/useCustomRemoteHook");
/* harmony import */ var shop_useCustomRemoteHook__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(shop_useCustomRemoteHook__WEBPACK_IMPORTED_MODULE_1__);


const TestRemoteHook = ()=>{
    const text = shop_useCustomRemoteHook__WEBPACK_IMPORTED_MODULE_1___default()();
    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: [
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("div", {
                children: "Page with custom remote hook. You must see text in red box below:"
            }, void 0, false, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/home/test-remote-hook.tsx",
                lineNumber: 9,
                columnNumber: 7
            }, undefined),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("div", {
                style: {
                    border: "1px solid red",
                    padding: 5
                },
                children: text
            }, void 0, false, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/home/test-remote-hook.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, undefined)
        ]
    }, void 0, true);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TestRemoteHook);


/***/ })

};
;