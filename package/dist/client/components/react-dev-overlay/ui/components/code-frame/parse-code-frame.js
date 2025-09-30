"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    formatCodeFrame: null,
    groupCodeFrameLines: null,
    parseLineNumberFromCodeFrameLine: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    formatCodeFrame: function() {
        return formatCodeFrame;
    },
    groupCodeFrameLines: function() {
        return groupCodeFrameLines;
    },
    parseLineNumberFromCodeFrameLine: function() {
        return parseLineNumberFromCodeFrameLine;
    }
});
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _anser = /*#__PURE__*/ _interop_require_default._(require("next/dist/compiled/anser"));
const _stripansi = /*#__PURE__*/ _interop_require_default._(require("next/dist/compiled/strip-ansi"));
function formatCodeFrame(codeFrame) {
    const lines = codeFrame.split(/\r?\n/g);
    // Find the minimum length of leading spaces after `|` in the code frame
    const miniLeadingSpacesLength = lines.map((line)=>/^>? +\d+ +\| [ ]+/.exec((0, _stripansi.default)(line)) === null ? null : /^>? +\d+ +\| ( *)/.exec((0, _stripansi.default)(line))).filter(Boolean).map((v)=>v.pop()).reduce((c, n)=>isNaN(c) ? n.length : Math.min(c, n.length), NaN);
    // When the minimum length of leading spaces is greater than 1, remove them
    // from the code frame to help the indentation looks better when there's a lot leading spaces.
    if (miniLeadingSpacesLength > 1) {
        return lines.map((line, a)=>~(a = line.indexOf('|')) ? line.substring(0, a) + line.substring(a).replace("^\\ {" + miniLeadingSpacesLength + "}", '') : line).join('\n');
    }
    return lines.join('\n');
}
function groupCodeFrameLines(formattedFrame) {
    // Map the decoded lines to a format that can be rendered
    const decoded = _anser.default.ansiToJson(formattedFrame, {
        json: true,
        use_classes: true,
        remove_empty: true
    });
    const lines = [];
    let line = [];
    for (const token of decoded){
        if (token.content === '\n') {
            lines.push(line);
            line = [];
        } else {
            line.push(token);
        }
    }
    if (line.length > 0) {
        lines.push(line);
    }
    return lines;
}
function parseLineNumberFromCodeFrameLine(line, stackFrame) {
    var _line_, _line_1, _stackFrame_lineNumber;
    let lineNumberToken;
    let lineNumber;
    // parse line number from line first 2 tokens
    // e.g. ` > 1 | const foo = 'bar'` => `1`, first token is `1 |`
    // e.g. `  2 | const foo = 'bar'` => `2`. first 2 tokens are ' ' and ' 2 |'
    // console.log('line', line)
    if (((_line_ = line[0]) == null ? void 0 : _line_.content) === '>' || ((_line_1 = line[0]) == null ? void 0 : _line_1.content) === ' ') {
        var _lineNumberToken_content_replace, _lineNumberToken_content;
        lineNumberToken = line[1];
        lineNumber = lineNumberToken == null ? void 0 : (_lineNumberToken_content = lineNumberToken.content) == null ? void 0 : (_lineNumberToken_content_replace = _lineNumberToken_content.replace('|', '')) == null ? void 0 : _lineNumberToken_content_replace.trim();
    }
    // When the line number is possibly undefined, it can be just the non-source code line
    // e.g. the ^ sign can also take a line, we skip rendering line number for it
    return {
        lineNumber,
        isErroredLine: lineNumber === ((_stackFrame_lineNumber = stackFrame.lineNumber) == null ? void 0 : _stackFrame_lineNumber.toString())
    };
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=parse-code-frame.js.map