"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    copyNextErrorCode: null,
    createDigestWithErrorCode: null,
    extractNextErrorCode: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    copyNextErrorCode: function() {
        return copyNextErrorCode;
    },
    createDigestWithErrorCode: function() {
        return createDigestWithErrorCode;
    },
    extractNextErrorCode: function() {
        return extractNextErrorCode;
    }
});
const ERROR_CODE_DELIMITER = '@';
const createDigestWithErrorCode = (thrownValue, originalDigest)=>{
    if (typeof thrownValue === 'object' && thrownValue !== null && '__NEXT_ERROR_CODE' in thrownValue) {
        return `${originalDigest}${ERROR_CODE_DELIMITER}${thrownValue.__NEXT_ERROR_CODE}`;
    }
    return originalDigest;
};
const copyNextErrorCode = (source, target)=>{
    const errorCode = extractNextErrorCode(source);
    if (errorCode && typeof target === 'object' && target !== null) {
        Object.defineProperty(target, '__NEXT_ERROR_CODE', {
            value: errorCode,
            enumerable: false,
            configurable: true
        });
    }
};
const extractNextErrorCode = (error)=>{
    if (typeof error === 'object' && error !== null && '__NEXT_ERROR_CODE' in error && typeof error.__NEXT_ERROR_CODE === 'string') {
        return error.__NEXT_ERROR_CODE;
    }
    if (typeof error === 'object' && error !== null && 'digest' in error && typeof error.digest === 'string') {
        const segments = error.digest.split(ERROR_CODE_DELIMITER);
        const errorCode = segments.find((segment)=>segment.startsWith('E'));
        return errorCode;
    }
    return undefined;
};

//# sourceMappingURL=error-telemetry-utils.js.map