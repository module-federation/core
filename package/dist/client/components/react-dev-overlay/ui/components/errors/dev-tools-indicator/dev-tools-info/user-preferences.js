"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    DEV_TOOLS_INFO_USER_PREFERENCES_STYLES: null,
    UserPreferences: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DEV_TOOLS_INFO_USER_PREFERENCES_STYLES: function() {
        return DEV_TOOLS_INFO_USER_PREFERENCES_STYLES;
    },
    UserPreferences: function() {
        return UserPreferences;
    }
});
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _tagged_template_literal_loose = require("@swc/helpers/_/_tagged_template_literal_loose");
const _jsxruntime = require("react/jsx-runtime");
const _react = require("react");
const _css = require("../../../../../utils/css");
const _eyeicon = /*#__PURE__*/ _interop_require_default._(require("../../../../icons/eye-icon"));
const _shared = require("../../../../../shared");
const _lighticon = /*#__PURE__*/ _interop_require_default._(require("../../../../icons/light-icon"));
const _darkicon = /*#__PURE__*/ _interop_require_default._(require("../../../../icons/dark-icon"));
const _systemicon = /*#__PURE__*/ _interop_require_default._(require("../../../../icons/system-icon"));
const _devtoolsinfo = require("./dev-tools-info");
const _preferences = require("./preferences");
function _templateObject() {
    const data = _tagged_template_literal_loose._([
        "\n  .preferences-container {\n    padding: 8px 6px;\n    width: 100%;\n  }\n\n  @media (min-width: 576px) {\n    .preferences-container {\n      width: 480px;\n    }\n  }\n\n  .preference-section:first-child {\n    padding-top: 0;\n  }\n\n  .preference-section {\n    padding: 12px 0;\n    border-bottom: 1px solid var(--color-gray-400);\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    gap: 24px;\n  }\n\n  .preference-section:last-child {\n    border-bottom: none;\n  }\n\n  .preference-header {\n    margin-bottom: 0;\n    flex: 1;\n  }\n\n  .preference-header label {\n    font-size: var(--size-14);\n    font-weight: 500;\n    color: var(--color-gray-1000);\n    margin: 0;\n  }\n\n  .preference-description {\n    color: var(--color-gray-900);\n    font-size: var(--size-14);\n    margin: 0;\n  }\n\n  .select-button,\n  .action-button {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    background: var(--color-background-100);\n    border: 1px solid var(--color-gray-400);\n    border-radius: var(--rounded-lg);\n    font-weight: 400;\n    font-size: var(--size-14);\n    color: var(--color-gray-1000);\n    padding: 6px 8px;\n\n    &:hover {\n      background: var(--color-gray-100);\n    }\n  }\n\n  .select-button {\n    &:focus-within {\n      outline: var(--focus-ring);\n    }\n\n    select {\n      all: unset;\n    }\n  }\n\n  :global(.icon) {\n    width: 18px;\n    height: 18px;\n    color: #666;\n  }\n"
    ]);
    _templateObject = function() {
        return data;
    };
    return data;
}
function UserPreferences(param) {
    let { setPosition, position, hide, scale, setScale, ...props } = param;
    // derive initial theme from system preference
    const [theme, setTheme] = (0, _react.useState)((0, _preferences.getInitialTheme)());
    const handleThemeChange = (e)=>{
        const portal = document.querySelector('nextjs-portal');
        if (!portal) return;
        setTheme(e.target.value);
        if (e.target.value === 'system') {
            portal.classList.remove('dark');
            portal.classList.remove('light');
            localStorage.removeItem(_shared.STORAGE_KEY_THEME);
            return;
        }
        if (e.target.value === 'dark') {
            portal.classList.add('dark');
            portal.classList.remove('light');
            localStorage.setItem(_shared.STORAGE_KEY_THEME, 'dark');
        } else {
            portal.classList.remove('dark');
            portal.classList.add('light');
            localStorage.setItem(_shared.STORAGE_KEY_THEME, 'light');
        }
    };
    function handlePositionChange(e) {
        setPosition(e.target.value);
        localStorage.setItem(_shared.STORAGE_KEY_POSITION, e.target.value);
    }
    function handleSizeChange(param) {
        let { target } = param;
        const value = Number(target.value);
        setScale(value);
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_devtoolsinfo.DevToolsInfo, {
        title: "Preferences",
        ...props,
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "preferences-container",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "preference-section",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "preference-header",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                    htmlFor: "theme",
                                    children: "Theme"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                    className: "preference-description",
                                    children: "Select your theme preference."
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)(Select, {
                            id: "theme",
                            name: "theme",
                            prefix: /*#__PURE__*/ (0, _jsxruntime.jsx)(ThemeIcon, {
                                theme: theme
                            }),
                            value: theme,
                            onChange: handleThemeChange,
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                    value: "system",
                                    children: "System"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                    value: "light",
                                    children: "Light"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                    value: "dark",
                                    children: "Dark"
                                })
                            ]
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "preference-section",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "preference-header",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                    htmlFor: "position",
                                    children: "Position"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                    className: "preference-description",
                                    children: "Adjust the placement of your dev tools."
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)(Select, {
                            id: "position",
                            name: "position",
                            value: position,
                            onChange: handlePositionChange,
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                    value: "bottom-left",
                                    children: "Bottom Left"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                    value: "bottom-right",
                                    children: "Bottom Right"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                    value: "top-left",
                                    children: "Top Left"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                    value: "top-right",
                                    children: "Top Right"
                                })
                            ]
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "preference-section",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "preference-header",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                    htmlFor: "size",
                                    children: "Size"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                    className: "preference-description",
                                    children: "Adjust the size of your dev tools."
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)(Select, {
                            id: "size",
                            name: "size",
                            value: scale,
                            onChange: handleSizeChange,
                            children: Object.entries(_preferences.NEXT_DEV_TOOLS_SCALE).map((param)=>{
                                let [key, value] = param;
                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                    value: value,
                                    children: key
                                }, key);
                            })
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "preference-section",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "preference-header",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                    id: "hide-dev-tools",
                                    children: "Hide Dev Tools for this session"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                    className: "preference-description",
                                    children: "Hide Dev Tools until you restart your dev server, or 1 day."
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "preference-control",
                            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                "aria-describedby": "hide-dev-tools",
                                name: "hide-dev-tools",
                                "data-hide-dev-tools": true,
                                className: "action-button",
                                onClick: hide,
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_eyeicon.default, {}),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "Hide"
                                    })
                                ]
                            })
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "preference-section",
                    children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "preference-header",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                children: "Disable Dev Tools for this project"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("p", {
                                className: "preference-description",
                                children: [
                                    "To disable this UI completely, set",
                                    ' ',
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("code", {
                                        className: "dev-tools-info-code",
                                        children: "devIndicators: false"
                                    }),
                                    ' ',
                                    "in your ",
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("code", {
                                        className: "dev-tools-info-code",
                                        children: "next.config"
                                    }),
                                    ' ',
                                    "file."
                                ]
                            })
                        ]
                    })
                })
            ]
        })
    });
}
function Select(param) {
    let { children, prefix, ...props } = param;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "select-button",
        children: [
            prefix,
            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                ...props,
                children: children
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(ChevronDownIcon, {})
        ]
    });
}
function ThemeIcon(param) {
    let { theme } = param;
    switch(theme){
        case 'system':
            return /*#__PURE__*/ (0, _jsxruntime.jsx)(_systemicon.default, {});
        case 'dark':
            return /*#__PURE__*/ (0, _jsxruntime.jsx)(_darkicon.default, {});
        case 'light':
            return /*#__PURE__*/ (0, _jsxruntime.jsx)(_lighticon.default, {});
        default:
            return null;
    }
}
const DEV_TOOLS_INFO_USER_PREFERENCES_STYLES = (0, _css.css)(_templateObject());
function ChevronDownIcon() {
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("svg", {
        width: "16",
        height: "16",
        viewBox: "0 0 16 16",
        "aria-hidden": true,
        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
            fillRule: "evenodd",
            clipRule: "evenodd",
            d: "M14.0607 5.49999L13.5303 6.03032L8.7071 10.8535C8.31658 11.2441 7.68341 11.2441 7.29289 10.8535L2.46966 6.03032L1.93933 5.49999L2.99999 4.43933L3.53032 4.96966L7.99999 9.43933L12.4697 4.96966L13 4.43933L14.0607 5.49999Z",
            fill: "currentColor"
        })
    });
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=user-preferences.js.map