import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { CollapseIcon } from '../../icons/collapse-icon';
/**
 *
 * Format component stack into pseudo HTML
 * component stack is an array of strings, e.g.: ['p', 'p', 'Page', ...]
 *
 * For html tags mismatch, it will render it for the code block
 *
 * ```
 * <pre>
 *  <code>{`
 *    <Page>
 *       <p red>
 *         <p red>
 *  `}</code>
 * </pre>
 * ```
 *
 * For text mismatch, it will render it for the code block
 *
 * ```
 * <pre>
 * <code>{`
 *   <Page>
 *     <p>
 *       "Server Text" (green)
 *       "Client Text" (red)
 *     </p>
 *   </Page>
 * `}</code>
 * ```
 *
 * For bad text under a tag it will render it for the code block,
 * e.g. "Mismatched Text" under <p>
 *
 * ```
 * <pre>
 * <code>{`
 *   <Page>
 *     <div>
 *       <p>
 *         "Mismatched Text" (red)
 *      </p>
 *     </div>
 *   </Page>
 * `}</code>
 * ```
 *
 */ export function PseudoHtmlDiff(param) {
    let { firstContent, secondContent, hydrationMismatchType, reactOutputComponentDiff, ...props } = param;
    const [isDiffCollapsed, toggleCollapseHtml] = useState(true);
    const htmlComponents = useMemo(()=>{
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
                componentStacks.push(/*#__PURE__*/ _jsx("span", {
                    "data-nextjs-container-errors-pseudo-html-line": true,
                    "data-nextjs-container-errors-pseudo-html--diff": sign === '+' ? 'add' : 'remove',
                    children: /*#__PURE__*/ _jsxs("span", {
                        children: [
                            prefix,
                            /*#__PURE__*/ _jsx("span", {
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
                componentStacks.push(/*#__PURE__*/ _jsxs("span", {
                    "data-nextjs-container-errors-pseudo-html-line": true,
                    ...isHighlightedLine ? {
                        'data-nextjs-container-errors-pseudo-html--diff': 'error'
                    } : undefined,
                    children: [
                        prefix,
                        /*#__PURE__*/ _jsx("span", {
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
    return /*#__PURE__*/ _jsxs("div", {
        "data-nextjs-container-errors-pseudo-html": true,
        "data-nextjs-container-errors-pseudo-html-collapse": isDiffCollapsed,
        children: [
            /*#__PURE__*/ _jsx("button", {
                tabIndex: 10,
                "data-nextjs-container-errors-pseudo-html-collapse-button": true,
                onClick: ()=>toggleCollapseHtml(!isDiffCollapsed),
                children: /*#__PURE__*/ _jsx(CollapseIcon, {
                    collapsed: isDiffCollapsed
                })
            }),
            /*#__PURE__*/ _jsx("pre", {
                ...props,
                children: /*#__PURE__*/ _jsx("code", {
                    children: htmlComponents
                })
            })
        ]
    });
}

//# sourceMappingURL=diff-view.js.map