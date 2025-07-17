"use strict";
exports.id = "vendor-chunks/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1";
exports.ids = ["vendor-chunks/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1"];
exports.modules = {

/***/ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/Field.js":
/*!**************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/Field.js ***!
  \**************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/extends */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/extends.js"));
var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectWithoutProperties.js"));
var _regeneratorRuntime2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/regeneratorRuntime */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/regeneratorRuntime.js"));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/asyncToGenerator.js"));
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/toConsumableArray.js"));
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/createClass.js"));
var _assertThisInitialized2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/assertThisInitialized */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/assertThisInitialized.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/inherits.js"));
var _createSuper2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createSuper */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/createSuper.js"));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/defineProperty.js"));
var _toArray = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/Children/toArray */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/Children/toArray.js"));
var _isEqual = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/isEqual */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/isEqual.js"));
var _warning = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/warning */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/warning.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _FieldContext = _interopRequireWildcard(__webpack_require__(/*! ./FieldContext */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/FieldContext.js"));
var _ListContext = _interopRequireDefault(__webpack_require__(/*! ./ListContext */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/ListContext.js"));
var _typeUtil = __webpack_require__(/*! ./utils/typeUtil */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/typeUtil.js");
var _validateUtil = __webpack_require__(/*! ./utils/validateUtil */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/validateUtil.js");
var _valueUtil = __webpack_require__(/*! ./utils/valueUtil */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/valueUtil.js");
var _excluded = ["name"];
var EMPTY_ERRORS = [];
function requireUpdate(shouldUpdate, prev, next, prevValue, nextValue, info) {
  if (typeof shouldUpdate === 'function') {
    return shouldUpdate(prev, next, 'source' in info ? {
      source: info.source
    } : {});
  }
  return prevValue !== nextValue;
}

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
// We use Class instead of Hooks here since it will cost much code by using Hooks.
var Field = /*#__PURE__*/function (_React$Component) {
  (0, _inherits2.default)(Field, _React$Component);
  var _super = (0, _createSuper2.default)(Field);
  // ============================== Subscriptions ==============================
  function Field(props) {
    var _this;
    (0, _classCallCheck2.default)(this, Field);
    _this = _super.call(this, props);

    // Register on init
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "state", {
      resetCount: 0
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "cancelRegisterFunc", null);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "mounted", false);
    /**
     * Follow state should not management in State since it will async update by React.
     * This makes first render of form can not get correct state value.
     */
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "touched", false);
    /**
     * Mark when touched & validated. Currently only used for `dependencies`.
     * Note that we do not think field with `initialValue` is dirty
     * but this will be by `isFieldDirty` func.
     */
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "dirty", false);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "validatePromise", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "prevValidating", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "errors", EMPTY_ERRORS);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "warnings", EMPTY_ERRORS);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "cancelRegister", function () {
      var _this$props = _this.props,
        preserve = _this$props.preserve,
        isListField = _this$props.isListField,
        name = _this$props.name;
      if (_this.cancelRegisterFunc) {
        _this.cancelRegisterFunc(isListField, preserve, (0, _valueUtil.getNamePath)(name));
      }
      _this.cancelRegisterFunc = null;
    });
    // ================================== Utils ==================================
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "getNamePath", function () {
      var _this$props2 = _this.props,
        name = _this$props2.name,
        fieldContext = _this$props2.fieldContext;
      var _fieldContext$prefixN = fieldContext.prefixName,
        prefixName = _fieldContext$prefixN === void 0 ? [] : _fieldContext$prefixN;
      return name !== undefined ? [].concat((0, _toConsumableArray2.default)(prefixName), (0, _toConsumableArray2.default)(name)) : [];
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "getRules", function () {
      var _this$props3 = _this.props,
        _this$props3$rules = _this$props3.rules,
        rules = _this$props3$rules === void 0 ? [] : _this$props3$rules,
        fieldContext = _this$props3.fieldContext;
      return rules.map(function (rule) {
        if (typeof rule === 'function') {
          return rule(fieldContext);
        }
        return rule;
      });
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "refresh", function () {
      if (!_this.mounted) return;

      /**
       * Clean up current node.
       */
      _this.setState(function (_ref) {
        var resetCount = _ref.resetCount;
        return {
          resetCount: resetCount + 1
        };
      });
    });
    // Event should only trigger when meta changed
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "metaCache", null);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "triggerMetaEvent", function (destroy) {
      var onMetaChange = _this.props.onMetaChange;
      if (onMetaChange) {
        var _meta = (0, _objectSpread2.default)((0, _objectSpread2.default)({}, _this.getMeta()), {}, {
          destroy: destroy
        });
        if (!(0, _isEqual.default)(_this.metaCache, _meta)) {
          onMetaChange(_meta);
        }
        _this.metaCache = _meta;
      } else {
        _this.metaCache = null;
      }
    });
    // ========================= Field Entity Interfaces =========================
    // Trigger by store update. Check if need update the component
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "onStoreChange", function (prevStore, namePathList, info) {
      var _this$props4 = _this.props,
        shouldUpdate = _this$props4.shouldUpdate,
        _this$props4$dependen = _this$props4.dependencies,
        dependencies = _this$props4$dependen === void 0 ? [] : _this$props4$dependen,
        onReset = _this$props4.onReset;
      var store = info.store;
      var namePath = _this.getNamePath();
      var prevValue = _this.getValue(prevStore);
      var curValue = _this.getValue(store);
      var namePathMatch = namePathList && (0, _valueUtil.containsNamePath)(namePathList, namePath);

      // `setFieldsValue` is a quick access to update related status
      if (info.type === 'valueUpdate' && info.source === 'external' && !(0, _isEqual.default)(prevValue, curValue)) {
        _this.touched = true;
        _this.dirty = true;
        _this.validatePromise = null;
        _this.errors = EMPTY_ERRORS;
        _this.warnings = EMPTY_ERRORS;
        _this.triggerMetaEvent();
      }
      switch (info.type) {
        case 'reset':
          if (!namePathList || namePathMatch) {
            // Clean up state
            _this.touched = false;
            _this.dirty = false;
            _this.validatePromise = undefined;
            _this.errors = EMPTY_ERRORS;
            _this.warnings = EMPTY_ERRORS;
            _this.triggerMetaEvent();
            onReset === null || onReset === void 0 || onReset();
            _this.refresh();
            return;
          }
          break;

        /**
         * In case field with `preserve = false` nest deps like:
         * - A = 1 => show B
         * - B = 1 => show C
         * - Reset A, need clean B, C
         */
        case 'remove':
          {
            if (shouldUpdate) {
              _this.reRender();
              return;
            }
            break;
          }
        case 'setField':
          {
            var data = info.data;
            if (namePathMatch) {
              if ('touched' in data) {
                _this.touched = data.touched;
              }
              if ('validating' in data && !('originRCField' in data)) {
                _this.validatePromise = data.validating ? Promise.resolve([]) : null;
              }
              if ('errors' in data) {
                _this.errors = data.errors || EMPTY_ERRORS;
              }
              if ('warnings' in data) {
                _this.warnings = data.warnings || EMPTY_ERRORS;
              }
              _this.dirty = true;
              _this.triggerMetaEvent();
              _this.reRender();
              return;
            } else if ('value' in data && (0, _valueUtil.containsNamePath)(namePathList, namePath, true)) {
              // Contains path with value should also check
              _this.reRender();
              return;
            }

            // Handle update by `setField` with `shouldUpdate`
            if (shouldUpdate && !namePath.length && requireUpdate(shouldUpdate, prevStore, store, prevValue, curValue, info)) {
              _this.reRender();
              return;
            }
            break;
          }
        case 'dependenciesUpdate':
          {
            /**
             * Trigger when marked `dependencies` updated. Related fields will all update
             */
            var dependencyList = dependencies.map(_valueUtil.getNamePath);
            // No need for `namePathMath` check and `shouldUpdate` check, since `valueUpdate` will be
            // emitted earlier and they will work there
            // If set it may cause unnecessary twice rerendering
            if (dependencyList.some(function (dependency) {
              return (0, _valueUtil.containsNamePath)(info.relatedFields, dependency);
            })) {
              _this.reRender();
              return;
            }
            break;
          }
        default:
          // 1. If `namePath` exists in `namePathList`, means it's related value and should update
          //      For example <List name="list"><Field name={['list', 0]}></List>
          //      If `namePathList` is [['list']] (List value update), Field should be updated
          //      If `namePathList` is [['list', 0]] (Field value update), List shouldn't be updated
          // 2.
          //   2.1 If `dependencies` is set, `name` is not set and `shouldUpdate` is not set,
          //       don't use `shouldUpdate`. `dependencies` is view as a shortcut if `shouldUpdate`
          //       is not provided
          //   2.2 If `shouldUpdate` provided, use customize logic to update the field
          //       else to check if value changed
          if (namePathMatch || (!dependencies.length || namePath.length || shouldUpdate) && requireUpdate(shouldUpdate, prevStore, store, prevValue, curValue, info)) {
            _this.reRender();
            return;
          }
          break;
      }
      if (shouldUpdate === true) {
        _this.reRender();
      }
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "validateRules", function (options) {
      // We should fixed namePath & value to avoid developer change then by form function
      var namePath = _this.getNamePath();
      var currentValue = _this.getValue();
      var _ref2 = options || {},
        triggerName = _ref2.triggerName,
        _ref2$validateOnly = _ref2.validateOnly,
        validateOnly = _ref2$validateOnly === void 0 ? false : _ref2$validateOnly;

      // Force change to async to avoid rule OOD under renderProps field
      var rootPromise = Promise.resolve().then( /*#__PURE__*/(0, _asyncToGenerator2.default)( /*#__PURE__*/(0, _regeneratorRuntime2.default)().mark(function _callee() {
        var _this$props5, _this$props5$validate, validateFirst, messageVariables, validateDebounce, filteredRules, promise;
        return (0, _regeneratorRuntime2.default)().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (_this.mounted) {
                _context.next = 2;
                break;
              }
              return _context.abrupt("return", []);
            case 2:
              _this$props5 = _this.props, _this$props5$validate = _this$props5.validateFirst, validateFirst = _this$props5$validate === void 0 ? false : _this$props5$validate, messageVariables = _this$props5.messageVariables, validateDebounce = _this$props5.validateDebounce; // Start validate
              filteredRules = _this.getRules();
              if (triggerName) {
                filteredRules = filteredRules.filter(function (rule) {
                  return rule;
                }).filter(function (rule) {
                  var validateTrigger = rule.validateTrigger;
                  if (!validateTrigger) {
                    return true;
                  }
                  var triggerList = (0, _typeUtil.toArray)(validateTrigger);
                  return triggerList.includes(triggerName);
                });
              }

              // Wait for debounce. Skip if no `triggerName` since its from `validateFields / submit`
              if (!(validateDebounce && triggerName)) {
                _context.next = 10;
                break;
              }
              _context.next = 8;
              return new Promise(function (resolve) {
                setTimeout(resolve, validateDebounce);
              });
            case 8:
              if (!(_this.validatePromise !== rootPromise)) {
                _context.next = 10;
                break;
              }
              return _context.abrupt("return", []);
            case 10:
              promise = (0, _validateUtil.validateRules)(namePath, currentValue, filteredRules, options, validateFirst, messageVariables);
              promise.catch(function (e) {
                return e;
              }).then(function () {
                var ruleErrors = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : EMPTY_ERRORS;
                if (_this.validatePromise === rootPromise) {
                  var _ruleErrors$forEach;
                  _this.validatePromise = null;

                  // Get errors & warnings
                  var nextErrors = [];
                  var nextWarnings = [];
                  (_ruleErrors$forEach = ruleErrors.forEach) === null || _ruleErrors$forEach === void 0 || _ruleErrors$forEach.call(ruleErrors, function (_ref4) {
                    var warningOnly = _ref4.rule.warningOnly,
                      _ref4$errors = _ref4.errors,
                      errors = _ref4$errors === void 0 ? EMPTY_ERRORS : _ref4$errors;
                    if (warningOnly) {
                      nextWarnings.push.apply(nextWarnings, (0, _toConsumableArray2.default)(errors));
                    } else {
                      nextErrors.push.apply(nextErrors, (0, _toConsumableArray2.default)(errors));
                    }
                  });
                  _this.errors = nextErrors;
                  _this.warnings = nextWarnings;
                  _this.triggerMetaEvent();
                  _this.reRender();
                }
              });
              return _context.abrupt("return", promise);
            case 13:
            case "end":
              return _context.stop();
          }
        }, _callee);
      })));
      if (validateOnly) {
        return rootPromise;
      }
      _this.validatePromise = rootPromise;
      _this.dirty = true;
      _this.errors = EMPTY_ERRORS;
      _this.warnings = EMPTY_ERRORS;
      _this.triggerMetaEvent();

      // Force trigger re-render since we need sync renderProps with new meta
      _this.reRender();
      return rootPromise;
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "isFieldValidating", function () {
      return !!_this.validatePromise;
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "isFieldTouched", function () {
      return _this.touched;
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "isFieldDirty", function () {
      // Touched or validate or has initialValue
      if (_this.dirty || _this.props.initialValue !== undefined) {
        return true;
      }

      // Form set initialValue
      var fieldContext = _this.props.fieldContext;
      var _fieldContext$getInte = fieldContext.getInternalHooks(_FieldContext.HOOK_MARK),
        getInitialValue = _fieldContext$getInte.getInitialValue;
      if (getInitialValue(_this.getNamePath()) !== undefined) {
        return true;
      }
      return false;
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "getErrors", function () {
      return _this.errors;
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "getWarnings", function () {
      return _this.warnings;
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "isListField", function () {
      return _this.props.isListField;
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "isList", function () {
      return _this.props.isList;
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "isPreserve", function () {
      return _this.props.preserve;
    });
    // ============================= Child Component =============================
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "getMeta", function () {
      // Make error & validating in cache to save perf
      _this.prevValidating = _this.isFieldValidating();
      var meta = {
        touched: _this.isFieldTouched(),
        validating: _this.prevValidating,
        errors: _this.errors,
        warnings: _this.warnings,
        name: _this.getNamePath(),
        validated: _this.validatePromise === null
      };
      return meta;
    });
    // Only return validate child node. If invalidate, will do nothing about field.
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "getOnlyChild", function (children) {
      // Support render props
      if (typeof children === 'function') {
        var _meta2 = _this.getMeta();
        return (0, _objectSpread2.default)((0, _objectSpread2.default)({}, _this.getOnlyChild(children(_this.getControlled(), _meta2, _this.props.fieldContext))), {}, {
          isFunction: true
        });
      }

      // Filed element only
      var childList = (0, _toArray.default)(children);
      if (childList.length !== 1 || ! /*#__PURE__*/React.isValidElement(childList[0])) {
        return {
          child: childList,
          isFunction: false
        };
      }
      return {
        child: childList[0],
        isFunction: false
      };
    });
    // ============================== Field Control ==============================
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "getValue", function (store) {
      var getFieldsValue = _this.props.fieldContext.getFieldsValue;
      var namePath = _this.getNamePath();
      return (0, _valueUtil.getValue)(store || getFieldsValue(true), namePath);
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "getControlled", function () {
      var childProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _this$props6 = _this.props,
        name = _this$props6.name,
        trigger = _this$props6.trigger,
        validateTrigger = _this$props6.validateTrigger,
        getValueFromEvent = _this$props6.getValueFromEvent,
        normalize = _this$props6.normalize,
        valuePropName = _this$props6.valuePropName,
        getValueProps = _this$props6.getValueProps,
        fieldContext = _this$props6.fieldContext;
      var mergedValidateTrigger = validateTrigger !== undefined ? validateTrigger : fieldContext.validateTrigger;
      var namePath = _this.getNamePath();
      var getInternalHooks = fieldContext.getInternalHooks,
        getFieldsValue = fieldContext.getFieldsValue;
      var _getInternalHooks = getInternalHooks(_FieldContext.HOOK_MARK),
        dispatch = _getInternalHooks.dispatch;
      var value = _this.getValue();
      var mergedGetValueProps = getValueProps || function (val) {
        return (0, _defineProperty2.default)({}, valuePropName, val);
      };
      var originTriggerFunc = childProps[trigger];
      var valueProps = name !== undefined ? mergedGetValueProps(value) : {};

      // warning when prop value is function
      if ( true && valueProps) {
        Object.keys(valueProps).forEach(function (key) {
          (0, _warning.default)(typeof valueProps[key] !== 'function', "It's not recommended to generate dynamic function prop by `getValueProps`. Please pass it to child component directly (prop: ".concat(key, ")"));
        });
      }
      var control = (0, _objectSpread2.default)((0, _objectSpread2.default)({}, childProps), valueProps);

      // Add trigger
      control[trigger] = function () {
        // Mark as touched
        _this.touched = true;
        _this.dirty = true;
        _this.triggerMetaEvent();
        var newValue;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        if (getValueFromEvent) {
          newValue = getValueFromEvent.apply(void 0, args);
        } else {
          newValue = _valueUtil.defaultGetValueFromEvent.apply(void 0, [valuePropName].concat(args));
        }
        if (normalize) {
          newValue = normalize(newValue, value, getFieldsValue(true));
        }
        dispatch({
          type: 'updateValue',
          namePath: namePath,
          value: newValue
        });
        if (originTriggerFunc) {
          originTriggerFunc.apply(void 0, args);
        }
      };

      // Add validateTrigger
      var validateTriggerList = (0, _typeUtil.toArray)(mergedValidateTrigger || []);
      validateTriggerList.forEach(function (triggerName) {
        // Wrap additional function of component, so that we can get latest value from store
        var originTrigger = control[triggerName];
        control[triggerName] = function () {
          if (originTrigger) {
            originTrigger.apply(void 0, arguments);
          }

          // Always use latest rules
          var rules = _this.props.rules;
          if (rules && rules.length) {
            // We dispatch validate to root,
            // since it will update related data with other field with same name
            dispatch({
              type: 'validateField',
              namePath: namePath,
              triggerName: triggerName
            });
          }
        };
      });
      return control;
    });
    if (props.fieldContext) {
      var getInternalHooks = props.fieldContext.getInternalHooks;
      var _getInternalHooks2 = getInternalHooks(_FieldContext.HOOK_MARK),
        initEntityValue = _getInternalHooks2.initEntityValue;
      initEntityValue((0, _assertThisInitialized2.default)(_this));
    }
    return _this;
  }
  (0, _createClass2.default)(Field, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this$props7 = this.props,
        shouldUpdate = _this$props7.shouldUpdate,
        fieldContext = _this$props7.fieldContext;
      this.mounted = true;

      // Register on init
      if (fieldContext) {
        var getInternalHooks = fieldContext.getInternalHooks;
        var _getInternalHooks3 = getInternalHooks(_FieldContext.HOOK_MARK),
          registerField = _getInternalHooks3.registerField;
        this.cancelRegisterFunc = registerField(this);
      }

      // One more render for component in case fields not ready
      if (shouldUpdate === true) {
        this.reRender();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.cancelRegister();
      this.triggerMetaEvent(true);
      this.mounted = false;
    }
  }, {
    key: "reRender",
    value: function reRender() {
      if (!this.mounted) return;
      this.forceUpdate();
    }
  }, {
    key: "render",
    value: function render() {
      var resetCount = this.state.resetCount;
      var children = this.props.children;
      var _this$getOnlyChild = this.getOnlyChild(children),
        child = _this$getOnlyChild.child,
        isFunction = _this$getOnlyChild.isFunction;

      // Not need to `cloneElement` since user can handle this in render function self
      var returnChildNode;
      if (isFunction) {
        returnChildNode = child;
      } else if ( /*#__PURE__*/React.isValidElement(child)) {
        returnChildNode = /*#__PURE__*/React.cloneElement(child, this.getControlled(child.props));
      } else {
        (0, _warning.default)(!child, '`children` of Field is not validate ReactElement.');
        returnChildNode = child;
      }
      return /*#__PURE__*/React.createElement(React.Fragment, {
        key: resetCount
      }, returnChildNode);
    }
  }]);
  return Field;
}(React.Component);
(0, _defineProperty2.default)(Field, "contextType", _FieldContext.default);
(0, _defineProperty2.default)(Field, "defaultProps", {
  trigger: 'onChange',
  valuePropName: 'value'
});
function WrapperField(_ref6) {
  var name = _ref6.name,
    restProps = (0, _objectWithoutProperties2.default)(_ref6, _excluded);
  var fieldContext = React.useContext(_FieldContext.default);
  var listContext = React.useContext(_ListContext.default);
  var namePath = name !== undefined ? (0, _valueUtil.getNamePath)(name) : undefined;
  var key = 'keep';
  if (!restProps.isListField) {
    key = "_".concat((namePath || []).join('_'));
  }

  // Warning if it's a directly list field.
  // We can still support multiple level field preserve.
  if ( true && restProps.preserve === false && restProps.isListField && namePath.length <= 1) {
    (0, _warning.default)(false, '`preserve` should not apply on Form.List fields.');
  }
  return /*#__PURE__*/React.createElement(Field, (0, _extends2.default)({
    key: key,
    name: namePath,
    isListField: !!listContext
  }, restProps, {
    fieldContext: fieldContext
  }));
}
var _default = exports["default"] = WrapperField;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/FieldContext.js":
/*!*********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/FieldContext.js ***!
  \*********************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.HOOK_MARK = void 0;
var _warning = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/warning */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/warning.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var HOOK_MARK = exports.HOOK_MARK = 'RC_FORM_INTERNAL_HOOKS';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
var warningFunc = function warningFunc() {
  (0, _warning.default)(false, 'Can not find FormContext. Please make sure you wrap Field under Form.');
};
var Context = /*#__PURE__*/React.createContext({
  getFieldValue: warningFunc,
  getFieldsValue: warningFunc,
  getFieldError: warningFunc,
  getFieldWarning: warningFunc,
  getFieldsError: warningFunc,
  isFieldsTouched: warningFunc,
  isFieldTouched: warningFunc,
  isFieldValidating: warningFunc,
  isFieldsValidating: warningFunc,
  resetFields: warningFunc,
  setFields: warningFunc,
  setFieldValue: warningFunc,
  setFieldsValue: warningFunc,
  validateFields: warningFunc,
  submit: warningFunc,
  getInternalHooks: function getInternalHooks() {
    warningFunc();
    return {
      dispatch: warningFunc,
      initEntityValue: warningFunc,
      registerField: warningFunc,
      useSubscribe: warningFunc,
      setInitialValues: warningFunc,
      destroyForm: warningFunc,
      setCallbacks: warningFunc,
      registerWatch: warningFunc,
      getFields: warningFunc,
      setValidateMessages: warningFunc,
      setPreserve: warningFunc,
      getInitialValue: warningFunc
    };
  }
});
var _default = exports["default"] = Context;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/Form.js":
/*!*************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/Form.js ***!
  \*************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/extends */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/extends.js"));
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectWithoutProperties.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _useForm3 = _interopRequireDefault(__webpack_require__(/*! ./useForm */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/useForm.js"));
var _FieldContext = _interopRequireWildcard(__webpack_require__(/*! ./FieldContext */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/FieldContext.js"));
var _FormContext = _interopRequireDefault(__webpack_require__(/*! ./FormContext */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/FormContext.js"));
var _valueUtil = __webpack_require__(/*! ./utils/valueUtil */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/valueUtil.js");
var _ListContext = _interopRequireDefault(__webpack_require__(/*! ./ListContext */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/ListContext.js"));
var _excluded = ["name", "initialValues", "fields", "form", "preserve", "children", "component", "validateMessages", "validateTrigger", "onValuesChange", "onFieldsChange", "onFinish", "onFinishFailed", "clearOnDestroy"];
var Form = function Form(_ref, ref) {
  var name = _ref.name,
    initialValues = _ref.initialValues,
    fields = _ref.fields,
    form = _ref.form,
    preserve = _ref.preserve,
    children = _ref.children,
    _ref$component = _ref.component,
    Component = _ref$component === void 0 ? 'form' : _ref$component,
    validateMessages = _ref.validateMessages,
    _ref$validateTrigger = _ref.validateTrigger,
    validateTrigger = _ref$validateTrigger === void 0 ? 'onChange' : _ref$validateTrigger,
    onValuesChange = _ref.onValuesChange,
    _onFieldsChange = _ref.onFieldsChange,
    _onFinish = _ref.onFinish,
    onFinishFailed = _ref.onFinishFailed,
    clearOnDestroy = _ref.clearOnDestroy,
    restProps = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  var nativeElementRef = React.useRef(null);
  var formContext = React.useContext(_FormContext.default);

  // We customize handle event since Context will makes all the consumer re-render:
  // https://reactjs.org/docs/context.html#contextprovider
  var _useForm = (0, _useForm3.default)(form),
    _useForm2 = (0, _slicedToArray2.default)(_useForm, 1),
    formInstance = _useForm2[0];
  var _getInternalHooks = formInstance.getInternalHooks(_FieldContext.HOOK_MARK),
    useSubscribe = _getInternalHooks.useSubscribe,
    setInitialValues = _getInternalHooks.setInitialValues,
    setCallbacks = _getInternalHooks.setCallbacks,
    setValidateMessages = _getInternalHooks.setValidateMessages,
    setPreserve = _getInternalHooks.setPreserve,
    destroyForm = _getInternalHooks.destroyForm;

  // Pass ref with form instance
  React.useImperativeHandle(ref, function () {
    return (0, _objectSpread2.default)((0, _objectSpread2.default)({}, formInstance), {}, {
      nativeElement: nativeElementRef.current
    });
  });

  // Register form into Context
  React.useEffect(function () {
    formContext.registerForm(name, formInstance);
    return function () {
      formContext.unregisterForm(name);
    };
  }, [formContext, formInstance, name]);

  // Pass props to store
  setValidateMessages((0, _objectSpread2.default)((0, _objectSpread2.default)({}, formContext.validateMessages), validateMessages));
  setCallbacks({
    onValuesChange: onValuesChange,
    onFieldsChange: function onFieldsChange(changedFields) {
      formContext.triggerFormChange(name, changedFields);
      if (_onFieldsChange) {
        for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          rest[_key - 1] = arguments[_key];
        }
        _onFieldsChange.apply(void 0, [changedFields].concat(rest));
      }
    },
    onFinish: function onFinish(values) {
      formContext.triggerFormFinish(name, values);
      if (_onFinish) {
        _onFinish(values);
      }
    },
    onFinishFailed: onFinishFailed
  });
  setPreserve(preserve);

  // Set initial value, init store value when first mount
  var mountRef = React.useRef(null);
  setInitialValues(initialValues, !mountRef.current);
  if (!mountRef.current) {
    mountRef.current = true;
  }
  React.useEffect(function () {
    return function () {
      return destroyForm(clearOnDestroy);
    };
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  // Prepare children by `children` type
  var childrenNode;
  var childrenRenderProps = typeof children === 'function';
  if (childrenRenderProps) {
    var _values = formInstance.getFieldsValue(true);
    childrenNode = children(_values, formInstance);
  } else {
    childrenNode = children;
  }

  // Not use subscribe when using render props
  useSubscribe(!childrenRenderProps);

  // Listen if fields provided. We use ref to save prev data here to avoid additional render
  var prevFieldsRef = React.useRef();
  React.useEffect(function () {
    if (!(0, _valueUtil.isSimilar)(prevFieldsRef.current || [], fields || [])) {
      formInstance.setFields(fields || []);
    }
    prevFieldsRef.current = fields;
  }, [fields, formInstance]);
  var formContextValue = React.useMemo(function () {
    return (0, _objectSpread2.default)((0, _objectSpread2.default)({}, formInstance), {}, {
      validateTrigger: validateTrigger
    });
  }, [formInstance, validateTrigger]);
  var wrapperNode = /*#__PURE__*/React.createElement(_ListContext.default.Provider, {
    value: null
  }, /*#__PURE__*/React.createElement(_FieldContext.default.Provider, {
    value: formContextValue
  }, childrenNode));
  if (Component === false) {
    return wrapperNode;
  }
  return /*#__PURE__*/React.createElement(Component, (0, _extends2.default)({}, restProps, {
    ref: nativeElementRef,
    onSubmit: function onSubmit(event) {
      event.preventDefault();
      event.stopPropagation();
      formInstance.submit();
    },
    onReset: function onReset(event) {
      var _restProps$onReset;
      event.preventDefault();
      formInstance.resetFields();
      (_restProps$onReset = restProps.onReset) === null || _restProps$onReset === void 0 || _restProps$onReset.call(restProps, event);
    }
  }), wrapperNode);
};
var _default = exports["default"] = Form;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/FormContext.js":
/*!********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/FormContext.js ***!
  \********************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.FormProvider = void 0;
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/defineProperty.js"));
var _objectSpread3 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var FormContext = /*#__PURE__*/React.createContext({
  triggerFormChange: function triggerFormChange() {},
  triggerFormFinish: function triggerFormFinish() {},
  registerForm: function registerForm() {},
  unregisterForm: function unregisterForm() {}
});
var FormProvider = exports.FormProvider = function FormProvider(_ref) {
  var validateMessages = _ref.validateMessages,
    onFormChange = _ref.onFormChange,
    onFormFinish = _ref.onFormFinish,
    children = _ref.children;
  var formContext = React.useContext(FormContext);
  var formsRef = React.useRef({});
  return /*#__PURE__*/React.createElement(FormContext.Provider, {
    value: (0, _objectSpread3.default)((0, _objectSpread3.default)({}, formContext), {}, {
      validateMessages: (0, _objectSpread3.default)((0, _objectSpread3.default)({}, formContext.validateMessages), validateMessages),
      // =========================================================
      // =                  Global Form Control                  =
      // =========================================================
      triggerFormChange: function triggerFormChange(name, changedFields) {
        if (onFormChange) {
          onFormChange(name, {
            changedFields: changedFields,
            forms: formsRef.current
          });
        }
        formContext.triggerFormChange(name, changedFields);
      },
      triggerFormFinish: function triggerFormFinish(name, values) {
        if (onFormFinish) {
          onFormFinish(name, {
            values: values,
            forms: formsRef.current
          });
        }
        formContext.triggerFormFinish(name, values);
      },
      registerForm: function registerForm(name, form) {
        if (name) {
          formsRef.current = (0, _objectSpread3.default)((0, _objectSpread3.default)({}, formsRef.current), {}, (0, _defineProperty2.default)({}, name, form));
        }
        formContext.registerForm(name, form);
      },
      unregisterForm: function unregisterForm(name) {
        var newForms = (0, _objectSpread3.default)({}, formsRef.current);
        delete newForms[name];
        formsRef.current = newForms;
        formContext.unregisterForm(name);
      }
    })
  }, children);
};
var _default = exports["default"] = FormContext;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/List.js":
/*!*************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/List.js ***!
  \*************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/toConsumableArray.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _warning = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/warning */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/warning.js"));
var _FieldContext = _interopRequireDefault(__webpack_require__(/*! ./FieldContext */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/FieldContext.js"));
var _Field = _interopRequireDefault(__webpack_require__(/*! ./Field */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/Field.js"));
var _valueUtil = __webpack_require__(/*! ./utils/valueUtil */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/valueUtil.js");
var _ListContext = _interopRequireDefault(__webpack_require__(/*! ./ListContext */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/ListContext.js"));
function List(_ref) {
  var name = _ref.name,
    initialValue = _ref.initialValue,
    children = _ref.children,
    rules = _ref.rules,
    validateTrigger = _ref.validateTrigger,
    isListField = _ref.isListField;
  var context = React.useContext(_FieldContext.default);
  var wrapperListContext = React.useContext(_ListContext.default);
  var keyRef = React.useRef({
    keys: [],
    id: 0
  });
  var keyManager = keyRef.current;
  var prefixName = React.useMemo(function () {
    var parentPrefixName = (0, _valueUtil.getNamePath)(context.prefixName) || [];
    return [].concat((0, _toConsumableArray2.default)(parentPrefixName), (0, _toConsumableArray2.default)((0, _valueUtil.getNamePath)(name)));
  }, [context.prefixName, name]);
  var fieldContext = React.useMemo(function () {
    return (0, _objectSpread2.default)((0, _objectSpread2.default)({}, context), {}, {
      prefixName: prefixName
    });
  }, [context, prefixName]);

  // List context
  var listContext = React.useMemo(function () {
    return {
      getKey: function getKey(namePath) {
        var len = prefixName.length;
        var pathName = namePath[len];
        return [keyManager.keys[pathName], namePath.slice(len + 1)];
      }
    };
  }, [prefixName]);

  // User should not pass `children` as other type.
  if (typeof children !== 'function') {
    (0, _warning.default)(false, 'Form.List only accepts function as children.');
    return null;
  }
  var shouldUpdate = function shouldUpdate(prevValue, nextValue, _ref2) {
    var source = _ref2.source;
    if (source === 'internal') {
      return false;
    }
    return prevValue !== nextValue;
  };
  return /*#__PURE__*/React.createElement(_ListContext.default.Provider, {
    value: listContext
  }, /*#__PURE__*/React.createElement(_FieldContext.default.Provider, {
    value: fieldContext
  }, /*#__PURE__*/React.createElement(_Field.default, {
    name: [],
    shouldUpdate: shouldUpdate,
    rules: rules,
    validateTrigger: validateTrigger,
    initialValue: initialValue,
    isList: true,
    isListField: isListField !== null && isListField !== void 0 ? isListField : !!wrapperListContext
  }, function (_ref3, meta) {
    var _ref3$value = _ref3.value,
      value = _ref3$value === void 0 ? [] : _ref3$value,
      onChange = _ref3.onChange;
    var getFieldValue = context.getFieldValue;
    var getNewValue = function getNewValue() {
      var values = getFieldValue(prefixName || []);
      return values || [];
    };
    /**
     * Always get latest value in case user update fields by `form` api.
     */
    var operations = {
      add: function add(defaultValue, index) {
        // Mapping keys
        var newValue = getNewValue();
        if (index >= 0 && index <= newValue.length) {
          keyManager.keys = [].concat((0, _toConsumableArray2.default)(keyManager.keys.slice(0, index)), [keyManager.id], (0, _toConsumableArray2.default)(keyManager.keys.slice(index)));
          onChange([].concat((0, _toConsumableArray2.default)(newValue.slice(0, index)), [defaultValue], (0, _toConsumableArray2.default)(newValue.slice(index))));
        } else {
          if ( true && (index < 0 || index > newValue.length)) {
            (0, _warning.default)(false, 'The second parameter of the add function should be a valid positive number.');
          }
          keyManager.keys = [].concat((0, _toConsumableArray2.default)(keyManager.keys), [keyManager.id]);
          onChange([].concat((0, _toConsumableArray2.default)(newValue), [defaultValue]));
        }
        keyManager.id += 1;
      },
      remove: function remove(index) {
        var newValue = getNewValue();
        var indexSet = new Set(Array.isArray(index) ? index : [index]);
        if (indexSet.size <= 0) {
          return;
        }
        keyManager.keys = keyManager.keys.filter(function (_, keysIndex) {
          return !indexSet.has(keysIndex);
        });

        // Trigger store change
        onChange(newValue.filter(function (_, valueIndex) {
          return !indexSet.has(valueIndex);
        }));
      },
      move: function move(from, to) {
        if (from === to) {
          return;
        }
        var newValue = getNewValue();

        // Do not handle out of range
        if (from < 0 || from >= newValue.length || to < 0 || to >= newValue.length) {
          return;
        }
        keyManager.keys = (0, _valueUtil.move)(keyManager.keys, from, to);

        // Trigger store change
        onChange((0, _valueUtil.move)(newValue, from, to));
      }
    };
    var listValue = value || [];
    if (!Array.isArray(listValue)) {
      listValue = [];
      if (true) {
        (0, _warning.default)(false, "Current value of '".concat(prefixName.join(' > '), "' is not an array type."));
      }
    }
    return children(listValue.map(function (__, index) {
      var key = keyManager.keys[index];
      if (key === undefined) {
        keyManager.keys[index] = keyManager.id;
        key = keyManager.keys[index];
        keyManager.id += 1;
      }
      return {
        name: index,
        key: key,
        isListField: true
      };
    }), operations, meta);
  })));
}
var _default = exports["default"] = List;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/ListContext.js":
/*!********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/ListContext.js ***!
  \********************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var ListContext = /*#__PURE__*/React.createContext(null);
var _default = exports["default"] = ListContext;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/index.js":
/*!**************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/index.js ***!
  \**************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "Field", ({
  enumerable: true,
  get: function get() {
    return _Field.default;
  }
}));
Object.defineProperty(exports, "FieldContext", ({
  enumerable: true,
  get: function get() {
    return _FieldContext.default;
  }
}));
Object.defineProperty(exports, "FormProvider", ({
  enumerable: true,
  get: function get() {
    return _FormContext.FormProvider;
  }
}));
Object.defineProperty(exports, "List", ({
  enumerable: true,
  get: function get() {
    return _List.default;
  }
}));
Object.defineProperty(exports, "ListContext", ({
  enumerable: true,
  get: function get() {
    return _ListContext.default;
  }
}));
exports["default"] = void 0;
Object.defineProperty(exports, "useForm", ({
  enumerable: true,
  get: function get() {
    return _useForm.default;
  }
}));
Object.defineProperty(exports, "useWatch", ({
  enumerable: true,
  get: function get() {
    return _useWatch.default;
  }
}));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _Field = _interopRequireDefault(__webpack_require__(/*! ./Field */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/Field.js"));
var _List = _interopRequireDefault(__webpack_require__(/*! ./List */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/List.js"));
var _useForm = _interopRequireDefault(__webpack_require__(/*! ./useForm */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/useForm.js"));
var _Form = _interopRequireDefault(__webpack_require__(/*! ./Form */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/Form.js"));
var _FormContext = __webpack_require__(/*! ./FormContext */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/FormContext.js");
var _FieldContext = _interopRequireDefault(__webpack_require__(/*! ./FieldContext */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/FieldContext.js"));
var _ListContext = _interopRequireDefault(__webpack_require__(/*! ./ListContext */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/ListContext.js"));
var _useWatch = _interopRequireDefault(__webpack_require__(/*! ./useWatch */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/useWatch.js"));
var InternalForm = /*#__PURE__*/React.forwardRef(_Form.default);
var RefForm = InternalForm;
RefForm.FormProvider = _FormContext.FormProvider;
RefForm.Field = _Field.default;
RefForm.List = _List.default;
RefForm.useForm = _useForm.default;
RefForm.useWatch = _useWatch.default;
var _default = exports["default"] = RefForm;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/useForm.js":
/*!****************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/useForm.js ***!
  \****************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.FormStore = void 0;
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectWithoutProperties.js"));
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/toConsumableArray.js"));
var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/createClass.js"));
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/defineProperty.js"));
var _set = __webpack_require__(/*! rc-util/lib/utils/set */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/utils/set.js");
var _warning = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/warning */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/warning.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _FieldContext = __webpack_require__(/*! ./FieldContext */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/FieldContext.js");
var _asyncUtil = __webpack_require__(/*! ./utils/asyncUtil */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/asyncUtil.js");
var _messages = __webpack_require__(/*! ./utils/messages */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/messages.js");
var _NameMap = _interopRequireDefault(__webpack_require__(/*! ./utils/NameMap */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/NameMap.js"));
var _valueUtil = __webpack_require__(/*! ./utils/valueUtil */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/valueUtil.js");
var _excluded = ["name"];
var FormStore = exports.FormStore = /*#__PURE__*/(0, _createClass2.default)(function FormStore(forceRootUpdate) {
  var _this = this;
  (0, _classCallCheck2.default)(this, FormStore);
  (0, _defineProperty2.default)(this, "formHooked", false);
  (0, _defineProperty2.default)(this, "forceRootUpdate", void 0);
  (0, _defineProperty2.default)(this, "subscribable", true);
  (0, _defineProperty2.default)(this, "store", {});
  (0, _defineProperty2.default)(this, "fieldEntities", []);
  (0, _defineProperty2.default)(this, "initialValues", {});
  (0, _defineProperty2.default)(this, "callbacks", {});
  (0, _defineProperty2.default)(this, "validateMessages", null);
  (0, _defineProperty2.default)(this, "preserve", null);
  (0, _defineProperty2.default)(this, "lastValidatePromise", null);
  (0, _defineProperty2.default)(this, "getForm", function () {
    return {
      getFieldValue: _this.getFieldValue,
      getFieldsValue: _this.getFieldsValue,
      getFieldError: _this.getFieldError,
      getFieldWarning: _this.getFieldWarning,
      getFieldsError: _this.getFieldsError,
      isFieldsTouched: _this.isFieldsTouched,
      isFieldTouched: _this.isFieldTouched,
      isFieldValidating: _this.isFieldValidating,
      isFieldsValidating: _this.isFieldsValidating,
      resetFields: _this.resetFields,
      setFields: _this.setFields,
      setFieldValue: _this.setFieldValue,
      setFieldsValue: _this.setFieldsValue,
      validateFields: _this.validateFields,
      submit: _this.submit,
      _init: true,
      getInternalHooks: _this.getInternalHooks
    };
  });
  // ======================== Internal Hooks ========================
  (0, _defineProperty2.default)(this, "getInternalHooks", function (key) {
    if (key === _FieldContext.HOOK_MARK) {
      _this.formHooked = true;
      return {
        dispatch: _this.dispatch,
        initEntityValue: _this.initEntityValue,
        registerField: _this.registerField,
        useSubscribe: _this.useSubscribe,
        setInitialValues: _this.setInitialValues,
        destroyForm: _this.destroyForm,
        setCallbacks: _this.setCallbacks,
        setValidateMessages: _this.setValidateMessages,
        getFields: _this.getFields,
        setPreserve: _this.setPreserve,
        getInitialValue: _this.getInitialValue,
        registerWatch: _this.registerWatch
      };
    }
    (0, _warning.default)(false, '`getInternalHooks` is internal usage. Should not call directly.');
    return null;
  });
  (0, _defineProperty2.default)(this, "useSubscribe", function (subscribable) {
    _this.subscribable = subscribable;
  });
  /**
   * Record prev Form unmount fieldEntities which config preserve false.
   * This need to be refill with initialValues instead of store value.
   */
  (0, _defineProperty2.default)(this, "prevWithoutPreserves", null);
  /**
   * First time `setInitialValues` should update store with initial value
   */
  (0, _defineProperty2.default)(this, "setInitialValues", function (initialValues, init) {
    _this.initialValues = initialValues || {};
    if (init) {
      var _this$prevWithoutPres;
      var nextStore = (0, _set.merge)(initialValues, _this.store);

      // We will take consider prev form unmount fields.
      // When the field is not `preserve`, we need fill this with initialValues instead of store.
      // eslint-disable-next-line array-callback-return
      (_this$prevWithoutPres = _this.prevWithoutPreserves) === null || _this$prevWithoutPres === void 0 || _this$prevWithoutPres.map(function (_ref) {
        var namePath = _ref.key;
        nextStore = (0, _valueUtil.setValue)(nextStore, namePath, (0, _valueUtil.getValue)(initialValues, namePath));
      });
      _this.prevWithoutPreserves = null;
      _this.updateStore(nextStore);
    }
  });
  (0, _defineProperty2.default)(this, "destroyForm", function (clearOnDestroy) {
    if (clearOnDestroy) {
      // destroy form reset store
      _this.updateStore({});
    } else {
      // Fill preserve fields
      var prevWithoutPreserves = new _NameMap.default();
      _this.getFieldEntities(true).forEach(function (entity) {
        if (!_this.isMergedPreserve(entity.isPreserve())) {
          prevWithoutPreserves.set(entity.getNamePath(), true);
        }
      });
      _this.prevWithoutPreserves = prevWithoutPreserves;
    }
  });
  (0, _defineProperty2.default)(this, "getInitialValue", function (namePath) {
    var initValue = (0, _valueUtil.getValue)(_this.initialValues, namePath);

    // Not cloneDeep when without `namePath`
    return namePath.length ? (0, _set.merge)(initValue) : initValue;
  });
  (0, _defineProperty2.default)(this, "setCallbacks", function (callbacks) {
    _this.callbacks = callbacks;
  });
  (0, _defineProperty2.default)(this, "setValidateMessages", function (validateMessages) {
    _this.validateMessages = validateMessages;
  });
  (0, _defineProperty2.default)(this, "setPreserve", function (preserve) {
    _this.preserve = preserve;
  });
  // ============================= Watch ============================
  (0, _defineProperty2.default)(this, "watchList", []);
  (0, _defineProperty2.default)(this, "registerWatch", function (callback) {
    _this.watchList.push(callback);
    return function () {
      _this.watchList = _this.watchList.filter(function (fn) {
        return fn !== callback;
      });
    };
  });
  (0, _defineProperty2.default)(this, "notifyWatch", function () {
    var namePath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    // No need to cost perf when nothing need to watch
    if (_this.watchList.length) {
      var values = _this.getFieldsValue();
      var allValues = _this.getFieldsValue(true);
      _this.watchList.forEach(function (callback) {
        callback(values, allValues, namePath);
      });
    }
  });
  // ========================== Dev Warning =========================
  (0, _defineProperty2.default)(this, "timeoutId", null);
  (0, _defineProperty2.default)(this, "warningUnhooked", function () {
    if ( true && !_this.timeoutId && typeof window !== 'undefined') {
      _this.timeoutId = setTimeout(function () {
        _this.timeoutId = null;
        if (!_this.formHooked) {
          (0, _warning.default)(false, 'Instance created by `useForm` is not connected to any Form element. Forget to pass `form` prop?');
        }
      });
    }
  });
  // ============================ Store =============================
  (0, _defineProperty2.default)(this, "updateStore", function (nextStore) {
    _this.store = nextStore;
  });
  // ============================ Fields ============================
  /**
   * Get registered field entities.
   * @param pure Only return field which has a `name`. Default: false
   */
  (0, _defineProperty2.default)(this, "getFieldEntities", function () {
    var pure = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    if (!pure) {
      return _this.fieldEntities;
    }
    return _this.fieldEntities.filter(function (field) {
      return field.getNamePath().length;
    });
  });
  (0, _defineProperty2.default)(this, "getFieldsMap", function () {
    var pure = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var cache = new _NameMap.default();
    _this.getFieldEntities(pure).forEach(function (field) {
      var namePath = field.getNamePath();
      cache.set(namePath, field);
    });
    return cache;
  });
  (0, _defineProperty2.default)(this, "getFieldEntitiesForNamePathList", function (nameList) {
    if (!nameList) {
      return _this.getFieldEntities(true);
    }
    var cache = _this.getFieldsMap(true);
    return nameList.map(function (name) {
      var namePath = (0, _valueUtil.getNamePath)(name);
      return cache.get(namePath) || {
        INVALIDATE_NAME_PATH: (0, _valueUtil.getNamePath)(name)
      };
    });
  });
  (0, _defineProperty2.default)(this, "getFieldsValue", function (nameList, filterFunc) {
    _this.warningUnhooked();

    // Fill args
    var mergedNameList;
    var mergedFilterFunc;
    var mergedStrict;
    if (nameList === true || Array.isArray(nameList)) {
      mergedNameList = nameList;
      mergedFilterFunc = filterFunc;
    } else if (nameList && (0, _typeof2.default)(nameList) === 'object') {
      mergedStrict = nameList.strict;
      mergedFilterFunc = nameList.filter;
    }
    if (mergedNameList === true && !mergedFilterFunc) {
      return _this.store;
    }
    var fieldEntities = _this.getFieldEntitiesForNamePathList(Array.isArray(mergedNameList) ? mergedNameList : null);
    var filteredNameList = [];
    fieldEntities.forEach(function (entity) {
      var _isListField, _ref3;
      var namePath = 'INVALIDATE_NAME_PATH' in entity ? entity.INVALIDATE_NAME_PATH : entity.getNamePath();

      // Ignore when it's a list item and not specific the namePath,
      // since parent field is already take in count
      if (mergedStrict) {
        var _isList, _ref2;
        if ((_isList = (_ref2 = entity).isList) !== null && _isList !== void 0 && _isList.call(_ref2)) {
          return;
        }
      } else if (!mergedNameList && (_isListField = (_ref3 = entity).isListField) !== null && _isListField !== void 0 && _isListField.call(_ref3)) {
        return;
      }
      if (!mergedFilterFunc) {
        filteredNameList.push(namePath);
      } else {
        var meta = 'getMeta' in entity ? entity.getMeta() : null;
        if (mergedFilterFunc(meta)) {
          filteredNameList.push(namePath);
        }
      }
    });
    return (0, _valueUtil.cloneByNamePathList)(_this.store, filteredNameList.map(_valueUtil.getNamePath));
  });
  (0, _defineProperty2.default)(this, "getFieldValue", function (name) {
    _this.warningUnhooked();
    var namePath = (0, _valueUtil.getNamePath)(name);
    return (0, _valueUtil.getValue)(_this.store, namePath);
  });
  (0, _defineProperty2.default)(this, "getFieldsError", function (nameList) {
    _this.warningUnhooked();
    var fieldEntities = _this.getFieldEntitiesForNamePathList(nameList);
    return fieldEntities.map(function (entity, index) {
      if (entity && !('INVALIDATE_NAME_PATH' in entity)) {
        return {
          name: entity.getNamePath(),
          errors: entity.getErrors(),
          warnings: entity.getWarnings()
        };
      }
      return {
        name: (0, _valueUtil.getNamePath)(nameList[index]),
        errors: [],
        warnings: []
      };
    });
  });
  (0, _defineProperty2.default)(this, "getFieldError", function (name) {
    _this.warningUnhooked();
    var namePath = (0, _valueUtil.getNamePath)(name);
    var fieldError = _this.getFieldsError([namePath])[0];
    return fieldError.errors;
  });
  (0, _defineProperty2.default)(this, "getFieldWarning", function (name) {
    _this.warningUnhooked();
    var namePath = (0, _valueUtil.getNamePath)(name);
    var fieldError = _this.getFieldsError([namePath])[0];
    return fieldError.warnings;
  });
  (0, _defineProperty2.default)(this, "isFieldsTouched", function () {
    _this.warningUnhooked();
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var arg0 = args[0],
      arg1 = args[1];
    var namePathList;
    var isAllFieldsTouched = false;
    if (args.length === 0) {
      namePathList = null;
    } else if (args.length === 1) {
      if (Array.isArray(arg0)) {
        namePathList = arg0.map(_valueUtil.getNamePath);
        isAllFieldsTouched = false;
      } else {
        namePathList = null;
        isAllFieldsTouched = arg0;
      }
    } else {
      namePathList = arg0.map(_valueUtil.getNamePath);
      isAllFieldsTouched = arg1;
    }
    var fieldEntities = _this.getFieldEntities(true);
    var isFieldTouched = function isFieldTouched(field) {
      return field.isFieldTouched();
    };

    // ===== Will get fully compare when not config namePathList =====
    if (!namePathList) {
      return isAllFieldsTouched ? fieldEntities.every(function (entity) {
        return isFieldTouched(entity) || entity.isList();
      }) : fieldEntities.some(isFieldTouched);
    }

    // Generate a nest tree for validate
    var map = new _NameMap.default();
    namePathList.forEach(function (shortNamePath) {
      map.set(shortNamePath, []);
    });
    fieldEntities.forEach(function (field) {
      var fieldNamePath = field.getNamePath();

      // Find matched entity and put into list
      namePathList.forEach(function (shortNamePath) {
        if (shortNamePath.every(function (nameUnit, i) {
          return fieldNamePath[i] === nameUnit;
        })) {
          map.update(shortNamePath, function (list) {
            return [].concat((0, _toConsumableArray2.default)(list), [field]);
          });
        }
      });
    });

    // Check if NameMap value is touched
    var isNamePathListTouched = function isNamePathListTouched(entities) {
      return entities.some(isFieldTouched);
    };
    var namePathListEntities = map.map(function (_ref4) {
      var value = _ref4.value;
      return value;
    });
    return isAllFieldsTouched ? namePathListEntities.every(isNamePathListTouched) : namePathListEntities.some(isNamePathListTouched);
  });
  (0, _defineProperty2.default)(this, "isFieldTouched", function (name) {
    _this.warningUnhooked();
    return _this.isFieldsTouched([name]);
  });
  (0, _defineProperty2.default)(this, "isFieldsValidating", function (nameList) {
    _this.warningUnhooked();
    var fieldEntities = _this.getFieldEntities();
    if (!nameList) {
      return fieldEntities.some(function (testField) {
        return testField.isFieldValidating();
      });
    }
    var namePathList = nameList.map(_valueUtil.getNamePath);
    return fieldEntities.some(function (testField) {
      var fieldNamePath = testField.getNamePath();
      return (0, _valueUtil.containsNamePath)(namePathList, fieldNamePath) && testField.isFieldValidating();
    });
  });
  (0, _defineProperty2.default)(this, "isFieldValidating", function (name) {
    _this.warningUnhooked();
    return _this.isFieldsValidating([name]);
  });
  /**
   * Reset Field with field `initialValue` prop.
   * Can pass `entities` or `namePathList` or just nothing.
   */
  (0, _defineProperty2.default)(this, "resetWithFieldInitialValue", function () {
    var info = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    // Create cache
    var cache = new _NameMap.default();
    var fieldEntities = _this.getFieldEntities(true);
    fieldEntities.forEach(function (field) {
      var initialValue = field.props.initialValue;
      var namePath = field.getNamePath();

      // Record only if has `initialValue`
      if (initialValue !== undefined) {
        var records = cache.get(namePath) || new Set();
        records.add({
          entity: field,
          value: initialValue
        });
        cache.set(namePath, records);
      }
    });

    // Reset
    var resetWithFields = function resetWithFields(entities) {
      entities.forEach(function (field) {
        var initialValue = field.props.initialValue;
        if (initialValue !== undefined) {
          var namePath = field.getNamePath();
          var formInitialValue = _this.getInitialValue(namePath);
          if (formInitialValue !== undefined) {
            // Warning if conflict with form initialValues and do not modify value
            (0, _warning.default)(false, "Form already set 'initialValues' with path '".concat(namePath.join('.'), "'. Field can not overwrite it."));
          } else {
            var records = cache.get(namePath);
            if (records && records.size > 1) {
              // Warning if multiple field set `initialValue`and do not modify value
              (0, _warning.default)(false, "Multiple Field with path '".concat(namePath.join('.'), "' set 'initialValue'. Can not decide which one to pick."));
            } else if (records) {
              var originValue = _this.getFieldValue(namePath);
              var isListField = field.isListField();

              // Set `initialValue`
              if (!isListField && (!info.skipExist || originValue === undefined)) {
                _this.updateStore((0, _valueUtil.setValue)(_this.store, namePath, (0, _toConsumableArray2.default)(records)[0].value));
              }
            }
          }
        }
      });
    };
    var requiredFieldEntities;
    if (info.entities) {
      requiredFieldEntities = info.entities;
    } else if (info.namePathList) {
      requiredFieldEntities = [];
      info.namePathList.forEach(function (namePath) {
        var records = cache.get(namePath);
        if (records) {
          var _requiredFieldEntitie;
          (_requiredFieldEntitie = requiredFieldEntities).push.apply(_requiredFieldEntitie, (0, _toConsumableArray2.default)((0, _toConsumableArray2.default)(records).map(function (r) {
            return r.entity;
          })));
        }
      });
    } else {
      requiredFieldEntities = fieldEntities;
    }
    resetWithFields(requiredFieldEntities);
  });
  (0, _defineProperty2.default)(this, "resetFields", function (nameList) {
    _this.warningUnhooked();
    var prevStore = _this.store;
    if (!nameList) {
      _this.updateStore((0, _set.merge)(_this.initialValues));
      _this.resetWithFieldInitialValue();
      _this.notifyObservers(prevStore, null, {
        type: 'reset'
      });
      _this.notifyWatch();
      return;
    }

    // Reset by `nameList`
    var namePathList = nameList.map(_valueUtil.getNamePath);
    namePathList.forEach(function (namePath) {
      var initialValue = _this.getInitialValue(namePath);
      _this.updateStore((0, _valueUtil.setValue)(_this.store, namePath, initialValue));
    });
    _this.resetWithFieldInitialValue({
      namePathList: namePathList
    });
    _this.notifyObservers(prevStore, namePathList, {
      type: 'reset'
    });
    _this.notifyWatch(namePathList);
  });
  (0, _defineProperty2.default)(this, "setFields", function (fields) {
    _this.warningUnhooked();
    var prevStore = _this.store;
    var namePathList = [];
    fields.forEach(function (fieldData) {
      var name = fieldData.name,
        data = (0, _objectWithoutProperties2.default)(fieldData, _excluded);
      var namePath = (0, _valueUtil.getNamePath)(name);
      namePathList.push(namePath);

      // Value
      if ('value' in data) {
        _this.updateStore((0, _valueUtil.setValue)(_this.store, namePath, data.value));
      }
      _this.notifyObservers(prevStore, [namePath], {
        type: 'setField',
        data: fieldData
      });
    });
    _this.notifyWatch(namePathList);
  });
  (0, _defineProperty2.default)(this, "getFields", function () {
    var entities = _this.getFieldEntities(true);
    var fields = entities.map(function (field) {
      var namePath = field.getNamePath();
      var meta = field.getMeta();
      var fieldData = (0, _objectSpread2.default)((0, _objectSpread2.default)({}, meta), {}, {
        name: namePath,
        value: _this.getFieldValue(namePath)
      });
      Object.defineProperty(fieldData, 'originRCField', {
        value: true
      });
      return fieldData;
    });
    return fields;
  });
  // =========================== Observer ===========================
  /**
   * This only trigger when a field is on constructor to avoid we get initialValue too late
   */
  (0, _defineProperty2.default)(this, "initEntityValue", function (entity) {
    var initialValue = entity.props.initialValue;
    if (initialValue !== undefined) {
      var namePath = entity.getNamePath();
      var prevValue = (0, _valueUtil.getValue)(_this.store, namePath);
      if (prevValue === undefined) {
        _this.updateStore((0, _valueUtil.setValue)(_this.store, namePath, initialValue));
      }
    }
  });
  (0, _defineProperty2.default)(this, "isMergedPreserve", function (fieldPreserve) {
    var mergedPreserve = fieldPreserve !== undefined ? fieldPreserve : _this.preserve;
    return mergedPreserve !== null && mergedPreserve !== void 0 ? mergedPreserve : true;
  });
  (0, _defineProperty2.default)(this, "registerField", function (entity) {
    _this.fieldEntities.push(entity);
    var namePath = entity.getNamePath();
    _this.notifyWatch([namePath]);

    // Set initial values
    if (entity.props.initialValue !== undefined) {
      var prevStore = _this.store;
      _this.resetWithFieldInitialValue({
        entities: [entity],
        skipExist: true
      });
      _this.notifyObservers(prevStore, [entity.getNamePath()], {
        type: 'valueUpdate',
        source: 'internal'
      });
    }

    // un-register field callback
    return function (isListField, preserve) {
      var subNamePath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      _this.fieldEntities = _this.fieldEntities.filter(function (item) {
        return item !== entity;
      });

      // Clean up store value if not preserve
      if (!_this.isMergedPreserve(preserve) && (!isListField || subNamePath.length > 1)) {
        var defaultValue = isListField ? undefined : _this.getInitialValue(namePath);
        if (namePath.length && _this.getFieldValue(namePath) !== defaultValue && _this.fieldEntities.every(function (field) {
          return (
            // Only reset when no namePath exist
            !(0, _valueUtil.matchNamePath)(field.getNamePath(), namePath)
          );
        })) {
          var _prevStore = _this.store;
          _this.updateStore((0, _valueUtil.setValue)(_prevStore, namePath, defaultValue, true));

          // Notify that field is unmount
          _this.notifyObservers(_prevStore, [namePath], {
            type: 'remove'
          });

          // Dependencies update
          _this.triggerDependenciesUpdate(_prevStore, namePath);
        }
      }
      _this.notifyWatch([namePath]);
    };
  });
  (0, _defineProperty2.default)(this, "dispatch", function (action) {
    switch (action.type) {
      case 'updateValue':
        {
          var namePath = action.namePath,
            value = action.value;
          _this.updateValue(namePath, value);
          break;
        }
      case 'validateField':
        {
          var _namePath = action.namePath,
            triggerName = action.triggerName;
          _this.validateFields([_namePath], {
            triggerName: triggerName
          });
          break;
        }
      default:
      // Currently we don't have other action. Do nothing.
    }
  });
  (0, _defineProperty2.default)(this, "notifyObservers", function (prevStore, namePathList, info) {
    if (_this.subscribable) {
      var mergedInfo = (0, _objectSpread2.default)((0, _objectSpread2.default)({}, info), {}, {
        store: _this.getFieldsValue(true)
      });
      _this.getFieldEntities().forEach(function (_ref5) {
        var onStoreChange = _ref5.onStoreChange;
        onStoreChange(prevStore, namePathList, mergedInfo);
      });
    } else {
      _this.forceRootUpdate();
    }
  });
  /**
   * Notify dependencies children with parent update
   * We need delay to trigger validate in case Field is under render props
   */
  (0, _defineProperty2.default)(this, "triggerDependenciesUpdate", function (prevStore, namePath) {
    var childrenFields = _this.getDependencyChildrenFields(namePath);
    if (childrenFields.length) {
      _this.validateFields(childrenFields);
    }
    _this.notifyObservers(prevStore, childrenFields, {
      type: 'dependenciesUpdate',
      relatedFields: [namePath].concat((0, _toConsumableArray2.default)(childrenFields))
    });
    return childrenFields;
  });
  (0, _defineProperty2.default)(this, "updateValue", function (name, value) {
    var namePath = (0, _valueUtil.getNamePath)(name);
    var prevStore = _this.store;
    _this.updateStore((0, _valueUtil.setValue)(_this.store, namePath, value));
    _this.notifyObservers(prevStore, [namePath], {
      type: 'valueUpdate',
      source: 'internal'
    });
    _this.notifyWatch([namePath]);

    // Dependencies update
    var childrenFields = _this.triggerDependenciesUpdate(prevStore, namePath);

    // trigger callback function
    var onValuesChange = _this.callbacks.onValuesChange;
    if (onValuesChange) {
      var changedValues = (0, _valueUtil.cloneByNamePathList)(_this.store, [namePath]);
      onValuesChange(changedValues, _this.getFieldsValue());
    }
    _this.triggerOnFieldsChange([namePath].concat((0, _toConsumableArray2.default)(childrenFields)));
  });
  // Let all child Field get update.
  (0, _defineProperty2.default)(this, "setFieldsValue", function (store) {
    _this.warningUnhooked();
    var prevStore = _this.store;
    if (store) {
      var nextStore = (0, _set.merge)(_this.store, store);
      _this.updateStore(nextStore);
    }
    _this.notifyObservers(prevStore, null, {
      type: 'valueUpdate',
      source: 'external'
    });
    _this.notifyWatch();
  });
  (0, _defineProperty2.default)(this, "setFieldValue", function (name, value) {
    _this.setFields([{
      name: name,
      value: value
    }]);
  });
  (0, _defineProperty2.default)(this, "getDependencyChildrenFields", function (rootNamePath) {
    var children = new Set();
    var childrenFields = [];
    var dependencies2fields = new _NameMap.default();

    /**
     * Generate maps
     * Can use cache to save perf if user report performance issue with this
     */
    _this.getFieldEntities().forEach(function (field) {
      var dependencies = field.props.dependencies;
      (dependencies || []).forEach(function (dependency) {
        var dependencyNamePath = (0, _valueUtil.getNamePath)(dependency);
        dependencies2fields.update(dependencyNamePath, function () {
          var fields = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Set();
          fields.add(field);
          return fields;
        });
      });
    });
    var fillChildren = function fillChildren(namePath) {
      var fields = dependencies2fields.get(namePath) || new Set();
      fields.forEach(function (field) {
        if (!children.has(field)) {
          children.add(field);
          var fieldNamePath = field.getNamePath();
          if (field.isFieldDirty() && fieldNamePath.length) {
            childrenFields.push(fieldNamePath);
            fillChildren(fieldNamePath);
          }
        }
      });
    };
    fillChildren(rootNamePath);
    return childrenFields;
  });
  (0, _defineProperty2.default)(this, "triggerOnFieldsChange", function (namePathList, filedErrors) {
    var onFieldsChange = _this.callbacks.onFieldsChange;
    if (onFieldsChange) {
      var fields = _this.getFields();

      /**
       * Fill errors since `fields` may be replaced by controlled fields
       */
      if (filedErrors) {
        var cache = new _NameMap.default();
        filedErrors.forEach(function (_ref6) {
          var name = _ref6.name,
            errors = _ref6.errors;
          cache.set(name, errors);
        });
        fields.forEach(function (field) {
          // eslint-disable-next-line no-param-reassign
          field.errors = cache.get(field.name) || field.errors;
        });
      }
      var changedFields = fields.filter(function (_ref7) {
        var fieldName = _ref7.name;
        return (0, _valueUtil.containsNamePath)(namePathList, fieldName);
      });
      if (changedFields.length) {
        onFieldsChange(changedFields, fields);
      }
    }
  });
  // =========================== Validate ===========================
  (0, _defineProperty2.default)(this, "validateFields", function (arg1, arg2) {
    _this.warningUnhooked();
    var nameList;
    var options;
    if (Array.isArray(arg1) || typeof arg1 === 'string' || typeof arg2 === 'string') {
      nameList = arg1;
      options = arg2;
    } else {
      options = arg1;
    }
    var provideNameList = !!nameList;
    var namePathList = provideNameList ? nameList.map(_valueUtil.getNamePath) : [];

    // Collect result in promise list
    var promiseList = [];

    // We temp save the path which need trigger for `onFieldsChange`
    var TMP_SPLIT = String(Date.now());
    var validateNamePathList = new Set();
    var _ref8 = options || {},
      recursive = _ref8.recursive,
      dirty = _ref8.dirty;
    _this.getFieldEntities(true).forEach(function (field) {
      // Add field if not provide `nameList`
      if (!provideNameList) {
        namePathList.push(field.getNamePath());
      }

      // Skip if without rule
      if (!field.props.rules || !field.props.rules.length) {
        return;
      }

      // Skip if only validate dirty field
      if (dirty && !field.isFieldDirty()) {
        return;
      }
      var fieldNamePath = field.getNamePath();
      validateNamePathList.add(fieldNamePath.join(TMP_SPLIT));

      // Add field validate rule in to promise list
      if (!provideNameList || (0, _valueUtil.containsNamePath)(namePathList, fieldNamePath, recursive)) {
        var promise = field.validateRules((0, _objectSpread2.default)({
          validateMessages: (0, _objectSpread2.default)((0, _objectSpread2.default)({}, _messages.defaultValidateMessages), _this.validateMessages)
        }, options));

        // Wrap promise with field
        promiseList.push(promise.then(function () {
          return {
            name: fieldNamePath,
            errors: [],
            warnings: []
          };
        }).catch(function (ruleErrors) {
          var _ruleErrors$forEach;
          var mergedErrors = [];
          var mergedWarnings = [];
          (_ruleErrors$forEach = ruleErrors.forEach) === null || _ruleErrors$forEach === void 0 || _ruleErrors$forEach.call(ruleErrors, function (_ref9) {
            var warningOnly = _ref9.rule.warningOnly,
              errors = _ref9.errors;
            if (warningOnly) {
              mergedWarnings.push.apply(mergedWarnings, (0, _toConsumableArray2.default)(errors));
            } else {
              mergedErrors.push.apply(mergedErrors, (0, _toConsumableArray2.default)(errors));
            }
          });
          if (mergedErrors.length) {
            return Promise.reject({
              name: fieldNamePath,
              errors: mergedErrors,
              warnings: mergedWarnings
            });
          }
          return {
            name: fieldNamePath,
            errors: mergedErrors,
            warnings: mergedWarnings
          };
        }));
      }
    });
    var summaryPromise = (0, _asyncUtil.allPromiseFinish)(promiseList);
    _this.lastValidatePromise = summaryPromise;

    // Notify fields with rule that validate has finished and need update
    summaryPromise.catch(function (results) {
      return results;
    }).then(function (results) {
      var resultNamePathList = results.map(function (_ref10) {
        var name = _ref10.name;
        return name;
      });
      _this.notifyObservers(_this.store, resultNamePathList, {
        type: 'validateFinish'
      });
      _this.triggerOnFieldsChange(resultNamePathList, results);
    });
    var returnPromise = summaryPromise.then(function () {
      if (_this.lastValidatePromise === summaryPromise) {
        return Promise.resolve(_this.getFieldsValue(namePathList));
      }
      return Promise.reject([]);
    }).catch(function (results) {
      var errorList = results.filter(function (result) {
        return result && result.errors.length;
      });
      return Promise.reject({
        values: _this.getFieldsValue(namePathList),
        errorFields: errorList,
        outOfDate: _this.lastValidatePromise !== summaryPromise
      });
    });

    // Do not throw in console
    returnPromise.catch(function (e) {
      return e;
    });

    // `validating` changed. Trigger `onFieldsChange`
    var triggerNamePathList = namePathList.filter(function (namePath) {
      return validateNamePathList.has(namePath.join(TMP_SPLIT));
    });
    _this.triggerOnFieldsChange(triggerNamePathList);
    return returnPromise;
  });
  // ============================ Submit ============================
  (0, _defineProperty2.default)(this, "submit", function () {
    _this.warningUnhooked();
    _this.validateFields().then(function (values) {
      var onFinish = _this.callbacks.onFinish;
      if (onFinish) {
        try {
          onFinish(values);
        } catch (err) {
          // Should print error if user `onFinish` callback failed
          console.error(err);
        }
      }
    }).catch(function (e) {
      var onFinishFailed = _this.callbacks.onFinishFailed;
      if (onFinishFailed) {
        onFinishFailed(e);
      }
    });
  });
  this.forceRootUpdate = forceRootUpdate;
});
function useForm(form) {
  var formRef = React.useRef();
  var _React$useState = React.useState({}),
    _React$useState2 = (0, _slicedToArray2.default)(_React$useState, 2),
    forceUpdate = _React$useState2[1];
  if (!formRef.current) {
    if (form) {
      formRef.current = form;
    } else {
      // Create a new FormStore if not provided
      var forceReRender = function forceReRender() {
        forceUpdate({});
      };
      var formStore = new FormStore(forceReRender);
      formRef.current = formStore.getForm();
    }
  }
  return [formRef.current];
}
var _default = exports["default"] = useForm;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/useWatch.js":
/*!*****************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/useWatch.js ***!
  \*****************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
exports.stringify = stringify;
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _warning = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/warning */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/warning.js"));
var _react = __webpack_require__(/*! react */ "react");
var _FieldContext = _interopRequireWildcard(__webpack_require__(/*! ./FieldContext */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/FieldContext.js"));
var _typeUtil = __webpack_require__(/*! ./utils/typeUtil */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/typeUtil.js");
var _valueUtil = __webpack_require__(/*! ./utils/valueUtil */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/valueUtil.js");
function stringify(value) {
  try {
    return JSON.stringify(value);
  } catch (err) {
    return Math.random();
  }
}
var useWatchWarning =  true ? function (namePath) {
  var fullyStr = namePath.join('__RC_FIELD_FORM_SPLIT__');
  var nameStrRef = (0, _react.useRef)(fullyStr);
  (0, _warning.default)(nameStrRef.current === fullyStr, '`useWatch` is not support dynamic `namePath`. Please provide static instead.');
} : 0;

// ------- selector type -------

// ------- selector type end -------

function useWatch() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  var dependencies = args[0],
    _args$ = args[1],
    _form = _args$ === void 0 ? {} : _args$;
  var options = (0, _typeUtil.isFormInstance)(_form) ? {
    form: _form
  } : _form;
  var form = options.form;
  var _useState = (0, _react.useState)(),
    _useState2 = (0, _slicedToArray2.default)(_useState, 2),
    value = _useState2[0],
    setValue = _useState2[1];
  var valueStr = (0, _react.useMemo)(function () {
    return stringify(value);
  }, [value]);
  var valueStrRef = (0, _react.useRef)(valueStr);
  valueStrRef.current = valueStr;
  var fieldContext = (0, _react.useContext)(_FieldContext.default);
  var formInstance = form || fieldContext;
  var isValidForm = formInstance && formInstance._init;

  // Warning if not exist form instance
  if (true) {
    (0, _warning.default)(args.length === 2 ? form ? isValidForm : true : isValidForm, 'useWatch requires a form instance since it can not auto detect from context.');
  }
  var namePath = (0, _valueUtil.getNamePath)(dependencies);
  var namePathRef = (0, _react.useRef)(namePath);
  namePathRef.current = namePath;
  useWatchWarning(namePath);
  (0, _react.useEffect)(function () {
    // Skip if not exist form instance
    if (!isValidForm) {
      return;
    }
    var getFieldsValue = formInstance.getFieldsValue,
      getInternalHooks = formInstance.getInternalHooks;
    var _getInternalHooks = getInternalHooks(_FieldContext.HOOK_MARK),
      registerWatch = _getInternalHooks.registerWatch;
    var getWatchValue = function getWatchValue(values, allValues) {
      var watchValue = options.preserve ? allValues : values;
      return typeof dependencies === 'function' ? dependencies(watchValue) : (0, _valueUtil.getValue)(watchValue, namePathRef.current);
    };
    var cancelRegister = registerWatch(function (values, allValues) {
      var newValue = getWatchValue(values, allValues);
      var nextValueStr = stringify(newValue);

      // Compare stringify in case it's nest object
      if (valueStrRef.current !== nextValueStr) {
        valueStrRef.current = nextValueStr;
        setValue(newValue);
      }
    });

    // TODO: We can improve this perf in future
    var initialValue = getWatchValue(getFieldsValue(), getFieldsValue(true));

    // React 18 has the bug that will queue update twice even the value is not changed
    // ref: https://github.com/facebook/react/issues/27213
    if (value !== initialValue) {
      setValue(initialValue);
    }
    return cancelRegister;
  },
  // We do not need re-register since namePath content is the same
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [isValidForm]);
  return value;
}
var _default = exports["default"] = useWatch;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/NameMap.js":
/*!**********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/NameMap.js ***!
  \**********************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/toConsumableArray.js"));
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/createClass.js"));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/defineProperty.js"));
var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js"));
var SPLIT = '__@field_split__';

/**
 * Convert name path into string to fast the fetch speed of Map.
 */
function normalize(namePath) {
  return namePath.map(function (cell) {
    return "".concat((0, _typeof2.default)(cell), ":").concat(cell);
  })
  // Magic split
  .join(SPLIT);
}

/**
 * NameMap like a `Map` but accepts `string[]` as key.
 */
var NameMap = /*#__PURE__*/function () {
  function NameMap() {
    (0, _classCallCheck2.default)(this, NameMap);
    (0, _defineProperty2.default)(this, "kvs", new Map());
  }
  (0, _createClass2.default)(NameMap, [{
    key: "set",
    value: function set(key, value) {
      this.kvs.set(normalize(key), value);
    }
  }, {
    key: "get",
    value: function get(key) {
      return this.kvs.get(normalize(key));
    }
  }, {
    key: "update",
    value: function update(key, updater) {
      var origin = this.get(key);
      var next = updater(origin);
      if (!next) {
        this.delete(key);
      } else {
        this.set(key, next);
      }
    }
  }, {
    key: "delete",
    value: function _delete(key) {
      this.kvs.delete(normalize(key));
    }

    // Since we only use this in test, let simply realize this
  }, {
    key: "map",
    value: function map(callback) {
      return (0, _toConsumableArray2.default)(this.kvs.entries()).map(function (_ref) {
        var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];
        var cells = key.split(SPLIT);
        return callback({
          key: cells.map(function (cell) {
            var _cell$match = cell.match(/^([^:]*):(.*)$/),
              _cell$match2 = (0, _slicedToArray2.default)(_cell$match, 3),
              type = _cell$match2[1],
              unit = _cell$match2[2];
            return type === 'number' ? Number(unit) : unit;
          }),
          value: value
        });
      });
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      var json = {};
      this.map(function (_ref3) {
        var key = _ref3.key,
          value = _ref3.value;
        json[key.join('.')] = value;
        return null;
      });
      return json;
    }
  }]);
  return NameMap;
}();
var _default = exports["default"] = NameMap;

/***/ }),

/***/ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/asyncUtil.js":
/*!************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/asyncUtil.js ***!
  \************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.allPromiseFinish = allPromiseFinish;
function allPromiseFinish(promiseList) {
  var hasError = false;
  var count = promiseList.length;
  var results = [];
  if (!promiseList.length) {
    return Promise.resolve([]);
  }
  return new Promise(function (resolve, reject) {
    promiseList.forEach(function (promise, index) {
      promise.catch(function (e) {
        hasError = true;
        return e;
      }).then(function (result) {
        count -= 1;
        results[index] = result;
        if (count > 0) {
          return;
        }
        if (hasError) {
          reject(results);
        }
        resolve(results);
      });
    });
  });
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/messages.js":
/*!***********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/messages.js ***!
  \***********************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.defaultValidateMessages = void 0;
var typeTemplate = "'${name}' is not a valid ${type}";
var defaultValidateMessages = exports.defaultValidateMessages = {
  default: "Validation error on field '${name}'",
  required: "'${name}' is required",
  enum: "'${name}' must be one of [${enum}]",
  whitespace: "'${name}' cannot be empty",
  date: {
    format: "'${name}' is invalid for format date",
    parse: "'${name}' could not be parsed as date",
    invalid: "'${name}' is invalid date"
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
    len: "'${name}' must be exactly ${len} characters",
    min: "'${name}' must be at least ${min} characters",
    max: "'${name}' cannot be longer than ${max} characters",
    range: "'${name}' must be between ${min} and ${max} characters"
  },
  number: {
    len: "'${name}' must equal ${len}",
    min: "'${name}' cannot be less than ${min}",
    max: "'${name}' cannot be greater than ${max}",
    range: "'${name}' must be between ${min} and ${max}"
  },
  array: {
    len: "'${name}' must be exactly ${len} in length",
    min: "'${name}' cannot be less than ${min} in length",
    max: "'${name}' cannot be greater than ${max} in length",
    range: "'${name}' must be between ${min} and ${max} in length"
  },
  pattern: {
    mismatch: "'${name}' does not match pattern ${pattern}"
  }
};

/***/ }),

/***/ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/typeUtil.js":
/*!***********************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/typeUtil.js ***!
  \***********************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.isFormInstance = isFormInstance;
exports.toArray = toArray;
function toArray(value) {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}
function isFormInstance(form) {
  return form && !!form._init;
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/validateUtil.js":
/*!***************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/validateUtil.js ***!
  \***************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireWildcard = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireWildcard.js")["default"]);
var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.validateRules = validateRules;
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/toConsumableArray.js"));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/defineProperty.js"));
var _regeneratorRuntime2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/regeneratorRuntime */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/regeneratorRuntime.js"));
var _objectSpread2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectSpread2 */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/objectSpread2.js"));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/asyncToGenerator.js"));
var _asyncValidator = _interopRequireDefault(__webpack_require__(/*! @rc-component/async-validator */ "../../node_modules/.pnpm/@rc-component+async-validator@5.0.4/node_modules/@rc-component/async-validator/lib/index.js"));
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var _warning = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/warning */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/warning.js"));
var _messages = __webpack_require__(/*! ./messages */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/messages.js");
var _set = __webpack_require__(/*! rc-util/lib/utils/set */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/utils/set.js");
// Remove incorrect original ts define
var AsyncValidator = _asyncValidator.default;

/**
 * Replace with template.
 *   `I'm ${name}` + { name: 'bamboo' } = I'm bamboo
 */
function replaceMessage(template, kv) {
  return template.replace(/\$\{\w+\}/g, function (str) {
    var key = str.slice(2, -1);
    return kv[key];
  });
}
var CODE_LOGIC_ERROR = 'CODE_LOGIC_ERROR';
function validateRule(_x, _x2, _x3, _x4, _x5) {
  return _validateRule.apply(this, arguments);
}
/**
 * We use `async-validator` to validate the value.
 * But only check one value in a time to avoid namePath validate issue.
 */
function _validateRule() {
  _validateRule = (0, _asyncToGenerator2.default)( /*#__PURE__*/(0, _regeneratorRuntime2.default)().mark(function _callee2(name, value, rule, options, messageVariables) {
    var cloneRule, originValidator, subRuleField, validator, messages, result, subResults, kv, fillVariableResult;
    return (0, _regeneratorRuntime2.default)().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          cloneRule = (0, _objectSpread2.default)({}, rule); // Bug of `async-validator`
          // https://github.com/react-component/field-form/issues/316
          // https://github.com/react-component/field-form/issues/313
          delete cloneRule.ruleIndex;

          // https://github.com/ant-design/ant-design/issues/40497#issuecomment-1422282378
          AsyncValidator.warning = function () {
            return void 0;
          };
          if (cloneRule.validator) {
            originValidator = cloneRule.validator;
            cloneRule.validator = function () {
              try {
                return originValidator.apply(void 0, arguments);
              } catch (error) {
                console.error(error);
                return Promise.reject(CODE_LOGIC_ERROR);
              }
            };
          }

          // We should special handle array validate
          subRuleField = null;
          if (cloneRule && cloneRule.type === 'array' && cloneRule.defaultField) {
            subRuleField = cloneRule.defaultField;
            delete cloneRule.defaultField;
          }
          validator = new AsyncValidator((0, _defineProperty2.default)({}, name, [cloneRule]));
          messages = (0, _set.merge)(_messages.defaultValidateMessages, options.validateMessages);
          validator.messages(messages);
          result = [];
          _context2.prev = 10;
          _context2.next = 13;
          return Promise.resolve(validator.validate((0, _defineProperty2.default)({}, name, value), (0, _objectSpread2.default)({}, options)));
        case 13:
          _context2.next = 18;
          break;
        case 15:
          _context2.prev = 15;
          _context2.t0 = _context2["catch"](10);
          if (_context2.t0.errors) {
            result = _context2.t0.errors.map(function (_ref4, index) {
              var message = _ref4.message;
              var mergedMessage = message === CODE_LOGIC_ERROR ? messages.default : message;
              return /*#__PURE__*/React.isValidElement(mergedMessage) ?
              /*#__PURE__*/
              // Wrap ReactNode with `key`
              React.cloneElement(mergedMessage, {
                key: "error_".concat(index)
              }) : mergedMessage;
            });
          }
        case 18:
          if (!(!result.length && subRuleField)) {
            _context2.next = 23;
            break;
          }
          _context2.next = 21;
          return Promise.all(value.map(function (subValue, i) {
            return validateRule("".concat(name, ".").concat(i), subValue, subRuleField, options, messageVariables);
          }));
        case 21:
          subResults = _context2.sent;
          return _context2.abrupt("return", subResults.reduce(function (prev, errors) {
            return [].concat((0, _toConsumableArray2.default)(prev), (0, _toConsumableArray2.default)(errors));
          }, []));
        case 23:
          // Replace message with variables
          kv = (0, _objectSpread2.default)((0, _objectSpread2.default)({}, rule), {}, {
            name: name,
            enum: (rule.enum || []).join(', ')
          }, messageVariables);
          fillVariableResult = result.map(function (error) {
            if (typeof error === 'string') {
              return replaceMessage(error, kv);
            }
            return error;
          });
          return _context2.abrupt("return", fillVariableResult);
        case 26:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[10, 15]]);
  }));
  return _validateRule.apply(this, arguments);
}
function validateRules(namePath, value, rules, options, validateFirst, messageVariables) {
  var name = namePath.join('.');

  // Fill rule with context
  var filledRules = rules.map(function (currentRule, ruleIndex) {
    var originValidatorFunc = currentRule.validator;
    var cloneRule = (0, _objectSpread2.default)((0, _objectSpread2.default)({}, currentRule), {}, {
      ruleIndex: ruleIndex
    });

    // Replace validator if needed
    if (originValidatorFunc) {
      cloneRule.validator = function (rule, val, callback) {
        var hasPromise = false;

        // Wrap callback only accept when promise not provided
        var wrappedCallback = function wrappedCallback() {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          // Wait a tick to make sure return type is a promise
          Promise.resolve().then(function () {
            (0, _warning.default)(!hasPromise, 'Your validator function has already return a promise. `callback` will be ignored.');
            if (!hasPromise) {
              callback.apply(void 0, args);
            }
          });
        };

        // Get promise
        var promise = originValidatorFunc(rule, val, wrappedCallback);
        hasPromise = promise && typeof promise.then === 'function' && typeof promise.catch === 'function';

        /**
         * 1. Use promise as the first priority.
         * 2. If promise not exist, use callback with warning instead
         */
        (0, _warning.default)(hasPromise, '`callback` is deprecated. Please return a promise instead.');
        if (hasPromise) {
          promise.then(function () {
            callback();
          }).catch(function (err) {
            callback(err || ' ');
          });
        }
      };
    }
    return cloneRule;
  }).sort(function (_ref, _ref2) {
    var w1 = _ref.warningOnly,
      i1 = _ref.ruleIndex;
    var w2 = _ref2.warningOnly,
      i2 = _ref2.ruleIndex;
    if (!!w1 === !!w2) {
      // Let keep origin order
      return i1 - i2;
    }
    if (w1) {
      return 1;
    }
    return -1;
  });

  // Do validate rules
  var summaryPromise;
  if (validateFirst === true) {
    // >>>>> Validate by serialization
    summaryPromise = new Promise( /*#__PURE__*/function () {
      var _ref3 = (0, _asyncToGenerator2.default)( /*#__PURE__*/(0, _regeneratorRuntime2.default)().mark(function _callee(resolve, reject) {
        var i, rule, errors;
        return (0, _regeneratorRuntime2.default)().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              i = 0;
            case 1:
              if (!(i < filledRules.length)) {
                _context.next = 12;
                break;
              }
              rule = filledRules[i];
              _context.next = 5;
              return validateRule(name, value, rule, options, messageVariables);
            case 5:
              errors = _context.sent;
              if (!errors.length) {
                _context.next = 9;
                break;
              }
              reject([{
                errors: errors,
                rule: rule
              }]);
              return _context.abrupt("return");
            case 9:
              i += 1;
              _context.next = 1;
              break;
            case 12:
              /* eslint-enable */

              resolve([]);
            case 13:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      return function (_x6, _x7) {
        return _ref3.apply(this, arguments);
      };
    }());
  } else {
    // >>>>> Validate by parallel
    var rulePromises = filledRules.map(function (rule) {
      return validateRule(name, value, rule, options, messageVariables).then(function (errors) {
        return {
          errors: errors,
          rule: rule
        };
      });
    });
    summaryPromise = (validateFirst ? finishOnFirstFailed(rulePromises) : finishOnAllFailed(rulePromises)).then(function (errors) {
      // Always change to rejection for Field to catch
      return Promise.reject(errors);
    });
  }

  // Internal catch error to avoid console error log.
  summaryPromise.catch(function (e) {
    return e;
  });
  return summaryPromise;
}
function finishOnAllFailed(_x8) {
  return _finishOnAllFailed.apply(this, arguments);
}
function _finishOnAllFailed() {
  _finishOnAllFailed = (0, _asyncToGenerator2.default)( /*#__PURE__*/(0, _regeneratorRuntime2.default)().mark(function _callee3(rulePromises) {
    return (0, _regeneratorRuntime2.default)().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          return _context3.abrupt("return", Promise.all(rulePromises).then(function (errorsList) {
            var _ref5;
            var errors = (_ref5 = []).concat.apply(_ref5, (0, _toConsumableArray2.default)(errorsList));
            return errors;
          }));
        case 1:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return _finishOnAllFailed.apply(this, arguments);
}
function finishOnFirstFailed(_x9) {
  return _finishOnFirstFailed.apply(this, arguments);
}
function _finishOnFirstFailed() {
  _finishOnFirstFailed = (0, _asyncToGenerator2.default)( /*#__PURE__*/(0, _regeneratorRuntime2.default)().mark(function _callee4(rulePromises) {
    var count;
    return (0, _regeneratorRuntime2.default)().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          count = 0;
          return _context4.abrupt("return", new Promise(function (resolve) {
            rulePromises.forEach(function (promise) {
              promise.then(function (ruleError) {
                if (ruleError.errors.length) {
                  resolve([ruleError]);
                }
                count += 1;
                if (count === rulePromises.length) {
                  resolve([]);
                }
              });
            });
          }));
        case 2:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return _finishOnFirstFailed.apply(this, arguments);
}

/***/ }),

/***/ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/valueUtil.js":
/*!************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/valueUtil.js ***!
  \************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = (__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/interopRequireDefault.js")["default"]);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.cloneByNamePathList = cloneByNamePathList;
exports.containsNamePath = containsNamePath;
exports.defaultGetValueFromEvent = defaultGetValueFromEvent;
exports.getNamePath = getNamePath;
Object.defineProperty(exports, "getValue", ({
  enumerable: true,
  get: function get() {
    return _get.default;
  }
}));
exports.isSimilar = isSimilar;
exports.matchNamePath = matchNamePath;
exports.move = move;
Object.defineProperty(exports, "setValue", ({
  enumerable: true,
  get: function get() {
    return _set.default;
  }
}));
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/toConsumableArray.js"));
var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "../../node_modules/.pnpm/@babel+runtime@7.26.0/node_modules/@babel/runtime/helpers/typeof.js"));
var _get = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/utils/get */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/utils/get.js"));
var _set = _interopRequireDefault(__webpack_require__(/*! rc-util/lib/utils/set */ "../../node_modules/.pnpm/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1/node_modules/rc-util/lib/utils/set.js"));
var _typeUtil = __webpack_require__(/*! ./typeUtil */ "../../node_modules/.pnpm/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1/node_modules/rc-field-form/lib/utils/typeUtil.js");
/**
 * Convert name to internal supported format.
 * This function should keep since we still thinking if need support like `a.b.c` format.
 * 'a' => ['a']
 * 123 => [123]
 * ['a', 123] => ['a', 123]
 */
function getNamePath(path) {
  return (0, _typeUtil.toArray)(path);
}
function cloneByNamePathList(store, namePathList) {
  var newStore = {};
  namePathList.forEach(function (namePath) {
    var value = (0, _get.default)(store, namePath);
    newStore = (0, _set.default)(newStore, namePath, value);
  });
  return newStore;
}

/**
 * Check if `namePathList` includes `namePath`.
 * @param namePathList A list of `InternalNamePath[]`
 * @param namePath Compare `InternalNamePath`
 * @param partialMatch True will make `[a, b]` match `[a, b, c]`
 */
function containsNamePath(namePathList, namePath) {
  var partialMatch = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  return namePathList && namePathList.some(function (path) {
    return matchNamePath(namePath, path, partialMatch);
  });
}

/**
 * Check if `namePath` is super set or equal of `subNamePath`.
 * @param namePath A list of `InternalNamePath[]`
 * @param subNamePath Compare `InternalNamePath`
 * @param partialMatch True will make `[a, b]` match `[a, b, c]`
 */
function matchNamePath(namePath, subNamePath) {
  var partialMatch = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (!namePath || !subNamePath) {
    return false;
  }
  if (!partialMatch && namePath.length !== subNamePath.length) {
    return false;
  }
  return subNamePath.every(function (nameUnit, i) {
    return namePath[i] === nameUnit;
  });
}

// Like `shallowEqual`, but we not check the data which may cause re-render

function isSimilar(source, target) {
  if (source === target) {
    return true;
  }
  if (!source && target || source && !target) {
    return false;
  }
  if (!source || !target || (0, _typeof2.default)(source) !== 'object' || (0, _typeof2.default)(target) !== 'object') {
    return false;
  }
  var sourceKeys = Object.keys(source);
  var targetKeys = Object.keys(target);
  var keys = new Set([].concat(sourceKeys, targetKeys));
  return (0, _toConsumableArray2.default)(keys).every(function (key) {
    var sourceValue = source[key];
    var targetValue = target[key];
    if (typeof sourceValue === 'function' && typeof targetValue === 'function') {
      return true;
    }
    return sourceValue === targetValue;
  });
}
function defaultGetValueFromEvent(valuePropName) {
  var event = arguments.length <= 1 ? undefined : arguments[1];
  if (event && event.target && (0, _typeof2.default)(event.target) === 'object' && valuePropName in event.target) {
    return event.target[valuePropName];
  }
  return event;
}

/**
 * Moves an array item from one position in an array to another.
 *
 * Note: This is a pure function so a new array will be returned, instead
 * of altering the array argument.
 *
 * @param array         Array in which to move an item.         (required)
 * @param moveIndex     The index of the item to move.          (required)
 * @param toIndex       The index to move item at moveIndex to. (required)
 */
function move(array, moveIndex, toIndex) {
  var length = array.length;
  if (moveIndex < 0 || moveIndex >= length || toIndex < 0 || toIndex >= length) {
    return array;
  }
  var item = array[moveIndex];
  var diff = moveIndex - toIndex;
  if (diff > 0) {
    // move left
    return [].concat((0, _toConsumableArray2.default)(array.slice(0, toIndex)), [item], (0, _toConsumableArray2.default)(array.slice(toIndex, moveIndex)), (0, _toConsumableArray2.default)(array.slice(moveIndex + 1, length)));
  }
  if (diff < 0) {
    // move right
    return [].concat((0, _toConsumableArray2.default)(array.slice(0, moveIndex)), (0, _toConsumableArray2.default)(array.slice(moveIndex + 1, toIndex + 1)), [item], (0, _toConsumableArray2.default)(array.slice(toIndex + 1, length)));
  }
  return array;
}

/***/ })

};
;