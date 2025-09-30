function decodeHex(hexStr) {
    if (hexStr.trim() === '') {
        throw Object.defineProperty(new Error("can't decode empty hex"), "__NEXT_ERROR_CODE", {
            value: "E19",
            enumerable: false,
            configurable: true
        });
    }
    const num = parseInt(hexStr, 16);
    if (isNaN(num)) {
        throw Object.defineProperty(new Error("invalid hex: `" + hexStr + "`"), "__NEXT_ERROR_CODE", {
            value: "E293",
            enumerable: false,
            configurable: true
        });
    }
    return String.fromCodePoint(num);
}
;
const DECODE_REGEX = /^__TURBOPACK__([a-zA-Z0-9_$]+)__$/;
export function decodeMagicIdentifier(identifier) {
    const matches = identifier.match(DECODE_REGEX);
    if (!matches) {
        return identifier;
    }
    const inner = matches[1];
    let output = '';
    let mode = 0;
    let buffer = '';
    for(let i = 0; i < inner.length; i++){
        const char = inner[i];
        if (mode === 0) {
            if (char === '_') {
                mode = 1;
            } else if (char === '$') {
                mode = 2;
            } else {
                output += char;
            }
        } else if (mode === 1) {
            if (char === '_') {
                output += ' ';
                mode = 0;
            } else if (char === '$') {
                output += '_';
                mode = 2;
            } else {
                output += char;
                mode = 0;
            }
        } else if (mode === 2) {
            if (buffer.length === 2) {
                output += decodeHex(buffer);
                buffer = '';
            }
            if (char === '_') {
                if (buffer !== '') {
                    throw Object.defineProperty(new Error("invalid hex: `" + buffer + "`"), "__NEXT_ERROR_CODE", {
                        value: "E293",
                        enumerable: false,
                        configurable: true
                    });
                }
                mode = 3;
            } else if (char === '$') {
                if (buffer !== '') {
                    throw Object.defineProperty(new Error("invalid hex: `" + buffer + "`"), "__NEXT_ERROR_CODE", {
                        value: "E293",
                        enumerable: false,
                        configurable: true
                    });
                }
                mode = 0;
            } else {
                buffer += char;
            }
        } else if (mode === 3) {
            if (char === '_') {
                throw Object.defineProperty(new Error("invalid hex: `" + (buffer + char) + "`"), "__NEXT_ERROR_CODE", {
                    value: "E244",
                    enumerable: false,
                    configurable: true
                });
            } else if (char === '$') {
                output += decodeHex(buffer);
                buffer = '';
                mode = 0;
            } else {
                buffer += char;
            }
        }
    }
    return output;
}
export const MAGIC_IDENTIFIER_REGEX = /__TURBOPACK__[a-zA-Z0-9_$]+__/g;

//# sourceMappingURL=magic-identifier.js.map