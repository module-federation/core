import { _ as _tagged_template_literal_loose } from "@swc/helpers/_/_tagged_template_literal_loose";
function _templateObject() {
    const data = _tagged_template_literal_loose([
        "\n      /* latin-ext */\n      @font-face {\n        font-family: '__nextjs-Geist';\n        font-style: normal;\n        font-weight: 400 600;\n        font-display: swap;\n        src: url(/__nextjs_font/geist-latin-ext.woff2) format('woff2');\n        unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7,\n          U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F,\n          U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F,\n          U+A720-A7FF;\n      }\n      /* latin-ext */\n      @font-face {\n        font-family: '__nextjs-Geist Mono';\n        font-style: normal;\n        font-weight: 400 600;\n        font-display: swap;\n        src: url(/__nextjs_font/geist-mono-latin-ext.woff2) format('woff2');\n        unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7,\n          U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F,\n          U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F,\n          U+A720-A7FF;\n      }\n      /* latin */\n      @font-face {\n        font-family: '__nextjs-Geist';\n        font-style: normal;\n        font-weight: 400 600;\n        font-display: swap;\n        src: url(/__nextjs_font/geist-latin.woff2) format('woff2');\n        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,\n          U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122,\n          U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\n      }\n      /* latin */\n      @font-face {\n        font-family: '__nextjs-Geist Mono';\n        font-style: normal;\n        font-weight: 400 600;\n        font-display: swap;\n        src: url(/__nextjs_font/geist-mono-latin.woff2) format('woff2');\n        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,\n          U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122,\n          U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\n      }\n    "
    ]);
    _templateObject = function() {
        return data;
    };
    return data;
}
import { css } from '../utils/css';
import { useInsertionEffect } from 'react';
export const FontStyles = ()=>{
    useInsertionEffect(()=>{
        const style = document.createElement('style');
        style.textContent = css(_templateObject());
        document.head.appendChild(style);
        return ()=>{
            document.head.removeChild(style);
        };
    }, []);
    return null;
};

//# sourceMappingURL=font-styles.js.map