"use strict";
exports.id = "vendor-chunks/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1";
exports.ids = ["vendor-chunks/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1"];
exports.modules = {

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/Divider.js":
/*!*****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/Divider.js ***!
  \*****************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = Divider;
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _classnames = _interopRequireDefault(__webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js"));
var _MenuContext = __webpack_require__(/*! ./context/MenuContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/MenuContext.js");
var _PathContext = __webpack_require__(/*! ./context/PathContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/PathContext.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function Divider(_ref) {
  var className = _ref.className,
    style = _ref.style;
  var _React$useContext = React.useContext(_MenuContext.MenuContext),
    prefixCls = _React$useContext.prefixCls;
  var measure = (0, _PathContext.useMeasure)();
  if (measure) {
    return null;
  }
  return /*#__PURE__*/React.createElement("li", {
    role: "separator",
    className: (0, _classnames.default)("".concat(prefixCls, "-item-divider"), className),
    style: style
  });
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/Icon.js":
/*!**************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/Icon.js ***!
  \**************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = Icon;
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function Icon(_ref) {
  var icon = _ref.icon,
    props = _ref.props,
    children = _ref.children;
  var iconNode;
  if (icon === null || icon === false) {
    return null;
  }
  if (typeof icon === 'function') {
    iconNode = /*#__PURE__*/React.createElement(icon, (0, _objectSpread2.default)({}, props));
  } else if (typeof icon !== "boolean") {
    // Compatible for origin definition
    iconNode = icon;
  }
  return iconNode || children || null;
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/Menu.js":
/*!**************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/Menu.js ***!
  \**************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/extends */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/extends.js"));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/defineProperty.js"));
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/toConsumableArray.js"));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectWithoutProperties.js"));
var _classnames = _interopRequireDefault(__webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js"));
var _rcOverflow = _interopRequireDefault(__webpack_require__(/*! rc-overflow */ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/index.js"));
var _useMergedState7 = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/hooks/useMergedState */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/hooks/useMergedState.js"));
var _isEqual = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/isEqual */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/isEqual.js"));
var _warning = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/warning */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/warning.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _reactDom = __webpack_require__(/*! react-dom */ "react-dom");
var _IdContext = __webpack_require__(/*! ./context/IdContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/IdContext.js");
var _MenuContext = _interopRequireDefault(__webpack_require__(/*! ./context/MenuContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/MenuContext.js"));
var _PathContext = __webpack_require__(/*! ./context/PathContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/PathContext.js");
var _PrivateContext = _interopRequireDefault(__webpack_require__(/*! ./context/PrivateContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/PrivateContext.js"));
var _useAccessibility = __webpack_require__(/*! ./hooks/useAccessibility */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useAccessibility.js");
var _useKeyRecords2 = _interopRequireWildcard(__webpack_require__(/*! ./hooks/useKeyRecords */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useKeyRecords.js"));
var _useMemoCallback = _interopRequireDefault(__webpack_require__(/*! ./hooks/useMemoCallback */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useMemoCallback.js"));
var _useUUID = _interopRequireDefault(__webpack_require__(/*! ./hooks/useUUID */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useUUID.js"));
var _MenuItem = _interopRequireDefault(__webpack_require__(/*! ./MenuItem */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/MenuItem.js"));
var _SubMenu = _interopRequireDefault(__webpack_require__(/*! ./SubMenu */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/SubMenu/index.js"));
var _nodeUtil = __webpack_require__(/*! ./utils/nodeUtil */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/nodeUtil.js");
var _warnUtil = __webpack_require__(/*! ./utils/warnUtil */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/warnUtil.js");
var _excluded = ["prefixCls", "rootClassName", "style", "className", "tabIndex", "items", "children", "direction", "id", "mode", "inlineCollapsed", "disabled", "disabledOverflow", "subMenuOpenDelay", "subMenuCloseDelay", "forceSubMenuRender", "defaultOpenKeys", "openKeys", "activeKey", "defaultActiveFirst", "selectable", "multiple", "defaultSelectedKeys", "selectedKeys", "onSelect", "onDeselect", "inlineIndent", "motion", "defaultMotions", "triggerSubMenuAction", "builtinPlacements", "itemIcon", "expandIcon", "overflowedIndicator", "overflowedIndicatorPopupClassName", "getPopupContainer", "onClick", "onOpenChange", "onKeyDown", "openAnimation", "openTransitionName", "_internalRenderMenuItem", "_internalRenderSubMenuItem", "_internalComponents"];
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * Menu modify after refactor:
 * ## Add
 * - disabled
 *
 * ## Remove
 * - openTransitionName
 * - openAnimation
 * - onDestroy
 * - siderCollapsed: Seems antd do not use this prop (Need test in antd)
 * - collapsedWidth: Seems this logic should be handle by antd Layout.Sider
 */ // optimize for render
var EMPTY_LIST = [];
var Menu = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _childList$, _classNames;
  var _ref = props,
    _ref$prefixCls = _ref.prefixCls,
    prefixCls = _ref$prefixCls === void 0 ? 'rc-menu' : _ref$prefixCls,
    rootClassName = _ref.rootClassName,
    style = _ref.style,
    className = _ref.className,
    _ref$tabIndex = _ref.tabIndex,
    tabIndex = _ref$tabIndex === void 0 ? 0 : _ref$tabIndex,
    items = _ref.items,
    children = _ref.children,
    direction = _ref.direction,
    id = _ref.id,
    _ref$mode = _ref.mode,
    mode = _ref$mode === void 0 ? 'vertical' : _ref$mode,
    inlineCollapsed = _ref.inlineCollapsed,
    disabled = _ref.disabled,
    disabledOverflow = _ref.disabledOverflow,
    _ref$subMenuOpenDelay = _ref.subMenuOpenDelay,
    subMenuOpenDelay = _ref$subMenuOpenDelay === void 0 ? 0.1 : _ref$subMenuOpenDelay,
    _ref$subMenuCloseDela = _ref.subMenuCloseDelay,
    subMenuCloseDelay = _ref$subMenuCloseDela === void 0 ? 0.1 : _ref$subMenuCloseDela,
    forceSubMenuRender = _ref.forceSubMenuRender,
    defaultOpenKeys = _ref.defaultOpenKeys,
    openKeys = _ref.openKeys,
    activeKey = _ref.activeKey,
    defaultActiveFirst = _ref.defaultActiveFirst,
    _ref$selectable = _ref.selectable,
    selectable = _ref$selectable === void 0 ? true : _ref$selectable,
    _ref$multiple = _ref.multiple,
    multiple = _ref$multiple === void 0 ? false : _ref$multiple,
    defaultSelectedKeys = _ref.defaultSelectedKeys,
    selectedKeys = _ref.selectedKeys,
    onSelect = _ref.onSelect,
    onDeselect = _ref.onDeselect,
    _ref$inlineIndent = _ref.inlineIndent,
    inlineIndent = _ref$inlineIndent === void 0 ? 24 : _ref$inlineIndent,
    motion = _ref.motion,
    defaultMotions = _ref.defaultMotions,
    _ref$triggerSubMenuAc = _ref.triggerSubMenuAction,
    triggerSubMenuAction = _ref$triggerSubMenuAc === void 0 ? 'hover' : _ref$triggerSubMenuAc,
    builtinPlacements = _ref.builtinPlacements,
    itemIcon = _ref.itemIcon,
    expandIcon = _ref.expandIcon,
    _ref$overflowedIndica = _ref.overflowedIndicator,
    overflowedIndicator = _ref$overflowedIndica === void 0 ? '...' : _ref$overflowedIndica,
    overflowedIndicatorPopupClassName = _ref.overflowedIndicatorPopupClassName,
    getPopupContainer = _ref.getPopupContainer,
    onClick = _ref.onClick,
    onOpenChange = _ref.onOpenChange,
    onKeyDown = _ref.onKeyDown,
    openAnimation = _ref.openAnimation,
    openTransitionName = _ref.openTransitionName,
    _internalRenderMenuItem = _ref._internalRenderMenuItem,
    _internalRenderSubMenuItem = _ref._internalRenderSubMenuItem,
    _internalComponents = _ref._internalComponents,
    restProps = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  var _React$useMemo = React.useMemo(function () {
      return [(0, _nodeUtil.parseItems)(children, items, EMPTY_LIST, _internalComponents), (0, _nodeUtil.parseItems)(children, items, EMPTY_LIST, {})];
    }, [children, items, _internalComponents]),
    _React$useMemo2 = (0, _slicedToArray2.default)(_React$useMemo, 2),
    childList = _React$useMemo2[0],
    measureChildList = _React$useMemo2[1];
  var _React$useState = React.useState(false),
    _React$useState2 = (0, _slicedToArray2.default)(_React$useState, 2),
    mounted = _React$useState2[0],
    setMounted = _React$useState2[1];
  var containerRef = React.useRef();
  var uuid = (0, _useUUID.default)(id);
  var isRtl = direction === 'rtl';

  // ========================= Warn =========================
  if (true) {
    (0, _warning.default)(!openAnimation && !openTransitionName, '`openAnimation` and `openTransitionName` is removed. Please use `motion` or `defaultMotion` instead.');
  }

  // ========================= Open =========================
  var _useMergedState = (0, _useMergedState7.default)(defaultOpenKeys, {
      value: openKeys,
      postState: function postState(keys) {
        return keys || EMPTY_LIST;
      }
    }),
    _useMergedState2 = (0, _slicedToArray2.default)(_useMergedState, 2),
    mergedOpenKeys = _useMergedState2[0],
    setMergedOpenKeys = _useMergedState2[1];

  // React 18 will merge mouse event which means we open key will not sync
  // ref: https://github.com/ant-design/ant-design/issues/38818
  var triggerOpenKeys = function triggerOpenKeys(keys) {
    var forceFlush = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    function doUpdate() {
      setMergedOpenKeys(keys);
      onOpenChange === null || onOpenChange === void 0 ? void 0 : onOpenChange(keys);
    }
    if (forceFlush) {
      (0, _reactDom.flushSync)(doUpdate);
    } else {
      doUpdate();
    }
  };

  // >>>>> Cache & Reset open keys when inlineCollapsed changed
  var _React$useState3 = React.useState(mergedOpenKeys),
    _React$useState4 = (0, _slicedToArray2.default)(_React$useState3, 2),
    inlineCacheOpenKeys = _React$useState4[0],
    setInlineCacheOpenKeys = _React$useState4[1];
  var mountRef = React.useRef(false);

  // ========================= Mode =========================
  var _React$useMemo3 = React.useMemo(function () {
      if ((mode === 'inline' || mode === 'vertical') && inlineCollapsed) {
        return ['vertical', inlineCollapsed];
      }
      return [mode, false];
    }, [mode, inlineCollapsed]),
    _React$useMemo4 = (0, _slicedToArray2.default)(_React$useMemo3, 2),
    mergedMode = _React$useMemo4[0],
    mergedInlineCollapsed = _React$useMemo4[1];
  var isInlineMode = mergedMode === 'inline';
  var _React$useState5 = React.useState(mergedMode),
    _React$useState6 = (0, _slicedToArray2.default)(_React$useState5, 2),
    internalMode = _React$useState6[0],
    setInternalMode = _React$useState6[1];
  var _React$useState7 = React.useState(mergedInlineCollapsed),
    _React$useState8 = (0, _slicedToArray2.default)(_React$useState7, 2),
    internalInlineCollapsed = _React$useState8[0],
    setInternalInlineCollapsed = _React$useState8[1];
  React.useEffect(function () {
    setInternalMode(mergedMode);
    setInternalInlineCollapsed(mergedInlineCollapsed);
    if (!mountRef.current) {
      return;
    }
    // Synchronously update MergedOpenKeys
    if (isInlineMode) {
      setMergedOpenKeys(inlineCacheOpenKeys);
    } else {
      // Trigger open event in case its in control
      triggerOpenKeys(EMPTY_LIST);
    }
  }, [mergedMode, mergedInlineCollapsed]);

  // ====================== Responsive ======================
  var _React$useState9 = React.useState(0),
    _React$useState10 = (0, _slicedToArray2.default)(_React$useState9, 2),
    lastVisibleIndex = _React$useState10[0],
    setLastVisibleIndex = _React$useState10[1];
  var allVisible = lastVisibleIndex >= childList.length - 1 || internalMode !== 'horizontal' || disabledOverflow;

  // Cache
  React.useEffect(function () {
    if (isInlineMode) {
      setInlineCacheOpenKeys(mergedOpenKeys);
    }
  }, [mergedOpenKeys]);
  React.useEffect(function () {
    mountRef.current = true;
    return function () {
      mountRef.current = false;
    };
  }, []);

  // ========================= Path =========================
  var _useKeyRecords = (0, _useKeyRecords2.default)(),
    registerPath = _useKeyRecords.registerPath,
    unregisterPath = _useKeyRecords.unregisterPath,
    refreshOverflowKeys = _useKeyRecords.refreshOverflowKeys,
    isSubPathKey = _useKeyRecords.isSubPathKey,
    getKeyPath = _useKeyRecords.getKeyPath,
    getKeys = _useKeyRecords.getKeys,
    getSubPathKeys = _useKeyRecords.getSubPathKeys;
  var registerPathContext = React.useMemo(function () {
    return {
      registerPath: registerPath,
      unregisterPath: unregisterPath
    };
  }, [registerPath, unregisterPath]);
  var pathUserContext = React.useMemo(function () {
    return {
      isSubPathKey: isSubPathKey
    };
  }, [isSubPathKey]);
  React.useEffect(function () {
    refreshOverflowKeys(allVisible ? EMPTY_LIST : childList.slice(lastVisibleIndex + 1).map(function (child) {
      return child.key;
    }));
  }, [lastVisibleIndex, allVisible]);

  // ======================== Active ========================
  var _useMergedState3 = (0, _useMergedState7.default)(activeKey || defaultActiveFirst && ((_childList$ = childList[0]) === null || _childList$ === void 0 ? void 0 : _childList$.key), {
      value: activeKey
    }),
    _useMergedState4 = (0, _slicedToArray2.default)(_useMergedState3, 2),
    mergedActiveKey = _useMergedState4[0],
    setMergedActiveKey = _useMergedState4[1];
  var onActive = (0, _useMemoCallback.default)(function (key) {
    setMergedActiveKey(key);
  });
  var onInactive = (0, _useMemoCallback.default)(function () {
    setMergedActiveKey(undefined);
  });
  (0, React.useImperativeHandle)(ref, function () {
    return {
      list: containerRef.current,
      focus: function focus(options) {
        var _childList$find;
        var keys = getKeys();
        var _refreshElements = (0, _useAccessibility.refreshElements)(keys, uuid),
          elements = _refreshElements.elements,
          key2element = _refreshElements.key2element,
          element2key = _refreshElements.element2key;
        var focusableElements = (0, _useAccessibility.getFocusableElements)(containerRef.current, elements);
        var shouldFocusKey = mergedActiveKey !== null && mergedActiveKey !== void 0 ? mergedActiveKey : focusableElements[0] ? element2key.get(focusableElements[0]) : (_childList$find = childList.find(function (node) {
          return !node.props.disabled;
        })) === null || _childList$find === void 0 ? void 0 : _childList$find.key;
        var elementToFocus = key2element.get(shouldFocusKey);
        if (shouldFocusKey && elementToFocus) {
          var _elementToFocus$focus;
          elementToFocus === null || elementToFocus === void 0 ? void 0 : (_elementToFocus$focus = elementToFocus.focus) === null || _elementToFocus$focus === void 0 ? void 0 : _elementToFocus$focus.call(elementToFocus, options);
        }
      }
    };
  });

  // ======================== Select ========================
  // >>>>> Select keys
  var _useMergedState5 = (0, _useMergedState7.default)(defaultSelectedKeys || [], {
      value: selectedKeys,
      // Legacy convert key to array
      postState: function postState(keys) {
        if (Array.isArray(keys)) {
          return keys;
        }
        if (keys === null || keys === undefined) {
          return EMPTY_LIST;
        }
        return [keys];
      }
    }),
    _useMergedState6 = (0, _slicedToArray2.default)(_useMergedState5, 2),
    mergedSelectKeys = _useMergedState6[0],
    setMergedSelectKeys = _useMergedState6[1];

  // >>>>> Trigger select
  var triggerSelection = function triggerSelection(info) {
    if (selectable) {
      // Insert or Remove
      var targetKey = info.key;
      var exist = mergedSelectKeys.includes(targetKey);
      var newSelectKeys;
      if (multiple) {
        if (exist) {
          newSelectKeys = mergedSelectKeys.filter(function (key) {
            return key !== targetKey;
          });
        } else {
          newSelectKeys = [].concat((0, _toConsumableArray2.default)(mergedSelectKeys), [targetKey]);
        }
      } else {
        newSelectKeys = [targetKey];
      }
      setMergedSelectKeys(newSelectKeys);

      // Trigger event
      var selectInfo = (0, _objectSpread2.default)((0, _objectSpread2.default)({}, info), {}, {
        selectedKeys: newSelectKeys
      });
      if (exist) {
        onDeselect === null || onDeselect === void 0 ? void 0 : onDeselect(selectInfo);
      } else {
        onSelect === null || onSelect === void 0 ? void 0 : onSelect(selectInfo);
      }
    }

    // Whatever selectable, always close it
    if (!multiple && mergedOpenKeys.length && internalMode !== 'inline') {
      triggerOpenKeys(EMPTY_LIST);
    }
  };

  // ========================= Open =========================
  /**
   * Click for item. SubMenu do not have selection status
   */
  var onInternalClick = (0, _useMemoCallback.default)(function (info) {
    onClick === null || onClick === void 0 ? void 0 : onClick((0, _warnUtil.warnItemProp)(info));
    triggerSelection(info);
  });
  var onInternalOpenChange = (0, _useMemoCallback.default)(function (key, open) {
    var newOpenKeys = mergedOpenKeys.filter(function (k) {
      return k !== key;
    });
    if (open) {
      newOpenKeys.push(key);
    } else if (internalMode !== 'inline') {
      // We need find all related popup to close
      var subPathKeys = getSubPathKeys(key);
      newOpenKeys = newOpenKeys.filter(function (k) {
        return !subPathKeys.has(k);
      });
    }
    if (!(0, _isEqual.default)(mergedOpenKeys, newOpenKeys, true)) {
      triggerOpenKeys(newOpenKeys, true);
    }
  });

  // ==================== Accessibility =====================
  var triggerAccessibilityOpen = function triggerAccessibilityOpen(key, open) {
    var nextOpen = open !== null && open !== void 0 ? open : !mergedOpenKeys.includes(key);
    onInternalOpenChange(key, nextOpen);
  };
  var onInternalKeyDown = (0, _useAccessibility.useAccessibility)(internalMode, mergedActiveKey, isRtl, uuid, containerRef, getKeys, getKeyPath, setMergedActiveKey, triggerAccessibilityOpen, onKeyDown);

  // ======================== Effect ========================
  React.useEffect(function () {
    setMounted(true);
  }, []);

  // ======================= Context ========================
  var privateContext = React.useMemo(function () {
    return {
      _internalRenderMenuItem: _internalRenderMenuItem,
      _internalRenderSubMenuItem: _internalRenderSubMenuItem
    };
  }, [_internalRenderMenuItem, _internalRenderSubMenuItem]);

  // ======================== Render ========================

  // >>>>> Children
  var wrappedChildList = internalMode !== 'horizontal' || disabledOverflow ? childList :
  // Need wrap for overflow dropdown that do not response for open
  childList.map(function (child, index) {
    return (
      /*#__PURE__*/
      // Always wrap provider to avoid sub node re-mount
      React.createElement(_MenuContext.default, {
        key: child.key,
        overflowDisabled: index > lastVisibleIndex
      }, child)
    );
  });

  // >>>>> Container
  var container = /*#__PURE__*/React.createElement(_rcOverflow.default, (0, _extends2.default)({
    id: id,
    ref: containerRef,
    prefixCls: "".concat(prefixCls, "-overflow"),
    component: "ul",
    itemComponent: _MenuItem.default,
    className: (0, _classnames.default)(prefixCls, "".concat(prefixCls, "-root"), "".concat(prefixCls, "-").concat(internalMode), className, (_classNames = {}, (0, _defineProperty2.default)(_classNames, "".concat(prefixCls, "-inline-collapsed"), internalInlineCollapsed), (0, _defineProperty2.default)(_classNames, "".concat(prefixCls, "-rtl"), isRtl), _classNames), rootClassName),
    dir: direction,
    style: style,
    role: "menu",
    tabIndex: tabIndex,
    data: wrappedChildList,
    renderRawItem: function renderRawItem(node) {
      return node;
    },
    renderRawRest: function renderRawRest(omitItems) {
      // We use origin list since wrapped list use context to prevent open
      var len = omitItems.length;
      var originOmitItems = len ? childList.slice(-len) : null;
      return /*#__PURE__*/React.createElement(_SubMenu.default, {
        eventKey: _useKeyRecords2.OVERFLOW_KEY,
        title: overflowedIndicator,
        disabled: allVisible,
        internalPopupClose: len === 0,
        popupClassName: overflowedIndicatorPopupClassName
      }, originOmitItems);
    },
    maxCount: internalMode !== 'horizontal' || disabledOverflow ? _rcOverflow.default.INVALIDATE : _rcOverflow.default.RESPONSIVE,
    ssr: "full",
    "data-menu-list": true,
    onVisibleChange: function onVisibleChange(newLastIndex) {
      setLastVisibleIndex(newLastIndex);
    },
    onKeyDown: onInternalKeyDown
  }, restProps));

  // >>>>> Render
  return /*#__PURE__*/React.createElement(_PrivateContext.default.Provider, {
    value: privateContext
  }, /*#__PURE__*/React.createElement(_IdContext.IdContext.Provider, {
    value: uuid
  }, /*#__PURE__*/React.createElement(_MenuContext.default, {
    prefixCls: prefixCls,
    rootClassName: rootClassName,
    mode: internalMode,
    openKeys: mergedOpenKeys,
    rtl: isRtl
    // Disabled
    ,
    disabled: disabled
    // Motion
    ,
    motion: mounted ? motion : null,
    defaultMotions: mounted ? defaultMotions : null
    // Active
    ,
    activeKey: mergedActiveKey,
    onActive: onActive,
    onInactive: onInactive
    // Selection
    ,
    selectedKeys: mergedSelectKeys
    // Level
    ,
    inlineIndent: inlineIndent
    // Popup
    ,
    subMenuOpenDelay: subMenuOpenDelay,
    subMenuCloseDelay: subMenuCloseDelay,
    forceSubMenuRender: forceSubMenuRender,
    builtinPlacements: builtinPlacements,
    triggerSubMenuAction: triggerSubMenuAction,
    getPopupContainer: getPopupContainer
    // Icon
    ,
    itemIcon: itemIcon,
    expandIcon: expandIcon
    // Events
    ,
    onItemClick: onInternalClick,
    onOpenChange: onInternalOpenChange
  }, /*#__PURE__*/React.createElement(_PathContext.PathUserContext.Provider, {
    value: pathUserContext
  }, container), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'none'
    },
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement(_PathContext.PathRegisterContext.Provider, {
    value: registerPathContext
  }, measureChildList)))));
});
var _default = Menu;
exports["default"] = _default;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/MenuItem.js":
/*!******************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/MenuItem.js ***!
  \******************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/defineProperty.js"));
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/toConsumableArray.js"));
var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/extends */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/extends.js"));
var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectWithoutProperties.js"));
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/createClass.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/inherits.js"));
var _createSuper2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createSuper */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/createSuper.js"));
var _classnames = _interopRequireDefault(__webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js"));
var _rcOverflow = _interopRequireDefault(__webpack_require__(/*! rc-overflow */ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/index.js"));
var _KeyCode = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/KeyCode */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/KeyCode.js"));
var _omit = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/omit */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/omit.js"));
var _ref = __webpack_require__(/*! rc-util/lib/ref */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/ref.js");
var _warning = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/warning */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/warning.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _IdContext = __webpack_require__(/*! ./context/IdContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/IdContext.js");
var _MenuContext = __webpack_require__(/*! ./context/MenuContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/MenuContext.js");
var _PathContext = __webpack_require__(/*! ./context/PathContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/PathContext.js");
var _PrivateContext = _interopRequireDefault(__webpack_require__(/*! ./context/PrivateContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/PrivateContext.js"));
var _useActive2 = _interopRequireDefault(__webpack_require__(/*! ./hooks/useActive */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useActive.js"));
var _useDirectionStyle = _interopRequireDefault(__webpack_require__(/*! ./hooks/useDirectionStyle */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useDirectionStyle.js"));
var _Icon = _interopRequireDefault(__webpack_require__(/*! ./Icon */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/Icon.js"));
var _warnUtil = __webpack_require__(/*! ./utils/warnUtil */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/warnUtil.js");
var _excluded = ["title", "attribute", "elementRef"],
  _excluded2 = ["style", "className", "eventKey", "warnKey", "disabled", "itemIcon", "children", "role", "onMouseEnter", "onMouseLeave", "onClick", "onKeyDown", "onFocus"],
  _excluded3 = ["active"];
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
// Since Menu event provide the `info.item` which point to the MenuItem node instance.
// We have to use class component here.
// This should be removed from doc & api in future.
var LegacyMenuItem = /*#__PURE__*/function (_React$Component) {
  (0, _inherits2.default)(LegacyMenuItem, _React$Component);
  var _super = (0, _createSuper2.default)(LegacyMenuItem);
  function LegacyMenuItem() {
    (0, _classCallCheck2.default)(this, LegacyMenuItem);
    return _super.apply(this, arguments);
  }
  (0, _createClass2.default)(LegacyMenuItem, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
        title = _this$props.title,
        attribute = _this$props.attribute,
        elementRef = _this$props.elementRef,
        restProps = (0, _objectWithoutProperties2.default)(_this$props, _excluded);

      // Here the props are eventually passed to the DOM element.
      // React does not recognize non-standard attributes.
      // Therefore, remove the props that is not used here.
      // ref: https://github.com/ant-design/ant-design/issues/41395
      var passedProps = (0, _omit.default)(restProps, ['eventKey', 'popupClassName', 'popupOffset', 'onTitleClick']);
      (0, _warning.default)(!attribute, '`attribute` of Menu.Item is deprecated. Please pass attribute directly.');
      return /*#__PURE__*/React.createElement(_rcOverflow.default.Item, (0, _extends2.default)({}, attribute, {
        title: typeof title === 'string' ? title : undefined
      }, passedProps, {
        ref: elementRef
      }));
    }
  }]);
  return LegacyMenuItem;
}(React.Component);
/**
 * Real Menu Item component
 */
var InternalMenuItem = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _classNames;
  var style = props.style,
    className = props.className,
    eventKey = props.eventKey,
    warnKey = props.warnKey,
    disabled = props.disabled,
    itemIcon = props.itemIcon,
    children = props.children,
    role = props.role,
    onMouseEnter = props.onMouseEnter,
    onMouseLeave = props.onMouseLeave,
    onClick = props.onClick,
    onKeyDown = props.onKeyDown,
    onFocus = props.onFocus,
    restProps = (0, _objectWithoutProperties2.default)(props, _excluded2);
  var domDataId = (0, _IdContext.useMenuId)(eventKey);
  var _React$useContext = React.useContext(_MenuContext.MenuContext),
    prefixCls = _React$useContext.prefixCls,
    onItemClick = _React$useContext.onItemClick,
    contextDisabled = _React$useContext.disabled,
    overflowDisabled = _React$useContext.overflowDisabled,
    contextItemIcon = _React$useContext.itemIcon,
    selectedKeys = _React$useContext.selectedKeys,
    onActive = _React$useContext.onActive;
  var _React$useContext2 = React.useContext(_PrivateContext.default),
    _internalRenderMenuItem = _React$useContext2._internalRenderMenuItem;
  var itemCls = "".concat(prefixCls, "-item");
  var legacyMenuItemRef = React.useRef();
  var elementRef = React.useRef();
  var mergedDisabled = contextDisabled || disabled;
  var mergedEleRef = (0, _ref.useComposeRef)(ref, elementRef);
  var connectedKeys = (0, _PathContext.useFullPath)(eventKey);

  // ================================ Warn ================================
  if ( true && warnKey) {
    (0, _warning.default)(false, 'MenuItem should not leave undefined `key`.');
  }

  // ============================= Info =============================
  var getEventInfo = function getEventInfo(e) {
    return {
      key: eventKey,
      // Note: For legacy code is reversed which not like other antd component
      keyPath: (0, _toConsumableArray2.default)(connectedKeys).reverse(),
      item: legacyMenuItemRef.current,
      domEvent: e
    };
  };

  // ============================= Icon =============================
  var mergedItemIcon = itemIcon || contextItemIcon;

  // ============================ Active ============================
  var _useActive = (0, _useActive2.default)(eventKey, mergedDisabled, onMouseEnter, onMouseLeave),
    active = _useActive.active,
    activeProps = (0, _objectWithoutProperties2.default)(_useActive, _excluded3);

  // ============================ Select ============================
  var selected = selectedKeys.includes(eventKey);

  // ======================== DirectionStyle ========================
  var directionStyle = (0, _useDirectionStyle.default)(connectedKeys.length);

  // ============================ Events ============================
  var onInternalClick = function onInternalClick(e) {
    if (mergedDisabled) {
      return;
    }
    var info = getEventInfo(e);
    onClick === null || onClick === void 0 ? void 0 : onClick((0, _warnUtil.warnItemProp)(info));
    onItemClick(info);
  };
  var onInternalKeyDown = function onInternalKeyDown(e) {
    onKeyDown === null || onKeyDown === void 0 ? void 0 : onKeyDown(e);
    if (e.which === _KeyCode.default.ENTER) {
      var info = getEventInfo(e);

      // Legacy. Key will also trigger click event
      onClick === null || onClick === void 0 ? void 0 : onClick((0, _warnUtil.warnItemProp)(info));
      onItemClick(info);
    }
  };

  /**
   * Used for accessibility. Helper will focus element without key board.
   * We should manually trigger an active
   */
  var onInternalFocus = function onInternalFocus(e) {
    onActive(eventKey);
    onFocus === null || onFocus === void 0 ? void 0 : onFocus(e);
  };

  // ============================ Render ============================
  var optionRoleProps = {};
  if (props.role === 'option') {
    optionRoleProps['aria-selected'] = selected;
  }
  var renderNode = /*#__PURE__*/React.createElement(LegacyMenuItem, (0, _extends2.default)({
    ref: legacyMenuItemRef,
    elementRef: mergedEleRef,
    role: role === null ? 'none' : role || 'menuitem',
    tabIndex: disabled ? null : -1,
    "data-menu-id": overflowDisabled && domDataId ? null : domDataId
  }, restProps, activeProps, optionRoleProps, {
    component: "li",
    "aria-disabled": disabled,
    style: (0, _objectSpread2.default)((0, _objectSpread2.default)({}, directionStyle), style),
    className: (0, _classnames.default)(itemCls, (_classNames = {}, (0, _defineProperty2.default)(_classNames, "".concat(itemCls, "-active"), active), (0, _defineProperty2.default)(_classNames, "".concat(itemCls, "-selected"), selected), (0, _defineProperty2.default)(_classNames, "".concat(itemCls, "-disabled"), mergedDisabled), _classNames), className),
    onClick: onInternalClick,
    onKeyDown: onInternalKeyDown,
    onFocus: onInternalFocus
  }), children, /*#__PURE__*/React.createElement(_Icon.default, {
    props: (0, _objectSpread2.default)((0, _objectSpread2.default)({}, props), {}, {
      isSelected: selected
    }),
    icon: mergedItemIcon
  }));
  if (_internalRenderMenuItem) {
    renderNode = _internalRenderMenuItem(renderNode, props, {
      selected: selected
    });
  }
  return renderNode;
});
function MenuItem(props, ref) {
  var eventKey = props.eventKey;

  // ==================== Record KeyPath ====================
  var measure = (0, _PathContext.useMeasure)();
  var connectedKeyPath = (0, _PathContext.useFullPath)(eventKey);

  // eslint-disable-next-line consistent-return
  React.useEffect(function () {
    if (measure) {
      measure.registerPath(eventKey, connectedKeyPath);
      return function () {
        measure.unregisterPath(eventKey, connectedKeyPath);
      };
    }
  }, [connectedKeyPath]);
  if (measure) {
    return null;
  }

  // ======================== Render ========================
  return /*#__PURE__*/React.createElement(InternalMenuItem, (0, _extends2.default)({}, props, {
    ref: ref
  }));
}
var _default = /*#__PURE__*/React.forwardRef(MenuItem);
exports["default"] = _default;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/MenuItemGroup.js":
/*!***********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/MenuItemGroup.js ***!
  \***********************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/extends */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/extends.js"));
var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectWithoutProperties.js"));
var _classnames = _interopRequireDefault(__webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js"));
var _omit = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/omit */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/omit.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _MenuContext = __webpack_require__(/*! ./context/MenuContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/MenuContext.js");
var _PathContext = __webpack_require__(/*! ./context/PathContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/PathContext.js");
var _commonUtil = __webpack_require__(/*! ./utils/commonUtil */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/commonUtil.js");
var _excluded = ["className", "title", "eventKey", "children"];
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var InternalMenuItemGroup = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var className = props.className,
    title = props.title,
    eventKey = props.eventKey,
    children = props.children,
    restProps = (0, _objectWithoutProperties2.default)(props, _excluded);
  var _React$useContext = React.useContext(_MenuContext.MenuContext),
    prefixCls = _React$useContext.prefixCls;
  var groupPrefixCls = "".concat(prefixCls, "-item-group");
  return /*#__PURE__*/React.createElement("li", (0, _extends2.default)({
    ref: ref,
    role: "presentation"
  }, restProps, {
    onClick: function onClick(e) {
      return e.stopPropagation();
    },
    className: (0, _classnames.default)(groupPrefixCls, className)
  }), /*#__PURE__*/React.createElement("div", {
    role: "presentation",
    className: "".concat(groupPrefixCls, "-title"),
    title: typeof title === 'string' ? title : undefined
  }, title), /*#__PURE__*/React.createElement("ul", {
    role: "group",
    className: "".concat(groupPrefixCls, "-list")
  }, children));
});
var MenuItemGroup = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var eventKey = props.eventKey,
    children = props.children;
  var connectedKeyPath = (0, _PathContext.useFullPath)(eventKey);
  var childList = (0, _commonUtil.parseChildren)(children, connectedKeyPath);
  var measure = (0, _PathContext.useMeasure)();
  if (measure) {
    return childList;
  }
  return /*#__PURE__*/React.createElement(InternalMenuItemGroup, (0, _extends2.default)({
    ref: ref
  }, (0, _omit.default)(props, ['warnKey'])), childList);
});
if (true) {
  MenuItemGroup.displayName = 'MenuItemGroup';
}
var _default = MenuItemGroup;
exports["default"] = _default;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/SubMenu/InlineSubMenuList.js":
/*!***********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/SubMenu/InlineSubMenuList.js ***!
  \***********************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = InlineSubMenuList;
var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/extends */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/extends.js"));
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _rcMotion = _interopRequireDefault(__webpack_require__(/*! rc-motion */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/index.js"));
var _motionUtil = __webpack_require__(/*! ../utils/motionUtil */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/motionUtil.js");
var _MenuContext = _interopRequireWildcard(__webpack_require__(/*! ../context/MenuContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/MenuContext.js"));
var _SubMenuList = _interopRequireDefault(__webpack_require__(/*! ./SubMenuList */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/SubMenu/SubMenuList.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function InlineSubMenuList(_ref) {
  var id = _ref.id,
    open = _ref.open,
    keyPath = _ref.keyPath,
    children = _ref.children;
  var fixedMode = 'inline';
  var _React$useContext = React.useContext(_MenuContext.MenuContext),
    prefixCls = _React$useContext.prefixCls,
    forceSubMenuRender = _React$useContext.forceSubMenuRender,
    motion = _React$useContext.motion,
    defaultMotions = _React$useContext.defaultMotions,
    mode = _React$useContext.mode;

  // Always use latest mode check
  var sameModeRef = React.useRef(false);
  sameModeRef.current = mode === fixedMode;

  // We record `destroy` mark here since when mode change from `inline` to others.
  // The inline list should remove when motion end.
  var _React$useState = React.useState(!sameModeRef.current),
    _React$useState2 = (0, _slicedToArray2.default)(_React$useState, 2),
    destroy = _React$useState2[0],
    setDestroy = _React$useState2[1];
  var mergedOpen = sameModeRef.current ? open : false;

  // ================================= Effect =================================
  // Reset destroy state when mode change back
  React.useEffect(function () {
    if (sameModeRef.current) {
      setDestroy(false);
    }
  }, [mode]);

  // ================================= Render =================================
  var mergedMotion = (0, _objectSpread2.default)({}, (0, _motionUtil.getMotion)(fixedMode, motion, defaultMotions));

  // No need appear since nest inlineCollapse changed
  if (keyPath.length > 1) {
    mergedMotion.motionAppear = false;
  }

  // Hide inline list when mode changed and motion end
  var originOnVisibleChanged = mergedMotion.onVisibleChanged;
  mergedMotion.onVisibleChanged = function (newVisible) {
    if (!sameModeRef.current && !newVisible) {
      setDestroy(true);
    }
    return originOnVisibleChanged === null || originOnVisibleChanged === void 0 ? void 0 : originOnVisibleChanged(newVisible);
  };
  if (destroy) {
    return null;
  }
  return /*#__PURE__*/React.createElement(_MenuContext.default, {
    mode: fixedMode,
    locked: !sameModeRef.current
  }, /*#__PURE__*/React.createElement(_rcMotion.default, (0, _extends2.default)({
    visible: mergedOpen
  }, mergedMotion, {
    forceRender: forceSubMenuRender,
    removeOnLeave: false,
    leavedClassName: "".concat(prefixCls, "-hidden")
  }), function (_ref2) {
    var motionClassName = _ref2.className,
      motionStyle = _ref2.style;
    return /*#__PURE__*/React.createElement(_SubMenuList.default, {
      id: id,
      className: motionClassName,
      style: motionStyle
    }, children);
  }));
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/SubMenu/PopupTrigger.js":
/*!******************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/SubMenu/PopupTrigger.js ***!
  \******************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = PopupTrigger;
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/defineProperty.js"));
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _trigger = _interopRequireDefault(__webpack_require__(/*! @rc-component/trigger */ "../../node_modules/.pnpm/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1/node_modules/@rc-component/trigger/lib/index.js"));
var _classnames = _interopRequireDefault(__webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js"));
var _raf = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/raf */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/raf.js"));
var _MenuContext = __webpack_require__(/*! ../context/MenuContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/MenuContext.js");
var _placements = __webpack_require__(/*! ../placements */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/placements.js");
var _motionUtil = __webpack_require__(/*! ../utils/motionUtil */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/motionUtil.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var popupPlacementMap = {
  horizontal: 'bottomLeft',
  vertical: 'rightTop',
  'vertical-left': 'rightTop',
  'vertical-right': 'leftTop'
};
function PopupTrigger(_ref) {
  var prefixCls = _ref.prefixCls,
    visible = _ref.visible,
    children = _ref.children,
    popup = _ref.popup,
    popupStyle = _ref.popupStyle,
    popupClassName = _ref.popupClassName,
    popupOffset = _ref.popupOffset,
    disabled = _ref.disabled,
    mode = _ref.mode,
    onVisibleChange = _ref.onVisibleChange;
  var _React$useContext = React.useContext(_MenuContext.MenuContext),
    getPopupContainer = _React$useContext.getPopupContainer,
    rtl = _React$useContext.rtl,
    subMenuOpenDelay = _React$useContext.subMenuOpenDelay,
    subMenuCloseDelay = _React$useContext.subMenuCloseDelay,
    builtinPlacements = _React$useContext.builtinPlacements,
    triggerSubMenuAction = _React$useContext.triggerSubMenuAction,
    forceSubMenuRender = _React$useContext.forceSubMenuRender,
    rootClassName = _React$useContext.rootClassName,
    motion = _React$useContext.motion,
    defaultMotions = _React$useContext.defaultMotions;
  var _React$useState = React.useState(false),
    _React$useState2 = (0, _slicedToArray2.default)(_React$useState, 2),
    innerVisible = _React$useState2[0],
    setInnerVisible = _React$useState2[1];
  var placement = rtl ? (0, _objectSpread2.default)((0, _objectSpread2.default)({}, _placements.placementsRtl), builtinPlacements) : (0, _objectSpread2.default)((0, _objectSpread2.default)({}, _placements.placements), builtinPlacements);
  var popupPlacement = popupPlacementMap[mode];
  var targetMotion = (0, _motionUtil.getMotion)(mode, motion, defaultMotions);
  var targetMotionRef = React.useRef(targetMotion);
  if (mode !== 'inline') {
    /**
     * PopupTrigger is only used for vertical and horizontal types.
     * When collapsed is unfolded, the inline animation will destroy the vertical animation.
     */
    targetMotionRef.current = targetMotion;
  }
  var mergedMotion = (0, _objectSpread2.default)((0, _objectSpread2.default)({}, targetMotionRef.current), {}, {
    leavedClassName: "".concat(prefixCls, "-hidden"),
    removeOnLeave: false,
    motionAppear: true
  });

  // Delay to change visible
  var visibleRef = React.useRef();
  React.useEffect(function () {
    visibleRef.current = (0, _raf.default)(function () {
      setInnerVisible(visible);
    });
    return function () {
      _raf.default.cancel(visibleRef.current);
    };
  }, [visible]);
  return /*#__PURE__*/React.createElement(_trigger.default, {
    prefixCls: prefixCls,
    popupClassName: (0, _classnames.default)("".concat(prefixCls, "-popup"), (0, _defineProperty2.default)({}, "".concat(prefixCls, "-rtl"), rtl), popupClassName, rootClassName),
    stretch: mode === 'horizontal' ? 'minWidth' : null,
    getPopupContainer: getPopupContainer,
    builtinPlacements: placement,
    popupPlacement: popupPlacement,
    popupVisible: innerVisible,
    popup: popup,
    popupStyle: popupStyle,
    popupAlign: popupOffset && {
      offset: popupOffset
    },
    action: disabled ? [] : [triggerSubMenuAction],
    mouseEnterDelay: subMenuOpenDelay,
    mouseLeaveDelay: subMenuCloseDelay,
    onPopupVisibleChange: onVisibleChange,
    forceRender: forceSubMenuRender,
    popupMotion: mergedMotion,
    fresh: true
  }, children);
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/SubMenu/SubMenuList.js":
/*!*****************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/SubMenu/SubMenuList.js ***!
  \*****************************************************************************************************************************/
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
var _MenuContext = __webpack_require__(/*! ../context/MenuContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/MenuContext.js");
var _excluded = ["className", "children"];
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var InternalSubMenuList = function InternalSubMenuList(_ref, ref) {
  var className = _ref.className,
    children = _ref.children,
    restProps = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  var _React$useContext = React.useContext(_MenuContext.MenuContext),
    prefixCls = _React$useContext.prefixCls,
    mode = _React$useContext.mode,
    rtl = _React$useContext.rtl;
  return /*#__PURE__*/React.createElement("ul", (0, _extends2.default)({
    className: (0, _classnames.default)(prefixCls, rtl && "".concat(prefixCls, "-rtl"), "".concat(prefixCls, "-sub"), "".concat(prefixCls, "-").concat(mode === 'inline' ? 'inline' : 'vertical'), className),
    role: "menu"
  }, restProps, {
    "data-menu-list": true,
    ref: ref
  }), children);
};
var SubMenuList = /*#__PURE__*/React.forwardRef(InternalSubMenuList);
SubMenuList.displayName = 'SubMenuList';
var _default = SubMenuList;
exports["default"] = _default;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/SubMenu/index.js":
/*!***********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/SubMenu/index.js ***!
  \***********************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/defineProperty.js"));
var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/extends */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/extends.js"));
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectWithoutProperties.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _classnames = _interopRequireDefault(__webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js"));
var _rcOverflow = _interopRequireDefault(__webpack_require__(/*! rc-overflow */ "../../node_modules/.pnpm/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1/node_modules/rc-overflow/lib/index.js"));
var _warning = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/warning */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/warning.js"));
var _SubMenuList = _interopRequireDefault(__webpack_require__(/*! ./SubMenuList */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/SubMenu/SubMenuList.js"));
var _commonUtil = __webpack_require__(/*! ../utils/commonUtil */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/commonUtil.js");
var _MenuContext = _interopRequireWildcard(__webpack_require__(/*! ../context/MenuContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/MenuContext.js"));
var _useMemoCallback = _interopRequireDefault(__webpack_require__(/*! ../hooks/useMemoCallback */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useMemoCallback.js"));
var _PopupTrigger = _interopRequireDefault(__webpack_require__(/*! ./PopupTrigger */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/SubMenu/PopupTrigger.js"));
var _Icon = _interopRequireDefault(__webpack_require__(/*! ../Icon */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/Icon.js"));
var _useActive2 = _interopRequireDefault(__webpack_require__(/*! ../hooks/useActive */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useActive.js"));
var _warnUtil = __webpack_require__(/*! ../utils/warnUtil */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/warnUtil.js");
var _useDirectionStyle = _interopRequireDefault(__webpack_require__(/*! ../hooks/useDirectionStyle */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useDirectionStyle.js"));
var _InlineSubMenuList = _interopRequireDefault(__webpack_require__(/*! ./InlineSubMenuList */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/SubMenu/InlineSubMenuList.js"));
var _PathContext = __webpack_require__(/*! ../context/PathContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/PathContext.js");
var _IdContext = __webpack_require__(/*! ../context/IdContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/IdContext.js");
var _PrivateContext = _interopRequireDefault(__webpack_require__(/*! ../context/PrivateContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/PrivateContext.js"));
var _excluded = ["style", "className", "title", "eventKey", "warnKey", "disabled", "internalPopupClose", "children", "itemIcon", "expandIcon", "popupClassName", "popupOffset", "popupStyle", "onClick", "onMouseEnter", "onMouseLeave", "onTitleClick", "onTitleMouseEnter", "onTitleMouseLeave"],
  _excluded2 = ["active"];
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var InternalSubMenu = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _classNames;
  var style = props.style,
    className = props.className,
    title = props.title,
    eventKey = props.eventKey,
    warnKey = props.warnKey,
    disabled = props.disabled,
    internalPopupClose = props.internalPopupClose,
    children = props.children,
    itemIcon = props.itemIcon,
    expandIcon = props.expandIcon,
    popupClassName = props.popupClassName,
    popupOffset = props.popupOffset,
    popupStyle = props.popupStyle,
    onClick = props.onClick,
    onMouseEnter = props.onMouseEnter,
    onMouseLeave = props.onMouseLeave,
    onTitleClick = props.onTitleClick,
    onTitleMouseEnter = props.onTitleMouseEnter,
    onTitleMouseLeave = props.onTitleMouseLeave,
    restProps = (0, _objectWithoutProperties2.default)(props, _excluded);
  var domDataId = (0, _IdContext.useMenuId)(eventKey);
  var _React$useContext = React.useContext(_MenuContext.MenuContext),
    prefixCls = _React$useContext.prefixCls,
    mode = _React$useContext.mode,
    openKeys = _React$useContext.openKeys,
    contextDisabled = _React$useContext.disabled,
    overflowDisabled = _React$useContext.overflowDisabled,
    activeKey = _React$useContext.activeKey,
    selectedKeys = _React$useContext.selectedKeys,
    contextItemIcon = _React$useContext.itemIcon,
    contextExpandIcon = _React$useContext.expandIcon,
    onItemClick = _React$useContext.onItemClick,
    onOpenChange = _React$useContext.onOpenChange,
    onActive = _React$useContext.onActive;
  var _React$useContext2 = React.useContext(_PrivateContext.default),
    _internalRenderSubMenuItem = _React$useContext2._internalRenderSubMenuItem;
  var _React$useContext3 = React.useContext(_PathContext.PathUserContext),
    isSubPathKey = _React$useContext3.isSubPathKey;
  var connectedPath = (0, _PathContext.useFullPath)();
  var subMenuPrefixCls = "".concat(prefixCls, "-submenu");
  var mergedDisabled = contextDisabled || disabled;
  var elementRef = React.useRef();
  var popupRef = React.useRef();

  // ================================ Warn ================================
  if ( true && warnKey) {
    (0, _warning.default)(false, 'SubMenu should not leave undefined `key`.');
  }

  // ================================ Icon ================================
  var mergedItemIcon = itemIcon !== null && itemIcon !== void 0 ? itemIcon : contextItemIcon;
  var mergedExpandIcon = expandIcon !== null && expandIcon !== void 0 ? expandIcon : contextExpandIcon;

  // ================================ Open ================================
  var originOpen = openKeys.includes(eventKey);
  var open = !overflowDisabled && originOpen;

  // =============================== Select ===============================
  var childrenSelected = isSubPathKey(selectedKeys, eventKey);

  // =============================== Active ===============================
  var _useActive = (0, _useActive2.default)(eventKey, mergedDisabled, onTitleMouseEnter, onTitleMouseLeave),
    active = _useActive.active,
    activeProps = (0, _objectWithoutProperties2.default)(_useActive, _excluded2);

  // Fallback of active check to avoid hover on menu title or disabled item
  var _React$useState = React.useState(false),
    _React$useState2 = (0, _slicedToArray2.default)(_React$useState, 2),
    childrenActive = _React$useState2[0],
    setChildrenActive = _React$useState2[1];
  var triggerChildrenActive = function triggerChildrenActive(newActive) {
    if (!mergedDisabled) {
      setChildrenActive(newActive);
    }
  };
  var onInternalMouseEnter = function onInternalMouseEnter(domEvent) {
    triggerChildrenActive(true);
    onMouseEnter === null || onMouseEnter === void 0 ? void 0 : onMouseEnter({
      key: eventKey,
      domEvent: domEvent
    });
  };
  var onInternalMouseLeave = function onInternalMouseLeave(domEvent) {
    triggerChildrenActive(false);
    onMouseLeave === null || onMouseLeave === void 0 ? void 0 : onMouseLeave({
      key: eventKey,
      domEvent: domEvent
    });
  };
  var mergedActive = React.useMemo(function () {
    if (active) {
      return active;
    }
    if (mode !== 'inline') {
      return childrenActive || isSubPathKey([activeKey], eventKey);
    }
    return false;
  }, [mode, active, activeKey, childrenActive, eventKey, isSubPathKey]);

  // ========================== DirectionStyle ==========================
  var directionStyle = (0, _useDirectionStyle.default)(connectedPath.length);

  // =============================== Events ===============================
  // >>>> Title click
  var onInternalTitleClick = function onInternalTitleClick(e) {
    // Skip if disabled
    if (mergedDisabled) {
      return;
    }
    onTitleClick === null || onTitleClick === void 0 ? void 0 : onTitleClick({
      key: eventKey,
      domEvent: e
    });

    // Trigger open by click when mode is `inline`
    if (mode === 'inline') {
      onOpenChange(eventKey, !originOpen);
    }
  };

  // >>>> Context for children click
  var onMergedItemClick = (0, _useMemoCallback.default)(function (info) {
    onClick === null || onClick === void 0 ? void 0 : onClick((0, _warnUtil.warnItemProp)(info));
    onItemClick(info);
  });

  // >>>>> Visible change
  var onPopupVisibleChange = function onPopupVisibleChange(newVisible) {
    if (mode !== 'inline') {
      onOpenChange(eventKey, newVisible);
    }
  };

  /**
   * Used for accessibility. Helper will focus element without key board.
   * We should manually trigger an active
   */
  var onInternalFocus = function onInternalFocus() {
    onActive(eventKey);
  };

  // =============================== Render ===============================
  var popupId = domDataId && "".concat(domDataId, "-popup");

  // >>>>> Title
  var titleNode = /*#__PURE__*/React.createElement("div", (0, _extends2.default)({
    role: "menuitem",
    style: directionStyle,
    className: "".concat(subMenuPrefixCls, "-title"),
    tabIndex: mergedDisabled ? null : -1,
    ref: elementRef,
    title: typeof title === 'string' ? title : null,
    "data-menu-id": overflowDisabled && domDataId ? null : domDataId,
    "aria-expanded": open,
    "aria-haspopup": true,
    "aria-controls": popupId,
    "aria-disabled": mergedDisabled,
    onClick: onInternalTitleClick,
    onFocus: onInternalFocus
  }, activeProps), title, /*#__PURE__*/React.createElement(_Icon.default, {
    icon: mode !== 'horizontal' ? mergedExpandIcon : undefined,
    props: (0, _objectSpread2.default)((0, _objectSpread2.default)({}, props), {}, {
      isOpen: open,
      // [Legacy] Not sure why need this mark
      isSubMenu: true
    })
  }, /*#__PURE__*/React.createElement("i", {
    className: "".concat(subMenuPrefixCls, "-arrow")
  })));

  // Cache mode if it change to `inline` which do not have popup motion
  var triggerModeRef = React.useRef(mode);
  if (mode !== 'inline' && connectedPath.length > 1) {
    triggerModeRef.current = 'vertical';
  } else {
    triggerModeRef.current = mode;
  }
  if (!overflowDisabled) {
    var triggerMode = triggerModeRef.current;

    // Still wrap with Trigger here since we need avoid react re-mount dom node
    // Which makes motion failed
    titleNode = /*#__PURE__*/React.createElement(_PopupTrigger.default, {
      mode: triggerMode,
      prefixCls: subMenuPrefixCls,
      visible: !internalPopupClose && open && mode !== 'inline',
      popupClassName: popupClassName,
      popupOffset: popupOffset,
      popupStyle: popupStyle,
      popup: /*#__PURE__*/React.createElement(_MenuContext.default
      // Special handle of horizontal mode
      , {
        mode: triggerMode === 'horizontal' ? 'vertical' : triggerMode
      }, /*#__PURE__*/React.createElement(_SubMenuList.default, {
        id: popupId,
        ref: popupRef
      }, children)),
      disabled: mergedDisabled,
      onVisibleChange: onPopupVisibleChange
    }, titleNode);
  }

  // >>>>> List node
  var listNode = /*#__PURE__*/React.createElement(_rcOverflow.default.Item, (0, _extends2.default)({
    ref: ref,
    role: "none"
  }, restProps, {
    component: "li",
    style: style,
    className: (0, _classnames.default)(subMenuPrefixCls, "".concat(subMenuPrefixCls, "-").concat(mode), className, (_classNames = {}, (0, _defineProperty2.default)(_classNames, "".concat(subMenuPrefixCls, "-open"), open), (0, _defineProperty2.default)(_classNames, "".concat(subMenuPrefixCls, "-active"), mergedActive), (0, _defineProperty2.default)(_classNames, "".concat(subMenuPrefixCls, "-selected"), childrenSelected), (0, _defineProperty2.default)(_classNames, "".concat(subMenuPrefixCls, "-disabled"), mergedDisabled), _classNames)),
    onMouseEnter: onInternalMouseEnter,
    onMouseLeave: onInternalMouseLeave
  }), titleNode, !overflowDisabled && /*#__PURE__*/React.createElement(_InlineSubMenuList.default, {
    id: popupId,
    open: open,
    keyPath: connectedPath
  }, children));
  if (_internalRenderSubMenuItem) {
    listNode = _internalRenderSubMenuItem(listNode, props, {
      selected: childrenSelected,
      active: mergedActive,
      open: open,
      disabled: mergedDisabled
    });
  }

  // >>>>> Render
  return /*#__PURE__*/React.createElement(_MenuContext.default, {
    onItemClick: onMergedItemClick,
    mode: mode === 'horizontal' ? 'vertical' : mode,
    itemIcon: mergedItemIcon,
    expandIcon: mergedExpandIcon
  }, listNode);
});
var SubMenu = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var eventKey = props.eventKey,
    children = props.children;
  var connectedKeyPath = (0, _PathContext.useFullPath)(eventKey);
  var childList = (0, _commonUtil.parseChildren)(children, connectedKeyPath);

  // ==================== Record KeyPath ====================
  var measure = (0, _PathContext.useMeasure)();

  // eslint-disable-next-line consistent-return
  React.useEffect(function () {
    if (measure) {
      measure.registerPath(eventKey, connectedKeyPath);
      return function () {
        measure.unregisterPath(eventKey, connectedKeyPath);
      };
    }
  }, [connectedKeyPath]);
  var renderNode;

  // ======================== Render ========================
  if (measure) {
    renderNode = childList;
  } else {
    renderNode = /*#__PURE__*/React.createElement(InternalSubMenu, (0, _extends2.default)({
      ref: ref
    }, props), childList);
  }
  return /*#__PURE__*/React.createElement(_PathContext.PathTrackerContext.Provider, {
    value: connectedKeyPath
  }, renderNode);
});
if (true) {
  SubMenu.displayName = 'SubMenu';
}
var _default = SubMenu;
exports["default"] = _default;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/IdContext.js":
/*!***************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/IdContext.js ***!
  \***************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.IdContext = void 0;
exports.getMenuId = getMenuId;
exports.useMenuId = useMenuId;
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var IdContext = /*#__PURE__*/React.createContext(null);
exports.IdContext = IdContext;
function getMenuId(uuid, eventKey) {
  if (uuid === undefined) {
    return null;
  }
  return "".concat(uuid, "-").concat(eventKey);
}

/**
 * Get `data-menu-id`
 */
function useMenuId(eventKey) {
  var id = React.useContext(IdContext);
  return getMenuId(id, eventKey);
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/MenuContext.js":
/*!*****************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/MenuContext.js ***!
  \*****************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.MenuContext = void 0;
exports["default"] = InheritableContextProvider;
var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectWithoutProperties.js"));
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _useMemo = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/hooks/useMemo */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/hooks/useMemo.js"));
var _isEqual = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/isEqual */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/isEqual.js"));
var _excluded = ["children", "locked"];
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var MenuContext = /*#__PURE__*/React.createContext(null);
exports.MenuContext = MenuContext;
function mergeProps(origin, target) {
  var clone = (0, _objectSpread2.default)({}, origin);
  Object.keys(target).forEach(function (key) {
    var value = target[key];
    if (value !== undefined) {
      clone[key] = value;
    }
  });
  return clone;
}
function InheritableContextProvider(_ref) {
  var children = _ref.children,
    locked = _ref.locked,
    restProps = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  var context = React.useContext(MenuContext);
  var inheritableContext = (0, _useMemo.default)(function () {
    return mergeProps(context, restProps);
  }, [context, restProps], function (prev, next) {
    return !locked && (prev[0] !== next[0] || !(0, _isEqual.default)(prev[1], next[1], true));
  });
  return /*#__PURE__*/React.createElement(MenuContext.Provider, {
    value: inheritableContext
  }, children);
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/PathContext.js":
/*!*****************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/PathContext.js ***!
  \*****************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.PathUserContext = exports.PathTrackerContext = exports.PathRegisterContext = void 0;
exports.useFullPath = useFullPath;
exports.useMeasure = useMeasure;
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/toConsumableArray.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var EmptyList = [];

// ========================= Path Register =========================

var PathRegisterContext = /*#__PURE__*/React.createContext(null);
exports.PathRegisterContext = PathRegisterContext;
function useMeasure() {
  return React.useContext(PathRegisterContext);
}

// ========================= Path Tracker ==========================
var PathTrackerContext = /*#__PURE__*/React.createContext(EmptyList);
exports.PathTrackerContext = PathTrackerContext;
function useFullPath(eventKey) {
  var parentKeyPath = React.useContext(PathTrackerContext);
  return React.useMemo(function () {
    return eventKey !== undefined ? [].concat((0, _toConsumableArray2.default)(parentKeyPath), [eventKey]) : parentKeyPath;
  }, [parentKeyPath, eventKey]);
}

// =========================== Path User ===========================

var PathUserContext = /*#__PURE__*/React.createContext(null);
exports.PathUserContext = PathUserContext;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/PrivateContext.js":
/*!********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/PrivateContext.js ***!
  \********************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var PrivateContext = /*#__PURE__*/React.createContext({});
var _default = PrivateContext;
exports["default"] = _default;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useAccessibility.js":
/*!********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useAccessibility.js ***!
  \********************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.getFocusableElements = getFocusableElements;
exports.refreshElements = void 0;
exports.useAccessibility = useAccessibility;
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/defineProperty.js"));
var _focus = __webpack_require__(/*! rc-util/lib/Dom/focus */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/Dom/focus.js");
var _KeyCode = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/KeyCode */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/KeyCode.js"));
var _raf = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/raf */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/raf.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _IdContext = __webpack_require__(/*! ../context/IdContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/IdContext.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
// destruct to reduce minify size
var LEFT = _KeyCode.default.LEFT,
  RIGHT = _KeyCode.default.RIGHT,
  UP = _KeyCode.default.UP,
  DOWN = _KeyCode.default.DOWN,
  ENTER = _KeyCode.default.ENTER,
  ESC = _KeyCode.default.ESC,
  HOME = _KeyCode.default.HOME,
  END = _KeyCode.default.END;
var ArrowKeys = [UP, DOWN, LEFT, RIGHT];
function getOffset(mode, isRootLevel, isRtl, which) {
  var _inline, _horizontal, _vertical, _offsets;
  var prev = 'prev';
  var next = 'next';
  var children = 'children';
  var parent = 'parent';

  // Inline enter is special that we use unique operation
  if (mode === 'inline' && which === ENTER) {
    return {
      inlineTrigger: true
    };
  }
  var inline = (_inline = {}, (0, _defineProperty2.default)(_inline, UP, prev), (0, _defineProperty2.default)(_inline, DOWN, next), _inline);
  var horizontal = (_horizontal = {}, (0, _defineProperty2.default)(_horizontal, LEFT, isRtl ? next : prev), (0, _defineProperty2.default)(_horizontal, RIGHT, isRtl ? prev : next), (0, _defineProperty2.default)(_horizontal, DOWN, children), (0, _defineProperty2.default)(_horizontal, ENTER, children), _horizontal);
  var vertical = (_vertical = {}, (0, _defineProperty2.default)(_vertical, UP, prev), (0, _defineProperty2.default)(_vertical, DOWN, next), (0, _defineProperty2.default)(_vertical, ENTER, children), (0, _defineProperty2.default)(_vertical, ESC, parent), (0, _defineProperty2.default)(_vertical, LEFT, isRtl ? children : parent), (0, _defineProperty2.default)(_vertical, RIGHT, isRtl ? parent : children), _vertical);
  var offsets = {
    inline: inline,
    horizontal: horizontal,
    vertical: vertical,
    inlineSub: inline,
    horizontalSub: vertical,
    verticalSub: vertical
  };
  var type = (_offsets = offsets["".concat(mode).concat(isRootLevel ? '' : 'Sub')]) === null || _offsets === void 0 ? void 0 : _offsets[which];
  switch (type) {
    case prev:
      return {
        offset: -1,
        sibling: true
      };
    case next:
      return {
        offset: 1,
        sibling: true
      };
    case parent:
      return {
        offset: -1,
        sibling: false
      };
    case children:
      return {
        offset: 1,
        sibling: false
      };
    default:
      return null;
  }
}
function findContainerUL(element) {
  var current = element;
  while (current) {
    if (current.getAttribute('data-menu-list')) {
      return current;
    }
    current = current.parentElement;
  }

  // Normally should not reach this line
  /* istanbul ignore next */
  return null;
}

/**
 * Find focused element within element set provided
 */
function getFocusElement(activeElement, elements) {
  var current = activeElement || document.activeElement;
  while (current) {
    if (elements.has(current)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

/**
 * Get focusable elements from the element set under provided container
 */
function getFocusableElements(container, elements) {
  var list = (0, _focus.getFocusNodeList)(container, true);
  return list.filter(function (ele) {
    return elements.has(ele);
  });
}
function getNextFocusElement(parentQueryContainer, elements, focusMenuElement) {
  var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
  // Key on the menu item will not get validate parent container
  if (!parentQueryContainer) {
    return null;
  }

  // List current level menu item elements
  var sameLevelFocusableMenuElementList = getFocusableElements(parentQueryContainer, elements);

  // Find next focus index
  var count = sameLevelFocusableMenuElementList.length;
  var focusIndex = sameLevelFocusableMenuElementList.findIndex(function (ele) {
    return focusMenuElement === ele;
  });
  if (offset < 0) {
    if (focusIndex === -1) {
      focusIndex = count - 1;
    } else {
      focusIndex -= 1;
    }
  } else if (offset > 0) {
    focusIndex += 1;
  }
  focusIndex = (focusIndex + count) % count;

  // Focus menu item
  return sameLevelFocusableMenuElementList[focusIndex];
}
var refreshElements = function refreshElements(keys, id) {
  var elements = new Set();
  var key2element = new Map();
  var element2key = new Map();
  keys.forEach(function (key) {
    var element = document.querySelector("[data-menu-id='".concat((0, _IdContext.getMenuId)(id, key), "']"));
    if (element) {
      elements.add(element);
      element2key.set(element, key);
      key2element.set(key, element);
    }
  });
  return {
    elements: elements,
    key2element: key2element,
    element2key: element2key
  };
};
exports.refreshElements = refreshElements;
function useAccessibility(mode, activeKey, isRtl, id, containerRef, getKeys, getKeyPath, triggerActiveKey, triggerAccessibilityOpen, originOnKeyDown) {
  var rafRef = React.useRef();
  var activeRef = React.useRef();
  activeRef.current = activeKey;
  var cleanRaf = function cleanRaf() {
    _raf.default.cancel(rafRef.current);
  };
  React.useEffect(function () {
    return function () {
      cleanRaf();
    };
  }, []);
  return function (e) {
    var which = e.which;
    if ([].concat(ArrowKeys, [ENTER, ESC, HOME, END]).includes(which)) {
      var keys = getKeys();
      var refreshedElements = refreshElements(keys, id);
      var _refreshedElements = refreshedElements,
        elements = _refreshedElements.elements,
        key2element = _refreshedElements.key2element,
        element2key = _refreshedElements.element2key;

      // First we should find current focused MenuItem/SubMenu element
      var activeElement = key2element.get(activeKey);
      var focusMenuElement = getFocusElement(activeElement, elements);
      var focusMenuKey = element2key.get(focusMenuElement);
      var offsetObj = getOffset(mode, getKeyPath(focusMenuKey, true).length === 1, isRtl, which);

      // Some mode do not have fully arrow operation like inline
      if (!offsetObj && which !== HOME && which !== END) {
        return;
      }

      // Arrow prevent default to avoid page scroll
      if (ArrowKeys.includes(which) || [HOME, END].includes(which)) {
        e.preventDefault();
      }
      var tryFocus = function tryFocus(menuElement) {
        if (menuElement) {
          var focusTargetElement = menuElement;

          // Focus to link instead of menu item if possible
          var link = menuElement.querySelector('a');
          if (link !== null && link !== void 0 && link.getAttribute('href')) {
            focusTargetElement = link;
          }
          var targetKey = element2key.get(menuElement);
          triggerActiveKey(targetKey);

          /**
           * Do not `useEffect` here since `tryFocus` may trigger async
           * which makes React sync update the `activeKey`
           * that force render before `useRef` set the next activeKey
           */
          cleanRaf();
          rafRef.current = (0, _raf.default)(function () {
            if (activeRef.current === targetKey) {
              focusTargetElement.focus();
            }
          });
        }
      };
      if ([HOME, END].includes(which) || offsetObj.sibling || !focusMenuElement) {
        // ========================== Sibling ==========================
        // Find walkable focus menu element container
        var parentQueryContainer;
        if (!focusMenuElement || mode === 'inline') {
          parentQueryContainer = containerRef.current;
        } else {
          parentQueryContainer = findContainerUL(focusMenuElement);
        }

        // Get next focus element
        var targetElement;
        var focusableElements = getFocusableElements(parentQueryContainer, elements);
        if (which === HOME) {
          targetElement = focusableElements[0];
        } else if (which === END) {
          targetElement = focusableElements[focusableElements.length - 1];
        } else {
          targetElement = getNextFocusElement(parentQueryContainer, elements, focusMenuElement, offsetObj.offset);
        }
        // Focus menu item
        tryFocus(targetElement);

        // ======================= InlineTrigger =======================
      } else if (offsetObj.inlineTrigger) {
        // Inline trigger no need switch to sub menu item
        triggerAccessibilityOpen(focusMenuKey);
        // =========================== Level ===========================
      } else if (offsetObj.offset > 0) {
        triggerAccessibilityOpen(focusMenuKey, true);
        cleanRaf();
        rafRef.current = (0, _raf.default)(function () {
          // Async should resync elements
          refreshedElements = refreshElements(keys, id);
          var controlId = focusMenuElement.getAttribute('aria-controls');
          var subQueryContainer = document.getElementById(controlId);

          // Get sub focusable menu item
          var targetElement = getNextFocusElement(subQueryContainer, refreshedElements.elements);

          // Focus menu item
          tryFocus(targetElement);
        }, 5);
      } else if (offsetObj.offset < 0) {
        var keyPath = getKeyPath(focusMenuKey, true);
        var parentKey = keyPath[keyPath.length - 2];
        var parentMenuElement = key2element.get(parentKey);

        // Focus menu item
        triggerAccessibilityOpen(parentKey, false);
        tryFocus(parentMenuElement);
      }
    }

    // Pass origin key down event
    originOnKeyDown === null || originOnKeyDown === void 0 ? void 0 : originOnKeyDown(e);
  };
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useActive.js":
/*!*************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useActive.js ***!
  \*************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = useActive;
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _MenuContext = __webpack_require__(/*! ../context/MenuContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/MenuContext.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function useActive(eventKey, disabled, onMouseEnter, onMouseLeave) {
  var _React$useContext = React.useContext(_MenuContext.MenuContext),
    activeKey = _React$useContext.activeKey,
    onActive = _React$useContext.onActive,
    onInactive = _React$useContext.onInactive;
  var ret = {
    active: activeKey === eventKey
  };

  // Skip when disabled
  if (!disabled) {
    ret.onMouseEnter = function (domEvent) {
      onMouseEnter === null || onMouseEnter === void 0 ? void 0 : onMouseEnter({
        key: eventKey,
        domEvent: domEvent
      });
      onActive(eventKey);
    };
    ret.onMouseLeave = function (domEvent) {
      onMouseLeave === null || onMouseLeave === void 0 ? void 0 : onMouseLeave({
        key: eventKey,
        domEvent: domEvent
      });
      onInactive(eventKey);
    };
  }
  return ret;
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useDirectionStyle.js":
/*!*********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useDirectionStyle.js ***!
  \*********************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = useDirectionStyle;
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _MenuContext = __webpack_require__(/*! ../context/MenuContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/MenuContext.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function useDirectionStyle(level) {
  var _React$useContext = React.useContext(_MenuContext.MenuContext),
    mode = _React$useContext.mode,
    rtl = _React$useContext.rtl,
    inlineIndent = _React$useContext.inlineIndent;
  if (mode !== 'inline') {
    return null;
  }
  var len = level;
  return rtl ? {
    paddingRight: len * inlineIndent
  } : {
    paddingLeft: len * inlineIndent
  };
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useKeyRecords.js":
/*!*****************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useKeyRecords.js ***!
  \*****************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.OVERFLOW_KEY = void 0;
exports["default"] = useKeyRecords;
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/toConsumableArray.js"));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _warning = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/warning */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/warning.js"));
var _timeUtil = __webpack_require__(/*! ../utils/timeUtil */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/timeUtil.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var PATH_SPLIT = '__RC_UTIL_PATH_SPLIT__';
var getPathStr = function getPathStr(keyPath) {
  return keyPath.join(PATH_SPLIT);
};
var getPathKeys = function getPathKeys(keyPathStr) {
  return keyPathStr.split(PATH_SPLIT);
};
var OVERFLOW_KEY = 'rc-menu-more';
exports.OVERFLOW_KEY = OVERFLOW_KEY;
function useKeyRecords() {
  var _React$useState = React.useState({}),
    _React$useState2 = (0, _slicedToArray2.default)(_React$useState, 2),
    internalForceUpdate = _React$useState2[1];
  var key2pathRef = (0, React.useRef)(new Map());
  var path2keyRef = (0, React.useRef)(new Map());
  var _React$useState3 = React.useState([]),
    _React$useState4 = (0, _slicedToArray2.default)(_React$useState3, 2),
    overflowKeys = _React$useState4[0],
    setOverflowKeys = _React$useState4[1];
  var updateRef = (0, React.useRef)(0);
  var destroyRef = (0, React.useRef)(false);
  var forceUpdate = function forceUpdate() {
    if (!destroyRef.current) {
      internalForceUpdate({});
    }
  };
  var registerPath = (0, React.useCallback)(function (key, keyPath) {
    // Warning for invalidate or duplicated `key`
    if (true) {
      (0, _warning.default)(!key2pathRef.current.has(key), "Duplicated key '".concat(key, "' used in Menu by path [").concat(keyPath.join(' > '), "]"));
    }

    // Fill map
    var connectedPath = getPathStr(keyPath);
    path2keyRef.current.set(connectedPath, key);
    key2pathRef.current.set(key, connectedPath);
    updateRef.current += 1;
    var id = updateRef.current;
    (0, _timeUtil.nextSlice)(function () {
      if (id === updateRef.current) {
        forceUpdate();
      }
    });
  }, []);
  var unregisterPath = (0, React.useCallback)(function (key, keyPath) {
    var connectedPath = getPathStr(keyPath);
    path2keyRef.current.delete(connectedPath);
    key2pathRef.current.delete(key);
  }, []);
  var refreshOverflowKeys = (0, React.useCallback)(function (keys) {
    setOverflowKeys(keys);
  }, []);
  var getKeyPath = (0, React.useCallback)(function (eventKey, includeOverflow) {
    var fullPath = key2pathRef.current.get(eventKey) || '';
    var keys = getPathKeys(fullPath);
    if (includeOverflow && overflowKeys.includes(keys[0])) {
      keys.unshift(OVERFLOW_KEY);
    }
    return keys;
  }, [overflowKeys]);
  var isSubPathKey = (0, React.useCallback)(function (pathKeys, eventKey) {
    return pathKeys.filter(function (item) {
      return item !== undefined;
    }).some(function (pathKey) {
      var pathKeyList = getKeyPath(pathKey, true);
      return pathKeyList.includes(eventKey);
    });
  }, [getKeyPath]);
  var getKeys = function getKeys() {
    var keys = (0, _toConsumableArray2.default)(key2pathRef.current.keys());
    if (overflowKeys.length) {
      keys.push(OVERFLOW_KEY);
    }
    return keys;
  };

  /**
   * Find current key related child path keys
   */
  var getSubPathKeys = (0, React.useCallback)(function (key) {
    var connectedPath = "".concat(key2pathRef.current.get(key)).concat(PATH_SPLIT);
    var pathKeys = new Set();
    (0, _toConsumableArray2.default)(path2keyRef.current.keys()).forEach(function (pathKey) {
      if (pathKey.startsWith(connectedPath)) {
        pathKeys.add(path2keyRef.current.get(pathKey));
      }
    });
    return pathKeys;
  }, []);
  React.useEffect(function () {
    return function () {
      destroyRef.current = true;
    };
  }, []);
  return {
    // Register
    registerPath: registerPath,
    unregisterPath: unregisterPath,
    refreshOverflowKeys: refreshOverflowKeys,
    // Util
    isSubPathKey: isSubPathKey,
    getKeyPath: getKeyPath,
    getKeys: getKeys,
    getSubPathKeys: getSubPathKeys
  };
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useMemoCallback.js":
/*!*******************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useMemoCallback.js ***!
  \*******************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = useMemoCallback;
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * Cache callback function that always return same ref instead.
 * This is used for context optimization.
 */
function useMemoCallback(func) {
  var funRef = React.useRef(func);
  funRef.current = func;
  var callback = React.useCallback(function () {
    var _funRef$current;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return (_funRef$current = funRef.current) === null || _funRef$current === void 0 ? void 0 : _funRef$current.call.apply(_funRef$current, [funRef].concat(args));
  }, []);
  return func ? callback : undefined;
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useUUID.js":
/*!***********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/hooks/useUUID.js ***!
  \***********************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = useUUID;
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _useMergedState3 = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/hooks/useMergedState */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/hooks/useMergedState.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var uniquePrefix = Math.random().toFixed(5).toString().slice(2);
var internalId = 0;
function useUUID(id) {
  var _useMergedState = (0, _useMergedState3.default)(id, {
      value: id
    }),
    _useMergedState2 = (0, _slicedToArray2.default)(_useMergedState, 2),
    uuid = _useMergedState2[0],
    setUUID = _useMergedState2[1];
  React.useEffect(function () {
    internalId += 1;
    var newId =  false ? 0 : "".concat(uniquePrefix, "-").concat(internalId);
    setUUID("rc-menu-uuid-".concat(newId));
  }, []);
  return uuid;
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/index.js":
/*!***************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/index.js ***!
  \***************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "Divider", ({
  enumerable: true,
  get: function get() {
    return _Divider.default;
  }
}));
Object.defineProperty(exports, "Item", ({
  enumerable: true,
  get: function get() {
    return _MenuItem.default;
  }
}));
Object.defineProperty(exports, "ItemGroup", ({
  enumerable: true,
  get: function get() {
    return _MenuItemGroup.default;
  }
}));
Object.defineProperty(exports, "MenuItem", ({
  enumerable: true,
  get: function get() {
    return _MenuItem.default;
  }
}));
Object.defineProperty(exports, "MenuItemGroup", ({
  enumerable: true,
  get: function get() {
    return _MenuItemGroup.default;
  }
}));
Object.defineProperty(exports, "SubMenu", ({
  enumerable: true,
  get: function get() {
    return _SubMenu.default;
  }
}));
exports["default"] = void 0;
Object.defineProperty(exports, "useFullPath", ({
  enumerable: true,
  get: function get() {
    return _PathContext.useFullPath;
  }
}));
var _Menu = _interopRequireDefault(__webpack_require__(/*! ./Menu */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/Menu.js"));
var _MenuItem = _interopRequireDefault(__webpack_require__(/*! ./MenuItem */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/MenuItem.js"));
var _SubMenu = _interopRequireDefault(__webpack_require__(/*! ./SubMenu */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/SubMenu/index.js"));
var _MenuItemGroup = _interopRequireDefault(__webpack_require__(/*! ./MenuItemGroup */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/MenuItemGroup.js"));
var _PathContext = __webpack_require__(/*! ./context/PathContext */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/context/PathContext.js");
var _Divider = _interopRequireDefault(__webpack_require__(/*! ./Divider */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/Divider.js"));
var ExportMenu = _Menu.default;
ExportMenu.Item = _MenuItem.default;
ExportMenu.SubMenu = _SubMenu.default;
ExportMenu.ItemGroup = _MenuItemGroup.default;
ExportMenu.Divider = _Divider.default;
var _default = ExportMenu;
exports["default"] = _default;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/placements.js":
/*!********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/placements.js ***!
  \********************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.placementsRtl = exports.placements = exports["default"] = void 0;
var autoAdjustOverflow = {
  adjustX: 1,
  adjustY: 1
};
var placements = {
  topLeft: {
    points: ['bl', 'tl'],
    overflow: autoAdjustOverflow
  },
  topRight: {
    points: ['br', 'tr'],
    overflow: autoAdjustOverflow
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    overflow: autoAdjustOverflow
  },
  bottomRight: {
    points: ['tr', 'br'],
    overflow: autoAdjustOverflow
  },
  leftTop: {
    points: ['tr', 'tl'],
    overflow: autoAdjustOverflow
  },
  leftBottom: {
    points: ['br', 'bl'],
    overflow: autoAdjustOverflow
  },
  rightTop: {
    points: ['tl', 'tr'],
    overflow: autoAdjustOverflow
  },
  rightBottom: {
    points: ['bl', 'br'],
    overflow: autoAdjustOverflow
  }
};
exports.placements = placements;
var placementsRtl = {
  topLeft: {
    points: ['bl', 'tl'],
    overflow: autoAdjustOverflow
  },
  topRight: {
    points: ['br', 'tr'],
    overflow: autoAdjustOverflow
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    overflow: autoAdjustOverflow
  },
  bottomRight: {
    points: ['tr', 'br'],
    overflow: autoAdjustOverflow
  },
  rightTop: {
    points: ['tr', 'tl'],
    overflow: autoAdjustOverflow
  },
  rightBottom: {
    points: ['br', 'bl'],
    overflow: autoAdjustOverflow
  },
  leftTop: {
    points: ['tl', 'tr'],
    overflow: autoAdjustOverflow
  },
  leftBottom: {
    points: ['bl', 'br'],
    overflow: autoAdjustOverflow
  }
};
exports.placementsRtl = placementsRtl;
var _default = placements;
exports["default"] = _default;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/commonUtil.js":
/*!**************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/commonUtil.js ***!
  \**************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.parseChildren = parseChildren;
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/toConsumableArray.js"));
var _toArray = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/Children/toArray */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/Children/toArray.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function parseChildren(children, keyPath) {
  return (0, _toArray.default)(children).map(function (child, index) {
    if ( /*#__PURE__*/React.isValidElement(child)) {
      var _eventKey, _child$props;
      var key = child.key;
      var eventKey = (_eventKey = (_child$props = child.props) === null || _child$props === void 0 ? void 0 : _child$props.eventKey) !== null && _eventKey !== void 0 ? _eventKey : key;
      var emptyKey = eventKey === null || eventKey === undefined;
      if (emptyKey) {
        eventKey = "tmp_key-".concat([].concat((0, _toConsumableArray2.default)(keyPath), [index]).join('-'));
      }
      var cloneProps = {
        key: eventKey,
        eventKey: eventKey
      };
      if ( true && emptyKey) {
        cloneProps.warnKey = true;
      }
      return /*#__PURE__*/React.cloneElement(child, cloneProps);
    }
    return child;
  });
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/motionUtil.js":
/*!**************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/motionUtil.js ***!
  \**************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.getMotion = getMotion;
function getMotion(mode, motion, defaultMotions) {
  if (motion) {
    return motion;
  }
  if (defaultMotions) {
    return defaultMotions[mode] || defaultMotions.other;
  }
  return undefined;
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/nodeUtil.js":
/*!************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/nodeUtil.js ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof3 = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.parseItems = parseItems;
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/extends */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/extends.js"));
var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectWithoutProperties.js"));
var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _Divider = _interopRequireDefault(__webpack_require__(/*! ../Divider */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/Divider.js"));
var _MenuItem = _interopRequireDefault(__webpack_require__(/*! ../MenuItem */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/MenuItem.js"));
var _MenuItemGroup = _interopRequireDefault(__webpack_require__(/*! ../MenuItemGroup */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/MenuItemGroup.js"));
var _SubMenu = _interopRequireDefault(__webpack_require__(/*! ../SubMenu */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/SubMenu/index.js"));
var _commonUtil = __webpack_require__(/*! ./commonUtil */ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/commonUtil.js");
var _excluded = ["label", "children", "key", "type"];
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof3(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function convertItemsToNodes(list, components) {
  var MergedMenuItem = components.item,
    MergedMenuItemGroup = components.group,
    MergedSubMenu = components.submenu,
    MergedDivider = components.divider;
  return (list || []).map(function (opt, index) {
    if (opt && (0, _typeof2.default)(opt) === 'object') {
      var _ref = opt,
        label = _ref.label,
        children = _ref.children,
        key = _ref.key,
        type = _ref.type,
        restProps = (0, _objectWithoutProperties2.default)(_ref, _excluded);
      var mergedKey = key !== null && key !== void 0 ? key : "tmp-".concat(index);

      // MenuItemGroup & SubMenuItem
      if (children || type === 'group') {
        if (type === 'group') {
          // Group
          return /*#__PURE__*/React.createElement(MergedMenuItemGroup, (0, _extends2.default)({
            key: mergedKey
          }, restProps, {
            title: label
          }), convertItemsToNodes(children, components));
        }

        // Sub Menu
        return /*#__PURE__*/React.createElement(MergedSubMenu, (0, _extends2.default)({
          key: mergedKey
        }, restProps, {
          title: label
        }), convertItemsToNodes(children, components));
      }

      // MenuItem & Divider
      if (type === 'divider') {
        return /*#__PURE__*/React.createElement(MergedDivider, (0, _extends2.default)({
          key: mergedKey
        }, restProps));
      }
      return /*#__PURE__*/React.createElement(MergedMenuItem, (0, _extends2.default)({
        key: mergedKey
      }, restProps), label);
    }
    return null;
  }).filter(function (opt) {
    return opt;
  });
}
function parseItems(children, items, keyPath, components) {
  var childNodes = children;
  var mergedComponents = (0, _objectSpread2.default)({
    divider: _Divider.default,
    item: _MenuItem.default,
    group: _MenuItemGroup.default,
    submenu: _SubMenu.default
  }, components);
  if (items) {
    childNodes = convertItemsToNodes(items, mergedComponents);
  }
  return (0, _commonUtil.parseChildren)(childNodes, keyPath);
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/timeUtil.js":
/*!************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/timeUtil.js ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.nextSlice = nextSlice;
function nextSlice(callback) {
  /* istanbul ignore next */
  Promise.resolve().then(callback);
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/warnUtil.js":
/*!************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-menu/lib/utils/warnUtil.js ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.warnItemProp = warnItemProp;
var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectWithoutProperties.js"));
var _warning = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/warning */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/warning.js"));
var _excluded = ["item"];
/**
 * `onClick` event return `info.item` which point to react node directly.
 * We should warning this since it will not work on FC.
 */
function warnItemProp(_ref) {
  var item = _ref.item,
    restInfo = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  Object.defineProperty(restInfo, 'item', {
    get: function get() {
      (0, _warning.default)(false, '`info.item` is deprecated since we will move to function component that not provides React Node instance in future.');
      return item;
    }
  });
  return restInfo;
}

/***/ })

};
;