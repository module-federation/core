"use strict";
var __webpack_require__ = {};
(()=>{
    __webpack_require__.d = (exports1, definition)=>{
        for(var key in definition)if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports1, key)) Object.defineProperty(exports1, key, {
            enumerable: true,
            get: definition[key]
        });
    };
})();
(()=>{
    __webpack_require__.o = (obj, prop)=>Object.prototype.hasOwnProperty.call(obj, prop);
})();
(()=>{
    __webpack_require__.r = (exports1)=>{
        if ('undefined' != typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports1, Symbol.toStringTag, {
            value: 'Module'
        });
        Object.defineProperty(exports1, '__esModule', {
            value: true
        });
    };
})();
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
    BUILD_001: ()=>BUILD_001,
    RUNTIME_006: ()=>RUNTIME_006,
    runtimeDescMap: ()=>runtimeDescMap,
    RUNTIME_002: ()=>RUNTIME_002,
    RUNTIME_004: ()=>RUNTIME_004,
    RUNTIME_003: ()=>RUNTIME_003,
    getShortErrorMsg: ()=>getShortErrorMsg,
    errorDescMap: ()=>desc_errorDescMap,
    RUNTIME_008: ()=>RUNTIME_008,
    BUILD_002: ()=>BUILD_002,
    typeDescMap: ()=>typeDescMap,
    RUNTIME_009: ()=>RUNTIME_009,
    buildDescMap: ()=>buildDescMap,
    RUNTIME_007: ()=>RUNTIME_007,
    RUNTIME_001: ()=>RUNTIME_001,
    TYPE_001: ()=>TYPE_001,
    RUNTIME_005: ()=>RUNTIME_005
});
const RUNTIME_001 = 'RUNTIME-001';
const RUNTIME_002 = 'RUNTIME-002';
const RUNTIME_003 = 'RUNTIME-003';
const RUNTIME_004 = 'RUNTIME-004';
const RUNTIME_005 = 'RUNTIME-005';
const RUNTIME_006 = 'RUNTIME-006';
const RUNTIME_007 = 'RUNTIME-007';
const RUNTIME_008 = 'RUNTIME-008';
const RUNTIME_009 = 'RUNTIME-009';
const TYPE_001 = 'TYPE-001';
const BUILD_001 = 'BUILD-001';
const BUILD_002 = 'BUILD-002';
const getDocsUrl = (errorCode)=>{
    const type = errorCode.split('-')[0].toLowerCase();
    return `View the docs to see how to solve: https://module-federation.io/guide/troubleshooting/${type}/${errorCode}`;
};
const getShortErrorMsg = (errorCode, errorDescMap, args, originalErrorMsg)=>{
    const msg = [
        `${[
            errorDescMap[errorCode]
        ]} #${errorCode}`
    ];
    args && msg.push(`args: ${JSON.stringify(args)}`);
    msg.push(getDocsUrl(errorCode));
    originalErrorMsg && msg.push(`Original Error Message:\n ${originalErrorMsg}`);
    return msg.join('\n');
};
const runtimeDescMap = {
    [RUNTIME_001]: 'Failed to get remoteEntry exports.',
    [RUNTIME_002]: 'The remote entry interface does not contain "init"',
    [RUNTIME_003]: 'Failed to get manifest.',
    [RUNTIME_004]: 'Failed to locate remote.',
    [RUNTIME_005]: 'Invalid loadShareSync function call from bundler runtime',
    [RUNTIME_006]: 'Invalid loadShareSync function call from runtime',
    [RUNTIME_007]: 'Failed to get remote snapshot.',
    [RUNTIME_008]: "Failed to load script resources.",
    [RUNTIME_009]: 'Please call createInstance first.'
};
const typeDescMap = {
    [TYPE_001]: 'Failed to generate type declaration. Execute the below cmd to reproduce and fix the error.'
};
const buildDescMap = {
    [BUILD_001]: 'Failed to find expose module.',
    [BUILD_002]: 'PublicPath is required in prod mode.'
};
const desc_errorDescMap = {
    ...runtimeDescMap,
    ...typeDescMap,
    ...buildDescMap
};
exports.BUILD_001 = __webpack_exports__.BUILD_001;
exports.BUILD_002 = __webpack_exports__.BUILD_002;
exports.RUNTIME_001 = __webpack_exports__.RUNTIME_001;
exports.RUNTIME_002 = __webpack_exports__.RUNTIME_002;
exports.RUNTIME_003 = __webpack_exports__.RUNTIME_003;
exports.RUNTIME_004 = __webpack_exports__.RUNTIME_004;
exports.RUNTIME_005 = __webpack_exports__.RUNTIME_005;
exports.RUNTIME_006 = __webpack_exports__.RUNTIME_006;
exports.RUNTIME_007 = __webpack_exports__.RUNTIME_007;
exports.RUNTIME_008 = __webpack_exports__.RUNTIME_008;
exports.RUNTIME_009 = __webpack_exports__.RUNTIME_009;
exports.TYPE_001 = __webpack_exports__.TYPE_001;
exports.buildDescMap = __webpack_exports__.buildDescMap;
exports.errorDescMap = __webpack_exports__.errorDescMap;
exports.getShortErrorMsg = __webpack_exports__.getShortErrorMsg;
exports.runtimeDescMap = __webpack_exports__.runtimeDescMap;
exports.typeDescMap = __webpack_exports__.typeDescMap;
for(var __webpack_i__ in __webpack_exports__)if (-1 === [
    "BUILD_001",
    "BUILD_002",
    "RUNTIME_001",
    "RUNTIME_002",
    "RUNTIME_003",
    "RUNTIME_004",
    "RUNTIME_005",
    "RUNTIME_006",
    "RUNTIME_007",
    "RUNTIME_008",
    "RUNTIME_009",
    "TYPE_001",
    "buildDescMap",
    "errorDescMap",
    "getShortErrorMsg",
    "runtimeDescMap",
    "typeDescMap"
].indexOf(__webpack_i__)) exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
Object.defineProperty(exports, '__esModule', {
    value: true
});
