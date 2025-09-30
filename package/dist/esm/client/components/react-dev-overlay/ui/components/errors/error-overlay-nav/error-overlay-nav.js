import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ErrorOverlayPagination } from '../error-overlay-pagination/error-overlay-pagination';
import { VersionStalenessInfo } from '../../version-staleness-info/version-staleness-info';
export function ErrorOverlayNav(param) {
    let { runtimeErrors, activeIdx, setActiveIndex, versionInfo } = param;
    const bundlerName = process.env.__NEXT_BUNDLER || 'Webpack';
    return /*#__PURE__*/ _jsxs("div", {
        "data-nextjs-error-overlay-nav": true,
        children: [
            /*#__PURE__*/ _jsx(Notch, {
                side: "left",
                children: /*#__PURE__*/ _jsx(ErrorOverlayPagination, {
                    runtimeErrors: runtimeErrors != null ? runtimeErrors : [],
                    activeIdx: activeIdx != null ? activeIdx : 0,
                    onActiveIndexChange: setActiveIndex != null ? setActiveIndex : ()=>{}
                })
            }),
            versionInfo && /*#__PURE__*/ _jsx(Notch, {
                side: "right",
                children: /*#__PURE__*/ _jsx(VersionStalenessInfo, {
                    versionInfo: versionInfo,
                    bundlerName: bundlerName
                })
            })
        ]
    });
}
export const styles = "\n  [data-nextjs-error-overlay-nav] {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n\n    width: 100%;\n\n    position: relative;\n    z-index: 2;\n    outline: none;\n    translate: 1px 1px;\n    max-width: var(--next-dialog-max-width);\n\n    .error-overlay-notch {\n      --stroke-color: var(--color-gray-400);\n      --background-color: var(--color-background-100);\n\n      translate: -1px 0;\n      width: auto;\n      height: var(--next-dialog-notch-height);\n      padding: 12px;\n      background: var(--background-color);\n      border: 1px solid var(--stroke-color);\n      border-bottom: none;\n      position: relative;\n\n      &[data-side='left'] {\n        padding-right: 0;\n        border-radius: var(--rounded-xl) 0 0 0;\n\n        .error-overlay-notch-tail {\n          right: -54px;\n        }\n\n        > *:not(.error-overlay-notch-tail) {\n          margin-right: -10px;\n        }\n      }\n\n      &[data-side='right'] {\n        padding-left: 0;\n        border-radius: 0 var(--rounded-xl) 0 0;\n\n        .error-overlay-notch-tail {\n          left: -54px;\n          transform: rotateY(180deg);\n        }\n\n        > *:not(.error-overlay-notch-tail) {\n          margin-left: -12px;\n        }\n      }\n\n      .error-overlay-notch-tail {\n        position: absolute;\n        top: -1px;\n        pointer-events: none;\n        z-index: -1;\n        height: calc(100% + 1px);\n      }\n    }\n  }\n";
function Notch(param) {
    let { children, side = 'left' } = param;
    return /*#__PURE__*/ _jsxs("div", {
        className: "error-overlay-notch",
        "data-side": side,
        children: [
            children,
            /*#__PURE__*/ _jsx(Tail, {})
        ]
    });
}
function Tail() {
    return /*#__PURE__*/ _jsxs("svg", {
        width: "60",
        height: "42",
        viewBox: "0 0 60 42",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        className: "error-overlay-notch-tail",
        preserveAspectRatio: "none",
        children: [
            /*#__PURE__*/ _jsxs("mask", {
                id: "error_overlay_nav_mask0_2667_14687",
                style: {
                    maskType: 'alpha'
                },
                maskUnits: "userSpaceOnUse",
                x: "0",
                y: "-1",
                width: "60",
                height: "43",
                children: [
                    /*#__PURE__*/ _jsxs("mask", {
                        id: "error_overlay_nav_path_1_outside_1_2667_14687",
                        maskUnits: "userSpaceOnUse",
                        x: "0",
                        y: "-1",
                        width: "60",
                        height: "43",
                        fill: "black",
                        children: [
                            /*#__PURE__*/ _jsx("rect", {
                                fill: "white",
                                y: "-1",
                                width: "60",
                                height: "43"
                            }),
                            /*#__PURE__*/ _jsx("path", {
                                d: "M1 0L8.0783 0C15.772 0 22.7836 4.41324 26.111 11.3501L34.8889 29.6498C38.2164 36.5868 45.228 41 52.9217 41H60H1L1 0Z"
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsx("path", {
                        d: "M1 0L8.0783 0C15.772 0 22.7836 4.41324 26.111 11.3501L34.8889 29.6498C38.2164 36.5868 45.228 41 52.9217 41H60H1L1 0Z",
                        fill: "white"
                    }),
                    /*#__PURE__*/ _jsx("path", {
                        d: "M1 0V-1H0V0L1 0ZM1 41H0V42H1V41ZM34.8889 29.6498L33.9873 30.0823L34.8889 29.6498ZM26.111 11.3501L27.0127 10.9177L26.111 11.3501ZM1 1H8.0783V-1H1V1ZM60 40H1V42H60V40ZM2 41V0L0 0L0 41H2ZM25.2094 11.7826L33.9873 30.0823L35.7906 29.2174L27.0127 10.9177L25.2094 11.7826ZM52.9217 42H60V40H52.9217V42ZM33.9873 30.0823C37.4811 37.3661 44.8433 42 52.9217 42V40C45.6127 40 38.9517 35.8074 35.7906 29.2174L33.9873 30.0823ZM8.0783 1C15.3873 1 22.0483 5.19257 25.2094 11.7826L27.0127 10.9177C23.5188 3.6339 16.1567 -1 8.0783 -1V1Z",
                        fill: "black",
                        mask: "url(#error_overlay_nav_path_1_outside_1_2667_14687)"
                    })
                ]
            }),
            /*#__PURE__*/ _jsxs("g", {
                mask: "url(#error_overlay_nav_mask0_2667_14687)",
                children: [
                    /*#__PURE__*/ _jsxs("mask", {
                        id: "error_overlay_nav_path_3_outside_2_2667_14687",
                        maskUnits: "userSpaceOnUse",
                        x: "-1",
                        y: "0.0244141",
                        width: "60",
                        height: "43",
                        fill: "black",
                        children: [
                            /*#__PURE__*/ _jsx("rect", {
                                fill: "white",
                                x: "-1",
                                y: "0.0244141",
                                width: "60",
                                height: "43"
                            }),
                            /*#__PURE__*/ _jsx("path", {
                                d: "M0 1.02441H7.0783C14.772 1.02441 21.7836 5.43765 25.111 12.3746L33.8889 30.6743C37.2164 37.6112 44.228 42.0244 51.9217 42.0244H59H0L0 1.02441Z"
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsx("path", {
                        d: "M0 1.02441H7.0783C14.772 1.02441 21.7836 5.43765 25.111 12.3746L33.8889 30.6743C37.2164 37.6112 44.228 42.0244 51.9217 42.0244H59H0L0 1.02441Z",
                        fill: "var(--background-color)"
                    }),
                    /*#__PURE__*/ _jsx("path", {
                        d: "M0 1.02441L0 0.0244141H-1V1.02441H0ZM0 42.0244H-1V43.0244H0L0 42.0244ZM33.8889 30.6743L32.9873 31.1068L33.8889 30.6743ZM25.111 12.3746L26.0127 11.9421L25.111 12.3746ZM0 2.02441H7.0783V0.0244141H0L0 2.02441ZM59 41.0244H0L0 43.0244H59V41.0244ZM1 42.0244L1 1.02441H-1L-1 42.0244H1ZM24.2094 12.8071L32.9873 31.1068L34.7906 30.2418L26.0127 11.9421L24.2094 12.8071ZM51.9217 43.0244H59V41.0244H51.9217V43.0244ZM32.9873 31.1068C36.4811 38.3905 43.8433 43.0244 51.9217 43.0244V41.0244C44.6127 41.0244 37.9517 36.8318 34.7906 30.2418L32.9873 31.1068ZM7.0783 2.02441C14.3873 2.02441 21.0483 6.21699 24.2094 12.8071L26.0127 11.9421C22.5188 4.65831 15.1567 0.0244141 7.0783 0.0244141V2.02441Z",
                        fill: "var(--stroke-color)",
                        mask: "url(#error_overlay_nav_path_3_outside_2_2667_14687)"
                    })
                ]
            })
        ]
    });
}

//# sourceMappingURL=error-overlay-nav.js.map