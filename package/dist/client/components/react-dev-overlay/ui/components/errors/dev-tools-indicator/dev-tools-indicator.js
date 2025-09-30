"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    DEV_TOOLS_INDICATOR_STYLES: null,
    DevToolsIndicator: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DEV_TOOLS_INDICATOR_STYLES: function() {
        return DEV_TOOLS_INDICATOR_STYLES;
    },
    DevToolsIndicator: function() {
        return DevToolsIndicator;
    }
});
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _jsxruntime = require("react/jsx-runtime");
const _react = require("react");
const _toast = require("../../toast");
const _nextlogo = require("./next-logo");
const _initialize = require("../../../../../../dev/dev-build-indicator/internal/initialize");
const _devrenderindicator = require("../../../../utils/dev-indicator/dev-render-indicator");
const _usedelayedrender = require("../../../hooks/use-delayed-render");
const _turbopackinfo = require("./dev-tools-info/turbopack-info");
const _routeinfo = require("./dev-tools-info/route-info");
const _gearicon = /*#__PURE__*/ _interop_require_default._(require("../../../icons/gear-icon"));
const _userpreferences = require("./dev-tools-info/user-preferences");
const _utils = require("./utils");
const _preferences = require("./dev-tools-info/preferences");
function DevToolsIndicator(param) {
    let { state, errorCount, isBuildError, setIsErrorOverlayOpen, ...props } = param;
    const [isDevToolsIndicatorVisible, setIsDevToolsIndicatorVisible] = (0, _react.useState)(true);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(DevToolsPopover, {
        routerType: state.routerType,
        semver: state.versionInfo.installed,
        issueCount: errorCount,
        isStaticRoute: state.staticIndicator,
        hide: ()=>{
            setIsDevToolsIndicatorVisible(false);
            fetch('/__nextjs_disable_dev_indicator', {
                method: 'POST'
            });
        },
        setIsErrorOverlayOpen: setIsErrorOverlayOpen,
        isTurbopack: !!process.env.TURBOPACK,
        disabled: state.disableDevIndicator || !isDevToolsIndicatorVisible,
        isBuildError: isBuildError,
        ...props
    });
}
const Context = /*#__PURE__*/ (0, _react.createContext)({});
const OVERLAYS = {
    Root: 'root',
    Turbo: 'turbo',
    Route: 'route',
    Preferences: 'preferences'
};
function DevToolsPopover(param) {
    let { routerType, disabled, issueCount, isStaticRoute, isTurbopack, isBuildError, hide, setIsErrorOverlayOpen, scale, setScale } = param;
    const menuRef = (0, _react.useRef)(null);
    const triggerRef = (0, _react.useRef)(null);
    const [open, setOpen] = (0, _react.useState)(null);
    const [position, setPosition] = (0, _react.useState)((0, _preferences.getInitialPosition)());
    const [selectedIndex, setSelectedIndex] = (0, _react.useState)(-1);
    const isMenuOpen = open === OVERLAYS.Root;
    const isTurbopackInfoOpen = open === OVERLAYS.Turbo;
    const isRouteInfoOpen = open === OVERLAYS.Route;
    const isPreferencesOpen = open === OVERLAYS.Preferences;
    const { mounted: menuMounted, rendered: menuRendered } = (0, _usedelayedrender.useDelayedRender)(isMenuOpen, {
        // Intentionally no fade in, makes the UI feel more immediate
        enterDelay: 0,
        // Graceful fade out to confirm that the UI did not break
        exitDelay: _utils.MENU_DURATION_MS
    });
    // Features to make the menu accessible
    (0, _utils.useFocusTrap)(menuRef, triggerRef, isMenuOpen);
    (0, _utils.useClickOutside)(menuRef, triggerRef, isMenuOpen, closeMenu);
    (0, _react.useEffect)(()=>{
        if (open === null) {
            // Avoid flashing selected state
            const id = setTimeout(()=>{
                setSelectedIndex(-1);
            }, _utils.MENU_DURATION_MS);
            return ()=>clearTimeout(id);
        }
    }, [
        open
    ]);
    function select(index) {
        var _menuRef_current;
        if (index === 'first') {
            setTimeout(()=>{
                var _menuRef_current;
                const all = (_menuRef_current = menuRef.current) == null ? void 0 : _menuRef_current.querySelectorAll('[role="menuitem"]');
                if (all) {
                    const firstIndex = all[0].getAttribute('data-index');
                    select(Number(firstIndex));
                }
            });
            return;
        }
        if (index === 'last') {
            setTimeout(()=>{
                var _menuRef_current;
                const all = (_menuRef_current = menuRef.current) == null ? void 0 : _menuRef_current.querySelectorAll('[role="menuitem"]');
                if (all) {
                    const lastIndex = all.length - 1;
                    select(lastIndex);
                }
            });
            return;
        }
        const el = (_menuRef_current = menuRef.current) == null ? void 0 : _menuRef_current.querySelector('[data-index="' + index + '"]');
        if (el) {
            setSelectedIndex(index);
            el == null ? void 0 : el.focus();
        }
    }
    function onMenuKeydown(e) {
        e.preventDefault();
        switch(e.key){
            case 'ArrowDown':
                const next = selectedIndex + 1;
                select(next);
                break;
            case 'ArrowUp':
                const prev = selectedIndex - 1;
                select(prev);
                break;
            case 'Home':
                select('first');
                break;
            case 'End':
                select('last');
                break;
            default:
                break;
        }
    }
    function openErrorOverlay() {
        setOpen(null);
        if (issueCount > 0) {
            setIsErrorOverlayOpen(true);
        }
    }
    function toggleErrorOverlay() {
        setIsErrorOverlayOpen((prev)=>!prev);
    }
    function openRootMenu() {
        setOpen((prevOpen)=>{
            if (prevOpen === null) select('first');
            return OVERLAYS.Root;
        });
    }
    function onTriggerClick() {
        if (open === OVERLAYS.Root) {
            setOpen(null);
        } else {
            openRootMenu();
            setTimeout(()=>{
                select('first');
            });
        }
    }
    function closeMenu() {
        // Only close when we were on `Root`,
        // otherwise it will close other overlays
        setOpen((prevOpen)=>{
            if (prevOpen === OVERLAYS.Root) {
                return null;
            }
            return prevOpen;
        });
    }
    function handleHideDevtools() {
        setOpen(null);
        hide();
    }
    const [vertical, horizontal] = position.split('-', 2);
    const popover = {
        [vertical]: 'calc(100% + 8px)',
        [horizontal]: 0
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_toast.Toast, {
        "data-nextjs-toast": true,
        style: {
            '--animate-out-duration-ms': "" + _utils.MENU_DURATION_MS + "ms",
            '--animate-out-timing-function': _utils.MENU_CURVE,
            boxShadow: 'none',
            zIndex: 2147483647,
            // Reset the toast component's default positions.
            bottom: 'initial',
            left: 'initial',
            [vertical]: '20px',
            [horizontal]: '20px'
        },
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_nextlogo.NextLogo, {
                ref: triggerRef,
                "aria-haspopup": "menu",
                "aria-expanded": isMenuOpen,
                "aria-controls": "nextjs-dev-tools-menu",
                "aria-label": "" + (isMenuOpen ? 'Close' : 'Open') + " Next.js Dev Tools",
                "data-nextjs-dev-tools-button": true,
                disabled: disabled,
                issueCount: issueCount,
                onTriggerClick: onTriggerClick,
                toggleErrorOverlay: toggleErrorOverlay,
                isDevBuilding: (0, _initialize.useIsDevBuilding)(),
                isDevRendering: (0, _devrenderindicator.useIsDevRendering)(),
                isBuildError: isBuildError,
                scale: scale
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_routeinfo.RouteInfo, {
                isOpen: isRouteInfoOpen,
                close: openRootMenu,
                triggerRef: triggerRef,
                style: popover,
                routerType: routerType,
                routeType: isStaticRoute ? 'Static' : 'Dynamic'
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_turbopackinfo.TurbopackInfo, {
                isOpen: isTurbopackInfoOpen,
                close: openRootMenu,
                triggerRef: triggerRef,
                style: popover
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_userpreferences.UserPreferences, {
                isOpen: isPreferencesOpen,
                close: openRootMenu,
                triggerRef: triggerRef,
                style: popover,
                hide: handleHideDevtools,
                setPosition: setPosition,
                position: position,
                scale: scale,
                setScale: setScale
            }),
            menuMounted && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                ref: menuRef,
                id: "nextjs-dev-tools-menu",
                role: "menu",
                dir: "ltr",
                "aria-orientation": "vertical",
                "aria-label": "Next.js Dev Tools Items",
                tabIndex: -1,
                className: "dev-tools-indicator-menu",
                onKeyDown: onMenuKeydown,
                "data-rendered": menuRendered,
                style: popover,
                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)(Context.Provider, {
                    value: {
                        closeMenu,
                        selectedIndex,
                        setSelectedIndex
                    },
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "dev-tools-indicator-inner",
                            children: [
                                issueCount > 0 && /*#__PURE__*/ (0, _jsxruntime.jsx)(MenuItem, {
                                    title: issueCount + " " + (issueCount === 1 ? 'issue' : 'issues') + " found. Click to view details in the dev overlay.",
                                    index: 0,
                                    label: "Issues",
                                    value: /*#__PURE__*/ (0, _jsxruntime.jsx)(IssueCount, {
                                        children: issueCount
                                    }),
                                    onClick: openErrorOverlay
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)(MenuItem, {
                                    title: "Current route is " + (isStaticRoute ? 'static' : 'dynamic') + ".",
                                    label: "Route",
                                    index: 1,
                                    value: isStaticRoute ? 'Static' : 'Dynamic',
                                    onClick: ()=>setOpen(OVERLAYS.Route),
                                    "data-nextjs-route-type": isStaticRoute ? 'static' : 'dynamic'
                                }),
                                isTurbopack ? /*#__PURE__*/ (0, _jsxruntime.jsx)(MenuItem, {
                                    title: "Turbopack is enabled.",
                                    label: "Turbopack",
                                    value: "Enabled"
                                }) : /*#__PURE__*/ (0, _jsxruntime.jsx)(MenuItem, {
                                    index: 2,
                                    title: "Learn about Turbopack and how to enable it in your application.",
                                    label: "Try Turbopack",
                                    value: /*#__PURE__*/ (0, _jsxruntime.jsx)(ChevronRight, {}),
                                    onClick: ()=>setOpen(OVERLAYS.Turbo)
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "dev-tools-indicator-footer",
                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(MenuItem, {
                                "data-preferences": true,
                                label: "Preferences",
                                value: /*#__PURE__*/ (0, _jsxruntime.jsx)(_gearicon.default, {}),
                                onClick: ()=>setOpen(OVERLAYS.Preferences),
                                index: isTurbopack ? 2 : 3
                            })
                        })
                    ]
                })
            })
        ]
    });
}
function ChevronRight() {
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: "16",
        height: "16",
        viewBox: "0 0 16 16",
        fill: "none",
        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
            fill: "#666",
            fillRule: "evenodd",
            clipRule: "evenodd",
            d: "M5.50011 1.93945L6.03044 2.46978L10.8537 7.293C11.2442 7.68353 11.2442 8.31669 10.8537 8.70722L6.03044 13.5304L5.50011 14.0608L4.43945 13.0001L4.96978 12.4698L9.43945 8.00011L4.96978 3.53044L4.43945 3.00011L5.50011 1.93945Z"
        })
    });
}
function MenuItem(param) {
    let { index, label, value, onClick, href, ...props } = param;
    const isInteractive = typeof onClick === 'function' || typeof href === 'string';
    const { closeMenu, selectedIndex, setSelectedIndex } = (0, _react.useContext)(Context);
    const selected = selectedIndex === index;
    function click() {
        if (isInteractive) {
            onClick == null ? void 0 : onClick();
            closeMenu();
            if (href) {
                window.open(href, '_blank', 'noopener, noreferrer');
            }
        }
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "dev-tools-indicator-item",
        "data-index": index,
        "data-selected": selected,
        onClick: click,
        // Needs `onMouseMove` instead of enter to work together
        // with keyboard and mouse input
        onMouseMove: ()=>{
            if (isInteractive && index !== undefined && selectedIndex !== index) {
                setSelectedIndex(index);
            }
        },
        onMouseLeave: ()=>setSelectedIndex(-1),
        onKeyDown: (e)=>{
            if (e.key === 'Enter' || e.key === ' ') {
                click();
            }
        },
        role: isInteractive ? 'menuitem' : undefined,
        tabIndex: selected ? 0 : -1,
        ...props,
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                className: "dev-tools-indicator-label",
                children: label
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                className: "dev-tools-indicator-value",
                children: value
            })
        ]
    });
}
function IssueCount(param) {
    let { children } = param;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
        className: "dev-tools-indicator-issue-count",
        "data-has-issues": children > 0,
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                className: "dev-tools-indicator-issue-count-indicator"
            }),
            children
        ]
    });
}
const DEV_TOOLS_INDICATOR_STYLES = "\n  .dev-tools-indicator-menu {\n    -webkit-font-smoothing: antialiased;\n    display: flex;\n    flex-direction: column;\n    align-items: flex-start;\n    background: var(--color-background-100);\n    border: 1px solid var(--color-gray-alpha-400);\n    background-clip: padding-box;\n    box-shadow: var(--shadow-menu);\n    border-radius: var(--rounded-xl);\n    position: absolute;\n    font-family: var(--font-stack-sans);\n    z-index: 1000;\n    overflow: hidden;\n    opacity: 0;\n    outline: 0;\n    min-width: 248px;\n    transition: opacity var(--animate-out-duration-ms)\n      var(--animate-out-timing-function);\n\n    &[data-rendered='true'] {\n      opacity: 1;\n      scale: 1;\n    }\n  }\n\n  .dev-tools-indicator-inner {\n    padding: 6px;\n    width: 100%;\n  }\n\n  .dev-tools-indicator-item {\n    display: flex;\n    align-items: center;\n    padding: 8px 6px;\n    height: var(--size-36);\n    border-radius: 6px;\n    text-decoration: none !important;\n    user-select: none;\n    white-space: nowrap;\n\n    svg {\n      width: var(--size-16);\n      height: var(--size-16);\n    }\n\n    &:focus-visible {\n      outline: 0;\n    }\n  }\n\n  .dev-tools-indicator-footer {\n    background: var(--color-background-200);\n    padding: 6px;\n    border-top: 1px solid var(--color-gray-400);\n    width: 100%;\n  }\n\n  .dev-tools-indicator-item[data-selected='true'] {\n    cursor: pointer;\n    background-color: var(--color-gray-200);\n  }\n\n  .dev-tools-indicator-label {\n    font-size: var(--size-14);\n    line-height: var(--size-20);\n    color: var(--color-gray-1000);\n  }\n\n  .dev-tools-indicator-value {\n    font-size: var(--size-14);\n    line-height: var(--size-20);\n    color: var(--color-gray-900);\n    margin-left: auto;\n  }\n\n  .dev-tools-indicator-issue-count {\n    --color-primary: var(--color-gray-800);\n    --color-secondary: var(--color-gray-100);\n    display: flex;\n    flex-direction: row;\n    align-items: center;\n    justify-content: center;\n    gap: 8px;\n    min-width: var(--size-40);\n    height: var(--size-24);\n    background: var(--color-background-100);\n    border: 1px solid var(--color-gray-alpha-400);\n    background-clip: padding-box;\n    box-shadow: var(--shadow-small);\n    padding: 2px;\n    color: var(--color-gray-1000);\n    border-radius: 128px;\n    font-weight: 500;\n    font-size: var(--size-13);\n    font-variant-numeric: tabular-nums;\n\n    &[data-has-issues='true'] {\n      --color-primary: var(--color-red-800);\n      --color-secondary: var(--color-red-100);\n    }\n\n    .dev-tools-indicator-issue-count-indicator {\n      width: var(--size-8);\n      height: var(--size-8);\n      background: var(--color-primary);\n      box-shadow: 0 0 0 2px var(--color-secondary);\n      border-radius: 50%;\n    }\n  }\n\n  .dev-tools-indicator-shortcut {\n    display: flex;\n    gap: 4px;\n\n    kbd {\n      width: var(--size-20);\n      height: var(--size-20);\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      border-radius: var(--rounded-md);\n      border: 1px solid var(--color-gray-400);\n      font-family: var(--font-stack-sans);\n      background: var(--color-background-100);\n      color: var(--color-gray-1000);\n      text-align: center;\n      font-size: var(--size-12);\n      line-height: var(--size-16);\n    }\n  }\n";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=dev-tools-indicator.js.map