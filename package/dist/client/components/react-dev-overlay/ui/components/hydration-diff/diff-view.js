"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PseudoHtmlDiff", {
    enumerable: true,
    get: function() {
        return PseudoHtmlDiff;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _react = require("react");
const _collapseicon = require("../../icons/collapse-icon");
function PseudoHtmlDiff(param) {
    let { firstContent, secondContent, hydrationMismatchType, reactOutputComponentDiff, ...props } = param;
    const [isDiffCollapsed, toggleCollapseHtml] = (0, _react.useState)(true);
    const htmlComponents = (0, _react.useMemo)(()=>{
        const componentStacks = [];
        const reactComponentDiffLines = reactOutputComponentDiff.split('\n');
        reactComponentDiffLines.forEach((line, index)=>{
            const isDiffLine = line[0] === '+' || line[0] === '-';
            const isHighlightedLine = line[0] === '>';
            const hasSign = isDiffLine || isHighlightedLine;
            const sign = hasSign ? line[0] : '';
            const signIndex = hasSign ? line.indexOf(sign) : -1;
            const [prefix, suffix] = hasSign ? [
                line.slice(0, signIndex),
                line.slice(signIndex + 1)
            ] : [
                line,
                ''
            ];
            if (isDiffLine) {
                componentStacks.push(/*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                    "data-nextjs-container-errors-pseudo-html-line": true,
                    "data-nextjs-container-errors-pseudo-html--diff": sign === '+' ? 'add' : 'remove',
                    children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                        children: [
                            prefix,
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                "data-nextjs-container-errors-pseudo-html-line-sign": true,
                                children: sign
                            }),
                            suffix,
                            '\n'
                        ]
                    })
                }, 'comp-diff' + index));
            } else {
                // In general, if it's not collapsed, show the whole diff
                componentStacks.push(/*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                    "data-nextjs-container-errors-pseudo-html-line": true,
                    ...isHighlightedLine ? {
                        'data-nextjs-container-errors-pseudo-html--diff': 'error'
                    } : undefined,
                    children: [
                        prefix,
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                            "data-nextjs-container-errors-pseudo-html-line-sign": true,
                            children: sign
                        }),
                        suffix,
                        '\n'
                    ]
                }, 'comp-diff' + index));
            }
        });
        return componentStacks;
    }, [
        reactOutputComponentDiff
    ]);
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        "data-nextjs-container-errors-pseudo-html": true,
        "data-nextjs-container-errors-pseudo-html-collapse": isDiffCollapsed,
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                tabIndex: 10,
                "data-nextjs-container-errors-pseudo-html-collapse-button": true,
                onClick: ()=>toggleCollapseHtml(!isDiffCollapsed),
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_collapseicon.CollapseIcon, {
                    collapsed: isDiffCollapsed
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("pre", {
                ...props,
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("code", {
                    children: htmlComponents
                })
            })
        ]
    });
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=diff-view.js.map