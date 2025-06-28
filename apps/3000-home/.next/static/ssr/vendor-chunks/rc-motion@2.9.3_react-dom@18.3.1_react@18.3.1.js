"use strict";
exports.id = "vendor-chunks/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1";
exports.ids = ["vendor-chunks/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1"];
exports.modules = {

/***/ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/CSSMotion.js":
/*!**********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/CSSMotion.js ***!
  \**********************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof3 = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
exports.genCSSMotion = genCSSMotion;
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/defineProperty.js"));
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js"));
var _classnames = _interopRequireDefault(__webpack_require__(/*! classnames */ "../../node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js"));
var _findDOMNode = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/Dom/findDOMNode */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/Dom/findDOMNode.js"));
var _ref2 = __webpack_require__(/*! rc-util/lib/ref */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/ref.js");
var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var React = _react;
var _context = __webpack_require__(/*! ./context */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/context.js");
var _DomWrapper = _interopRequireDefault(__webpack_require__(/*! ./DomWrapper */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/DomWrapper.js"));
var _useStatus3 = _interopRequireDefault(__webpack_require__(/*! ./hooks/useStatus */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/hooks/useStatus.js"));
var _useStepQueue = __webpack_require__(/*! ./hooks/useStepQueue */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/hooks/useStepQueue.js");
var _interface = __webpack_require__(/*! ./interface */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/interface.js");
var _motion = __webpack_require__(/*! ./util/motion */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/util/motion.js");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof3(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/* eslint-disable react/default-props-match-prop-types, react/no-multi-comp, react/prop-types */

/**
 * `transitionSupport` is used for none transition test case.
 * Default we use browser transition event support check.
 */
function genCSSMotion(config) {
  var transitionSupport = config;
  if ((0, _typeof2.default)(config) === 'object') {
    transitionSupport = config.transitionSupport;
  }
  function isSupportTransition(props, contextMotion) {
    return !!(props.motionName && transitionSupport && contextMotion !== false);
  }
  var CSSMotion = /*#__PURE__*/React.forwardRef(function (props, ref) {
    var _props$visible = props.visible,
      visible = _props$visible === void 0 ? true : _props$visible,
      _props$removeOnLeave = props.removeOnLeave,
      removeOnLeave = _props$removeOnLeave === void 0 ? true : _props$removeOnLeave,
      forceRender = props.forceRender,
      children = props.children,
      motionName = props.motionName,
      leavedClassName = props.leavedClassName,
      eventProps = props.eventProps;
    var _React$useContext = React.useContext(_context.Context),
      contextMotion = _React$useContext.motion;
    var supportMotion = isSupportTransition(props, contextMotion);

    // Ref to the react node, it may be a HTMLElement
    var nodeRef = (0, _react.useRef)();
    // Ref to the dom wrapper in case ref can not pass to HTMLElement
    var wrapperNodeRef = (0, _react.useRef)();
    function getDomElement() {
      try {
        // Here we're avoiding call for findDOMNode since it's deprecated
        // in strict mode. We're calling it only when node ref is not
        // an instance of DOM HTMLElement. Otherwise use
        // findDOMNode as a final resort
        return nodeRef.current instanceof HTMLElement ? nodeRef.current : (0, _findDOMNode.default)(wrapperNodeRef.current);
      } catch (e) {
        // Only happen when `motionDeadline` trigger but element removed.
        return null;
      }
    }
    var _useStatus = (0, _useStatus3.default)(supportMotion, visible, getDomElement, props),
      _useStatus2 = (0, _slicedToArray2.default)(_useStatus, 4),
      status = _useStatus2[0],
      statusStep = _useStatus2[1],
      statusStyle = _useStatus2[2],
      mergedVisible = _useStatus2[3];

    // Record whether content has rendered
    // Will return null for un-rendered even when `removeOnLeave={false}`
    var renderedRef = React.useRef(mergedVisible);
    if (mergedVisible) {
      renderedRef.current = true;
    }

    // ====================== Refs ======================
    var setNodeRef = React.useCallback(function (node) {
      nodeRef.current = node;
      (0, _ref2.fillRef)(ref, node);
    }, [ref]);

    // ===================== Render =====================
    var motionChildren;
    var mergedProps = (0, _objectSpread2.default)((0, _objectSpread2.default)({}, eventProps), {}, {
      visible: visible
    });
    if (!children) {
      // No children
      motionChildren = null;
    } else if (status === _interface.STATUS_NONE) {
      // Stable children
      if (mergedVisible) {
        motionChildren = children((0, _objectSpread2.default)({}, mergedProps), setNodeRef);
      } else if (!removeOnLeave && renderedRef.current && leavedClassName) {
        motionChildren = children((0, _objectSpread2.default)((0, _objectSpread2.default)({}, mergedProps), {}, {
          className: leavedClassName
        }), setNodeRef);
      } else if (forceRender || !removeOnLeave && !leavedClassName) {
        motionChildren = children((0, _objectSpread2.default)((0, _objectSpread2.default)({}, mergedProps), {}, {
          style: {
            display: 'none'
          }
        }), setNodeRef);
      } else {
        motionChildren = null;
      }
    } else {
      // In motion
      var statusSuffix;
      if (statusStep === _interface.STEP_PREPARE) {
        statusSuffix = 'prepare';
      } else if ((0, _useStepQueue.isActive)(statusStep)) {
        statusSuffix = 'active';
      } else if (statusStep === _interface.STEP_START) {
        statusSuffix = 'start';
      }
      var motionCls = (0, _motion.getTransitionName)(motionName, "".concat(status, "-").concat(statusSuffix));
      motionChildren = children((0, _objectSpread2.default)((0, _objectSpread2.default)({}, mergedProps), {}, {
        className: (0, _classnames.default)((0, _motion.getTransitionName)(motionName, status), (0, _defineProperty2.default)((0, _defineProperty2.default)({}, motionCls, motionCls && statusSuffix), motionName, typeof motionName === 'string')),
        style: statusStyle
      }), setNodeRef);
    }

    // Auto inject ref if child node not have `ref` props
    if ( /*#__PURE__*/React.isValidElement(motionChildren) && (0, _ref2.supportRef)(motionChildren)) {
      var _ref = motionChildren,
        originNodeRef = _ref.ref;
      if (!originNodeRef) {
        motionChildren = /*#__PURE__*/React.cloneElement(motionChildren, {
          ref: setNodeRef
        });
      }
    }
    return /*#__PURE__*/React.createElement(_DomWrapper.default, {
      ref: wrapperNodeRef
    }, motionChildren);
  });
  CSSMotion.displayName = 'CSSMotion';
  return CSSMotion;
}
var _default = exports["default"] = genCSSMotion(_motion.supportTransition);

/***/ }),

/***/ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/CSSMotionList.js":
/*!**************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/CSSMotionList.js ***!
  \**************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
exports.genCSSMotionList = genCSSMotionList;
var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/extends */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/extends.js"));
var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectWithoutProperties.js"));
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/createClass.js"));
var _assertThisInitialized2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/assertThisInitialized */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/assertThisInitialized.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/inherits.js"));
var _createSuper2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createSuper */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/createSuper.js"));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/defineProperty.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _CSSMotion = _interopRequireDefault(__webpack_require__(/*! ./CSSMotion */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/CSSMotion.js"));
var _diff = __webpack_require__(/*! ./util/diff */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/util/diff.js");
var _motion = __webpack_require__(/*! ./util/motion */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/util/motion.js");
var _excluded = ["component", "children", "onVisibleChanged", "onAllRemoved"],
  _excluded2 = ["status"];
/* eslint react/prop-types: 0 */
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
var MOTION_PROP_NAMES = ['eventProps', 'visible', 'children', 'motionName', 'motionAppear', 'motionEnter', 'motionLeave', 'motionLeaveImmediately', 'motionDeadline', 'removeOnLeave', 'leavedClassName', 'onAppearPrepare', 'onAppearStart', 'onAppearActive', 'onAppearEnd', 'onEnterStart', 'onEnterActive', 'onEnterEnd', 'onLeaveStart', 'onLeaveActive', 'onLeaveEnd'];
/**
 * Generate a CSSMotionList component with config
 * @param transitionSupport No need since CSSMotionList no longer depends on transition support
 * @param CSSMotion CSSMotion component
 */
function genCSSMotionList(transitionSupport) {
  var CSSMotion = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _CSSMotion.default;
  var CSSMotionList = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2.default)(CSSMotionList, _React$Component);
    var _super = (0, _createSuper2.default)(CSSMotionList);
    function CSSMotionList() {
      var _this;
      (0, _classCallCheck2.default)(this, CSSMotionList);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "state", {
        keyEntities: []
      });
      // ZombieJ: Return the count of rest keys. It's safe to refactor if need more info.
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "removeKey", function (removeKey) {
        _this.setState(function (prevState) {
          var nextKeyEntities = prevState.keyEntities.map(function (entity) {
            if (entity.key !== removeKey) return entity;
            return (0, _objectSpread2.default)((0, _objectSpread2.default)({}, entity), {}, {
              status: _diff.STATUS_REMOVED
            });
          });
          return {
            keyEntities: nextKeyEntities
          };
        }, function () {
          var keyEntities = _this.state.keyEntities;
          var restKeysCount = keyEntities.filter(function (_ref) {
            var status = _ref.status;
            return status !== _diff.STATUS_REMOVED;
          }).length;
          if (restKeysCount === 0 && _this.props.onAllRemoved) {
            _this.props.onAllRemoved();
          }
        });
      });
      return _this;
    }
    (0, _createClass2.default)(CSSMotionList, [{
      key: "render",
      value: function render() {
        var _this2 = this;
        var keyEntities = this.state.keyEntities;
        var _this$props = this.props,
          component = _this$props.component,
          children = _this$props.children,
          _onVisibleChanged = _this$props.onVisibleChanged,
          onAllRemoved = _this$props.onAllRemoved,
          restProps = (0, _objectWithoutProperties2.default)(_this$props, _excluded);
        var Component = component || React.Fragment;
        var motionProps = {};
        MOTION_PROP_NAMES.forEach(function (prop) {
          motionProps[prop] = restProps[prop];
          delete restProps[prop];
        });
        delete restProps.keys;
        return /*#__PURE__*/React.createElement(Component, restProps, keyEntities.map(function (_ref2, index) {
          var status = _ref2.status,
            eventProps = (0, _objectWithoutProperties2.default)(_ref2, _excluded2);
          var visible = status === _diff.STATUS_ADD || status === _diff.STATUS_KEEP;
          return /*#__PURE__*/React.createElement(CSSMotion, (0, _extends2.default)({}, motionProps, {
            key: eventProps.key,
            visible: visible,
            eventProps: eventProps,
            onVisibleChanged: function onVisibleChanged(changedVisible) {
              _onVisibleChanged === null || _onVisibleChanged === void 0 || _onVisibleChanged(changedVisible, {
                key: eventProps.key
              });
              if (!changedVisible) {
                _this2.removeKey(eventProps.key);
              }
            }
          }), function (props, ref) {
            return children((0, _objectSpread2.default)((0, _objectSpread2.default)({}, props), {}, {
              index: index
            }), ref);
          });
        }));
      }
    }], [{
      key: "getDerivedStateFromProps",
      value: function getDerivedStateFromProps(_ref3, _ref4) {
        var keys = _ref3.keys;
        var keyEntities = _ref4.keyEntities;
        var parsedKeyObjects = (0, _diff.parseKeys)(keys);
        var mixedKeyEntities = (0, _diff.diffKeys)(keyEntities, parsedKeyObjects);
        return {
          keyEntities: mixedKeyEntities.filter(function (entity) {
            var prevEntity = keyEntities.find(function (_ref5) {
              var key = _ref5.key;
              return entity.key === key;
            });

            // Remove if already mark as removed
            if (prevEntity && prevEntity.status === _diff.STATUS_REMOVED && entity.status === _diff.STATUS_REMOVE) {
              return false;
            }
            return true;
          })
        };
      }
    }]);
    return CSSMotionList;
  }(React.Component);
  (0, _defineProperty2.default)(CSSMotionList, "defaultProps", {
    component: 'div'
  });
  return CSSMotionList;
}
var _default = exports["default"] = genCSSMotionList(_motion.supportTransition);

/***/ }),

/***/ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/DomWrapper.js":
/*!***********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/DomWrapper.js ***!
  \***********************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/createClass.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/inherits.js"));
var _createSuper2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createSuper */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/createSuper.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
var DomWrapper = /*#__PURE__*/function (_React$Component) {
  (0, _inherits2.default)(DomWrapper, _React$Component);
  var _super = (0, _createSuper2.default)(DomWrapper);
  function DomWrapper() {
    (0, _classCallCheck2.default)(this, DomWrapper);
    return _super.apply(this, arguments);
  }
  (0, _createClass2.default)(DomWrapper, [{
    key: "render",
    value: function render() {
      return this.props.children;
    }
  }]);
  return DomWrapper;
}(React.Component);
var _default = exports["default"] = DomWrapper;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/context.js":
/*!********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/context.js ***!
  \********************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Context = void 0;
exports["default"] = MotionProvider;
var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectWithoutProperties.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _excluded = ["children"];
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
var Context = exports.Context = /*#__PURE__*/React.createContext({});
function MotionProvider(_ref) {
  var children = _ref.children,
    props = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  return /*#__PURE__*/React.createElement(Context.Provider, {
    value: props
  }, children);
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/hooks/useDomMotionEvents.js":
/*!*************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/hooks/useDomMotionEvents.js ***!
  \*************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var React = _react;
var _motion = __webpack_require__(/*! ../util/motion */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/util/motion.js");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
var _default = exports["default"] = function _default(onInternalMotionEnd) {
  var cacheElementRef = (0, _react.useRef)();

  // Remove events
  function removeMotionEvents(element) {
    if (element) {
      element.removeEventListener(_motion.transitionEndName, onInternalMotionEnd);
      element.removeEventListener(_motion.animationEndName, onInternalMotionEnd);
    }
  }

  // Patch events
  function patchMotionEvents(element) {
    if (cacheElementRef.current && cacheElementRef.current !== element) {
      removeMotionEvents(cacheElementRef.current);
    }
    if (element && element !== cacheElementRef.current) {
      element.addEventListener(_motion.transitionEndName, onInternalMotionEnd);
      element.addEventListener(_motion.animationEndName, onInternalMotionEnd);

      // Save as cache in case dom removed trigger by `motionDeadline`
      cacheElementRef.current = element;
    }
  }

  // Clean up when removed
  React.useEffect(function () {
    return function () {
      removeMotionEvents(cacheElementRef.current);
    };
  }, []);
  return [patchMotionEvents, removeMotionEvents];
};

/***/ }),

/***/ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/hooks/useIsomorphicLayoutEffect.js":
/*!********************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/hooks/useIsomorphicLayoutEffect.js ***!
  \********************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _canUseDom = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/Dom/canUseDom */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/Dom/canUseDom.js"));
var _react = __webpack_require__(/*! react */ "react");
// It's safe to use `useLayoutEffect` but the warning is annoying
var useIsomorphicLayoutEffect = (0, _canUseDom.default)() ? _react.useLayoutEffect : _react.useEffect;
var _default = exports["default"] = useIsomorphicLayoutEffect;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/hooks/useNextFrame.js":
/*!*******************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/hooks/useNextFrame.js ***!
  \*******************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _raf = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/raf */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/raf.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
var _default = exports["default"] = function _default() {
  var nextFrameRef = React.useRef(null);
  function cancelNextFrame() {
    _raf.default.cancel(nextFrameRef.current);
  }
  function nextFrame(callback) {
    var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
    cancelNextFrame();
    var nextFrameId = (0, _raf.default)(function () {
      if (delay <= 1) {
        callback({
          isCanceled: function isCanceled() {
            return nextFrameId !== nextFrameRef.current;
          }
        });
      } else {
        nextFrame(callback, delay - 1);
      }
    });
    nextFrameRef.current = nextFrameId;
  }
  React.useEffect(function () {
    return function () {
      cancelNextFrame();
    };
  }, []);
  return [nextFrame, cancelNextFrame];
};

/***/ }),

/***/ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/hooks/useStatus.js":
/*!****************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/hooks/useStatus.js ***!
  \****************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = useStatus;
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/defineProperty.js"));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _rcUtil = __webpack_require__(/*! rc-util */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/index.js");
var _useState5 = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/hooks/useState */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/hooks/useState.js"));
var _useSyncState3 = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/hooks/useSyncState */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/hooks/useSyncState.js"));
var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var React = _react;
var _interface = __webpack_require__(/*! ../interface */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/interface.js");
var _useDomMotionEvents3 = _interopRequireDefault(__webpack_require__(/*! ./useDomMotionEvents */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/hooks/useDomMotionEvents.js"));
var _useIsomorphicLayoutEffect = _interopRequireDefault(__webpack_require__(/*! ./useIsomorphicLayoutEffect */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/hooks/useIsomorphicLayoutEffect.js"));
var _useStepQueue3 = _interopRequireWildcard(__webpack_require__(/*! ./useStepQueue */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/hooks/useStepQueue.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function useStatus(supportMotion, visible, getElement, _ref) {
  var _ref$motionEnter = _ref.motionEnter,
    motionEnter = _ref$motionEnter === void 0 ? true : _ref$motionEnter,
    _ref$motionAppear = _ref.motionAppear,
    motionAppear = _ref$motionAppear === void 0 ? true : _ref$motionAppear,
    _ref$motionLeave = _ref.motionLeave,
    motionLeave = _ref$motionLeave === void 0 ? true : _ref$motionLeave,
    motionDeadline = _ref.motionDeadline,
    motionLeaveImmediately = _ref.motionLeaveImmediately,
    onAppearPrepare = _ref.onAppearPrepare,
    onEnterPrepare = _ref.onEnterPrepare,
    onLeavePrepare = _ref.onLeavePrepare,
    onAppearStart = _ref.onAppearStart,
    onEnterStart = _ref.onEnterStart,
    onLeaveStart = _ref.onLeaveStart,
    onAppearActive = _ref.onAppearActive,
    onEnterActive = _ref.onEnterActive,
    onLeaveActive = _ref.onLeaveActive,
    onAppearEnd = _ref.onAppearEnd,
    onEnterEnd = _ref.onEnterEnd,
    onLeaveEnd = _ref.onLeaveEnd,
    onVisibleChanged = _ref.onVisibleChanged;
  // Used for outer render usage to avoid `visible: false & status: none` to render nothing
  var _useState = (0, _useState5.default)(),
    _useState2 = (0, _slicedToArray2.default)(_useState, 2),
    asyncVisible = _useState2[0],
    setAsyncVisible = _useState2[1];
  var _useSyncState = (0, _useSyncState3.default)(_interface.STATUS_NONE),
    _useSyncState2 = (0, _slicedToArray2.default)(_useSyncState, 2),
    getStatus = _useSyncState2[0],
    setStatus = _useSyncState2[1];
  var _useState3 = (0, _useState5.default)(null),
    _useState4 = (0, _slicedToArray2.default)(_useState3, 2),
    style = _useState4[0],
    setStyle = _useState4[1];
  var currentStatus = getStatus();
  var mountedRef = (0, _react.useRef)(false);
  var deadlineRef = (0, _react.useRef)(null);

  // =========================== Dom Node ===========================
  function getDomElement() {
    return getElement();
  }

  // ========================== Motion End ==========================
  var activeRef = (0, _react.useRef)(false);

  /**
   * Clean up status & style
   */
  function updateMotionEndStatus() {
    setStatus(_interface.STATUS_NONE);
    setStyle(null, true);
  }
  var onInternalMotionEnd = (0, _rcUtil.useEvent)(function (event) {
    var status = getStatus();
    // Do nothing since not in any transition status.
    // This may happen when `motionDeadline` trigger.
    if (status === _interface.STATUS_NONE) {
      return;
    }
    var element = getDomElement();
    if (event && !event.deadline && event.target !== element) {
      // event exists
      // not initiated by deadline
      // transitionEnd not fired by inner elements
      return;
    }
    var currentActive = activeRef.current;
    var canEnd;
    if (status === _interface.STATUS_APPEAR && currentActive) {
      canEnd = onAppearEnd === null || onAppearEnd === void 0 ? void 0 : onAppearEnd(element, event);
    } else if (status === _interface.STATUS_ENTER && currentActive) {
      canEnd = onEnterEnd === null || onEnterEnd === void 0 ? void 0 : onEnterEnd(element, event);
    } else if (status === _interface.STATUS_LEAVE && currentActive) {
      canEnd = onLeaveEnd === null || onLeaveEnd === void 0 ? void 0 : onLeaveEnd(element, event);
    }

    // Only update status when `canEnd` and not destroyed
    if (currentActive && canEnd !== false) {
      updateMotionEndStatus();
    }
  });
  var _useDomMotionEvents = (0, _useDomMotionEvents3.default)(onInternalMotionEnd),
    _useDomMotionEvents2 = (0, _slicedToArray2.default)(_useDomMotionEvents, 1),
    patchMotionEvents = _useDomMotionEvents2[0];

  // ============================= Step =============================
  var getEventHandlers = function getEventHandlers(targetStatus) {
    switch (targetStatus) {
      case _interface.STATUS_APPEAR:
        return (0, _defineProperty2.default)((0, _defineProperty2.default)((0, _defineProperty2.default)({}, _interface.STEP_PREPARE, onAppearPrepare), _interface.STEP_START, onAppearStart), _interface.STEP_ACTIVE, onAppearActive);
      case _interface.STATUS_ENTER:
        return (0, _defineProperty2.default)((0, _defineProperty2.default)((0, _defineProperty2.default)({}, _interface.STEP_PREPARE, onEnterPrepare), _interface.STEP_START, onEnterStart), _interface.STEP_ACTIVE, onEnterActive);
      case _interface.STATUS_LEAVE:
        return (0, _defineProperty2.default)((0, _defineProperty2.default)((0, _defineProperty2.default)({}, _interface.STEP_PREPARE, onLeavePrepare), _interface.STEP_START, onLeaveStart), _interface.STEP_ACTIVE, onLeaveActive);
      default:
        return {};
    }
  };
  var eventHandlers = React.useMemo(function () {
    return getEventHandlers(currentStatus);
  }, [currentStatus]);
  var _useStepQueue = (0, _useStepQueue3.default)(currentStatus, !supportMotion, function (newStep) {
      // Only prepare step can be skip
      if (newStep === _interface.STEP_PREPARE) {
        var onPrepare = eventHandlers[_interface.STEP_PREPARE];
        if (!onPrepare) {
          return _useStepQueue3.SkipStep;
        }
        return onPrepare(getDomElement());
      }

      // Rest step is sync update
      if (step in eventHandlers) {
        var _eventHandlers$step;
        setStyle(((_eventHandlers$step = eventHandlers[step]) === null || _eventHandlers$step === void 0 ? void 0 : _eventHandlers$step.call(eventHandlers, getDomElement(), null)) || null);
      }
      if (step === _interface.STEP_ACTIVE && currentStatus !== _interface.STATUS_NONE) {
        // Patch events when motion needed
        patchMotionEvents(getDomElement());
        if (motionDeadline > 0) {
          clearTimeout(deadlineRef.current);
          deadlineRef.current = setTimeout(function () {
            onInternalMotionEnd({
              deadline: true
            });
          }, motionDeadline);
        }
      }
      if (step === _interface.STEP_PREPARED) {
        updateMotionEndStatus();
      }
      return _useStepQueue3.DoStep;
    }),
    _useStepQueue2 = (0, _slicedToArray2.default)(_useStepQueue, 2),
    startStep = _useStepQueue2[0],
    step = _useStepQueue2[1];
  var active = (0, _useStepQueue3.isActive)(step);
  activeRef.current = active;

  // ============================ Status ============================
  // Update with new status
  (0, _useIsomorphicLayoutEffect.default)(function () {
    setAsyncVisible(visible);
    var isMounted = mountedRef.current;
    mountedRef.current = true;

    // if (!supportMotion) {
    //   return;
    // }

    var nextStatus;

    // Appear
    if (!isMounted && visible && motionAppear) {
      nextStatus = _interface.STATUS_APPEAR;
    }

    // Enter
    if (isMounted && visible && motionEnter) {
      nextStatus = _interface.STATUS_ENTER;
    }

    // Leave
    if (isMounted && !visible && motionLeave || !isMounted && motionLeaveImmediately && !visible && motionLeave) {
      nextStatus = _interface.STATUS_LEAVE;
    }
    var nextEventHandlers = getEventHandlers(nextStatus);

    // Update to next status
    if (nextStatus && (supportMotion || nextEventHandlers[_interface.STEP_PREPARE])) {
      setStatus(nextStatus);
      startStep();
    } else {
      // Set back in case no motion but prev status has prepare step
      setStatus(_interface.STATUS_NONE);
    }
  }, [visible]);

  // ============================ Effect ============================
  // Reset when motion changed
  (0, _react.useEffect)(function () {
    if (
    // Cancel appear
    currentStatus === _interface.STATUS_APPEAR && !motionAppear ||
    // Cancel enter
    currentStatus === _interface.STATUS_ENTER && !motionEnter ||
    // Cancel leave
    currentStatus === _interface.STATUS_LEAVE && !motionLeave) {
      setStatus(_interface.STATUS_NONE);
    }
  }, [motionAppear, motionEnter, motionLeave]);
  (0, _react.useEffect)(function () {
    return function () {
      mountedRef.current = false;
      clearTimeout(deadlineRef.current);
    };
  }, []);

  // Trigger `onVisibleChanged`
  var firstMountChangeRef = React.useRef(false);
  (0, _react.useEffect)(function () {
    // [visible & motion not end] => [!visible & motion end] still need trigger onVisibleChanged
    if (asyncVisible) {
      firstMountChangeRef.current = true;
    }
    if (asyncVisible !== undefined && currentStatus === _interface.STATUS_NONE) {
      // Skip first render is invisible since it's nothing changed
      if (firstMountChangeRef.current || asyncVisible) {
        onVisibleChanged === null || onVisibleChanged === void 0 || onVisibleChanged(asyncVisible);
      }
      firstMountChangeRef.current = true;
    }
  }, [asyncVisible, currentStatus]);

  // ============================ Styles ============================
  var mergedStyle = style;
  if (eventHandlers[_interface.STEP_PREPARE] && step === _interface.STEP_START) {
    mergedStyle = (0, _objectSpread2.default)({
      transition: 'none'
    }, mergedStyle);
  }
  return [currentStatus, step, mergedStyle, asyncVisible !== null && asyncVisible !== void 0 ? asyncVisible : visible];
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/hooks/useStepQueue.js":
/*!*******************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/hooks/useStepQueue.js ***!
  \*******************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.SkipStep = exports.DoStep = void 0;
exports.isActive = isActive;
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _useState3 = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/hooks/useState */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/hooks/useState.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _interface = __webpack_require__(/*! ../interface */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/interface.js");
var _useIsomorphicLayoutEffect = _interopRequireDefault(__webpack_require__(/*! ./useIsomorphicLayoutEffect */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/hooks/useIsomorphicLayoutEffect.js"));
var _useNextFrame3 = _interopRequireDefault(__webpack_require__(/*! ./useNextFrame */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/hooks/useNextFrame.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
var FULL_STEP_QUEUE = [_interface.STEP_PREPARE, _interface.STEP_START, _interface.STEP_ACTIVE, _interface.STEP_ACTIVATED];
var SIMPLE_STEP_QUEUE = [_interface.STEP_PREPARE, _interface.STEP_PREPARED];

/** Skip current step */
var SkipStep = exports.SkipStep = false;
/** Current step should be update in */
var DoStep = exports.DoStep = true;
function isActive(step) {
  return step === _interface.STEP_ACTIVE || step === _interface.STEP_ACTIVATED;
}
var _default = exports["default"] = function _default(status, prepareOnly, callback) {
  var _useState = (0, _useState3.default)(_interface.STEP_NONE),
    _useState2 = (0, _slicedToArray2.default)(_useState, 2),
    step = _useState2[0],
    setStep = _useState2[1];
  var _useNextFrame = (0, _useNextFrame3.default)(),
    _useNextFrame2 = (0, _slicedToArray2.default)(_useNextFrame, 2),
    nextFrame = _useNextFrame2[0],
    cancelNextFrame = _useNextFrame2[1];
  function startQueue() {
    setStep(_interface.STEP_PREPARE, true);
  }
  var STEP_QUEUE = prepareOnly ? SIMPLE_STEP_QUEUE : FULL_STEP_QUEUE;
  (0, _useIsomorphicLayoutEffect.default)(function () {
    if (step !== _interface.STEP_NONE && step !== _interface.STEP_ACTIVATED) {
      var index = STEP_QUEUE.indexOf(step);
      var nextStep = STEP_QUEUE[index + 1];
      var result = callback(step);
      if (result === SkipStep) {
        // Skip when no needed
        setStep(nextStep, true);
      } else if (nextStep) {
        // Do as frame for step update
        nextFrame(function (info) {
          function doNext() {
            // Skip since current queue is ood
            if (info.isCanceled()) return;
            setStep(nextStep, true);
          }
          if (result === true) {
            doNext();
          } else {
            // Only promise should be async
            Promise.resolve(result).then(doNext);
          }
        });
      }
    }
  }, [status, step]);
  React.useEffect(function () {
    return function () {
      cancelNextFrame();
    };
  }, []);
  return [startQueue, step];
};

/***/ }),

/***/ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/index.js":
/*!******************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/index.js ***!
  \******************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "CSSMotionList", ({
  enumerable: true,
  get: function get() {
    return _CSSMotionList.default;
  }
}));
Object.defineProperty(exports, "Provider", ({
  enumerable: true,
  get: function get() {
    return _context.default;
  }
}));
exports["default"] = void 0;
var _CSSMotion = _interopRequireDefault(__webpack_require__(/*! ./CSSMotion */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/CSSMotion.js"));
var _CSSMotionList = _interopRequireDefault(__webpack_require__(/*! ./CSSMotionList */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/CSSMotionList.js"));
var _context = _interopRequireDefault(__webpack_require__(/*! ./context */ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/context.js"));
var _default = exports["default"] = _CSSMotion.default;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/interface.js":
/*!**********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/interface.js ***!
  \**********************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.STEP_START = exports.STEP_PREPARED = exports.STEP_PREPARE = exports.STEP_NONE = exports.STEP_ACTIVE = exports.STEP_ACTIVATED = exports.STATUS_NONE = exports.STATUS_LEAVE = exports.STATUS_ENTER = exports.STATUS_APPEAR = void 0;
var STATUS_NONE = exports.STATUS_NONE = 'none';
var STATUS_APPEAR = exports.STATUS_APPEAR = 'appear';
var STATUS_ENTER = exports.STATUS_ENTER = 'enter';
var STATUS_LEAVE = exports.STATUS_LEAVE = 'leave';
var STEP_NONE = exports.STEP_NONE = 'none';
var STEP_PREPARE = exports.STEP_PREPARE = 'prepare';
var STEP_START = exports.STEP_START = 'start';
var STEP_ACTIVE = exports.STEP_ACTIVE = 'active';
var STEP_ACTIVATED = exports.STEP_ACTIVATED = 'end';
/**
 * Used for disabled motion case.
 * Prepare stage will still work but start & active will be skipped.
 */
var STEP_PREPARED = exports.STEP_PREPARED = 'prepared';

/***/ }),

/***/ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/util/diff.js":
/*!**********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/util/diff.js ***!
  \**********************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.STATUS_REMOVED = exports.STATUS_REMOVE = exports.STATUS_KEEP = exports.STATUS_ADD = void 0;
exports.diffKeys = diffKeys;
exports.parseKeys = parseKeys;
exports.wrapKeyToObject = wrapKeyToObject;
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js"));
var STATUS_ADD = exports.STATUS_ADD = 'add';
var STATUS_KEEP = exports.STATUS_KEEP = 'keep';
var STATUS_REMOVE = exports.STATUS_REMOVE = 'remove';
var STATUS_REMOVED = exports.STATUS_REMOVED = 'removed';
function wrapKeyToObject(key) {
  var keyObj;
  if (key && (0, _typeof2.default)(key) === 'object' && 'key' in key) {
    keyObj = key;
  } else {
    keyObj = {
      key: key
    };
  }
  return (0, _objectSpread2.default)((0, _objectSpread2.default)({}, keyObj), {}, {
    key: String(keyObj.key)
  });
}
function parseKeys() {
  var keys = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return keys.map(wrapKeyToObject);
}
function diffKeys() {
  var prevKeys = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var currentKeys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var list = [];
  var currentIndex = 0;
  var currentLen = currentKeys.length;
  var prevKeyObjects = parseKeys(prevKeys);
  var currentKeyObjects = parseKeys(currentKeys);

  // Check prev keys to insert or keep
  prevKeyObjects.forEach(function (keyObj) {
    var hit = false;
    for (var i = currentIndex; i < currentLen; i += 1) {
      var currentKeyObj = currentKeyObjects[i];
      if (currentKeyObj.key === keyObj.key) {
        // New added keys should add before current key
        if (currentIndex < i) {
          list = list.concat(currentKeyObjects.slice(currentIndex, i).map(function (obj) {
            return (0, _objectSpread2.default)((0, _objectSpread2.default)({}, obj), {}, {
              status: STATUS_ADD
            });
          }));
          currentIndex = i;
        }
        list.push((0, _objectSpread2.default)((0, _objectSpread2.default)({}, currentKeyObj), {}, {
          status: STATUS_KEEP
        }));
        currentIndex += 1;
        hit = true;
        break;
      }
    }

    // If not hit, it means key is removed
    if (!hit) {
      list.push((0, _objectSpread2.default)((0, _objectSpread2.default)({}, keyObj), {}, {
        status: STATUS_REMOVE
      }));
    }
  });

  // Add rest to the list
  if (currentIndex < currentLen) {
    list = list.concat(currentKeyObjects.slice(currentIndex).map(function (obj) {
      return (0, _objectSpread2.default)((0, _objectSpread2.default)({}, obj), {}, {
        status: STATUS_ADD
      });
    }));
  }

  /**
   * Merge same key when it remove and add again:
   *    [1 - add, 2 - keep, 1 - remove] -> [1 - keep, 2 - keep]
   */
  var keys = {};
  list.forEach(function (_ref) {
    var key = _ref.key;
    keys[key] = (keys[key] || 0) + 1;
  });
  var duplicatedKeys = Object.keys(keys).filter(function (key) {
    return keys[key] > 1;
  });
  duplicatedKeys.forEach(function (matchKey) {
    // Remove `STATUS_REMOVE` node.
    list = list.filter(function (_ref2) {
      var key = _ref2.key,
        status = _ref2.status;
      return key !== matchKey || status !== STATUS_REMOVE;
    });

    // Update `STATUS_ADD` to `STATUS_KEEP`
    list.forEach(function (node) {
      if (node.key === matchKey) {
        // eslint-disable-next-line no-param-reassign
        node.status = STATUS_KEEP;
      }
    });
  });
  return list;
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/util/motion.js":
/*!************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1/node_modules/rc-motion/lib/util/motion.js ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.animationEndName = void 0;
exports.getTransitionName = getTransitionName;
exports.getVendorPrefixedEventName = getVendorPrefixedEventName;
exports.getVendorPrefixes = getVendorPrefixes;
exports.transitionEndName = exports.supportTransition = void 0;
var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js"));
var _canUseDom = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/Dom/canUseDom */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/Dom/canUseDom.js"));
// ================= Transition =================
// Event wrapper. Copy from react source code
function makePrefixMap(styleProp, eventName) {
  var prefixes = {};
  prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
  prefixes["Webkit".concat(styleProp)] = "webkit".concat(eventName);
  prefixes["Moz".concat(styleProp)] = "moz".concat(eventName);
  prefixes["ms".concat(styleProp)] = "MS".concat(eventName);
  prefixes["O".concat(styleProp)] = "o".concat(eventName.toLowerCase());
  return prefixes;
}
function getVendorPrefixes(domSupport, win) {
  var prefixes = {
    animationend: makePrefixMap('Animation', 'AnimationEnd'),
    transitionend: makePrefixMap('Transition', 'TransitionEnd')
  };
  if (domSupport) {
    if (!('AnimationEvent' in win)) {
      delete prefixes.animationend.animation;
    }
    if (!('TransitionEvent' in win)) {
      delete prefixes.transitionend.transition;
    }
  }
  return prefixes;
}
var vendorPrefixes = getVendorPrefixes((0, _canUseDom.default)(), typeof window !== 'undefined' ? window : {});
var style = {};
if ((0, _canUseDom.default)()) {
  var _document$createEleme = document.createElement('div');
  style = _document$createEleme.style;
}
var prefixedEventNames = {};
function getVendorPrefixedEventName(eventName) {
  if (prefixedEventNames[eventName]) {
    return prefixedEventNames[eventName];
  }
  var prefixMap = vendorPrefixes[eventName];
  if (prefixMap) {
    var stylePropList = Object.keys(prefixMap);
    var len = stylePropList.length;
    for (var i = 0; i < len; i += 1) {
      var styleProp = stylePropList[i];
      if (Object.prototype.hasOwnProperty.call(prefixMap, styleProp) && styleProp in style) {
        prefixedEventNames[eventName] = prefixMap[styleProp];
        return prefixedEventNames[eventName];
      }
    }
  }
  return '';
}
var internalAnimationEndName = getVendorPrefixedEventName('animationend');
var internalTransitionEndName = getVendorPrefixedEventName('transitionend');
var supportTransition = exports.supportTransition = !!(internalAnimationEndName && internalTransitionEndName);
var animationEndName = exports.animationEndName = internalAnimationEndName || 'animationend';
var transitionEndName = exports.transitionEndName = internalTransitionEndName || 'transitionend';
function getTransitionName(transitionName, transitionType) {
  if (!transitionName) return null;
  if ((0, _typeof2.default)(transitionName) === 'object') {
    var type = transitionType.replace(/-\w/g, function (match) {
      return match[1].toUpperCase();
    });
    return transitionName[type];
  }
  return "".concat(transitionName, "-").concat(transitionType);
}

/***/ })

};
;