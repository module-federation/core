"use strict";
exports.id = "vendor-chunks/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1";
exports.ids = ["vendor-chunks/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1"];
exports.modules = {

/***/ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/Item.js":
/*!*********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/Item.js ***!
  \*********************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/extends */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/extends.js"));
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectWithoutProperties.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _classnames = _interopRequireDefault(__webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js"));
var _rcResizeObserver = _interopRequireDefault(__webpack_require__(/*! rc-resize-observer */ "../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/index.js"));
var _excluded = ["prefixCls", "invalidate", "item", "renderItem", "responsive", "responsiveDisabled", "registerSize", "itemKey", "className", "style", "children", "display", "order", "component"];
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
// Use shared variable to save bundle size
var UNDEFINED = undefined;
function InternalItem(props, ref) {
  var prefixCls = props.prefixCls,
    invalidate = props.invalidate,
    item = props.item,
    renderItem = props.renderItem,
    responsive = props.responsive,
    responsiveDisabled = props.responsiveDisabled,
    registerSize = props.registerSize,
    itemKey = props.itemKey,
    className = props.className,
    style = props.style,
    children = props.children,
    display = props.display,
    order = props.order,
    _props$component = props.component,
    Component = _props$component === void 0 ? 'div' : _props$component,
    restProps = (0, _objectWithoutProperties2.default)(props, _excluded);
  var mergedHidden = responsive && !display;
  // ================================ Effect ================================
  function internalRegisterSize(width) {
    registerSize(itemKey, width);
  }
  React.useEffect(function () {
    return function () {
      internalRegisterSize(null);
    };
  }, []);
  // ================================ Render ================================
  var childNode = renderItem && item !== UNDEFINED ? renderItem(item) : children;
  var overflowStyle;
  if (!invalidate) {
    overflowStyle = {
      opacity: mergedHidden ? 0 : 1,
      height: mergedHidden ? 0 : UNDEFINED,
      overflowY: mergedHidden ? 'hidden' : UNDEFINED,
      order: responsive ? order : UNDEFINED,
      pointerEvents: mergedHidden ? 'none' : UNDEFINED,
      position: mergedHidden ? 'absolute' : UNDEFINED
    };
  }
  var overflowProps = {};
  if (mergedHidden) {
    overflowProps['aria-hidden'] = true;
  }
  var itemNode = /*#__PURE__*/React.createElement(Component, (0, _extends2.default)({
    className: (0, _classnames.default)(!invalidate && prefixCls, className),
    style: (0, _objectSpread2.default)((0, _objectSpread2.default)({}, overflowStyle), style)
  }, overflowProps, restProps, {
    ref: ref
  }), childNode);
  if (responsive) {
    itemNode = /*#__PURE__*/React.createElement(_rcResizeObserver.default, {
      onResize: function onResize(_ref) {
        var offsetWidth = _ref.offsetWidth;
        internalRegisterSize(offsetWidth);
      },
      disabled: responsiveDisabled
    }, itemNode);
  }
  return itemNode;
}
var Item = /*#__PURE__*/React.forwardRef(InternalItem);
Item.displayName = 'Item';
var _default = Item;
exports["default"] = _default;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/Overflow.js":
/*!*************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/Overflow.js ***!
  \*************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "OverflowContext", ({
  enumerable: true,
  get: function get() {
    return _context.OverflowContext;
  }
}));
exports["default"] = void 0;
var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/extends */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/extends.js"));
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectWithoutProperties.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _classnames = _interopRequireDefault(__webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js"));
var _rcResizeObserver = _interopRequireDefault(__webpack_require__(/*! rc-resize-observer */ "../../node_modules/.pnpm/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-resize-observer/lib/index.js"));
var _useLayoutEffect = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/hooks/useLayoutEffect */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/hooks/useLayoutEffect.js"));
var _Item = _interopRequireDefault(__webpack_require__(/*! ./Item */ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/Item.js"));
var _useEffectState11 = _interopRequireWildcard(__webpack_require__(/*! ./hooks/useEffectState */ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/hooks/useEffectState.js"));
var _RawItem = _interopRequireDefault(__webpack_require__(/*! ./RawItem */ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/RawItem.js"));
var _context = __webpack_require__(/*! ./context */ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/context.js");
var _excluded = ["prefixCls", "data", "renderItem", "renderRawItem", "itemKey", "itemWidth", "ssr", "style", "className", "maxCount", "renderRest", "renderRawRest", "suffix", "component", "itemComponent", "onVisibleChange"];
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var RESPONSIVE = 'responsive';
var INVALIDATE = 'invalidate';
function defaultRenderRest(omittedItems) {
  return "+ ".concat(omittedItems.length, " ...");
}
function Overflow(props, ref) {
  var _props$prefixCls = props.prefixCls,
    prefixCls = _props$prefixCls === void 0 ? 'rc-overflow' : _props$prefixCls,
    _props$data = props.data,
    data = _props$data === void 0 ? [] : _props$data,
    renderItem = props.renderItem,
    renderRawItem = props.renderRawItem,
    itemKey = props.itemKey,
    _props$itemWidth = props.itemWidth,
    itemWidth = _props$itemWidth === void 0 ? 10 : _props$itemWidth,
    ssr = props.ssr,
    style = props.style,
    className = props.className,
    maxCount = props.maxCount,
    renderRest = props.renderRest,
    renderRawRest = props.renderRawRest,
    suffix = props.suffix,
    _props$component = props.component,
    Component = _props$component === void 0 ? 'div' : _props$component,
    itemComponent = props.itemComponent,
    onVisibleChange = props.onVisibleChange,
    restProps = (0, _objectWithoutProperties2.default)(props, _excluded);
  var fullySSR = ssr === 'full';
  var notifyEffectUpdate = (0, _useEffectState11.useBatcher)();
  var _useEffectState = (0, _useEffectState11.default)(notifyEffectUpdate, null),
    _useEffectState2 = (0, _slicedToArray2.default)(_useEffectState, 2),
    containerWidth = _useEffectState2[0],
    setContainerWidth = _useEffectState2[1];
  var mergedContainerWidth = containerWidth || 0;
  var _useEffectState3 = (0, _useEffectState11.default)(notifyEffectUpdate, new Map()),
    _useEffectState4 = (0, _slicedToArray2.default)(_useEffectState3, 2),
    itemWidths = _useEffectState4[0],
    setItemWidths = _useEffectState4[1];
  var _useEffectState5 = (0, _useEffectState11.default)(notifyEffectUpdate, 0),
    _useEffectState6 = (0, _slicedToArray2.default)(_useEffectState5, 2),
    prevRestWidth = _useEffectState6[0],
    setPrevRestWidth = _useEffectState6[1];
  var _useEffectState7 = (0, _useEffectState11.default)(notifyEffectUpdate, 0),
    _useEffectState8 = (0, _slicedToArray2.default)(_useEffectState7, 2),
    restWidth = _useEffectState8[0],
    setRestWidth = _useEffectState8[1];
  var _useEffectState9 = (0, _useEffectState11.default)(notifyEffectUpdate, 0),
    _useEffectState10 = (0, _slicedToArray2.default)(_useEffectState9, 2),
    suffixWidth = _useEffectState10[0],
    setSuffixWidth = _useEffectState10[1];
  var _useState = (0, React.useState)(null),
    _useState2 = (0, _slicedToArray2.default)(_useState, 2),
    suffixFixedStart = _useState2[0],
    setSuffixFixedStart = _useState2[1];
  var _useState3 = (0, React.useState)(null),
    _useState4 = (0, _slicedToArray2.default)(_useState3, 2),
    displayCount = _useState4[0],
    setDisplayCount = _useState4[1];
  var mergedDisplayCount = React.useMemo(function () {
    if (displayCount === null && fullySSR) {
      return Number.MAX_SAFE_INTEGER;
    }
    return displayCount || 0;
  }, [displayCount, containerWidth]);
  var _useState5 = (0, React.useState)(false),
    _useState6 = (0, _slicedToArray2.default)(_useState5, 2),
    restReady = _useState6[0],
    setRestReady = _useState6[1];
  var itemPrefixCls = "".concat(prefixCls, "-item");
  // Always use the max width to avoid blink
  var mergedRestWidth = Math.max(prevRestWidth, restWidth);
  // ================================= Data =================================
  var isResponsive = maxCount === RESPONSIVE;
  var shouldResponsive = data.length && isResponsive;
  var invalidate = maxCount === INVALIDATE;
  /**
   * When is `responsive`, we will always render rest node to get the real width of it for calculation
   */
  var showRest = shouldResponsive || typeof maxCount === 'number' && data.length > maxCount;
  var mergedData = (0, React.useMemo)(function () {
    var items = data;
    if (shouldResponsive) {
      if (containerWidth === null && fullySSR) {
        items = data;
      } else {
        items = data.slice(0, Math.min(data.length, mergedContainerWidth / itemWidth));
      }
    } else if (typeof maxCount === 'number') {
      items = data.slice(0, maxCount);
    }
    return items;
  }, [data, itemWidth, containerWidth, maxCount, shouldResponsive]);
  var omittedItems = (0, React.useMemo)(function () {
    if (shouldResponsive) {
      return data.slice(mergedDisplayCount + 1);
    }
    return data.slice(mergedData.length);
  }, [data, mergedData, shouldResponsive, mergedDisplayCount]);
  // ================================= Item =================================
  var getKey = (0, React.useCallback)(function (item, index) {
    var _ref;
    if (typeof itemKey === 'function') {
      return itemKey(item);
    }
    return (_ref = itemKey && (item === null || item === void 0 ? void 0 : item[itemKey])) !== null && _ref !== void 0 ? _ref : index;
  }, [itemKey]);
  var mergedRenderItem = (0, React.useCallback)(renderItem || function (item) {
    return item;
  }, [renderItem]);
  function updateDisplayCount(count, suffixFixedStartVal, notReady) {
    // React 18 will sync render even when the value is same in some case.
    // We take `mergedData` as deps which may cause dead loop if it's dynamic generate.
    // ref: https://github.com/ant-design/ant-design/issues/36559
    if (displayCount === count && (suffixFixedStartVal === undefined || suffixFixedStartVal === suffixFixedStart)) {
      return;
    }
    setDisplayCount(count);
    if (!notReady) {
      setRestReady(count < data.length - 1);
      onVisibleChange === null || onVisibleChange === void 0 ? void 0 : onVisibleChange(count);
    }
    if (suffixFixedStartVal !== undefined) {
      setSuffixFixedStart(suffixFixedStartVal);
    }
  }
  // ================================= Size =================================
  function onOverflowResize(_, element) {
    setContainerWidth(element.clientWidth);
  }
  function registerSize(key, width) {
    setItemWidths(function (origin) {
      var clone = new Map(origin);
      if (width === null) {
        clone.delete(key);
      } else {
        clone.set(key, width);
      }
      return clone;
    });
  }
  function registerOverflowSize(_, width) {
    setRestWidth(width);
    setPrevRestWidth(restWidth);
  }
  function registerSuffixSize(_, width) {
    setSuffixWidth(width);
  }
  // ================================ Effect ================================
  function getItemWidth(index) {
    return itemWidths.get(getKey(mergedData[index], index));
  }
  (0, _useLayoutEffect.default)(function () {
    if (mergedContainerWidth && typeof mergedRestWidth === 'number' && mergedData) {
      var totalWidth = suffixWidth;
      var len = mergedData.length;
      var lastIndex = len - 1;
      // When data count change to 0, reset this since not loop will reach
      if (!len) {
        updateDisplayCount(0, null);
        return;
      }
      for (var i = 0; i < len; i += 1) {
        var currentItemWidth = getItemWidth(i);
        // Fully will always render
        if (fullySSR) {
          currentItemWidth = currentItemWidth || 0;
        }
        // Break since data not ready
        if (currentItemWidth === undefined) {
          updateDisplayCount(i - 1, undefined, true);
          break;
        }
        // Find best match
        totalWidth += currentItemWidth;
        if (
        // Only one means `totalWidth` is the final width
        lastIndex === 0 && totalWidth <= mergedContainerWidth ||
        // Last two width will be the final width
        i === lastIndex - 1 && totalWidth + getItemWidth(lastIndex) <= mergedContainerWidth) {
          // Additional check if match the end
          updateDisplayCount(lastIndex, null);
          break;
        } else if (totalWidth + mergedRestWidth > mergedContainerWidth) {
          // Can not hold all the content to show rest
          updateDisplayCount(i - 1, totalWidth - currentItemWidth - suffixWidth + restWidth);
          break;
        }
      }
      if (suffix && getItemWidth(0) + suffixWidth > mergedContainerWidth) {
        setSuffixFixedStart(null);
      }
    }
  }, [mergedContainerWidth, itemWidths, restWidth, suffixWidth, getKey, mergedData]);
  // ================================ Render ================================
  var displayRest = restReady && !!omittedItems.length;
  var suffixStyle = {};
  if (suffixFixedStart !== null && shouldResponsive) {
    suffixStyle = {
      position: 'absolute',
      left: suffixFixedStart,
      top: 0
    };
  }
  var itemSharedProps = {
    prefixCls: itemPrefixCls,
    responsive: shouldResponsive,
    component: itemComponent,
    invalidate: invalidate
  };
  // >>>>> Choice render fun by `renderRawItem`
  var internalRenderItemNode = renderRawItem ? function (item, index) {
    var key = getKey(item, index);
    return /*#__PURE__*/React.createElement(_context.OverflowContext.Provider, {
      key: key,
      value: (0, _objectSpread2.default)((0, _objectSpread2.default)({}, itemSharedProps), {}, {
        order: index,
        item: item,
        itemKey: key,
        registerSize: registerSize,
        display: index <= mergedDisplayCount
      })
    }, renderRawItem(item, index));
  } : function (item, index) {
    var key = getKey(item, index);
    return /*#__PURE__*/React.createElement(_Item.default, (0, _extends2.default)({}, itemSharedProps, {
      order: index,
      key: key,
      item: item,
      renderItem: mergedRenderItem,
      itemKey: key,
      registerSize: registerSize,
      display: index <= mergedDisplayCount
    }));
  };
  // >>>>> Rest node
  var restNode;
  var restContextProps = {
    order: displayRest ? mergedDisplayCount : Number.MAX_SAFE_INTEGER,
    className: "".concat(itemPrefixCls, "-rest"),
    registerSize: registerOverflowSize,
    display: displayRest
  };
  if (!renderRawRest) {
    var mergedRenderRest = renderRest || defaultRenderRest;
    restNode = /*#__PURE__*/React.createElement(_Item.default, (0, _extends2.default)({}, itemSharedProps, restContextProps), typeof mergedRenderRest === 'function' ? mergedRenderRest(omittedItems) : mergedRenderRest);
  } else if (renderRawRest) {
    restNode = /*#__PURE__*/React.createElement(_context.OverflowContext.Provider, {
      value: (0, _objectSpread2.default)((0, _objectSpread2.default)({}, itemSharedProps), restContextProps)
    }, renderRawRest(omittedItems));
  }
  var overflowNode = /*#__PURE__*/React.createElement(Component, (0, _extends2.default)({
    className: (0, _classnames.default)(!invalidate && prefixCls, className),
    style: style,
    ref: ref
  }, restProps), mergedData.map(internalRenderItemNode), showRest ? restNode : null, suffix && /*#__PURE__*/React.createElement(_Item.default, (0, _extends2.default)({}, itemSharedProps, {
    responsive: isResponsive,
    responsiveDisabled: !shouldResponsive,
    order: mergedDisplayCount,
    className: "".concat(itemPrefixCls, "-suffix"),
    registerSize: registerSuffixSize,
    display: true,
    style: suffixStyle
  }), suffix));
  if (isResponsive) {
    overflowNode = /*#__PURE__*/React.createElement(_rcResizeObserver.default, {
      onResize: onOverflowResize,
      disabled: !shouldResponsive
    }, overflowNode);
  }
  return overflowNode;
}
var ForwardOverflow = /*#__PURE__*/React.forwardRef(Overflow);
ForwardOverflow.displayName = 'Overflow';
ForwardOverflow.Item = _RawItem.default;
ForwardOverflow.RESPONSIVE = RESPONSIVE;
ForwardOverflow.INVALIDATE = INVALIDATE;
// Convert to generic type
var _default = ForwardOverflow;
exports["default"] = _default;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/RawItem.js":
/*!************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/RawItem.js ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/extends */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/extends.js"));
var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectWithoutProperties.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _classnames = _interopRequireDefault(__webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js"));
var _Item = _interopRequireDefault(__webpack_require__(/*! ./Item */ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/Item.js"));
var _context = __webpack_require__(/*! ./context */ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/context.js");
var _excluded = ["component"],
  _excluded2 = ["className"],
  _excluded3 = ["className"];
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var InternalRawItem = function InternalRawItem(props, ref) {
  var context = React.useContext(_context.OverflowContext);
  // Render directly when context not provided
  if (!context) {
    var _props$component = props.component,
      Component = _props$component === void 0 ? 'div' : _props$component,
      _restProps = (0, _objectWithoutProperties2.default)(props, _excluded);
    return /*#__PURE__*/React.createElement(Component, (0, _extends2.default)({}, _restProps, {
      ref: ref
    }));
  }
  var contextClassName = context.className,
    restContext = (0, _objectWithoutProperties2.default)(context, _excluded2);
  var className = props.className,
    restProps = (0, _objectWithoutProperties2.default)(props, _excluded3);
  // Do not pass context to sub item to avoid multiple measure
  return /*#__PURE__*/React.createElement(_context.OverflowContext.Provider, {
    value: null
  }, /*#__PURE__*/React.createElement(_Item.default, (0, _extends2.default)({
    ref: ref,
    className: (0, _classnames.default)(contextClassName, className)
  }, restContext, restProps)));
};
var RawItem = /*#__PURE__*/React.forwardRef(InternalRawItem);
RawItem.displayName = 'RawItem';
var _default = RawItem;
exports["default"] = _default;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/context.js":
/*!************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/context.js ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.OverflowContext = void 0;
var _react = _interopRequireDefault(__webpack_require__(/*! react */ "react"));
var OverflowContext = /*#__PURE__*/_react.default.createContext(null);
exports.OverflowContext = OverflowContext;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/hooks/channelUpdate.js":
/*!************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/hooks/channelUpdate.js ***!
  \************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = channelUpdate;
var _raf = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/raf */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/raf.js"));
function channelUpdate(callback) {
  if (typeof MessageChannel === 'undefined') {
    (0, _raf.default)(callback);
  } else {
    var channel = new MessageChannel();
    channel.port1.onmessage = function () {
      return callback();
    };
    channel.port2.postMessage(undefined);
  }
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/hooks/useEffectState.js":
/*!*************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/hooks/useEffectState.js ***!
  \*************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = useEffectState;
exports.useBatcher = useBatcher;
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _useEvent = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/hooks/useEvent */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/hooks/useEvent.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _reactDom = __webpack_require__(/*! react-dom */ "react-dom");
var _channelUpdate = _interopRequireDefault(__webpack_require__(/*! ./channelUpdate */ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/hooks/channelUpdate.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * Batcher for record any `useEffectState` need update.
 */
function useBatcher() {
  // Updater Trigger
  var updateFuncRef = React.useRef(null);
  // Notify update
  var notifyEffectUpdate = function notifyEffectUpdate(callback) {
    if (!updateFuncRef.current) {
      updateFuncRef.current = [];
      (0, _channelUpdate.default)(function () {
        (0, _reactDom.unstable_batchedUpdates)(function () {
          updateFuncRef.current.forEach(function (fn) {
            fn();
          });
          updateFuncRef.current = null;
        });
      });
    }
    updateFuncRef.current.push(callback);
  };
  return notifyEffectUpdate;
}
/**
 * Trigger state update by `useLayoutEffect` to save perf.
 */
function useEffectState(notifyEffectUpdate, defaultValue) {
  // Value
  var _React$useState = React.useState(defaultValue),
    _React$useState2 = (0, _slicedToArray2.default)(_React$useState, 2),
    stateValue = _React$useState2[0],
    setStateValue = _React$useState2[1];
  // Set State
  var setEffectVal = (0, _useEvent.default)(function (nextValue) {
    notifyEffectUpdate(function () {
      setStateValue(nextValue);
    });
  });
  return [stateValue, setEffectVal];
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/index.js":
/*!**********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/index.js ***!
  \**********************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _Overflow = _interopRequireDefault(__webpack_require__(/*! ./Overflow */ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/Overflow.js"));
var _default = _Overflow.default;
exports["default"] = _default;

/***/ })

};
;