"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    NEXT_DEV_TOOLS_SCALE: null,
    getInitialPosition: null,
    getInitialTheme: null,
    useDevToolsScale: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    NEXT_DEV_TOOLS_SCALE: function() {
        return NEXT_DEV_TOOLS_SCALE;
    },
    getInitialPosition: function() {
        return getInitialPosition;
    },
    getInitialTheme: function() {
        return getInitialTheme;
    },
    useDevToolsScale: function() {
        return useDevToolsScale;
    }
});
const _react = require("react");
const _shared = require("../../../../../shared");
const INDICATOR_POSITION = process.env.__NEXT_DEV_INDICATOR_POSITION || 'bottom-left';
function getInitialPosition() {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(_shared.STORAGE_KEY_POSITION)) {
        return localStorage.getItem(_shared.STORAGE_KEY_POSITION);
    }
    return INDICATOR_POSITION;
}
//////////////////////////////////////////////////////////////////////////////////////
const BASE_SIZE = 16;
const NEXT_DEV_TOOLS_SCALE = {
    Small: BASE_SIZE / 14,
    Medium: BASE_SIZE / 16,
    Large: BASE_SIZE / 18
};
function getInitialScale() {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(_shared.STORAGE_KEY_SCALE)) {
        return Number(localStorage.getItem(_shared.STORAGE_KEY_SCALE));
    }
    return NEXT_DEV_TOOLS_SCALE.Medium;
}
function useDevToolsScale() {
    const [scale, setScale] = (0, _react.useState)(getInitialScale());
    function set(value) {
        setScale(value);
        localStorage.setItem(_shared.STORAGE_KEY_SCALE, String(value));
    }
    return [
        scale,
        set
    ];
}
function getInitialTheme() {
    if (typeof localStorage === 'undefined') {
        return 'system';
    }
    const theme = localStorage.getItem(_shared.STORAGE_KEY_THEME);
    return theme === 'dark' || theme === 'light' ? theme : 'system';
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=preferences.js.map