import { _ as _tagged_template_literal_loose } from "@swc/helpers/_/_tagged_template_literal_loose";
function _templateObject() {
    const data = _tagged_template_literal_loose([
        "\n          [data-next-badge-root] {\n            --timing: cubic-bezier(0.23, 0.88, 0.26, 0.92);\n            --duration-long: 250ms;\n            --color-outer-border: #171717;\n            --color-inner-border: hsla(0, 0%, 100%, 0.14);\n            --color-hover-alpha-subtle: hsla(0, 0%, 100%, 0.13);\n            --color-hover-alpha-error: hsla(0, 0%, 100%, 0.2);\n            --color-hover-alpha-error-2: hsla(0, 0%, 100%, 0.25);\n            --mark-size: calc(var(--size) - var(--size-2) * 2);\n\n            --focus-color: var(--color-blue-800);\n            --focus-ring: 2px solid var(--focus-color);\n\n            &:has([data-next-badge][data-error='true']) {\n              --focus-color: #fff;\n            }\n          }\n\n          [data-disabled-icon] {\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            padding-right: 4px;\n          }\n\n          [data-next-badge] {\n            -webkit-font-smoothing: antialiased;\n            width: var(--size);\n            height: var(--size);\n            display: flex;\n            align-items: center;\n            position: relative;\n            background: rgba(0, 0, 0, 0.8);\n            box-shadow:\n              0 0 0 1px var(--color-outer-border),\n              inset 0 0 0 1px var(--color-inner-border),\n              0px 16px 32px -8px rgba(0, 0, 0, 0.24);\n            backdrop-filter: blur(48px);\n            border-radius: var(--rounded-full);\n            user-select: none;\n            cursor: pointer;\n            scale: 1;\n            overflow: hidden;\n            will-change: scale, box-shadow, width, background;\n            transition:\n              scale var(--duration-short) var(--timing),\n              width var(--duration-long) var(--timing),\n              box-shadow var(--duration-long) var(--timing),\n              background var(--duration-short) ease;\n\n            &:active[data-error='false'] {\n              scale: 0.95;\n            }\n\n            &[data-animate='true']:not(:hover) {\n              scale: 1.02;\n            }\n\n            &[data-error='false']:has([data-next-mark]:focus-visible) {\n              outline: var(--focus-ring);\n              outline-offset: 3px;\n            }\n\n            &[data-error='true'] {\n              background: #ca2a30;\n              --color-inner-border: #e5484d;\n\n              [data-next-mark] {\n                background: var(--color-hover-alpha-error);\n                outline-offset: 0px;\n\n                &:focus-visible {\n                  outline: var(--focus-ring);\n                  outline-offset: -1px;\n                }\n\n                &:hover {\n                  background: var(--color-hover-alpha-error-2);\n                }\n              }\n            }\n\n            &[data-error-expanded='false'][data-error='true'] ~ [data-dot] {\n              scale: 1;\n            }\n\n            > div {\n              display: flex;\n            }\n          }\n\n          [data-issues-collapse]:focus-visible {\n            outline: var(--focus-ring);\n          }\n\n          [data-issues]:has([data-issues-open]:focus-visible) {\n            outline: var(--focus-ring);\n            outline-offset: -1px;\n          }\n\n          [data-dot] {\n            content: '';\n            width: var(--size-8);\n            height: var(--size-8);\n            background: #fff;\n            box-shadow: 0 0 0 1px var(--color-outer-border);\n            border-radius: 50%;\n            position: absolute;\n            top: 2px;\n            right: 0px;\n            scale: 0;\n            pointer-events: none;\n            transition: scale 200ms var(--timing);\n            transition-delay: var(--duration-short);\n          }\n\n          [data-issues] {\n            --padding-left: 8px;\n            display: flex;\n            gap: 2px;\n            align-items: center;\n            padding-left: 8px;\n            padding-right: 8px;\n            height: var(--size-32);\n            margin: 0 2px;\n            border-radius: var(--rounded-full);\n            transition: background var(--duration-short) ease;\n\n            &:has([data-issues-open]:hover) {\n              background: var(--color-hover-alpha-error);\n            }\n\n            &:has([data-issues-collapse]) {\n              padding-right: calc(var(--padding-left) / 2);\n            }\n\n            [data-cross] {\n              translate: 0px -1px;\n            }\n          }\n\n          [data-issues-open] {\n            font-size: var(--size-13);\n            color: white;\n            width: fit-content;\n            height: 100%;\n            display: flex;\n            gap: 2px;\n            align-items: center;\n            margin: 0;\n            line-height: var(--size-36);\n            font-weight: 500;\n            z-index: 2;\n            white-space: nowrap;\n\n            &:focus-visible {\n              outline: 0;\n            }\n          }\n\n          [data-issues-collapse] {\n            width: var(--size-24);\n            height: var(--size-24);\n            border-radius: var(--rounded-full);\n            transition: background var(--duration-short) ease;\n\n            &:hover {\n              background: var(--color-hover-alpha-error);\n            }\n          }\n\n          [data-cross] {\n            color: #fff;\n            width: var(--size-12);\n            height: var(--size-12);\n          }\n\n          [data-next-mark] {\n            width: var(--mark-size);\n            height: var(--mark-size);\n            margin-left: 2px;\n            display: flex;\n            align-items: center;\n            border-radius: var(--rounded-full);\n            transition: background var(--duration-long) var(--timing);\n\n            &:focus-visible {\n              outline: 0;\n            }\n\n            &:hover {\n              background: var(--color-hover-alpha-subtle);\n            }\n\n            svg {\n              flex-shrink: 0;\n              width: var(--size-40);\n              height: var(--size-40);\n            }\n          }\n\n          [data-issues-count-animation] {\n            display: grid;\n            place-items: center center;\n            font-variant-numeric: tabular-nums;\n\n            &[data-animate='false'] {\n              [data-issues-count-exit],\n              [data-issues-count-enter] {\n                animation-duration: 0ms;\n              }\n            }\n\n            > * {\n              grid-area: 1 / 1;\n            }\n\n            [data-issues-count-exit] {\n              animation: fadeOut 300ms var(--timing) forwards;\n            }\n\n            [data-issues-count-enter] {\n              animation: fadeIn 300ms var(--timing) forwards;\n            }\n          }\n\n          [data-issues-count-plural] {\n            display: inline-block;\n            &[data-animate='true'] {\n              animation: fadeIn 300ms var(--timing) forwards;\n            }\n          }\n\n          .path0 {\n            animation: draw0 1.5s ease-in-out infinite;\n          }\n\n          .path1 {\n            animation: draw1 1.5s ease-out infinite;\n            animation-delay: 0.3s;\n          }\n\n          .paused {\n            stroke-dashoffset: 0;\n          }\n\n          @keyframes fadeIn {\n            0% {\n              opacity: 0;\n              filter: blur(2px);\n              transform: translateY(8px);\n            }\n            100% {\n              opacity: 1;\n              filter: blur(0px);\n              transform: translateY(0);\n            }\n          }\n\n          @keyframes fadeOut {\n            0% {\n              opacity: 1;\n              filter: blur(0px);\n              transform: translateY(0);\n            }\n            100% {\n              opacity: 0;\n              transform: translateY(-12px);\n              filter: blur(2px);\n            }\n          }\n\n          @keyframes draw0 {\n            0%,\n            25% {\n              stroke-dashoffset: -29.6;\n            }\n            25%,\n            50% {\n              stroke-dashoffset: 0;\n            }\n            50%,\n            75% {\n              stroke-dashoffset: 0;\n            }\n            75%,\n            100% {\n              stroke-dashoffset: 29.6;\n            }\n          }\n\n          @keyframes draw1 {\n            0%,\n            20% {\n              stroke-dashoffset: -11.6;\n            }\n            20%,\n            50% {\n              stroke-dashoffset: 0;\n            }\n            50%,\n            75% {\n              stroke-dashoffset: 0;\n            }\n            75%,\n            100% {\n              stroke-dashoffset: 11.6;\n            }\n          }\n\n          @media (prefers-reduced-motion) {\n            [data-issues-count-exit],\n            [data-issues-count-enter],\n            [data-issues-count-plural] {\n              animation-duration: 0ms !important;\n            }\n          }\n        "
    ]);
    _templateObject = function() {
        return data;
    };
    return data;
}
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { css } from '../../../../utils/css';
import mergeRefs from '../../../utils/merge-refs';
import { useMinimumLoadingTimeMultiple } from './use-minimum-loading-time-multiple';
const SHORT_DURATION_MS = 150;
export const NextLogo = /*#__PURE__*/ forwardRef(function NextLogo(param, propRef) {
    let { disabled, issueCount, isDevBuilding, isDevRendering, isBuildError, onTriggerClick, toggleErrorOverlay, scale = 1, ...props } = param;
    const SIZE = 36 / scale;
    const hasError = issueCount > 0;
    const [isErrorExpanded, setIsErrorExpanded] = useState(hasError);
    const [dismissed, setDismissed] = useState(false);
    const newErrorDetected = useUpdateAnimation(issueCount, SHORT_DURATION_MS);
    const triggerRef = useRef(null);
    const ref = useRef(null);
    const [measuredWidth, pristine] = useMeasureWidth(ref);
    const isLoading = useMinimumLoadingTimeMultiple(isDevBuilding || isDevRendering);
    const isExpanded = isErrorExpanded || disabled;
    const style = useMemo(()=>{
        let width = SIZE;
        // Animates the badge, if expanded
        if (measuredWidth > SIZE) width = measuredWidth;
        // No animations on page load, assume the intrinsic width immediately
        if (pristine && hasError) width = 'auto';
        // Default state, collapsed
        return {
            width
        };
    }, [
        measuredWidth,
        pristine,
        hasError,
        SIZE
    ]);
    useEffect(()=>{
        setIsErrorExpanded(hasError);
    }, [
        hasError
    ]);
    return /*#__PURE__*/ _jsxs("div", {
        "data-next-badge-root": true,
        style: {
            '--size': "" + SIZE + "px",
            '--duration-short': "" + SHORT_DURATION_MS + "ms",
            // if the indicator is disabled, hide the badge
            // also allow the "disabled" state be dismissed, as long as there are no build errors
            display: disabled && (!hasError || dismissed) ? 'none' : 'block'
        },
        children: [
            /*#__PURE__*/ _jsx("style", {
                children: css(_templateObject())
            }),
            /*#__PURE__*/ _jsx("div", {
                "data-next-badge": true,
                "data-error": hasError,
                "data-error-expanded": isExpanded,
                "data-animate": newErrorDetected,
                style: style,
                children: /*#__PURE__*/ _jsxs("div", {
                    ref: ref,
                    children: [
                        !disabled && /*#__PURE__*/ _jsx("button", {
                            ref: mergeRefs(triggerRef, propRef),
                            "data-next-mark": true,
                            "data-next-mark-loading": isLoading,
                            onClick: onTriggerClick,
                            ...props,
                            children: /*#__PURE__*/ _jsx(NextMark, {
                                isLoading: isLoading,
                                isDevBuilding: isDevBuilding
                            })
                        }),
                        isExpanded && /*#__PURE__*/ _jsxs("div", {
                            "data-issues": true,
                            children: [
                                /*#__PURE__*/ _jsxs("button", {
                                    "data-issues-open": true,
                                    "aria-label": "Open issues overlay",
                                    onClick: toggleErrorOverlay,
                                    children: [
                                        disabled && /*#__PURE__*/ _jsx("div", {
                                            "data-disabled-icon": true,
                                            children: /*#__PURE__*/ _jsx(Warning, {})
                                        }),
                                        /*#__PURE__*/ _jsx(AnimateCount, {
                                            animate: newErrorDetected,
                                            "data-issues-count-animation": true,
                                            children: issueCount
                                        }, issueCount),
                                        ' ',
                                        /*#__PURE__*/ _jsxs("div", {
                                            children: [
                                                "Issue",
                                                issueCount > 1 && /*#__PURE__*/ _jsx("span", {
                                                    "aria-hidden": true,
                                                    "data-issues-count-plural": true,
                                                    // This only needs to animate once the count changes from 1 -> 2,
                                                    // otherwise it should stay static between re-renders.
                                                    "data-animate": newErrorDetected && issueCount === 2,
                                                    children: "s"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                !isBuildError && /*#__PURE__*/ _jsx("button", {
                                    "data-issues-collapse": true,
                                    "aria-label": "Collapse issues badge",
                                    onClick: ()=>{
                                        var // Move focus to the trigger to prevent having it stuck on this element
                                        _triggerRef_current;
                                        if (disabled) {
                                            setDismissed(true);
                                        } else {
                                            setIsErrorExpanded(false);
                                        }
                                        (_triggerRef_current = triggerRef.current) == null ? void 0 : _triggerRef_current.focus();
                                    },
                                    children: /*#__PURE__*/ _jsx(Cross, {
                                        "data-cross": true
                                    })
                                })
                            ]
                        })
                    ]
                })
            }),
            /*#__PURE__*/ _jsx("div", {
                "aria-hidden": true,
                "data-dot": true
            })
        ]
    });
});
function AnimateCount(param) {
    let { children: count, animate = true, ...props } = param;
    return /*#__PURE__*/ _jsxs("div", {
        ...props,
        "data-animate": animate,
        children: [
            /*#__PURE__*/ _jsx("div", {
                "aria-hidden": true,
                "data-issues-count-exit": true,
                children: count - 1
            }),
            /*#__PURE__*/ _jsx("div", {
                "data-issues-count": true,
                "data-issues-count-enter": true,
                children: count
            })
        ]
    });
}
function useMeasureWidth(ref) {
    const [width, setWidth] = useState(0);
    const [pristine, setPristine] = useState(true);
    useEffect(()=>{
        const el = ref.current;
        if (!el) {
            return;
        }
        const observer = new ResizeObserver(()=>{
            const { width: w } = el.getBoundingClientRect();
            setWidth((prevWidth)=>{
                if (prevWidth !== 0) {
                    setPristine(false);
                }
                return w;
            });
        });
        observer.observe(el);
        return ()=>observer.disconnect();
    }, [
        ref
    ]);
    return [
        width,
        pristine
    ];
}
function useUpdateAnimation(issueCount, animationDurationMs) {
    if (animationDurationMs === void 0) animationDurationMs = 0;
    const lastUpdatedTimeStamp = useRef(null);
    const [animate, setAnimate] = useState(false);
    useEffect(()=>{
        if (issueCount > 0) {
            const deltaMs = lastUpdatedTimeStamp.current ? Date.now() - lastUpdatedTimeStamp.current : -1;
            lastUpdatedTimeStamp.current = Date.now();
            // We don't animate if `issueCount` changes too quickly
            if (deltaMs <= animationDurationMs) {
                return;
            }
            setAnimate(true);
            // It is important to use a CSS transitioned state, not a CSS keyframed animation
            // because if the issue count increases faster than the animation duration, it
            // will abruptly stop and not transition smoothly back to its original state.
            const timeoutId = window.setTimeout(()=>{
                setAnimate(false);
            }, animationDurationMs);
            return ()=>{
                clearTimeout(timeoutId);
            };
        }
    }, [
        issueCount,
        animationDurationMs
    ]);
    return animate;
}
function NextMark(param) {
    let { isLoading, isDevBuilding } = param;
    const strokeColor = isDevBuilding ? 'rgba(255,255,255,0.7)' : 'white';
    return /*#__PURE__*/ _jsxs("svg", {
        width: "40",
        height: "40",
        viewBox: "0 0 40 40",
        fill: "none",
        "data-next-mark-loading": isLoading,
        children: [
            /*#__PURE__*/ _jsxs("g", {
                transform: "translate(8.5, 13)",
                children: [
                    /*#__PURE__*/ _jsx("path", {
                        className: isLoading ? 'path0' : 'paused',
                        d: "M13.3 15.2 L2.34 1 V12.6",
                        fill: "none",
                        stroke: "url(#next_logo_paint0_linear_1357_10853)",
                        strokeWidth: "1.86",
                        mask: "url(#next_logo_mask0)",
                        strokeDasharray: "29.6",
                        strokeDashoffset: "29.6"
                    }),
                    /*#__PURE__*/ _jsx("path", {
                        className: isLoading ? 'path1' : 'paused',
                        d: "M11.825 1.5 V13.1",
                        strokeWidth: "1.86",
                        stroke: "url(#next_logo_paint1_linear_1357_10853)",
                        strokeDasharray: "11.6",
                        strokeDashoffset: "11.6"
                    })
                ]
            }),
            /*#__PURE__*/ _jsxs("defs", {
                children: [
                    /*#__PURE__*/ _jsxs("linearGradient", {
                        id: "next_logo_paint0_linear_1357_10853",
                        x1: "9.95555",
                        y1: "11.1226",
                        x2: "15.4778",
                        y2: "17.9671",
                        gradientUnits: "userSpaceOnUse",
                        children: [
                            /*#__PURE__*/ _jsx("stop", {
                                stopColor: strokeColor
                            }),
                            /*#__PURE__*/ _jsx("stop", {
                                offset: "0.604072",
                                stopColor: strokeColor,
                                stopOpacity: "0"
                            }),
                            /*#__PURE__*/ _jsx("stop", {
                                offset: "1",
                                stopColor: strokeColor,
                                stopOpacity: "0"
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("linearGradient", {
                        id: "next_logo_paint1_linear_1357_10853",
                        x1: "11.8222",
                        y1: "1.40039",
                        x2: "11.791",
                        y2: "9.62542",
                        gradientUnits: "userSpaceOnUse",
                        children: [
                            /*#__PURE__*/ _jsx("stop", {
                                stopColor: strokeColor
                            }),
                            /*#__PURE__*/ _jsx("stop", {
                                offset: "1",
                                stopColor: strokeColor,
                                stopOpacity: "0"
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("mask", {
                        id: "next_logo_mask0",
                        children: [
                            /*#__PURE__*/ _jsx("rect", {
                                width: "100%",
                                height: "100%",
                                fill: "white"
                            }),
                            /*#__PURE__*/ _jsx("rect", {
                                width: "5",
                                height: "1.5",
                                fill: "black"
                            })
                        ]
                    })
                ]
            })
        ]
    });
}
function Warning() {
    return /*#__PURE__*/ _jsx("svg", {
        width: "12",
        height: "12",
        viewBox: "0 0 12 12",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        children: /*#__PURE__*/ _jsx("path", {
            fillRule: "evenodd",
            clipRule: "evenodd",
            d: "M3.98071 1.125L1.125 3.98071L1.125 8.01929L3.98071 10.875H8.01929L10.875 8.01929V3.98071L8.01929 1.125H3.98071ZM3.82538 0C3.62647 0 3.4357 0.0790176 3.29505 0.21967L0.21967 3.29505C0.0790176 3.4357 0 3.62647 0 3.82538V8.17462C0 8.37353 0.0790178 8.5643 0.21967 8.70495L3.29505 11.7803C3.4357 11.921 3.62647 12 3.82538 12H8.17462C8.37353 12 8.5643 11.921 8.70495 11.7803L11.7803 8.70495C11.921 8.5643 12 8.37353 12 8.17462V3.82538C12 3.62647 11.921 3.4357 11.7803 3.29505L8.70495 0.21967C8.5643 0.0790177 8.37353 0 8.17462 0H3.82538ZM6.5625 2.8125V3.375V6V6.5625H5.4375V6V3.375V2.8125H6.5625ZM6 9C6.41421 9 6.75 8.66421 6.75 8.25C6.75 7.83579 6.41421 7.5 6 7.5C5.58579 7.5 5.25 7.83579 5.25 8.25C5.25 8.66421 5.58579 9 6 9Z",
            fill: "#EAEAEA"
        })
    });
}
export function Cross(props) {
    return /*#__PURE__*/ _jsx("svg", {
        width: "12",
        height: "12",
        viewBox: "0 0 14 14",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        ...props,
        children: /*#__PURE__*/ _jsx("path", {
            fillRule: "evenodd",
            clipRule: "evenodd",
            d: "M3.08889 11.8384L2.62486 12.3024L1.69678 11.3744L2.16082 10.9103L6.07178 6.99937L2.16082 3.08841L1.69678 2.62437L2.62486 1.69629L3.08889 2.16033L6.99986 6.07129L10.9108 2.16033L11.3749 1.69629L12.3029 2.62437L11.8389 3.08841L7.92793 6.99937L11.8389 10.9103L12.3029 11.3744L11.3749 12.3024L10.9108 11.8384L6.99986 7.92744L3.08889 11.8384Z",
            fill: "currentColor"
        })
    });
}

//# sourceMappingURL=next-logo.js.map