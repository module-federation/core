"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    Dialog: null,
    DialogBody: null,
    DialogContent: null,
    DialogHeader: null,
    styles: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    Dialog: function() {
        return _dialog.Dialog;
    },
    DialogBody: function() {
        return _dialogbody.DialogBody;
    },
    DialogContent: function() {
        return _dialogcontent.DialogContent;
    },
    DialogHeader: function() {
        return _dialogheader.DialogHeader;
    },
    styles: function() {
        return _styles.styles;
    }
});
const _dialog = require("./dialog");
const _dialogbody = require("./dialog-body");
const _dialogcontent = require("./dialog-content");
const _dialogheader = require("./dialog-header");
const _styles = require("./styles");

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=index.js.map