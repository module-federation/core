"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "withShadowPortal", {
    enumerable: true,
    get: function() {
        return withShadowPortal;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _base = require("../styles/base");
const _colors = require("../styles/colors");
const _cssreset = require("../styles/css-reset");
const _componentstyles = require("../styles/component-styles");
const _shadowportal = require("../components/shadow-portal");
const _darktheme = require("../styles/dark-theme");
const withShadowPortal = (Story)=>/*#__PURE__*/ (0, _jsxruntime.jsxs)(_shadowportal.ShadowPortal, {
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_cssreset.CssReset, {}),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_base.Base, {}),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_colors.Colors, {}),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_componentstyles.ComponentStyles, {}),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_darktheme.DarkTheme, {}),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(Story, {})
        ]
    });

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=with-shadow-portal.js.map