"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TurbopackHmr", {
    enumerable: true,
    get: function() {
        return TurbopackHmr;
    }
});
const _class_private_field_loose_base = require("@swc/helpers/_/_class_private_field_loose_base");
const _class_private_field_loose_key = require("@swc/helpers/_/_class_private_field_loose_key");
// How long to wait before reporting the HMR start, used to suppress irrelevant
// `BUILDING` events. Does not impact reported latency.
const TURBOPACK_HMR_START_DELAY_MS = 100;
var _updatedModules = /*#__PURE__*/ _class_private_field_loose_key._("_updatedModules"), _startMsSinceEpoch = /*#__PURE__*/ _class_private_field_loose_key._("_startMsSinceEpoch"), _lastUpdateMsSinceEpoch = /*#__PURE__*/ _class_private_field_loose_key._("_lastUpdateMsSinceEpoch"), _deferredReportHmrStartId = /*#__PURE__*/ _class_private_field_loose_key._("_deferredReportHmrStartId"), // HACK: Turbopack tends to generate a lot of irrelevant "BUILDING" actions,
// as it reports *any* compilation, including fully no-op/cached compilations
// and those unrelated to HMR. Fixing this would require significant
// architectural changes.
//
// Work around this by deferring any "rebuilding" message by 100ms. If we get
// a BUILT event within that threshold and nothing has changed, just suppress
// the message entirely.
_runDeferredReportHmrStart = /*#__PURE__*/ _class_private_field_loose_key._("_runDeferredReportHmrStart"), _cancelDeferredReportHmrStart = /*#__PURE__*/ _class_private_field_loose_key._("_cancelDeferredReportHmrStart"), /** Helper for other `onEvent` methods. */ _onUpdate = /*#__PURE__*/ _class_private_field_loose_key._("_onUpdate");
class TurbopackHmr {
    onBuilding() {
        _class_private_field_loose_base._(this, _lastUpdateMsSinceEpoch)[_lastUpdateMsSinceEpoch] = undefined;
        _class_private_field_loose_base._(this, _cancelDeferredReportHmrStart)[_cancelDeferredReportHmrStart]();
        _class_private_field_loose_base._(this, _startMsSinceEpoch)[_startMsSinceEpoch] = Date.now();
        // report the HMR start after a short delay
        _class_private_field_loose_base._(this, _deferredReportHmrStartId)[_deferredReportHmrStartId] = setTimeout(()=>_class_private_field_loose_base._(this, _runDeferredReportHmrStart)[_runDeferredReportHmrStart](), // debugging feature: don't defer/suppress noisy no-op HMR update messages
        self.__NEXT_HMR_TURBOPACK_REPORT_NOISY_NOOP_EVENTS ? 0 : TURBOPACK_HMR_START_DELAY_MS);
    }
    onTurbopackMessage(msg) {
        _class_private_field_loose_base._(this, _onUpdate)[_onUpdate]();
        const updatedModules = extractModulesFromTurbopackMessage(msg.data);
        for (const module of updatedModules){
            _class_private_field_loose_base._(this, _updatedModules)[_updatedModules].add(module);
        }
    }
    onServerComponentChanges() {
        _class_private_field_loose_base._(this, _onUpdate)[_onUpdate]();
    }
    onReloadPage() {
        _class_private_field_loose_base._(this, _onUpdate)[_onUpdate]();
    }
    onPageAddRemove() {
        _class_private_field_loose_base._(this, _onUpdate)[_onUpdate]();
    }
    /**
   * @returns `null` if the caller should ignore the update entirely. Returns an
   *   object with `hasUpdates: false` if the caller should report the end of
   *   the HMR in the browser console, but the HMR was a no-op.
   */ onBuilt() {
        // Check that we got *any* `TurbopackMessageAction`, even if
        // `updatedModules` is empty (not everything gets recorded there).
        //
        // There's also a case where `onBuilt` gets called before `onBuilding`,
        // which can happen during initial page load. Ignore that too!
        const hasUpdates = _class_private_field_loose_base._(this, _lastUpdateMsSinceEpoch)[_lastUpdateMsSinceEpoch] != null && _class_private_field_loose_base._(this, _startMsSinceEpoch)[_startMsSinceEpoch] != null;
        if (!hasUpdates && _class_private_field_loose_base._(this, _deferredReportHmrStartId)[_deferredReportHmrStartId] != null) {
            // suppress the update entirely
            _class_private_field_loose_base._(this, _cancelDeferredReportHmrStart)[_cancelDeferredReportHmrStart]();
            return null;
        }
        _class_private_field_loose_base._(this, _runDeferredReportHmrStart)[_runDeferredReportHmrStart]();
        var _class_private_field_loose_base__lastUpdateMsSinceEpoch;
        const result = {
            hasUpdates,
            updatedModules: _class_private_field_loose_base._(this, _updatedModules)[_updatedModules],
            startMsSinceEpoch: _class_private_field_loose_base._(this, _startMsSinceEpoch)[_startMsSinceEpoch],
            endMsSinceEpoch: (_class_private_field_loose_base__lastUpdateMsSinceEpoch = _class_private_field_loose_base._(this, _lastUpdateMsSinceEpoch)[_lastUpdateMsSinceEpoch]) != null ? _class_private_field_loose_base__lastUpdateMsSinceEpoch : Date.now()
        };
        _class_private_field_loose_base._(this, _updatedModules)[_updatedModules] = new Set();
        return result;
    }
    constructor(){
        Object.defineProperty(this, _runDeferredReportHmrStart, {
            value: runDeferredReportHmrStart
        });
        Object.defineProperty(this, _cancelDeferredReportHmrStart, {
            value: cancelDeferredReportHmrStart
        });
        Object.defineProperty(this, _onUpdate, {
            value: onUpdate
        });
        Object.defineProperty(this, _updatedModules, {
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, _startMsSinceEpoch, {
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, _lastUpdateMsSinceEpoch, {
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, _deferredReportHmrStartId, {
            writable: true,
            value: void 0
        });
        _class_private_field_loose_base._(this, _updatedModules)[_updatedModules] = new Set();
    }
}
function runDeferredReportHmrStart() {
    if (_class_private_field_loose_base._(this, _deferredReportHmrStartId)[_deferredReportHmrStartId] != null) {
        console.log('[Fast Refresh] rebuilding');
        _class_private_field_loose_base._(this, _cancelDeferredReportHmrStart)[_cancelDeferredReportHmrStart]();
    }
}
function cancelDeferredReportHmrStart() {
    clearTimeout(_class_private_field_loose_base._(this, _deferredReportHmrStartId)[_deferredReportHmrStartId]);
    _class_private_field_loose_base._(this, _deferredReportHmrStartId)[_deferredReportHmrStartId] = undefined;
}
function onUpdate() {
    _class_private_field_loose_base._(this, _runDeferredReportHmrStart)[_runDeferredReportHmrStart]();
    _class_private_field_loose_base._(this, _lastUpdateMsSinceEpoch)[_lastUpdateMsSinceEpoch] = Date.now();
}
function extractModulesFromTurbopackMessage(data) {
    const updatedModules = new Set();
    const updates = Array.isArray(data) ? data : [
        data
    ];
    for (const update of updates){
        // TODO this won't capture changes to CSS since they don't result in a "merged" update
        if (update.type !== 'partial' || update.instruction.type !== 'ChunkListUpdate' || update.instruction.merged === undefined) {
            continue;
        }
        for (const mergedUpdate of update.instruction.merged){
            for (const name of Object.keys(mergedUpdate.entries)){
                const res = /(.*)\s+\[.*/.exec(name);
                if (res === null) {
                    console.error('[Turbopack HMR] Expected module to match pattern: ' + name);
                    continue;
                }
                updatedModules.add(res[1]);
            }
        }
    }
    return updatedModules;
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=turbopack-hot-reloader-common.js.map