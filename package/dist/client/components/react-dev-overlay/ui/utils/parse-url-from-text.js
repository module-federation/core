"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "parseUrlFromText", {
    enumerable: true,
    get: function() {
        return parseUrlFromText;
    }
});
function parseUrlFromText(text, matcherFunc) {
    const linkRegex = /https?:\/\/[^\s/$.?#].[^\s)'"]*/gi;
    const links = Array.from(text.matchAll(linkRegex), (match)=>match[0]);
    if (matcherFunc) {
        return links.filter((link)=>matcherFunc(link));
    }
    return links;
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=parse-url-from-text.js.map