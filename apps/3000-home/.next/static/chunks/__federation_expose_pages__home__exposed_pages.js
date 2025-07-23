"use strict";
(self["webpackChunkhome_app"] = self["webpackChunkhome_app"] || []).push([["__federation_expose_pages__home__exposed_pages"],{

/***/ "./pages/home/exposed-pages.tsx":
/*!**************************************!*\
  !*** ./pages/home/exposed-pages.tsx ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ ExposedPages; }
/* harmony export */ });
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ "webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime");
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _module_federation_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @module-federation/runtime */ "../../packages/runtime/dist/index.esm.js");

var _s = $RefreshSig$();


function ExposedPages() {
    _s();
    var [pageMap, setPageMap] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
    var [pageMapV2, setPageMapV2] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        (0,_module_federation_runtime__WEBPACK_IMPORTED_MODULE_2__.loadRemote)("home_app/pages-map").then((data)=>{
            //@ts-ignore
            setPageMap(data);
        });
        (0,_module_federation_runtime__WEBPACK_IMPORTED_MODULE_2__.loadRemote)("home_app/pages-map-v2").then((data)=>{
            //@ts-ignore
            setPageMapV2(data);
        });
    }, []);
    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: [
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("h1", {
                children: "This app exposes the following pages:"
            }, void 0, false, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/home/exposed-pages.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("h2", {
                children: "./pages-map"
            }, void 0, false, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/home/exposed-pages.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("pre", {
                children: JSON.stringify(pageMap, undefined, 2)
            }, void 0, false, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/home/exposed-pages.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("h2", {
                children: "./pages-map-v2"
            }, void 0, false, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/home/exposed-pages.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)("pre", {
                children: JSON.stringify(pageMapV2, undefined, 2)
            }, void 0, false, {
                fileName: "/Users/bytedance/dev/universe/apps/3000-home/pages/home/exposed-pages.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(ExposedPages, "kkrZU2oKOd6ELcSkLfEvMrd0YFU=");
_c = ExposedPages;
var _c;
$RefreshReg$(_c, "ExposedPages");


/***/ })

}]);