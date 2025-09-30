import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { lock, unlock } from './body-locker';
const Overlay = function Overlay(param) {
    let { className, children, fixed, ...props } = param;
    React.useEffect(()=>{
        lock();
        return ()=>{
            unlock();
        };
    }, []);
    return /*#__PURE__*/ _jsxs("div", {
        "data-nextjs-dialog-overlay": true,
        className: className,
        ...props,
        children: [
            /*#__PURE__*/ _jsx("div", {
                "data-nextjs-dialog-backdrop": true,
                "data-nextjs-dialog-backdrop-fixed": fixed ? true : undefined
            }),
            children
        ]
    });
};
export { Overlay };

//# sourceMappingURL=overlay.js.map