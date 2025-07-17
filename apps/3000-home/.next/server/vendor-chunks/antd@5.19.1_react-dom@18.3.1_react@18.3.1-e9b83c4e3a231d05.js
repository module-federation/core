"use strict";
exports.id = "vendor-chunks/antd@5.19.1_react-dom@18.3.1_react@18.3.1";
exports.ids = ["vendor-chunks/antd@5.19.1_react-dom@18.3.1_react@18.3.1"];
exports.modules = {

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/ContextIsolator.js":
/*!************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/ContextIsolator.js ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _form_context__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../form/context */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/form/context.js");
/* harmony import */ var _space_Compact__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../space/Compact */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/space/Compact.js");
/* __next_internal_client_entry_do_not_use__ default auto */ 


const ContextIsolator = (props)=>{
    const { space, form, children } = props;
    if (children === undefined || children === null) {
        return null;
    }
    let result = children;
    if (form) {
        result = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_form_context__WEBPACK_IMPORTED_MODULE_1__.NoFormStyle, {
            override: true,
            status: true
        }, result);
    }
    if (space) {
        result = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_space_Compact__WEBPACK_IMPORTED_MODULE_2__.NoCompactStyle, null, result);
    }
    return result;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ContextIsolator);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/colors.js":
/*!***************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/colors.js ***!
  \***************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PresetStatusColorTypes: () => (/* binding */ PresetStatusColorTypes),
/* harmony export */   isPresetColor: () => (/* binding */ isPresetColor),
/* harmony export */   isPresetStatusColor: () => (/* binding */ isPresetStatusColor)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/toConsumableArray */ "../../node_modules/.pnpm/@babel+runtime@7.25.6/node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _theme_interface__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../theme/interface */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/interface/index.js");


const inverseColors = _theme_interface__WEBPACK_IMPORTED_MODULE_1__.PresetColors.map((color)=>`${color}-inverse`);
const PresetStatusColorTypes = [
    "success",
    "processing",
    "error",
    "default",
    "warning"
];
/**
 * determine if the color keyword belongs to the `Ant Design` {@link PresetColors}.
 * @param color color to be judged
 * @param includeInverse whether to include reversed colors
 */ function isPresetColor(color) {
    let includeInverse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    if (includeInverse) {
        return [].concat((0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(inverseColors), (0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_theme_interface__WEBPACK_IMPORTED_MODULE_1__.PresetColors)).includes(color);
    }
    return _theme_interface__WEBPACK_IMPORTED_MODULE_1__.PresetColors.includes(color);
}
function isPresetStatusColor(color) {
    return PresetStatusColorTypes.includes(color);
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/hooks/useUniqueMemo.js":
/*!****************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/hooks/useUniqueMemo.js ***!
  \****************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "../../node_modules/.pnpm/@babel+runtime@7.25.6/node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "../../node_modules/.pnpm/@babel+runtime@7.25.6/node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);



const BEAT_LIMIT = 1000 * 60 * 10;
/**
 * A helper class to map keys to values.
 * It supports both primitive keys and object keys.
 */ let ArrayKeyMap = /*#__PURE__*/ function() {
    function ArrayKeyMap() {
        (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, ArrayKeyMap);
        this.map = new Map();
        // Use WeakMap to avoid memory leak
        this.objectIDMap = new WeakMap();
        this.nextID = 0;
        this.lastAccessBeat = new Map();
        // We will clean up the cache when reach the limit
        this.accessBeat = 0;
    }
    return (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(ArrayKeyMap, [
        {
            key: "set",
            value: function set(keys, value) {
                // New set will trigger clear
                this.clear();
                // Set logic
                const compositeKey = this.getCompositeKey(keys);
                this.map.set(compositeKey, value);
                this.lastAccessBeat.set(compositeKey, Date.now());
            }
        },
        {
            key: "get",
            value: function get(keys) {
                const compositeKey = this.getCompositeKey(keys);
                const cache = this.map.get(compositeKey);
                this.lastAccessBeat.set(compositeKey, Date.now());
                this.accessBeat += 1;
                return cache;
            }
        },
        {
            key: "getCompositeKey",
            value: function getCompositeKey(keys) {
                const ids = keys.map((key)=>{
                    if (key && typeof key === "object") {
                        return `obj_${this.getObjectID(key)}`;
                    }
                    return `${typeof key}_${key}`;
                });
                return ids.join("|");
            }
        },
        {
            key: "getObjectID",
            value: function getObjectID(obj) {
                if (this.objectIDMap.has(obj)) {
                    return this.objectIDMap.get(obj);
                }
                const id = this.nextID;
                this.objectIDMap.set(obj, id);
                this.nextID += 1;
                return id;
            }
        },
        {
            key: "clear",
            value: function clear() {
                if (this.accessBeat > 10000) {
                    const now = Date.now();
                    this.lastAccessBeat.forEach((beat, key)=>{
                        if (now - beat > BEAT_LIMIT) {
                            this.map.delete(key);
                            this.lastAccessBeat.delete(key);
                        }
                    });
                    this.accessBeat = 0;
                }
            }
        }
    ]);
}();
const uniqueMap = new ArrayKeyMap();
/**
 * Like `useMemo`, but this hook result will be shared across all instances.
 */ function useUniqueMemo(memoFn, deps) {
    return react__WEBPACK_IMPORTED_MODULE_2___default().useMemo(()=>{
        const cachedValue = uniqueMap.get(deps);
        if (cachedValue) {
            return cachedValue;
        }
        const newValue = memoFn();
        uniqueMap.set(deps, newValue);
        return newValue;
    }, deps);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (useUniqueMemo);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/hooks/useZIndex.js":
/*!************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/hooks/useZIndex.js ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CONTAINER_MAX_OFFSET: () => (/* binding */ CONTAINER_MAX_OFFSET),
/* harmony export */   consumerBaseZIndexOffset: () => (/* binding */ consumerBaseZIndexOffset),
/* harmony export */   containerBaseZIndexOffset: () => (/* binding */ containerBaseZIndexOffset),
/* harmony export */   useZIndex: () => (/* binding */ useZIndex)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _theme_useToken__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../theme/useToken */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/useToken.js");
/* harmony import */ var _warning__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../warning */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/warning.js");
/* harmony import */ var _zindexContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../zindexContext */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/zindexContext.js");




// Z-Index control range
// Container: 1000 + offset 100 (max base + 10 * offset = 2000)
// Popover: offset 50
// Notification: Container Max zIndex + componentOffset
const CONTAINER_OFFSET = 100;
const CONTAINER_OFFSET_MAX_COUNT = 10;
const CONTAINER_MAX_OFFSET = CONTAINER_OFFSET * CONTAINER_OFFSET_MAX_COUNT;
const containerBaseZIndexOffset = {
    Modal: CONTAINER_OFFSET,
    Drawer: CONTAINER_OFFSET,
    Popover: CONTAINER_OFFSET,
    Popconfirm: CONTAINER_OFFSET,
    Tooltip: CONTAINER_OFFSET,
    Tour: CONTAINER_OFFSET
};
const consumerBaseZIndexOffset = {
    SelectLike: 50,
    Dropdown: 50,
    DatePicker: 50,
    Menu: 50,
    ImagePreview: 1
};
function isContainerType(type) {
    return type in containerBaseZIndexOffset;
}
function useZIndex(componentType, customZIndex) {
    const [, token] = (0,_theme_useToken__WEBPACK_IMPORTED_MODULE_1__["default"])();
    const parentZIndex = react__WEBPACK_IMPORTED_MODULE_0___default().useContext(_zindexContext__WEBPACK_IMPORTED_MODULE_2__["default"]);
    const isContainer = isContainerType(componentType);
    let result;
    if (customZIndex !== undefined) {
        result = [
            customZIndex,
            customZIndex
        ];
    } else {
        let zIndex = parentZIndex !== null && parentZIndex !== void 0 ? parentZIndex : 0;
        if (isContainer) {
            zIndex += // Use preset token zIndex by default but not stack when has parent container
            (parentZIndex ? 0 : token.zIndexPopupBase) + // Container offset
            containerBaseZIndexOffset[componentType];
        } else {
            zIndex += consumerBaseZIndexOffset[componentType];
        }
        result = [
            parentZIndex === undefined ? customZIndex : zIndex,
            zIndex
        ];
    }
    if (true) {
        const warning = (0,_warning__WEBPACK_IMPORTED_MODULE_3__.devUseWarning)(componentType);
        const maxZIndex = token.zIndexPopupBase + CONTAINER_MAX_OFFSET;
        const currentZIndex = result[0] || 0;
         true ? warning(customZIndex !== undefined || currentZIndex <= maxZIndex, "usage", "`zIndex` is over design token `zIndexPopupBase` too much. It may cause unexpected override.") : 0;
    }
    return result;
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/isNumeric.js":
/*!******************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/isNumeric.js ***!
  \******************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const isNumeric = (value)=>!isNaN(parseFloat(value)) && isFinite(value);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (isNumeric);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/motion.js":
/*!***************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/motion.js ***!
  \***************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getTransitionName: () => (/* binding */ getTransitionName)
/* harmony export */ });
// ================== Collapse Motion ==================
const getCollapsedHeight = ()=>({
        height: 0,
        opacity: 0
    });
const getRealHeight = (node)=>{
    const { scrollHeight } = node;
    return {
        height: scrollHeight,
        opacity: 1
    };
};
const getCurrentHeight = (node)=>({
        height: node ? node.offsetHeight : 0
    });
const skipOpacityTransition = (_, event)=>(event === null || event === void 0 ? void 0 : event.deadline) === true || event.propertyName === "height";
const initCollapseMotion = function() {
    let rootCls = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "ant";
    return {
        motionName: `${rootCls}-motion-collapse`,
        onAppearStart: getCollapsedHeight,
        onEnterStart: getCollapsedHeight,
        onAppearActive: getRealHeight,
        onEnterActive: getRealHeight,
        onLeaveStart: getCurrentHeight,
        onLeaveActive: getCollapsedHeight,
        onAppearEnd: skipOpacityTransition,
        onEnterEnd: skipOpacityTransition,
        onLeaveEnd: skipOpacityTransition,
        motionDeadline: 500
    };
};
const SelectPlacements = [
    "bottomLeft",
    "bottomRight",
    "topLeft",
    "topRight"
];
const getTransitionName = (rootPrefixCls, motion, transitionName)=>{
    if (transitionName !== undefined) {
        return transitionName;
    }
    return `${rootPrefixCls}-${motion}`;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (initCollapseMotion);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/placements.js":
/*!*******************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/placements.js ***!
  \*******************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getPlacements),
/* harmony export */   getOverflowOptions: () => (/* binding */ getOverflowOptions)
/* harmony export */ });
/* harmony import */ var _style_placementArrow__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../style/placementArrow */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/placementArrow.js");

function getOverflowOptions(placement, arrowOffset, arrowWidth, autoAdjustOverflow) {
    if (autoAdjustOverflow === false) {
        return {
            adjustX: false,
            adjustY: false
        };
    }
    const overflow = autoAdjustOverflow && typeof autoAdjustOverflow === "object" ? autoAdjustOverflow : {};
    const baseOverflow = {};
    switch(placement){
        case "top":
        case "bottom":
            baseOverflow.shiftX = arrowOffset.arrowOffsetHorizontal * 2 + arrowWidth;
            baseOverflow.shiftY = true;
            baseOverflow.adjustY = true;
            break;
        case "left":
        case "right":
            baseOverflow.shiftY = arrowOffset.arrowOffsetVertical * 2 + arrowWidth;
            baseOverflow.shiftX = true;
            baseOverflow.adjustX = true;
            break;
    }
    const mergedOverflow = Object.assign(Object.assign({}, baseOverflow), overflow);
    // Support auto shift
    if (!mergedOverflow.shiftX) {
        mergedOverflow.adjustX = true;
    }
    if (!mergedOverflow.shiftY) {
        mergedOverflow.adjustY = true;
    }
    return mergedOverflow;
}
const PlacementAlignMap = {
    left: {
        points: [
            "cr",
            "cl"
        ]
    },
    right: {
        points: [
            "cl",
            "cr"
        ]
    },
    top: {
        points: [
            "bc",
            "tc"
        ]
    },
    bottom: {
        points: [
            "tc",
            "bc"
        ]
    },
    topLeft: {
        points: [
            "bl",
            "tl"
        ]
    },
    leftTop: {
        points: [
            "tr",
            "tl"
        ]
    },
    topRight: {
        points: [
            "br",
            "tr"
        ]
    },
    rightTop: {
        points: [
            "tl",
            "tr"
        ]
    },
    bottomRight: {
        points: [
            "tr",
            "br"
        ]
    },
    rightBottom: {
        points: [
            "bl",
            "br"
        ]
    },
    bottomLeft: {
        points: [
            "tl",
            "bl"
        ]
    },
    leftBottom: {
        points: [
            "br",
            "bl"
        ]
    }
};
const ArrowCenterPlacementAlignMap = {
    topLeft: {
        points: [
            "bl",
            "tc"
        ]
    },
    leftTop: {
        points: [
            "tr",
            "cl"
        ]
    },
    topRight: {
        points: [
            "br",
            "tc"
        ]
    },
    rightTop: {
        points: [
            "tl",
            "cr"
        ]
    },
    bottomRight: {
        points: [
            "tr",
            "bc"
        ]
    },
    rightBottom: {
        points: [
            "bl",
            "cr"
        ]
    },
    bottomLeft: {
        points: [
            "tl",
            "bc"
        ]
    },
    leftBottom: {
        points: [
            "br",
            "cl"
        ]
    }
};
const DisableAutoArrowList = new Set([
    "topLeft",
    "topRight",
    "bottomLeft",
    "bottomRight",
    "leftTop",
    "leftBottom",
    "rightTop",
    "rightBottom"
]);
function getPlacements(config) {
    const { arrowWidth, autoAdjustOverflow, arrowPointAtCenter, offset, borderRadius, visibleFirst } = config;
    const halfArrowWidth = arrowWidth / 2;
    const placementMap = {};
    Object.keys(PlacementAlignMap).forEach((key)=>{
        const template = arrowPointAtCenter && ArrowCenterPlacementAlignMap[key] || PlacementAlignMap[key];
        const placementInfo = Object.assign(Object.assign({}, template), {
            offset: [
                0,
                0
            ],
            dynamicInset: true
        });
        placementMap[key] = placementInfo;
        // Disable autoArrow since design is fixed position
        if (DisableAutoArrowList.has(key)) {
            placementInfo.autoArrow = false;
        }
        // Static offset
        switch(key){
            case "top":
            case "topLeft":
            case "topRight":
                placementInfo.offset[1] = -halfArrowWidth - offset;
                break;
            case "bottom":
            case "bottomLeft":
            case "bottomRight":
                placementInfo.offset[1] = halfArrowWidth + offset;
                break;
            case "left":
            case "leftTop":
            case "leftBottom":
                placementInfo.offset[0] = -halfArrowWidth - offset;
                break;
            case "right":
            case "rightTop":
            case "rightBottom":
                placementInfo.offset[0] = halfArrowWidth + offset;
                break;
        }
        // Dynamic offset
        const arrowOffset = (0,_style_placementArrow__WEBPACK_IMPORTED_MODULE_0__.getArrowOffsetToken)({
            contentRadius: borderRadius,
            limitVerticalRadius: true
        });
        if (arrowPointAtCenter) {
            switch(key){
                case "topLeft":
                case "bottomLeft":
                    placementInfo.offset[0] = -arrowOffset.arrowOffsetHorizontal - halfArrowWidth;
                    break;
                case "topRight":
                case "bottomRight":
                    placementInfo.offset[0] = arrowOffset.arrowOffsetHorizontal + halfArrowWidth;
                    break;
                case "leftTop":
                case "rightTop":
                    placementInfo.offset[1] = -arrowOffset.arrowOffsetHorizontal - halfArrowWidth;
                    break;
                case "leftBottom":
                case "rightBottom":
                    placementInfo.offset[1] = arrowOffset.arrowOffsetHorizontal + halfArrowWidth;
                    break;
            }
        }
        // Overflow
        placementInfo.overflow = getOverflowOptions(key, arrowOffset, arrowWidth, autoAdjustOverflow);
        // VisibleFirst
        if (visibleFirst) {
            placementInfo.htmlRegion = "visibleFirst";
        }
    });
    return placementMap;
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/reactNode.js":
/*!******************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/reactNode.js ***!
  \******************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cloneElement: () => (/* binding */ cloneElement),
/* harmony export */   isFragment: () => (/* binding */ isFragment),
/* harmony export */   replaceElement: () => (/* binding */ replaceElement)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

function isFragment(child) {
    return child && /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0___default().isValidElement(child) && child.type === (react__WEBPACK_IMPORTED_MODULE_0___default().Fragment);
}
const replaceElement = (element, replacement, props)=>{
    if (!/*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0___default().isValidElement(element)) {
        return replacement;
    }
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0___default().cloneElement(element, typeof props === "function" ? props(element.props || {}) : props);
};
function cloneElement(element, props) {
    return replaceElement(element, element, props);
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/warning.js":
/*!****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/warning.js ***!
  \****************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WarningContext: () => (/* binding */ WarningContext),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   devUseWarning: () => (/* binding */ devUseWarning),
/* harmony export */   noop: () => (/* binding */ noop),
/* harmony export */   resetWarned: () => (/* binding */ resetWarned)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var rc_util_es_warning__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rc-util/es/warning */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/es/warning.js");


function noop() {}
let deprecatedWarnList = null;
function resetWarned() {
    deprecatedWarnList = null;
    (0,rc_util_es_warning__WEBPACK_IMPORTED_MODULE_1__.resetWarned)();
}
// eslint-disable-next-line import/no-mutable-exports
let warning = noop;
if (true) {
    warning = (valid, component, message)=>{
        (0,rc_util_es_warning__WEBPACK_IMPORTED_MODULE_1__["default"])(valid, `[antd: ${component}] ${message}`);
        // StrictMode will inject console which will not throw warning in React 17.
        if (false) {}
    };
}
const WarningContext = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createContext({});
/**
 * This is a hook but we not named as `useWarning`
 * since this is only used in development.
 * We should always wrap this in `if (process.env.NODE_ENV !== 'production')` condition
 */ const devUseWarning =  true ? (component)=>{
    const { strict } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(WarningContext);
    const typeWarning = (valid, type, message)=>{
        if (!valid) {
            if (strict === false && type === "deprecated") {
                const existWarning = deprecatedWarnList;
                if (!deprecatedWarnList) {
                    deprecatedWarnList = {};
                }
                deprecatedWarnList[component] = deprecatedWarnList[component] || [];
                if (!deprecatedWarnList[component].includes(message || "")) {
                    deprecatedWarnList[component].push(message || "");
                }
                // Warning for the first time
                if (!existWarning) {
                    // eslint-disable-next-line no-console
                    console.warn("[antd] There exists deprecated usage in your code:", deprecatedWarnList);
                }
            } else {
                 true ? warning(valid, component, message) : 0;
            }
        }
    };
    typeWarning.deprecated = (valid, oldProp, newProp, message)=>{
        typeWarning(valid, "deprecated", `\`${oldProp}\` is deprecated. Please use \`${newProp}\` instead.${message ? ` ${message}` : ""}`);
    };
    return typeWarning;
} : 0;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (warning);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/zindexContext.js":
/*!**********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/zindexContext.js ***!
  \**********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

const zIndexContext = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0___default().createContext(undefined);
if (true) {
    zIndexContext.displayName = "zIndexContext";
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (zIndexContext);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/calendar/locale/en_US.js":
/*!************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/calendar/locale/en_US.js ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _date_picker_locale_en_US__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../date-picker/locale/en_US */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/date-picker/locale/en_US.js");

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_date_picker_locale_en_US__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/DisabledContext.js":
/*!**********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/DisabledContext.js ***!
  \**********************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DisabledContextProvider: () => (/* binding */ DisabledContextProvider),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* __next_internal_client_entry_do_not_use__ DisabledContextProvider,default auto */ 
const DisabledContext = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createContext(false);
const DisabledContextProvider = (_ref)=>{
    let { children, disabled } = _ref;
    const originDisabled = react__WEBPACK_IMPORTED_MODULE_0__.useContext(DisabledContext);
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(DisabledContext.Provider, {
        value: disabled !== null && disabled !== void 0 ? disabled : originDisabled
    }, children);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DisabledContext);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/MotionWrapper.js":
/*!********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/MotionWrapper.js ***!
  \********************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ MotionWrapper)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var rc_motion__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rc-motion */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/index.js");
/* harmony import */ var _theme_internal__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../theme/internal */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/internal.js");
/* __next_internal_client_entry_do_not_use__ default auto */ 


function MotionWrapper(props) {
    const { children } = props;
    const [, token] = (0,_theme_internal__WEBPACK_IMPORTED_MODULE_2__.useToken)();
    const { motion } = token;
    const needWrapMotionProviderRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(false);
    needWrapMotionProviderRef.current = needWrapMotionProviderRef.current || motion === false;
    if (needWrapMotionProviderRef.current) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(rc_motion__WEBPACK_IMPORTED_MODULE_1__.Provider, {
            motion: motion
        }, children);
    }
    return children;
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/PropWarning.js":
/*!******************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/PropWarning.js ***!
  \******************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _util_warning__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../_util/warning */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/warning.js");
/* __next_internal_client_entry_do_not_use__ default auto */ 

/**
 * Warning for ConfigProviderProps.
 * This will be empty function in production.
 */ const PropWarning = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.memo((_ref)=>{
    let { dropdownMatchSelectWidth } = _ref;
    const warning = (0,_util_warning__WEBPACK_IMPORTED_MODULE_1__.devUseWarning)("ConfigProvider");
    warning.deprecated(dropdownMatchSelectWidth === undefined, "dropdownMatchSelectWidth", "popupMatchSelectWidth");
    return null;
});
if (true) {
    PropWarning.displayName = "PropWarning";
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ( true ? PropWarning : 0);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/SizeContext.js":
/*!******************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/SizeContext.js ***!
  \******************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SizeContextProvider: () => (/* binding */ SizeContextProvider),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* __next_internal_client_entry_do_not_use__ SizeContextProvider,default auto */ 
const SizeContext = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createContext(undefined);
const SizeContextProvider = (_ref)=>{
    let { children, size } = _ref;
    const originSize = react__WEBPACK_IMPORTED_MODULE_0__.useContext(SizeContext);
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(SizeContext.Provider, {
        value: size || originSize
    }, children);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SizeContext);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/context.js":
/*!**************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/context.js ***!
  \**************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConfigConsumer: () => (/* binding */ ConfigConsumer),
/* harmony export */   ConfigContext: () => (/* binding */ ConfigContext),
/* harmony export */   Variants: () => (/* binding */ Variants),
/* harmony export */   defaultIconPrefixCls: () => (/* binding */ defaultIconPrefixCls)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

const defaultIconPrefixCls = "anticon";
const Variants = [
    "outlined",
    "borderless",
    "filled"
];
const defaultGetPrefixCls = (suffixCls, customizePrefixCls)=>{
    if (customizePrefixCls) {
        return customizePrefixCls;
    }
    return suffixCls ? `ant-${suffixCls}` : "ant";
};
// zombieJ: 🚨 Do not pass `defaultRenderEmpty` here since it will cause circular dependency.
const ConfigContext = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createContext({
    // We provide a default function for Context without provider
    getPrefixCls: defaultGetPrefixCls,
    iconPrefixCls: defaultIconPrefixCls
});
const { Consumer: ConfigConsumer } = ConfigContext;


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/cssVariables.js":
/*!*******************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/cssVariables.js ***!
  \*******************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getStyle: () => (/* binding */ getStyle),
/* harmony export */   registerTheme: () => (/* binding */ registerTheme)
/* harmony export */ });
/* harmony import */ var _ant_design_colors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/colors */ "webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?7e98");
/* harmony import */ var _ant_design_colors__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_colors__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ctrl/tinycolor */ "../../node_modules/.pnpm/@ctrl+tinycolor@3.6.1/node_modules/@ctrl/tinycolor/dist/public_api.js");
/* harmony import */ var _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var rc_util_es_Dom_canUseDom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rc-util/es/Dom/canUseDom */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/es/Dom/canUseDom.js");
/* harmony import */ var rc_util_es_Dom_dynamicCSS__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rc-util/es/Dom/dynamicCSS */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/es/Dom/dynamicCSS.js");
/* harmony import */ var _util_warning__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../_util/warning */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/warning.js");
/* eslint-disable import/prefer-default-export, prefer-destructuring */ 




const dynamicStyleMark = `-ant-${Date.now()}-${Math.random()}`;
function getStyle(globalPrefixCls, theme) {
    const variables = {};
    const formatColor = (color, updater)=>{
        let clone = color.clone();
        clone = (updater === null || updater === void 0 ? void 0 : updater(clone)) || clone;
        return clone.toRgbString();
    };
    const fillColor = (colorVal, type)=>{
        const baseColor = new _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_3__.TinyColor(colorVal);
        const colorPalettes = (0,_ant_design_colors__WEBPACK_IMPORTED_MODULE_0__.generate)(baseColor.toRgbString());
        variables[`${type}-color`] = formatColor(baseColor);
        variables[`${type}-color-disabled`] = colorPalettes[1];
        variables[`${type}-color-hover`] = colorPalettes[4];
        variables[`${type}-color-active`] = colorPalettes[6];
        variables[`${type}-color-outline`] = baseColor.clone().setAlpha(0.2).toRgbString();
        variables[`${type}-color-deprecated-bg`] = colorPalettes[0];
        variables[`${type}-color-deprecated-border`] = colorPalettes[2];
    };
    // ================ Primary Color ================
    if (theme.primaryColor) {
        fillColor(theme.primaryColor, "primary");
        const primaryColor = new _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_3__.TinyColor(theme.primaryColor);
        const primaryColors = (0,_ant_design_colors__WEBPACK_IMPORTED_MODULE_0__.generate)(primaryColor.toRgbString());
        // Legacy - We should use semantic naming standard
        primaryColors.forEach((color, index)=>{
            variables[`primary-${index + 1}`] = color;
        });
        // Deprecated
        variables["primary-color-deprecated-l-35"] = formatColor(primaryColor, (c)=>c.lighten(35));
        variables["primary-color-deprecated-l-20"] = formatColor(primaryColor, (c)=>c.lighten(20));
        variables["primary-color-deprecated-t-20"] = formatColor(primaryColor, (c)=>c.tint(20));
        variables["primary-color-deprecated-t-50"] = formatColor(primaryColor, (c)=>c.tint(50));
        variables["primary-color-deprecated-f-12"] = formatColor(primaryColor, (c)=>c.setAlpha(c.getAlpha() * 0.12));
        const primaryActiveColor = new _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_3__.TinyColor(primaryColors[0]);
        variables["primary-color-active-deprecated-f-30"] = formatColor(primaryActiveColor, (c)=>c.setAlpha(c.getAlpha() * 0.3));
        variables["primary-color-active-deprecated-d-02"] = formatColor(primaryActiveColor, (c)=>c.darken(2));
    }
    // ================ Success Color ================
    if (theme.successColor) {
        fillColor(theme.successColor, "success");
    }
    // ================ Warning Color ================
    if (theme.warningColor) {
        fillColor(theme.warningColor, "warning");
    }
    // ================= Error Color =================
    if (theme.errorColor) {
        fillColor(theme.errorColor, "error");
    }
    // ================= Info Color ==================
    if (theme.infoColor) {
        fillColor(theme.infoColor, "info");
    }
    // Convert to css variables
    const cssList = Object.keys(variables).map((key)=>`--${globalPrefixCls}-${key}: ${variables[key]};`);
    return `
  :root {
    ${cssList.join("\n")}
  }
  `.trim();
}
function registerTheme(globalPrefixCls, theme) {
    const style = getStyle(globalPrefixCls, theme);
    if ((0,rc_util_es_Dom_canUseDom__WEBPACK_IMPORTED_MODULE_1__["default"])()) {
        (0,rc_util_es_Dom_dynamicCSS__WEBPACK_IMPORTED_MODULE_2__.updateCSS)(style, `${dynamicStyleMark}-dynamic-theme`);
    } else {
         true ? (0,_util_warning__WEBPACK_IMPORTED_MODULE_4__["default"])(false, "ConfigProvider", "SSR do not support dynamic theme with css variables.") : 0;
    }
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/hooks/useCSSVarCls.js":
/*!*************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/hooks/useCSSVarCls.js ***!
  \*************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _theme_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../theme/internal */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/internal.js");

/**
 * This hook is only for cssVar to add root className for components.
 * If root ClassName is needed, this hook could be refactored with `-root`
 * @param prefixCls
 */ const useCSSVarCls = (prefixCls)=>{
    const [, , , , cssVar] = (0,_theme_internal__WEBPACK_IMPORTED_MODULE_0__.useToken)();
    return cssVar ? `${prefixCls}-css-var` : "";
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (useCSSVarCls);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/hooks/useConfig.js":
/*!**********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/hooks/useConfig.js ***!
  \**********************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _DisabledContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../DisabledContext */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/DisabledContext.js");
/* harmony import */ var _SizeContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../SizeContext */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/SizeContext.js");



function useConfig() {
    const componentDisabled = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(_DisabledContext__WEBPACK_IMPORTED_MODULE_1__["default"]);
    const componentSize = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(_SizeContext__WEBPACK_IMPORTED_MODULE_2__["default"]);
    return {
        componentDisabled,
        componentSize
    };
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (useConfig);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/hooks/useSize.js":
/*!********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/hooks/useSize.js ***!
  \********************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _SizeContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../SizeContext */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/SizeContext.js");


const useSize = (customSize)=>{
    const size = react__WEBPACK_IMPORTED_MODULE_0___default().useContext(_SizeContext__WEBPACK_IMPORTED_MODULE_1__["default"]);
    const mergedSize = react__WEBPACK_IMPORTED_MODULE_0___default().useMemo(()=>{
        if (!customSize) {
            return size;
        }
        if (typeof customSize === "string") {
            return customSize !== null && customSize !== void 0 ? customSize : size;
        }
        if (customSize instanceof Function) {
            return customSize(size);
        }
        return size;
    }, [
        customSize,
        size
    ]);
    return mergedSize;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (useSize);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/hooks/useTheme.js":
/*!*********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/hooks/useTheme.js ***!
  \*********************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ useTheme)
/* harmony export */ });
/* harmony import */ var rc_util_es_hooks_useMemo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rc-util/es/hooks/useMemo */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/es/hooks/useMemo.js");
/* harmony import */ var rc_util_es_isEqual__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rc-util/es/isEqual */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/es/isEqual.js");
/* harmony import */ var _util_warning__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../_util/warning */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/warning.js");
/* harmony import */ var _theme_internal__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../theme/internal */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/internal.js");
/* harmony import */ var _useThemeKey__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./useThemeKey */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/hooks/useThemeKey.js");





function useTheme(theme, parentTheme, config) {
    var _a, _b;
    const warning = (0,_util_warning__WEBPACK_IMPORTED_MODULE_2__.devUseWarning)("ConfigProvider");
    const themeConfig = theme || {};
    const parentThemeConfig = themeConfig.inherit === false || !parentTheme ? Object.assign(Object.assign({}, _theme_internal__WEBPACK_IMPORTED_MODULE_3__.defaultConfig), {
        hashed: (_a = parentTheme === null || parentTheme === void 0 ? void 0 : parentTheme.hashed) !== null && _a !== void 0 ? _a : _theme_internal__WEBPACK_IMPORTED_MODULE_3__.defaultConfig.hashed,
        cssVar: parentTheme === null || parentTheme === void 0 ? void 0 : parentTheme.cssVar
    }) : parentTheme;
    const themeKey = (0,_useThemeKey__WEBPACK_IMPORTED_MODULE_4__["default"])();
    if (true) {
        const cssVarEnabled = themeConfig.cssVar || parentThemeConfig.cssVar;
        const validKey = !!(typeof themeConfig.cssVar === "object" && ((_b = themeConfig.cssVar) === null || _b === void 0 ? void 0 : _b.key) || themeKey);
         true ? warning(!cssVarEnabled || validKey, "breaking", "Missing key in `cssVar` config. Please upgrade to React 18 or set `cssVar.key` manually in each ConfigProvider inside `cssVar` enabled ConfigProvider.") : 0;
    }
    return (0,rc_util_es_hooks_useMemo__WEBPACK_IMPORTED_MODULE_0__["default"])(()=>{
        var _a, _b;
        if (!theme) {
            return parentTheme;
        }
        // Override
        const mergedComponents = Object.assign({}, parentThemeConfig.components);
        Object.keys(theme.components || {}).forEach((componentName)=>{
            mergedComponents[componentName] = Object.assign(Object.assign({}, mergedComponents[componentName]), theme.components[componentName]);
        });
        const cssVarKey = `css-var-${themeKey.replace(/:/g, "")}`;
        const mergedCssVar = ((_a = themeConfig.cssVar) !== null && _a !== void 0 ? _a : parentThemeConfig.cssVar) && Object.assign(Object.assign(Object.assign({
            prefix: config === null || config === void 0 ? void 0 : config.prefixCls
        }, typeof parentThemeConfig.cssVar === "object" ? parentThemeConfig.cssVar : {}), typeof themeConfig.cssVar === "object" ? themeConfig.cssVar : {}), {
            key: typeof themeConfig.cssVar === "object" && ((_b = themeConfig.cssVar) === null || _b === void 0 ? void 0 : _b.key) || cssVarKey
        });
        // Base token
        return Object.assign(Object.assign(Object.assign({}, parentThemeConfig), themeConfig), {
            token: Object.assign(Object.assign({}, parentThemeConfig.token), themeConfig.token),
            components: mergedComponents,
            cssVar: mergedCssVar
        });
    }, [
        themeConfig,
        parentThemeConfig
    ], (prev, next)=>prev.some((prevTheme, index)=>{
            const nextTheme = next[index];
            return !(0,rc_util_es_isEqual__WEBPACK_IMPORTED_MODULE_1__["default"])(prevTheme, nextTheme, true);
        }));
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/hooks/useThemeKey.js":
/*!************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/hooks/useThemeKey.js ***!
  \************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

const fullClone = Object.assign({}, react__WEBPACK_IMPORTED_MODULE_0__);
const { useId } = fullClone;
const useEmptyId = ()=>"";
const useThemeKey = typeof useId === "undefined" ? useEmptyId : useId;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (useThemeKey);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/index.js":
/*!************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/index.js ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConfigConsumer: () => (/* reexport safe */ _context__WEBPACK_IMPORTED_MODULE_5__.ConfigConsumer),
/* harmony export */   ConfigContext: () => (/* reexport safe */ _context__WEBPACK_IMPORTED_MODULE_5__.ConfigContext),
/* harmony export */   Variants: () => (/* reexport safe */ _context__WEBPACK_IMPORTED_MODULE_5__.Variants),
/* harmony export */   configConsumerProps: () => (/* binding */ configConsumerProps),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   defaultIconPrefixCls: () => (/* reexport safe */ _context__WEBPACK_IMPORTED_MODULE_5__.defaultIconPrefixCls),
/* harmony export */   defaultPrefixCls: () => (/* binding */ defaultPrefixCls),
/* harmony export */   globalConfig: () => (/* binding */ globalConfig),
/* harmony export */   warnContext: () => (/* binding */ warnContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_es_components_Context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ant-design/icons/es/components/Context */ "webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context");
/* harmony import */ var _ant_design_icons_es_components_Context__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_ant_design_icons_es_components_Context__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var rc_util_es_hooks_useMemo__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rc-util/es/hooks/useMemo */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/es/hooks/useMemo.js");
/* harmony import */ var rc_util_es_utils_set__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rc-util/es/utils/set */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/es/utils/set.js");
/* harmony import */ var _util_warning__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../_util/warning */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/warning.js");
/* harmony import */ var _form_validateMessagesContext__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../form/validateMessagesContext */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/form/validateMessagesContext.js");
/* harmony import */ var _locale__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../locale */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/locale/index.js");
/* harmony import */ var _locale_context__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../locale/context */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/locale/context.js");
/* harmony import */ var _locale_en_US__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../locale/en_US */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/locale/en_US.js");
/* harmony import */ var _theme_context__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../theme/context */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/context.js");
/* harmony import */ var _theme_themes_seed__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../theme/themes/seed */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/seed.js");
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./context */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/context.js");
/* harmony import */ var _cssVariables__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./cssVariables */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/cssVariables.js");
/* harmony import */ var _DisabledContext__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./DisabledContext */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/DisabledContext.js");
/* harmony import */ var _hooks_useConfig__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./hooks/useConfig */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/hooks/useConfig.js");
/* harmony import */ var _hooks_useTheme__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./hooks/useTheme */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/hooks/useTheme.js");
/* harmony import */ var _MotionWrapper__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./MotionWrapper */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/MotionWrapper.js");
/* harmony import */ var _PropWarning__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./PropWarning */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/PropWarning.js");
/* harmony import */ var _SizeContext__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./SizeContext */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/SizeContext.js");
/* harmony import */ var _style__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./style */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/style/index.js");
/* __next_internal_client_entry_do_not_use__ Variants,warnContext,ConfigConsumer,ConfigContext,defaultIconPrefixCls,configConsumerProps,defaultPrefixCls,globalConfig,default auto */ var __rest = undefined && undefined.__rest || function(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
};






















/**
 * Since too many feedback using static method like `Modal.confirm` not getting theme, we record the
 * theme register info here to help developer get warning info.
 */ let existThemeConfig = false;
const warnContext =  true ? (componentName)=>{
     true ? (0,_util_warning__WEBPACK_IMPORTED_MODULE_6__["default"])(!existThemeConfig, componentName, `Static function can not consume context like dynamic theme. Please use 'App' component instead.`) : 0;
} : /* istanbul ignore next */ 0;

const configConsumerProps = [
    "getTargetContainer",
    "getPopupContainer",
    "rootPrefixCls",
    "getPrefixCls",
    "renderEmpty",
    "csp",
    "autoInsertSpaceInButton",
    "locale"
];
// These props is used by `useContext` directly in sub component
const PASSED_PROPS = [
    "getTargetContainer",
    "getPopupContainer",
    "renderEmpty",
    "input",
    "pagination",
    "form",
    "select",
    "button"
];
const defaultPrefixCls = "ant";
let globalPrefixCls;
let globalIconPrefixCls;
let globalTheme;
let globalHolderRender;
function getGlobalPrefixCls() {
    return globalPrefixCls || defaultPrefixCls;
}
function getGlobalIconPrefixCls() {
    return globalIconPrefixCls || _context__WEBPACK_IMPORTED_MODULE_5__.defaultIconPrefixCls;
}
function isLegacyTheme(theme) {
    return Object.keys(theme).some((key)=>key.endsWith("Color"));
}
const setGlobalConfig = (props)=>{
    const { prefixCls, iconPrefixCls, theme, holderRender } = props;
    if (prefixCls !== undefined) {
        globalPrefixCls = prefixCls;
    }
    if (iconPrefixCls !== undefined) {
        globalIconPrefixCls = iconPrefixCls;
    }
    if ("holderRender" in props) {
        globalHolderRender = holderRender;
    }
    if (theme) {
        if (isLegacyTheme(theme)) {
             true ? (0,_util_warning__WEBPACK_IMPORTED_MODULE_6__["default"])(false, "ConfigProvider", "`config` of css variable theme is not work in v5. Please use new `theme` config instead.") : 0;
            (0,_cssVariables__WEBPACK_IMPORTED_MODULE_7__.registerTheme)(getGlobalPrefixCls(), theme);
        } else {
            globalTheme = theme;
        }
    }
};
const globalConfig = ()=>({
        getPrefixCls: (suffixCls, customizePrefixCls)=>{
            if (customizePrefixCls) {
                return customizePrefixCls;
            }
            return suffixCls ? `${getGlobalPrefixCls()}-${suffixCls}` : getGlobalPrefixCls();
        },
        getIconPrefixCls: getGlobalIconPrefixCls,
        getRootPrefixCls: ()=>{
            // If Global prefixCls provided, use this
            if (globalPrefixCls) {
                return globalPrefixCls;
            }
            // Fallback to default prefixCls
            return getGlobalPrefixCls();
        },
        getTheme: ()=>globalTheme,
        holderRender: globalHolderRender
    });
const ProviderChildren = (props)=>{
    const { children, csp: customCsp, autoInsertSpaceInButton, alert, anchor, form, locale, componentSize, direction, space, virtual, dropdownMatchSelectWidth, popupMatchSelectWidth, popupOverflow, legacyLocale, parentContext, iconPrefixCls: customIconPrefixCls, theme, componentDisabled, segmented, statistic, spin, calendar, carousel, cascader, collapse, typography, checkbox, descriptions, divider, drawer, skeleton, steps, image, layout, list, mentions, modal, progress, result, slider, breadcrumb, menu, pagination, input, textArea, empty, badge, radio, rate, switch: SWITCH, transfer, avatar, message, tag, table, card, tabs, timeline, timePicker, upload, notification, tree, colorPicker, datePicker, rangePicker, flex, wave, dropdown, warning: warningConfig, tour, floatButtonGroup, variant, inputNumber, treeSelect } = props;
    // =================================== Context ===================================
    const getPrefixCls = react__WEBPACK_IMPORTED_MODULE_0__.useCallback((suffixCls, customizePrefixCls)=>{
        const { prefixCls } = props;
        if (customizePrefixCls) {
            return customizePrefixCls;
        }
        const mergedPrefixCls = prefixCls || parentContext.getPrefixCls("");
        return suffixCls ? `${mergedPrefixCls}-${suffixCls}` : mergedPrefixCls;
    }, [
        parentContext.getPrefixCls,
        props.prefixCls
    ]);
    const iconPrefixCls = customIconPrefixCls || parentContext.iconPrefixCls || _context__WEBPACK_IMPORTED_MODULE_5__.defaultIconPrefixCls;
    const csp = customCsp || parentContext.csp;
    (0,_style__WEBPACK_IMPORTED_MODULE_8__["default"])(iconPrefixCls, csp);
    const mergedTheme = (0,_hooks_useTheme__WEBPACK_IMPORTED_MODULE_9__["default"])(theme, parentContext.theme, {
        prefixCls: getPrefixCls("")
    });
    if (true) {
        existThemeConfig = existThemeConfig || !!mergedTheme;
    }
    const baseConfig = {
        csp,
        autoInsertSpaceInButton,
        alert,
        anchor,
        locale: locale || legacyLocale,
        direction,
        space,
        virtual,
        popupMatchSelectWidth: popupMatchSelectWidth !== null && popupMatchSelectWidth !== void 0 ? popupMatchSelectWidth : dropdownMatchSelectWidth,
        popupOverflow,
        getPrefixCls,
        iconPrefixCls,
        theme: mergedTheme,
        segmented,
        statistic,
        spin,
        calendar,
        carousel,
        cascader,
        collapse,
        typography,
        checkbox,
        descriptions,
        divider,
        drawer,
        skeleton,
        steps,
        image,
        input,
        textArea,
        layout,
        list,
        mentions,
        modal,
        progress,
        result,
        slider,
        breadcrumb,
        menu,
        pagination,
        empty,
        badge,
        radio,
        rate,
        switch: SWITCH,
        transfer,
        avatar,
        message,
        tag,
        table,
        card,
        tabs,
        timeline,
        timePicker,
        upload,
        notification,
        tree,
        colorPicker,
        datePicker,
        rangePicker,
        flex,
        wave,
        dropdown,
        warning: warningConfig,
        tour,
        floatButtonGroup,
        variant,
        inputNumber,
        treeSelect
    };
    if (true) {
        const warningFn = (0,_util_warning__WEBPACK_IMPORTED_MODULE_6__.devUseWarning)("ConfigProvider");
        warningFn(!("autoInsertSpaceInButton" in props), "deprecated", "`autoInsertSpaceInButton` is deprecated. Please use `{ button: { autoInsertSpace: boolean }}` instead.");
    }
    const config = Object.assign({}, parentContext);
    Object.keys(baseConfig).forEach((key)=>{
        if (baseConfig[key] !== undefined) {
            config[key] = baseConfig[key];
        }
    });
    // Pass the props used by `useContext` directly with child component.
    // These props should merged into `config`.
    PASSED_PROPS.forEach((propName)=>{
        const propValue = props[propName];
        if (propValue) {
            config[propName] = propValue;
        }
    });
    if (typeof autoInsertSpaceInButton !== "undefined") {
        // merge deprecated api
        config.button = Object.assign({
            autoInsertSpace: autoInsertSpaceInButton
        }, config.button);
    }
    // https://github.com/ant-design/ant-design/issues/27617
    const memoedConfig = (0,rc_util_es_hooks_useMemo__WEBPACK_IMPORTED_MODULE_3__["default"])(()=>config, config, (prevConfig, currentConfig)=>{
        const prevKeys = Object.keys(prevConfig);
        const currentKeys = Object.keys(currentConfig);
        return prevKeys.length !== currentKeys.length || prevKeys.some((key)=>prevConfig[key] !== currentConfig[key]);
    });
    const memoIconContextValue = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>({
            prefixCls: iconPrefixCls,
            csp
        }), [
        iconPrefixCls,
        csp
    ]);
    let childNode = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_PropWarning__WEBPACK_IMPORTED_MODULE_10__["default"], {
        dropdownMatchSelectWidth: dropdownMatchSelectWidth
    }), children);
    const validateMessages = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>{
        var _a, _b, _c, _d;
        return (0,rc_util_es_utils_set__WEBPACK_IMPORTED_MODULE_4__.merge)(((_a = _locale_en_US__WEBPACK_IMPORTED_MODULE_11__["default"].Form) === null || _a === void 0 ? void 0 : _a.defaultValidateMessages) || {}, ((_c = (_b = memoedConfig.locale) === null || _b === void 0 ? void 0 : _b.Form) === null || _c === void 0 ? void 0 : _c.defaultValidateMessages) || {}, ((_d = memoedConfig.form) === null || _d === void 0 ? void 0 : _d.validateMessages) || {}, (form === null || form === void 0 ? void 0 : form.validateMessages) || {});
    }, [
        memoedConfig,
        form === null || form === void 0 ? void 0 : form.validateMessages
    ]);
    if (Object.keys(validateMessages).length > 0) {
        childNode = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_form_validateMessagesContext__WEBPACK_IMPORTED_MODULE_12__["default"].Provider, {
            value: validateMessages
        }, childNode);
    }
    if (locale) {
        childNode = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_locale__WEBPACK_IMPORTED_MODULE_13__["default"], {
            locale: locale,
            _ANT_MARK__: _locale__WEBPACK_IMPORTED_MODULE_13__.ANT_MARK
        }, childNode);
    }
    if (iconPrefixCls || csp) {
        childNode = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement((_ant_design_icons_es_components_Context__WEBPACK_IMPORTED_MODULE_2___default().Provider), {
            value: memoIconContextValue
        }, childNode);
    }
    if (componentSize) {
        childNode = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_SizeContext__WEBPACK_IMPORTED_MODULE_14__.SizeContextProvider, {
            size: componentSize
        }, childNode);
    }
    // =================================== Motion ===================================
    childNode = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_MotionWrapper__WEBPACK_IMPORTED_MODULE_15__["default"], null, childNode);
    // ================================ Dynamic theme ================================
    const memoTheme = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>{
        const _a = mergedTheme || {}, { algorithm, token, components, cssVar } = _a, rest = __rest(_a, [
            "algorithm",
            "token",
            "components",
            "cssVar"
        ]);
        const themeObj = algorithm && (!Array.isArray(algorithm) || algorithm.length > 0) ? (0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__.createTheme)(algorithm) : _theme_context__WEBPACK_IMPORTED_MODULE_16__.defaultTheme;
        const parsedComponents = {};
        Object.entries(components || {}).forEach((_ref)=>{
            let [componentName, componentToken] = _ref;
            const parsedToken = Object.assign({}, componentToken);
            if ("algorithm" in parsedToken) {
                if (parsedToken.algorithm === true) {
                    parsedToken.theme = themeObj;
                } else if (Array.isArray(parsedToken.algorithm) || typeof parsedToken.algorithm === "function") {
                    parsedToken.theme = (0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__.createTheme)(parsedToken.algorithm);
                }
                delete parsedToken.algorithm;
            }
            parsedComponents[componentName] = parsedToken;
        });
        const mergedToken = Object.assign(Object.assign({}, _theme_themes_seed__WEBPACK_IMPORTED_MODULE_17__["default"]), token);
        return Object.assign(Object.assign({}, rest), {
            theme: themeObj,
            token: mergedToken,
            components: parsedComponents,
            override: Object.assign({
                override: mergedToken
            }, parsedComponents),
            cssVar: cssVar
        });
    }, [
        mergedTheme
    ]);
    if (theme) {
        childNode = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_theme_context__WEBPACK_IMPORTED_MODULE_16__.DesignTokenContext.Provider, {
            value: memoTheme
        }, childNode);
    }
    // ================================== Warning ===================================
    if (memoedConfig.warning) {
        childNode = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_util_warning__WEBPACK_IMPORTED_MODULE_6__.WarningContext.Provider, {
            value: memoedConfig.warning
        }, childNode);
    }
    // =================================== Render ===================================
    if (componentDisabled !== undefined) {
        childNode = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_DisabledContext__WEBPACK_IMPORTED_MODULE_18__.DisabledContextProvider, {
            disabled: componentDisabled
        }, childNode);
    }
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context__WEBPACK_IMPORTED_MODULE_5__.ConfigContext.Provider, {
        value: memoedConfig
    }, childNode);
};
const ConfigProvider = (props)=>{
    const context = react__WEBPACK_IMPORTED_MODULE_0__.useContext(_context__WEBPACK_IMPORTED_MODULE_5__.ConfigContext);
    const antLocale = react__WEBPACK_IMPORTED_MODULE_0__.useContext(_locale_context__WEBPACK_IMPORTED_MODULE_19__["default"]);
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(ProviderChildren, Object.assign({
        parentContext: context,
        legacyLocale: antLocale
    }, props));
};
ConfigProvider.ConfigContext = _context__WEBPACK_IMPORTED_MODULE_5__.ConfigContext;
ConfigProvider.SizeContext = _SizeContext__WEBPACK_IMPORTED_MODULE_14__["default"];
ConfigProvider.config = setGlobalConfig;
ConfigProvider.useConfig = _hooks_useConfig__WEBPACK_IMPORTED_MODULE_20__["default"];
Object.defineProperty(ConfigProvider, "SizeContext", {
    get: ()=>{
         true ? (0,_util_warning__WEBPACK_IMPORTED_MODULE_6__["default"])(false, "ConfigProvider", "ConfigProvider.SizeContext is deprecated. Please use `ConfigProvider.useConfig().componentSize` instead.") : 0;
        return _SizeContext__WEBPACK_IMPORTED_MODULE_14__["default"];
    }
});
if (true) {
    ConfigProvider.displayName = "ConfigProvider";
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ConfigProvider);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/style/index.js":
/*!******************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/style/index.js ***!
  \******************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* reexport safe */ _theme_internal__WEBPACK_IMPORTED_MODULE_0__.useResetIconStyle)
/* harmony export */ });
/* harmony import */ var _theme_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../theme/internal */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/internal.js");
// eslint-disable-next-line no-restricted-exports



/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/date-picker/locale/en_US.js":
/*!***************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/date-picker/locale/en_US.js ***!
  \***************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var rc_picker_es_locale_en_US__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rc-picker/es/locale/en_US */ "../../node_modules/.pnpm/rc-picker@4.6.15_dayjs@1.11.13_react-dom@18.3.1_react@18.3.1/node_modules/rc-picker/es/locale/en_US.js");
/* harmony import */ var _time_picker_locale_en_US__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../time-picker/locale/en_US */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/time-picker/locale/en_US.js");


// Merge into a locale object
const locale = {
    lang: Object.assign({
        placeholder: "Select date",
        yearPlaceholder: "Select year",
        quarterPlaceholder: "Select quarter",
        monthPlaceholder: "Select month",
        weekPlaceholder: "Select week",
        rangePlaceholder: [
            "Start date",
            "End date"
        ],
        rangeYearPlaceholder: [
            "Start year",
            "End year"
        ],
        rangeQuarterPlaceholder: [
            "Start quarter",
            "End quarter"
        ],
        rangeMonthPlaceholder: [
            "Start month",
            "End month"
        ],
        rangeWeekPlaceholder: [
            "Start week",
            "End week"
        ]
    }, rc_picker_es_locale_en_US__WEBPACK_IMPORTED_MODULE_0__["default"]),
    timePickerLocale: Object.assign({}, _time_picker_locale_en_US__WEBPACK_IMPORTED_MODULE_1__["default"])
};
// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (locale);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/form/context.js":
/*!***************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/form/context.js ***!
  \***************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FormContext: () => (/* binding */ FormContext),
/* harmony export */   FormItemInputContext: () => (/* binding */ FormItemInputContext),
/* harmony export */   FormItemPrefixContext: () => (/* binding */ FormItemPrefixContext),
/* harmony export */   FormProvider: () => (/* binding */ FormProvider),
/* harmony export */   NoFormStyle: () => (/* binding */ NoFormStyle),
/* harmony export */   NoStyleItemContext: () => (/* binding */ NoStyleItemContext),
/* harmony export */   VariantContext: () => (/* binding */ VariantContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var rc_field_form__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rc-field-form */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/index.js");
/* harmony import */ var rc_util_es_omit__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rc-util/es/omit */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/es/omit.js");
/* __next_internal_client_entry_do_not_use__ FormContext,NoStyleItemContext,FormProvider,FormItemPrefixContext,FormItemInputContext,NoFormStyle,VariantContext auto */ 



const FormContext = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createContext({
    labelAlign: "right",
    vertical: false,
    itemRef: ()=>{}
});
const NoStyleItemContext = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createContext(null);
const FormProvider = (props)=>{
    const providerProps = (0,rc_util_es_omit__WEBPACK_IMPORTED_MODULE_2__["default"])(props, [
        "prefixCls"
    ]);
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(rc_field_form__WEBPACK_IMPORTED_MODULE_1__.FormProvider, Object.assign({}, providerProps));
};
const FormItemPrefixContext = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createContext({
    prefixCls: ""
});
const FormItemInputContext = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createContext({});
if (true) {
    FormItemInputContext.displayName = "FormItemInputContext";
}
const NoFormStyle = (_ref)=>{
    let { children, status, override } = _ref;
    const formItemInputContext = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(FormItemInputContext);
    const newFormItemInputContext = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(()=>{
        const newContext = Object.assign({}, formItemInputContext);
        if (override) {
            delete newContext.isFormItemInput;
        }
        if (status) {
            delete newContext.status;
            delete newContext.hasFeedback;
            delete newContext.feedbackIcon;
        }
        return newContext;
    }, [
        status,
        override,
        formItemInputContext
    ]);
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(FormItemInputContext.Provider, {
        value: newFormItemInputContext
    }, children);
};
const VariantContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(undefined);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/form/validateMessagesContext.js":
/*!*******************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/form/validateMessagesContext.js ***!
  \*******************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* __next_internal_client_entry_do_not_use__ default auto */ 
// ZombieJ: We export single file here since
// ConfigProvider use this which will make loop deps
// to import whole `rc-field-form`
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(undefined));


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/Sider.js":
/*!***************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/Sider.js ***!
  \***************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SiderContext: () => (/* binding */ SiderContext),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ant_design_icons_es_icons_BarsOutlined__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ant-design/icons/es/icons/BarsOutlined */ "webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined");
/* harmony import */ var _ant_design_icons_es_icons_BarsOutlined__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_ant_design_icons_es_icons_BarsOutlined__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_es_icons_LeftOutlined__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ant-design/icons/es/icons/LeftOutlined */ "webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined");
/* harmony import */ var _ant_design_icons_es_icons_LeftOutlined__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_ant_design_icons_es_icons_LeftOutlined__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _ant_design_icons_es_icons_RightOutlined__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons/es/icons/RightOutlined */ "webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined");
/* harmony import */ var _ant_design_icons_es_icons_RightOutlined__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_ant_design_icons_es_icons_RightOutlined__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var rc_util_es_omit__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rc-util/es/omit */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/es/omit.js");
/* harmony import */ var _util_isNumeric__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../_util/isNumeric */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/isNumeric.js");
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../config-provider */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/index.js");
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./context */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/context.js");
/* __next_internal_client_entry_do_not_use__ SiderContext,default auto */ var __rest = undefined && undefined.__rest || function(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
};










const dimensionMaxMap = {
    xs: "479.98px",
    sm: "575.98px",
    md: "767.98px",
    lg: "991.98px",
    xl: "1199.98px",
    xxl: "1599.98px"
};
const SiderContext = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createContext({});
const generateId = (()=>{
    let i = 0;
    return function() {
        let prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        i += 1;
        return `${prefix}${i}`;
    };
})();
const Sider = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, ref)=>{
    const { prefixCls: customizePrefixCls, className, trigger, children, defaultCollapsed = false, theme = "dark", style = {}, collapsible = false, reverseArrow = false, width = 200, collapsedWidth = 80, zeroWidthTriggerStyle, breakpoint, onCollapse, onBreakpoint } = props, otherProps = __rest(props, [
        "prefixCls",
        "className",
        "trigger",
        "children",
        "defaultCollapsed",
        "theme",
        "style",
        "collapsible",
        "reverseArrow",
        "width",
        "collapsedWidth",
        "zeroWidthTriggerStyle",
        "breakpoint",
        "onCollapse",
        "onBreakpoint"
    ]);
    const { siderHook } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(_context__WEBPACK_IMPORTED_MODULE_6__.LayoutContext);
    const [collapsed, setCollapsed] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("collapsed" in props ? props.collapsed : defaultCollapsed);
    const [below, setBelow] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(()=>{
        if ("collapsed" in props) {
            setCollapsed(props.collapsed);
        }
    }, [
        props.collapsed
    ]);
    const handleSetCollapsed = (value, type)=>{
        if (!("collapsed" in props)) {
            setCollapsed(value);
        }
        onCollapse === null || onCollapse === void 0 ? void 0 : onCollapse(value, type);
    };
    // ========================= Responsive =========================
    const responsiveHandlerRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)();
    responsiveHandlerRef.current = (mql)=>{
        setBelow(mql.matches);
        onBreakpoint === null || onBreakpoint === void 0 ? void 0 : onBreakpoint(mql.matches);
        if (collapsed !== mql.matches) {
            handleSetCollapsed(mql.matches, "responsive");
        }
    };
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(()=>{
        function responsiveHandler(mql) {
            return responsiveHandlerRef.current(mql);
        }
        let mql;
        if (false) {}
        return ()=>{
            try {
                mql === null || mql === void 0 ? void 0 : mql.removeEventListener("change", responsiveHandler);
            } catch (error) {
                mql === null || mql === void 0 ? void 0 : mql.removeListener(responsiveHandler);
            }
        };
    }, [
        breakpoint
    ]); // in order to accept dynamic 'breakpoint' property, we need to add 'breakpoint' into dependency array.
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(()=>{
        const uniqueId = generateId("ant-sider-");
        siderHook.addSider(uniqueId);
        return ()=>siderHook.removeSider(uniqueId);
    }, []);
    const toggle = ()=>{
        handleSetCollapsed(!collapsed, "clickTrigger");
    };
    const { getPrefixCls } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(_config_provider__WEBPACK_IMPORTED_MODULE_7__.ConfigContext);
    const renderSider = ()=>{
        const prefixCls = getPrefixCls("layout-sider", customizePrefixCls);
        const divProps = (0,rc_util_es_omit__WEBPACK_IMPORTED_MODULE_5__["default"])(otherProps, [
            "collapsed"
        ]);
        const rawWidth = collapsed ? collapsedWidth : width;
        // use "px" as fallback unit for width
        const siderWidth = (0,_util_isNumeric__WEBPACK_IMPORTED_MODULE_8__["default"])(rawWidth) ? `${rawWidth}px` : String(rawWidth);
        // special trigger when collapsedWidth == 0
        const zeroWidthTrigger = parseFloat(String(collapsedWidth || 0)) === 0 ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", {
            onClick: toggle,
            className: classnames__WEBPACK_IMPORTED_MODULE_4___default()(`${prefixCls}-zero-width-trigger`, `${prefixCls}-zero-width-trigger-${reverseArrow ? "right" : "left"}`),
            style: zeroWidthTriggerStyle
        }, trigger || /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement((_ant_design_icons_es_icons_BarsOutlined__WEBPACK_IMPORTED_MODULE_1___default()), null)) : null;
        const iconObj = {
            expanded: reverseArrow ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement((_ant_design_icons_es_icons_RightOutlined__WEBPACK_IMPORTED_MODULE_3___default()), null) : /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement((_ant_design_icons_es_icons_LeftOutlined__WEBPACK_IMPORTED_MODULE_2___default()), null),
            collapsed: reverseArrow ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement((_ant_design_icons_es_icons_LeftOutlined__WEBPACK_IMPORTED_MODULE_2___default()), null) : /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement((_ant_design_icons_es_icons_RightOutlined__WEBPACK_IMPORTED_MODULE_3___default()), null)
        };
        const status = collapsed ? "collapsed" : "expanded";
        const defaultTrigger = iconObj[status];
        const triggerDom = trigger !== null ? zeroWidthTrigger || /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
            className: `${prefixCls}-trigger`,
            onClick: toggle,
            style: {
                width: siderWidth
            }
        }, trigger || defaultTrigger) : null;
        const divStyle = Object.assign(Object.assign({}, style), {
            flex: `0 0 ${siderWidth}`,
            maxWidth: siderWidth,
            minWidth: siderWidth,
            width: siderWidth
        });
        const siderCls = classnames__WEBPACK_IMPORTED_MODULE_4___default()(prefixCls, `${prefixCls}-${theme}`, {
            [`${prefixCls}-collapsed`]: !!collapsed,
            [`${prefixCls}-has-trigger`]: collapsible && trigger !== null && !zeroWidthTrigger,
            [`${prefixCls}-below`]: !!below,
            [`${prefixCls}-zero-width`]: parseFloat(siderWidth) === 0
        }, className);
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("aside", Object.assign({
            className: siderCls
        }, divProps, {
            style: divStyle,
            ref: ref
        }), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
            className: `${prefixCls}-children`
        }, children), collapsible || below && zeroWidthTrigger ? triggerDom : null);
    };
    const contextValue = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>({
            siderCollapsed: collapsed
        }), [
        collapsed
    ]);
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(SiderContext.Provider, {
        value: contextValue
    }, renderSider());
});
if (true) {
    Sider.displayName = "Sider";
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Sider);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/context.js":
/*!*****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/context.js ***!
  \*****************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LayoutContext: () => (/* binding */ LayoutContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

const LayoutContext = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createContext({
    siderHook: {
        addSider: ()=>null,
        removeSider: ()=>null
    }
});


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/hooks/useHasSider.js":
/*!***************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/hooks/useHasSider.js ***!
  \***************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ useHasSider)
/* harmony export */ });
/* harmony import */ var rc_util_es_Children_toArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rc-util/es/Children/toArray */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/es/Children/toArray.js");
/* harmony import */ var _Sider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Sider */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/Sider.js");


function useHasSider(siders, children, hasSider) {
    if (typeof hasSider === "boolean") {
        return hasSider;
    }
    if (siders.length) {
        return true;
    }
    const childNodes = (0,rc_util_es_Children_toArray__WEBPACK_IMPORTED_MODULE_0__["default"])(children);
    return childNodes.some((node)=>node.type === _Sider__WEBPACK_IMPORTED_MODULE_1__["default"]);
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/index.js":
/*!***************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/index.js ***!
  \***************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./layout */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/layout.js");
/* harmony import */ var _Sider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Sider */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/Sider.js");
/* __next_internal_client_entry_do_not_use__ default auto */ 

const Layout = _layout__WEBPACK_IMPORTED_MODULE_0__["default"];
Layout.Header = _layout__WEBPACK_IMPORTED_MODULE_0__.Header;
Layout.Footer = _layout__WEBPACK_IMPORTED_MODULE_0__.Footer;
Layout.Content = _layout__WEBPACK_IMPORTED_MODULE_0__.Content;
Layout.Sider = _Sider__WEBPACK_IMPORTED_MODULE_1__["default"];
Layout._InternalSiderContext = _Sider__WEBPACK_IMPORTED_MODULE_1__.SiderContext;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Layout);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/layout.js":
/*!****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/layout.js ***!
  \****************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Content: () => (/* binding */ Content),
/* harmony export */   Footer: () => (/* binding */ Footer),
/* harmony export */   Header: () => (/* binding */ Header),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/toConsumableArray */ "../../node_modules/.pnpm/@babel+runtime@7.25.6/node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var rc_util_es_omit__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rc-util/es/omit */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/es/omit.js");
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../config-provider */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/index.js");
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./context */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/context.js");
/* harmony import */ var _hooks_useHasSider__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./hooks/useHasSider */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/hooks/useHasSider.js");
/* harmony import */ var _style__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./style */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/style/index.js");
/* __next_internal_client_entry_do_not_use__ Content,Footer,Header,default auto */ 
var __rest = undefined && undefined.__rest || function(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
};







function generator(_ref) {
    let { suffixCls, tagName, displayName } = _ref;
    return (BasicComponent)=>{
        const Adapter = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1__.forwardRef((props, ref)=>/*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1__.createElement(BasicComponent, Object.assign({
                ref: ref,
                suffixCls: suffixCls,
                tagName: tagName
            }, props)));
        if (true) {
            Adapter.displayName = displayName;
        }
        return Adapter;
    };
}
const Basic = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1__.forwardRef((props, ref)=>{
    const { prefixCls: customizePrefixCls, suffixCls, className, tagName: TagName } = props, others = __rest(props, [
        "prefixCls",
        "suffixCls",
        "className",
        "tagName"
    ]);
    const { getPrefixCls } = react__WEBPACK_IMPORTED_MODULE_1__.useContext(_config_provider__WEBPACK_IMPORTED_MODULE_4__.ConfigContext);
    const prefixCls = getPrefixCls("layout", customizePrefixCls);
    const [wrapSSR, hashId, cssVarCls] = (0,_style__WEBPACK_IMPORTED_MODULE_5__["default"])(prefixCls);
    const prefixWithSuffixCls = suffixCls ? `${prefixCls}-${suffixCls}` : prefixCls;
    return wrapSSR(/*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1__.createElement(TagName, Object.assign({
        className: classnames__WEBPACK_IMPORTED_MODULE_2___default()(customizePrefixCls || prefixWithSuffixCls, className, hashId, cssVarCls),
        ref: ref
    }, others)));
});
const BasicLayout = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1__.forwardRef((props, ref)=>{
    const { direction } = react__WEBPACK_IMPORTED_MODULE_1__.useContext(_config_provider__WEBPACK_IMPORTED_MODULE_4__.ConfigContext);
    const [siders, setSiders] = react__WEBPACK_IMPORTED_MODULE_1__.useState([]);
    const { prefixCls: customizePrefixCls, className, rootClassName, children, hasSider, tagName: Tag, style } = props, others = __rest(props, [
        "prefixCls",
        "className",
        "rootClassName",
        "children",
        "hasSider",
        "tagName",
        "style"
    ]);
    const passedProps = (0,rc_util_es_omit__WEBPACK_IMPORTED_MODULE_3__["default"])(others, [
        "suffixCls"
    ]);
    const { getPrefixCls, layout } = react__WEBPACK_IMPORTED_MODULE_1__.useContext(_config_provider__WEBPACK_IMPORTED_MODULE_4__.ConfigContext);
    const prefixCls = getPrefixCls("layout", customizePrefixCls);
    const mergedHasSider = (0,_hooks_useHasSider__WEBPACK_IMPORTED_MODULE_6__["default"])(siders, children, hasSider);
    const [wrapCSSVar, hashId, cssVarCls] = (0,_style__WEBPACK_IMPORTED_MODULE_5__["default"])(prefixCls);
    const classString = classnames__WEBPACK_IMPORTED_MODULE_2___default()(prefixCls, {
        [`${prefixCls}-has-sider`]: mergedHasSider,
        [`${prefixCls}-rtl`]: direction === "rtl"
    }, layout === null || layout === void 0 ? void 0 : layout.className, className, rootClassName, hashId, cssVarCls);
    const contextValue = react__WEBPACK_IMPORTED_MODULE_1__.useMemo(()=>({
            siderHook: {
                addSider: (id)=>{
                    setSiders((prev)=>[].concat((0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(prev), [
                            id
                        ]));
                },
                removeSider: (id)=>{
                    setSiders((prev)=>prev.filter((currentId)=>currentId !== id));
                }
            }
        }), []);
    return wrapCSSVar(/*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1__.createElement(_context__WEBPACK_IMPORTED_MODULE_7__.LayoutContext.Provider, {
        value: contextValue
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1__.createElement(Tag, Object.assign({
        ref: ref,
        className: classString,
        style: Object.assign(Object.assign({}, layout === null || layout === void 0 ? void 0 : layout.style), style)
    }, passedProps), children)));
});
const Layout = generator({
    tagName: "div",
    displayName: "Layout"
})(BasicLayout);
const Header = generator({
    suffixCls: "header",
    tagName: "header",
    displayName: "Header"
})(Basic);
const Footer = generator({
    suffixCls: "footer",
    tagName: "footer",
    displayName: "Footer"
})(Basic);
const Content = generator({
    suffixCls: "content",
    tagName: "main",
    displayName: "Content"
})(Basic);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Layout);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/style/index.js":
/*!*********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/style/index.js ***!
  \*********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   prepareComponentToken: () => (/* binding */ prepareComponentToken)
/* harmony export */ });
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _theme_internal__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../theme/internal */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/internal.js");
/* harmony import */ var _light__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./light */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/style/light.js");



const genLayoutStyle = (token)=>{
    const { antCls, // .ant
    componentCls, // .ant-layout
    colorText, triggerColor, footerBg, triggerBg, headerHeight, headerPadding, headerColor, footerPadding, triggerHeight, zeroTriggerHeight, zeroTriggerWidth, motionDurationMid, motionDurationSlow, fontSize, borderRadius, bodyBg, headerBg, siderBg } = token;
    return {
        [componentCls]: Object.assign(Object.assign({
            display: "flex",
            flex: "auto",
            flexDirection: "column",
            /* fix firefox can't set height smaller than content on flex item */ minHeight: 0,
            background: bodyBg,
            "&, *": {
                boxSizing: "border-box"
            },
            [`&${componentCls}-has-sider`]: {
                flexDirection: "row",
                [`> ${componentCls}, > ${componentCls}-content`]: {
                    // https://segmentfault.com/a/1190000019498300
                    width: 0
                }
            },
            [`${componentCls}-header, &${componentCls}-footer`]: {
                flex: "0 0 auto"
            },
            [`${componentCls}-sider`]: {
                position: "relative",
                // fix firefox can't set width smaller than content on flex item
                minWidth: 0,
                background: siderBg,
                transition: `all ${motionDurationMid}, background 0s`,
                "&-children": {
                    height: "100%",
                    // Hack for fixing margin collapse bug
                    // https://github.com/ant-design/ant-design/issues/7967
                    // solution from https://stackoverflow.com/a/33132624/3040605
                    marginTop: -0.1,
                    paddingTop: 0.1,
                    [`${antCls}-menu${antCls}-menu-inline-collapsed`]: {
                        width: "auto"
                    }
                },
                "&-has-trigger": {
                    paddingBottom: triggerHeight
                },
                "&-right": {
                    order: 1
                },
                "&-trigger": {
                    position: "fixed",
                    bottom: 0,
                    zIndex: 1,
                    height: triggerHeight,
                    color: triggerColor,
                    lineHeight: (0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(triggerHeight),
                    textAlign: "center",
                    background: triggerBg,
                    cursor: "pointer",
                    transition: `all ${motionDurationMid}`
                },
                "&-zero-width": {
                    "> *": {
                        overflow: "hidden"
                    },
                    "&-trigger": {
                        position: "absolute",
                        top: headerHeight,
                        insetInlineEnd: token.calc(zeroTriggerWidth).mul(-1).equal(),
                        zIndex: 1,
                        width: zeroTriggerWidth,
                        height: zeroTriggerHeight,
                        color: triggerColor,
                        fontSize: token.fontSizeXL,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: siderBg,
                        borderStartStartRadius: 0,
                        borderStartEndRadius: borderRadius,
                        borderEndEndRadius: borderRadius,
                        borderEndStartRadius: 0,
                        cursor: "pointer",
                        transition: `background ${motionDurationSlow} ease`,
                        "&::after": {
                            position: "absolute",
                            inset: 0,
                            background: "transparent",
                            transition: `all ${motionDurationSlow}`,
                            content: '""'
                        },
                        "&:hover::after": {
                            background: `rgba(255, 255, 255, 0.2)`
                        },
                        "&-right": {
                            insetInlineStart: token.calc(zeroTriggerWidth).mul(-1).equal(),
                            borderStartStartRadius: borderRadius,
                            borderStartEndRadius: 0,
                            borderEndEndRadius: 0,
                            borderEndStartRadius: borderRadius
                        }
                    }
                }
            }
        }, (0,_light__WEBPACK_IMPORTED_MODULE_1__["default"])(token)), {
            // RTL
            "&-rtl": {
                direction: "rtl"
            }
        }),
        // ==================== Header ====================
        [`${componentCls}-header`]: {
            height: headerHeight,
            padding: headerPadding,
            color: headerColor,
            lineHeight: (0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(headerHeight),
            background: headerBg,
            // Other components/menu/style/index.less line:686
            // Integration with header element so menu items have the same height
            [`${antCls}-menu`]: {
                lineHeight: "inherit"
            }
        },
        // ==================== Footer ====================
        [`${componentCls}-footer`]: {
            padding: footerPadding,
            color: colorText,
            fontSize,
            background: footerBg
        },
        // =================== Content ====================
        [`${componentCls}-content`]: {
            flex: "auto",
            color: colorText,
            // fix firefox can't set height smaller than content on flex item
            minHeight: 0
        }
    };
};
const prepareComponentToken = (token)=>{
    const { colorBgLayout, controlHeight, controlHeightLG, colorText, controlHeightSM, marginXXS, colorTextLightSolid, colorBgContainer } = token;
    const paddingInline = controlHeightLG * 1.25;
    return {
        // Deprecated
        colorBgHeader: "#001529",
        colorBgBody: colorBgLayout,
        colorBgTrigger: "#002140",
        bodyBg: colorBgLayout,
        headerBg: "#001529",
        headerHeight: controlHeight * 2,
        headerPadding: `0 ${paddingInline}px`,
        headerColor: colorText,
        footerPadding: `${controlHeightSM}px ${paddingInline}px`,
        footerBg: colorBgLayout,
        siderBg: "#001529",
        triggerHeight: controlHeightLG + marginXXS * 2,
        triggerBg: "#002140",
        triggerColor: colorTextLightSolid,
        zeroTriggerWidth: controlHeightLG,
        zeroTriggerHeight: controlHeightLG,
        lightSiderBg: colorBgContainer,
        lightTriggerBg: colorBgContainer,
        lightTriggerColor: colorText
    };
};
// ============================== Export ==============================
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_theme_internal__WEBPACK_IMPORTED_MODULE_2__.genStyleHooks)("Layout", (token)=>[
        genLayoutStyle(token)
    ], prepareComponentToken, {
    deprecatedTokens: [
        [
            "colorBgBody",
            "bodyBg"
        ],
        [
            "colorBgHeader",
            "headerBg"
        ],
        [
            "colorBgTrigger",
            "triggerBg"
        ]
    ]
}));


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/style/light.js":
/*!*********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/style/light.js ***!
  \*********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const genLayoutLightStyle = (token)=>{
    const { componentCls, bodyBg, lightSiderBg, lightTriggerBg, lightTriggerColor } = token;
    return {
        [`${componentCls}-sider-light`]: {
            background: lightSiderBg,
            [`${componentCls}-sider-trigger`]: {
                color: lightTriggerColor,
                background: lightTriggerBg
            },
            [`${componentCls}-sider-zero-width-trigger`]: {
                color: lightTriggerColor,
                background: lightTriggerBg,
                border: `1px solid ${bodyBg}`,
                // Safe to modify to any other color
                borderInlineStart: 0
            }
        }
    };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (genLayoutLightStyle);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/locale/context.js":
/*!*****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/locale/context.js ***!
  \*****************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

const LocaleContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(undefined);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LocaleContext);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/locale/en_US.js":
/*!***************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/locale/en_US.js ***!
  \***************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var rc_pagination_es_locale_en_US__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rc-pagination/es/locale/en_US */ "../../node_modules/.pnpm/rc-pagination@4.2.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-pagination/es/locale/en_US.js");
/* harmony import */ var _calendar_locale_en_US__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../calendar/locale/en_US */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/calendar/locale/en_US.js");
/* harmony import */ var _date_picker_locale_en_US__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../date-picker/locale/en_US */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/date-picker/locale/en_US.js");
/* harmony import */ var _time_picker_locale_en_US__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../time-picker/locale/en_US */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/time-picker/locale/en_US.js");
/* eslint-disable no-template-curly-in-string */ 



const typeTemplate = "${label} is not a valid ${type}";
const localeValues = {
    locale: "en",
    Pagination: rc_pagination_es_locale_en_US__WEBPACK_IMPORTED_MODULE_0__["default"],
    DatePicker: _date_picker_locale_en_US__WEBPACK_IMPORTED_MODULE_1__["default"],
    TimePicker: _time_picker_locale_en_US__WEBPACK_IMPORTED_MODULE_2__["default"],
    Calendar: _calendar_locale_en_US__WEBPACK_IMPORTED_MODULE_3__["default"],
    global: {
        placeholder: "Please select"
    },
    Table: {
        filterTitle: "Filter menu",
        filterConfirm: "OK",
        filterReset: "Reset",
        filterEmptyText: "No filters",
        filterCheckall: "Select all items",
        filterSearchPlaceholder: "Search in filters",
        emptyText: "No data",
        selectAll: "Select current page",
        selectInvert: "Invert current page",
        selectNone: "Clear all data",
        selectionAll: "Select all data",
        sortTitle: "Sort",
        expand: "Expand row",
        collapse: "Collapse row",
        triggerDesc: "Click to sort descending",
        triggerAsc: "Click to sort ascending",
        cancelSort: "Click to cancel sorting"
    },
    Tour: {
        Next: "Next",
        Previous: "Previous",
        Finish: "Finish"
    },
    Modal: {
        okText: "OK",
        cancelText: "Cancel",
        justOkText: "OK"
    },
    Popconfirm: {
        okText: "OK",
        cancelText: "Cancel"
    },
    Transfer: {
        titles: [
            "",
            ""
        ],
        searchPlaceholder: "Search here",
        itemUnit: "item",
        itemsUnit: "items",
        remove: "Remove",
        selectCurrent: "Select current page",
        removeCurrent: "Remove current page",
        selectAll: "Select all data",
        deselectAll: "Deselect all data",
        removeAll: "Remove all data",
        selectInvert: "Invert current page"
    },
    Upload: {
        uploading: "Uploading...",
        removeFile: "Remove file",
        uploadError: "Upload error",
        previewFile: "Preview file",
        downloadFile: "Download file"
    },
    Empty: {
        description: "No data"
    },
    Icon: {
        icon: "icon"
    },
    Text: {
        edit: "Edit",
        copy: "Copy",
        copied: "Copied",
        expand: "Expand",
        collapse: "Collapse"
    },
    Form: {
        optional: "(optional)",
        defaultValidateMessages: {
            default: "Field validation error for ${label}",
            required: "Please enter ${label}",
            enum: "${label} must be one of [${enum}]",
            whitespace: "${label} cannot be a blank character",
            date: {
                format: "${label} date format is invalid",
                parse: "${label} cannot be converted to a date",
                invalid: "${label} is an invalid date"
            },
            types: {
                string: typeTemplate,
                method: typeTemplate,
                array: typeTemplate,
                object: typeTemplate,
                number: typeTemplate,
                date: typeTemplate,
                boolean: typeTemplate,
                integer: typeTemplate,
                float: typeTemplate,
                regexp: typeTemplate,
                email: typeTemplate,
                url: typeTemplate,
                hex: typeTemplate
            },
            string: {
                len: "${label} must be ${len} characters",
                min: "${label} must be at least ${min} characters",
                max: "${label} must be up to ${max} characters",
                range: "${label} must be between ${min}-${max} characters"
            },
            number: {
                len: "${label} must be equal to ${len}",
                min: "${label} must be minimum ${min}",
                max: "${label} must be maximum ${max}",
                range: "${label} must be between ${min}-${max}"
            },
            array: {
                len: "Must be ${len} ${label}",
                min: "At least ${min} ${label}",
                max: "At most ${max} ${label}",
                range: "The amount of ${label} must be between ${min}-${max}"
            },
            pattern: {
                mismatch: "${label} does not match the pattern ${pattern}"
            }
        }
    },
    Image: {
        preview: "Preview"
    },
    QRCode: {
        expired: "QR code expired",
        refresh: "Refresh",
        scanned: "Scanned"
    },
    ColorPicker: {
        presetEmpty: "Empty"
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (localeValues);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/locale/index.js":
/*!***************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/locale/index.js ***!
  \***************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ANT_MARK: () => (/* binding */ ANT_MARK),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   useLocale: () => (/* reexport safe */ _useLocale__WEBPACK_IMPORTED_MODULE_1__["default"])
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _util_warning__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../_util/warning */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/warning.js");
/* harmony import */ var _modal_locale__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../modal/locale */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/modal/locale.js");
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./context */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/locale/context.js");
/* harmony import */ var _useLocale__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./useLocale */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/locale/useLocale.js");
/* __next_internal_client_entry_do_not_use__ useLocale,ANT_MARK,default auto */ 




const ANT_MARK = "internalMark";
const LocaleProvider = (props)=>{
    const { locale = {}, children, _ANT_MARK__ } = props;
    if (true) {
        const warning = (0,_util_warning__WEBPACK_IMPORTED_MODULE_2__.devUseWarning)("LocaleProvider");
         true ? warning(_ANT_MARK__ === ANT_MARK, "deprecated", "`LocaleProvider` is deprecated. Please use `locale` with `ConfigProvider` instead: http://u.ant.design/locale") : 0;
    }
    react__WEBPACK_IMPORTED_MODULE_0__.useEffect(()=>{
        const clearLocale = (0,_modal_locale__WEBPACK_IMPORTED_MODULE_3__.changeConfirmLocale)(locale === null || locale === void 0 ? void 0 : locale.Modal);
        return clearLocale;
    }, [
        locale
    ]);
    const getMemoizedContextValue = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>Object.assign(Object.assign({}, locale), {
            exist: true
        }), [
        locale
    ]);
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context__WEBPACK_IMPORTED_MODULE_4__["default"].Provider, {
        value: getMemoizedContextValue
    }, children);
};
if (true) {
    LocaleProvider.displayName = "LocaleProvider";
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LocaleProvider);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/locale/useLocale.js":
/*!*******************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/locale/useLocale.js ***!
  \*******************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./context */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/locale/context.js");
/* harmony import */ var _en_US__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./en_US */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/locale/en_US.js");



const useLocale = (componentName, defaultLocale)=>{
    const fullLocale = react__WEBPACK_IMPORTED_MODULE_0__.useContext(_context__WEBPACK_IMPORTED_MODULE_1__["default"]);
    const getLocale = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>{
        var _a;
        const locale = defaultLocale || _en_US__WEBPACK_IMPORTED_MODULE_2__["default"][componentName];
        const localeFromContext = (_a = fullLocale === null || fullLocale === void 0 ? void 0 : fullLocale[componentName]) !== null && _a !== void 0 ? _a : {};
        return Object.assign(Object.assign({}, typeof locale === "function" ? locale() : locale), localeFromContext || {});
    }, [
        componentName,
        defaultLocale,
        fullLocale
    ]);
    const getLocaleCode = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>{
        const localeCode = fullLocale === null || fullLocale === void 0 ? void 0 : fullLocale.locale;
        // Had use LocaleProvide but didn't set locale
        if ((fullLocale === null || fullLocale === void 0 ? void 0 : fullLocale.exist) && !localeCode) {
            return _en_US__WEBPACK_IMPORTED_MODULE_2__["default"].locale;
        }
        return localeCode;
    }, [
        fullLocale
    ]);
    return [
        getLocale,
        getLocaleCode
    ];
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (useLocale);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/MenuContext.js":
/*!*******************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/MenuContext.js ***!
  \*******************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* __next_internal_client_entry_do_not_use__ default auto */ 
const MenuContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)({
    prefixCls: "",
    firstLevel: true,
    inlineCollapsed: false
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MenuContext);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/MenuDivider.js":
/*!*******************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/MenuDivider.js ***!
  \*******************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var rc_menu__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rc-menu */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/index.js");
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../config-provider */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/index.js");
/* __next_internal_client_entry_do_not_use__ default auto */ var __rest = undefined && undefined.__rest || function(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
};




const MenuDivider = (props)=>{
    const { prefixCls: customizePrefixCls, className, dashed } = props, restProps = __rest(props, [
        "prefixCls",
        "className",
        "dashed"
    ]);
    const { getPrefixCls } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(_config_provider__WEBPACK_IMPORTED_MODULE_3__.ConfigContext);
    const prefixCls = getPrefixCls("menu", customizePrefixCls);
    const classString = classnames__WEBPACK_IMPORTED_MODULE_1___default()({
        [`${prefixCls}-item-divider-dashed`]: !!dashed
    }, className);
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(rc_menu__WEBPACK_IMPORTED_MODULE_2__.Divider, Object.assign({
        className: classString
    }, restProps));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MenuDivider);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/MenuItem.js":
/*!****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/MenuItem.js ***!
  \****************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var rc_menu__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rc-menu */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/index.js");
/* harmony import */ var rc_util_es_Children_toArray__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rc-util/es/Children/toArray */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/es/Children/toArray.js");
/* harmony import */ var rc_util_es_omit__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rc-util/es/omit */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/es/omit.js");
/* harmony import */ var _util_reactNode__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../_util/reactNode */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/reactNode.js");
/* harmony import */ var _layout_Sider__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../layout/Sider */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/Sider.js");
/* harmony import */ var _tooltip__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../tooltip */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/tooltip/index.js");
/* harmony import */ var _MenuContext__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./MenuContext */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/MenuContext.js");
/* __next_internal_client_entry_do_not_use__ default auto */ 








const MenuItem = (props)=>{
    var _a;
    const { className, children, icon, title, danger } = props;
    const { prefixCls, firstLevel, direction, disableMenuItemTitleTooltip, inlineCollapsed: isInlineCollapsed } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(_MenuContext__WEBPACK_IMPORTED_MODULE_5__["default"]);
    const renderItemChildren = (inlineCollapsed)=>{
        const wrapNode = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", {
            className: `${prefixCls}-title-content`
        }, children);
        // inline-collapsed.md demo 依赖 span 来隐藏文字,有 icon 属性，则内部包裹一个 span
        // ref: https://github.com/ant-design/ant-design/pull/23456
        if (!icon || /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(children) && children.type === "span") {
            if (children && inlineCollapsed && firstLevel && typeof children === "string") {
                return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
                    className: `${prefixCls}-inline-collapsed-noicon`
                }, children.charAt(0));
            }
        }
        return wrapNode;
    };
    const { siderCollapsed } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(_layout_Sider__WEBPACK_IMPORTED_MODULE_6__.SiderContext);
    let tooltipTitle = title;
    if (typeof title === "undefined") {
        tooltipTitle = firstLevel ? children : "";
    } else if (title === false) {
        tooltipTitle = "";
    }
    const tooltipProps = {
        title: tooltipTitle
    };
    if (!siderCollapsed && !isInlineCollapsed) {
        tooltipProps.title = null;
        // Reset `open` to fix control mode tooltip display not correct
        // ref: https://github.com/ant-design/ant-design/issues/16742
        tooltipProps.open = false;
    }
    const childrenLength = (0,rc_util_es_Children_toArray__WEBPACK_IMPORTED_MODULE_3__["default"])(children).length;
    let returnNode = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(rc_menu__WEBPACK_IMPORTED_MODULE_2__.Item, Object.assign({}, (0,rc_util_es_omit__WEBPACK_IMPORTED_MODULE_4__["default"])(props, [
        "title",
        "icon",
        "danger"
    ]), {
        className: classnames__WEBPACK_IMPORTED_MODULE_1___default()({
            [`${prefixCls}-item-danger`]: danger,
            [`${prefixCls}-item-only-child`]: (icon ? childrenLength + 1 : childrenLength) === 1
        }, className),
        title: typeof title === "string" ? title : undefined
    }), (0,_util_reactNode__WEBPACK_IMPORTED_MODULE_7__.cloneElement)(icon, {
        className: classnames__WEBPACK_IMPORTED_MODULE_1___default()(/*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(icon) ? (_a = icon.props) === null || _a === void 0 ? void 0 : _a.className : "", `${prefixCls}-item-icon`)
    }), renderItemChildren(isInlineCollapsed));
    if (!disableMenuItemTitleTooltip) {
        returnNode = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_tooltip__WEBPACK_IMPORTED_MODULE_8__["default"], Object.assign({}, tooltipProps, {
            placement: direction === "rtl" ? "left" : "right",
            overlayClassName: `${prefixCls}-inline-collapsed-tooltip`
        }), returnNode);
    }
    return returnNode;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MenuItem);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/OverrideContext.js":
/*!***********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/OverrideContext.js ***!
  \***********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   OverrideProvider: () => (/* binding */ OverrideProvider),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var rc_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rc-util */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/index.js");
/* harmony import */ var _util_ContextIsolator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../_util/ContextIsolator */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/ContextIsolator.js");
/* __next_internal_client_entry_do_not_use__ OverrideProvider,default auto */ var __rest = undefined && undefined.__rest || function(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
};



const OverrideContext = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createContext(null);
/** @internal Only used for Dropdown component. Do not use this in your production. */ const OverrideProvider = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, ref)=>{
    const { children } = props, restProps = __rest(props, [
        "children"
    ]);
    const override = react__WEBPACK_IMPORTED_MODULE_0__.useContext(OverrideContext);
    const context = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>Object.assign(Object.assign({}, override), restProps), [
        override,
        restProps.prefixCls,
        // restProps.expandIcon, Not mark as deps since this is a ReactNode
        restProps.mode,
        restProps.selectable,
        restProps.rootClassName
    ]);
    const canRef = (0,rc_util__WEBPACK_IMPORTED_MODULE_1__.supportNodeRef)(children);
    const mergedRef = (0,rc_util__WEBPACK_IMPORTED_MODULE_1__.useComposeRef)(ref, canRef ? children.ref : null);
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(OverrideContext.Provider, {
        value: context
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_util_ContextIsolator__WEBPACK_IMPORTED_MODULE_2__["default"], {
        space: true
    }, canRef ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(children, {
        ref: mergedRef
    }) : children));
});
/** @internal Only used for Dropdown component. Do not use this in your production. */ /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (OverrideContext);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/SubMenu.js":
/*!***************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/SubMenu.js ***!
  \***************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var rc_menu__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rc-menu */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/index.js");
/* harmony import */ var rc_util_es_omit__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rc-util/es/omit */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/es/omit.js");
/* harmony import */ var _util_hooks_useZIndex__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../_util/hooks/useZIndex */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/hooks/useZIndex.js");
/* harmony import */ var _util_reactNode__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../_util/reactNode */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/reactNode.js");
/* harmony import */ var _MenuContext__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./MenuContext */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/MenuContext.js");
/* __next_internal_client_entry_do_not_use__ default auto */ 






const SubMenu = (props)=>{
    var _a;
    const { popupClassName, icon, title, theme: customTheme } = props;
    const context = react__WEBPACK_IMPORTED_MODULE_0__.useContext(_MenuContext__WEBPACK_IMPORTED_MODULE_4__["default"]);
    const { prefixCls, inlineCollapsed, theme: contextTheme } = context;
    const parentPath = (0,rc_menu__WEBPACK_IMPORTED_MODULE_2__.useFullPath)();
    let titleNode;
    if (!icon) {
        titleNode = inlineCollapsed && !parentPath.length && title && typeof title === "string" ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
            className: `${prefixCls}-inline-collapsed-noicon`
        }, title.charAt(0)) : /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", {
            className: `${prefixCls}-title-content`
        }, title);
    } else {
        // inline-collapsed.md demo 依赖 span 来隐藏文字,有 icon 属性，则内部包裹一个 span
        // ref: https://github.com/ant-design/ant-design/pull/23456
        const titleIsSpan = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(title) && title.type === "span";
        titleNode = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,_util_reactNode__WEBPACK_IMPORTED_MODULE_5__.cloneElement)(icon, {
            className: classnames__WEBPACK_IMPORTED_MODULE_1___default()(/*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(icon) ? (_a = icon.props) === null || _a === void 0 ? void 0 : _a.className : "", `${prefixCls}-item-icon`)
        }), titleIsSpan ? title : /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", {
            className: `${prefixCls}-title-content`
        }, title));
    }
    const contextValue = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>Object.assign(Object.assign({}, context), {
            firstLevel: false
        }), [
        context
    ]);
    // ============================ zIndex ============================
    const [zIndex] = (0,_util_hooks_useZIndex__WEBPACK_IMPORTED_MODULE_6__.useZIndex)("Menu");
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_MenuContext__WEBPACK_IMPORTED_MODULE_4__["default"].Provider, {
        value: contextValue
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(rc_menu__WEBPACK_IMPORTED_MODULE_2__.SubMenu, Object.assign({}, (0,rc_util_es_omit__WEBPACK_IMPORTED_MODULE_3__["default"])(props, [
        "icon"
    ]), {
        title: titleNode,
        popupClassName: classnames__WEBPACK_IMPORTED_MODULE_1___default()(prefixCls, popupClassName, `${prefixCls}-${customTheme || contextTheme}`),
        popupStyle: {
            zIndex
        }
    })));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SubMenu);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/index.js":
/*!*************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/index.js ***!
  \*************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var rc_menu__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rc-menu */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/index.js");
/* harmony import */ var _layout_Sider__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../layout/Sider */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/layout/Sider.js");
/* harmony import */ var _menu__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./menu */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/menu.js");
/* harmony import */ var _MenuDivider__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./MenuDivider */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/MenuDivider.js");
/* harmony import */ var _MenuItem__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./MenuItem */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/MenuItem.js");
/* harmony import */ var _SubMenu__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./SubMenu */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/SubMenu.js");
/* __next_internal_client_entry_do_not_use__ default auto */ 







const Menu = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)((props, ref)=>{
    const menuRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    const context = react__WEBPACK_IMPORTED_MODULE_0__.useContext(_layout_Sider__WEBPACK_IMPORTED_MODULE_2__.SiderContext);
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useImperativeHandle)(ref, ()=>({
            menu: menuRef.current,
            focus: (options)=>{
                var _a;
                (_a = menuRef.current) === null || _a === void 0 ? void 0 : _a.focus(options);
            }
        }));
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_menu__WEBPACK_IMPORTED_MODULE_3__["default"], Object.assign({
        ref: menuRef
    }, props, context));
});
Menu.Item = _MenuItem__WEBPACK_IMPORTED_MODULE_4__["default"];
Menu.SubMenu = _SubMenu__WEBPACK_IMPORTED_MODULE_5__["default"];
Menu.Divider = _MenuDivider__WEBPACK_IMPORTED_MODULE_6__["default"];
Menu.ItemGroup = rc_menu__WEBPACK_IMPORTED_MODULE_1__.ItemGroup;
if (true) {
    Menu.displayName = "Menu";
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Menu);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/menu.js":
/*!************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/menu.js ***!
  \************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ant_design_icons_es_icons_EllipsisOutlined__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ant-design/icons/es/icons/EllipsisOutlined */ "webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined");
/* harmony import */ var _ant_design_icons_es_icons_EllipsisOutlined__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_ant_design_icons_es_icons_EllipsisOutlined__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var rc_menu__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rc-menu */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/index.js");
/* harmony import */ var rc_util__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rc-util */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/index.js");
/* harmony import */ var rc_util_es_omit__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rc-util/es/omit */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/es/omit.js");
/* harmony import */ var _util_motion__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../_util/motion */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/motion.js");
/* harmony import */ var _util_reactNode__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../_util/reactNode */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/reactNode.js");
/* harmony import */ var _util_warning__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../_util/warning */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/warning.js");
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../config-provider */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/index.js");
/* harmony import */ var _config_provider_hooks_useCSSVarCls__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../config-provider/hooks/useCSSVarCls */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/hooks/useCSSVarCls.js");
/* harmony import */ var _MenuContext__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./MenuContext */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/MenuContext.js");
/* harmony import */ var _MenuDivider__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./MenuDivider */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/MenuDivider.js");
/* harmony import */ var _MenuItem__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./MenuItem */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/MenuItem.js");
/* harmony import */ var _OverrideContext__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./OverrideContext */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/OverrideContext.js");
/* harmony import */ var _style__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./style */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/style/index.js");
/* harmony import */ var _SubMenu__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./SubMenu */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/SubMenu.js");
/* __next_internal_client_entry_do_not_use__ default auto */ var __rest = undefined && undefined.__rest || function(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
};


















function isEmptyIcon(icon) {
    return icon === null || icon === false;
}
const MENU_COMPONENTS = {
    item: _MenuItem__WEBPACK_IMPORTED_MODULE_6__["default"],
    submenu: _SubMenu__WEBPACK_IMPORTED_MODULE_7__["default"],
    divider: _MenuDivider__WEBPACK_IMPORTED_MODULE_8__["default"]
};
const InternalMenu = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)((props, ref)=>{
    var _a;
    const override = react__WEBPACK_IMPORTED_MODULE_0__.useContext(_OverrideContext__WEBPACK_IMPORTED_MODULE_9__["default"]);
    const overrideObj = override || {};
    const { getPrefixCls, getPopupContainer, direction, menu } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(_config_provider__WEBPACK_IMPORTED_MODULE_10__.ConfigContext);
    const rootPrefixCls = getPrefixCls();
    const { prefixCls: customizePrefixCls, className, style, theme = "light", expandIcon, _internalDisableMenuItemTitleTooltip, inlineCollapsed, siderCollapsed, rootClassName, mode, selectable, onClick, overflowedIndicatorPopupClassName } = props, restProps = __rest(props, [
        "prefixCls",
        "className",
        "style",
        "theme",
        "expandIcon",
        "_internalDisableMenuItemTitleTooltip",
        "inlineCollapsed",
        "siderCollapsed",
        "rootClassName",
        "mode",
        "selectable",
        "onClick",
        "overflowedIndicatorPopupClassName"
    ]);
    const passedProps = (0,rc_util_es_omit__WEBPACK_IMPORTED_MODULE_5__["default"])(restProps, [
        "collapsedWidth"
    ]);
    // ======================== Warning ==========================
    if (true) {
        const warning = (0,_util_warning__WEBPACK_IMPORTED_MODULE_11__.devUseWarning)("Menu");
         true ? warning(!("inlineCollapsed" in props && mode !== "inline"), "usage", "`inlineCollapsed` should only be used when `mode` is inline.") : 0;
         true ? warning(!(props.siderCollapsed !== undefined && "inlineCollapsed" in props), "usage", "`inlineCollapsed` not control Menu under Sider. Should set `collapsed` on Sider instead.") : 0;
        warning.deprecated("items" in props && !props.children, "children", "items");
    }
    (_a = overrideObj.validator) === null || _a === void 0 ? void 0 : _a.call(overrideObj, {
        mode
    });
    // ========================== Click ==========================
    // Tell dropdown that item clicked
    const onItemClick = (0,rc_util__WEBPACK_IMPORTED_MODULE_4__.useEvent)(function() {
        var _a;
        onClick === null || onClick === void 0 ? void 0 : onClick.apply(void 0, arguments);
        (_a = overrideObj.onClick) === null || _a === void 0 ? void 0 : _a.call(overrideObj);
    });
    // ========================== Mode ===========================
    const mergedMode = overrideObj.mode || mode;
    // ======================= Selectable ========================
    const mergedSelectable = selectable !== null && selectable !== void 0 ? selectable : overrideObj.selectable;
    // ======================== Collapsed ========================
    // Inline Collapsed
    const mergedInlineCollapsed = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>{
        if (siderCollapsed !== undefined) {
            return siderCollapsed;
        }
        return inlineCollapsed;
    }, [
        inlineCollapsed,
        siderCollapsed
    ]);
    const defaultMotions = {
        horizontal: {
            motionName: `${rootPrefixCls}-slide-up`
        },
        inline: (0,_util_motion__WEBPACK_IMPORTED_MODULE_12__["default"])(rootPrefixCls),
        other: {
            motionName: `${rootPrefixCls}-zoom-big`
        }
    };
    const prefixCls = getPrefixCls("menu", customizePrefixCls || overrideObj.prefixCls);
    const rootCls = (0,_config_provider_hooks_useCSSVarCls__WEBPACK_IMPORTED_MODULE_13__["default"])(prefixCls);
    const [wrapCSSVar, hashId, cssVarCls] = (0,_style__WEBPACK_IMPORTED_MODULE_14__["default"])(prefixCls, rootCls, !override);
    const menuClassName = classnames__WEBPACK_IMPORTED_MODULE_2___default()(`${prefixCls}-${theme}`, menu === null || menu === void 0 ? void 0 : menu.className, className);
    // ====================== ExpandIcon ========================
    const mergedExpandIcon = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>{
        var _a, _b;
        if (typeof expandIcon === "function" || isEmptyIcon(expandIcon)) {
            return expandIcon || null;
        }
        if (typeof overrideObj.expandIcon === "function" || isEmptyIcon(overrideObj.expandIcon)) {
            return overrideObj.expandIcon || null;
        }
        if (typeof (menu === null || menu === void 0 ? void 0 : menu.expandIcon) === "function" || isEmptyIcon(menu === null || menu === void 0 ? void 0 : menu.expandIcon)) {
            return (menu === null || menu === void 0 ? void 0 : menu.expandIcon) || null;
        }
        const mergedIcon = (_a = expandIcon !== null && expandIcon !== void 0 ? expandIcon : overrideObj === null || overrideObj === void 0 ? void 0 : overrideObj.expandIcon) !== null && _a !== void 0 ? _a : menu === null || menu === void 0 ? void 0 : menu.expandIcon;
        return (0,_util_reactNode__WEBPACK_IMPORTED_MODULE_15__.cloneElement)(mergedIcon, {
            className: classnames__WEBPACK_IMPORTED_MODULE_2___default()(`${prefixCls}-submenu-expand-icon`, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(mergedIcon) ? (_b = mergedIcon.props) === null || _b === void 0 ? void 0 : _b.className : undefined)
        });
    }, [
        expandIcon,
        overrideObj === null || overrideObj === void 0 ? void 0 : overrideObj.expandIcon,
        menu === null || menu === void 0 ? void 0 : menu.expandIcon,
        prefixCls
    ]);
    // ======================== Context ==========================
    const contextValue = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>({
            prefixCls,
            inlineCollapsed: mergedInlineCollapsed || false,
            direction,
            firstLevel: true,
            theme,
            mode: mergedMode,
            disableMenuItemTitleTooltip: _internalDisableMenuItemTitleTooltip
        }), [
        prefixCls,
        mergedInlineCollapsed,
        direction,
        _internalDisableMenuItemTitleTooltip,
        theme
    ]);
    // ========================= Render ==========================
    return wrapCSSVar(/*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_OverrideContext__WEBPACK_IMPORTED_MODULE_9__["default"].Provider, {
        value: null
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_MenuContext__WEBPACK_IMPORTED_MODULE_16__["default"].Provider, {
        value: contextValue
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(rc_menu__WEBPACK_IMPORTED_MODULE_3__["default"], Object.assign({
        getPopupContainer: getPopupContainer,
        overflowedIndicator: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement((_ant_design_icons_es_icons_EllipsisOutlined__WEBPACK_IMPORTED_MODULE_1___default()), null),
        overflowedIndicatorPopupClassName: classnames__WEBPACK_IMPORTED_MODULE_2___default()(prefixCls, `${prefixCls}-${theme}`, overflowedIndicatorPopupClassName),
        mode: mergedMode,
        selectable: mergedSelectable,
        onClick: onItemClick
    }, passedProps, {
        inlineCollapsed: mergedInlineCollapsed,
        style: Object.assign(Object.assign({}, menu === null || menu === void 0 ? void 0 : menu.style), style),
        className: menuClassName,
        prefixCls: prefixCls,
        direction: direction,
        defaultMotions: defaultMotions,
        expandIcon: mergedExpandIcon,
        ref: ref,
        rootClassName: classnames__WEBPACK_IMPORTED_MODULE_2___default()(rootClassName, hashId, overrideObj.rootClassName, cssVarCls, rootCls),
        _internalComponents: MENU_COMPONENTS
    })))));
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (InternalMenu);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/style/horizontal.js":
/*!************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/style/horizontal.js ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__);

const getHorizontalStyle = (token)=>{
    const { componentCls, motionDurationSlow, horizontalLineHeight, colorSplit, lineWidth, lineType, itemPaddingInline } = token;
    return {
        [`${componentCls}-horizontal`]: {
            lineHeight: horizontalLineHeight,
            border: 0,
            borderBottom: `${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(lineWidth)} ${lineType} ${colorSplit}`,
            boxShadow: "none",
            "&::after": {
                display: "block",
                clear: "both",
                height: 0,
                content: '"\\20"'
            },
            // ======================= Item =======================
            [`${componentCls}-item, ${componentCls}-submenu`]: {
                position: "relative",
                display: "inline-block",
                verticalAlign: "bottom",
                paddingInline: itemPaddingInline
            },
            [`> ${componentCls}-item:hover,
        > ${componentCls}-item-active,
        > ${componentCls}-submenu ${componentCls}-submenu-title:hover`]: {
                backgroundColor: "transparent"
            },
            [`${componentCls}-item, ${componentCls}-submenu-title`]: {
                transition: [
                    `border-color ${motionDurationSlow}`,
                    `background ${motionDurationSlow}`
                ].join(",")
            },
            // ===================== Sub Menu =====================
            [`${componentCls}-submenu-arrow`]: {
                display: "none"
            }
        }
    };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getHorizontalStyle);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/style/index.js":
/*!*******************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/style/index.js ***!
  \*******************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   prepareComponentToken: () => (/* binding */ prepareComponentToken)
/* harmony export */ });
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ctrl/tinycolor */ "../../node_modules/.pnpm/@ctrl+tinycolor@3.6.1/node_modules/@ctrl/tinycolor/dist/public_api.js");
/* harmony import */ var _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _style__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../style */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/index.js");
/* harmony import */ var _style_motion__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../style/motion */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/index.js");
/* harmony import */ var _theme_internal__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../theme/internal */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/internal.js");
/* harmony import */ var _horizontal__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./horizontal */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/style/horizontal.js");
/* harmony import */ var _rtl__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./rtl */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/style/rtl.js");
/* harmony import */ var _theme__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./theme */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/style/theme.js");
/* harmony import */ var _vertical__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./vertical */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/style/vertical.js");









const genMenuItemStyle = (token)=>{
    const { componentCls, motionDurationSlow, motionDurationMid, motionEaseInOut, motionEaseOut, iconCls, iconSize, iconMarginInlineEnd } = token;
    return {
        // >>>>> Item
        [`${componentCls}-item, ${componentCls}-submenu-title`]: {
            position: "relative",
            display: "block",
            margin: 0,
            whiteSpace: "nowrap",
            cursor: "pointer",
            transition: [
                `border-color ${motionDurationSlow}`,
                `background ${motionDurationSlow}`,
                `padding ${motionDurationSlow} ${motionEaseInOut}`
            ].join(","),
            [`${componentCls}-item-icon, ${iconCls}`]: {
                minWidth: iconSize,
                fontSize: iconSize,
                transition: [
                    `font-size ${motionDurationMid} ${motionEaseOut}`,
                    `margin ${motionDurationSlow} ${motionEaseInOut}`,
                    `color ${motionDurationSlow}`
                ].join(","),
                "+ span": {
                    marginInlineStart: iconMarginInlineEnd,
                    opacity: 1,
                    transition: [
                        `opacity ${motionDurationSlow} ${motionEaseInOut}`,
                        `margin ${motionDurationSlow}`,
                        `color ${motionDurationSlow}`
                    ].join(",")
                }
            },
            [`${componentCls}-item-icon`]: Object.assign({}, (0,_style__WEBPACK_IMPORTED_MODULE_1__.resetIcon)()),
            [`&${componentCls}-item-only-child`]: {
                [`> ${iconCls}, > ${componentCls}-item-icon`]: {
                    marginInlineEnd: 0
                }
            }
        },
        // Disabled state sets text to gray and nukes hover/tab effects
        [`${componentCls}-item-disabled, ${componentCls}-submenu-disabled`]: {
            background: "none !important",
            cursor: "not-allowed",
            "&::after": {
                borderColor: "transparent !important"
            },
            a: {
                color: "inherit !important"
            },
            [`> ${componentCls}-submenu-title`]: {
                color: "inherit !important",
                cursor: "not-allowed"
            }
        }
    };
};
const genSubMenuArrowStyle = (token)=>{
    const { componentCls, motionDurationSlow, motionEaseInOut, borderRadius, menuArrowSize, menuArrowOffset } = token;
    return {
        [`${componentCls}-submenu`]: {
            "&-expand-icon, &-arrow": {
                position: "absolute",
                top: "50%",
                insetInlineEnd: token.margin,
                width: menuArrowSize,
                color: "currentcolor",
                transform: "translateY(-50%)",
                transition: `transform ${motionDurationSlow} ${motionEaseInOut}, opacity ${motionDurationSlow}`
            },
            "&-arrow": {
                // →
                "&::before, &::after": {
                    position: "absolute",
                    width: token.calc(menuArrowSize).mul(0.6).equal(),
                    height: token.calc(menuArrowSize).mul(0.15).equal(),
                    backgroundColor: "currentcolor",
                    borderRadius,
                    transition: [
                        `background ${motionDurationSlow} ${motionEaseInOut}`,
                        `transform ${motionDurationSlow} ${motionEaseInOut}`,
                        `top ${motionDurationSlow} ${motionEaseInOut}`,
                        `color ${motionDurationSlow} ${motionEaseInOut}`
                    ].join(","),
                    content: '""'
                },
                "&::before": {
                    transform: `rotate(45deg) translateY(${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(token.calc(menuArrowOffset).mul(-1).equal())})`
                },
                "&::after": {
                    transform: `rotate(-45deg) translateY(${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(menuArrowOffset)})`
                }
            }
        }
    };
};
// =============================== Base ===============================
const getBaseStyle = (token)=>{
    const { antCls, componentCls, fontSize, motionDurationSlow, motionDurationMid, motionEaseInOut, paddingXS, padding, colorSplit, lineWidth, zIndexPopup, borderRadiusLG, subMenuItemBorderRadius, menuArrowSize, menuArrowOffset, lineType, groupTitleLineHeight, groupTitleFontSize } = token;
    return [
        // Misc
        {
            "": {
                [`${componentCls}`]: Object.assign(Object.assign({}, (0,_style__WEBPACK_IMPORTED_MODULE_1__.clearFix)()), {
                    // Hidden
                    "&-hidden": {
                        display: "none"
                    }
                })
            },
            [`${componentCls}-submenu-hidden`]: {
                display: "none"
            }
        },
        {
            [componentCls]: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (0,_style__WEBPACK_IMPORTED_MODULE_1__.resetComponent)(token)), (0,_style__WEBPACK_IMPORTED_MODULE_1__.clearFix)()), {
                marginBottom: 0,
                paddingInlineStart: 0,
                // Override default ul/ol
                fontSize,
                lineHeight: 0,
                listStyle: "none",
                outline: "none",
                // Magic cubic here but smooth transition
                transition: `width ${motionDurationSlow} cubic-bezier(0.2, 0, 0, 1) 0s`,
                "ul, ol": {
                    margin: 0,
                    padding: 0,
                    listStyle: "none"
                },
                // Overflow ellipsis
                "&-overflow": {
                    display: "flex",
                    [`${componentCls}-item`]: {
                        flex: "none"
                    }
                },
                [`${componentCls}-item, ${componentCls}-submenu, ${componentCls}-submenu-title`]: {
                    borderRadius: token.itemBorderRadius
                },
                [`${componentCls}-item-group-title`]: {
                    padding: `${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(paddingXS)} ${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(padding)}`,
                    fontSize: groupTitleFontSize,
                    lineHeight: groupTitleLineHeight,
                    transition: `all ${motionDurationSlow}`
                },
                [`&-horizontal ${componentCls}-submenu`]: {
                    transition: [
                        `border-color ${motionDurationSlow} ${motionEaseInOut}`,
                        `background ${motionDurationSlow} ${motionEaseInOut}`
                    ].join(",")
                },
                [`${componentCls}-submenu, ${componentCls}-submenu-inline`]: {
                    transition: [
                        `border-color ${motionDurationSlow} ${motionEaseInOut}`,
                        `background ${motionDurationSlow} ${motionEaseInOut}`,
                        `padding ${motionDurationMid} ${motionEaseInOut}`
                    ].join(",")
                },
                [`${componentCls}-submenu ${componentCls}-sub`]: {
                    cursor: "initial",
                    transition: [
                        `background ${motionDurationSlow} ${motionEaseInOut}`,
                        `padding ${motionDurationSlow} ${motionEaseInOut}`
                    ].join(",")
                },
                [`${componentCls}-title-content`]: {
                    transition: `color ${motionDurationSlow}`,
                    // https://github.com/ant-design/ant-design/issues/41143
                    [`> ${antCls}-typography-ellipsis-single-line`]: {
                        display: "inline",
                        verticalAlign: "unset"
                    }
                },
                [`${componentCls}-item a`]: {
                    "&::before": {
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "transparent",
                        content: '""'
                    }
                },
                // Removed a Badge related style seems it's safe
                // https://github.com/ant-design/ant-design/issues/19809
                // >>>>> Divider
                [`${componentCls}-item-divider`]: {
                    overflow: "hidden",
                    lineHeight: 0,
                    borderColor: colorSplit,
                    borderStyle: lineType,
                    borderWidth: 0,
                    borderTopWidth: lineWidth,
                    marginBlock: lineWidth,
                    padding: 0,
                    "&-dashed": {
                        borderStyle: "dashed"
                    }
                }
            }), genMenuItemStyle(token)), {
                [`${componentCls}-item-group`]: {
                    [`${componentCls}-item-group-list`]: {
                        margin: 0,
                        padding: 0,
                        [`${componentCls}-item, ${componentCls}-submenu-title`]: {
                            paddingInline: `${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(token.calc(fontSize).mul(2).equal())} ${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(padding)}`
                        }
                    }
                },
                // ======================= Sub Menu =======================
                "&-submenu": {
                    "&-popup": {
                        position: "absolute",
                        zIndex: zIndexPopup,
                        borderRadius: borderRadiusLG,
                        boxShadow: "none",
                        transformOrigin: "0 0",
                        [`&${componentCls}-submenu`]: {
                            background: "transparent"
                        },
                        // https://github.com/ant-design/ant-design/issues/13955
                        "&::before": {
                            position: "absolute",
                            inset: 0,
                            zIndex: -1,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            content: '""'
                        },
                        [`> ${componentCls}`]: Object.assign(Object.assign(Object.assign({
                            borderRadius: borderRadiusLG
                        }, genMenuItemStyle(token)), genSubMenuArrowStyle(token)), {
                            [`${componentCls}-item, ${componentCls}-submenu > ${componentCls}-submenu-title`]: {
                                borderRadius: subMenuItemBorderRadius
                            },
                            [`${componentCls}-submenu-title::after`]: {
                                transition: `transform ${motionDurationSlow} ${motionEaseInOut}`
                            }
                        })
                    },
                    [`
          &-placement-leftTop,
          &-placement-bottomRight,
          `]: {
                        transformOrigin: "100% 0"
                    },
                    [`
          &-placement-leftBottom,
          &-placement-topRight,
          `]: {
                        transformOrigin: "100% 100%"
                    },
                    [`
          &-placement-rightBottom,
          &-placement-topLeft,
          `]: {
                        transformOrigin: "0 100%"
                    },
                    [`
          &-placement-bottomLeft,
          &-placement-rightTop,
          `]: {
                        transformOrigin: "0 0"
                    },
                    [`
          &-placement-leftTop,
          &-placement-leftBottom
          `]: {
                        paddingInlineEnd: token.paddingXS
                    },
                    [`
          &-placement-rightTop,
          &-placement-rightBottom
          `]: {
                        paddingInlineStart: token.paddingXS
                    },
                    [`
          &-placement-topRight,
          &-placement-topLeft
          `]: {
                        paddingBottom: token.paddingXS
                    },
                    [`
          &-placement-bottomRight,
          &-placement-bottomLeft
          `]: {
                        paddingTop: token.paddingXS
                    }
                }
            }), genSubMenuArrowStyle(token)), {
                [`&-inline-collapsed ${componentCls}-submenu-arrow,
        &-inline ${componentCls}-submenu-arrow`]: {
                    // ↓
                    "&::before": {
                        transform: `rotate(-45deg) translateX(${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(menuArrowOffset)})`
                    },
                    "&::after": {
                        transform: `rotate(45deg) translateX(${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(token.calc(menuArrowOffset).mul(-1).equal())})`
                    }
                },
                [`${componentCls}-submenu-open${componentCls}-submenu-inline > ${componentCls}-submenu-title > ${componentCls}-submenu-arrow`]: {
                    // ↑
                    transform: `translateY(${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(token.calc(menuArrowSize).mul(0.2).mul(-1).equal())})`,
                    "&::after": {
                        transform: `rotate(-45deg) translateX(${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(token.calc(menuArrowOffset).mul(-1).equal())})`
                    },
                    "&::before": {
                        transform: `rotate(45deg) translateX(${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(menuArrowOffset)})`
                    }
                }
            })
        },
        // Integration with header element so menu items have the same height
        {
            [`${antCls}-layout-header`]: {
                [componentCls]: {
                    lineHeight: "inherit"
                }
            }
        }
    ];
};
const prepareComponentToken = (token)=>{
    var _a, _b, _c;
    const { colorPrimary, colorError, colorTextDisabled, colorErrorBg, colorText, colorTextDescription, colorBgContainer, colorFillAlter, colorFillContent, lineWidth, lineWidthBold, controlItemBgActive, colorBgTextHover, controlHeightLG, lineHeight, colorBgElevated, marginXXS, padding, fontSize, controlHeightSM, fontSizeLG, colorTextLightSolid, colorErrorHover } = token;
    const activeBarWidth = (_a = token.activeBarWidth) !== null && _a !== void 0 ? _a : 0;
    const activeBarBorderWidth = (_b = token.activeBarBorderWidth) !== null && _b !== void 0 ? _b : lineWidth;
    const itemMarginInline = (_c = token.itemMarginInline) !== null && _c !== void 0 ? _c : token.marginXXS;
    const colorTextDark = new _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_2__.TinyColor(colorTextLightSolid).setAlpha(0.65).toRgbString();
    return {
        dropdownWidth: 160,
        zIndexPopup: token.zIndexPopupBase + 50,
        radiusItem: token.borderRadiusLG,
        itemBorderRadius: token.borderRadiusLG,
        radiusSubMenuItem: token.borderRadiusSM,
        subMenuItemBorderRadius: token.borderRadiusSM,
        colorItemText: colorText,
        itemColor: colorText,
        colorItemTextHover: colorText,
        itemHoverColor: colorText,
        colorItemTextHoverHorizontal: colorPrimary,
        horizontalItemHoverColor: colorPrimary,
        colorGroupTitle: colorTextDescription,
        groupTitleColor: colorTextDescription,
        colorItemTextSelected: colorPrimary,
        itemSelectedColor: colorPrimary,
        colorItemTextSelectedHorizontal: colorPrimary,
        horizontalItemSelectedColor: colorPrimary,
        colorItemBg: colorBgContainer,
        itemBg: colorBgContainer,
        colorItemBgHover: colorBgTextHover,
        itemHoverBg: colorBgTextHover,
        colorItemBgActive: colorFillContent,
        itemActiveBg: controlItemBgActive,
        colorSubItemBg: colorFillAlter,
        subMenuItemBg: colorFillAlter,
        colorItemBgSelected: controlItemBgActive,
        itemSelectedBg: controlItemBgActive,
        colorItemBgSelectedHorizontal: "transparent",
        horizontalItemSelectedBg: "transparent",
        colorActiveBarWidth: 0,
        activeBarWidth,
        colorActiveBarHeight: lineWidthBold,
        activeBarHeight: lineWidthBold,
        colorActiveBarBorderSize: lineWidth,
        activeBarBorderWidth,
        // Disabled
        colorItemTextDisabled: colorTextDisabled,
        itemDisabledColor: colorTextDisabled,
        // Danger
        colorDangerItemText: colorError,
        dangerItemColor: colorError,
        colorDangerItemTextHover: colorError,
        dangerItemHoverColor: colorError,
        colorDangerItemTextSelected: colorError,
        dangerItemSelectedColor: colorError,
        colorDangerItemBgActive: colorErrorBg,
        dangerItemActiveBg: colorErrorBg,
        colorDangerItemBgSelected: colorErrorBg,
        dangerItemSelectedBg: colorErrorBg,
        itemMarginInline,
        horizontalItemBorderRadius: 0,
        horizontalItemHoverBg: "transparent",
        itemHeight: controlHeightLG,
        groupTitleLineHeight: lineHeight,
        collapsedWidth: controlHeightLG * 2,
        popupBg: colorBgElevated,
        itemMarginBlock: marginXXS,
        itemPaddingInline: padding,
        horizontalLineHeight: `${controlHeightLG * 1.15}px`,
        iconSize: fontSize,
        iconMarginInlineEnd: controlHeightSM - fontSize,
        collapsedIconSize: fontSizeLG,
        groupTitleFontSize: fontSize,
        // Disabled
        darkItemDisabledColor: new _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_2__.TinyColor(colorTextLightSolid).setAlpha(0.25).toRgbString(),
        // Dark
        darkItemColor: colorTextDark,
        darkDangerItemColor: colorError,
        darkItemBg: "#001529",
        darkPopupBg: "#001529",
        darkSubMenuItemBg: "#000c17",
        darkItemSelectedColor: colorTextLightSolid,
        darkItemSelectedBg: colorPrimary,
        darkDangerItemSelectedBg: colorError,
        darkItemHoverBg: "transparent",
        darkGroupTitleColor: colorTextDark,
        darkItemHoverColor: colorTextLightSolid,
        darkDangerItemHoverColor: colorErrorHover,
        darkDangerItemSelectedColor: colorTextLightSolid,
        darkDangerItemActiveBg: colorError,
        // internal
        itemWidth: activeBarWidth ? `calc(100% + ${activeBarBorderWidth}px)` : `calc(100% - ${itemMarginInline * 2}px)`
    };
};
// ============================== Export ==============================
/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(prefixCls) {
    let rootCls = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : prefixCls;
    let injectStyle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    const useStyle = (0,_theme_internal__WEBPACK_IMPORTED_MODULE_3__.genStyleHooks)("Menu", (token)=>{
        const { colorBgElevated, controlHeightLG, fontSize, darkItemColor, darkDangerItemColor, darkItemBg, darkSubMenuItemBg, darkItemSelectedColor, darkItemSelectedBg, darkDangerItemSelectedBg, darkItemHoverBg, darkGroupTitleColor, darkItemHoverColor, darkItemDisabledColor, darkDangerItemHoverColor, darkDangerItemSelectedColor, darkDangerItemActiveBg, popupBg, darkPopupBg } = token;
        const menuArrowSize = token.calc(fontSize).div(7).mul(5).equal();
        // Menu Token
        const menuToken = (0,_theme_internal__WEBPACK_IMPORTED_MODULE_3__.mergeToken)(token, {
            menuArrowSize,
            menuHorizontalHeight: token.calc(controlHeightLG).mul(1.15).equal(),
            menuArrowOffset: token.calc(menuArrowSize).mul(0.25).equal(),
            menuSubMenuBg: colorBgElevated,
            calc: token.calc,
            popupBg
        });
        const menuDarkToken = (0,_theme_internal__WEBPACK_IMPORTED_MODULE_3__.mergeToken)(menuToken, {
            itemColor: darkItemColor,
            itemHoverColor: darkItemHoverColor,
            groupTitleColor: darkGroupTitleColor,
            itemSelectedColor: darkItemSelectedColor,
            itemBg: darkItemBg,
            popupBg: darkPopupBg,
            subMenuItemBg: darkSubMenuItemBg,
            itemActiveBg: "transparent",
            itemSelectedBg: darkItemSelectedBg,
            activeBarHeight: 0,
            activeBarBorderWidth: 0,
            itemHoverBg: darkItemHoverBg,
            // Disabled
            itemDisabledColor: darkItemDisabledColor,
            // Danger
            dangerItemColor: darkDangerItemColor,
            dangerItemHoverColor: darkDangerItemHoverColor,
            dangerItemSelectedColor: darkDangerItemSelectedColor,
            dangerItemActiveBg: darkDangerItemActiveBg,
            dangerItemSelectedBg: darkDangerItemSelectedBg,
            menuSubMenuBg: darkSubMenuItemBg,
            // Horizontal
            horizontalItemSelectedColor: darkItemSelectedColor,
            horizontalItemSelectedBg: darkItemSelectedBg
        });
        return [
            // Basic
            getBaseStyle(menuToken),
            // Horizontal
            (0,_horizontal__WEBPACK_IMPORTED_MODULE_4__["default"])(menuToken),
            // Hard code for some light style
            // Vertical
            (0,_vertical__WEBPACK_IMPORTED_MODULE_5__["default"])(menuToken),
            // Hard code for some light style
            // Theme
            (0,_theme__WEBPACK_IMPORTED_MODULE_6__["default"])(menuToken, "light"),
            (0,_theme__WEBPACK_IMPORTED_MODULE_6__["default"])(menuDarkToken, "dark"),
            // RTL
            (0,_rtl__WEBPACK_IMPORTED_MODULE_7__["default"])(menuToken),
            // Motion
            (0,_style_motion__WEBPACK_IMPORTED_MODULE_8__.genCollapseMotion)(menuToken),
            (0,_style_motion__WEBPACK_IMPORTED_MODULE_8__.initSlideMotion)(menuToken, "slide-up"),
            (0,_style_motion__WEBPACK_IMPORTED_MODULE_8__.initSlideMotion)(menuToken, "slide-down"),
            (0,_style_motion__WEBPACK_IMPORTED_MODULE_8__.initZoomMotion)(menuToken, "zoom-big")
        ];
    }, prepareComponentToken, {
        deprecatedTokens: [
            [
                "colorGroupTitle",
                "groupTitleColor"
            ],
            [
                "radiusItem",
                "itemBorderRadius"
            ],
            [
                "radiusSubMenuItem",
                "subMenuItemBorderRadius"
            ],
            [
                "colorItemText",
                "itemColor"
            ],
            [
                "colorItemTextHover",
                "itemHoverColor"
            ],
            [
                "colorItemTextHoverHorizontal",
                "horizontalItemHoverColor"
            ],
            [
                "colorItemTextSelected",
                "itemSelectedColor"
            ],
            [
                "colorItemTextSelectedHorizontal",
                "horizontalItemSelectedColor"
            ],
            [
                "colorItemTextDisabled",
                "itemDisabledColor"
            ],
            [
                "colorDangerItemText",
                "dangerItemColor"
            ],
            [
                "colorDangerItemTextHover",
                "dangerItemHoverColor"
            ],
            [
                "colorDangerItemTextSelected",
                "dangerItemSelectedColor"
            ],
            [
                "colorDangerItemBgActive",
                "dangerItemActiveBg"
            ],
            [
                "colorDangerItemBgSelected",
                "dangerItemSelectedBg"
            ],
            [
                "colorItemBg",
                "itemBg"
            ],
            [
                "colorItemBgHover",
                "itemHoverBg"
            ],
            [
                "colorSubItemBg",
                "subMenuItemBg"
            ],
            [
                "colorItemBgActive",
                "itemActiveBg"
            ],
            [
                "colorItemBgSelectedHorizontal",
                "horizontalItemSelectedBg"
            ],
            [
                "colorActiveBarWidth",
                "activeBarWidth"
            ],
            [
                "colorActiveBarHeight",
                "activeBarHeight"
            ],
            [
                "colorActiveBarBorderSize",
                "activeBarBorderWidth"
            ],
            [
                "colorItemBgSelected",
                "itemSelectedBg"
            ]
        ],
        // Dropdown will handle menu style self. We do not need to handle this.
        injectStyle,
        unitless: {
            groupTitleLineHeight: true
        }
    });
    return useStyle(prefixCls, rootCls);
};


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/style/rtl.js":
/*!*****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/style/rtl.js ***!
  \*****************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__);

const getRTLStyle = (_ref)=>{
    let { componentCls, menuArrowOffset, calc } = _ref;
    return {
        [`${componentCls}-rtl`]: {
            direction: "rtl"
        },
        [`${componentCls}-submenu-rtl`]: {
            transformOrigin: "100% 0"
        },
        // Vertical Arrow
        [`${componentCls}-rtl${componentCls}-vertical,
    ${componentCls}-submenu-rtl ${componentCls}-vertical`]: {
            [`${componentCls}-submenu-arrow`]: {
                "&::before": {
                    transform: `rotate(-45deg) translateY(${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(calc(menuArrowOffset).mul(-1).equal())})`
                },
                "&::after": {
                    transform: `rotate(45deg) translateY(${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(menuArrowOffset)})`
                }
            }
        }
    };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getRTLStyle);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/style/theme.js":
/*!*******************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/style/theme.js ***!
  \*******************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _style__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../style */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/index.js");


const accessibilityFocus = (token)=>Object.assign({}, (0,_style__WEBPACK_IMPORTED_MODULE_1__.genFocusOutline)(token));
const getThemeStyle = (token, themeSuffix)=>{
    const { componentCls, itemColor, itemSelectedColor, groupTitleColor, itemBg, subMenuItemBg, itemSelectedBg, activeBarHeight, activeBarWidth, activeBarBorderWidth, motionDurationSlow, motionEaseInOut, motionEaseOut, itemPaddingInline, motionDurationMid, itemHoverColor, lineType, colorSplit, // Disabled
    itemDisabledColor, // Danger
    dangerItemColor, dangerItemHoverColor, dangerItemSelectedColor, dangerItemActiveBg, dangerItemSelectedBg, // Bg
    popupBg, itemHoverBg, itemActiveBg, menuSubMenuBg, // Horizontal
    horizontalItemSelectedColor, horizontalItemSelectedBg, horizontalItemBorderRadius, horizontalItemHoverBg } = token;
    return {
        [`${componentCls}-${themeSuffix}, ${componentCls}-${themeSuffix} > ${componentCls}`]: {
            color: itemColor,
            background: itemBg,
            [`&${componentCls}-root:focus-visible`]: Object.assign({}, accessibilityFocus(token)),
            // ======================== Item ========================
            [`${componentCls}-item-group-title`]: {
                color: groupTitleColor
            },
            [`${componentCls}-submenu-selected`]: {
                [`> ${componentCls}-submenu-title`]: {
                    color: itemSelectedColor
                }
            },
            [`${componentCls}-item, ${componentCls}-submenu-title`]: {
                color: itemColor,
                [`&:not(${componentCls}-item-disabled):focus-visible`]: Object.assign({}, accessibilityFocus(token))
            },
            // Disabled
            [`${componentCls}-item-disabled, ${componentCls}-submenu-disabled`]: {
                color: `${itemDisabledColor} !important`
            },
            // Hover
            [`${componentCls}-item:not(${componentCls}-item-selected):not(${componentCls}-submenu-selected)`]: {
                [`&:hover, > ${componentCls}-submenu-title:hover`]: {
                    color: itemHoverColor
                }
            },
            [`&:not(${componentCls}-horizontal)`]: {
                [`${componentCls}-item:not(${componentCls}-item-selected)`]: {
                    "&:hover": {
                        backgroundColor: itemHoverBg
                    },
                    "&:active": {
                        backgroundColor: itemActiveBg
                    }
                },
                [`${componentCls}-submenu-title`]: {
                    "&:hover": {
                        backgroundColor: itemHoverBg
                    },
                    "&:active": {
                        backgroundColor: itemActiveBg
                    }
                }
            },
            // Danger - only Item has
            [`${componentCls}-item-danger`]: {
                color: dangerItemColor,
                [`&${componentCls}-item:hover`]: {
                    [`&:not(${componentCls}-item-selected):not(${componentCls}-submenu-selected)`]: {
                        color: dangerItemHoverColor
                    }
                },
                [`&${componentCls}-item:active`]: {
                    background: dangerItemActiveBg
                }
            },
            [`${componentCls}-item a`]: {
                "&, &:hover": {
                    color: "inherit"
                }
            },
            [`${componentCls}-item-selected`]: {
                color: itemSelectedColor,
                // Danger
                [`&${componentCls}-item-danger`]: {
                    color: dangerItemSelectedColor
                },
                "a, a:hover": {
                    color: "inherit"
                }
            },
            [`& ${componentCls}-item-selected`]: {
                backgroundColor: itemSelectedBg,
                // Danger
                [`&${componentCls}-item-danger`]: {
                    backgroundColor: dangerItemSelectedBg
                }
            },
            [`&${componentCls}-submenu > ${componentCls}`]: {
                backgroundColor: menuSubMenuBg
            },
            // ===== 设置浮层的颜色 =======
            // ！dark 模式会被popupBg 会被rest 为 darkPopupBg
            [`&${componentCls}-popup > ${componentCls}`]: {
                backgroundColor: popupBg
            },
            [`&${componentCls}-submenu-popup > ${componentCls}`]: {
                backgroundColor: popupBg
            },
            // ===== 设置浮层的颜色 end =======
            // ====================== Horizontal ======================
            [`&${componentCls}-horizontal`]: Object.assign(Object.assign({}, themeSuffix === "dark" ? {
                borderBottom: 0
            } : {}), {
                [`> ${componentCls}-item, > ${componentCls}-submenu`]: {
                    top: activeBarBorderWidth,
                    marginTop: token.calc(activeBarBorderWidth).mul(-1).equal(),
                    marginBottom: 0,
                    borderRadius: horizontalItemBorderRadius,
                    "&::after": {
                        position: "absolute",
                        insetInline: itemPaddingInline,
                        bottom: 0,
                        borderBottom: `${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(activeBarHeight)} solid transparent`,
                        transition: `border-color ${motionDurationSlow} ${motionEaseInOut}`,
                        content: '""'
                    },
                    "&:hover, &-active, &-open": {
                        background: horizontalItemHoverBg,
                        "&::after": {
                            borderBottomWidth: activeBarHeight,
                            borderBottomColor: horizontalItemSelectedColor
                        }
                    },
                    "&-selected": {
                        color: horizontalItemSelectedColor,
                        backgroundColor: horizontalItemSelectedBg,
                        "&:hover": {
                            backgroundColor: horizontalItemSelectedBg
                        },
                        "&::after": {
                            borderBottomWidth: activeBarHeight,
                            borderBottomColor: horizontalItemSelectedColor
                        }
                    }
                }
            }),
            // ================== Inline & Vertical ===================
            //
            [`&${componentCls}-root`]: {
                [`&${componentCls}-inline, &${componentCls}-vertical`]: {
                    borderInlineEnd: `${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(activeBarBorderWidth)} ${lineType} ${colorSplit}`
                }
            },
            // ======================== Inline ========================
            [`&${componentCls}-inline`]: {
                // Sub
                [`${componentCls}-sub${componentCls}-inline`]: {
                    background: subMenuItemBg
                },
                [`${componentCls}-item`]: {
                    position: "relative",
                    "&::after": {
                        position: "absolute",
                        insetBlock: 0,
                        insetInlineEnd: 0,
                        borderInlineEnd: `${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(activeBarWidth)} solid ${itemSelectedColor}`,
                        transform: "scaleY(0.0001)",
                        opacity: 0,
                        transition: [
                            `transform ${motionDurationMid} ${motionEaseOut}`,
                            `opacity ${motionDurationMid} ${motionEaseOut}`
                        ].join(","),
                        content: '""'
                    },
                    // Danger
                    [`&${componentCls}-item-danger`]: {
                        "&::after": {
                            borderInlineEndColor: dangerItemSelectedColor
                        }
                    }
                },
                [`${componentCls}-selected, ${componentCls}-item-selected`]: {
                    "&::after": {
                        transform: "scaleY(1)",
                        opacity: 1,
                        transition: [
                            `transform ${motionDurationMid} ${motionEaseInOut}`,
                            `opacity ${motionDurationMid} ${motionEaseInOut}`
                        ].join(",")
                    }
                }
            }
        }
    };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getThemeStyle);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/style/vertical.js":
/*!**********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/menu/style/vertical.js ***!
  \**********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _style__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../style */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/index.js");


const getVerticalInlineStyle = (token)=>{
    const { componentCls, itemHeight, itemMarginInline, padding, menuArrowSize, marginXS, itemMarginBlock, itemWidth } = token;
    const paddingWithArrow = token.calc(menuArrowSize).add(padding).add(marginXS).equal();
    return {
        [`${componentCls}-item`]: {
            position: "relative",
            overflow: "hidden"
        },
        [`${componentCls}-item, ${componentCls}-submenu-title`]: {
            height: itemHeight,
            lineHeight: (0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(itemHeight),
            paddingInline: padding,
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginInline: itemMarginInline,
            marginBlock: itemMarginBlock,
            width: itemWidth
        },
        [`> ${componentCls}-item,
            > ${componentCls}-submenu > ${componentCls}-submenu-title`]: {
            height: itemHeight,
            lineHeight: (0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(itemHeight)
        },
        [`${componentCls}-item-group-list ${componentCls}-submenu-title,
            ${componentCls}-submenu-title`]: {
            paddingInlineEnd: paddingWithArrow
        }
    };
};
const getVerticalStyle = (token)=>{
    const { componentCls, iconCls, itemHeight, colorTextLightSolid, dropdownWidth, controlHeightLG, motionDurationMid, motionEaseOut, paddingXL, itemMarginInline, fontSizeLG, motionDurationSlow, paddingXS, boxShadowSecondary, collapsedWidth, collapsedIconSize } = token;
    const inlineItemStyle = {
        height: itemHeight,
        lineHeight: (0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(itemHeight),
        listStylePosition: "inside",
        listStyleType: "disc"
    };
    return [
        {
            [componentCls]: {
                "&-inline, &-vertical": Object.assign({
                    [`&${componentCls}-root`]: {
                        boxShadow: "none"
                    }
                }, getVerticalInlineStyle(token))
            },
            [`${componentCls}-submenu-popup`]: {
                [`${componentCls}-vertical`]: Object.assign(Object.assign({}, getVerticalInlineStyle(token)), {
                    boxShadow: boxShadowSecondary
                })
            }
        },
        // Vertical only
        {
            [`${componentCls}-submenu-popup ${componentCls}-vertical${componentCls}-sub`]: {
                minWidth: dropdownWidth,
                maxHeight: `calc(100vh - ${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(token.calc(controlHeightLG).mul(2.5).equal())})`,
                padding: "0",
                overflow: "hidden",
                borderInlineEnd: 0,
                // https://github.com/ant-design/ant-design/issues/22244
                // https://github.com/ant-design/ant-design/issues/26812
                "&:not([class*='-active'])": {
                    overflowX: "hidden",
                    overflowY: "auto"
                }
            }
        },
        // Inline Only
        {
            [`${componentCls}-inline`]: {
                width: "100%",
                // Motion enhance for first level
                [`&${componentCls}-root`]: {
                    [`${componentCls}-item, ${componentCls}-submenu-title`]: {
                        display: "flex",
                        alignItems: "center",
                        transition: [
                            `border-color ${motionDurationSlow}`,
                            `background ${motionDurationSlow}`,
                            `padding ${motionDurationMid} ${motionEaseOut}`,
                            `padding-inline calc(50% - ${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(token.calc(fontSizeLG).div(2).equal())} - ${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(itemMarginInline)})`
                        ].join(","),
                        [`> ${componentCls}-title-content`]: {
                            flex: "auto",
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        },
                        "> *": {
                            flex: "none"
                        }
                    }
                },
                // >>>>> Sub
                [`${componentCls}-sub${componentCls}-inline`]: {
                    padding: 0,
                    border: 0,
                    borderRadius: 0,
                    boxShadow: "none",
                    [`& > ${componentCls}-submenu > ${componentCls}-submenu-title`]: inlineItemStyle,
                    [`& ${componentCls}-item-group-title`]: {
                        paddingInlineStart: paddingXL
                    }
                },
                // >>>>> Item
                [`${componentCls}-item`]: inlineItemStyle
            }
        },
        // Inline Collapse Only
        {
            [`${componentCls}-inline-collapsed`]: {
                width: collapsedWidth,
                [`&${componentCls}-root`]: {
                    [`${componentCls}-item, ${componentCls}-submenu ${componentCls}-submenu-title`]: {
                        [`> ${componentCls}-inline-collapsed-noicon`]: {
                            fontSize: fontSizeLG,
                            textAlign: "center"
                        }
                    }
                },
                [`> ${componentCls}-item,
          > ${componentCls}-item-group > ${componentCls}-item-group-list > ${componentCls}-item,
          > ${componentCls}-item-group > ${componentCls}-item-group-list > ${componentCls}-submenu > ${componentCls}-submenu-title,
          > ${componentCls}-submenu > ${componentCls}-submenu-title`]: {
                    insetInlineStart: 0,
                    paddingInline: `calc(50% - ${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(token.calc(fontSizeLG).div(2).equal())} - ${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(itemMarginInline)})`,
                    textOverflow: "clip",
                    [`
            ${componentCls}-submenu-arrow,
            ${componentCls}-submenu-expand-icon
          `]: {
                        opacity: 0
                    },
                    [`${componentCls}-item-icon, ${iconCls}`]: {
                        margin: 0,
                        fontSize: collapsedIconSize,
                        lineHeight: (0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(itemHeight),
                        "+ span": {
                            display: "inline-block",
                            opacity: 0
                        }
                    }
                },
                [`${componentCls}-item-icon, ${iconCls}`]: {
                    display: "inline-block"
                },
                "&-tooltip": {
                    pointerEvents: "none",
                    [`${componentCls}-item-icon, ${iconCls}`]: {
                        display: "none"
                    },
                    "a, a:hover": {
                        color: colorTextLightSolid
                    }
                },
                [`${componentCls}-item-group-title`]: Object.assign(Object.assign({}, _style__WEBPACK_IMPORTED_MODULE_1__.textEllipsis), {
                    paddingInline: paddingXS
                })
            }
        }
    ];
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getVerticalStyle);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/modal/locale.js":
/*!***************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/modal/locale.js ***!
  \***************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   changeConfirmLocale: () => (/* binding */ changeConfirmLocale),
/* harmony export */   getConfirmLocale: () => (/* binding */ getConfirmLocale)
/* harmony export */ });
/* harmony import */ var _locale_en_US__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../locale/en_US */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/locale/en_US.js");

let runtimeLocale = Object.assign({}, _locale_en_US__WEBPACK_IMPORTED_MODULE_0__["default"].Modal);
let localeList = [];
const generateLocale = ()=>localeList.reduce((merged, locale)=>Object.assign(Object.assign({}, merged), locale), _locale_en_US__WEBPACK_IMPORTED_MODULE_0__["default"].Modal);
function changeConfirmLocale(newLocale) {
    if (newLocale) {
        const cloneLocale = Object.assign({}, newLocale);
        localeList.push(cloneLocale);
        runtimeLocale = generateLocale();
        return ()=>{
            localeList = localeList.filter((locale)=>locale !== cloneLocale);
            runtimeLocale = generateLocale();
        };
    }
    runtimeLocale = Object.assign({}, _locale_en_US__WEBPACK_IMPORTED_MODULE_0__["default"].Modal);
}
function getConfirmLocale() {
    return runtimeLocale;
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/space/Compact.js":
/*!****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/space/Compact.js ***!
  \****************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NoCompactStyle: () => (/* binding */ NoCompactStyle),
/* harmony export */   SpaceCompactItemContext: () => (/* binding */ SpaceCompactItemContext),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   useCompactItemContext: () => (/* binding */ useCompactItemContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var rc_util_es_Children_toArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rc-util/es/Children/toArray */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/es/Children/toArray.js");
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../config-provider */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/index.js");
/* harmony import */ var _config_provider_hooks_useSize__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../config-provider/hooks/useSize */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/hooks/useSize.js");
/* harmony import */ var _style__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./style */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/space/style/index.js");
/* __next_internal_client_entry_do_not_use__ SpaceCompactItemContext,useCompactItemContext,NoCompactStyle,default auto */ var __rest = undefined && undefined.__rest || function(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
};






const SpaceCompactItemContext = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createContext(null);
const useCompactItemContext = (prefixCls, direction)=>{
    const compactItemContext = react__WEBPACK_IMPORTED_MODULE_0__.useContext(SpaceCompactItemContext);
    const compactItemClassnames = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>{
        if (!compactItemContext) {
            return "";
        }
        const { compactDirection, isFirstItem, isLastItem } = compactItemContext;
        const separator = compactDirection === "vertical" ? "-vertical-" : "-";
        return classnames__WEBPACK_IMPORTED_MODULE_1___default()(`${prefixCls}-compact${separator}item`, {
            [`${prefixCls}-compact${separator}first-item`]: isFirstItem,
            [`${prefixCls}-compact${separator}last-item`]: isLastItem,
            [`${prefixCls}-compact${separator}item-rtl`]: direction === "rtl"
        });
    }, [
        prefixCls,
        direction,
        compactItemContext
    ]);
    return {
        compactSize: compactItemContext === null || compactItemContext === void 0 ? void 0 : compactItemContext.compactSize,
        compactDirection: compactItemContext === null || compactItemContext === void 0 ? void 0 : compactItemContext.compactDirection,
        compactItemClassnames
    };
};
const NoCompactStyle = (_ref)=>{
    let { children } = _ref;
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(SpaceCompactItemContext.Provider, {
        value: null
    }, children);
};
const CompactItem = (_a)=>{
    var { children } = _a, otherProps = __rest(_a, [
        "children"
    ]);
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(SpaceCompactItemContext.Provider, {
        value: otherProps
    }, children);
};
const Compact = (props)=>{
    const { getPrefixCls, direction: directionConfig } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(_config_provider__WEBPACK_IMPORTED_MODULE_3__.ConfigContext);
    const { size, direction, block, prefixCls: customizePrefixCls, className, rootClassName, children } = props, restProps = __rest(props, [
        "size",
        "direction",
        "block",
        "prefixCls",
        "className",
        "rootClassName",
        "children"
    ]);
    const mergedSize = (0,_config_provider_hooks_useSize__WEBPACK_IMPORTED_MODULE_4__["default"])((ctx)=>size !== null && size !== void 0 ? size : ctx);
    const prefixCls = getPrefixCls("space-compact", customizePrefixCls);
    const [wrapCSSVar, hashId] = (0,_style__WEBPACK_IMPORTED_MODULE_5__["default"])(prefixCls);
    const clx = classnames__WEBPACK_IMPORTED_MODULE_1___default()(prefixCls, hashId, {
        [`${prefixCls}-rtl`]: directionConfig === "rtl",
        [`${prefixCls}-block`]: block,
        [`${prefixCls}-vertical`]: direction === "vertical"
    }, className, rootClassName);
    const compactItemContext = react__WEBPACK_IMPORTED_MODULE_0__.useContext(SpaceCompactItemContext);
    const childNodes = (0,rc_util_es_Children_toArray__WEBPACK_IMPORTED_MODULE_2__["default"])(children);
    const nodes = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>childNodes.map((child, i)=>{
            const key = (child === null || child === void 0 ? void 0 : child.key) || `${prefixCls}-item-${i}`;
            return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(CompactItem, {
                key: key,
                compactSize: mergedSize,
                compactDirection: direction,
                isFirstItem: i === 0 && (!compactItemContext || (compactItemContext === null || compactItemContext === void 0 ? void 0 : compactItemContext.isFirstItem)),
                isLastItem: i === childNodes.length - 1 && (!compactItemContext || (compactItemContext === null || compactItemContext === void 0 ? void 0 : compactItemContext.isLastItem))
            }, child);
        }), [
        size,
        childNodes,
        compactItemContext
    ]);
    // =========================== Render ===========================
    if (childNodes.length === 0) {
        return null;
    }
    return wrapCSSVar(/*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", Object.assign({
        className: clx
    }, restProps), nodes));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Compact);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/space/style/compact.js":
/*!**********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/space/style/compact.js ***!
  \**********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const genSpaceCompactStyle = (token)=>{
    const { componentCls } = token;
    return {
        [componentCls]: {
            "&-block": {
                display: "flex",
                width: "100%"
            },
            "&-vertical": {
                flexDirection: "column"
            }
        }
    };
};
// ============================== Export ==============================
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (genSpaceCompactStyle);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/space/style/index.js":
/*!********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/space/style/index.js ***!
  \********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   prepareComponentToken: () => (/* binding */ prepareComponentToken)
/* harmony export */ });
/* harmony import */ var _theme_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../theme/internal */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/internal.js");
/* harmony import */ var _compact__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./compact */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/space/style/compact.js");


const genSpaceStyle = (token)=>{
    const { componentCls, antCls } = token;
    return {
        [componentCls]: {
            display: "inline-flex",
            "&-rtl": {
                direction: "rtl"
            },
            "&-vertical": {
                flexDirection: "column"
            },
            "&-align": {
                flexDirection: "column",
                "&-center": {
                    alignItems: "center"
                },
                "&-start": {
                    alignItems: "flex-start"
                },
                "&-end": {
                    alignItems: "flex-end"
                },
                "&-baseline": {
                    alignItems: "baseline"
                }
            },
            [`${componentCls}-item:empty`]: {
                display: "none"
            },
            // https://github.com/ant-design/ant-design/issues/47875
            [`${componentCls}-item > ${antCls}-badge-not-a-wrapper:only-child`]: {
                display: "block"
            }
        }
    };
};
const genSpaceGapStyle = (token)=>{
    const { componentCls } = token;
    return {
        [componentCls]: {
            "&-gap-row-small": {
                rowGap: token.spaceGapSmallSize
            },
            "&-gap-row-middle": {
                rowGap: token.spaceGapMiddleSize
            },
            "&-gap-row-large": {
                rowGap: token.spaceGapLargeSize
            },
            "&-gap-col-small": {
                columnGap: token.spaceGapSmallSize
            },
            "&-gap-col-middle": {
                columnGap: token.spaceGapMiddleSize
            },
            "&-gap-col-large": {
                columnGap: token.spaceGapLargeSize
            }
        }
    };
};
// ============================== Export ==============================
const prepareComponentToken = ()=>({});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_theme_internal__WEBPACK_IMPORTED_MODULE_0__.genStyleHooks)("Space", (token)=>{
    const spaceToken = (0,_theme_internal__WEBPACK_IMPORTED_MODULE_0__.mergeToken)(token, {
        spaceGapSmallSize: token.paddingXS,
        spaceGapMiddleSize: token.padding,
        spaceGapLargeSize: token.paddingLG
    });
    return [
        genSpaceStyle(spaceToken),
        genSpaceGapStyle(spaceToken),
        (0,_compact__WEBPACK_IMPORTED_MODULE_1__["default"])(spaceToken)
    ];
}, ()=>({}), {
    // Space component don't apply extra font style
    // https://github.com/ant-design/ant-design/issues/40315
    resetStyle: false
}));


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/index.js":
/*!**************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/index.js ***!
  \**************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearFix: () => (/* binding */ clearFix),
/* harmony export */   genCommonStyle: () => (/* binding */ genCommonStyle),
/* harmony export */   genFocusOutline: () => (/* binding */ genFocusOutline),
/* harmony export */   genFocusStyle: () => (/* binding */ genFocusStyle),
/* harmony export */   genLinkStyle: () => (/* binding */ genLinkStyle),
/* harmony export */   operationUnit: () => (/* reexport safe */ _operationUnit__WEBPACK_IMPORTED_MODULE_1__.operationUnit),
/* harmony export */   resetComponent: () => (/* binding */ resetComponent),
/* harmony export */   resetIcon: () => (/* binding */ resetIcon),
/* harmony export */   textEllipsis: () => (/* binding */ textEllipsis)
/* harmony export */ });
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _operationUnit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./operationUnit */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/operationUnit.js");
/* __next_internal_client_entry_do_not_use__ operationUnit,textEllipsis,resetComponent,resetIcon,clearFix,genLinkStyle,genCommonStyle,genFocusOutline,genFocusStyle auto */ /* eslint-disable import/prefer-default-export */ 

const textEllipsis = {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis"
};
const resetComponent = function(token) {
    let needInheritFontFamily = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return {
        boxSizing: "border-box",
        margin: 0,
        padding: 0,
        color: token.colorText,
        fontSize: token.fontSize,
        // font-variant: @font-variant-base;
        lineHeight: token.lineHeight,
        listStyle: "none",
        // font-feature-settings: @font-feature-settings-base;
        fontFamily: needInheritFontFamily ? "inherit" : token.fontFamily
    };
};
const resetIcon = ()=>({
        display: "inline-flex",
        alignItems: "center",
        color: "inherit",
        fontStyle: "normal",
        lineHeight: 0,
        textAlign: "center",
        textTransform: "none",
        // for SVG icon, see https://blog.prototypr.io/align-svg-icons-to-text-and-say-goodbye-to-font-icons-d44b3d7b26b4
        verticalAlign: "-0.125em",
        textRendering: "optimizeLegibility",
        "-webkit-font-smoothing": "antialiased",
        "-moz-osx-font-smoothing": "grayscale",
        "> *": {
            lineHeight: 1
        },
        svg: {
            display: "inline-block"
        }
    });
const clearFix = ()=>({
        // https://github.com/ant-design/ant-design/issues/21301#issuecomment-583955229
        "&::before": {
            display: "table",
            content: '""'
        },
        "&::after": {
            // https://github.com/ant-design/ant-design/issues/21864
            display: "table",
            clear: "both",
            content: '""'
        }
    });
const genLinkStyle = (token)=>({
        a: {
            color: token.colorLink,
            textDecoration: token.linkDecoration,
            backgroundColor: "transparent",
            // remove the gray background on active links in IE 10.
            outline: "none",
            cursor: "pointer",
            transition: `color ${token.motionDurationSlow}`,
            "-webkit-text-decoration-skip": "objects",
            // remove gaps in links underline in iOS 8+ and Safari 8+.
            "&:hover": {
                color: token.colorLinkHover
            },
            "&:active": {
                color: token.colorLinkActive
            },
            "&:active, &:hover": {
                textDecoration: token.linkHoverDecoration,
                outline: 0
            },
            // https://github.com/ant-design/ant-design/issues/22503
            "&:focus": {
                textDecoration: token.linkFocusDecoration,
                outline: 0
            },
            "&[disabled]": {
                color: token.colorTextDisabled,
                cursor: "not-allowed"
            }
        }
    });
const genCommonStyle = (token, componentPrefixCls, rootCls, resetFont)=>{
    const prefixSelector = `[class^="${componentPrefixCls}"], [class*=" ${componentPrefixCls}"]`;
    const rootPrefixSelector = rootCls ? `.${rootCls}` : prefixSelector;
    const resetStyle = {
        boxSizing: "border-box",
        "&::before, &::after": {
            boxSizing: "border-box"
        }
    };
    let resetFontStyle = {};
    if (resetFont !== false) {
        resetFontStyle = {
            fontFamily: token.fontFamily,
            fontSize: token.fontSize
        };
    }
    return {
        [rootPrefixSelector]: Object.assign(Object.assign(Object.assign({}, resetFontStyle), resetStyle), {
            [prefixSelector]: resetStyle
        })
    };
};
const genFocusOutline = (token)=>({
        outline: `${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(token.lineWidthFocus)} solid ${token.colorPrimaryBorder}`,
        outlineOffset: 1,
        transition: "outline-offset 0s, outline 0s"
    });
const genFocusStyle = (token)=>({
        "&:focus-visible": Object.assign({}, genFocusOutline(token))
    });


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/collapse.js":
/*!************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/collapse.js ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const genCollapseMotion = (token)=>({
        [token.componentCls]: {
            // For common/openAnimation
            [`${token.antCls}-motion-collapse-legacy`]: {
                overflow: "hidden",
                "&-active": {
                    transition: `height ${token.motionDurationMid} ${token.motionEaseInOut},
        opacity ${token.motionDurationMid} ${token.motionEaseInOut} !important`
                }
            },
            [`${token.antCls}-motion-collapse`]: {
                overflow: "hidden",
                transition: `height ${token.motionDurationMid} ${token.motionEaseInOut},
        opacity ${token.motionDurationMid} ${token.motionEaseInOut} !important`
            }
        }
    });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (genCollapseMotion);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/fade.js":
/*!********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/fade.js ***!
  \********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fadeIn: () => (/* binding */ fadeIn),
/* harmony export */   fadeOut: () => (/* binding */ fadeOut),
/* harmony export */   initFadeMotion: () => (/* binding */ initFadeMotion)
/* harmony export */ });
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _motion__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./motion */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/motion.js");


const fadeIn = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antFadeIn", {
    "0%": {
        opacity: 0
    },
    "100%": {
        opacity: 1
    }
});
const fadeOut = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antFadeOut", {
    "0%": {
        opacity: 1
    },
    "100%": {
        opacity: 0
    }
});
const initFadeMotion = function(token) {
    let sameLevel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    const { antCls } = token;
    const motionCls = `${antCls}-fade`;
    const sameLevelPrefix = sameLevel ? "&" : "";
    return [
        (0,_motion__WEBPACK_IMPORTED_MODULE_1__.initMotion)(motionCls, fadeIn, fadeOut, token.motionDurationMid, sameLevel),
        {
            [`
        ${sameLevelPrefix}${motionCls}-enter,
        ${sameLevelPrefix}${motionCls}-appear
      `]: {
                opacity: 0,
                animationTimingFunction: "linear"
            },
            [`${sameLevelPrefix}${motionCls}-leave`]: {
                animationTimingFunction: "linear"
            }
        }
    ];
};


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/index.js":
/*!*********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/index.js ***!
  \*********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fadeIn: () => (/* reexport safe */ _fade__WEBPACK_IMPORTED_MODULE_2__.fadeIn),
/* harmony export */   fadeOut: () => (/* reexport safe */ _fade__WEBPACK_IMPORTED_MODULE_2__.fadeOut),
/* harmony export */   genCollapseMotion: () => (/* reexport safe */ _collapse__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   initFadeMotion: () => (/* reexport safe */ _fade__WEBPACK_IMPORTED_MODULE_2__.initFadeMotion),
/* harmony export */   initMoveMotion: () => (/* reexport safe */ _move__WEBPACK_IMPORTED_MODULE_3__.initMoveMotion),
/* harmony export */   initSlideMotion: () => (/* reexport safe */ _slide__WEBPACK_IMPORTED_MODULE_0__.initSlideMotion),
/* harmony export */   initZoomMotion: () => (/* reexport safe */ _zoom__WEBPACK_IMPORTED_MODULE_1__.initZoomMotion),
/* harmony export */   moveDownIn: () => (/* reexport safe */ _move__WEBPACK_IMPORTED_MODULE_3__.moveDownIn),
/* harmony export */   moveDownOut: () => (/* reexport safe */ _move__WEBPACK_IMPORTED_MODULE_3__.moveDownOut),
/* harmony export */   moveLeftIn: () => (/* reexport safe */ _move__WEBPACK_IMPORTED_MODULE_3__.moveLeftIn),
/* harmony export */   moveLeftOut: () => (/* reexport safe */ _move__WEBPACK_IMPORTED_MODULE_3__.moveLeftOut),
/* harmony export */   moveRightIn: () => (/* reexport safe */ _move__WEBPACK_IMPORTED_MODULE_3__.moveRightIn),
/* harmony export */   moveRightOut: () => (/* reexport safe */ _move__WEBPACK_IMPORTED_MODULE_3__.moveRightOut),
/* harmony export */   moveUpIn: () => (/* reexport safe */ _move__WEBPACK_IMPORTED_MODULE_3__.moveUpIn),
/* harmony export */   moveUpOut: () => (/* reexport safe */ _move__WEBPACK_IMPORTED_MODULE_3__.moveUpOut),
/* harmony export */   slideDownIn: () => (/* reexport safe */ _slide__WEBPACK_IMPORTED_MODULE_0__.slideDownIn),
/* harmony export */   slideDownOut: () => (/* reexport safe */ _slide__WEBPACK_IMPORTED_MODULE_0__.slideDownOut),
/* harmony export */   slideLeftIn: () => (/* reexport safe */ _slide__WEBPACK_IMPORTED_MODULE_0__.slideLeftIn),
/* harmony export */   slideLeftOut: () => (/* reexport safe */ _slide__WEBPACK_IMPORTED_MODULE_0__.slideLeftOut),
/* harmony export */   slideRightIn: () => (/* reexport safe */ _slide__WEBPACK_IMPORTED_MODULE_0__.slideRightIn),
/* harmony export */   slideRightOut: () => (/* reexport safe */ _slide__WEBPACK_IMPORTED_MODULE_0__.slideRightOut),
/* harmony export */   slideUpIn: () => (/* reexport safe */ _slide__WEBPACK_IMPORTED_MODULE_0__.slideUpIn),
/* harmony export */   slideUpOut: () => (/* reexport safe */ _slide__WEBPACK_IMPORTED_MODULE_0__.slideUpOut),
/* harmony export */   zoomBigIn: () => (/* reexport safe */ _zoom__WEBPACK_IMPORTED_MODULE_1__.zoomBigIn),
/* harmony export */   zoomBigOut: () => (/* reexport safe */ _zoom__WEBPACK_IMPORTED_MODULE_1__.zoomBigOut),
/* harmony export */   zoomDownIn: () => (/* reexport safe */ _zoom__WEBPACK_IMPORTED_MODULE_1__.zoomDownIn),
/* harmony export */   zoomDownOut: () => (/* reexport safe */ _zoom__WEBPACK_IMPORTED_MODULE_1__.zoomDownOut),
/* harmony export */   zoomIn: () => (/* reexport safe */ _zoom__WEBPACK_IMPORTED_MODULE_1__.zoomIn),
/* harmony export */   zoomLeftIn: () => (/* reexport safe */ _zoom__WEBPACK_IMPORTED_MODULE_1__.zoomLeftIn),
/* harmony export */   zoomLeftOut: () => (/* reexport safe */ _zoom__WEBPACK_IMPORTED_MODULE_1__.zoomLeftOut),
/* harmony export */   zoomOut: () => (/* reexport safe */ _zoom__WEBPACK_IMPORTED_MODULE_1__.zoomOut),
/* harmony export */   zoomRightIn: () => (/* reexport safe */ _zoom__WEBPACK_IMPORTED_MODULE_1__.zoomRightIn),
/* harmony export */   zoomRightOut: () => (/* reexport safe */ _zoom__WEBPACK_IMPORTED_MODULE_1__.zoomRightOut),
/* harmony export */   zoomUpIn: () => (/* reexport safe */ _zoom__WEBPACK_IMPORTED_MODULE_1__.zoomUpIn),
/* harmony export */   zoomUpOut: () => (/* reexport safe */ _zoom__WEBPACK_IMPORTED_MODULE_1__.zoomUpOut)
/* harmony export */ });
/* harmony import */ var _collapse__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./collapse */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/collapse.js");
/* harmony import */ var _fade__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./fade */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/fade.js");
/* harmony import */ var _move__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./move */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/move.js");
/* harmony import */ var _slide__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./slide */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/slide.js");
/* harmony import */ var _zoom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./zoom */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/zoom.js");








/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/motion.js":
/*!**********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/motion.js ***!
  \**********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initMotion: () => (/* binding */ initMotion)
/* harmony export */ });
const initMotionCommon = (duration)=>({
        animationDuration: duration,
        animationFillMode: "both"
    });
// FIXME: origin less code seems same as initMotionCommon. Maybe we can safe remove
const initMotionCommonLeave = (duration)=>({
        animationDuration: duration,
        animationFillMode: "both"
    });
const initMotion = function(motionCls, inKeyframes, outKeyframes, duration) {
    let sameLevel = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    const sameLevelPrefix = sameLevel ? "&" : "";
    return {
        [`
      ${sameLevelPrefix}${motionCls}-enter,
      ${sameLevelPrefix}${motionCls}-appear
    `]: Object.assign(Object.assign({}, initMotionCommon(duration)), {
            animationPlayState: "paused"
        }),
        [`${sameLevelPrefix}${motionCls}-leave`]: Object.assign(Object.assign({}, initMotionCommonLeave(duration)), {
            animationPlayState: "paused"
        }),
        [`
      ${sameLevelPrefix}${motionCls}-enter${motionCls}-enter-active,
      ${sameLevelPrefix}${motionCls}-appear${motionCls}-appear-active
    `]: {
            animationName: inKeyframes,
            animationPlayState: "running"
        },
        [`${sameLevelPrefix}${motionCls}-leave${motionCls}-leave-active`]: {
            animationName: outKeyframes,
            animationPlayState: "running",
            pointerEvents: "none"
        }
    };
};


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/move.js":
/*!********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/move.js ***!
  \********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initMoveMotion: () => (/* binding */ initMoveMotion),
/* harmony export */   moveDownIn: () => (/* binding */ moveDownIn),
/* harmony export */   moveDownOut: () => (/* binding */ moveDownOut),
/* harmony export */   moveLeftIn: () => (/* binding */ moveLeftIn),
/* harmony export */   moveLeftOut: () => (/* binding */ moveLeftOut),
/* harmony export */   moveRightIn: () => (/* binding */ moveRightIn),
/* harmony export */   moveRightOut: () => (/* binding */ moveRightOut),
/* harmony export */   moveUpIn: () => (/* binding */ moveUpIn),
/* harmony export */   moveUpOut: () => (/* binding */ moveUpOut)
/* harmony export */ });
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _motion__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./motion */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/motion.js");


const moveDownIn = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antMoveDownIn", {
    "0%": {
        transform: "translate3d(0, 100%, 0)",
        transformOrigin: "0 0",
        opacity: 0
    },
    "100%": {
        transform: "translate3d(0, 0, 0)",
        transformOrigin: "0 0",
        opacity: 1
    }
});
const moveDownOut = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antMoveDownOut", {
    "0%": {
        transform: "translate3d(0, 0, 0)",
        transformOrigin: "0 0",
        opacity: 1
    },
    "100%": {
        transform: "translate3d(0, 100%, 0)",
        transformOrigin: "0 0",
        opacity: 0
    }
});
const moveLeftIn = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antMoveLeftIn", {
    "0%": {
        transform: "translate3d(-100%, 0, 0)",
        transformOrigin: "0 0",
        opacity: 0
    },
    "100%": {
        transform: "translate3d(0, 0, 0)",
        transformOrigin: "0 0",
        opacity: 1
    }
});
const moveLeftOut = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antMoveLeftOut", {
    "0%": {
        transform: "translate3d(0, 0, 0)",
        transformOrigin: "0 0",
        opacity: 1
    },
    "100%": {
        transform: "translate3d(-100%, 0, 0)",
        transformOrigin: "0 0",
        opacity: 0
    }
});
const moveRightIn = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antMoveRightIn", {
    "0%": {
        transform: "translate3d(100%, 0, 0)",
        transformOrigin: "0 0",
        opacity: 0
    },
    "100%": {
        transform: "translate3d(0, 0, 0)",
        transformOrigin: "0 0",
        opacity: 1
    }
});
const moveRightOut = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antMoveRightOut", {
    "0%": {
        transform: "translate3d(0, 0, 0)",
        transformOrigin: "0 0",
        opacity: 1
    },
    "100%": {
        transform: "translate3d(100%, 0, 0)",
        transformOrigin: "0 0",
        opacity: 0
    }
});
const moveUpIn = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antMoveUpIn", {
    "0%": {
        transform: "translate3d(0, -100%, 0)",
        transformOrigin: "0 0",
        opacity: 0
    },
    "100%": {
        transform: "translate3d(0, 0, 0)",
        transformOrigin: "0 0",
        opacity: 1
    }
});
const moveUpOut = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antMoveUpOut", {
    "0%": {
        transform: "translate3d(0, 0, 0)",
        transformOrigin: "0 0",
        opacity: 1
    },
    "100%": {
        transform: "translate3d(0, -100%, 0)",
        transformOrigin: "0 0",
        opacity: 0
    }
});
const moveMotion = {
    "move-up": {
        inKeyframes: moveUpIn,
        outKeyframes: moveUpOut
    },
    "move-down": {
        inKeyframes: moveDownIn,
        outKeyframes: moveDownOut
    },
    "move-left": {
        inKeyframes: moveLeftIn,
        outKeyframes: moveLeftOut
    },
    "move-right": {
        inKeyframes: moveRightIn,
        outKeyframes: moveRightOut
    }
};
const initMoveMotion = (token, motionName)=>{
    const { antCls } = token;
    const motionCls = `${antCls}-${motionName}`;
    const { inKeyframes, outKeyframes } = moveMotion[motionName];
    return [
        (0,_motion__WEBPACK_IMPORTED_MODULE_1__.initMotion)(motionCls, inKeyframes, outKeyframes, token.motionDurationMid),
        {
            [`
        ${motionCls}-enter,
        ${motionCls}-appear
      `]: {
                opacity: 0,
                animationTimingFunction: token.motionEaseOutCirc
            },
            [`${motionCls}-leave`]: {
                animationTimingFunction: token.motionEaseInOutCirc
            }
        }
    ];
};


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/slide.js":
/*!*********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/slide.js ***!
  \*********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initSlideMotion: () => (/* binding */ initSlideMotion),
/* harmony export */   slideDownIn: () => (/* binding */ slideDownIn),
/* harmony export */   slideDownOut: () => (/* binding */ slideDownOut),
/* harmony export */   slideLeftIn: () => (/* binding */ slideLeftIn),
/* harmony export */   slideLeftOut: () => (/* binding */ slideLeftOut),
/* harmony export */   slideRightIn: () => (/* binding */ slideRightIn),
/* harmony export */   slideRightOut: () => (/* binding */ slideRightOut),
/* harmony export */   slideUpIn: () => (/* binding */ slideUpIn),
/* harmony export */   slideUpOut: () => (/* binding */ slideUpOut)
/* harmony export */ });
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _motion__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./motion */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/motion.js");


const slideUpIn = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antSlideUpIn", {
    "0%": {
        transform: "scaleY(0.8)",
        transformOrigin: "0% 0%",
        opacity: 0
    },
    "100%": {
        transform: "scaleY(1)",
        transformOrigin: "0% 0%",
        opacity: 1
    }
});
const slideUpOut = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antSlideUpOut", {
    "0%": {
        transform: "scaleY(1)",
        transformOrigin: "0% 0%",
        opacity: 1
    },
    "100%": {
        transform: "scaleY(0.8)",
        transformOrigin: "0% 0%",
        opacity: 0
    }
});
const slideDownIn = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antSlideDownIn", {
    "0%": {
        transform: "scaleY(0.8)",
        transformOrigin: "100% 100%",
        opacity: 0
    },
    "100%": {
        transform: "scaleY(1)",
        transformOrigin: "100% 100%",
        opacity: 1
    }
});
const slideDownOut = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antSlideDownOut", {
    "0%": {
        transform: "scaleY(1)",
        transformOrigin: "100% 100%",
        opacity: 1
    },
    "100%": {
        transform: "scaleY(0.8)",
        transformOrigin: "100% 100%",
        opacity: 0
    }
});
const slideLeftIn = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antSlideLeftIn", {
    "0%": {
        transform: "scaleX(0.8)",
        transformOrigin: "0% 0%",
        opacity: 0
    },
    "100%": {
        transform: "scaleX(1)",
        transformOrigin: "0% 0%",
        opacity: 1
    }
});
const slideLeftOut = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antSlideLeftOut", {
    "0%": {
        transform: "scaleX(1)",
        transformOrigin: "0% 0%",
        opacity: 1
    },
    "100%": {
        transform: "scaleX(0.8)",
        transformOrigin: "0% 0%",
        opacity: 0
    }
});
const slideRightIn = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antSlideRightIn", {
    "0%": {
        transform: "scaleX(0.8)",
        transformOrigin: "100% 0%",
        opacity: 0
    },
    "100%": {
        transform: "scaleX(1)",
        transformOrigin: "100% 0%",
        opacity: 1
    }
});
const slideRightOut = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antSlideRightOut", {
    "0%": {
        transform: "scaleX(1)",
        transformOrigin: "100% 0%",
        opacity: 1
    },
    "100%": {
        transform: "scaleX(0.8)",
        transformOrigin: "100% 0%",
        opacity: 0
    }
});
const slideMotion = {
    "slide-up": {
        inKeyframes: slideUpIn,
        outKeyframes: slideUpOut
    },
    "slide-down": {
        inKeyframes: slideDownIn,
        outKeyframes: slideDownOut
    },
    "slide-left": {
        inKeyframes: slideLeftIn,
        outKeyframes: slideLeftOut
    },
    "slide-right": {
        inKeyframes: slideRightIn,
        outKeyframes: slideRightOut
    }
};
const initSlideMotion = (token, motionName)=>{
    const { antCls } = token;
    const motionCls = `${antCls}-${motionName}`;
    const { inKeyframes, outKeyframes } = slideMotion[motionName];
    return [
        (0,_motion__WEBPACK_IMPORTED_MODULE_1__.initMotion)(motionCls, inKeyframes, outKeyframes, token.motionDurationMid),
        {
            [`
      ${motionCls}-enter,
      ${motionCls}-appear
    `]: {
                transform: "scale(0)",
                transformOrigin: "0% 0%",
                opacity: 0,
                animationTimingFunction: token.motionEaseOutQuint,
                "&-prepare": {
                    transform: "scale(1)"
                }
            },
            [`${motionCls}-leave`]: {
                animationTimingFunction: token.motionEaseInQuint
            }
        }
    ];
};


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/zoom.js":
/*!********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/zoom.js ***!
  \********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initZoomMotion: () => (/* binding */ initZoomMotion),
/* harmony export */   zoomBigIn: () => (/* binding */ zoomBigIn),
/* harmony export */   zoomBigOut: () => (/* binding */ zoomBigOut),
/* harmony export */   zoomDownIn: () => (/* binding */ zoomDownIn),
/* harmony export */   zoomDownOut: () => (/* binding */ zoomDownOut),
/* harmony export */   zoomIn: () => (/* binding */ zoomIn),
/* harmony export */   zoomLeftIn: () => (/* binding */ zoomLeftIn),
/* harmony export */   zoomLeftOut: () => (/* binding */ zoomLeftOut),
/* harmony export */   zoomOut: () => (/* binding */ zoomOut),
/* harmony export */   zoomRightIn: () => (/* binding */ zoomRightIn),
/* harmony export */   zoomRightOut: () => (/* binding */ zoomRightOut),
/* harmony export */   zoomUpIn: () => (/* binding */ zoomUpIn),
/* harmony export */   zoomUpOut: () => (/* binding */ zoomUpOut)
/* harmony export */ });
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _motion__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./motion */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/motion.js");


const zoomIn = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antZoomIn", {
    "0%": {
        transform: "scale(0.2)",
        opacity: 0
    },
    "100%": {
        transform: "scale(1)",
        opacity: 1
    }
});
const zoomOut = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antZoomOut", {
    "0%": {
        transform: "scale(1)"
    },
    "100%": {
        transform: "scale(0.2)",
        opacity: 0
    }
});
const zoomBigIn = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antZoomBigIn", {
    "0%": {
        transform: "scale(0.8)",
        opacity: 0
    },
    "100%": {
        transform: "scale(1)",
        opacity: 1
    }
});
const zoomBigOut = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antZoomBigOut", {
    "0%": {
        transform: "scale(1)"
    },
    "100%": {
        transform: "scale(0.8)",
        opacity: 0
    }
});
const zoomUpIn = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antZoomUpIn", {
    "0%": {
        transform: "scale(0.8)",
        transformOrigin: "50% 0%",
        opacity: 0
    },
    "100%": {
        transform: "scale(1)",
        transformOrigin: "50% 0%"
    }
});
const zoomUpOut = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antZoomUpOut", {
    "0%": {
        transform: "scale(1)",
        transformOrigin: "50% 0%"
    },
    "100%": {
        transform: "scale(0.8)",
        transformOrigin: "50% 0%",
        opacity: 0
    }
});
const zoomLeftIn = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antZoomLeftIn", {
    "0%": {
        transform: "scale(0.8)",
        transformOrigin: "0% 50%",
        opacity: 0
    },
    "100%": {
        transform: "scale(1)",
        transformOrigin: "0% 50%"
    }
});
const zoomLeftOut = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antZoomLeftOut", {
    "0%": {
        transform: "scale(1)",
        transformOrigin: "0% 50%"
    },
    "100%": {
        transform: "scale(0.8)",
        transformOrigin: "0% 50%",
        opacity: 0
    }
});
const zoomRightIn = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antZoomRightIn", {
    "0%": {
        transform: "scale(0.8)",
        transformOrigin: "100% 50%",
        opacity: 0
    },
    "100%": {
        transform: "scale(1)",
        transformOrigin: "100% 50%"
    }
});
const zoomRightOut = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antZoomRightOut", {
    "0%": {
        transform: "scale(1)",
        transformOrigin: "100% 50%"
    },
    "100%": {
        transform: "scale(0.8)",
        transformOrigin: "100% 50%",
        opacity: 0
    }
});
const zoomDownIn = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antZoomDownIn", {
    "0%": {
        transform: "scale(0.8)",
        transformOrigin: "50% 100%",
        opacity: 0
    },
    "100%": {
        transform: "scale(1)",
        transformOrigin: "50% 100%"
    }
});
const zoomDownOut = new _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.Keyframes("antZoomDownOut", {
    "0%": {
        transform: "scale(1)",
        transformOrigin: "50% 100%"
    },
    "100%": {
        transform: "scale(0.8)",
        transformOrigin: "50% 100%",
        opacity: 0
    }
});
const zoomMotion = {
    zoom: {
        inKeyframes: zoomIn,
        outKeyframes: zoomOut
    },
    "zoom-big": {
        inKeyframes: zoomBigIn,
        outKeyframes: zoomBigOut
    },
    "zoom-big-fast": {
        inKeyframes: zoomBigIn,
        outKeyframes: zoomBigOut
    },
    "zoom-left": {
        inKeyframes: zoomLeftIn,
        outKeyframes: zoomLeftOut
    },
    "zoom-right": {
        inKeyframes: zoomRightIn,
        outKeyframes: zoomRightOut
    },
    "zoom-up": {
        inKeyframes: zoomUpIn,
        outKeyframes: zoomUpOut
    },
    "zoom-down": {
        inKeyframes: zoomDownIn,
        outKeyframes: zoomDownOut
    }
};
const initZoomMotion = (token, motionName)=>{
    const { antCls } = token;
    const motionCls = `${antCls}-${motionName}`;
    const { inKeyframes, outKeyframes } = zoomMotion[motionName];
    return [
        (0,_motion__WEBPACK_IMPORTED_MODULE_1__.initMotion)(motionCls, inKeyframes, outKeyframes, motionName === "zoom-big-fast" ? token.motionDurationFast : token.motionDurationMid),
        {
            [`
        ${motionCls}-enter,
        ${motionCls}-appear
      `]: {
                transform: "scale(0)",
                opacity: 0,
                animationTimingFunction: token.motionEaseOutCirc,
                "&-prepare": {
                    transform: "none"
                }
            },
            [`${motionCls}-leave`]: {
                animationTimingFunction: token.motionEaseInOutCirc
            }
        }
    ];
};


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/operationUnit.js":
/*!**********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/operationUnit.js ***!
  \**********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   operationUnit: () => (/* binding */ operationUnit)
/* harmony export */ });
// eslint-disable-next-line import/prefer-default-export
const operationUnit = (token)=>({
        // FIXME: This use link but is a operation unit. Seems should be a colorPrimary.
        // And Typography use this to generate link style which should not do this.
        color: token.colorLink,
        textDecoration: "none",
        outline: "none",
        cursor: "pointer",
        transition: `color ${token.motionDurationSlow}`,
        "&:focus, &:hover": {
            color: token.colorLinkHover
        },
        "&:active": {
            color: token.colorLinkActive
        }
    });


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/placementArrow.js":
/*!***********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/placementArrow.js ***!
  \***********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MAX_VERTICAL_CONTENT_RADIUS: () => (/* binding */ MAX_VERTICAL_CONTENT_RADIUS),
/* harmony export */   "default": () => (/* binding */ getArrowStyle),
/* harmony export */   getArrowOffsetToken: () => (/* binding */ getArrowOffsetToken)
/* harmony export */ });
/* harmony import */ var _roundedArrow__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./roundedArrow */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/roundedArrow.js");

const MAX_VERTICAL_CONTENT_RADIUS = 8;
function getArrowOffsetToken(options) {
    const { contentRadius, limitVerticalRadius } = options;
    const arrowOffset = contentRadius > 12 ? contentRadius + 2 : 12;
    const arrowOffsetVertical = limitVerticalRadius ? MAX_VERTICAL_CONTENT_RADIUS : arrowOffset;
    return {
        arrowOffsetHorizontal: arrowOffset,
        arrowOffsetVertical
    };
}
function isInject(valid, code) {
    if (!valid) {
        return {};
    }
    return code;
}
function getArrowStyle(token, colorBg, options) {
    const { componentCls, boxShadowPopoverArrow, arrowOffsetVertical, arrowOffsetHorizontal } = token;
    const { arrowDistance = 0, arrowPlacement = {
        left: true,
        right: true,
        top: true,
        bottom: true
    } } = options || {};
    return {
        [componentCls]: Object.assign(Object.assign(Object.assign(Object.assign({
            // ============================ Basic ============================
            [`${componentCls}-arrow`]: [
                Object.assign(Object.assign({
                    position: "absolute",
                    zIndex: 1,
                    display: "block"
                }, (0,_roundedArrow__WEBPACK_IMPORTED_MODULE_0__.genRoundedArrow)(token, colorBg, boxShadowPopoverArrow)), {
                    "&:before": {
                        background: colorBg
                    }
                })
            ]
        }, isInject(!!arrowPlacement.top, {
            [[
                `&-placement-top > ${componentCls}-arrow`,
                `&-placement-topLeft > ${componentCls}-arrow`,
                `&-placement-topRight > ${componentCls}-arrow`
            ].join(",")]: {
                bottom: arrowDistance,
                transform: "translateY(100%) rotate(180deg)"
            },
            [`&-placement-top > ${componentCls}-arrow`]: {
                left: {
                    _skip_check_: true,
                    value: "50%"
                },
                transform: "translateX(-50%) translateY(100%) rotate(180deg)"
            },
            [`&-placement-topLeft > ${componentCls}-arrow`]: {
                left: {
                    _skip_check_: true,
                    value: arrowOffsetHorizontal
                }
            },
            [`&-placement-topRight > ${componentCls}-arrow`]: {
                right: {
                    _skip_check_: true,
                    value: arrowOffsetHorizontal
                }
            }
        })), isInject(!!arrowPlacement.bottom, {
            [[
                `&-placement-bottom > ${componentCls}-arrow`,
                `&-placement-bottomLeft > ${componentCls}-arrow`,
                `&-placement-bottomRight > ${componentCls}-arrow`
            ].join(",")]: {
                top: arrowDistance,
                transform: `translateY(-100%)`
            },
            [`&-placement-bottom > ${componentCls}-arrow`]: {
                left: {
                    _skip_check_: true,
                    value: "50%"
                },
                transform: `translateX(-50%) translateY(-100%)`
            },
            [`&-placement-bottomLeft > ${componentCls}-arrow`]: {
                left: {
                    _skip_check_: true,
                    value: arrowOffsetHorizontal
                }
            },
            [`&-placement-bottomRight > ${componentCls}-arrow`]: {
                right: {
                    _skip_check_: true,
                    value: arrowOffsetHorizontal
                }
            }
        })), isInject(!!arrowPlacement.left, {
            [[
                `&-placement-left > ${componentCls}-arrow`,
                `&-placement-leftTop > ${componentCls}-arrow`,
                `&-placement-leftBottom > ${componentCls}-arrow`
            ].join(",")]: {
                right: {
                    _skip_check_: true,
                    value: arrowDistance
                },
                transform: "translateX(100%) rotate(90deg)"
            },
            [`&-placement-left > ${componentCls}-arrow`]: {
                top: {
                    _skip_check_: true,
                    value: "50%"
                },
                transform: "translateY(-50%) translateX(100%) rotate(90deg)"
            },
            [`&-placement-leftTop > ${componentCls}-arrow`]: {
                top: arrowOffsetVertical
            },
            [`&-placement-leftBottom > ${componentCls}-arrow`]: {
                bottom: arrowOffsetVertical
            }
        })), isInject(!!arrowPlacement.right, {
            [[
                `&-placement-right > ${componentCls}-arrow`,
                `&-placement-rightTop > ${componentCls}-arrow`,
                `&-placement-rightBottom > ${componentCls}-arrow`
            ].join(",")]: {
                left: {
                    _skip_check_: true,
                    value: arrowDistance
                },
                transform: "translateX(-100%) rotate(-90deg)"
            },
            [`&-placement-right > ${componentCls}-arrow`]: {
                top: {
                    _skip_check_: true,
                    value: "50%"
                },
                transform: "translateY(-50%) translateX(-100%) rotate(-90deg)"
            },
            [`&-placement-rightTop > ${componentCls}-arrow`]: {
                top: arrowOffsetVertical
            },
            [`&-placement-rightBottom > ${componentCls}-arrow`]: {
                bottom: arrowOffsetVertical
            }
        }))
    };
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/roundedArrow.js":
/*!*********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/roundedArrow.js ***!
  \*********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   genRoundedArrow: () => (/* binding */ genRoundedArrow),
/* harmony export */   getArrowToken: () => (/* binding */ getArrowToken)
/* harmony export */ });
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__);

function getArrowToken(token) {
    const { sizePopupArrow, borderRadiusXS, borderRadiusOuter } = token;
    const unitWidth = sizePopupArrow / 2;
    const ax = 0;
    const ay = unitWidth;
    const bx = borderRadiusOuter * 1 / Math.sqrt(2);
    const by = unitWidth - borderRadiusOuter * (1 - 1 / Math.sqrt(2));
    const cx = unitWidth - borderRadiusXS * (1 / Math.sqrt(2));
    const cy = borderRadiusOuter * (Math.sqrt(2) - 1) + borderRadiusXS * (1 / Math.sqrt(2));
    const dx = 2 * unitWidth - cx;
    const dy = cy;
    const ex = 2 * unitWidth - bx;
    const ey = by;
    const fx = 2 * unitWidth - ax;
    const fy = ay;
    const shadowWidth = unitWidth * Math.sqrt(2) + borderRadiusOuter * (Math.sqrt(2) - 2);
    const polygonOffset = borderRadiusOuter * (Math.sqrt(2) - 1);
    const arrowPolygon = `polygon(${polygonOffset}px 100%, 50% ${polygonOffset}px, ${2 * unitWidth - polygonOffset}px 100%, ${polygonOffset}px 100%)`;
    const arrowPath = `path('M ${ax} ${ay} A ${borderRadiusOuter} ${borderRadiusOuter} 0 0 0 ${bx} ${by} L ${cx} ${cy} A ${borderRadiusXS} ${borderRadiusXS} 0 0 1 ${dx} ${dy} L ${ex} ${ey} A ${borderRadiusOuter} ${borderRadiusOuter} 0 0 0 ${fx} ${fy} Z')`;
    return {
        arrowShadowWidth: shadowWidth,
        arrowPath,
        arrowPolygon
    };
}
const genRoundedArrow = (token, bgColor, boxShadow)=>{
    const { sizePopupArrow, arrowPolygon, arrowPath, arrowShadowWidth, borderRadiusXS, calc } = token;
    return {
        pointerEvents: "none",
        width: sizePopupArrow,
        height: sizePopupArrow,
        overflow: "hidden",
        "&::before": {
            position: "absolute",
            bottom: 0,
            insetInlineStart: 0,
            width: sizePopupArrow,
            height: calc(sizePopupArrow).div(2).equal(),
            background: bgColor,
            clipPath: {
                _multi_value_: true,
                value: [
                    arrowPolygon,
                    arrowPath
                ]
            },
            content: '""'
        },
        "&::after": {
            content: '""',
            position: "absolute",
            width: arrowShadowWidth,
            height: arrowShadowWidth,
            bottom: 0,
            insetInline: 0,
            margin: "auto",
            borderRadius: {
                _skip_check_: true,
                value: `0 0 ${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(borderRadiusXS)} 0`
            },
            transform: "translateY(50%) rotate(-135deg)",
            boxShadow,
            zIndex: 0,
            background: "transparent"
        }
    };
};


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/context.js":
/*!****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/context.js ***!
  \****************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DesignTokenContext: () => (/* binding */ DesignTokenContext),
/* harmony export */   defaultConfig: () => (/* binding */ defaultConfig),
/* harmony export */   defaultTheme: () => (/* binding */ defaultTheme)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _themes_default__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./themes/default */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/default/index.js");
/* harmony import */ var _themes_seed__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./themes/seed */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/seed.js");




const defaultTheme = (0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__.createTheme)(_themes_default__WEBPACK_IMPORTED_MODULE_2__["default"]);
// ================================ Context =================================
// To ensure snapshot stable. We disable hashed in test env.
const defaultConfig = {
    token: _themes_seed__WEBPACK_IMPORTED_MODULE_3__["default"],
    override: {
        override: _themes_seed__WEBPACK_IMPORTED_MODULE_3__["default"]
    },
    hashed: true
};
const DesignTokenContext = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0___default().createContext(defaultConfig);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/interface/index.js":
/*!************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/interface/index.js ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PresetColors: () => (/* reexport safe */ _presetColors__WEBPACK_IMPORTED_MODULE_0__.PresetColors)
/* harmony export */ });
/* harmony import */ var _presetColors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./presetColors */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/interface/presetColors.js");



/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/interface/presetColors.js":
/*!*******************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/interface/presetColors.js ***!
  \*******************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PresetColors: () => (/* binding */ PresetColors)
/* harmony export */ });
const PresetColors = [
    "blue",
    "purple",
    "cyan",
    "green",
    "magenta",
    "pink",
    "red",
    "orange",
    "yellow",
    "volcano",
    "geekblue",
    "lime",
    "gold"
];


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/internal.js":
/*!*****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/internal.js ***!
  \*****************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DesignTokenContext: () => (/* reexport safe */ _context__WEBPACK_IMPORTED_MODULE_1__.DesignTokenContext),
/* harmony export */   PresetColors: () => (/* reexport safe */ _interface__WEBPACK_IMPORTED_MODULE_2__.PresetColors),
/* harmony export */   calc: () => (/* reexport safe */ _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.genCalc),
/* harmony export */   defaultConfig: () => (/* reexport safe */ _context__WEBPACK_IMPORTED_MODULE_1__.defaultConfig),
/* harmony export */   genComponentStyleHook: () => (/* reexport safe */ _util_genComponentStyleHook__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   genPresetColor: () => (/* reexport safe */ _util_genPresetColor__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   genStyleHooks: () => (/* reexport safe */ _util_genComponentStyleHook__WEBPACK_IMPORTED_MODULE_3__.genStyleHooks),
/* harmony export */   genSubStyleComponent: () => (/* reexport safe */ _util_genComponentStyleHook__WEBPACK_IMPORTED_MODULE_3__.genSubStyleComponent),
/* harmony export */   getLineHeight: () => (/* reexport safe */ _themes_shared_genFontSizes__WEBPACK_IMPORTED_MODULE_6__.getLineHeight),
/* harmony export */   mergeToken: () => (/* reexport safe */ _util_statistic__WEBPACK_IMPORTED_MODULE_5__.merge),
/* harmony export */   statisticToken: () => (/* reexport safe */ _util_statistic__WEBPACK_IMPORTED_MODULE_5__["default"]),
/* harmony export */   useResetIconStyle: () => (/* reexport safe */ _util_useResetIconStyle__WEBPACK_IMPORTED_MODULE_7__["default"]),
/* harmony export */   useStyleRegister: () => (/* reexport safe */ _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.useStyleRegister),
/* harmony export */   useToken: () => (/* reexport safe */ _useToken__WEBPACK_IMPORTED_MODULE_8__["default"])
/* harmony export */ });
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _interface__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./interface */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/interface/index.js");
/* harmony import */ var _themes_shared_genFontSizes__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./themes/shared/genFontSizes */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genFontSizes.js");
/* harmony import */ var _useToken__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./useToken */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/useToken.js");
/* harmony import */ var _util_genComponentStyleHook__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util/genComponentStyleHook */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/genComponentStyleHook.js");
/* harmony import */ var _util_genPresetColor__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./util/genPresetColor */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/genPresetColor.js");
/* harmony import */ var _util_statistic__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./util/statistic */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/statistic.js");
/* harmony import */ var _util_useResetIconStyle__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./util/useResetIconStyle */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/useResetIconStyle.js");
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./context */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/context.js");












/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/default/colorAlgorithm.js":
/*!**************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/default/colorAlgorithm.js ***!
  \**************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getAlphaColor: () => (/* binding */ getAlphaColor),
/* harmony export */   getSolidColor: () => (/* binding */ getSolidColor)
/* harmony export */ });
/* harmony import */ var _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ctrl/tinycolor */ "../../node_modules/.pnpm/@ctrl+tinycolor@3.6.1/node_modules/@ctrl/tinycolor/dist/public_api.js");
/* harmony import */ var _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0__);

const getAlphaColor = (baseColor, alpha)=>new _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0__.TinyColor(baseColor).setAlpha(alpha).toRgbString();
const getSolidColor = (baseColor, brightness)=>{
    const instance = new _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0__.TinyColor(baseColor);
    return instance.darken(brightness).toHexString();
};


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/default/colors.js":
/*!******************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/default/colors.js ***!
  \******************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generateColorPalettes: () => (/* binding */ generateColorPalettes),
/* harmony export */   generateNeutralColorPalettes: () => (/* binding */ generateNeutralColorPalettes)
/* harmony export */ });
/* harmony import */ var _ant_design_colors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/colors */ "webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?7e98");
/* harmony import */ var _ant_design_colors__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_colors__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _colorAlgorithm__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./colorAlgorithm */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/default/colorAlgorithm.js");


const generateColorPalettes = (baseColor)=>{
    const colors = (0,_ant_design_colors__WEBPACK_IMPORTED_MODULE_0__.generate)(baseColor);
    return {
        1: colors[0],
        2: colors[1],
        3: colors[2],
        4: colors[3],
        5: colors[4],
        6: colors[5],
        7: colors[6],
        8: colors[4],
        9: colors[5],
        10: colors[6]
    };
};
const generateNeutralColorPalettes = (bgBaseColor, textBaseColor)=>{
    const colorBgBase = bgBaseColor || "#fff";
    const colorTextBase = textBaseColor || "#000";
    return {
        colorBgBase,
        colorTextBase,
        colorText: (0,_colorAlgorithm__WEBPACK_IMPORTED_MODULE_1__.getAlphaColor)(colorTextBase, 0.88),
        colorTextSecondary: (0,_colorAlgorithm__WEBPACK_IMPORTED_MODULE_1__.getAlphaColor)(colorTextBase, 0.65),
        colorTextTertiary: (0,_colorAlgorithm__WEBPACK_IMPORTED_MODULE_1__.getAlphaColor)(colorTextBase, 0.45),
        colorTextQuaternary: (0,_colorAlgorithm__WEBPACK_IMPORTED_MODULE_1__.getAlphaColor)(colorTextBase, 0.25),
        colorFill: (0,_colorAlgorithm__WEBPACK_IMPORTED_MODULE_1__.getAlphaColor)(colorTextBase, 0.15),
        colorFillSecondary: (0,_colorAlgorithm__WEBPACK_IMPORTED_MODULE_1__.getAlphaColor)(colorTextBase, 0.06),
        colorFillTertiary: (0,_colorAlgorithm__WEBPACK_IMPORTED_MODULE_1__.getAlphaColor)(colorTextBase, 0.04),
        colorFillQuaternary: (0,_colorAlgorithm__WEBPACK_IMPORTED_MODULE_1__.getAlphaColor)(colorTextBase, 0.02),
        colorBgLayout: (0,_colorAlgorithm__WEBPACK_IMPORTED_MODULE_1__.getSolidColor)(colorBgBase, 4),
        colorBgContainer: (0,_colorAlgorithm__WEBPACK_IMPORTED_MODULE_1__.getSolidColor)(colorBgBase, 0),
        colorBgElevated: (0,_colorAlgorithm__WEBPACK_IMPORTED_MODULE_1__.getSolidColor)(colorBgBase, 0),
        colorBgSpotlight: (0,_colorAlgorithm__WEBPACK_IMPORTED_MODULE_1__.getAlphaColor)(colorTextBase, 0.85),
        colorBgBlur: "transparent",
        colorBorder: (0,_colorAlgorithm__WEBPACK_IMPORTED_MODULE_1__.getSolidColor)(colorBgBase, 15),
        colorBorderSecondary: (0,_colorAlgorithm__WEBPACK_IMPORTED_MODULE_1__.getSolidColor)(colorBgBase, 6)
    };
};


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/default/index.js":
/*!*****************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/default/index.js ***!
  \*****************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ derivative)
/* harmony export */ });
/* harmony import */ var _ant_design_colors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/colors */ "webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?7e98");
/* harmony import */ var _ant_design_colors__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_colors__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _seed__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../seed */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/seed.js");
/* harmony import */ var _shared_genColorMapToken__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shared/genColorMapToken */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genColorMapToken.js");
/* harmony import */ var _shared_genCommonMapToken__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../shared/genCommonMapToken */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genCommonMapToken.js");
/* harmony import */ var _shared_genControlHeight__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../shared/genControlHeight */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genControlHeight.js");
/* harmony import */ var _shared_genFontMapToken__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../shared/genFontMapToken */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genFontMapToken.js");
/* harmony import */ var _shared_genSizeMapToken__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../shared/genSizeMapToken */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genSizeMapToken.js");
/* harmony import */ var _colors__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./colors */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/default/colors.js");








function derivative(token) {
    // pink is deprecated name of magenta, keep this for backwards compatibility
    _ant_design_colors__WEBPACK_IMPORTED_MODULE_0__.presetPrimaryColors.pink = _ant_design_colors__WEBPACK_IMPORTED_MODULE_0__.presetPrimaryColors.magenta;
    _ant_design_colors__WEBPACK_IMPORTED_MODULE_0__.presetPalettes.pink = _ant_design_colors__WEBPACK_IMPORTED_MODULE_0__.presetPalettes.magenta;
    const colorPalettes = Object.keys(_seed__WEBPACK_IMPORTED_MODULE_1__.defaultPresetColors).map((colorKey)=>{
        const colors = token[colorKey] === _ant_design_colors__WEBPACK_IMPORTED_MODULE_0__.presetPrimaryColors[colorKey] ? _ant_design_colors__WEBPACK_IMPORTED_MODULE_0__.presetPalettes[colorKey] : (0,_ant_design_colors__WEBPACK_IMPORTED_MODULE_0__.generate)(token[colorKey]);
        return new Array(10).fill(1).reduce((prev, _, i)=>{
            prev[`${colorKey}-${i + 1}`] = colors[i];
            prev[`${colorKey}${i + 1}`] = colors[i];
            return prev;
        }, {});
    }).reduce((prev, cur)=>{
        // biome-ignore lint/style/noParameterAssign: it is a reduce
        prev = Object.assign(Object.assign({}, prev), cur);
        return prev;
    }, {});
    return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, token), colorPalettes), (0,_shared_genColorMapToken__WEBPACK_IMPORTED_MODULE_2__["default"])(token, {
        generateColorPalettes: _colors__WEBPACK_IMPORTED_MODULE_3__.generateColorPalettes,
        generateNeutralColorPalettes: _colors__WEBPACK_IMPORTED_MODULE_3__.generateNeutralColorPalettes
    })), (0,_shared_genFontMapToken__WEBPACK_IMPORTED_MODULE_4__["default"])(token.fontSize)), (0,_shared_genSizeMapToken__WEBPACK_IMPORTED_MODULE_5__["default"])(token)), (0,_shared_genControlHeight__WEBPACK_IMPORTED_MODULE_6__["default"])(token)), (0,_shared_genCommonMapToken__WEBPACK_IMPORTED_MODULE_7__["default"])(token));
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/seed.js":
/*!********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/seed.js ***!
  \********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   defaultPresetColors: () => (/* binding */ defaultPresetColors)
/* harmony export */ });
const defaultPresetColors = {
    blue: "#1677FF",
    purple: "#722ED1",
    cyan: "#13C2C2",
    green: "#52C41A",
    magenta: "#EB2F96",
    /**
   * @deprecated Use magenta instead
   */ pink: "#EB2F96",
    red: "#F5222D",
    orange: "#FA8C16",
    yellow: "#FADB14",
    volcano: "#FA541C",
    geekblue: "#2F54EB",
    gold: "#FAAD14",
    lime: "#A0D911"
};
const seedToken = Object.assign(Object.assign({}, defaultPresetColors), {
    // Color
    colorPrimary: "#1677ff",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorInfo: "#1677ff",
    colorLink: "",
    colorTextBase: "",
    colorBgBase: "",
    // Font
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
'Noto Color Emoji'`,
    fontFamilyCode: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace`,
    fontSize: 14,
    // Line
    lineWidth: 1,
    lineType: "solid",
    // Motion
    motionUnit: 0.1,
    motionBase: 0,
    motionEaseOutCirc: "cubic-bezier(0.08, 0.82, 0.17, 1)",
    motionEaseInOutCirc: "cubic-bezier(0.78, 0.14, 0.15, 0.86)",
    motionEaseOut: "cubic-bezier(0.215, 0.61, 0.355, 1)",
    motionEaseInOut: "cubic-bezier(0.645, 0.045, 0.355, 1)",
    motionEaseOutBack: "cubic-bezier(0.12, 0.4, 0.29, 1.46)",
    motionEaseInBack: "cubic-bezier(0.71, -0.46, 0.88, 0.6)",
    motionEaseInQuint: "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
    motionEaseOutQuint: "cubic-bezier(0.23, 1, 0.32, 1)",
    // Radius
    borderRadius: 6,
    // Size
    sizeUnit: 4,
    sizeStep: 4,
    sizePopupArrow: 16,
    // Control Base
    controlHeight: 32,
    // zIndex
    zIndexBase: 0,
    zIndexPopupBase: 1000,
    // Image
    opacityImage: 1,
    // Wireframe
    wireframe: false,
    // Motion
    motion: true
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (seedToken);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genColorMapToken.js":
/*!***************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genColorMapToken.js ***!
  \***************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ genColorMapToken)
/* harmony export */ });
/* harmony import */ var _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ctrl/tinycolor */ "../../node_modules/.pnpm/@ctrl+tinycolor@3.6.1/node_modules/@ctrl/tinycolor/dist/public_api.js");
/* harmony import */ var _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0__);

function genColorMapToken(seed, _ref) {
    let { generateColorPalettes, generateNeutralColorPalettes } = _ref;
    const { colorSuccess: colorSuccessBase, colorWarning: colorWarningBase, colorError: colorErrorBase, colorInfo: colorInfoBase, colorPrimary: colorPrimaryBase, colorBgBase, colorTextBase } = seed;
    const primaryColors = generateColorPalettes(colorPrimaryBase);
    const successColors = generateColorPalettes(colorSuccessBase);
    const warningColors = generateColorPalettes(colorWarningBase);
    const errorColors = generateColorPalettes(colorErrorBase);
    const infoColors = generateColorPalettes(colorInfoBase);
    const neutralColors = generateNeutralColorPalettes(colorBgBase, colorTextBase);
    // Color Link
    const colorLink = seed.colorLink || seed.colorInfo;
    const linkColors = generateColorPalettes(colorLink);
    return Object.assign(Object.assign({}, neutralColors), {
        colorPrimaryBg: primaryColors[1],
        colorPrimaryBgHover: primaryColors[2],
        colorPrimaryBorder: primaryColors[3],
        colorPrimaryBorderHover: primaryColors[4],
        colorPrimaryHover: primaryColors[5],
        colorPrimary: primaryColors[6],
        colorPrimaryActive: primaryColors[7],
        colorPrimaryTextHover: primaryColors[8],
        colorPrimaryText: primaryColors[9],
        colorPrimaryTextActive: primaryColors[10],
        colorSuccessBg: successColors[1],
        colorSuccessBgHover: successColors[2],
        colorSuccessBorder: successColors[3],
        colorSuccessBorderHover: successColors[4],
        colorSuccessHover: successColors[4],
        colorSuccess: successColors[6],
        colorSuccessActive: successColors[7],
        colorSuccessTextHover: successColors[8],
        colorSuccessText: successColors[9],
        colorSuccessTextActive: successColors[10],
        colorErrorBg: errorColors[1],
        colorErrorBgHover: errorColors[2],
        colorErrorBgActive: errorColors[3],
        colorErrorBorder: errorColors[3],
        colorErrorBorderHover: errorColors[4],
        colorErrorHover: errorColors[5],
        colorError: errorColors[6],
        colorErrorActive: errorColors[7],
        colorErrorTextHover: errorColors[8],
        colorErrorText: errorColors[9],
        colorErrorTextActive: errorColors[10],
        colorWarningBg: warningColors[1],
        colorWarningBgHover: warningColors[2],
        colorWarningBorder: warningColors[3],
        colorWarningBorderHover: warningColors[4],
        colorWarningHover: warningColors[4],
        colorWarning: warningColors[6],
        colorWarningActive: warningColors[7],
        colorWarningTextHover: warningColors[8],
        colorWarningText: warningColors[9],
        colorWarningTextActive: warningColors[10],
        colorInfoBg: infoColors[1],
        colorInfoBgHover: infoColors[2],
        colorInfoBorder: infoColors[3],
        colorInfoBorderHover: infoColors[4],
        colorInfoHover: infoColors[4],
        colorInfo: infoColors[6],
        colorInfoActive: infoColors[7],
        colorInfoTextHover: infoColors[8],
        colorInfoText: infoColors[9],
        colorInfoTextActive: infoColors[10],
        colorLinkHover: linkColors[4],
        colorLink: linkColors[6],
        colorLinkActive: linkColors[7],
        colorBgMask: new _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0__.TinyColor("#000").setAlpha(0.45).toRgbString(),
        colorWhite: "#fff"
    });
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genCommonMapToken.js":
/*!****************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genCommonMapToken.js ***!
  \****************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ genCommonMapToken)
/* harmony export */ });
/* harmony import */ var _genRadius__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./genRadius */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genRadius.js");

function genCommonMapToken(token) {
    const { motionUnit, motionBase, borderRadius, lineWidth } = token;
    return Object.assign({
        // motion
        motionDurationFast: `${(motionBase + motionUnit).toFixed(1)}s`,
        motionDurationMid: `${(motionBase + motionUnit * 2).toFixed(1)}s`,
        motionDurationSlow: `${(motionBase + motionUnit * 3).toFixed(1)}s`,
        // line
        lineWidthBold: lineWidth + 1
    }, (0,_genRadius__WEBPACK_IMPORTED_MODULE_0__["default"])(borderRadius));
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genControlHeight.js":
/*!***************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genControlHeight.js ***!
  \***************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const genControlHeight = (token)=>{
    const { controlHeight } = token;
    return {
        controlHeightSM: controlHeight * 0.75,
        controlHeightXS: controlHeight * 0.5,
        controlHeightLG: controlHeight * 1.25
    };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (genControlHeight);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genFontMapToken.js":
/*!**************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genFontMapToken.js ***!
  \**************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _genFontSizes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./genFontSizes */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genFontSizes.js");

const genFontMapToken = (fontSize)=>{
    const fontSizePairs = (0,_genFontSizes__WEBPACK_IMPORTED_MODULE_0__["default"])(fontSize);
    const fontSizes = fontSizePairs.map((pair)=>pair.size);
    const lineHeights = fontSizePairs.map((pair)=>pair.lineHeight);
    const fontSizeMD = fontSizes[1];
    const fontSizeSM = fontSizes[0];
    const fontSizeLG = fontSizes[2];
    const lineHeight = lineHeights[1];
    const lineHeightSM = lineHeights[0];
    const lineHeightLG = lineHeights[2];
    return {
        fontSizeSM,
        fontSize: fontSizeMD,
        fontSizeLG,
        fontSizeXL: fontSizes[3],
        fontSizeHeading1: fontSizes[6],
        fontSizeHeading2: fontSizes[5],
        fontSizeHeading3: fontSizes[4],
        fontSizeHeading4: fontSizes[3],
        fontSizeHeading5: fontSizes[2],
        lineHeight,
        lineHeightLG,
        lineHeightSM,
        fontHeight: Math.round(lineHeight * fontSizeMD),
        fontHeightLG: Math.round(lineHeightLG * fontSizeLG),
        fontHeightSM: Math.round(lineHeightSM * fontSizeSM),
        lineHeightHeading1: lineHeights[6],
        lineHeightHeading2: lineHeights[5],
        lineHeightHeading3: lineHeights[4],
        lineHeightHeading4: lineHeights[3],
        lineHeightHeading5: lineHeights[2]
    };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (genFontMapToken);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genFontSizes.js":
/*!***********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genFontSizes.js ***!
  \***********************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getFontSizes),
/* harmony export */   getLineHeight: () => (/* binding */ getLineHeight)
/* harmony export */ });
function getLineHeight(fontSize) {
    return (fontSize + 8) / fontSize;
}
// https://zhuanlan.zhihu.com/p/32746810
function getFontSizes(base) {
    const fontSizes = new Array(10).fill(null).map((_, index)=>{
        const i = index - 1;
        const baseSize = base * Math.pow(Math.E, i / 5);
        const intSize = index > 1 ? Math.floor(baseSize) : Math.ceil(baseSize);
        // Convert to even
        return Math.floor(intSize / 2) * 2;
    });
    fontSizes[1] = base;
    return fontSizes.map((size)=>({
            size,
            lineHeight: getLineHeight(size)
        }));
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genRadius.js":
/*!********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genRadius.js ***!
  \********************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const genRadius = (radiusBase)=>{
    let radiusLG = radiusBase;
    let radiusSM = radiusBase;
    let radiusXS = radiusBase;
    let radiusOuter = radiusBase;
    // radiusLG
    if (radiusBase < 6 && radiusBase >= 5) {
        radiusLG = radiusBase + 1;
    } else if (radiusBase < 16 && radiusBase >= 6) {
        radiusLG = radiusBase + 2;
    } else if (radiusBase >= 16) {
        radiusLG = 16;
    }
    // radiusSM
    if (radiusBase < 7 && radiusBase >= 5) {
        radiusSM = 4;
    } else if (radiusBase < 8 && radiusBase >= 7) {
        radiusSM = 5;
    } else if (radiusBase < 14 && radiusBase >= 8) {
        radiusSM = 6;
    } else if (radiusBase < 16 && radiusBase >= 14) {
        radiusSM = 7;
    } else if (radiusBase >= 16) {
        radiusSM = 8;
    }
    // radiusXS
    if (radiusBase < 6 && radiusBase >= 2) {
        radiusXS = 1;
    } else if (radiusBase >= 6) {
        radiusXS = 2;
    }
    // radiusOuter
    if (radiusBase > 4 && radiusBase < 8) {
        radiusOuter = 4;
    } else if (radiusBase >= 8) {
        radiusOuter = 6;
    }
    return {
        borderRadius: radiusBase,
        borderRadiusXS: radiusXS,
        borderRadiusSM: radiusSM,
        borderRadiusLG: radiusLG,
        borderRadiusOuter: radiusOuter
    };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (genRadius);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genSizeMapToken.js":
/*!**************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/shared/genSizeMapToken.js ***!
  \**************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ genSizeMapToken)
/* harmony export */ });
function genSizeMapToken(token) {
    const { sizeUnit, sizeStep } = token;
    return {
        sizeXXL: sizeUnit * (sizeStep + 8),
        // 48
        sizeXL: sizeUnit * (sizeStep + 4),
        // 32
        sizeLG: sizeUnit * (sizeStep + 2),
        // 24
        sizeMD: sizeUnit * (sizeStep + 1),
        // 20
        sizeMS: sizeUnit * sizeStep,
        // 16
        size: sizeUnit * sizeStep,
        // 16
        sizeSM: sizeUnit * (sizeStep - 1),
        // 12
        sizeXS: sizeUnit * (sizeStep - 2),
        // 8
        sizeXXS: sizeUnit * (sizeStep - 3 // 4
        )
    };
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/useToken.js":
/*!*****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/useToken.js ***!
  \*****************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ useToken),
/* harmony export */   getComputedToken: () => (/* binding */ getComputedToken),
/* harmony export */   ignore: () => (/* binding */ ignore),
/* harmony export */   unitless: () => (/* binding */ unitless)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../version */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/version/index.js");
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./context */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/context.js");
/* harmony import */ var _themes_seed__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./themes/seed */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/seed.js");
/* harmony import */ var _util_alias__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util/alias */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/alias.js");
var __rest = undefined && undefined.__rest || function(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
};






const unitless = {
    lineHeight: true,
    lineHeightSM: true,
    lineHeightLG: true,
    lineHeightHeading1: true,
    lineHeightHeading2: true,
    lineHeightHeading3: true,
    lineHeightHeading4: true,
    lineHeightHeading5: true,
    opacityLoading: true,
    fontWeightStrong: true,
    zIndexPopupBase: true,
    zIndexBase: true
};
const ignore = {
    size: true,
    sizeSM: true,
    sizeLG: true,
    sizeMD: true,
    sizeXS: true,
    sizeXXS: true,
    sizeMS: true,
    sizeXL: true,
    sizeXXL: true,
    sizeUnit: true,
    sizeStep: true,
    motionBase: true,
    motionUnit: true
};
const preserve = {
    screenXS: true,
    screenXSMin: true,
    screenXSMax: true,
    screenSM: true,
    screenSMMin: true,
    screenSMMax: true,
    screenMD: true,
    screenMDMin: true,
    screenMDMax: true,
    screenLG: true,
    screenLGMin: true,
    screenLGMax: true,
    screenXL: true,
    screenXLMin: true,
    screenXLMax: true,
    screenXXL: true,
    screenXXLMin: true
};
const getComputedToken = (originToken, overrideToken, theme)=>{
    const derivativeToken = theme.getDerivativeToken(originToken);
    const { override } = overrideToken, components = __rest(overrideToken, [
        "override"
    ]);
    // Merge with override
    let mergedDerivativeToken = Object.assign(Object.assign({}, derivativeToken), {
        override
    });
    // Format if needed
    mergedDerivativeToken = (0,_util_alias__WEBPACK_IMPORTED_MODULE_2__["default"])(mergedDerivativeToken);
    if (components) {
        Object.entries(components).forEach((_ref)=>{
            let [key, value] = _ref;
            const { theme: componentTheme } = value, componentTokens = __rest(value, [
                "theme"
            ]);
            let mergedComponentToken = componentTokens;
            if (componentTheme) {
                mergedComponentToken = getComputedToken(Object.assign(Object.assign({}, mergedDerivativeToken), componentTokens), {
                    override: componentTokens
                }, componentTheme);
            }
            mergedDerivativeToken[key] = mergedComponentToken;
        });
    }
    return mergedDerivativeToken;
};
// ================================== Hook ==================================
function useToken() {
    const { token: rootDesignToken, hashed, theme, override, cssVar } = react__WEBPACK_IMPORTED_MODULE_0___default().useContext(_context__WEBPACK_IMPORTED_MODULE_3__.DesignTokenContext);
    const salt = `${_version__WEBPACK_IMPORTED_MODULE_4__["default"]}-${hashed || ""}`;
    const mergedTheme = theme || _context__WEBPACK_IMPORTED_MODULE_3__.defaultTheme;
    const [token, hashId, realToken] = (0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__.useCacheToken)(mergedTheme, [
        _themes_seed__WEBPACK_IMPORTED_MODULE_5__["default"],
        rootDesignToken
    ], {
        salt,
        override,
        getComputedToken,
        // formatToken will not be consumed after 1.15.0 with getComputedToken.
        // But token will break if @ant-design/cssinjs is under 1.15.0 without it
        formatToken: _util_alias__WEBPACK_IMPORTED_MODULE_2__["default"],
        cssVar: cssVar && {
            prefix: cssVar.prefix,
            key: cssVar.key,
            unitless,
            ignore,
            preserve
        }
    });
    return [
        mergedTheme,
        realToken,
        hashed ? hashId : "",
        token,
        cssVar
    ];
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/alias.js":
/*!*******************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/alias.js ***!
  \*******************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ formatToken)
/* harmony export */ });
/* harmony import */ var _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ctrl/tinycolor */ "../../node_modules/.pnpm/@ctrl+tinycolor@3.6.1/node_modules/@ctrl/tinycolor/dist/public_api.js");
/* harmony import */ var _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _themes_seed__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../themes/seed */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/themes/seed.js");
/* harmony import */ var _getAlphaColor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./getAlphaColor */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/getAlphaColor.js");
var __rest = undefined && undefined.__rest || function(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
};



/**
 * Seed (designer) > Derivative (designer) > Alias (developer).
 *
 * Merge seed & derivative & override token and generate alias token for developer.
 */ function formatToken(derivativeToken) {
    const { override } = derivativeToken, restToken = __rest(derivativeToken, [
        "override"
    ]);
    const overrideTokens = Object.assign({}, override);
    Object.keys(_themes_seed__WEBPACK_IMPORTED_MODULE_0__["default"]).forEach((token)=>{
        delete overrideTokens[token];
    });
    const mergedToken = Object.assign(Object.assign({}, restToken), overrideTokens);
    const screenXS = 480;
    const screenSM = 576;
    const screenMD = 768;
    const screenLG = 992;
    const screenXL = 1200;
    const screenXXL = 1600;
    // Motion
    if (mergedToken.motion === false) {
        const fastDuration = "0s";
        mergedToken.motionDurationFast = fastDuration;
        mergedToken.motionDurationMid = fastDuration;
        mergedToken.motionDurationSlow = fastDuration;
    }
    // Generate alias token
    const aliasToken = Object.assign(Object.assign(Object.assign({}, mergedToken), {
        // ============== Background ============== //
        colorFillContent: mergedToken.colorFillSecondary,
        colorFillContentHover: mergedToken.colorFill,
        colorFillAlter: mergedToken.colorFillQuaternary,
        colorBgContainerDisabled: mergedToken.colorFillTertiary,
        // ============== Split ============== //
        colorBorderBg: mergedToken.colorBgContainer,
        colorSplit: (0,_getAlphaColor__WEBPACK_IMPORTED_MODULE_1__["default"])(mergedToken.colorBorderSecondary, mergedToken.colorBgContainer),
        // ============== Text ============== //
        colorTextPlaceholder: mergedToken.colorTextQuaternary,
        colorTextDisabled: mergedToken.colorTextQuaternary,
        colorTextHeading: mergedToken.colorText,
        colorTextLabel: mergedToken.colorTextSecondary,
        colorTextDescription: mergedToken.colorTextTertiary,
        colorTextLightSolid: mergedToken.colorWhite,
        colorHighlight: mergedToken.colorError,
        colorBgTextHover: mergedToken.colorFillSecondary,
        colorBgTextActive: mergedToken.colorFill,
        colorIcon: mergedToken.colorTextTertiary,
        colorIconHover: mergedToken.colorText,
        colorErrorOutline: (0,_getAlphaColor__WEBPACK_IMPORTED_MODULE_1__["default"])(mergedToken.colorErrorBg, mergedToken.colorBgContainer),
        colorWarningOutline: (0,_getAlphaColor__WEBPACK_IMPORTED_MODULE_1__["default"])(mergedToken.colorWarningBg, mergedToken.colorBgContainer),
        // Font
        fontSizeIcon: mergedToken.fontSizeSM,
        // Line
        lineWidthFocus: mergedToken.lineWidth * 4,
        // Control
        lineWidth: mergedToken.lineWidth,
        controlOutlineWidth: mergedToken.lineWidth * 2,
        // Checkbox size and expand icon size
        controlInteractiveSize: mergedToken.controlHeight / 2,
        controlItemBgHover: mergedToken.colorFillTertiary,
        controlItemBgActive: mergedToken.colorPrimaryBg,
        controlItemBgActiveHover: mergedToken.colorPrimaryBgHover,
        controlItemBgActiveDisabled: mergedToken.colorFill,
        controlTmpOutline: mergedToken.colorFillQuaternary,
        controlOutline: (0,_getAlphaColor__WEBPACK_IMPORTED_MODULE_1__["default"])(mergedToken.colorPrimaryBg, mergedToken.colorBgContainer),
        lineType: mergedToken.lineType,
        borderRadius: mergedToken.borderRadius,
        borderRadiusXS: mergedToken.borderRadiusXS,
        borderRadiusSM: mergedToken.borderRadiusSM,
        borderRadiusLG: mergedToken.borderRadiusLG,
        fontWeightStrong: 600,
        opacityLoading: 0.65,
        linkDecoration: "none",
        linkHoverDecoration: "none",
        linkFocusDecoration: "none",
        controlPaddingHorizontal: 12,
        controlPaddingHorizontalSM: 8,
        paddingXXS: mergedToken.sizeXXS,
        paddingXS: mergedToken.sizeXS,
        paddingSM: mergedToken.sizeSM,
        padding: mergedToken.size,
        paddingMD: mergedToken.sizeMD,
        paddingLG: mergedToken.sizeLG,
        paddingXL: mergedToken.sizeXL,
        paddingContentHorizontalLG: mergedToken.sizeLG,
        paddingContentVerticalLG: mergedToken.sizeMS,
        paddingContentHorizontal: mergedToken.sizeMS,
        paddingContentVertical: mergedToken.sizeSM,
        paddingContentHorizontalSM: mergedToken.size,
        paddingContentVerticalSM: mergedToken.sizeXS,
        marginXXS: mergedToken.sizeXXS,
        marginXS: mergedToken.sizeXS,
        marginSM: mergedToken.sizeSM,
        margin: mergedToken.size,
        marginMD: mergedToken.sizeMD,
        marginLG: mergedToken.sizeLG,
        marginXL: mergedToken.sizeXL,
        marginXXL: mergedToken.sizeXXL,
        boxShadow: `
      0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05)
    `,
        boxShadowSecondary: `
      0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05)
    `,
        boxShadowTertiary: `
      0 1px 2px 0 rgba(0, 0, 0, 0.03),
      0 1px 6px -1px rgba(0, 0, 0, 0.02),
      0 2px 4px 0 rgba(0, 0, 0, 0.02)
    `,
        screenXS,
        screenXSMin: screenXS,
        screenXSMax: screenSM - 1,
        screenSM,
        screenSMMin: screenSM,
        screenSMMax: screenMD - 1,
        screenMD,
        screenMDMin: screenMD,
        screenMDMax: screenLG - 1,
        screenLG,
        screenLGMin: screenLG,
        screenLGMax: screenXL - 1,
        screenXL,
        screenXLMin: screenXL,
        screenXLMax: screenXXL - 1,
        screenXXL,
        screenXXLMin: screenXXL,
        boxShadowPopoverArrow: "2px 2px 5px rgba(0, 0, 0, 0.05)",
        boxShadowCard: `
      0 1px 2px -2px ${new _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_2__.TinyColor("rgba(0, 0, 0, 0.16)").toRgbString()},
      0 3px 6px 0 ${new _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_2__.TinyColor("rgba(0, 0, 0, 0.12)").toRgbString()},
      0 5px 12px 4px ${new _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_2__.TinyColor("rgba(0, 0, 0, 0.09)").toRgbString()}
    `,
        boxShadowDrawerRight: `
      -6px 0 16px 0 rgba(0, 0, 0, 0.08),
      -3px 0 6px -4px rgba(0, 0, 0, 0.12),
      -9px 0 28px 8px rgba(0, 0, 0, 0.05)
    `,
        boxShadowDrawerLeft: `
      6px 0 16px 0 rgba(0, 0, 0, 0.08),
      3px 0 6px -4px rgba(0, 0, 0, 0.12),
      9px 0 28px 8px rgba(0, 0, 0, 0.05)
    `,
        boxShadowDrawerUp: `
      0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05)
    `,
        boxShadowDrawerDown: `
      0 -6px 16px 0 rgba(0, 0, 0, 0.08),
      0 -3px 6px -4px rgba(0, 0, 0, 0.12),
      0 -9px 28px 8px rgba(0, 0, 0, 0.05)
    `,
        boxShadowTabsOverflowLeft: "inset 10px 0 8px -8px rgba(0, 0, 0, 0.08)",
        boxShadowTabsOverflowRight: "inset -10px 0 8px -8px rgba(0, 0, 0, 0.08)",
        boxShadowTabsOverflowTop: "inset 0 10px 8px -8px rgba(0, 0, 0, 0.08)",
        boxShadowTabsOverflowBottom: "inset 0 -10px 8px -8px rgba(0, 0, 0, 0.08)"
    }), overrideTokens);
    return aliasToken;
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/genComponentStyleHook.js":
/*!***********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/genComponentStyleHook.js ***!
  \***********************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ genComponentStyleHook),
/* harmony export */   genStyleHooks: () => (/* binding */ genStyleHooks),
/* harmony export */   genSubStyleComponent: () => (/* binding */ genSubStyleComponent)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var rc_util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rc-util */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/index.js");
/* harmony import */ var _util_hooks_useUniqueMemo__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../_util/hooks/useUniqueMemo */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/hooks/useUniqueMemo.js");
/* harmony import */ var _config_provider_context__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../config-provider/context */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/context.js");
/* harmony import */ var _style__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../style */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/index.js");
/* harmony import */ var _useToken__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../useToken */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/useToken.js");
/* harmony import */ var _maxmin__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./maxmin */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/maxmin.js");
/* harmony import */ var _statistic__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./statistic */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/statistic.js");
/* harmony import */ var _useResetIconStyle__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./useResetIconStyle */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/useResetIconStyle.js");
/* __next_internal_client_entry_do_not_use__ default,genSubStyleComponent,genStyleHooks auto */ 









const getDefaultComponentToken = (component, token, getDefaultToken)=>{
    var _a;
    if (typeof getDefaultToken === "function") {
        return getDefaultToken((0,_statistic__WEBPACK_IMPORTED_MODULE_3__.merge)(token, (_a = token[component]) !== null && _a !== void 0 ? _a : {}));
    }
    return getDefaultToken !== null && getDefaultToken !== void 0 ? getDefaultToken : {};
};
const getComponentToken = (component, token, defaultToken, options)=>{
    const customToken = Object.assign({}, token[component]);
    if (options === null || options === void 0 ? void 0 : options.deprecatedTokens) {
        const { deprecatedTokens } = options;
        deprecatedTokens.forEach((_ref)=>{
            let [oldTokenKey, newTokenKey] = _ref;
            var _a;
            if (true) {
                 true ? (0,rc_util__WEBPACK_IMPORTED_MODULE_2__.warning)(!(customToken === null || customToken === void 0 ? void 0 : customToken[oldTokenKey]), `Component Token \`${String(oldTokenKey)}\` of ${component} is deprecated. Please use \`${String(newTokenKey)}\` instead.`) : 0;
            }
            // Should wrap with `if` clause, or there will be `undefined` in object.
            if ((customToken === null || customToken === void 0 ? void 0 : customToken[oldTokenKey]) || (customToken === null || customToken === void 0 ? void 0 : customToken[newTokenKey])) {
                (_a = customToken[newTokenKey]) !== null && _a !== void 0 ? _a : customToken[newTokenKey] = customToken === null || customToken === void 0 ? void 0 : customToken[oldTokenKey];
            }
        });
    }
    const mergedToken = Object.assign(Object.assign({}, defaultToken), customToken);
    // Remove same value as global token to minimize size
    Object.keys(mergedToken).forEach((key)=>{
        if (mergedToken[key] === token[key]) {
            delete mergedToken[key];
        }
    });
    return mergedToken;
};
const getCompVarPrefix = (component, prefix)=>`${[
        prefix,
        component.replace(/([A-Z]+)([A-Z][a-z]+)/g, "$1-$2").replace(/([a-z])([A-Z])/g, "$1-$2")
    ].filter(Boolean).join("-")}`;
function genComponentStyleHook(componentName, styleFn, getDefaultToken) {
    let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    const cells = Array.isArray(componentName) ? componentName : [
        componentName,
        componentName
    ];
    const [component] = cells;
    const concatComponent = cells.join("-");
    // Return new style hook
    return function(prefixCls) {
        let rootCls = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : prefixCls;
        const [theme, realToken, hashId, token, cssVar] = (0,_useToken__WEBPACK_IMPORTED_MODULE_4__["default"])();
        const { getPrefixCls, iconPrefixCls, csp } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(_config_provider_context__WEBPACK_IMPORTED_MODULE_5__.ConfigContext);
        const rootPrefixCls = getPrefixCls();
        const type = cssVar ? "css" : "js";
        // Use unique memo to share the result across all instances
        const calc = (0,_util_hooks_useUniqueMemo__WEBPACK_IMPORTED_MODULE_6__["default"])(()=>{
            const unitlessCssVar = new Set();
            if (cssVar) {
                Object.keys(options.unitless || {}).forEach((key)=>{
                    // Some component proxy the AliasToken (e.g. Image) and some not (e.g. Modal)
                    // We should both pass in `unitlessCssVar` to make sure the CSSVar can be unitless.
                    unitlessCssVar.add((0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__.token2CSSVar)(key, cssVar.prefix));
                    unitlessCssVar.add((0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__.token2CSSVar)(key, getCompVarPrefix(component, cssVar.prefix)));
                });
            }
            return (0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__.genCalc)(type, unitlessCssVar);
        }, [
            type,
            component,
            cssVar === null || cssVar === void 0 ? void 0 : cssVar.prefix
        ]);
        const { max, min } = (0,_maxmin__WEBPACK_IMPORTED_MODULE_7__["default"])(type);
        // Shared config
        const sharedConfig = {
            theme,
            token,
            hashId,
            nonce: ()=>csp === null || csp === void 0 ? void 0 : csp.nonce,
            clientOnly: options.clientOnly,
            layer: {
                name: "antd"
            },
            // antd is always at top of styles
            order: options.order || -999
        };
        // Generate style for all a tags in antd component.
        (0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__.useStyleRegister)(Object.assign(Object.assign({}, sharedConfig), {
            clientOnly: false,
            path: [
                "Shared",
                rootPrefixCls
            ]
        }), ()=>[
                {
                    // Link
                    "&": (0,_style__WEBPACK_IMPORTED_MODULE_8__.genLinkStyle)(token)
                }
            ]);
        // Generate style for icons
        (0,_useResetIconStyle__WEBPACK_IMPORTED_MODULE_9__["default"])(iconPrefixCls, csp);
        const wrapSSR = (0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__.useStyleRegister)(Object.assign(Object.assign({}, sharedConfig), {
            path: [
                concatComponent,
                prefixCls,
                iconPrefixCls
            ]
        }), ()=>{
            if (options.injectStyle === false) {
                return [];
            }
            const { token: proxyToken, flush } = (0,_statistic__WEBPACK_IMPORTED_MODULE_3__["default"])(token);
            const defaultComponentToken = getDefaultComponentToken(component, realToken, getDefaultToken);
            const componentCls = `.${prefixCls}`;
            const componentToken = getComponentToken(component, realToken, defaultComponentToken, {
                deprecatedTokens: options.deprecatedTokens
            });
            if (cssVar) {
                Object.keys(defaultComponentToken).forEach((key)=>{
                    defaultComponentToken[key] = `var(${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__.token2CSSVar)(key, getCompVarPrefix(component, cssVar.prefix))})`;
                });
            }
            const mergedToken = (0,_statistic__WEBPACK_IMPORTED_MODULE_3__.merge)(proxyToken, {
                componentCls,
                prefixCls,
                iconCls: `.${iconPrefixCls}`,
                antCls: `.${rootPrefixCls}`,
                calc,
                // @ts-ignore
                max,
                // @ts-ignore
                min
            }, cssVar ? defaultComponentToken : componentToken);
            const styleInterpolation = styleFn(mergedToken, {
                hashId,
                prefixCls,
                rootPrefixCls,
                iconPrefixCls
            });
            flush(component, componentToken);
            return [
                options.resetStyle === false ? null : (0,_style__WEBPACK_IMPORTED_MODULE_8__.genCommonStyle)(mergedToken, prefixCls, rootCls, options.resetFont),
                styleInterpolation
            ];
        });
        return [
            wrapSSR,
            hashId
        ];
    };
}
const genSubStyleComponent = (componentName, styleFn, getDefaultToken, options)=>{
    const useStyle = genComponentStyleHook(componentName, styleFn, getDefaultToken, Object.assign({
        resetStyle: false,
        // Sub Style should default after root one
        order: -998
    }, options));
    const StyledComponent = (_ref2)=>{
        let { prefixCls, rootCls = prefixCls } = _ref2;
        useStyle(prefixCls, rootCls);
        return null;
    };
    if (true) {
        StyledComponent.displayName = `SubStyle_${Array.isArray(componentName) ? componentName.join(".") : componentName}`;
    }
    return StyledComponent;
};
const genCSSVarRegister = (component, getDefaultToken, options)=>{
    const { unitless: compUnitless, injectStyle = true, prefixToken } = options;
    const CSSVarRegister = (_ref3)=>{
        let { rootCls, cssVar } = _ref3;
        const [, realToken] = (0,_useToken__WEBPACK_IMPORTED_MODULE_4__["default"])();
        (0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_1__.useCSSVarRegister)({
            path: [
                component
            ],
            prefix: cssVar.prefix,
            key: cssVar === null || cssVar === void 0 ? void 0 : cssVar.key,
            unitless: compUnitless,
            ignore: _useToken__WEBPACK_IMPORTED_MODULE_4__.ignore,
            token: realToken,
            scope: rootCls
        }, ()=>{
            const defaultToken = getDefaultComponentToken(component, realToken, getDefaultToken);
            const componentToken = getComponentToken(component, realToken, defaultToken, {
                deprecatedTokens: options === null || options === void 0 ? void 0 : options.deprecatedTokens
            });
            Object.keys(defaultToken).forEach((key)=>{
                componentToken[prefixToken(key)] = componentToken[key];
                delete componentToken[key];
            });
            return componentToken;
        });
        return null;
    };
    const useCSSVar = (rootCls)=>{
        const [, , , , cssVar] = (0,_useToken__WEBPACK_IMPORTED_MODULE_4__["default"])();
        return [
            (node)=>injectStyle && cssVar ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0___default().createElement(CSSVarRegister, {
                    rootCls: rootCls,
                    cssVar: cssVar,
                    component: component
                }), node) : node,
            cssVar === null || cssVar === void 0 ? void 0 : cssVar.key
        ];
    };
    return useCSSVar;
};
const genStyleHooks = (component, styleFn, getDefaultToken, options)=>{
    const componentName = Array.isArray(component) ? component[0] : component;
    function prefixToken(key) {
        return `${componentName}${key.slice(0, 1).toUpperCase()}${key.slice(1)}`;
    }
    // Fill unitless
    const originUnitless = (options === null || options === void 0 ? void 0 : options.unitless) || {};
    const compUnitless = Object.assign(Object.assign({}, _useToken__WEBPACK_IMPORTED_MODULE_4__.unitless), {
        [prefixToken("zIndexPopup")]: true
    });
    Object.keys(originUnitless).forEach((key)=>{
        compUnitless[prefixToken(key)] = originUnitless[key];
    });
    // Options
    const mergedOptions = Object.assign(Object.assign({}, options), {
        unitless: compUnitless,
        prefixToken
    });
    // Hooks
    const useStyle = genComponentStyleHook(component, styleFn, getDefaultToken, mergedOptions);
    const useCSSVar = genCSSVarRegister(componentName, getDefaultToken, mergedOptions);
    return function(prefixCls) {
        let rootCls = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : prefixCls;
        const [, hashId] = useStyle(prefixCls, rootCls);
        const [wrapCSSVar, cssVarCls] = useCSSVar(rootCls);
        return [
            wrapCSSVar,
            hashId,
            cssVarCls
        ];
    };
};


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/genPresetColor.js":
/*!****************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/genPresetColor.js ***!
  \****************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ genPresetColor)
/* harmony export */ });
/* harmony import */ var _interface__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../interface */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/interface/index.js");

function genPresetColor(token, genCss) {
    return _interface__WEBPACK_IMPORTED_MODULE_0__.PresetColors.reduce((prev, colorKey)=>{
        const lightColor = token[`${colorKey}1`];
        const lightBorderColor = token[`${colorKey}3`];
        const darkColor = token[`${colorKey}6`];
        const textColor = token[`${colorKey}7`];
        return Object.assign(Object.assign({}, prev), genCss(colorKey, {
            lightColor,
            lightBorderColor,
            darkColor,
            textColor
        }));
    }, {});
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/getAlphaColor.js":
/*!***************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/getAlphaColor.js ***!
  \***************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ctrl/tinycolor */ "../../node_modules/.pnpm/@ctrl+tinycolor@3.6.1/node_modules/@ctrl/tinycolor/dist/public_api.js");
/* harmony import */ var _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0__);

function isStableColor(color) {
    return color >= 0 && color <= 255;
}
function getAlphaColor(frontColor, backgroundColor) {
    const { r: fR, g: fG, b: fB, a: originAlpha } = new _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0__.TinyColor(frontColor).toRgb();
    if (originAlpha < 1) {
        return frontColor;
    }
    const { r: bR, g: bG, b: bB } = new _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0__.TinyColor(backgroundColor).toRgb();
    for(let fA = 0.01; fA <= 1; fA += 0.01){
        const r = Math.round((fR - bR * (1 - fA)) / fA);
        const g = Math.round((fG - bG * (1 - fA)) / fA);
        const b = Math.round((fB - bB * (1 - fA)) / fA);
        if (isStableColor(r) && isStableColor(g) && isStableColor(b)) {
            return new _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0__.TinyColor({
                r,
                g,
                b,
                a: Math.round(fA * 100) / 100
            }).toRgbString();
        }
    }
    // fallback
    /* istanbul ignore next */ return new _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0__.TinyColor({
        r: fR,
        g: fG,
        b: fB,
        a: 1
    }).toRgbString();
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getAlphaColor);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/maxmin.js":
/*!********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/maxmin.js ***!
  \********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ genMaxMin)
/* harmony export */ });
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__);

function genMaxMin(type) {
    if (type === "js") {
        return {
            max: Math.max,
            min: Math.min
        };
    }
    return {
        max: function() {
            for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                args[_key] = arguments[_key];
            }
            return `max(${args.map((value)=>(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(value)).join(",")})`;
        },
        min: function() {
            for(var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++){
                args[_key2] = arguments[_key2];
            }
            return `min(${args.map((value)=>(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(value)).join(",")})`;
        }
    };
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/statistic.js":
/*!***********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/statistic.js ***!
  \***********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _statistic_build_: () => (/* binding */ _statistic_build_),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   merge: () => (/* binding */ merge),
/* harmony export */   statistic: () => (/* binding */ statistic)
/* harmony export */ });
const enableStatistic =  true || 0;
let recording = true;
/**
 * This function will do as `Object.assign` in production. But will use Object.defineProperty:get to
 * pass all value access in development. To support statistic field usage with alias token.
 */ function merge() {
    for(var _len = arguments.length, objs = new Array(_len), _key = 0; _key < _len; _key++){
        objs[_key] = arguments[_key];
    }
    /* istanbul ignore next */ if (!enableStatistic) {
        return Object.assign.apply(Object, [
            {}
        ].concat(objs));
    }
    recording = false;
    const ret = {};
    objs.forEach((obj)=>{
        const keys = Object.keys(obj);
        keys.forEach((key)=>{
            Object.defineProperty(ret, key, {
                configurable: true,
                enumerable: true,
                get: ()=>obj[key]
            });
        });
    });
    recording = true;
    return ret;
}
/** @internal Internal Usage. Not use in your production. */ const statistic = {};
/** @internal Internal Usage. Not use in your production. */ // eslint-disable-next-line camelcase
const _statistic_build_ = {};
/* istanbul ignore next */ function noop() {}
/** Statistic token usage case. Should use `merge` function if you do not want spread record. */ const statisticToken = (token)=>{
    let tokenKeys;
    let proxy = token;
    let flush = noop;
    if (enableStatistic && typeof Proxy !== "undefined") {
        tokenKeys = new Set();
        proxy = new Proxy(token, {
            get (obj, prop) {
                if (recording) {
                    tokenKeys.add(prop);
                }
                return obj[prop];
            }
        });
        flush = (componentName, componentToken)=>{
            var _a;
            statistic[componentName] = {
                global: Array.from(tokenKeys),
                component: Object.assign(Object.assign({}, (_a = statistic[componentName]) === null || _a === void 0 ? void 0 : _a.component), componentToken)
            };
        };
    }
    return {
        token: proxy,
        keys: tokenKeys,
        flush
    };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (statisticToken);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/useResetIconStyle.js":
/*!*******************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/util/useResetIconStyle.js ***!
  \*******************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _style__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../style */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/index.js");
/* harmony import */ var _useToken__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../useToken */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/useToken.js");



const useResetIconStyle = (iconPrefixCls, csp)=>{
    const [theme, token] = (0,_useToken__WEBPACK_IMPORTED_MODULE_1__["default"])();
    // Generate style for icons
    return (0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.useStyleRegister)({
        theme,
        token,
        hashId: "",
        path: [
            "ant-design-icons",
            iconPrefixCls
        ],
        nonce: ()=>csp === null || csp === void 0 ? void 0 : csp.nonce,
        layer: {
            name: "antd"
        }
    }, ()=>[
            {
                [`.${iconPrefixCls}`]: Object.assign(Object.assign({}, (0,_style__WEBPACK_IMPORTED_MODULE_2__.resetIcon)()), {
                    [`.${iconPrefixCls} .${iconPrefixCls}-icon`]: {
                        display: "block"
                    }
                })
            }
        ]);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (useResetIconStyle);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/time-picker/locale/en_US.js":
/*!***************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/time-picker/locale/en_US.js ***!
  \***************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const locale = {
    placeholder: "Select time",
    rangePlaceholder: [
        "Start time",
        "End time"
    ]
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (locale);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/tooltip/PurePanel.js":
/*!********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/tooltip/PurePanel.js ***!
  \********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var rc_tooltip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rc-tooltip */ "../../node_modules/.pnpm/rc-tooltip@6.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-tooltip/lib/index.js");
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../config-provider */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/index.js");
/* harmony import */ var _style__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./style */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/tooltip/style/index.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./util */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/tooltip/util.js");
/* __next_internal_client_entry_do_not_use__ default auto */ 





/** @private Internal Component. Do not use in your production. */ const PurePanel = (props)=>{
    const { prefixCls: customizePrefixCls, className, placement = "top", title, color, overlayInnerStyle } = props;
    const { getPrefixCls } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(_config_provider__WEBPACK_IMPORTED_MODULE_3__.ConfigContext);
    const prefixCls = getPrefixCls("tooltip", customizePrefixCls);
    const [wrapCSSVar, hashId, cssVarCls] = (0,_style__WEBPACK_IMPORTED_MODULE_4__["default"])(prefixCls);
    // Color
    const colorInfo = (0,_util__WEBPACK_IMPORTED_MODULE_5__.parseColor)(prefixCls, color);
    const arrowContentStyle = colorInfo.arrowStyle;
    const formattedOverlayInnerStyle = Object.assign(Object.assign({}, overlayInnerStyle), colorInfo.overlayStyle);
    const cls = classnames__WEBPACK_IMPORTED_MODULE_1___default()(hashId, cssVarCls, prefixCls, `${prefixCls}-pure`, `${prefixCls}-placement-${placement}`, className, colorInfo.className);
    return wrapCSSVar(/*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        className: cls,
        style: arrowContentStyle
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        className: `${prefixCls}-arrow`
    }), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(rc_tooltip__WEBPACK_IMPORTED_MODULE_2__.Popup, Object.assign({}, props, {
        className: hashId,
        prefixCls: prefixCls,
        overlayInnerStyle: formattedOverlayInnerStyle
    }), title)));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PurePanel);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/tooltip/index.js":
/*!****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/tooltip/index.js ***!
  \****************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var rc_tooltip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rc-tooltip */ "../../node_modules/.pnpm/rc-tooltip@6.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-tooltip/lib/index.js");
/* harmony import */ var rc_util_es_hooks_useMergedState__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rc-util/es/hooks/useMergedState */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/es/hooks/useMergedState.js");
/* harmony import */ var _util_ContextIsolator__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../_util/ContextIsolator */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/ContextIsolator.js");
/* harmony import */ var _util_hooks_useZIndex__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../_util/hooks/useZIndex */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/hooks/useZIndex.js");
/* harmony import */ var _util_motion__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../_util/motion */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/motion.js");
/* harmony import */ var _util_placements__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../_util/placements */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/placements.js");
/* harmony import */ var _util_reactNode__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../_util/reactNode */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/reactNode.js");
/* harmony import */ var _util_warning__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../_util/warning */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/warning.js");
/* harmony import */ var _util_zindexContext__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../_util/zindexContext */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/zindexContext.js");
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../config-provider */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/config-provider/index.js");
/* harmony import */ var _theme_internal__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../theme/internal */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/internal.js");
/* harmony import */ var _PurePanel__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./PurePanel */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/tooltip/PurePanel.js");
/* harmony import */ var _style__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./style */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/tooltip/style/index.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./util */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/tooltip/util.js");
/* __next_internal_client_entry_do_not_use__ default auto */ var __rest = undefined && undefined.__rest || function(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
};
















const InternalTooltip = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, ref)=>{
    var _a, _b;
    const { prefixCls: customizePrefixCls, openClassName, getTooltipContainer, overlayClassName, color, overlayInnerStyle, children, afterOpenChange, afterVisibleChange, destroyTooltipOnHide, arrow = true, title, overlay, builtinPlacements, arrowPointAtCenter = false, autoAdjustOverflow = true } = props;
    const mergedShowArrow = !!arrow;
    const [, token] = (0,_theme_internal__WEBPACK_IMPORTED_MODULE_4__.useToken)();
    const { getPopupContainer: getContextPopupContainer, getPrefixCls, direction } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(_config_provider__WEBPACK_IMPORTED_MODULE_5__.ConfigContext);
    // ============================== Ref ===============================
    const warning = (0,_util_warning__WEBPACK_IMPORTED_MODULE_6__.devUseWarning)("Tooltip");
    const tooltipRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
    const forceAlign = ()=>{
        var _a;
        (_a = tooltipRef.current) === null || _a === void 0 ? void 0 : _a.forceAlign();
    };
    react__WEBPACK_IMPORTED_MODULE_0__.useImperativeHandle(ref, ()=>{
        var _a;
        return {
            forceAlign,
            forcePopupAlign: ()=>{
                warning.deprecated(false, "forcePopupAlign", "forceAlign");
                forceAlign();
            },
            nativeElement: (_a = tooltipRef.current) === null || _a === void 0 ? void 0 : _a.nativeElement
        };
    });
    // ============================== Warn ==============================
    if (true) {
        [
            [
                "visible",
                "open"
            ],
            [
                "defaultVisible",
                "defaultOpen"
            ],
            [
                "onVisibleChange",
                "onOpenChange"
            ],
            [
                "afterVisibleChange",
                "afterOpenChange"
            ],
            [
                "arrowPointAtCenter",
                "arrow={{ pointAtCenter: true }}"
            ]
        ].forEach((_ref)=>{
            let [deprecatedName, newName] = _ref;
            warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
        });
         true ? warning(!destroyTooltipOnHide || typeof destroyTooltipOnHide === "boolean", "usage", "`destroyTooltipOnHide` no need config `keepParent` anymore. Please use `boolean` value directly.") : 0;
         true ? warning(!arrow || typeof arrow === "boolean" || !("arrowPointAtCenter" in arrow), "deprecated", "`arrowPointAtCenter` in `arrow` is deprecated. Please use `pointAtCenter` instead.") : 0;
    }
    // ============================== Open ==============================
    const [open, setOpen] = (0,rc_util_es_hooks_useMergedState__WEBPACK_IMPORTED_MODULE_3__["default"])(false, {
        value: (_a = props.open) !== null && _a !== void 0 ? _a : props.visible,
        defaultValue: (_b = props.defaultOpen) !== null && _b !== void 0 ? _b : props.defaultVisible
    });
    const noTitle = !title && !overlay && title !== 0; // overlay for old version compatibility
    const onOpenChange = (vis)=>{
        var _a, _b;
        setOpen(noTitle ? false : vis);
        if (!noTitle) {
            (_a = props.onOpenChange) === null || _a === void 0 ? void 0 : _a.call(props, vis);
            (_b = props.onVisibleChange) === null || _b === void 0 ? void 0 : _b.call(props, vis);
        }
    };
    const tooltipPlacements = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>{
        var _a, _b;
        let mergedArrowPointAtCenter = arrowPointAtCenter;
        if (typeof arrow === "object") {
            mergedArrowPointAtCenter = (_b = (_a = arrow.pointAtCenter) !== null && _a !== void 0 ? _a : arrow.arrowPointAtCenter) !== null && _b !== void 0 ? _b : arrowPointAtCenter;
        }
        return builtinPlacements || (0,_util_placements__WEBPACK_IMPORTED_MODULE_7__["default"])({
            arrowPointAtCenter: mergedArrowPointAtCenter,
            autoAdjustOverflow,
            arrowWidth: mergedShowArrow ? token.sizePopupArrow : 0,
            borderRadius: token.borderRadius,
            offset: token.marginXXS,
            visibleFirst: true
        });
    }, [
        arrowPointAtCenter,
        arrow,
        builtinPlacements,
        token
    ]);
    const memoOverlay = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>{
        if (title === 0) {
            return title;
        }
        return overlay || title || "";
    }, [
        overlay,
        title
    ]);
    const memoOverlayWrapper = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_util_ContextIsolator__WEBPACK_IMPORTED_MODULE_8__["default"], {
        space: true
    }, typeof memoOverlay === "function" ? memoOverlay() : memoOverlay);
    const { getPopupContainer, placement = "top", mouseEnterDelay = 0.1, mouseLeaveDelay = 0.1, overlayStyle, rootClassName } = props, otherProps = __rest(props, [
        "getPopupContainer",
        "placement",
        "mouseEnterDelay",
        "mouseLeaveDelay",
        "overlayStyle",
        "rootClassName"
    ]);
    const prefixCls = getPrefixCls("tooltip", customizePrefixCls);
    const rootPrefixCls = getPrefixCls();
    const injectFromPopover = props["data-popover-inject"];
    let tempOpen = open;
    // Hide tooltip when there is no title
    if (!("open" in props) && !("visible" in props) && noTitle) {
        tempOpen = false;
    }
    // ============================= Render =============================
    const child = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(children) && !(0,_util_reactNode__WEBPACK_IMPORTED_MODULE_9__.isFragment)(children) ? children : /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, children);
    const childProps = child.props;
    const childCls = !childProps.className || typeof childProps.className === "string" ? classnames__WEBPACK_IMPORTED_MODULE_1___default()(childProps.className, openClassName || `${prefixCls}-open`) : childProps.className;
    // Style
    const [wrapCSSVar, hashId, cssVarCls] = (0,_style__WEBPACK_IMPORTED_MODULE_10__["default"])(prefixCls, !injectFromPopover);
    // Color
    const colorInfo = (0,_util__WEBPACK_IMPORTED_MODULE_11__.parseColor)(prefixCls, color);
    const arrowContentStyle = colorInfo.arrowStyle;
    const formattedOverlayInnerStyle = Object.assign(Object.assign({}, overlayInnerStyle), colorInfo.overlayStyle);
    const customOverlayClassName = classnames__WEBPACK_IMPORTED_MODULE_1___default()(overlayClassName, {
        [`${prefixCls}-rtl`]: direction === "rtl"
    }, colorInfo.className, rootClassName, hashId, cssVarCls);
    // ============================ zIndex ============================
    const [zIndex, contextZIndex] = (0,_util_hooks_useZIndex__WEBPACK_IMPORTED_MODULE_12__.useZIndex)("Tooltip", otherProps.zIndex);
    const content = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(rc_tooltip__WEBPACK_IMPORTED_MODULE_2__["default"], Object.assign({}, otherProps, {
        zIndex: zIndex,
        showArrow: mergedShowArrow,
        placement: placement,
        mouseEnterDelay: mouseEnterDelay,
        mouseLeaveDelay: mouseLeaveDelay,
        prefixCls: prefixCls,
        overlayClassName: customOverlayClassName,
        overlayStyle: Object.assign(Object.assign({}, arrowContentStyle), overlayStyle),
        getTooltipContainer: getPopupContainer || getTooltipContainer || getContextPopupContainer,
        ref: tooltipRef,
        builtinPlacements: tooltipPlacements,
        overlay: memoOverlayWrapper,
        visible: tempOpen,
        onVisibleChange: onOpenChange,
        afterVisibleChange: afterOpenChange !== null && afterOpenChange !== void 0 ? afterOpenChange : afterVisibleChange,
        overlayInnerStyle: formattedOverlayInnerStyle,
        arrowContent: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", {
            className: `${prefixCls}-arrow-content`
        }),
        motion: {
            motionName: (0,_util_motion__WEBPACK_IMPORTED_MODULE_13__.getTransitionName)(rootPrefixCls, "zoom-big-fast", props.transitionName),
            motionDeadline: 1000
        },
        destroyTooltipOnHide: !!destroyTooltipOnHide
    }), tempOpen ? (0,_util_reactNode__WEBPACK_IMPORTED_MODULE_9__.cloneElement)(child, {
        className: childCls
    }) : child);
    return wrapCSSVar(/*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_util_zindexContext__WEBPACK_IMPORTED_MODULE_14__["default"].Provider, {
        value: contextZIndex
    }, content));
});
const Tooltip = InternalTooltip;
if (true) {
    Tooltip.displayName = "Tooltip";
}
Tooltip._InternalPanelDoNotUseOrYouWillBeFired = _PurePanel__WEBPACK_IMPORTED_MODULE_15__["default"];
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Tooltip);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/tooltip/style/index.js":
/*!**********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/tooltip/style/index.js ***!
  \**********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   prepareComponentToken: () => (/* binding */ prepareComponentToken)
/* harmony export */ });
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/cssinjs */ "webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs");
/* harmony import */ var _ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _style__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../style */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/index.js");
/* harmony import */ var _style_motion__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../style/motion */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/motion/index.js");
/* harmony import */ var _style_placementArrow__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../style/placementArrow */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/placementArrow.js");
/* harmony import */ var _style_roundedArrow__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../style/roundedArrow */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/style/roundedArrow.js");
/* harmony import */ var _theme_internal__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../theme/internal */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/theme/internal.js");






const genTooltipStyle = (token)=>{
    const { componentCls, // ant-tooltip
    tooltipMaxWidth, tooltipColor, tooltipBg, tooltipBorderRadius, zIndexPopup, controlHeight, boxShadowSecondary, paddingSM, paddingXS } = token;
    return [
        {
            [componentCls]: Object.assign(Object.assign(Object.assign(Object.assign({}, (0,_style__WEBPACK_IMPORTED_MODULE_1__.resetComponent)(token)), {
                position: "absolute",
                zIndex: zIndexPopup,
                display: "block",
                width: "max-content",
                maxWidth: tooltipMaxWidth,
                visibility: "visible",
                transformOrigin: `var(--arrow-x, 50%) var(--arrow-y, 50%)`,
                "&-hidden": {
                    display: "none"
                },
                "--antd-arrow-background-color": tooltipBg,
                // Wrapper for the tooltip content
                [`${componentCls}-inner`]: {
                    minWidth: "1em",
                    minHeight: controlHeight,
                    padding: `${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(token.calc(paddingSM).div(2).equal())} ${(0,_ant_design_cssinjs__WEBPACK_IMPORTED_MODULE_0__.unit)(paddingXS)}`,
                    color: tooltipColor,
                    textAlign: "start",
                    textDecoration: "none",
                    wordWrap: "break-word",
                    backgroundColor: tooltipBg,
                    borderRadius: tooltipBorderRadius,
                    boxShadow: boxShadowSecondary,
                    boxSizing: "border-box"
                },
                // Limit left and right placement radius
                [[
                    `&-placement-left`,
                    `&-placement-leftTop`,
                    `&-placement-leftBottom`,
                    `&-placement-right`,
                    `&-placement-rightTop`,
                    `&-placement-rightBottom`
                ].join(",")]: {
                    [`${componentCls}-inner`]: {
                        borderRadius: token.min(tooltipBorderRadius, _style_placementArrow__WEBPACK_IMPORTED_MODULE_2__.MAX_VERTICAL_CONTENT_RADIUS)
                    }
                },
                [`${componentCls}-content`]: {
                    position: "relative"
                }
            }), (0,_theme_internal__WEBPACK_IMPORTED_MODULE_3__.genPresetColor)(token, (colorKey, _ref)=>{
                let { darkColor } = _ref;
                return {
                    [`&${componentCls}-${colorKey}`]: {
                        [`${componentCls}-inner`]: {
                            backgroundColor: darkColor
                        },
                        [`${componentCls}-arrow`]: {
                            "--antd-arrow-background-color": darkColor
                        }
                    }
                };
            })), {
                // RTL
                "&-rtl": {
                    direction: "rtl"
                }
            })
        },
        // Arrow Style
        (0,_style_placementArrow__WEBPACK_IMPORTED_MODULE_2__["default"])(token, "var(--antd-arrow-background-color)"),
        // Pure Render
        {
            [`${componentCls}-pure`]: {
                position: "relative",
                maxWidth: "none",
                margin: token.sizePopupArrow
            }
        }
    ];
};
// ============================== Export ==============================
const prepareComponentToken = (token)=>Object.assign(Object.assign({
        zIndexPopup: token.zIndexPopupBase + 70
    }, (0,_style_placementArrow__WEBPACK_IMPORTED_MODULE_2__.getArrowOffsetToken)({
        contentRadius: token.borderRadius,
        limitVerticalRadius: true
    })), (0,_style_roundedArrow__WEBPACK_IMPORTED_MODULE_4__.getArrowToken)((0,_theme_internal__WEBPACK_IMPORTED_MODULE_3__.mergeToken)(token, {
        borderRadiusOuter: Math.min(token.borderRadiusOuter, 4)
    })));
/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(prefixCls) {
    let injectStyle = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    const useStyle = (0,_theme_internal__WEBPACK_IMPORTED_MODULE_3__.genStyleHooks)("Tooltip", (token)=>{
        const { borderRadius, colorTextLightSolid, colorBgSpotlight } = token;
        const TooltipToken = (0,_theme_internal__WEBPACK_IMPORTED_MODULE_3__.mergeToken)(token, {
            // default variables
            tooltipMaxWidth: 250,
            tooltipColor: colorTextLightSolid,
            tooltipBorderRadius: borderRadius,
            tooltipBg: colorBgSpotlight
        });
        return [
            genTooltipStyle(TooltipToken),
            (0,_style_motion__WEBPACK_IMPORTED_MODULE_5__.initZoomMotion)(token, "zoom-big-fast")
        ];
    }, prepareComponentToken, {
        resetStyle: false,
        // Popover use Tooltip as internal component. We do not need to handle this.
        injectStyle
    });
    return useStyle(prefixCls);
};


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/tooltip/util.js":
/*!***************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/tooltip/util.js ***!
  \***************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseColor: () => (/* binding */ parseColor)
/* harmony export */ });
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _util_colors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../_util/colors */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/_util/colors.js");
/* eslint-disable import/prefer-default-export */ 

function parseColor(prefixCls, color) {
    const isInternalColor = (0,_util_colors__WEBPACK_IMPORTED_MODULE_1__.isPresetColor)(color);
    const className = classnames__WEBPACK_IMPORTED_MODULE_0___default()({
        [`${prefixCls}-${color}`]: color && isInternalColor
    });
    const overlayStyle = {};
    const arrowStyle = {};
    if (color && !isInternalColor) {
        overlayStyle.background = color;
        // @ts-ignore
        arrowStyle["--antd-arrow-background-color"] = color;
    }
    return {
        className,
        overlayStyle,
        arrowStyle
    };
}


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/version/index.js":
/*!****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/version/index.js ***!
  \****************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./version */ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/version/version.js");
/* __next_internal_client_entry_do_not_use__ default auto */ /* eslint import/no-unresolved: 0 */ // @ts-ignore

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_version__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ }),

/***/ "../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/version/version.js":
/*!******************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/antd@5.19.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/version/version.js ***!
  \******************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("5.19.1");


/***/ })

};
;